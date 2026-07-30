// API Express d'inscription à un événement EventSphere.
// L'app est exportée séparément du serveur qui écoute, pour pouvoir la
// tester directement avec supertest (tests d'intégration).

import express from 'express';
import { validerInscription } from '../src/inscription.mjs';

export function creerApp() {
  const app = express();

  // Corps JSON limité à 100 Ko : garde-fou anti-abus.
  app.use(express.json({ limit: '100kb' }));

  // CORS minimal : autorise le front (servi sur un autre port) à appeler l'API.
  app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  // Stockage en mémoire : l'appli est éphémère, liée à la durée de l'événement.
  const inscriptions = [];

  // Sonde de santé, utile pour les déploiements (Render/Docker).
  app.get('/api/sante', (req, res) => {
    res.json({ statut: 'ok' });
  });

  // Liste des inscrits — sans exposer les e-mails (donnée personnelle).
  app.get('/api/inscriptions', (req, res) => {
    const publiques = inscriptions.map(({ nom, type, badge }) => ({
      nom,
      type,
      badge,
    }));
    res.json({ total: publiques.length, inscriptions: publiques });
  });

  // Création d'une inscription.
  app.post('/api/inscriptions', (req, res) => {
    const resultat = validerInscription(req.body ?? {});
    if (!resultat.valide) {
      return res.status(400).json({ erreurs: resultat.erreurs });
    }

    const { nom, email, type } = req.body;
    inscriptions.push({ nom, email, type, badge: resultat.badge });
    res.status(201).json({ badge: resultat.badge, type });
  });

  // Corps JSON malformé (erreur levée par express.json()).
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ erreur: 'JSON invalide' });
    }
    if (err) return res.status(400).json({ erreur: 'Requête invalide' });
    next();
  });

  return app;
}
