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
// It used to spend a full `turbo test --force` per run -- rebuild, browser
// launch, archive, twice. It now builds once (cached, like any other build) and
// re-shoots the same preview server in the same browser, which is the same page
// through the same `shoot()` the test uses. What it costs is N shots.
//

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import minimist from "minimist";
import { chromium } from "@playwright/test";
import { preview } from "vite";

import { canvasHash, shoot } from "../lib/shoot.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

const argv = minimist(process.argv.slice(2));
const RUNS = Number(argv.runs) || 3;
const PORT = 5399; // one example at a time, so one port is enough

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

const browser = await chromium.launch();
const results = [];

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

  const server = await preview({
    root: join(root, "examples", example),
    base: `/${example}`,
    preview: { host: "127.0.0.1", port: PORT, strictPort: true },
    logLevel: "silent",
  });
  const host = server.resolvedUrls.local[0].replace(/\/$/, "");

  for (let run = 0; run < RUNS; run++) {
    // A fresh context per run rather than a fresh browser: a reload would keep
    // whatever the page left in memory, and that is not what CI does.
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });
    // The same 180s the Playwright config gives a test. The library's own
    // default is 30s, which `aquarium` alone spends compiling shaders.
    context.setDefaultTimeout(180_000);
    const page = await context.newPage();

    try {
      await shoot(page, host);
      result.hashes.push(await canvasHash(page));
    } catch (error) {
      result.hashes.push(null);
      result.why ??= error.message.split("\n")[0].slice(0, 120);
    }

    await context.close();
  }

  await server.close();

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

await browser.close();

if (argv.json) {
  writeFileSync(
    resolve(root, String(argv.json)),
    JSON.stringify(results, null, 2),
  );
}

const unstable = results.filter((r) => r.status !== "stable");

if (unstable.length) {
  console.log(
    `\n${unstable.length}/${results.length} would flag a phantom change:\n${unstable
      .map((r) => `  ${r.example.padEnd(40)}${r.status}`)
      .join("\n")}`,
  );
  process.exit(1);
}

console.log(`\n${results.length}/${results.length} stable over ${RUNS} runs.`);
