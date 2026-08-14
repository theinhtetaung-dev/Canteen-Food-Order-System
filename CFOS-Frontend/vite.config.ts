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
      "@user": path.resolve(import.meta.dirname, "./src/user"),
      "@admin": path.resolve(import.meta.dirname, "./src/admin"),
      "@superadmin": path.resolve(import.meta.dirname, "./src/superadmin"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8081",
        changeOrigin: true,
      },
    },
  },
});
