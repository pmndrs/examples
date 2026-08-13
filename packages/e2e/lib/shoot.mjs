import { createHash } from "node:crypto";

//
// The shot, as both the Playwright test and `e2e-flaky` perform it. One copy,
// because the whole worth of `e2e-flaky` is that it answers a question about
// *the test*: an "always the same canvas" measured through a slightly different
// wait would be an answer about a page nobody screenshots.
//

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
export async function waitForAssets(page) {
  await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {
    console.log("Network never went idle, shooting anyway");
  });
  await page.waitForTimeout(500);
}

/**
 * Load the page and hold it at the end of its shot.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} host origin *and* base path, e.g. `http://localhost:4173/aquarium`
 */
export async function shoot(page, host) {
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
}

/**
 * The canvas as Chromatic will archive it -- `toDataURL()`, which is why
 * `deterministic.js` gives every context `preserveDrawingBuffer` -- reduced to
 * something two runs can be compared on.
 *
 * Null when the page draws no WebGL canvas at all: `svg-renderer` swaps its
 * canvas for an `<svg>`, and Chromatic archives that as DOM rather than as a
 * still, so there is nothing here to be flaky about.
 */
export async function canvasHash(page) {
  const dataUrl = await page.evaluate(() => {
    const canvas = document.querySelector("canvas[data-engine]");
    return canvas ? canvas.toDataURL() : null;
  });

  return dataUrl
    ? createHash("md5").update(dataUrl).digest("hex").slice(0, 12)
    : null;
}
