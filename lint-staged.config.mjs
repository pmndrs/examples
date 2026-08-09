import path from "node:path";

const root = import.meta.dirname;

/** @type {import("lint-staged").Configuration} */
export default {
  "*": (files) => {
    const staged = files.map((file) => path.relative(root, file));

    return [
      // Every staged file, `examples/*` included -- formatting is the hook's
      // to guarantee, not something to leave to a `pnpm format` nobody runs.
      // Each example keeps its own `.prettierrc`, so a sandbox is formatted
      // to the style it was written in. `--ignore-unknown` skips what has no
      // parser (`.glb`, fonts, images) instead of failing the commit; what
      // prettier *does* have a parser for but must not touch is named in
      // `.prettierignore`.
      `prettier --write --ignore-unknown ${staged.map((file) => JSON.stringify(file)).join(" ")}`,

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
