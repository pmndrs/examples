import { readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";

/**
 * `turbo-cache.test.ts` asserts which *file* invalidates which task. This one
 * asserts the other half of the same contract -- which *env* does -- because
 * `BASE_PATH` is a `globalEnv` that genuinely changes what a `build2` emits
 * (vite's `--base`), and nothing in a green run says so.
 *
 * #165 added the preview upload on the stated grounds that "`test` already
 * builds every example, so the extra `pnpm build` on a pull request is the
 * website plus `out.sh`; the rest is a turbo cache hit" -- and left `BASE_PATH`
 * unset for that one build. Both halves cannot be true: every `build2` hashed
 * differently, so a pull request rebuilt all 167 (~3.5min), and never hit the
 * cache across runs either, since `main` never produces those hashes and one
 * pull request cannot read another's cache. `main` stayed a cache hit
 * throughout, which is why two years of green runs never mentioned it.
 *
 * So: every step that builds runs under the same `BASE_PATH`, or one of them is
 * paying for a full rebuild of the examples.
 */

const root = path.resolve(import.meta.dirname, "..");

/**
 * `pnpm build`, `pnpm test`, `pnpm exec turbo test` -- and not `pnpm check`,
 * `pnpm install`, or `pnpm test:turbo`, which resolves hashes without building.
 */
const BUILDS =
  /\b(?:pnpm|turbo)\s+(?:exec\s+turbo\s+)?(?:build|test)(?![\w:-])/;

type Step = { run?: string; env?: Record<string, string> };
type Workflow = { jobs: Record<string, { steps?: Step[] }> };

const workflow = parse(
  readFileSync(path.join(root, ".github/workflows/ci.yml"), "utf8"),
) as Workflow;

const steps = Object.values(workflow.jobs)
  .flatMap((job) => job.steps ?? [])
  .filter((step) => step.run && BUILDS.test(step.run));

describe("ci.yml", () => {
  // A canary on the regex above: if the steps are renamed out from under it,
  // an empty list would satisfy every assertion below.
  it("runs the examples through turbo in four steps", () => {
    expect(steps.map((step) => step.run!.trim())).toEqual([
      "pnpm test",
      "pnpm exec turbo test --force -- --update-snapshots=all",
      "pnpm build",
      "pnpm build",
    ]);
  });

  it("gives each of them a BASE_PATH", () => {
    for (const step of steps) {
      expect(step.env?.BASE_PATH, step.run).toBeDefined();
    }
  });

  it("gives them all the same one", () => {
    const values = new Set(steps.map((step) => step.env?.BASE_PATH));
    expect([...values]).toHaveLength(1);
  });
});
