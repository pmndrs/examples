const http = require("http");
const fs = require("fs");
const path = require("path");
const { test, expect } = require("@playwright/test");

const host = `http://localhost:5188`;

async function waitForEvent(page, eventName) {
  await page.evaluate(
    (eventName) =>
      new Promise((resolve) =>
        document.addEventListener(eventName, resolve, { once: true })
      ),
    eventName
  );
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

function getDemoNames() {
  const appsDir = path.resolve("apps");

  return fs.readdirSync(appsDir).filter((file) => {
    return fs.statSync(path.join(appsDir, file)).isDirectory();
  });
}
// const demoNames = getDemoNames();
const demoNames = ["baking-soft-shadows", "basic-demo"];
console.log("demoNames", demoNames);

demoNames.forEach((demoName) => {
  test(`${demoName} should match previous one`, async ({ page }) => {
    await waitForServer();

    // ⏳ "r3f" event
    await page.goto(`${host}/examples/${demoName}/?saycheese`);
    await waitForEvent(page, "playright:r3f");

    // 📸 <canvas>
    const $canvas = page.locator("canvas[data-engine]");

    // 👁️
    await expect($canvas).toHaveScreenshot({
      maxDiffPixelRatio: 0.1,
    });
  });
});
