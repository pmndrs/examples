#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const demosDirectory = path.join(root, "demos");
const schemaPath = path.join(root, "schemas", "pmndrs.schema.json");
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const allowedLibraries = new Set(schema.properties.libraries.items.enum);
const githubLoginPattern = new RegExp(
  schema.properties.maintainers.items.pattern,
);
const requiredFields = new Set(schema.required);
const allowedFields = new Set(Object.keys(schema.properties));
const allowedAssetFields = new Set(Object.keys(schema.$defs.asset.properties));
const legacyPackageFields = ["description", "homepage", "keywords"];
const errors = [];

function addError(demoName, message) {
  errors.push(`${demoName}: ${message}`);
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

const demoNames = fs
  .readdirSync(demosDirectory)
  .filter((name) =>
    fs.existsSync(path.join(demosDirectory, name, "package.json")),
  )
  .sort();

for (const demoName of demoNames) {
  const demoDirectory = path.join(demosDirectory, demoName);
  const packagePath = path.join(demoDirectory, "package.json");
  const metadataPath = path.join(demoDirectory, "pmndrs.json");
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

  if (!fs.existsSync(metadataPath)) {
    addError(demoName, "missing pmndrs.json");
    continue;
  }

  let metadata;
  try {
    metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
  } catch (error) {
    addError(demoName, `invalid JSON (${error.message})`);
    continue;
  }

  for (const field of requiredFields) {
    if (!(field in metadata)) addError(demoName, `missing "${field}"`);
  }
  for (const field of Object.keys(metadata)) {
    if (!allowedFields.has(field)) {
      addError(demoName, `unknown field "${field}"`);
    }
  }

  if (metadata.$schema !== "../../schemas/pmndrs.schema.json") {
    addError(demoName, 'invalid "$schema" path');
  }
  if (typeof metadata.title !== "string" || metadata.title.length === 0) {
    addError(demoName, '"title" must be a non-empty string');
  }
  if (typeof metadata.description !== "string") {
    addError(demoName, '"description" must be a string');
  }

  for (const field of ["tags", "authors", "maintainers", "libraries"]) {
    if (!isStringArray(metadata[field])) {
      addError(demoName, `"${field}" must contain non-empty strings`);
    } else if (hasDuplicates(metadata[field])) {
      addError(demoName, `"${field}" contains duplicates`);
    }
  }
  for (const login of metadata.maintainers ?? []) {
    if (typeof login === "string" && !githubLoginPattern.test(login)) {
      addError(demoName, `"maintainers" entry "${login}" is not a GitHub login`);
    }
  }

  if (!isUrl(metadata.source)) {
    addError(demoName, '"source" must be an HTTP(S) URL');
  }
  if (metadata.publishedAt !== undefined && !isDate(metadata.publishedAt)) {
    addError(demoName, '"publishedAt" must use YYYY-MM-DD');
  }

  const dependencies = packageJson.dependencies ?? {};
  for (const library of metadata.libraries ?? []) {
    if (!allowedLibraries.has(library)) {
      addError(demoName, `unknown library "${library}"`);
    }
    if (!(library in dependencies)) {
      addError(demoName, `library "${library}" is not listed in dependencies`);
    }
  }

  if (!Array.isArray(metadata.assets)) {
    addError(demoName, '"assets" must be an array');
  } else {
    metadata.assets.forEach((asset, index) => {
      if (!asset || typeof asset !== "object" || Array.isArray(asset)) {
        addError(demoName, `asset ${index} must be an object`);
        return;
      }
      if (typeof asset.name !== "string" || asset.name.length === 0) {
        addError(demoName, `asset ${index} requires a name`);
      }
      for (const field of Object.keys(asset)) {
        if (!allowedAssetFields.has(field)) {
          addError(demoName, `asset ${index} has unknown field "${field}"`);
        }
      }
      if (
        asset.files !== undefined &&
        (!isStringArray(asset.files) || hasDuplicates(asset.files))
      ) {
        addError(demoName, `asset ${index} "files" must contain unique paths`);
      }
      for (const field of ["source", "licenseUrl"]) {
        if (asset[field] !== undefined && !isUrl(asset[field])) {
          addError(demoName, `asset ${index} "${field}" must be a URL`);
        }
      }
    });
  }

  for (const field of legacyPackageFields) {
    if (field in packageJson) {
      addError(
        demoName,
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
        demoName,
        `dependency "${dependency}" is missing from libraries`,
      );
    }
  }
}

const metadataWithoutPackage = fs
  .readdirSync(demosDirectory)
  .filter(
    (name) =>
      fs.existsSync(path.join(demosDirectory, name, "pmndrs.json")) &&
      !fs.existsSync(path.join(demosDirectory, name, "package.json")),
  );

for (const demoName of metadataWithoutPackage) {
  addError(demoName, "pmndrs.json has no matching package.json");
}

if (errors.length > 0) {
  console.error(`Metadata validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated metadata for ${demoNames.length} demos.`);
