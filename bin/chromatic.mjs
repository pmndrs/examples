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
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const ARCHIVES = "chromatic-archives"; // the name the Chromatic CLI looks for
const location = join(root, "packages/e2e/.chromatic");
const merged = join(location, ARCHIVES);

//
// Which examples we ask a human to review. Deliberately not "every example
// that has a `test` script": a snapshot only belongs here once `e2e-flaky`
// says two runs of the same commit produce the same canvas. Chromatic has no
// pixel tolerance to hide behind, and a build that flags a change nobody made
// is a build nobody reads.
//
// Earn a place here by measuring, never by reading the source -- `useFrame`
// tells you nothing either way. Grow the list as `e2e-flaky` goes green.
//
const PUBLISHED = ["backdrop-and-cables", "baking-soft-shadows"];

const examples = PUBLISHED.map((name) => ({
  name,
  dir: join(root, "examples", name, "test-results"),
})).filter(({ dir }) => existsSync(join(dir, ARCHIVES)));

if (examples.length === 0) {
  console.error(
    `No ${ARCHIVES}/ for ${PUBLISHED.join(", ")}. Run \`pnpm test\` first.`,
  );
  process.exit(1);
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
