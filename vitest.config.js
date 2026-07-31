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
    coverage: {
      provider: 'v8',
      // On mesure la logique testable par Vitest (le front React est couvert
      // par les tests e2e Playwright, pas ici).
      include: ['src/**/*.mjs', 'server/**/*.js'],
      // index.js n'est qu'un point d'entrée (démarre le serveur).
      exclude: ['server/index.js'],
      all: true,
      // 'lcov' -> coverage/lcov.info, consommé par SonarCloud.
      reporter: ['text', 'html', 'lcov'],
    },
  },
});
