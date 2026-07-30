// playwright.config.ts
import type { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  // testDir: "/Users/abernier/code/pmndrs/examples/packages/e2e/src",
  timeout: 60_000, // default 30s flakes on 2-core CI runners under parallel load
};

export default config;
