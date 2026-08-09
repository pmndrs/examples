import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

/**
 * Flat config — the only format `@next/eslint-plugin-next` ships as of Next 16,
 * and what ESLint 10 will keep. Replaces the `.eslintrc.json` that
 * `next lint` (removed in 16) used to find on its own; `pnpm lint` now runs
 * the ESLint CLI directly.
 *
 * @type {import('eslint').Linter.Config[]}
 */
const config = [
  { ignores: [".next/**", "out/**", "next-env.d.ts"] },
  ...nextCoreWebVitals,
  {
    rules: {
      /* New in eslint-plugin-react-hooks 7, which `eslint-config-next@16`
         pulls in. It fires on effects that seed state from the DOM or from
         the URL on mount -- exactly what `Nav`'s sidebar/search sync and
         `use-mobile` do. Untangling those is a real refactor, not part of the
         framework bump, so keep them visible as warnings for now. */
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default config;
