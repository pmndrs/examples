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
 *
 * Which steps those are is *resolved*, not listed: `ci.yml` -> the command the
 * step runs -> the `package.json` script it names -> the turbo tasks that
 * script runs -> whether any of them reaches `build2` through `dependsOn`.
 * Renaming a job, sharding the tests across a matrix or moving a build into
 * another job therefore changes nothing here; only a command this file cannot
 * resolve does, and that one fails loudly (see `describe` below) rather than
 * quietly matching nothing.
 */

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

type Step = { run?: string; env?: Record<string, string> };
type Workflow = { jobs: Record<string, { steps?: Step[] }> };
type Turbo = { tasks: Record<string, { dependsOn?: string[] }> };

const workflow = parse(read(".github/workflows/ci.yml")) as Workflow;
const scripts = (JSON.parse(read("package.json")) as Record<string, unknown>)
  .scripts as Record<string, string>;

/**
 * `turbo.json` is JSONC. Whole strings are matched first and handed back
 * untouched, so the `//` in `https://turbo.build/schema.json` stays a URL
 * instead of commenting out the rest of its line.
 */
const uncommented = read("turbo.json").replace(
  /"(?:[^"\\]|\\.)*"|\/\/[^\n]*|\/\*[\s\S]*?\*\//g,
  (match) => (match.startsWith('"') ? match : ""),
);
const turbo = JSON.parse(uncommented) as Turbo;

/** `website#build3` and `//#lint:examples` are the tasks `build3` and
 * `lint:examples`; what precedes the `#` is which package runs them. */
const taskName = (id: string) => id.slice(id.indexOf("#") + 1);
const TASKS = new Set(Object.keys(turbo.tasks).map(taskName));

/**
 * The one task `BASE_PATH` changes: vite takes it as `--base`, so every asset
 * URL in a `dist/` depends on it. Anything that reaches it -- `test` depends on
 * it, `build3` depends on it topologically -- has to be told which one.
 */
const ROOT_BUILD = "build2";

function builds(task: string, seen = new Set<string>()): boolean {
  if (task === ROOT_BUILD) return true;
  if (seen.has(task)) return false;
  seen.add(task);

  return (
    Object.entries(turbo.tasks)
      .filter(([id]) => taskName(id) === task)
      .flatMap(([, { dependsOn }]) => dependsOn ?? [])
      // `^build2` is "the dependencies' build2", `build2` this package's. Which
      // one runs is turbo's business; that it runs at all is ours.
      .map((dependency) => dependency.replace(/^\^/, ""))
      .some((dependency) => builds(dependency, seen))
  );
}

/** The tasks `turbo <args>` would run: the positional ones, minus the `run`
 * that may introduce them and anything past the `--` that ends turbo's own. */
function turboTasks(args: string[]): string[] {
  const own = args.indexOf("--");

  return (own === -1 ? args : args.slice(0, own))
    .filter((arg) => !arg.startsWith("-") && arg !== "run")
    .filter((arg) => {
      // A `${{ … }}`-blanked or shell-expanded argument -- `$filters` holds the
      // `--filter=`s of a shard -- names no task we could resolve here.
      if (arg.includes("$")) return false;
      if (!TASKS.has(arg)) {
        throw new Error(
          `ci.yml runs the turbo task \`${arg}\`, which turbo.json does not define. ` +
            `Renamed? This file resolves BASE_PATH through the task graph and cannot see past it.`,
        );
      }
      return true;
    });
}

/** pnpm's own subcommands, as opposed to our `package.json` scripts. */
const PNPM_COMMANDS = new Set(["install", "exec", "dlx", "run", "add", "why"]);

/**
 * Every turbo task a shell command ends up running, `pnpm <script>` resolved
 * through `package.json` (and recursively: `pnpm check` is `turbo lint …`).
 *
 * Throws on a `pnpm <thing>` that is neither -- a script renamed out from under
 * this file has to fail, not resolve to "runs nothing, needs no BASE_PATH",
 * which is how a test like this one goes quietly vacuous.
 */
function tasksOf(command: string, seen = new Set<string>()): string[] {
  const [bin, ...args] = command.split(/\s+/);
  if (bin === "turbo") return turboTasks(args);
  if (bin !== "pnpm") return [];

  const name = args.find((arg) => !arg.startsWith("-"));
  if (!name) return [];

  const rest = args.slice(args.indexOf(name) + 1).join(" ");
  if (name === "exec" || name === "dlx" || name === "run") {
    return tasksOf(rest, seen);
  }
  if (PNPM_COMMANDS.has(name)) return [];
  if (name in scripts) {
    // `prepare` calls `husky`, nothing calls itself, but a script that did
    // would hang this rather than fail it.
    if (seen.has(name)) return [];
    seen.add(name);
    return tasksOf(scripts[name], seen);
  }

  throw new Error(
    `ci.yml runs \`pnpm ${name}\`, which is neither a package.json script nor a pnpm command. ` +
      `Renamed? Add it to package.json (or to PNPM_COMMANDS) so this file can tell whether it builds.`,
  );
}

/** The `run:` of a step, as the separate commands a shell would see. */
function commands(run: string): string[] {
  return (
    run
      // `${{ github.ref == 'refs/heads/main' && '…' || '' }}` is one argument,
      // whatever it holds. Blank it before splitting on those same operators.
      .replace(/\$\{\{.*?\}\}/gs, "")
      .split(/\n|&&|\|\||[;|]/)
      .map((command) => command.trim())
      .filter(Boolean)
  );
}

const steps = Object.values(workflow.jobs).flatMap((job) => job.steps ?? []);

/** Resolved on demand, so the throw above belongs to the test that names it. */
const buildingSteps = () =>
  steps.filter((step) =>
    commands(step.run ?? "").some((command) =>
      tasksOf(command).some((task) => builds(task)),
    ),
  );

describe("ci.yml", () => {
  // The canary. Every assertion below is about the steps that build, so a
  // workflow this file reads as building nothing would satisfy them all.
  it("resolves every command it runs", () => {
    expect(() => buildingSteps()).not.toThrow();
  });

  it("builds the examples somewhere", () => {
    expect(buildingSteps().length).toBeGreaterThan(0);
  });

  // `BASE_URL` rides along: `build2` declares it in its `env` (vite-plugin-head
  // writes the deployment origin into each demo's <head>), so it is part of the
  // hash for the same reason `BASE_PATH` is. #180 added it to the build steps
  // only, and for a while the shards quietly built -- and shot -- a dist nobody
  // deploys, while build-job rebuilt all 161 examples on every run.
  for (const name of ["BASE_PATH", "BASE_URL"] as const) {
    it(`gives each of those steps a ${name}`, () => {
      for (const step of buildingSteps()) {
        expect(step.env?.[name], step.run).toBeDefined();
      }
    });

    it(`gives them all the same ${name}`, () => {
      const values = new Set(buildingSteps().map((step) => step.env?.[name]));
      expect([...values]).toHaveLength(1);
    });
  }
});
