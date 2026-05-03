import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// vite.config.js or vite.config.ts
export default defineConfig(({ command }) => ({
    base: "/",
    build: {
        outDir: "docs",
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    rollupOptions: {
        input: {
            main: path.resolve(__dirname, "index.html"),
            imprint: path.resolve(__dirname, "imprint.html"),
        },
    },
}));
