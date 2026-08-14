/**
 * Renders the catalog as the markdown an agent reads: one line per example for
 * the index, one document per example.
 *
 * This lives here rather than in whichever server hands it out, because the
 * rendered form is published too -- `/examples/<name>.md` sits next to the JSON
 * and the example's own page points at it with `rel="alternate"`. A static host
 * cannot render on demand, so the only way an agent arriving from the open web
 * gets the same document as one arriving over MCP is for the producer to write
 * it once.
 */

/**
 * Every example depends on these, so spelling them out on 167 index lines says
 * nothing. The per-example document lists the real dependencies with versions.
 */
const IMPLIED_LIBRARIES = new Set(["@react-three/fiber", "@react-three/drei"]);

const SHORT_LIBRARY_NAMES = {
  "@react-spring/core": "react-spring",
  "@react-spring/three": "react-spring",
  "@react-spring/web": "react-spring",
  "@use-gesture/react": "use-gesture",
};

/**
 * Where an example stops being cheap to open. The median is 5 kB and nine tenths
 * are under 15 kB, so reading three of them costs a reader less than the index
 * itself -- the size is worth saying only for the handful where it changes the
 * decision. Eight examples are over this line; two of them are most of the
 * distance.
 */
const LARGE_BYTES = 24 * 1024;

const shortenLibrary = (library) =>
  SHORT_LIBRARY_NAMES[library] ?? library.replace(/^@react-three\//, "");

const titleCase = (name) =>
  name
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");

/**
 * One index line. Everything past the name is dropped when the example does not
 * carry it, so an entry costs what it is worth -- and a line with no size marker
 * is one a reader can open without thinking about it:
 *
 *     aquarium · #transmission
 *     arkanoid · Simple arkanoid implementation using cannon physics. · +cannon · #physics,game
 *     bounds-and-makedefault (Bounds and makeDefault) · #bounds
 *     flow-shield · Interactive energy shield. · +postprocessing,leva · #shader · ~23k
 */
export function summaryLine({
  name,
  title,
  description,
  libraries,
  tags,
  bytes,
}) {
  // A title that is just the prettified directory name is noise -- but not
  // always: `makeDefault`, `GLTF`, `Bruno Simon's` only exist in the title.
  const head = title && title !== titleCase(name) ? `${name} (${title})` : name;

  const extras = [
    ...new Set(
      libraries
        .filter((library) => !IMPLIED_LIBRARIES.has(library))
        .map(shortenLibrary),
    ),
  ];

  return [
    head,
    description.trim().replace(/\s+/g, " "),
    extras.length ? `+${extras.join(",")}` : "",
    tags.length ? `#${tags.join(",")}` : "",
    bytes > LARGE_BYTES ? `~${Math.round(bytes / 4000)}k` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

export function renderIndex(examples) {
  return `${examples.map(summaryLine).join("\n")}\n`;
}

const FENCE_LANGUAGES = {
  ".ts": "ts",
  ".tsx": "tsx",
  ".js": "js",
  ".jsx": "jsx",
  ".mjs": "js",
  ".cjs": "js",
  ".css": "css",
  ".json": "json",
  ".glsl": "glsl",
  ".vert": "glsl",
  ".frag": "glsl",
};

/** A fence long enough to survive whatever backticks the file itself contains. */
function fence(content) {
  const longest = Math.max(
    0,
    ...(content.match(/`+/g) ?? []).map((run) => run.length),
  );
  return "`".repeat(Math.max(3, longest + 1));
}

function attribution(assets) {
  return assets
    .map((asset) => {
      const parts = [asset.name];
      if (asset.creator) parts.push(`by ${asset.creator}`);
      if (asset.license) parts.push(asset.license);
      if (asset.modified) parts.push("modified");
      const line = `- ${parts.join(" — ")}`;
      const url = asset.source ?? asset.licenseUrl;
      return url ? `${line} (${url})` : line;
    })
    .join("\n");
}

/**
 * The whole example as one document: what it is, what it pins, then its source.
 * Versions are part of the answer -- the code is written against the `three` and
 * drei that sit next to it, and reading it without them invites an API that has
 * since moved.
 */
export function renderExample(example) {
  const facts = [
    `Demo: ${example.demo}`,
    `Source: ${example.repository}`,
    `Scaffold: ${example.install}`,
    example.publishedAt && `Published: ${example.publishedAt}`,
    example.authors.length && `Authors: ${example.authors.join(", ")}`,
    example.tags.length && `Tags: ${example.tags.join(", ")}`,
    // The identifiers the technique is carried by, ordered by the metadata, not
    // alphabetically -- the first one is the answer to "what makes this one
    // different". They are here rather than on the index line because ~34
    // characters x 167 lines is 6 kB on a file read at the start of every
    // question, and by the time you are reading this document you already
    // chose.
    example.apis?.length && `APIs: ${example.apis.join(", ")}`,
    `Ported from: ${example.source}`,
    `Dependencies: ${Object.entries(example.dependencies)
      .map(([name, version]) => `${name}@${version}`)
      .join(", ")}`,
    example.binaries.length &&
      `Binary files, in the repository but not below: ${example.binaries.join(", ")}`,
    // Vendored bundles, font atlases, gltfjsx dumps. Named rather than hidden:
    // a reader that finds an unexplained import wants to know it was skipped on
    // size, not wonder whether the example is broken.
    example.oversized.length &&
      `Too large to inline, in the repository: ${example.oversized
        .map(({ path, bytes }) => `${path} (${Math.round(bytes / 1024)} kB)`)
        .join(", ")}`,
  ].filter(Boolean);

  const sections = [
    `# ${example.title}`,
    example.description.trim(),
    facts.join("\n"),
    example.assets.length &&
      `## Asset attribution\n\n${attribution(example.assets)}`,
    ...example.files.map((file) => {
      const language =
        FENCE_LANGUAGES[file.path.slice(file.path.lastIndexOf("."))] ?? "";
      const marks = fence(file.content);
      return `## ${file.path}\n\n${marks}${language}\n${file.content.trimEnd()}\n${marks}`;
    }),
  ].filter(Boolean);

  return `${sections.join("\n\n")}\n`;
}
