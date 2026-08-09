import path from "node:path";

const root = import.meta.dirname;

// The `**/*.{ts,tsx,md}` of the `format` script, as a test on one path.
const FORMAT_SCRIPT_SCOPE = /\.(ts|tsx|md)$/;

// Outside `examples/*` the hook formats everything; inside, only what the
// `format` script covers -- which there is the whole of what is kept
// formatted (544 files, 3 of them currently drifting). The `.js`, `.jsx` and
// `.css` of a sandbox are vendored source still on the upstream style they
// were copied with, each example carrying its own `.prettierrc` it isn't
// formatted to, so reformatting one on commit would bury a two-line change
// under a whole-file diff. This can't move to `.prettierignore`: gitignore
// semantics can't re-include a path once its directory is excluded, so
// ignoring `examples/**` would take those 544 files away from `pnpm format`
// as well.
const formattable = (file) =>
  !file.startsWith("examples/") || FORMAT_SCRIPT_SCOPE.test(file);

/** @type {import("lint-staged").Configuration} */
export default {
  "*": (files) => {
    const staged = files
      .map((file) => path.relative(root, file))
      .filter(formattable);

    return [
      // `--ignore-unknown` so the glob can stay `*`: prettier skips what it
      // has no parser for (assets, patches) instead of failing the commit.
      ...(staged.length
        ? [
            `prettier --write --ignore-unknown ${staged.map((file) => JSON.stringify(file)).join(" ")}`,
          ]
        : []),

      // Every linter the repo has (eslint per workspace, the `pmndrs.json`
      // metadata check, syncpack), on every commit rather than under globs of
      // our own: what needs re-running is a question turbo answers from each
      // task's declared `inputs`, and answers better -- a commit that moved
      // nothing lint-relevant is ~0.5s instead of ~4.5s. Sequenced after
      // prettier -- same array -- because it reads the files prettier just
      // rewrote.
      "pnpm lint",
    ];
  },
};
