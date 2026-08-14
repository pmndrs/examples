import { describe, expect, it } from "vitest";

// @ts-expect-error -- plain JS, shared with bin/build-llms.mjs
import {
  renderExample,
  renderIndex,
  summaryLine,
} from "../bin/lib/render-llms.mjs";

/**
 * What these protect is the shape of the document an agent reads. It is
 * published, not rendered on demand, so a regression here ships to every reader
 * at once -- over MCP and through the `rel="alternate"` on each example page.
 */

const summary = (over = {}) => ({
  name: "caustics",
  title: "Caustics",
  description: "",
  tags: [],
  authors: ["Paul Henschel"],
  libraries: ["@react-three/drei", "@react-three/fiber"],
  source: "https://codesandbox.io/s/szj6p7",
  demo: "https://pmndrs.github.io/examples/examples/caustics",
  thumbnail: "https://pmndrs.github.io/examples/caustics/thumbnail.webp",
  bytes: 4_000,
  ...over,
});

const example = (over = {}) => ({
  ...summary(),
  repository: "https://github.com/pmndrs/examples/tree/main/examples/caustics",
  install: "npx degit pmndrs/examples/examples/caustics",
  dependencies: { "@react-three/drei": "10.7.8", three: "0.165.0" },
  files: [{ path: "src/App.tsx", content: "export default function App() {}" }],
  binaries: [],
  oversized: [],
  assets: [],
  ...over,
});

describe("summaryLine", () => {
  it("drops a title that is just the prettified name", () => {
    expect(summaryLine(summary())).toBe("caustics");
  });

  it("keeps a title that carries something the name cannot", () => {
    expect(
      summaryLine(
        summary({
          name: "bounds-and-makedefault",
          title: "Bounds and makeDefault",
        }),
      ),
    ).toBe("bounds-and-makedefault (Bounds and makeDefault)");
  });

  it("omits fiber and drei, which every example uses", () => {
    expect(
      summaryLine(
        summary({
          libraries: [
            "@react-three/fiber",
            "@react-three/drei",
            "@react-three/cannon",
            "zustand",
          ],
        }),
      ),
    ).toBe("caustics · +cannon,zustand");
  });

  it("collapses the react-spring entry points into one name", () => {
    expect(
      summaryLine(
        summary({
          libraries: [
            "@react-spring/three",
            "@react-spring/web",
            "@react-spring/core",
          ],
        }),
      ),
    ).toBe("caustics · +react-spring");
  });

  it("assembles description, libraries and tags in that order", () => {
    expect(
      summaryLine(
        summary({
          name: "arkanoid",
          title: "Arkanoid",
          description: "Simple arkanoid implementation using cannon physics.",
          libraries: ["@react-three/fiber", "@react-three/cannon"],
          tags: ["physics", "game"],
        }),
      ),
    ).toBe(
      "arkanoid · Simple arkanoid implementation using cannon physics. · +cannon · #physics,game",
    );
  });

  it("flattens a description that wraps", () => {
    expect(
      summaryLine(summary({ description: "One idea,\n  spread over lines." })),
    ).toBe("caustics · One idea, spread over lines.");
  });

  it("leaves the APIs to the example's own document", () => {
    // ~34 characters x 167 lines, on the file read at the start of every
    // question, to say what is one fetch away once the choice is made.
    expect(
      summaryLine(summary({ apis: ["useMask", "MeshTransmissionMaterial"] })),
    ).toBe("caustics");
  });

  it("says nothing about size for an example that is cheap to open", () => {
    // The marker has to stay rare to mean anything: its absence is the signal
    // that a reader can open two of these without weighing the budget.
    expect(summaryLine(summary({ bytes: 24 * 1024 }))).toBe("caustics");
  });

  it("marks an example large enough that opening it is a decision", () => {
    expect(summaryLine(summary({ bytes: 90_048 }))).toBe("caustics · ~23k");
  });

  it("puts the size last, after everything that helps choose", () => {
    expect(
      summaryLine(
        summary({ description: "A shield.", tags: ["shader"], bytes: 90_048 }),
      ),
    ).toBe("caustics · A shield. · #shader · ~23k");
  });
});

describe("renderIndex", () => {
  it("is one line per example, newline-terminated", () => {
    expect(
      renderIndex([
        summary(),
        summary({ name: "aquarium", title: "Aquarium", tags: ["water"] }),
      ]),
    ).toBe("caustics\naquarium · #water\n");
  });
});

