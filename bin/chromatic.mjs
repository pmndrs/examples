#!/usr/bin/env node

//
// Uploads the Playwright archives to Chromatic, as one build.
//
// `e2e-test` runs Playwright once per example, so `@chromatic-com/playwright`
// writes one `chromatic-archives/` per example (see `playwright.config.ts` for
// why they cannot share a directory). The Chromatic CLI reads a single one, so
// this collects them into `packages/e2e/.chromatic/chromatic-archives` first.
//
// Run `pnpm test` before this.
//

import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { UNPUBLISHED } from "./e2e-exceptions.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const ARCHIVES = "chromatic-archives"; // the name the Chromatic CLI looks for
const location = join(root, "packages/e2e/.chromatic");
const merged = join(location, ARCHIVES);

//
// Which examples we ask a human to review: everything the e2e run opens, minus
// the ones `e2e-flaky` caught drifting.
//
// This list used to be written the other way round -- three names, added by
// hand as each was measured. At 162 that inversion is the only honest shape:
// the default is that an example is published, and an absence has to carry a
// reason, in `UNPUBLISHED`, next to the reasons an example is not tested at
// all. A list of 162 names nobody could read would rot into fiction.
//
// What still has to be measured is the exclusion. Chromatic has no pixel
// tolerance to hide behind, so an example that draws a different canvas on
// every run flags a change nobody made, on every build, forever -- and one
// example crying wolf is enough to make nobody read the report. `e2e-flaky`
// is what says which; the nightly is what keeps saying it.
//
const PUBLISHED = readdirSync(join(root, "examples"))
  .filter((name) => {
    const pkg = join(root, "examples", name, "package.json");
    return (
      existsSync(pkg) && JSON.parse(readFileSync(pkg, "utf8")).scripts?.test
    );
  })
  .filter((name) => !(name in UNPUBLISHED))
  .sort();

const examples = PUBLISHED.map((name) => ({
  name,
  dir: join(root, "examples", name, "test-results"),
})).filter(({ dir }) => existsSync(join(dir, ARCHIVES)));

if (examples.length === 0) {
  console.error(
    `No ${ARCHIVES}/ for any of the ${PUBLISHED.length} published examples. Run \`pnpm test\` first.`,
  );
  process.exit(1);
}

//
// Chromatic reads a gap as a deletion, so an example that is published but has
// no archive this run would quietly drop out of the baseline. Say which.
//
const missing = PUBLISHED.length - examples.length;
if (missing > 0) {
  console.warn(
    `⚠️  ${missing} published example(s) have no archive; Chromatic will read them as deleted:\n` +
      PUBLISHED.filter((name) => !examples.some((e) => e.name === name))
        .map((name) => `   ${name}`)
        .join("\n"),
  );
}

// A stale archive is worse than a missing one: Chromatic would compare against
// a snapshot of an example that no longer runs, or that turbo did not rebuild.
rmSync(merged, { recursive: true, force: true });
mkdirSync(merged, { recursive: true });

for (const { name, dir } of examples) {
  console.log(`Collecting ${name}`);
  // Story titles carry the example name and every asset path is under that
  // example's base path, so the merge is a plain overlay: nothing collides.
  cpSync(join(dir, ARCHIVES), merged, { recursive: true });
}

console.log(`Uploading ${examples.length} example(s) to Chromatic`);
execFileSync(
  "pnpm",
  ["exec", "chromatic", "--playwright", ...process.argv.slice(2)],
  {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, CHROMATIC_ARCHIVE_LOCATION: location },
  },
);
