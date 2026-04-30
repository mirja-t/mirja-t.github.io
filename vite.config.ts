import { defineConfig } from "vite";
import path from "path";

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
}));
