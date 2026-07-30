import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // On limite Vitest aux fichiers *.test.js pour éviter de récupérer
    // les specs Playwright qui utilisent l'extension *.spec.js
    include: ["tests/unit/**/*.test.js"],
    exclude: ["node_modules", "test-results", "features"],
    environment: "node",
    globals: true,
  },
});
