#!/usr/bin/env node

// Maintains one GitHub issue per broken demo from the latest turbo run
// summary (produced by `turbo test --summarize` in CI). The set of open
// `broken-demos` issues IS the previous state — no other storage. Delta-only
// policy: maintainers are @mentioned when their demo goes green→broken (issue
// body on creation, comment on reopen — editing a body never notifies); a
// still-broken demo only gets its body refreshed; a repaired demo gets a
// no-mention note and its issue closed.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  ISSUE_LABEL,
  brokenDemosFromSummary,
  issueTitle,
  demoFromIssueBody,
  renderIssueBody,
  renderReopenComment,
  renderFixedComment,
} from "./lib/broken-demos.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const dryRun = process.env.DRY_RUN === "1"; // print the broken list, touch nothing
const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY ?? "pmndrs/examples";
if (!token && !dryRun) {
  console.error("GITHUB_TOKEN is required (or set DRY_RUN=1).");
  process.exit(1);
}
const [owner, repo] = repository.split("/");
const serverUrl = process.env.GITHUB_SERVER_URL ?? "https://github.com";
const apiUrl = process.env.GITHUB_API_URL ?? "https://api.github.com";
const runUrl = `${serverUrl}/${repository}/actions/runs/${process.env.GITHUB_RUN_ID}`;
const sha = process.env.GITHUB_SHA ?? "unknown";
const siteBaseUrl = `https://${owner}.github.io/${repo}`;

// Plain fetch rather than the `gh` CLI (docs/agents/issue-tracker.md): this
// runs inside the Playwright container in CI, which doesn't ship gh.
async function github(method, endpoint, body) {
  const response = await fetch(`${apiUrl}${endpoint}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(
      `${method} ${endpoint} → ${response.status}: ${await response.text()}`,
    );
  }
  return response.status === 204 ? null : response.json();
}

//
// Which demos are broken, according to the latest turbo run summary?
//

const runsDirectory = path.join(root, ".turbo", "runs");
const summaryFiles = fs.existsSync(runsDirectory)
  ? fs.readdirSync(runsDirectory).filter((name) => name.endsWith(".json"))
  : [];
if (summaryFiles.length === 0) {
  console.error(`No turbo run summary found in ${runsDirectory}.`);
  process.exit(1);
}
const newestSummary = summaryFiles
  .map((name) => path.join(runsDirectory, name))
  .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
const summary = JSON.parse(fs.readFileSync(newestSummary, "utf8"));

const demosDirectory = path.join(root, "demos");
const packageToDir = new Map();
for (const dir of fs.readdirSync(demosDirectory)) {
  const packagePath = path.join(demosDirectory, dir, "package.json");
  if (!fs.existsSync(packagePath)) continue;
  const { name } = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  packageToDir.set(name, dir);
}

const broken = brokenDemosFromSummary(summary, packageToDir);
console.log(`Broken demos: ${broken.length ? broken.join(", ") : "none"}`);
if (dryRun) process.exit(0);

function maintainersOf(demo) {
  const metadataPath = path.join(demosDirectory, demo, "pmndrs.json");
  const { maintainers } = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
  return maintainers ?? [];
}

//
// Reconcile: one issue per demo, found via the marker in its body.
// Newest issue wins when a demo somehow accumulated several.
//

const issues = (
  await github(
    "GET",
    `/repos/${repository}/issues?labels=${ISSUE_LABEL}&state=all&sort=created&direction=desc&per_page=100`,
  )
).filter((issue) => !issue.pull_request);

const issueByDemo = new Map();
for (const issue of issues) {
  const demo = demoFromIssueBody(issue.body);
  if (demo && !issueByDemo.has(demo)) issueByDemo.set(demo, issue);
}

let labelEnsured = issues.length > 0;
async function ensureLabel() {
  if (labelEnsured) return;
  labelEnsured = true;
  try {
    await github("POST", `/repos/${repository}/labels`, {
      name: ISSUE_LABEL,
      color: "d73a4a",
      description: "Demos whose e2e test or build fails on main",
    });
  } catch {
    // label already exists
  }
}

for (const demo of broken) {
  const maintainers = maintainersOf(demo);
  const body = renderIssueBody({ demo, maintainers, runUrl, sha, siteBaseUrl });
  const issue = issueByDemo.get(demo);

  if (!issue) {
    await ensureLabel();
    // @mentions in the body of a freshly created issue already notify.
    const created = await github("POST", `/repos/${repository}/issues`, {
      title: issueTitle(demo),
      body,
      labels: [ISSUE_LABEL],
    });
    console.log(`${demo}: created #${created.number}.`);
  } else if (issue.state === "closed") {
    await github("PATCH", `/repos/${repository}/issues/${issue.number}`, {
      body,
      state: "open",
    });
    // The rewritten body carries the same @mentions as before, which doesn't
    // re-notify — the reopen ping is the comment.
    await github(
      "POST",
      `/repos/${repository}/issues/${issue.number}/comments`,
      { body: renderReopenComment({ demo, maintainers, runUrl }) },
    );
    console.log(`${demo}: reopened #${issue.number}.`);
  } else {
    // Still broken: refresh the run link, stay silent.
    await github("PATCH", `/repos/${repository}/issues/${issue.number}`, {
      body,
    });
    console.log(`${demo}: still broken, refreshed #${issue.number}.`);
  }
}

for (const [demo, issue] of issueByDemo) {
  if (issue.state !== "open" || broken.includes(demo)) continue;
  await github("POST", `/repos/${repository}/issues/${issue.number}/comments`, {
    body: renderFixedComment({ demo, runUrl }),
  });
  await github("PATCH", `/repos/${repository}/issues/${issue.number}`, {
    state: "closed",
  });
  console.log(`${demo}: green again, closed #${issue.number}.`);
}
