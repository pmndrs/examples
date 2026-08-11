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
// that has a `test` script": a snapshot only belongs here once it is
// reproducible run to run, and most are not yet. Two runs of the same commit
// give `aquarium` and `baking-soft-shadows` two different canvases -- the
// first animates, the second accumulates shadow samples -- while
// `backdrop-and-cables` comes out bit for bit identical. A build that flags a
// change nobody made is a build nobody reads, so drift stays out until it is
// fixed rather than being papered over with a threshold.
//
// `useFrame` is not the tell (`backdrop-and-cables` has two, and its animation
// tracks a pointer that never moves in headless). The only way to know is to
// run twice and compare. Grow this list as the determinism work lands.
//
const PUBLISHED = ["backdrop-and-cables"];

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
