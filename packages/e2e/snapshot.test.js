import http from "http";
import { test, expect } from "@playwright/test";

// console.log(process.argv);

const host = process.env.HOST;
if (!host) {
  console.error("Please provide HOST.");
  process.exit(1);
}

const demoname = process.env.DEMONAME;
if (!demoname) {
  console.error("Please provide DEMONAME.");
  process.exit(1);
}

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

test(`${demoname}`, async ({ page }) => {
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

  // const zone = page.locator("canvas[data-engine]").first(); // only capture the canvas zone
  const zone = page;

  // 👁️
  await expect(zone).toHaveScreenshot({
    maxDiffPixelRatio: 0.05,
    timeout: 10000,
  });
});
