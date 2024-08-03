#!/usr/bin/env node

import minimist from "minimist";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";

var argv = minimist(process.argv.slice(2));
// console.log("argv=", argv);

const pkgname = argv._[0];
if (!pkgname) {
  console.error("Please provide the package name as the first argument.");
  process.exit(1);
}
const demoname = pkgname.split("@demo/")[1];

const __filename = fileURLToPath(import.meta.url); // Converts the URL to a file path
const __dirname = dirname(__filename); // Gets the directory name
const configFile = resolve(__dirname, "../src/vite.config.build.ts");

const base = `${process.env.BASE_PATH || ""}/${demoname}`;

await build({
  base,
  configFile,
});

console.log("Build completed successfully.");
