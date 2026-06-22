import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

/**
 * Standalone web-app build (no @crxjs / no manifest). Builds the same React app
 * as the extension, but as a normal SPA into `dist-web/`, which you can deploy
 * to any static host. The app detects it is not running as an extension and
 * switches to the full-screen web layout automatically.
 */
export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist-web",
    emptyOutDir: true,
  },
  server: {
    port: 5174,
    strictPort: true,
  },
});
