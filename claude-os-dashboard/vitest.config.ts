import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    // server-only is a build-time guard; stub it so pure logic is unit-testable.
    alias: { "server-only": path.resolve(__dirname, "test/stubs/server-only.ts") },
  },
});
