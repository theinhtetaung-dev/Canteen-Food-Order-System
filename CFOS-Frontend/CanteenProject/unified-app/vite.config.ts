import path from "path";
import tailwindcss from "@tailwindcss/vite";

import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@furniture": path.resolve(import.meta.dirname, "./src/furniture"),
      "@admin": path.resolve(import.meta.dirname, "./src/admin"),
      "@superadmin": path.resolve(import.meta.dirname, "./src/superadmin"),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    watch: {
      usePolling: true,
    },
    proxy: {
      "/api": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
    },
  },
});
