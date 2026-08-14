#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

/** Every identifier the example's own `src/` imports, across all of its files. */
function importsOf(exampleDirectory) {
  const identifiers = new Set();

  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
        for (const identifier of importedIdentifiers(
          fs.readFileSync(absolute, "utf8"),
        )) {
          identifiers.add(identifier);
        }
      }
    }
  };

  walk(path.join(exampleDirectory, "src"));
  return identifiers;
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
  if (typeof metadata.description !== "string") {
    addError(exampleName, '"description" must be a string');
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
