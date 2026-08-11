import http from "http";
// Chromatic's `test` is `@playwright/test`'s, plus a fixture that archives the
// page (DOM, styles, assets) at the end of every test and writes it next to
// the Playwright artifacts, for `pnpm chromatic` to upload.
import { test } from "@chromatic-com/playwright";
// The same procedure `e2e-flaky` performs, so that what it measures is this.
import { shoot } from "./lib/shoot.mjs";

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

  //
  // 📸 And that is the whole assertion: the page reached the end of its shot,
  // which is what `shoot` waits for. The Chromatic fixture archives whatever
  // is on screen when this returns.
  //
  // There used to be a `toHaveScreenshot` here, against a PNG committed per
  // example. It answered "did this canvas change?" -- which is Chromatic's
  // question now, asked of a baseline held off-repo and put in front of a
  // human, instead of tens of MB of binaries in git regenerated through
  // `workflow_dispatch` -> artifact -> commit.
  //
  // What is left is worth having on its own: an example that throws, that
  // never mounts its `<Canvas>`, or that the monkey plugin failed to reach,
  // fails here rather than archiving a picture of nothing. It is also the only
  // check the examples outside `PUBLISHED` get -- and it needs no baseline, so
  // every example can have it from the day it lands.
  //
  await shoot(page, host);
});
