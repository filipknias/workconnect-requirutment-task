import { defineConfig } from "vitest/config";

export const baseConfig = defineConfig({
  test: {
    // Testing Library's auto-cleanup needs global `afterEach`; without it the DOM leaks between tests.
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
