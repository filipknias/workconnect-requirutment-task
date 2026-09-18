import { defineConfig } from "vitest/config";

/**
 * Settings shared by every workspace. `globals: true` is not a convenience —
 * Testing Library only registers its automatic `cleanup` hook when the global
 * `afterEach` exists, so turning it off leaks the DOM between tests.
 */
export const baseConfig = defineConfig({
  test: {
    globals: true,
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
