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
  server: { port: 5173 },
  preview: { port: 4173 },
});
