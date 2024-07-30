#!/usr/bin/env node

import { spawn } from "node:child_process";
import minimist from "minimist";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { generatePort } from "../lib/port.mjs";

var argv = minimist(process.argv.slice(2));
// console.log("argv=", argv);

const demoname = argv._[0];
if (!demoname) {
  console.error("Please provide the app name as the first argument.");
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url); // Converts the URL to a file path
const __dirname = dirname(__filename); // Gets the directory name
const viteConfigPath = resolve(__dirname, "../src/vite.config.dev.ts");
// console.log("viteConfigPath=", viteConfigPath);

const cmd = spawn(
  "npx",
  [
    "vite",
    "dev",
    "--config",
    viteConfigPath,
    "--base",
    `${process.env.BASE_PATH || ""}/${demoname}`,
    "--port",
    `${generatePort(demoname)}`,
    "--strictPort",
  ],
  {
    stdio: "inherit",
    env: process.env,
  }
);
