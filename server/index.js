// Point d'entrée : un seul service qui sert l'API ET le front React buildé.
// `node server/index.js`
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { creerApp } from './app.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, '..', 'dist');
const port = process.env.PORT || 3001;

const app = creerApp();

// Sert les fichiers statiques du build Vite (js/css/index.html).
app.use(express.static(distPath));

// Fallback SPA : toute route hors /api renvoie index.html.
app.get(/^(?!\/api\/).*/, (req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`EventSphere à l'écoute sur http://localhost:${port}`);
});
