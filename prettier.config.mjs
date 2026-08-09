/** @type {import("prettier").Config} */
export default {
  plugins: ["prettier-plugin-tailwindcss"],
  // Tailwind v4 reads its config from the CSS entrypoint, not a JS config.
  tailwindStylesheet: "./apps/website/app/globals.css",
};
