// packages/e2e/website/playwright.config.ts
import path from "node:path";
import { defineConfig } from "@playwright/test";
import { generatePort } from "../lib/port.mjs";

//
// The website's own run, next to the examples' one rather than inside it: that
// config is shaped for a shot per example (a five-minute budget, a Chromatic
// archive, a server `e2e-test` starts by hand). The website needs none of
// that -- just its static export, served the way production serves it.
//
// Which is under `BASE_PATH`: `next build` bakes it into every URL of the
// export, so the files at the root of `apps/website/out` are reached at
// `${BASE_PATH}/...`. `vite preview --base` serves them there, the same server
// `e2e-test` uses for an example's `dist`.
//

const port = generatePort("website");
const base = `${process.env.BASE_PATH ?? ""}/`;
const url = `http://localhost:${port}${base}`;

export default defineConfig({
  testDir: ".",
  // Reads computed styles off a static page: no frames to wait for.
  timeout: 30_000,
  use: { baseURL: url },
  webServer: {
    command: `pnpm exec vite preview --outDir out --base ${base} --port ${port} --strictPort`,
    cwd: path.resolve(import.meta.dirname, "../../../apps/website"),
    url,
    // Always the export of this build, never whatever happens to listen on
    // the port.
    reuseExistingServer: false,
  },
});
