import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

// @ts-expect-error -- plain JS, loaded by packages/e2e/src/vite.config.build.ts
import vitePluginHead from "../packages/e2e/src/vite-plugin-head.js";

/**
 * The demos are published at `/<name>/`, and that is where the READMEs' badges
 * point -- so it is the URL people share. What it says about itself is all this
 * plugin, and none of it comes from the website that frames it.
 */

const HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Vite + React + TS</title>
  </head>
  <body><div id="root"></div></body>
</html>
`;

let root: string;

function transform(metadata: unknown) {
  writeFileSync(path.join(root, "pmndrs.json"), JSON.stringify(metadata));
  const plugin = vitePluginHead();
  plugin.configResolved({ root });
  return plugin.transformIndexHtml(HTML);
}

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), "aquarium-"));
  process.env.BASE_PATH = "/examples";
  process.env.BASE_URL = "https://pmndrs.github.io/examples";
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
  delete process.env.BASE_PATH;
  delete process.env.BASE_URL;
});

describe("vite-plugin-head", () => {
  it("replaces vite's scaffold title with the example's own", () => {
    const html = transform({ title: "Aquarium", description: "" });

    expect(html).toContain("<title>Aquarium — pmndrs examples</title>");
    expect(html).not.toContain("Vite + React + TS");
  });

  it("points at the page as canonical, and at both alternates", () => {
    const html = transform({ title: "Aquarium", description: "" });
    const site = "https://pmndrs.github.io/examples";
    const name = path.basename(root);

    expect(html).toContain(
      `<link rel="canonical" href="${site}/examples/${name}" />`,
    );
    expect(html).toContain(
      `<link rel="alternate" type="text/markdown" href="${site}/examples/${name}.md" />`,
    );
    expect(html).toContain(
      `<link rel="alternate" type="text/plain" href="${site}/llms.txt" />`,
    );
  });

  it("carries the description when the example has one", () => {
    const html = transform({
      title: "Arkanoid",
      description: "Cannon physics.",
    });

    expect(html).toContain(
      '<meta name="description" content="Cannon physics." />',
    );
  });

  it("omits the description rather than emitting an empty one", () => {
    // 39 of the 167 have none, and `content=""` is worse than silence.
    expect(transform({ title: "Aquarium", description: "  " })).not.toContain(
      'name="description"',
    );
  });

  it("escapes what it takes from pmndrs.json", () => {
    const html = transform({
      title: 'Bruno "Simon" & co',
      description: 'A <canvas> "demo" & more',
    });

    expect(html).toContain(
      "<title>Bruno &quot;Simon&quot; &amp; co — pmndrs examples</title>",
    );
    expect(html).toContain(
      '<meta name="description" content="A &lt;canvas&gt; &quot;demo&quot; &amp; more" />',
    );
  });

  it("leaves the html alone when there is no metadata beside it", () => {
    const plugin = vitePluginHead();
    plugin.configResolved({ root });

    expect(plugin.transformIndexHtml(HTML)).toBe(HTML);
  });

  it("only runs on builds -- `vite dev` serves the untouched file", () => {
    expect(vitePluginHead().apply).toBe("build");
  });
});
