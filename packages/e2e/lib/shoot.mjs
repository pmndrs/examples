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
  await waitForDecodes(page);
  await page.waitForTimeout(500);
}

//
// `networkidle` says the bytes arrived, not that they were decoded: a Draco
// mesh still has a worker round-trip ahead of it, an HDR a parse, and under
// load the settle can lose that race -- at which point the second take
// re-suspends and mounts in arrival order again, reviving exactly what the
// remount exists to fix. The page tracks its loading manager (see
// `deterministic.js`), whose `itemEnd` fires after the parse, and this waits
// for it to go quiet.
//
async function waitForDecodes(page) {
  await page
    .waitForFunction(() => (window.__cheeseInflight?.() ?? 0) === 0, {
      timeout: 60_000,
    })
    .catch(() => {
      console.log("Loaders never went quiet, shooting anyway");
    });
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

  //
  // 🔁 second take -- see `CheesyCanvas`. The first mount happened in
  // asset-arrival order, which is the network's order, not ours. Now that
  // every loader cache is warm, remounting the scene is one synchronous
  // render in JSX order, and everything the mount order decides -- `useFrame`
  // registration, scene-graph children, physics insertion, who draws what
  // from the seeded random sequence -- comes out the same, every run.
  //
  // `networkidle` cannot be waited on twice (load states are monotonic per
  // navigation), and mostly nothing loads here anyway: the point of the
  // second take is that the caches answer. What can still be in flight is a
  // `<video>` element recreated by the remount, re-pinning itself to its
  // fixed frame, so that is what gets waited on -- then the same settle the
  // first wait uses.
  //
  //
  // The remount's `flushSync` returns when the *DOM* side has committed; the
  // scene lives behind the `<Canvas>` bridge in r3f's own root, whose render
  // is scheduled, not flushed. Under load that render -- and the effects
  // where a physics world is built, worker and all -- landed *inside* the
  // shot, assembling the scene across pumped frames at whichever frame the
  // machine chose (`trails`, measured under CPU throttle). So the page says
  // when the take has finished mounting -- committed and effects run, see
  // `Probe` in `CheesyCanvas` -- and the shot waits for it to say so.
  //
  const take = await page.evaluate(() => window.__cheeseTake ?? 0);
  await page.evaluate(() => window.__cheeseRemount?.());
  await page
    .waitForFunction((before) => window.__cheeseTake > before, take, {
      timeout: 60_000,
    })
    .catch(() => {
      console.log("The second take never finished mounting, shooting anyway");
    });
  await waitForDecodes(page); // in case the second take re-suspended anything
  await page
    .waitForFunction(
      () =>
        [...document.querySelectorAll("video")].every(
          (video) => video.paused && video.readyState >= 2,
        ),
      { timeout: 20_000 },
    )
    .catch(() => {
      console.log("A video never pinned itself, shooting anyway");
    });
  await page.waitForTimeout(500);

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
