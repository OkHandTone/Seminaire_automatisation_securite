import { defineConfig } from 'vitest/config';

export default defineConfig({
  // On force la racine du projet pour ne pas hériter du root "client"
  // défini dans vite.config.js.
  root: '.',
  test: {
    include: ['tests/{unit,integration}/**/*.test.js'],
    exclude: ['node_modules', 'dist', 'test-results'],
    environment: 'node',
    globals: true,
  },
});
