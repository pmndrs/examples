import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

/**
 * ESLint for `examples/*`. `apps/website` keeps its own config (Next's
 * `core-web-vitals`); this one exists because the examples had none at all --
 * `pnpm lint` walked 161 packages and ran eslint in exactly one of them.
 *
 * One config at the root rather than a file plus two devDependencies in each
 * of the 161 examples: an example is a teaching artifact people copy out to a
 * sandbox, and lint scaffolding is not part of what it teaches. Prettier is
 * already handled this way -- one `prettier.config.mjs` for the whole repo.
 *
 * Scope is the react-hooks plugin only. `js.configs.recommended` on 161
 * examples authored by 161 people is a separate conversation; hook
 * dependencies are the one class of bug that silently changes what an example
 * *renders*, which is the whole product here.
 *
 * @type {import('eslint').Linter.Config[]}
 */
const config = [
  {
    /* Vendored payloads, same set `.prettierignore` names and for the same
       reason: not ours, and kept byte-identical to upstream. `realism-effects`
       alone accounts for 128 unused-`eslint-disable`-directive reports -- it
       arrives pre-annotated for a config that is not this one. */
    ignores: ["**/realism-effects/", "**/draco*/", "**/dist/"],
  },
  {
    files: ["examples/**/*.{js,jsx,ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    linterOptions: {
      /* Off, and only here. Examples arrive from their authors' sandboxes
         carrying `eslint-disable` comments written against *their* configs;
         measured against this one those read as "unused directive", which
         says nothing about the example and would have us edit code we copied
         on purpose. */
      reportUnusedDisableDirectives: "off",
    },
    rules: {
      /* Error: a conditional or nested hook is broken React, not a matter of
         taste. One documented exception below, so this ratchets. */
      "react-hooks/rules-of-hooks": "error",

      /* Warn, deliberately. 58 violations across 38 examples, none of them
         auto-fixable, and the repo has 3 committed screenshot baselines for
         161 examples -- so a fix that restarts an animation or re-runs an
         imperative mount effect would land unnoticed. Surfacing them is step
         one; correcting them is per-example work with a baseline to check
         against. Raise this to "error" once that backlog is closed. */
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    files: ["examples/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    /* Seven examples are written in TypeScript (racing-game and flow-shield
       between them are most of it). The parser is used for syntax only -- no
       `projectService`, so no per-example `tsconfig` resolution and no
       type-aware rules to pay for. */
    files: ["examples/**/*.{ts,tsx}"],
    /* Registered, no rules enabled. A gltfjsx-generated file disables
       `@typescript-eslint/ban-ts-comment` next to its `@ts-nocheck`, and an
       `eslint-disable` naming a rule ESLint cannot resolve is a hard error --
       so the plugin has to be *known* here even though we turn none of it
       on. */
    plugins: { "@typescript-eslint": tseslint.plugin },
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
  {
    /* `useToggle` is a higher-order component: it returns the component that
       calls the hook, so the call is legal React the rule cannot see -- it
       reads the returned arrow as a callback. Scoped off here rather than
       with an `eslint-disable` in the file, the way `apps/website` keeps
       `hooks/use-mobile.ts` stock: the example stays the code we meant to
       ship. */
    files: ["examples/racing-game/src/useToggle.tsx"],
    rules: { "react-hooks/rules-of-hooks": "off" },
  },
];

export default config;
