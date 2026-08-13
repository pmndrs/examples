import fs from "node:fs";
import path from "node:path";

/**
 * Gives every built example a `<head>` that says what it is.
 *
 * The demos are published at `/<name>/`, and that is the URL the READMEs' badges
 * point at -- so it is the one people share. Until now it shipped vite's
 * scaffold: `<title>Vite + React + TS</title>`, no description, and nothing
 * connecting it to the page that frames it or to the document an agent can read.
 * The website's own pages carry all of that; the demo itself carried none.
 *
 * So: the real title and description out of `pmndrs.json`, a `canonical`
 * pointing at the page (they are the same example, and the page is the richer
 * of the two), and the `rel="alternate"` that reaches the markdown -- the same
 * three the page has.
 *
 * Only the built output. `vite dev` serves the untouched `index.html`, which is
 * what you want while working on a demo.
 */
export default function vitePluginHead() {
  let root;

  return {
    name: "vite-plugin-head",
    apply: "build",

    configResolved(config) {
      root = config.root;
    },

    transformIndexHtml(html) {
      const metadataPath = path.join(root, "pmndrs.json");
      if (!fs.existsSync(metadataPath)) return html;

      const { title, description } = JSON.parse(
        fs.readFileSync(metadataPath, "utf8"),
      );
      const name = path.basename(root);

      // Same derivation as the website's `lib/helper.ts`: absolute once the
      // build knows where it is deploying, relative otherwise, so a local build
      // never emits production links.
      const BASE_PATH = process.env.BASE_PATH || "";
      const BASE_URL = process.env.BASE_URL;
      const site = `${BASE_URL ? new URL(BASE_URL).origin : ""}${BASE_PATH}`;
      const page = `${site}/examples/${name}`;

      const tags = [
        `<link rel="canonical" href="${page}" />`,
        `<link rel="alternate" type="text/markdown" href="${page}.md" />`,
        `<link rel="alternate" type="text/plain" href="${site}/llms.txt" />`,
      ];
      if (description?.trim()) {
        tags.push(
          `<meta name="description" content="${escape(description)}" />`,
        );
      }

      return html
        .replace(
          /<title>[^<]*<\/title>/,
          `<title>${escape(title)} — pmndrs examples</title>`,
        )
        .replace("</head>", `  ${tags.join("\n    ")}\n  </head>`);
    },
  };
}

/** Attribute-safe: these come from `pmndrs.json`, which is prose. */
function escape(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
