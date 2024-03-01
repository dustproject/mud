import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["ts/index.ts", "ts/gas-report.ts"],
  target: "esnext",
  format: ["esm", "cjs"],
  dts: !process.env.TSUP_SKIP_DTS,
  sourcemap: true,
  clean: true,
  minify: true,
});
