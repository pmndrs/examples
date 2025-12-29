# Package Version Catalog

This document explains how to use the centralized package version management in this monorepo, which provides an npm equivalent to pnpm's catalog feature.

## Overview

The root `package.json` uses npm's native `overrides` field to enforce consistent package versions across all 150+ workspace packages (demos, apps, and packages).

## Structure

### `catalog` Field (Documentation)

The `catalog` field in the root `package.json` serves as a single source of truth for documenting centralized package versions:

```json
{
  "catalog": {
    "react": "^19.2.3",
    "three": "^0.182.0",
    "@react-three/fiber": "^9.4.2",
    "..."
  }
}
```

**Note**: The `catalog` field is not a standard npm feature, but rather a documentation convention. The actual enforcement happens via the `overrides` field.

### `overrides` Field (Enforcement)

The `overrides` field contains the same versions as the catalog and is what npm actually uses to enforce versions:

```json
{
  "overrides": {
    "react": "^19.2.3",
    "three": "^0.182.0",
    "@react-three/fiber": "^9.4.2",
    "..."
  }
}
```

When npm installs dependencies, it ensures that all workspace packages use these exact versions, regardless of what's specified in their individual `package.json` files.

## Benefits

1. **Single Source of Truth**: Update a package version once in the root `package.json`
2. **Consistency**: All workspaces use the same versions of core dependencies
3. **Simplified Maintenance**: No need to update 150+ individual `package.json` files
4. **Conflict Prevention**: Avoids version conflicts and peer dependency issues
5. **Deduplication**: npm automatically deduplicates packages, reducing node_modules size

## How to Update a Package Version

To update a centralized package across all workspaces:

1. **Update both fields** in the root `package.json`:
   ```json
   {
     "catalog": {
       "react": "^19.3.0"  // Update here
     },
     "overrides": {
       "react": "^19.3.0"  // And here
     }
   }
   ```

2. **Reinstall dependencies**:
   ```bash
   npm install
   ```

3. **Test your changes**:
   ```bash
   npm run build
   npm test
   ```

## Centralized Packages

The following packages are currently centralized (as of the latest update):

### Core Dependencies
- `react` & `react-dom` - React framework
- `three` - Three.js 3D library
- `@react-three/fiber` - React renderer for Three.js
- `@react-three/drei` - Useful helpers for R3F
- `@react-three/postprocessing` - Postprocessing effects
- `@react-three/rapier` - Physics engine
- `@react-three/cannon` - Alternative physics engine
- `@react-spring/three` - Spring animations

### Utility Libraries
- `@pmndrs/branding` - Pmndrs branding assets
- `@pmndrs/assets` - Shared assets
- `leva` - GUI controls
- `maath` - Math utilities
- `valtio` - State management
- `lamina` - Shader materials
- `three-stdlib` - Three.js standard library

### Dev Dependencies
- `@types/react` & `@types/react-dom` - TypeScript types for React
- `@types/three` - TypeScript types for Three.js
- `@vitejs/plugin-react` - Vite React plugin
- `vite` - Build tool
- `typescript` - TypeScript compiler

## Verifying Overrides

To verify that overrides are being applied correctly:

```bash
# Check what version of a package is being used
npm list react

# Check for all workspaces (you'll see "deduped" entries)
npm list react --all
```

When you see "deduped" in the output, it means npm is successfully using a single centralized version.

## Comparison with pnpm Catalog

### pnpm Approach

```json
{
  "pnpm": {
    "catalog": {
      "react": "^19.2.3"
    }
  }
}
```

In workspace packages:
```json
{
  "dependencies": {
    "react": "catalog:"
  }
}
```

### npm Approach (This Repository)

Root `package.json`:
```json
{
  "catalog": {
    "react": "^19.2.3"
  },
  "overrides": {
    "react": "^19.2.3"
  }
}
```

Workspace packages keep their normal declarations:
```json
{
  "dependencies": {
    "react": "^19.2.3"
  }
}
```

The key difference: with npm, you maintain version declarations in workspace packages (for standalone use), but the root overrides ensure consistency when working in the monorepo.

## FAQ

### Q: Can individual workspaces override these versions?

**A**: No. The `overrides` field in the root `package.json` takes precedence. This is intentional to maintain consistency across the monorepo.

### Q: What if I need a different version for a specific workspace?

**A**: You would need to either:
1. Remove that package from the centralized overrides (affecting all workspaces)
2. Use a different package name or alias
3. Refactor to make the specific requirement compatible with the centralized version

### Q: Why duplicate the versions in both `catalog` and `overrides`?

**A**: The `catalog` field is for documentation and potential future tooling. The `overrides` field is what npm actually enforces. Keeping them in sync ensures the documentation matches reality.

### Q: Do I need to update individual workspace `package.json` files?

**A**: Not necessarily. The overrides will take effect regardless of what's in the workspace files. However, it's good practice to keep them up-to-date for:
- Documentation purposes
- If a workspace is ever used standalone (outside the monorepo)
- IDE/editor intellisense and tooling

## Additional Resources

- [npm overrides documentation](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#overrides)
- [npm workspaces documentation](https://docs.npmjs.com/cli/v9/using-npm/workspaces)
- [pnpm catalog documentation](https://pnpm.io/catalogs)
