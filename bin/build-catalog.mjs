#!/usr/bin/env node

/**
 * Emits the machine-readable catalog the website ships alongside its pages, at
 * `/catalog/index.{json,md}` and `/catalog/<example>.{json,md}`.
 *
 * It exists for readers that cannot run the site: the pmndrs docs MCP server
 * serves examples to coding agents out of these files, so an agent can find the
 * example that already solves a problem and read its source without cloning
 * anything.
 *
 * Two forms of each. The JSON is the structured one -- dependencies as a map,
 * sizes as numbers. The markdown is what a reader is actually handed, and it is
 * written here rather than by whichever server passes it on, because it is
 * published too: every example page points at its `.md` with `rel="alternate"`,
 * so an agent arriving from the open web gets the same document as one arriving
 * over MCP.
 *
 * Two files rather than one on purpose. The index is small enough (~95 kB, and
 * an eighth of that over the wire) to pull on every question, and carries just
 * enough -- title, description, tags, libraries -- to pick from; the per-example
 * file then costs one more request for the ~6 kB that actually answers it. A
 * single bundle would be ~2 MB, paid in full to read one example.
 *
 * The published set is whatever `apps/website/package.json` depends on, which is
 * what the site itself builds from (`apps/website/lib/helper.ts`). Example
 * directories that are not workspace dependencies -- `ssr-test`, `starwars` --
 * are not on the site and are not in the catalog either.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderExample, renderIndex } from "./lib/render.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const examplesDirectory = path.join(root, "examples");
const websiteDirectory = path.join(root, "apps", "website");
const outputDirectory = path.join(websiteDirectory, "public", "catalog");

// Same derivation as `lib/helper.ts`: absolute when the build knows where it is
// deploying, relative otherwise, so a local build never emits production links.
const BASE_PATH = process.env.BASE_PATH || "";
const BASE_URL = process.env.BASE_URL;
const site = `${BASE_URL ? new URL(BASE_URL).origin : ""}${BASE_PATH}`;

/**
 * Being text is not enough to be worth inlining. Nine files across the gallery
 * are payloads that happen to have a source extension -- vendored
 * `realism-effects` bundles, a 881 kB Inter atlas, one gltfjsx dump -- and
 * together they are three quarters of the catalog's weight. Inlined, the largest
 * example alone is ~258k tokens, which no reader can hold.
 *
 * 40 kB is where that split falls cleanly: every hand-written file in the
 * gallery is under it (the largest, a gltfjsx-generated `Tower.tsx`, is 30 kB),
 * and every file over it is generated or vendored. Those are listed with their
 * size instead, so a reader knows they exist and where to find them.
 */
const MAX_FILE_BYTES = 40 * 1024;

// Source we can hand to a reader as text. Everything else in `src/` is an asset
// -- .glb, .jpg, .mp3 -- which is listed by path and left where it is.
const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".css",
  ".json",
  ".glsl",
  ".vert",
  ".frag",
]);

function readJson(...segments) {
  return JSON.parse(fs.readFileSync(path.join(...segments), "utf8"));
}

/** Every file under `dir`, as paths relative to the example directory. */
function walk(dir, base) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(absolute, base);
      return [path.relative(base, absolute)];
    })
    .sort();
}

const websitePackage = readJson(websiteDirectory, "package.json");
const names = Object.keys(websitePackage.dependencies ?? {})
  .filter((dependency) => dependency.startsWith("@example/"))
  .map((dependency) => dependency.slice("@example/".length))
  .sort();

if (names.length === 0) {
  throw new Error(
    "No @example/* dependencies in apps/website/package.json -- the catalog would be empty",
  );
}

const index = [];

fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true });

for (const name of names) {
  const exampleDirectory = path.join(examplesDirectory, name);
  const { $schema, assets, ...metadata } = readJson(
    exampleDirectory,
    "pmndrs.json",
  );
  const packageJson = readJson(exampleDirectory, "package.json");

  const paths = walk(path.join(exampleDirectory, "src"), exampleDirectory);
  const sizeOf = (file) => fs.statSync(path.join(exampleDirectory, file)).size;
  const isText = (file) => TEXT_EXTENSIONS.has(path.extname(file));
  const isInlinable = (file) => isText(file) && sizeOf(file) <= MAX_FILE_BYTES;

  // What the index carries: enough to choose an example without fetching it.
  // `assets` -- the attribution and licensing records -- stays out; it is only
  // needed once you are actually reusing the example.
  const summary = {
    name,
    ...metadata,
    demo: `${site}/examples/${name}`,
    thumbnail: `${site}/${name}/thumbnail.webp`,
    // How much source a reader takes on by opening this one. Examples run from
    // a few hundred bytes to 90 kB, and without this in the index the choice is
    // made blind -- which is what pushes a reader into "open one and hope"
    // instead of opening the two that would answer the question.
    bytes: paths
      .filter(isInlinable)
      .reduce((total, file) => total + sizeOf(file), 0),
  };
  index.push(summary);

  const example = {
    ...summary,
    repository: `https://github.com/pmndrs/examples/tree/main/examples/${name}`,
    install: `npx degit pmndrs/examples/examples/${name}`,
    dependencies: packageJson.dependencies ?? {},
    files: paths.filter(isInlinable).map((file) => ({
      path: file,
      content: fs.readFileSync(path.join(exampleDirectory, file), "utf8"),
    })),
    // Binary companions of the source -- models, textures, audio. Left as
    // paths: they are in the repository, and `assets` says who made them.
    binaries: paths.filter((file) => !isText(file)),
    // Text, but generated or vendored past the point of being readable.
    oversized: paths
      .filter((file) => isText(file) && !isInlinable(file))
      .map((file) => ({ path: file, bytes: sizeOf(file) })),
    assets,
  };

  // The JSON is the structured form; the markdown is the reading form, and it
  // is what both the MCP server and `rel="alternate"` hand out.
  fs.writeFileSync(
    path.join(outputDirectory, `${name}.json`),
    `${JSON.stringify(example, null, 2)}\n`,
  );
  fs.writeFileSync(
    path.join(outputDirectory, `${name}.md`),
    renderExample(example),
  );
}

fs.writeFileSync(
  path.join(outputDirectory, "index.json"),
  `${JSON.stringify({ site, count: index.length, examples: index }, null, 2)}\n`,
);
fs.writeFileSync(path.join(outputDirectory, "index.md"), renderIndex(index));

console.log(
  `Wrote catalog for ${index.length} examples to ${path.relative(root, outputDirectory)}.`,
);
