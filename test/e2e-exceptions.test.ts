import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// @ts-expect-error -- plain ESM, no types, and none worth writing
import { EXCEPTIONS } from "../bin/e2e-exceptions.mjs";

/**
 * An example is in the e2e run if and only if it has a `test` script. That is
 * what `bin/shard.mjs` deals out and what `e2e-flaky` sweeps -- so an example
 * dropped from the run leaves no trace anywhere except the absence of a line in
 * a `package.json`, which is exactly the kind of silence that let nine examples
 * go unwrapped.
 *
 * `bin/e2e-exceptions.mjs` is where that silence gets a sentence. These tests
 * keep the two from drifting: every exclusion is listed with a reason, and
 * every listed name is really excluded.
 */

const root = path.resolve(import.meta.dirname, "..");

const examples = readdirSync(path.join(root, "examples")).filter((name) =>
  existsSync(path.join(root, "examples", name, "package.json")),
);

function hasTestScript(name: string) {
  const pkg = JSON.parse(
    readFileSync(path.join(root, "examples", name, "package.json"), "utf8"),
  );
  return Boolean(pkg.scripts?.test);
}

describe("e2e exceptions", () => {
  it("covers every example that is not excluded", () => {
    const missing = examples
      .filter((name) => !hasTestScript(name))
      .filter((name) => !(name in EXCEPTIONS));

    expect(missing, "no `test` script, and no reason given").toEqual([]);
  });

  it("lists nothing that is actually in the run", () => {
    const stale = Object.keys(EXCEPTIONS).filter((name) => hasTestScript(name));

    expect(stale, "excluded, yet has a `test` script").toEqual([]);
  });

  it("names examples that exist, with a reason each", () => {
    for (const [name, reason] of Object.entries(EXCEPTIONS)) {
      expect(examples, `${name} is not an example`).toContain(name);
      expect(String(reason).length, `${name} has no reason`).toBeGreaterThan(
        10,
      );
    }
  });
});
