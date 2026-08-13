// playwright.config.ts
import type { PlaywrightTestConfig } from "@playwright/test";
import type { ChromaticConfig } from "@chromatic-com/playwright";

const config: PlaywrightTestConfig<ChromaticConfig> = {
  // testDir: "/Users/abernier/code/pmndrs/examples/packages/e2e/src",
  //
  // 60s was sized for a shot of two frames after a three-second wait. It is
  // sixty frames now, every one of them a full render, and a CI runner draws
  // them in software -- the same pump that takes ~9s here spent more than the
  // whole budget there. The frames are the deterministic part and cannot be
  // hurried; the budget is what has to move.
  //
  // `Shot N frames in Xms` in the log is what says whether 60 is still
  // affordable once this covers more than three examples.
  //
  timeout: 180_000,

  // One Playwright run per example, all sharing this config -- so they would
  // also share `test-results/`, which Playwright wipes on start: the second
  // example's run would delete the first one's Chromatic archive. `e2e-test`
  // hands each run an output directory inside its own example instead, which
  // also lets turbo cache the archive as that example's `test` output.
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR,
};

export default config;
