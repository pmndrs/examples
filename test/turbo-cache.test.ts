import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * What these tests protect is not turbo itself but our `inputs`: a task whose
 * declared inputs are too wide re-runs on every commit (and, if they reach
 * past `.gitignore`, never even hits its own cache -- the run's own `.turbo/`
 * logs move the hash), while one that is too narrow replays a stale pass over
 * code that did change. Both are silent. Each test below states which file a
 * task is supposed to care about, and which it must ignore.
 *
 * `--dry` is what makes this affordable: turbo resolves the graph and hashes
 * every input without running anything, so a `build2` assertion costs a
 * hash, not a vite build.
 */

const root = path.resolve(import.meta.dirname, "..");

type Task = { taskId: string; hash: string; cache: { status: string } };

function dryRun(tasks: string[], filter?: string): Map<string, Task> {
  const args = ["exec", "turbo", "run", ...tasks, "--dry=json"];
  if (filter) args.push(`--filter=${filter}`);

  const stdout = execFileSync("pnpm", args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });

  const { tasks: resolved } = JSON.parse(stdout.slice(stdout.indexOf("{"))) as {
    tasks: Task[];
  };

  return new Map(resolved.map((task) => [task.taskId, task]));
}

function hashOf(taskId: string, tasks: string[], filter?: string) {
  const task = dryRun(tasks, filter).get(taskId);
  if (!task) throw new Error(`${taskId} is not in the task graph`);
  return task.hash;
}

/** Append a byte, run the assertion, put the file back exactly as it was. */
function withTouched<T>(file: string, run: () => T): T {
  const absolute = path.join(root, file);
  const original = readFileSync(absolute);
  try {
    appendFileSync(absolute, "\n");
    return run();
  } finally {
    writeFileSync(absolute, original);
  }
}

const LINT = ["lint", "lint:examples", "lint:metadata", "lint:versions"];
const FORMAT = ["format:check"];
const BUILD = ["build2"];
const WEBSITE_BUILD = ["build3"];

const EXAMPLE = "@example/basic-example";
const EXAMPLE_SOURCE = "examples/basic-example/src/App.tsx";
const OTHER_EXAMPLE_SOURCE = "examples/wireframes/src/App.tsx";

describe("build", () => {
  it("re-runs for the example whose source moved, and only that one", () => {
    const before = dryRun(BUILD);

    withTouched(EXAMPLE_SOURCE, () => {
      const after = dryRun(BUILD);

      expect(after.get(`${EXAMPLE}#build2`)!.hash).not.toBe(
        before.get(`${EXAMPLE}#build2`)!.hash,
      );
      expect(after.get("@example/wireframes#build2")!.hash).toBe(
        before.get("@example/wireframes#build2")!.hash,
      );
    });
  });

  it("ignores a change to another example", () => {
    const before = hashOf(`${EXAMPLE}#build2`, BUILD, EXAMPLE);

    withTouched(OTHER_EXAMPLE_SOURCE, () => {
      expect(hashOf(`${EXAMPLE}#build2`, BUILD, EXAMPLE)).toBe(before);
    });
  });
});

/**
 * The website build also emits `/catalog/*.{json,md}` (`bin/build-catalog.mjs`),
 * which is what the docs MCP server and every example page's `rel="alternate"`
 * hand out. A cache hit that skips it serves a catalog describing examples that
 * have since changed -- and unlike a stale page, nobody looks at it, so nothing
 * would ever report it.
 */
describe("catalog", () => {
  it("re-runs the website build for the generator itself", () => {
    const before = hashOf("website#build3", WEBSITE_BUILD);

    withTouched("bin/build-catalog.mjs", () => {
      expect(hashOf("website#build3", WEBSITE_BUILD)).not.toBe(before);
    });
  });

  it("re-runs the website build when the renderers move", () => {
    const before = hashOf("website#build3", WEBSITE_BUILD);

    withTouched("bin/lib/render.mjs", () => {
      expect(hashOf("website#build3", WEBSITE_BUILD)).not.toBe(before);
    });
  });

  it("re-runs the website build when an example's metadata moves", () => {
    const before = hashOf("website#build3", WEBSITE_BUILD);

    withTouched("examples/wireframes/pmndrs.json", () => {
      expect(hashOf("website#build3", WEBSITE_BUILD)).not.toBe(before);
    });
  });

  it("leaves the website build alone for a docs-only change", () => {
    const before = hashOf("website#build3", WEBSITE_BUILD);

    withTouched("docs/agents/domain.md", () => {
      expect(hashOf("website#build3", WEBSITE_BUILD)).toBe(before);
    });
  });
});

