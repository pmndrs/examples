/** @type {import("prettier").Config} */
export default {
  plugins: ["prettier-plugin-tailwindcss"],
  // Tailwind v4 reads its config from the CSS entrypoint, not a JS config.
  tailwindStylesheet: "./apps/website/app/globals.css",

  overrides: [
    {
      // Replaces the 160 `.prettierrc` the examples carried, one per sandbox:
      // 23 distinct variants of the same intent, including a `printWidth` of
      // 16078 and a `fluid` option prettier has never had. The values below
      // are the majority of that set, so the demos keep reading the way they
      // were written -- wide lines, no semicolons -- while there is a single
      // place left to change them.
      files: "examples/**",
      options: {
        printWidth: 160,
        semi: false,
        singleQuote: true,
        trailingComma: "none",
        bracketSameLine: true,
      },
    },
  ],
};
