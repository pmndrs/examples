// Pure logic behind bin/notify-broken-demos.mjs: which demos a turbo run
// summary says are broken, and how each broken demo maps to / renders into
// its own GitHub issue. Kept IO-free so it can be tested with node --test.

export const ISSUE_LABEL = "broken-demos";

const DEMO_TASKS = new Set(["build2", "test"]);
// Hidden marker tying an issue to its demo: sturdier than parsing titles.
const DEMO_MARKER = /<!-- broken-demo:([a-z0-9-]+) -->/;

export function brokenDemosFromSummary(summary, packageToDir) {
  const broken = new Set();
  for (const task of summary.tasks ?? []) {
    const dir = packageToDir.get(task.package);
    if (!dir || !DEMO_TASKS.has(task.task)) continue;
    // A task skipped by --continue=dependencies-successful has no (or a null)
    // exitCode: only an actually-executed, non-zero task marks the demo broken.
    const exitCode = task.execution?.exitCode;
    if (Number.isInteger(exitCode) && exitCode !== 0) broken.add(dir);
  }
  return [...broken].sort();
}

export function issueTitle(demo) {
  return `🔴 \`${demo}\` is broken on main`;
}

export function demoFromIssueBody(body) {
  const match = (body ?? "").match(DEMO_MARKER);
  return match ? match[1] : null;
}

function mentions(logins) {
  return logins.map((login) => `@${login}`).join(" ");
}

export function renderIssueBody({
  demo,
  maintainers,
  runUrl,
  sha,
  siteBaseUrl,
}) {
  const who = maintainers.length
    ? `Maintainers: ${mentions(maintainers)}`
    : `_No maintainer_ — add your GitHub login to \`demos/${demo}/pmndrs.json\` → \`maintainers\` to get pinged about this demo.`;
  return [
    `<!-- broken-demo:${demo} -->`,
    "",
    `[\`${demo}\`](${siteBaseUrl}/demos/${demo})'s e2e test (or build) fails on \`main\` — see [the run](${runUrl}) (\`${sha.slice(0, 7)}\`).`,
    "",
    who,
    "",
    "Managed by `bin/notify-broken-demos.mjs`: the body tracks the latest",
    "failing run, and the issue closes itself once the demo is green again.",
  ].join("\n");
}

export function renderReopenComment({ demo, maintainers, runUrl }) {
  const cc = maintainers.length ? ` cc ${mentions(maintainers)}` : "";
  return `🔴 \`${demo}\` is broken again on \`main\` ([run](${runUrl})).${cc}`;
}

export function renderFixedComment({ demo, runUrl }) {
  return `✅ \`${demo}\` is green again on \`main\` ([run](${runUrl})). Closing.`;
}
