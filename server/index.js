// Point d'entrée du serveur Express : `node server/index.js`.
import { creerApp } from './app.js';

const port = process.env.PORT || 3001;

creerApp().listen(port, () => {
  console.log(`API EventSphere à l'écoute sur http://localhost:${port}`);
});
