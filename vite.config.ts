import { defineConfig } from "vite";

export default defineConfig({
    root: "src",
    build: {
        target: "esnext",
        minify: "terser",
        outDir: "../dist",
        assetsDir: "static",
        emptyOutDir: true,
        sourcemap: true,
    },
});

