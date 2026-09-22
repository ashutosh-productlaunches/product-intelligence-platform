// Vitest configuration.
// Runs the unit tests in /tests. They exercise pure functions only,
// so they need no network access and no API key.
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    // Mirrors the "@/*" path alias in tsconfig.json,
    // so tests can import "@/nodes/suitability" the same way app code does.
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
