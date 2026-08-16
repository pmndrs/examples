#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const examplesDirectory = path.join(root, "examples");
const schemaPath = path.join(root, "schemas", "pmndrs.schema.json");
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const allowedLibraries = new Set(schema.properties.libraries.items.enum);
const allowedTags = new Set(schema.properties.tags.items.enum);
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

  /* The vocabulary is closed, and an unknown tag is not a spelling nit: a tag
     is a filter now, so `gtlf` is a pill that returns nothing. Adding a term is
     a line in the schema, in the same pull request as the example that needs
     it -- and because every `pmndrs.json` points `$schema` at that file, the
     editor offers the list while it is being typed. */
  if (isStringArray(metadata.tags)) {
    if (metadata.tags.length === 0) {
      addError(exampleName, '"tags" must carry at least one tag');
    }
    for (const tag of metadata.tags) {
      if (!allowedTags.has(tag)) {
        addError(exampleName, `unknown tag "${tag}"`);
      }
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
