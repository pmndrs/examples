#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  DESCRIPTION_MAX_LENGTH,
  OVERLONG,
  UNDESCRIBED,
} from "./description-exceptions.mjs";
import {
  backtickedIdentifiers,
  explainerOf,
  identifiersIn,
} from "./lib/explainer.mjs";
import { importedIdentifiers } from "./lib/imports.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const examplesDirectory = path.join(root, "examples");
const schemaPath = path.join(root, "schemas", "pmndrs.schema.json");
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const allowedLibraries = new Set(schema.properties.libraries.items.enum);
const requiredFields = new Set(schema.required);
const allowedFields = new Set(Object.keys(schema.properties));
const allowedAssetFields = new Set(Object.keys(schema.$defs.asset.properties));
const legacyPackageFields = ["description", "homepage", "keywords"];
const errors = [];

function addError(exampleName, message) {
  errors.push(`${exampleName}: ${message}`);
}

function isStringArray(value) {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string" && item.length > 0)
  );
}

function hasDuplicates(value) {
  return new Set(value).size !== value.length;
}

function isUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isDate(value) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
  );
}

const SOURCE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
]);

/**
 * What the prose is checked against, which is wider than what the imports are
 * read from: a shader uniform or a class name is as much a thing an explainer
 * can name as a drei export.
 */
const TEXT_EXTENSIONS = new Set([
  ...SOURCE_EXTENSIONS,
  ".css",
  ".json",
  ".glsl",
  ".vert",
  ".frag",
]);

/** Every file under the example's `src/`, at any depth, with those extensions. */
function sourceFiles(exampleDirectory, extensions) {
  const files = [];

  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else if (extensions.has(path.extname(entry.name))) files.push(absolute);
    }
  };

  walk(path.join(exampleDirectory, "src"));
  return files;
}

/** Every identifier the example's own `src/` imports, across all of its files. */
function importsOf(exampleDirectory) {
  const identifiers = new Set();

  for (const file of sourceFiles(exampleDirectory, SOURCE_EXTENSIONS)) {
    for (const identifier of importedIdentifiers(
      fs.readFileSync(file, "utf8"),
    )) {
      identifiers.add(identifier);
    }
  }

  return identifiers;
}

/**
 * Every identifier-shaped word anywhere in the example's `src/`, comments and
 * strings included. Looser than `importsOf` on purpose -- see the rule below.
 */
function vocabularyOf(exampleDirectory) {
  const vocabulary = new Set();

  for (const file of sourceFiles(exampleDirectory, TEXT_EXTENSIONS)) {
    for (const word of identifiersIn(fs.readFileSync(file, "utf8"))) {
      vocabulary.add(word);
    }
  }

  return vocabulary;
}

/**
 * The two documents an example can carry prose in: the explainer under the
 * badges in `README.md`, and the glossary in `CONTEXT.md`. Both are optional,
 * and on most examples neither exists.
 */
function proseOf(exampleDirectory) {
  const documents = [];

  const readmePath = path.join(exampleDirectory, "README.md");
  if (fs.existsSync(readmePath)) {
    // Only what is under the badges: the header is generated scaffolding, and
    // its `degit` line names the repository, not this example's source.
    const explainer = explainerOf(fs.readFileSync(readmePath, "utf8"));
    if (explainer) documents.push(["README.md", explainer]);
  }

  const contextPath = path.join(exampleDirectory, "CONTEXT.md");
  if (fs.existsSync(contextPath)) {
    documents.push(["CONTEXT.md", fs.readFileSync(contextPath, "utf8")]);
  }

  return documents;
}

const exampleNames = fs
  .readdirSync(examplesDirectory)
  .filter((name) =>
    fs.existsSync(path.join(examplesDirectory, name, "package.json")),
  )
  .sort();

