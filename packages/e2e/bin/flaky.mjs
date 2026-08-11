#!/usr/bin/env node

//
// Is this example's snapshot reproducible?
//
//   e2e-flaky @example/aquarium          # one example
//   e2e-flaky                            # every example that has a `test` script
//
// Runs the e2e test twice and compares the canvas the second run archived to
// the one the first did, byte for byte. That is the only question that decides
// whether an example belongs in the `PUBLISHED` list of `bin/chromatic.mjs`:
// Chromatic has no pixel tolerance to hide behind, so an example that answers
// "no" here would flag a change nobody made, on every build, forever.
//
// It has to be measured rather than reasoned about. `useFrame` is no guide --
// `backdrop-and-cables` has two and has always been stable, its animation
// following a pointer that never moves in headless; `baking-soft-shadows` has
// none and used to drift, because accumulating shadow samples counts frames
// rather than seconds. Nothing in the source says which is which.
//

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

/** The archived `<canvas>`, as a hash we can compare across runs. */
function canvasHash(example) {
  const dir = join(
    root,
    "examples",
    example,
    "test-results/chromatic-archives/archive",
  );
  if (!existsSync(dir)) return null;

  const snapshot = readdirSync(dir).find((f) => f.endsWith(".snapshot.json"));
  if (!snapshot) return null;

  // rrweb stores the canvas as a data URL on the element it stood in for.
  const dom = readFileSync(join(dir, snapshot), "utf8");
  const dataUrl = dom.match(/"rr_dataURL":"([^"]*)"/)?.[1];
  if (!dataUrl) return null;

  return createHash("md5").update(dataUrl).digest("hex").slice(0, 12);
}

/** `--force`, or turbo would replay the first run's cache and prove nothing. */
function run(example) {
  execFileSync(
    "pnpm",
    ["exec", "turbo", "test", `--filter=@example/${example}`, "--force"],
    { cwd: root, stdio: "ignore" },
  );
}

const asked = process.argv.slice(2).map((a) => a.replace("@example/", ""));
const examples = asked.length
  ? asked
  : readdirSync(join(root, "examples")).filter((name) => {
      const pkg = join(root, "examples", name, "package.json");
      return (
        existsSync(pkg) && JSON.parse(readFileSync(pkg, "utf8")).scripts?.test
      );
    });

let unstable = 0;

for (const example of examples) {
  process.stdout.write(`${example.padEnd(40)}`);

  // A failing test still archives, so a missing baseline (they are Linux-only)
  // does not stop us -- only a missing canvas does.
  try {
    run(example);
  } catch {}
  const a = canvasHash(example);

  try {
    run(example);
  } catch {}
  const b = canvasHash(example);

  if (!a || !b) {
    console.log("no canvas archived");
    unstable++;
  } else if (a === b) {
    console.log(`stable    ${a}`);
  } else {
    console.log(`UNSTABLE  ${a} -> ${b}`);
    unstable++;
  }
}

if (unstable) {
  console.log(`\n${unstable}/${examples.length} would flag a phantom change.`);
  process.exit(1);
}
