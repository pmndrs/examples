#!/usr/bin/env node

/**
 * Catalog Helper Script
 * 
 * This script helps manage the centralized package catalog.
 * It ensures that the catalog and overrides fields stay in sync.
 */

const fs = require('fs');
const path = require('path');

const rootPackageJsonPath = path.join(__dirname, '..', 'package.json');

function loadPackageJson() {
  const content = fs.readFileSync(rootPackageJsonPath, 'utf8');
  return JSON.parse(content);
}

function savePackageJson(pkg) {
  fs.writeFileSync(rootPackageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}

function verifyCatalogSync() {
  const pkg = loadPackageJson();
  
  if (!pkg.catalog || !pkg.overrides) {
    console.error('❌ Error: Both "catalog" and "overrides" fields must exist in package.json');
    process.exit(1);
  }

  const catalogKeys = Object.keys(pkg.catalog).sort();
  const overridesKeys = Object.keys(pkg.overrides).sort();

  // Check if keys match
  const keysMatch = JSON.stringify(catalogKeys) === JSON.stringify(overridesKeys);
  
  if (!keysMatch) {
    console.error('❌ Error: catalog and overrides keys do not match!');
    console.error('\nIn catalog but not in overrides:');
    catalogKeys.filter(k => !overridesKeys.includes(k)).forEach(k => console.error(`  - ${k}`));
    console.error('\nIn overrides but not in catalog:');
    overridesKeys.filter(k => !catalogKeys.includes(k)).forEach(k => console.error(`  - ${k}`));
    process.exit(1);
  }

  // Check if versions match
  let allMatch = true;
  for (const key of catalogKeys) {
    if (pkg.catalog[key] !== pkg.overrides[key]) {
      if (allMatch) {
        console.error('❌ Error: Version mismatches found:');
        allMatch = false;
      }
      console.error(`  ${key}:`);
      console.error(`    catalog:   ${pkg.catalog[key]}`);
      console.error(`    overrides: ${pkg.overrides[key]}`);
    }
  }

  if (!allMatch) {
    process.exit(1);
  }

  console.log('✅ Catalog and overrides are in sync!');
  console.log(`   ${catalogKeys.length} packages are centrally managed.`);
}

function listCatalog() {
  const pkg = loadPackageJson();
  
  if (!pkg.catalog) {
    console.error('❌ Error: No catalog found in package.json');
    process.exit(1);
  }

  console.log('📦 Centralized Package Catalog:\n');
  
  const entries = Object.entries(pkg.catalog).sort((a, b) => a[0].localeCompare(b[0]));
  
  const maxLength = Math.max(...entries.map(([name]) => name.length));
  
  entries.forEach(([name, version]) => {
    console.log(`  ${name.padEnd(maxLength)}  ${version}`);
  });
  
  console.log(`\n  Total: ${entries.length} packages`);
}

function showUsage() {
  console.log(`
Catalog Helper Script

Usage:
  npm run catalog:verify    Verify catalog and overrides are in sync
  npm run catalog:list      List all cataloged packages

Examples:
  npm run catalog:verify
  npm run catalog:list
`);
}

// Main
const command = process.argv[2];

switch (command) {
  case 'verify':
    verifyCatalogSync();
    break;
  case 'list':
    listCatalog();
    break;
  default:
    showUsage();
    process.exit(1);
}