describe("renderExample", () => {
  it("leads with the title and the facts a reader needs", () => {
    const text = renderExample(
      example({ description: "Glass, and what it does to light." }),
    );

    expect(text).toContain("# Caustics");
    expect(text).toContain("Glass, and what it does to light.");
    expect(text).toContain(
      "Demo: https://pmndrs.github.io/examples/examples/caustics",
    );
    expect(text).toContain(
      "Scaffold: npx degit pmndrs/examples/examples/caustics",
    );
    expect(text).toContain(
      "Dependencies: @react-three/drei@10.7.8, three@0.165.0",
    );
  });

  it("omits the facts an example does not carry", () => {
    const text = renderExample(example({ authors: [], tags: [], apis: [] }));

    expect(text).not.toContain("Authors:");
    expect(text).not.toContain("Tags:");
    expect(text).not.toContain("APIs:");
  });

  it("names the APIs, in the order the metadata puts them", () => {
    // Next to the tags, which are the same thing said for a human: what this
    // example is about, in the vocabulary of its code.
    expect(
      renderExample(
        example({
          tags: ["transmission"],
          apis: ["useMask", "MeshTransmissionMaterial"],
        }),
      ),
    ).toContain("Tags: transmission\nAPIs: useMask, MeshTransmissionMaterial");
  });

  /**
   * The explanation, from the example's own README. Under the facts because
   * that is what they were chosen to introduce, and above the source because it
   * is what the source is read against.
   */
  it("carries the explainer between the facts and the source", () => {
    const text = renderExample(
      example({
        explainer: "## The problem\n\nGlass that contains something.",
      }),
    );

    expect(text.indexOf("## The problem")).toBeGreaterThan(
      text.indexOf("Scaffold:"),
    );
    expect(text.indexOf("## The problem")).toBeLessThan(
      text.indexOf("## src/App.tsx"),
    );
  });

  it("says nothing where an example has no explainer, which is most of them", () => {
    expect(renderExample(example())).toContain(
      "Scaffold: npx degit pmndrs/examples/examples/caustics\n",
    );
    expect(renderExample(example({ explainer: "" }))).toBe(
      renderExample(example()),
    );
  });

  it("fences each file under its own path, tagged by extension", () => {
    const text = renderExample(
      example({
        files: [
          { path: "src/App.tsx", content: "const a = 1" },
          { path: "src/styles.css", content: "body { margin: 0 }" },
        ],
      }),
    );

    expect(text).toContain("## src/App.tsx\n\n```tsx\nconst a = 1\n```");
    expect(text).toContain(
      "## src/styles.css\n\n```css\nbody { margin: 0 }\n```",
    );
  });

  it("opens a longer fence than the backticks inside the file", () => {
    // A file whose comments quote code would otherwise close the block early and
    // hand the reader half a file plus whatever followed it as prose.
    const text = renderExample(
      example({
        files: [{ path: "src/App.tsx", content: "// ```tsx\nconst a = 1" }],
      }),
    );

    expect(text).toContain("````tsx\n// ```tsx\nconst a = 1\n````");
  });

  it("names the binaries rather than pretending they are not there", () => {
    expect(
      renderExample(example({ binaries: ["src/glass-transformed.glb"] })),
    ).toContain("src/glass-transformed.glb");
  });

  it("says which files were skipped on size, and how big they are", () => {
    expect(
      renderExample(
        example({
          oversized: [{ path: "src/realism-effects/v2.js", bytes: 256_656 }],
        }),
      ),
    ).toContain(
      "Too large to inline, in the repository: src/realism-effects/v2.js (251 kB)",
    );
  });

  it("carries asset attribution through", () => {
    const text = renderExample(
      example({
        assets: [
          {
            name: "Fruit Cake Slice",
            creator: "matousekfoto",
            license: "CC-BY-4.0",
            source: "https://sketchfab.com/3d-models/fruit-cake-slice",
          },
        ],
      }),
    );

    expect(text).toContain("## Asset attribution");
    expect(text).toContain(
      "- Fruit Cake Slice — by matousekfoto — CC-BY-4.0 (https://sketchfab.com/3d-models/fruit-cake-slice)",
    );
  });
});