for (const exampleName of exampleNames) {
  const exampleDirectory = path.join(examplesDirectory, exampleName);
  const packagePath = path.join(exampleDirectory, "package.json");
  const metadataPath = path.join(exampleDirectory, "pmndrs.json");
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

  if (!fs.existsSync(metadataPath)) {
    addError(exampleName, "missing pmndrs.json");
    continue;
  }

  let metadata;
  try {
    metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
  } catch (error) {
    addError(exampleName, `invalid JSON (${error.message})`);
    continue;
  }

  for (const field of requiredFields) {
    if (!(field in metadata)) addError(exampleName, `missing "${field}"`);
  }
  for (const field of Object.keys(metadata)) {
    if (!allowedFields.has(field)) {
      addError(exampleName, `unknown field "${field}"`);
    }
  }

  if (metadata.$schema !== "../../schemas/pmndrs.schema.json") {
    addError(exampleName, 'invalid "$schema" path');
  }
  if (typeof metadata.title !== "string" || metadata.title.length === 0) {
    addError(exampleName, '"title" must be a non-empty string');
  }
  // An empty description is published, as a directory name and nothing else,
  // so it is an error rather than a gap. The examples that cannot pass this
  // yet are named in `bin/description-exceptions.mjs`, with the reasoning; the
  // lists only shrink, and leaving one is what `/describe-example` does.
  if (typeof metadata.description !== "string") {
    addError(exampleName, '"description" must be a string');
  } else if (metadata.description.trim().length === 0) {
    if (!UNDESCRIBED.includes(exampleName)) {
      addError(exampleName, '"description" is empty');
    }
  } else if (metadata.description.length > DESCRIPTION_MAX_LENGTH) {
    if (!(exampleName in OVERLONG)) {
      addError(
        exampleName,
        `"description" is ${metadata.description.length} characters, over ${DESCRIPTION_MAX_LENGTH}`,
      );
    }
  }

  for (const field of ["tags", "authors", "libraries"]) {
    if (!isStringArray(metadata[field])) {
      addError(exampleName, `"${field}" must contain non-empty strings`);
    } else if (hasDuplicates(metadata[field])) {
      addError(exampleName, `"${field}" contains duplicates`);
    }
  }

  if (!isUrl(metadata.source)) {
    addError(exampleName, '"source" must be an HTTP(S) URL');
  }
  if (metadata.publishedAt !== undefined && !isDate(metadata.publishedAt)) {
    addError(exampleName, '"publishedAt" must use YYYY-MM-DD');
  }

  const dependencies = packageJson.dependencies ?? {};
  for (const library of metadata.libraries ?? []) {
    if (!allowedLibraries.has(library)) {
      addError(exampleName, `unknown library "${library}"`);
    }
    if (!(library in dependencies)) {
      addError(
        exampleName,
        `library "${library}" is not listed in dependencies`,
      );
    }
  }

  // Optional until every example carries one, but never wrong: an entry the
  // example does not import is a name a reader would go looking for and not
  // find. The check is local and only local -- whether drei still exports it at
  // the pinned version is the bundler's job, and it already fails on it.
  if (metadata.apis !== undefined) {
    if (!isStringArray(metadata.apis)) {
      addError(exampleName, '"apis" must contain non-empty strings');
    } else if (hasDuplicates(metadata.apis)) {
      addError(exampleName, '"apis" contains duplicates');
    } else {
      const imported = importsOf(exampleDirectory);
      for (const api of metadata.apis) {
        if (!imported.has(api)) {
          addError(exampleName, `api "${api}" is not imported in src/`);
        }
      }
    }
  }

  // Prose that explains code goes stale on its own, and the obvious tripwire --
  // a hash of the source, stored next to the explainer -- would have fired on
  // 161 examples the day a prettier hook landed, training the reflex of
  // re-stamping without reading. This one fires on renames instead: every
  // identifier the prose puts in backticks has to still appear somewhere in the
  // example's `src/`. `useMask` disappears in a drei migration and it breaks on
  // precisely the explainers that named it; a formatting sweep never wakes it.
  //
  // Deliberately looser than the rule on `apis`, because it guards prose rather
  // than a data field: an entry in `apis` that is not *imported* has no
  // business there, whereas an explainer may name the demo's own components
  // (`Aquarium`, `Turtle`) and its props (`stencil` in `gl={{ stencil: true }}`).
  // What it gives up is small -- an identifier deleted from the code but
  // surviving in a comment still passes.
  const prose = proseOf(exampleDirectory);
  if (prose.length > 0) {
    const vocabulary = vocabularyOf(exampleDirectory);
    for (const [file, text] of prose) {
      for (const name of backtickedIdentifiers(text)) {
        if (!vocabulary.has(name)) {
          addError(exampleName, `${file} names \`${name}\`, absent from src/`);
        }
      }
    }
  }

  if (!Array.isArray(metadata.assets)) {
    addError(exampleName, '"assets" must be an array');
  } else {
    metadata.assets.forEach((asset, index) => {
      if (!asset || typeof asset !== "object" || Array.isArray(asset)) {
        addError(exampleName, `asset ${index} must be an object`);
        return;
      }
      if (typeof asset.name !== "string" || asset.name.length === 0) {
        addError(exampleName, `asset ${index} requires a name`);
      }
      for (const field of Object.keys(asset)) {
        if (!allowedAssetFields.has(field)) {
          addError(exampleName, `asset ${index} has unknown field "${field}"`);
        }
      }
      if (
        asset.files !== undefined &&
        (!isStringArray(asset.files) || hasDuplicates(asset.files))
      ) {
        addError(
          exampleName,
          `asset ${index} "files" must contain unique paths`,
        );
      }
      for (const field of ["source", "licenseUrl"]) {
        if (asset[field] !== undefined && !isUrl(asset[field])) {
          addError(exampleName, `asset ${index} "${field}" must be a URL`);
        }
      }
    });
  }

  for (const field of legacyPackageFields) {
    if (field in packageJson) {
      addError(
        exampleName,
        `package.json still contains migrated field "${field}"`,
      );
    }
  }
  for (const dependency of Object.keys(dependencies)) {
    if (
      allowedLibraries.has(dependency) &&
      !metadata.libraries?.includes(dependency)
    ) {
      addError(
        exampleName,
        `dependency "${dependency}" is missing from libraries`,
      );
    }
  }
}

const metadataWithoutPackage = fs
  .readdirSync(examplesDirectory)
  .filter(
    (name) =>
      fs.existsSync(path.join(examplesDirectory, name, "pmndrs.json")) &&
      !fs.existsSync(path.join(examplesDirectory, name, "package.json")),
  );

for (const exampleName of metadataWithoutPackage) {
  addError(exampleName, "pmndrs.json has no matching package.json");
}

if (errors.length > 0) {
  console.error(`Metadata validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated metadata for ${exampleNames.length} examples.`);
