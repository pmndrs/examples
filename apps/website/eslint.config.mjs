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
    /* Vendored by the shadcn CLI and kept stock, so `shadcn diff` stays a
       review rather than a merge: what the registry ships is not ours to lint.
       It seeds its state from `matchMedia` on mount, which
       `react-hooks/set-state-in-effect` — new in eslint-plugin-react-hooks 7,
       pulled in by `eslint-config-next@16`, and an error by default — reports.
       Everything this app writes itself answers to the rule. */
    files: ["hooks/use-mobile.ts"],
    rules: { "react-hooks/set-state-in-effect": "off" },
  },
];

export default config;
