import path from "node:path";

const root = import.meta.dirname;

/** @type {import("lint-staged").Configuration} */
export default {
  // `examples/*` are vendored sandboxes: each one carries its own prettier
  // config (a `.prettierrc`, or a `prettier` key in its `package.json`) and
  // most of them are not formatted to it. Reformatting one on commit would
  // bury a two-line change under a whole-file diff, so the hook leaves them
  // to their upstream style -- `pnpm format` is still there to opt in.
  "*": (files) => {
    const staged = files
      .map((file) => path.relative(root, file))
      .filter((file) => !file.startsWith("examples/"));

    if (staged.length === 0) return [];

    // `--ignore-unknown` so the glob can stay `*`: prettier skips what it has
    // no parser for (assets, patches) instead of failing the commit.
    return `prettier --write --ignore-unknown ${staged.map((file) => JSON.stringify(file)).join(" ")}`;
  },

  // Repo-wide invariants, so they run whole rather than over the staged files:
  // both are ~1s and mirror what CI checks.
  "{package.json,pmndrs.json}": () => [
    "node bin/validate-pmndrs-metadata.mjs",
    "pnpm exec syncpack lint",
  ],
};
