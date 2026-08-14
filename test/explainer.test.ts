import { describe, expect, it } from "vitest";

// @ts-expect-error -- plain JS, shared with bin/build-llms.mjs
import {
  backtickedIdentifiers,
  explainerOf,
  identifiersIn,
} from "../bin/lib/explainer.mjs";

/**
 * Two rules, and they fail in opposite directions. Lifting too little out of a
 * README publishes an example with no explanation; lifting too much publishes
 * three badges as one. Reading too few identifiers out of the prose lets a
 * renamed API sit in the document forever; reading too many turns a formatting
 * sweep into a lint failure nobody can act on.
 */

const HEADER = [
  "[![Static](https://img.shields.io/badge/example-x)](https://pmndrs.github.io/examples/aquarium)",
  "",
  "```sh",
  "$ npx degit pmndrs/examples/examples/aquarium",
  "```",
  "",
  "![](thumbnail.webp)",
].join("\n");

describe("explainerOf", () => {
  it("is what sits under the badge header", () => {
    expect(
      explainerOf(`${HEADER}\n\n## The problem\n\nGlass, contained.\n`),
    ).toBe("## The problem\n\nGlass, contained.");
  });

  it("is empty for the 170 READMEs that are only a header", () => {
    expect(explainerOf(`${HEADER}\n`)).toBe("");
  });

  /**
   * The header is generated scaffolding. Guessing where it ends -- rather than
   * finding the thumbnail that closes it -- would publish the badges and the
   * `degit` line as an explanation the first time that block is rearranged.
   */
  it("finds nothing when the thumbnail it keys on is gone", () => {
    expect(explainerOf("[![Static](x)](y)\n\nGlass, contained.\n")).toBe("");
  });

  it("keeps the header out even when the explainer has an image of its own", () => {
    const readme = `${HEADER}\n\nBefore, and ![after](./after.png) it.\n`;

    expect(explainerOf(readme)).toBe("Before, and ![after](./after.png) it.");
  });
});

describe("backtickedIdentifiers", () => {
  it("reads the identifiers the prose names", () => {
    expect([
      ...backtickedIdentifiers("`useMask` returns props for a material."),
    ]).toEqual(["useMask"]);
  });

  /**
   * A technique carried by a prop rather than an import is written the way the
   * prop is written, and every name in it is as checkable as an import.
   */
  it("takes every name out of a span, not just the whole of it", () => {
    expect([...backtickedIdentifiers("`gl={{ stencil: true }}`")]).toEqual([
      "gl",
      "stencil",
      "true",
    ]);
  });

  it("leaves fenced code alone", () => {
    // It may show a reader how to carry the technique into their own scene,
    // where the names are theirs.
    const prose = "```tsx\n<Mesh geometry={theirs} />\n```\n\nUses `useMask`.";

    expect([...backtickedIdentifiers(prose)]).toEqual(["useMask"]);
  });

  it("reads a doubled fence as one span", () => {
    expect([...backtickedIdentifiers("``a`b``")]).toEqual(["a", "b"]);
  });
});

describe("the rule the lint applies", () => {
  const missing = (prose: string, source: string) => {
    const vocabulary = identifiersIn(source);
    return [...backtickedIdentifiers(prose)].filter(
      (name: string) => !vocabulary.has(name),
    );
  };

  const SOURCE = 'import { useMask } from "@react-three/drei";\n// the Cube';

  it("passes prose whose identifiers are still in the source", () => {
    expect(missing("`useMask`, on every material.", SOURCE)).toEqual([]);
  });

  /**
   * The whole point. `useMask` goes in a drei migration, and the rule fires on
   * precisely the explainers that named it.
   */
  it("fails on an identifier the source no longer has", () => {
    expect(missing("`useMask`, on every material.", "// nothing here")).toEqual(
      ["useMask"],
    );
  });

  it("does not accept a name because a longer one contains it", () => {
    expect(missing("`Mask` covers the contents.", SOURCE)).toEqual(["Mask"]);
  });

  /**
   * Looser than the rule on `apis`, deliberately: prose may name the demo's own
   * components and props, which are never imported.
   */
  it("accepts a name that is written in the source but not imported", () => {
    expect(missing("`Cube` is the box.", SOURCE)).toEqual([]);
  });

  /** What it gives up, stated so nobody reads it as a stronger rule. */
  it("accepts a name that survives only in a comment", () => {
    expect(missing("`Cube` is the box.", "// Cube")).toEqual([]);
  });
});
