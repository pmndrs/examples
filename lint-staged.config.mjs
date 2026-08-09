import path from "node:path";

const root = import.meta.dirname;

// Inside `examples/*`, only what `pnpm format` (`**/*.{ts,tsx,md}`) already
// keeps in shape. The rest -- the `.jsx`, `.js`, `.css` of every sandbox --
// is vendored source still on its upstream style, each example carrying its
// own `.prettierrc` it isn't formatted to; reformatting one on commit would
// bury a two-line change under a whole-file diff. This can't live in
// `.prettierignore`: that would take those files away from `pnpm format`
// too, which is a repo-wide policy change rather than a hook decision.
const FORMATTED_IN_EXAMPLES = /\.(tsx?|md)$/;

/** @type {import("lint-staged").Configuration} */
export default {
  "*": (files) => {
    const staged = files
      .map((file) => path.relative(root, file))
      .filter(
        (file) =>
          !file.startsWith("examples/") || FORMATTED_IN_EXAMPLES.test(file),
      );

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
