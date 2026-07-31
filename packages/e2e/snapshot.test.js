import http from "http";
import { test, expect } from "@playwright/test";

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

async function waitForEvent(page, eventName) {
  await page.evaluate(
    (eventName) =>
      new Promise((resolve) =>
        document.addEventListener(eventName, resolve, { once: true }),
      ),
    eventName,
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

test(`${examplename}`, async ({ page }) => {
  // Redirect console.log messages to stdout
  page.on("console", (msg) => {
    if (msg.type() === "log") {
      console.log(`Browser console.log: ${msg.text()}`);
    }
  });

  await waitForServer();

  // ⏳ "r3f" event
  await page.goto(`${host}/?saycheese`);
  await waitForEvent(page, "playwright:snapshot-ready");

  // 📸 <canvas>
  const $canvas = page.locator("canvas[data-engine]");

  // 👁️
  await expect($canvas).toHaveScreenshot({
    maxDiffPixelRatio: 0.05,
    timeout: 10000,
  });
});
