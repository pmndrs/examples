import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import monkeyPatch from "./vite-plugin-monkey";
import head from "./vite-plugin-head";

export default defineConfig({
  plugins: [react(), monkeyPatch(), head()],
  resolve: {
    dedupe: ["three", "postprocessing"],
  },
});
