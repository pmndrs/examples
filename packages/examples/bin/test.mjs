#!/usr/bin/env node

import { spawn } from "node:child_process";
import minimist from "minimist";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

var argv = minimist(process.argv.slice(2));
// console.log("argv=", argv);

const demoname = argv._[0];
if (!demoname) {
  console.error("Please provide the app name as the first argument.");
  process.exit(1);
}

const updateSnapshots = argv["update-snapshots"];

// our 2 processes
let vite;
let playwright;

function startVite(base = "/") {
  return new Promise((resolve, reject) => {
    const proc = spawn("npx", ["vite", "preview", "--host", "--base", base]);

    //
    // Look for the port number in the output, eg:
    //
    // Port 5188 is in use, trying another one...
    //  ➜  Local:   http://localhost:5189/aquarium
    //  ➜  Network: use --host to expose
    //  ➜  press h + enter to show help
    //
    proc.stdout.on("data", (data) => {
      const output = data.toString();
      const urlMatch = output.match(/Local: +(\S+)/);
      if (urlMatch) {
        resolve({ vite: proc, url: urlMatch[1] });
      }
    });

    proc.on("exit", (code) => {
      console.log("exiting vite", code);
    });
    proc.on("close", (code) => {
      console.log("closing vite", code);
    });

    proc.on("error", reject);
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
      resolve();
    });

    proc.on("error", reject);
  });
}

const { vite: _vite, url } = await startVite(
  `${process.env.BASE_PATH || ""}/${demoname}`
);
vite = _vite;
playwright = await startPlaywright(url);
console.log("All done");
teardown(0);

function teardown(code = 0) {
  console.log("Tearing down...");

  playwright.kill();
  vite.kill();
  process.exit(code);
}

process.on("SIGINT", teardown);
process.on("exit", teardown);
