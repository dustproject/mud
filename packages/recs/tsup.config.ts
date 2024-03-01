import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/deprecated/index.ts"],
  target: "esnext",
  format: ["esm", "cjs"],
  dts: !process.env.TSUP_SKIP_DTS,
  sourcemap: true,
  clean: true,
  minify: true,
});
