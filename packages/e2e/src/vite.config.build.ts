import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import monkeyPatch from "./vite-plugin-monkey";

export default defineConfig({
  plugins: [react(), monkeyPatch()],
});
