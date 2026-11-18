import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["app/dashboard/**/*.test.ts"],
  },
});
