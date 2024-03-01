import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    faucet: "ts/faucet/index.ts",
  },
  target: "esnext",
  format: ["esm", "cjs"],
  dts: !process.env.TSUP_SKIP_DTS,
  sourcemap: true,
  clean: true,
});
