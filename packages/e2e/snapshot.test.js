import http from "http";
// Chromatic's `test` is `@playwright/test`'s, plus a fixture that archives the
// page (DOM, styles, assets) at the end of every test and writes it next to
// the Playwright artifacts, for `pnpm chromatic` to upload.
import { test, expect } from "@chromatic-com/playwright";

// console.log(process.argv);

const host = process.env.HOST;
if (!host) {
  console.error("Please provide HOST.");
  process.exit(1);
}

const examplename = process.env.EXAMPLENAME;
if (!examplename) {
  console.error("Please provide EXAMPLENAME.");
  process.exit(1);
}

//
// What the page waits on before it shoots. `networkidle` is the same signal
// three.js waits on in its own screenshot harness: it says the scene has
// everything it is going to get, which a fixed sleep only ever guessed at --
// and guessed at 3s, once per example, 161 times.
//
// It falls through rather than failing. An example that holds a connection
// open never goes idle, and the frames that follow are deterministic either
// way; what would not be deterministic is an asset landing mid-shot, and the
// short settle after idle covers the parsing that follows the last byte.
//
async function waitForAssets(page) {
  await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {
    console.log("Network never went idle, shooting anyway");
  });
  await page.waitForTimeout(500);
}

function waitForServer() {
  return new Promise((resolve) => {
    function ping() {
      const request = http.request(host, { method: "HEAD" }, resolve);
      request.on("error", () => {
        setTimeout(ping, 500); // not yet up? => re-ping in 500ms
      });
      request.end();
    }

    ping();
  });
}

test(`${examplename}`, async ({ page }) => {
  // Redirect console.log messages to stdout
  page.on("console", (msg) => {
    if (msg.type() === "log") {
      console.log(`Browser console.log: ${msg.text()}`);
    }
  });

  await waitForServer();

  // 🙋 before anything loads: tells the page to wait for us rather than
  // shooting on its own timer, which would race the wait below and win it on
  // exactly the slow loads that wait is for
  await page.addInitScript(() => (window.__cheeseHarness = true));

  // ⏳ assets
  await page.goto(`${host}/?saycheese`);
  await waitForAssets(page);

  // 🎬 flags rather than events, so neither side can miss the other's
  await page.evaluate(() => (window.__cheeseShoot = true));
  await page.waitForFunction(() => window.__cheeseReady === true);

  // 📸 <canvas>
  const $canvas = page.locator("canvas[data-engine]");

  // 👁️
  await expect($canvas).toHaveScreenshot({
    maxDiffPixelRatio: 0.05,
    timeout: 10000,
  });
});
