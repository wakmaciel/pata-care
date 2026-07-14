import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// base "./" mantém todos os caminhos relativos — exigência do GitHub Pages
// em subdiretório (https://usuario.github.io/pata-care/).
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
    },
  },
  build: {
    target: "es2020",
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        // Separa bibliotecas grandes em chunks próprios: melhora o cache entre
        // deploys (o vendor só muda quando as dependências mudam).
        manualChunks: {
          react: ["react", "react-dom"],
          motion: ["framer-motion"],
          forms: ["react-hook-form", "zod", "@hookform/resolvers/zod"],
        },
      },
    },
  },
});
