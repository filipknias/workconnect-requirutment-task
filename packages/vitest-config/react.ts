import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, mergeConfig } from "vitest/config";
import { baseConfig } from "@repo/vitest-config/base";

export const reactConfig = mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [react()],
    resolve: { tsconfigPaths: true },
    test: {
      environment: "jsdom",
      setupFiles: [fileURLToPath(new URL("./setup.ts", import.meta.url))],
    },
  }),
);
