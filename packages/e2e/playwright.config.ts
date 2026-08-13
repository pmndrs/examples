// playwright.config.ts
import type { PlaywrightTestConfig } from "@playwright/test";
import type { ChromaticConfig } from "@chromatic-com/playwright";

const config: PlaywrightTestConfig<ChromaticConfig> = {
  // testDir: "/Users/abernier/code/pmndrs/examples/packages/e2e/src",
  //
  // 60s was sized for a shot of two frames after a three-second wait. It is
  // thirty frames now, every one of them a full render, and a CI runner draws
  // them in software -- the same pump that takes ~9s here spent more than the
  // whole budget there. The frames are the deterministic part and cannot be
  // hurried; the budget is what has to move.
  //
  // 180s then covered all three examples with room to spare, and stopped
  // covering 170: `merged-instance` sits at about three minutes on the runner
  // and crossed the line between two runs of the same commit. A budget that
  // close to the work is a coin toss, and a coin toss in CI reads as a broken
  // example.
  //
  // It only ever costs time on a failure -- a shot that finishes returns when
  // it finishes -- so the risk of being generous is five minutes spent on
  // something genuinely stuck, against a false red on something merely heavy.
  //
  // `Shot N frames in Xms` in the log is what says whether thirty frames stay
  // affordable.
  //
  timeout: 300_000,

  // One Playwright run per example, all sharing this config -- so they would
  // also share `test-results/`, which Playwright wipes on start: the second
  // example's run would delete the first one's Chromatic archive. `e2e-test`
  // hands each run an output directory inside its own example instead, which
  // also lets turbo cache the archive as that example's `test` output.
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR,
};

export default config;
