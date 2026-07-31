import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Le front React vit dans client/. Le build est généré dans dist/ (servi
// par nginx en production).
export default defineConfig({
  root: 'client',
  plugins: [react()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  // En dev, le front (5173) et l'API (3001) sont sur deux ports : on proxifie
  // /api vers Express pour rester en même origine (comme en production).
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:3001' },
  },
  preview: { port: 4173 },
});
