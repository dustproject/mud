import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "bin/postgres-frontend.ts",
    "bin/postgres-indexer.ts",
    "bin/postgres-decoded-indexer.ts",
    "bin/sqlite-indexer.ts",
  ],
  target: "esnext",
  format: ["esm", "cjs"],
  dts: !process.env.TSUP_SKIP_DTS,
  sourcemap: true,
  clean: true,
  minify: true,
});
