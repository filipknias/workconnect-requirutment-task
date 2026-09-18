import { defineConfig, mergeConfig } from "vitest/config";
import { reactConfig } from "@repo/vitest-config/react";

/**
 * The shared config collects `tests/**` only. `apps/web` keeps its feature
 * tests inside the feature they belong to, so the app adds that pattern on top
 * — `mergeConfig` concatenates arrays, so the workspace-level `tests/` glob
 * (route tests) stays live alongside it.
 */
export default mergeConfig(
  reactConfig,
  defineConfig({
    test: {
      include: ["src/**/*.test.{ts,tsx}"],
    },
  }),
);
