import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  // @ts-expect-error -- plain ESM, no types, and none worth writing
  DESCRIPTION_MAX_LENGTH,
  // @ts-expect-error -- plain ESM, no types, and none worth writing
  OVERLONG,
  // @ts-expect-error -- plain ESM, no types, and none worth writing
  UNDESCRIBED,
} from "../bin/description-exceptions.mjs";

/**
 * `lint:metadata` only reads these lists one way: it asks whether an example
 * that fails the rule was named, and stays quiet if it was. So the lint alone
 * would let a described example keep its entry forever, and a list that
 * outlives its reasons is the thing the whole pattern exists to prevent.
 *
 * These tests read them the other way. Every entry has to still be failing,
 * every failure has to still be listed, and the recorded lengths have to still
 * be the lengths -- so the only way to touch one of these descriptions is to
 * update the list in the same change.
 */

const root = path.resolve(import.meta.dirname, "..");
const examplesDirectory = path.join(root, "examples");

const examples = readdirSync(examplesDirectory).filter((name) =>
  existsSync(path.join(examplesDirectory, name, "package.json")),
);

function descriptionOf(name: string): string {
  const metadata = JSON.parse(
    readFileSync(path.join(examplesDirectory, name, "pmndrs.json"), "utf8"),
  );
  return typeof metadata.description === "string" ? metadata.description : "";
}

const empty = examples.filter(
  (name) => descriptionOf(name).trim().length === 0,
);

const overlong = examples.filter((name) => {
  const description = descriptionOf(name);
  return (
    description.trim().length > 0 && description.length > DESCRIPTION_MAX_LENGTH
  );
});

describe("undescribed", () => {
  it("names every example that has no description", () => {
    const missing = empty.filter((name) => !UNDESCRIBED.includes(name));

    expect(missing, "empty description, and not carved out").toEqual([]);
  });

  it("names nothing that has one", () => {
    const stale = UNDESCRIBED.filter((name: string) => !empty.includes(name));

    expect(stale, "carved out, yet described -- delete the line").toEqual([]);
  });

  it("names examples that exist", () => {
    for (const name of UNDESCRIBED) {
      expect(examples, `${name} is not an example`).toContain(name);
    }
  });
});

describe("overlong", () => {
  it("names every description past the bound", () => {
    const missing = overlong.filter((name) => !(name in OVERLONG));

    expect(
      missing,
      `over ${DESCRIPTION_MAX_LENGTH}, and not carved out`,
    ).toEqual([]);
  });

  it("names nothing that fits", () => {
    const stale = Object.keys(OVERLONG).filter(
      (name) => !overlong.includes(name),
    );

    expect(
      stale,
      "carved out, yet within the bound -- delete the line",
    ).toEqual([]);
  });

  it("records the length each one actually is", () => {
    for (const [name, length] of Object.entries(OVERLONG)) {
      expect(examples, `${name} is not an example`).toContain(name);
      expect(descriptionOf(name).length, `${name} is no longer ${length}`).toBe(
        length,
      );
    }
  });
});
