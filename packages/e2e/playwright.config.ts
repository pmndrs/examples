// playwright.config.ts
import { PlaywrightTestConfig } from "@playwright/test";

const ratio = 16 / 10;
const width = 800;
const height = width / ratio;

const config: PlaywrightTestConfig = {
  // testDir: "/Users/abernier/code/pmndrs/examples/packages/e2e/src",
  timeout: 1000 * 45, // 45s (default was 30s)
  use: {
    // colorScheme: "dark",
    // viewport: { width, height },
  },
};

export default config;
