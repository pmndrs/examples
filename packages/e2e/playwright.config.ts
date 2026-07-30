// playwright.config.ts
import type { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  // testDir: "/Users/abernier/code/pmndrs/examples/packages/e2e/src",
  timeout: 60_000, // default 30s flakes on 2-core CI runners under parallel load
  // A flake on main would false-alarm the broken-demos rollup issue and ping
  // maintainers for nothing: only a test that fails 3 times in a row counts.
  retries: process.env.CI ? 2 : 0,
};

export default config;
