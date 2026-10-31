import { defineConfig } from "vitest/config";
export default defineConfig({ test: { environment: "jsdom", include: ["packages/**/*.test.{ts,tsx}", "apps/site/src/**/*.test.{ts,tsx}"], setupFiles: ["./vitest.setup.ts"], maxWorkers: 2 } });
