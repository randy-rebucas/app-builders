import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    splitting: false,
  },
  {
    entry: { "appbuilders-badge": "src/index.ts" },
    format: ["iife"],
    globalName: "AppBuildersBadge",
    dts: false,
    sourcemap: true,
    clean: false,
    minify: true,
    treeshake: true,
    splitting: false,
    outExtension: () => ({ js: ".global.js" }),
  },
]);
