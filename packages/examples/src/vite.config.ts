import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import cheesyCanvas from "./vite-plugin-cheesy-canvas";

export default defineConfig({
  plugins: [react(), cheesyCanvas()],
});
