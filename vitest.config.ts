import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [],
  test: {
    testTimeout: 290000, // 290 seconds per test
    include: ["**/*.test.{ts,tsx,js,jsx}"],
    clearMocks: true,
    globals: true,
    setupFiles: ["dotenv/config", "./scripts/ci-test-setup.ts"],
    coverage: {
      provider: "istanbul",
      include: ["src/lib/**/*"],
    },
  },
});
