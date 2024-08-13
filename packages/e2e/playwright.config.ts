// playwright.config.ts
import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  // testDir: "/Users/abernier/code/pmndrs/examples/packages/e2e/src",
  timeout: 1000 * 45, // 45s (default was 30s)
};

export default config;
