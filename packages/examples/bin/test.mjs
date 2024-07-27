#!/usr/bin/env node

import { spawn } from "node:child_process";
import minimist from "minimist";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

var argv = minimist(process.argv.slice(2));
// console.log("argv=", argv);

const updateSnapshots = argv["update-snapshots"];

const demoname = argv._[0];
if (!demoname) {
  console.error("Please provide the app name as the first argument.");
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url); // Converts the URL to a file path
const __dirname = dirname(__filename); // Gets the directory name
const playwrightConfigPath = resolve(__dirname, "../playwright.config.ts");

function startVitePreview(base = "/") {
  return new Promise((resolve) => {
    console.log("Starting Vite...");

    const viteProcess = spawn(
      "npx",
      ["vite", "preview", "--host", "--base", base],
      {
        stdio: ["inherit", "pipe", "inherit"],
      }
    );

    viteProcess.stdout.pipe(process.stdout);

    // Capture stdout to find the port
    viteProcess.stdout.on("data", (data) => {
      const output = data.toString();

      //
      // Look for the port number in the output, eg:
      //
      // Port 5188 is in use, trying another one...
      //  ➜  Local:   http://localhost:5189/aquarium
      //  ➜  Network: use --host to expose
      //  ➜  press h + enter to show help
      //
      const match = output.match(/(?<=Local:\s*)http:\/\/[^\s]+/);
      if (match) {
        const host = match[0];
        resolve({ process: viteProcess, host });
      }
    });
  });
}

const { process: viteProcess, host } = await startVitePreview(
  `${process.env.BASE_PATH || ""}/${demoname}`
);

// Ensure the Vite server is killed on process exit
const stopVitePreview = () => {
  return new Promise((resolve) => {
    if (viteProcess.killed) {
      console.log("Vite already stopped.");
      return resolve();
    }
    console.log("Stopping Vite...");

    viteProcess.on("exit", () => {
      console.log("Vite is now stopped.");
      resolve();
    });
    viteProcess.kill();
  });
};

// Run Playwright tests
const args = ["playwright", "test", "--config", playwrightConfigPath];
if (updateSnapshots) {
  args.push("--update-snapshots");
}

const playwrightProcess = spawn("npx", args, {
  stdio: "inherit",
  env: {
    ...process.env,
    DEMONAME: demoname,
    HOST: host,
  },
});

playwrightProcess.on("exit", async (code) => {
  console.log("Playright finished", 0);

  await stopVitePreview();

  process.exit(code);
});

process.on("exit", stopVitePreview);
// process.on("SIGINT", cleanup);
// process.on("SIGTERM", cleanup);
