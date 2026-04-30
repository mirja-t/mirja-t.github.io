import { defineConfig } from "vite";
import path from "path";

// vite.config.js or vite.config.ts
export default defineConfig(({ command }) => ({
    base: command === "build" ? "/mirja-tschakarov.de/" : "/",
    build: {
        outDir: "docs",
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
}));