describe("lint", () => {
  it("re-runs eslint when a website source moves", () => {
    const before = hashOf("website#lint", LINT);

    withTouched("apps/website/components/Nav.tsx", () => {
      expect(hashOf("website#lint", LINT)).not.toBe(before);
    });
  });

  it("leaves eslint alone for a docs-only change", () => {
    const before = hashOf("website#lint", LINT);

    withTouched("docs/agents/domain.md", () => {
      expect(hashOf("website#lint", LINT)).toBe(before);
    });
  });

  it("re-runs the metadata check for a pmndrs.json, but not syncpack", () => {
    const before = dryRun(LINT);

    withTouched("examples/wireframes/pmndrs.json", () => {
      const after = dryRun(LINT);

      expect(after.get("//#lint:metadata")!.hash).not.toBe(
        before.get("//#lint:metadata")!.hash,
      );
      expect(after.get("//#lint:versions")!.hash).toBe(
        before.get("//#lint:versions")!.hash,
      );
    });
  });

  it("re-runs the examples pass when an example source moves", () => {
    const before = dryRun(LINT);

    withTouched(EXAMPLE_SOURCE, () => {
      const after = dryRun(LINT);

      expect(after.get("//#lint:examples")!.hash).not.toBe(
        before.get("//#lint:examples")!.hash,
      );
      expect(after.get("//#lint:versions")!.hash).toBe(
        before.get("//#lint:versions")!.hash,
      );
    });
  });

  it("leaves the examples pass alone for a non-source change", () => {
    const before = hashOf("//#lint:examples", LINT);

    withTouched("examples/wireframes/pmndrs.json", () => {
      expect(hashOf("//#lint:examples", LINT)).toBe(before);
    });
  });

  it("re-runs the examples pass for its own config", () => {
    const before = hashOf("//#lint:examples", LINT);

    withTouched("eslint.config.mjs", () => {
      expect(hashOf("//#lint:examples", LINT)).not.toBe(before);
    });
  });

  it("re-runs syncpack for its config, but not the metadata check", () => {
    const before = dryRun(LINT);

    withTouched(".syncpackrc.json", () => {
      const after = dryRun(LINT);

      expect(after.get("//#lint:versions")!.hash).not.toBe(
        before.get("//#lint:versions")!.hash,
      );
      expect(after.get("//#lint:metadata")!.hash).toBe(
        before.get("//#lint:metadata")!.hash,
      );
    });
  });
});

describe("format", () => {
  it("re-runs for a file anywhere in the repo", () => {
    const before = hashOf("//#format:check", FORMAT);

    withTouched(EXAMPLE_SOURCE, () => {
      expect(hashOf("//#format:check", FORMAT)).not.toBe(before);
    });
  });

  it("is not disturbed by the linters' own config", () => {
    const lintBefore = hashOf("website#lint", LINT);

    withTouched(".prettierignore", () => {
      expect(hashOf("website#lint", LINT)).toBe(lintBefore);
    });
  });
});

describe("hash stability", () => {
  /**
   * The regression this exists for: with `inputs: ["**"]`, `//#format:check`
   * hashed gitignored files too -- including the `.turbo/` log the run had
   * just written -- so two identical runs disagreed and the task could never
   * hit its own cache.
   */
  it("does not move when nothing does", () => {
    for (const [taskId, tasks] of [
      ["//#format:check", FORMAT],
      ["//#lint:metadata", LINT],
      ["//#lint:examples", LINT],
      ["website#lint", LINT],
      [`${EXAMPLE}#build2`, BUILD],
    ] as const) {
      expect(hashOf(taskId, [...tasks])).toBe(hashOf(taskId, [...tasks]));
    }
  });

  it("actually replays from the cache on a second real run", () => {
    const run = () =>
      execFileSync("pnpm", ["exec", "turbo", "run", "lint:metadata"], {
        cwd: root,
        encoding: "utf8",
      });

    run();
    expect(run()).toMatch(/cache hit/);
  });
});
