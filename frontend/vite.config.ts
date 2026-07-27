import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
    server: {
      proxy: {
        "/auth": { target: "http://127.0.0.1:4000", changeOrigin: true },
        "/accounts": { target: "http://127.0.0.1:4000", changeOrigin: true },
        "/debts": { target: "http://127.0.0.1:4000", changeOrigin: true },
        "/choir": { target: "http://127.0.0.1:4000", changeOrigin: true },
        "/documents": { target: "http://127.0.0.1:4000", changeOrigin: true },
        "/music": { target: "http://127.0.0.1:4000", changeOrigin: true },
        "/notifications": { target: "http://127.0.0.1:4000", changeOrigin: true },
        "/analytics": { target: "http://127.0.0.1:4000", changeOrigin: true },
        "/api/chatbot": { target: "http://127.0.0.1:4000", changeOrigin: true },
      },
    },
  },
});
