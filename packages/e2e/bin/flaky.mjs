#!/usr/bin/env node

//
// Is this example's snapshot reproducible?
//
//   e2e-flaky @example/aquarium          # one example
//   e2e-flaky                            # every example that has a `test` script
//   e2e-flaky --runs=10                  # more runs, more confidence
//   e2e-flaky --json=flaky.json          # machine-readable, for the nightly
//
// Shoots the same example N times and compares the canvas byte for byte. That
// is the only question that decides whether an example belongs in the
// `PUBLISHED` list of `bin/chromatic.mjs`: Chromatic has no pixel tolerance to
// hide behind, so an example that answers "no" here would flag a change nobody
// made, on every build, forever.
//
// It has to be measured rather than reasoned about. `useFrame` is no guide --
// `backdrop-and-cables` has two and has always been stable, its animation
// following a pointer that never moves in headless; `baking-soft-shadows` has
// none and used to drift, because accumulating shadow samples counts frames
// rather than seconds. Nothing in the source says which is which.
//
// N, and not two. Two runs that agree only rule out systematic drift: something
// that flinches one run in five passes it, and then flags a phantom change on
// the build after this one. Three is the default because it is the cheapest
// number that can outvote a coincidence; the nightly runs more.
//
// It used to spend a full `turbo test --force` per run -- rebuild, archive and
// all, twice. It now builds once, through the ordinary cached `build2`, and
// spends the rest on the only part that has to be repeated: N cold shots,
// through the same `shoot()` the test uses. See `shotOf` for what "cold" costs
// and why paying it is the whole point.
//

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import minimist from "minimist";
import { chromium } from "@playwright/test";
import { preview } from "vite";

import { canvasHash, shoot } from "../lib/shoot.mjs";
import { UNPUBLISHED } from "../../../bin/e2e-exceptions.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

const argv = minimist(process.argv.slice(2));
const RUNS = Number(argv.runs) || 3;
const PORT = Number(argv.port) || 5399; // `--port` so two sweeps can run at once

const asked = argv._.map((a) => String(a).replace("@example/", ""));
const examples = (
  asked.length
    ? asked
    : readdirSync(join(root, "examples")).filter((name) => {
        const pkg = join(root, "examples", name, "package.json");
        return (
          existsSync(pkg) && JSON.parse(readFileSync(pkg, "utf8")).scripts?.test
        );
      })
).sort();

/** No `--force`: `build2` is content-addressed, so a cache hit is the same dist. */
function build(example) {
  execFileSync(
    "pnpm",
    ["exec", "turbo", "build2", `--filter=@example/${example}`],
    { cwd: root, stdio: "ignore" },
  );
}

const results = [];

//
// One shot, from nothing: its own server, its own browser, its own profile.
//
// The cheap version of this reused both across the N runs, and it lied. It
// reported `aquarium` and `backdrop-and-cables` as drifting, with the first
// shot disagreeing and every later one agreeing on the value two earlier
// sessions had already recorded -- because runs 2..N were warm. Warm is not a
// thing CI ever is: every build there starts a server, a browser and a disk
// cache from nothing, so a difference between cold and warm is a difference
// nobody will ever see, and hiding the cold one is exactly backwards.
//
// A browser launch is ~200ms against a shot measured in tens of seconds. Cheap
// was never worth being wrong about.
//
async function shotOf(example) {
  const server = await preview({
    root: join(root, "examples", example),
    base: `/${example}`,
    // Not `strictPort`: vite walks up from here, so a port left busy by
    // another sweep costs a second, not the whole run.
    preview: { host: "127.0.0.1", port: PORT },
    logLevel: "silent",
  });
  const browser = await chromium.launch();

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });
    // The same budget the Playwright config gives a test. The library's own
    // default is 30s, which `aquarium` alone spends compiling shaders.
    context.setDefaultTimeout(300_000);
    const page = await context.newPage();

    await shoot(page, server.resolvedUrls.local[0].replace(/\/$/, ""));
    return await canvasHash(page);
  } finally {
    await browser.close();
    await server.close();
  }
}

for (const example of examples) {
  process.stdout.write(`${example.padEnd(40)}`);

  const result = { example, runs: RUNS, hashes: [] };

  try {
    build(example);
  } catch {
    // A build that fails leaves a stale or absent `dist`, and shooting it would
    // measure the wrong thing -- say so instead of guessing.
    result.status = "build failed";
    console.log(result.status);
    results.push(result);
    continue;
  }

  for (let run = 0; run < RUNS; run++) {
    try {
      result.hashes.push(await shotOf(example));
    } catch (error) {
      result.hashes.push(null);
      result.why ??= error.message.split("\n")[0].slice(0, 120);
    }
  }

  const [first, ...rest] = result.hashes;
  result.status =
    first == null
      ? (result.why ?? "no canvas archived")
      : rest.every((hash) => hash === first)
        ? "stable"
        : "UNSTABLE";

  console.log(
    result.status === "stable"
      ? `stable    ${first} (${RUNS} runs)`
      : result.status === "UNSTABLE"
        ? `UNSTABLE  ${[...new Set(result.hashes)].join(" -> ")}`
        : result.status,
  );

  results.push(result);
}

if (argv.json) {
  writeFileSync(
    resolve(root, String(argv.json)),
    JSON.stringify(results, null, 2),
  );
}

//
// What this reports is a change of status, not a census.
//
// The nightly shoots every example that has a `test` script, and some of those
// are in `UNPUBLISHED` precisely because they were measured drifting. Failing on
// them would paint the nightly red every night for reasons already written
// down -- and a job that is always red is a job nobody opens, which would cost
// us the one thing this exists to catch.
//
// So there are two kinds of news, and they point in opposite directions:
//
//   a published example that drifted     -- a regression, and Chromatic is
//                                           about to flag a change nobody made
//   an unpublished one that held still   -- a fix worth collecting, whether it
//                                           was aimed at this or not
//
const drifted = results.filter(
  (r) => r.status !== "stable" && !(r.example in UNPUBLISHED),
);
const settled = results.filter(
  (r) => r.status === "stable" && r.example in UNPUBLISHED,
);

if (settled.length) {
  console.log(
    `\n🎉 ${settled.length} held still over ${RUNS} shots and could be published:\n${settled
      .map((r) => `  ${r.example.padEnd(40)}${r.hashes[0]}`)
      .join("\n")}`,
  );
}

if (drifted.length) {
  console.log(
    `\n${drifted.length} published example(s) would now flag a phantom change:\n${drifted
      .map((r) => `  ${r.example.padEnd(40)}${r.status}`)
      .join("\n")}`,
  );
  process.exit(1);
}

const expected = results.length - drifted.length - settled.length;
console.log(
  `\n${expected}/${results.length} as expected over ${RUNS} shots -- nothing to report.`,
);
