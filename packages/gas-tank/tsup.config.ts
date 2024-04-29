import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "mud.config": "mud.config.ts",
  },
  target: "esnext",
  format: ["esm", "cjs"],
  dts: false, // # TODO
  sourcemap: true,
  clean: true,
  minify: true,
});
