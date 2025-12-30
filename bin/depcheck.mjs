//
// Check for unused dependencies in all workspaces.
//
// https://bolt.new/~/sb1-9sqsva
//

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import depcheck from "depcheck";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workspacesDir = path.join(__dirname, "..", "demos");

const options = {
  ignorePatterns: ["dist", "build"],
  ignoreMatches: ["@types/*", "tslib"],
};

async function checkWorkspace(workspacePath) {
  const results = await depcheck(workspacePath, options);

  console.log(`\nChecking ${path.basename(workspacePath)}:`);

  if (results.dependencies.length > 0) {
    console.log("Unused dependencies:");
    results.dependencies.forEach((dep) => console.log(`  - ${dep}`));
  } else {
    console.log("No unused dependencies found.");
  }

  if (results.devDependencies.length > 0) {
    console.log("Unused devDependencies:");
    results.devDependencies.forEach((dep) => console.log(`  - ${dep}`));
  } else {
    console.log("No unused devDependencies found.");
  }

  return {
    dependencies: results.dependencies,
    devDependencies: results.devDependencies,
  };
}

async function checkAllWorkspaces() {
  const workspaces = fs.readdirSync(workspacesDir);
  const workspaceUnusedDeps = {};

  for (const workspace of workspaces) {
    const workspacePath = path.join(workspacesDir, workspace);
    if (fs.statSync(workspacePath).isDirectory()) {
      const { dependencies, devDependencies } =
        await checkWorkspace(workspacePath);
      const unusedDeps = [...dependencies, ...devDependencies];
      if (unusedDeps.length > 0) {
        workspaceUnusedDeps[workspace] = unusedDeps;
      }
    }
  }

  console.log("\n--- Commands to Remove Unused Dependencies ---");
  let hasUnusedDeps = false;
  for (const [workspace, deps] of Object.entries(workspaceUnusedDeps)) {
    if (deps.length > 0) {
      hasUnusedDeps = true;
      const uninstallCommand = `pnpm --filter "./demos/${workspace}" remove ${deps.join(" ")}`;
      console.log(`\n$ ${uninstallCommand}`);
    }
  }

  if (!hasUnusedDeps) {
    console.log("\nNo unused dependencies found across all workspaces.");
  }
}

checkAllWorkspaces().catch(console.error);
