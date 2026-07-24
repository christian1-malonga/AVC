import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Pure SPA build — no SSR, no TanStack Start server.
// Used for static hosting on Netlify / similar platforms.
export default defineConfig({
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    react(),
    tsconfigPaths(),
  ],
  css: {
    // Use postcss transformer — lightningcss can't parse Tailwind v4 source() syntax
    transformer: "postcss",
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    // Disable CSS minification — lightningcss & esbuild both fail on Tailwind v4
    cssMinify: false,
    rollupOptions: {
      input: "index.spa.html",
    },
  },
});

