import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

/**
 * ESLint for `examples/*`, which had none: `pnpm lint` walked 161 packages and
 * ran eslint in `apps/website` alone. That app keeps its own config; this one
 * is deliberately the whole of the examples' setup, so an example stays
 * copy-pasteable into a sandbox without lint scaffolding of its own.
 *
 * Only `{ts,tsx}` is matched, which is every example since #164 -- and is why
 * nothing ignores the build output or the vendored draco decoders: both are
 * plain `.js`, so they are never picked up in the first place.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  /* Vendored, and pre-annotated for someone else's config. */
  { ignores: ["**/realism-effects/"] },
  {
    files: ["examples/**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      /* No rules enabled: a gltfjsx file disables `ban-ts-comment` next to its
         `@ts-nocheck`, and an `eslint-disable` naming a rule ESLint cannot
         resolve is a hard error. */
      "@typescript-eslint": tseslint.plugin,
    },
    languageOptions: { parser: tseslint.parser },
    linterOptions: {
      /* ...and registering it leaves that directive unused, which is its own
         report. Examples arrive carrying `eslint-disable` comments written
         against their authors' configs; measured against this one they say
         nothing about the example. */
      reportUnusedDisableDirectives: "off",
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",

      /* Warn: the 81 existing violations are not safely fixable while the repo
         has 3 screenshot baselines for 161 examples -- adding a missing dep can
         restart or loop an animation, visibly and silently. Not an allowance
         though: `lint:examples` caps warnings at 81, so the next one fails.
         Fixing one means lowering that number in the same commit. */
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    /* A higher-order component: it returns the component that calls the hook,
       which the rule reads as a callback. Off here rather than in the file, as
       `apps/website` does for `hooks/use-mobile.ts`. */
    files: ["examples/racing-game/src/useToggle.tsx"],
    rules: { "react-hooks/rules-of-hooks": "off" },
  },
];
