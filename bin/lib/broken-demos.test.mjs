import { test } from "node:test";
import assert from "node:assert/strict";

import {
  brokenDemosFromSummary,
  issueTitle,
  demoFromIssueBody,
  renderIssueBody,
  renderReopenComment,
  renderFixedComment,
} from "./broken-demos.mjs";

const packageToDir = new Map([
  ["@demo/aquarium", "aquarium"],
  ["@demo/baking-soft-shadows", "baking-soft-shadows"],
  ["@demo/backdrop-and-cables", "backdrop-and-cables"],
]);

function summaryTask(pkg, task, exitCode) {
  return {
    taskId: `${pkg}#${task}`,
    package: pkg,
    task,
    execution: exitCode === undefined ? undefined : { exitCode },
  };
}

test("brokenDemosFromSummary flags demos whose test failed", () => {
  const summary = {
    tasks: [
      summaryTask("@demo/aquarium", "build2", 0),
      summaryTask("@demo/aquarium", "test", 1),
      summaryTask("@demo/baking-soft-shadows", "build2", 0),
      summaryTask("@demo/baking-soft-shadows", "test", 0),
    ],
  };
  assert.deepEqual(brokenDemosFromSummary(summary, packageToDir), ["aquarium"]);
});

test("brokenDemosFromSummary flags demos whose build failed (test skipped)", () => {
  const summary = {
    tasks: [
      summaryTask("@demo/aquarium", "build2", 1),
      // test task skipped by --continue=dependencies-successful: whether turbo
      // reports it without execution or with a null exitCode, it is NOT an
      // extra failure (build2 already marks the demo broken)
      summaryTask("@demo/aquarium", "test", undefined),
      summaryTask("@demo/baking-soft-shadows", "build2", 0),
      summaryTask("@demo/baking-soft-shadows", "test", null),
    ],
  };
  assert.deepEqual(brokenDemosFromSummary(summary, packageToDir), ["aquarium"]);
});

test("brokenDemosFromSummary dedupes, sorts, and ignores non-demo packages", () => {
  const summary = {
    tasks: [
      summaryTask("website", "build3", 1),
      summaryTask("@demo/backdrop-and-cables", "test", 1),
      summaryTask("@demo/backdrop-and-cables", "build2", 1),
      summaryTask("@demo/aquarium", "test", 1),
    ],
  };
  assert.deepEqual(brokenDemosFromSummary(summary, packageToDir), [
    "aquarium",
    "backdrop-and-cables",
  ]);
});

test("demoFromIssueBody roundtrips through renderIssueBody", () => {
  const body = renderIssueBody({
    demo: "re-using-geometry-and-level-of-detail",
    maintainers: ["abernier"],
    runUrl: "https://github.com/pmndrs/examples/actions/runs/1",
    sha: "abc1234def",
    siteBaseUrl: "https://pmndrs.github.io/examples",
  });
  assert.equal(
    demoFromIssueBody(body),
    "re-using-geometry-and-level-of-detail",
  );
});

test("demoFromIssueBody returns null without a marker", () => {
  assert.equal(demoFromIssueBody("no marker here"), null);
  assert.equal(demoFromIssueBody(undefined), null);
});

test("renderIssueBody links the demo and mentions its maintainers", () => {
  const body = renderIssueBody({
    demo: "aquarium",
    maintainers: ["abernier", "drcmda"],
    runUrl: "https://github.com/pmndrs/examples/actions/runs/1",
    sha: "abc1234def",
    siteBaseUrl: "https://pmndrs.github.io/examples",
  });
  assert.match(body, /https:\/\/pmndrs\.github\.io\/examples\/demos\/aquarium/);
  assert.match(body, /@abernier @drcmda/);
  assert.match(body, /actions\/runs\/1/);
  assert.match(body, /abc1234/);
});

test("renderIssueBody without maintainers points at pmndrs.json instead", () => {
  const body = renderIssueBody({
    demo: "aquarium",
    maintainers: [],
    runUrl: "https://github.com/pmndrs/examples/actions/runs/1",
    sha: "abc1234def",
    siteBaseUrl: "https://pmndrs.github.io/examples",
  });
  assert.match(body, /No maintainer/);
  assert.match(body, /demos\/aquarium\/pmndrs\.json/);
  assert.doesNotMatch(body, /@\w/);
});

test("renderReopenComment mentions maintainers", () => {
  const comment = renderReopenComment({
    demo: "aquarium",
    maintainers: ["abernier"],
    runUrl: "https://github.com/pmndrs/examples/actions/runs/2",
  });
  assert.match(comment, /broken again/);
  assert.match(comment, /cc @abernier/);
});

test("renderReopenComment without maintainers has no mentions", () => {
  const comment = renderReopenComment({
    demo: "aquarium",
    maintainers: [],
    runUrl: "https://github.com/pmndrs/examples/actions/runs/2",
  });
  assert.doesNotMatch(comment, /@\w/);
});

test("renderFixedComment has no mentions", () => {
  const comment = renderFixedComment({
    demo: "aquarium",
    runUrl: "https://github.com/pmndrs/examples/actions/runs/2",
  });
  assert.match(comment, /green again/);
  assert.doesNotMatch(comment, /@\w/);
});

test("issueTitle is stable per demo", () => {
  assert.equal(issueTitle("aquarium"), issueTitle("aquarium"));
  assert.match(issueTitle("aquarium"), /aquarium/);
});
