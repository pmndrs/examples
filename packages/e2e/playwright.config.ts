// playwright.config.ts
import type { PlaywrightTestConfig } from "@playwright/test";
import type { ChromaticConfig } from "@chromatic-com/playwright";

const config: PlaywrightTestConfig<ChromaticConfig> = {
  // testDir: "/Users/abernier/code/pmndrs/examples/packages/e2e/src",
  timeout: 60_000, // default 30s flakes on 2-core CI runners under parallel load

  // One Playwright run per example, all sharing this config -- so they would
  // also share `test-results/`, which Playwright wipes on start: the second
  // example's run would delete the first one's Chromatic archive. `e2e-test`
  // hands each run an output directory inside its own example instead, which
  // also lets turbo cache the archive as that example's `test` output.
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR,
};

export default config;
