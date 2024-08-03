#!/usr/bin/env node

import { spawn } from "node:child_process";
import minimist from "minimist";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { preview } from "vite";

var argv = minimist(process.argv.slice(2));
// console.log("argv=", argv);

const pkgname = argv._[0];
if (!pkgname) {
  console.error("Please provide the package name as the first argument.");
  process.exit(1);
}
const demoname = pkgname.split("@demo/")[1];

const updateSnapshots = argv["update-snapshots"];

function startVite(base = "/", timeout = 30000) {
  return new Promise(async (resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error("Starting Vite has timed out"));
    }, timeout);

    const { close, resolvedUrls } = await preview({
      base,
      preview: {
        host: true,
      },
    });

    clearTimeout(timeoutId);
    resolve({ close, url: resolvedUrls.local[0] });
  });
}

const __filename = fileURLToPath(import.meta.url); // Converts the URL to a file path
const __dirname = dirname(__filename); // Gets the directory name
const playwrightConfigPath = resolve(__dirname, "../playwright.config.ts");

function startPlaywright(url) {
  return new Promise((resolve, reject) => {
    const args = ["playwright", "test", "--config", playwrightConfigPath];
    if (updateSnapshots) {
      args.push("--update-snapshots");
    }

    const proc = spawn("npx", args, {
      stdio: "inherit",
      env: {
        ...process.env,
        DEMONAME: demoname,
        HOST: url,
      },
    });

    proc.on("close", (code) => {
      console.log("Playwright finished", code);
      if (code !== 0) {
        throw new Error(`Playwright test has failed`);
      } else {
        resolve();
      }
    });

    proc.on("error", reject);
  });
}

const { close: closeVite, url } = await startVite(
  `${process.env.BASE_PATH || ""}/${demoname}`
);
console.log("Vite started at", url);
const playwright = await startPlaywright(url);
console.log("All done");
teardown(0);

function teardown(code = 0) {
  console.log("Tearing down...");

  playwright?.kill();
  closeVite();
  process.exit(code);
}

process.on("SIGINT", teardown);
process.on("exit", teardown);
