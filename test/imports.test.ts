import { describe, expect, it } from "vitest";

// @ts-expect-error -- plain JS, shared with bin/validate-pmndrs-metadata.mjs
import { importedIdentifiers } from "../bin/lib/imports.mjs";

/**
 * The `apis` lint is `apis ⊆ imports`, so everything it can get wrong it gets
 * wrong here: a name this misses is a valid entry rejected on `pnpm check`, and
 * a name it invents is rot the lint was written to catch going unnoticed.
 */

const identifiers = (source: string) => [...importedIdentifiers(source)];

describe("importedIdentifiers", () => {
  it("reads a member list that is spread over lines", () => {
    // The shape every example is written in, and the one a `grep 'from "'`
    // misses entirely.
    expect(
      identifiers(`import {
  useMask,
  MeshTransmissionMaterial,
} from "@react-three/drei"`),
    ).toEqual(["useMask", "MeshTransmissionMaterial"]);
  });

  it("keeps each statement to its own module", () => {
    expect(
      identifiers(
        [
          'import { Canvas } from "@react-three/fiber"',
          'import { useMask } from "@react-three/drei"',
        ].join("\n"),
      ),
    ).toEqual(["Canvas", "useMask"]);
  });

  it("takes the name the library exports, not the local alias", () => {
    // `apis` names what a reader would go looking for in the docs.
    expect(
      identifiers('import { useMask as mask } from "@react-three/drei"'),
    ).toEqual(["useMask"]);
  });

  it("keeps a default binding alongside its member list", () => {
    expect(identifiers('import React, { useRef } from "react"')).toEqual([
      "React",
      "useRef",
    ]);
  });

  it("binds a namespace under its local name, the only one it has", () => {
    expect(identifiers('import * as THREE from "three"')).toEqual(["THREE"]);
  });

  it("ignores types, which are not APIs", () => {
    expect(
      identifiers(
        [
          'import type { Mesh } from "three"',
          'import { type Group, useMask } from "@react-three/drei"',
        ].join("\n"),
      ),
    ).toEqual(["useMask"]);
  });

  it("has nothing to say about a side-effect import", () => {
    expect(identifiers('import "./styles.css"')).toEqual([]);
  });

  it("does not mistake a re-export for an import", () => {
    expect(identifiers('export { useMask } from "@react-three/drei"')).toEqual(
      [],
    );
  });
});
