// API Express d'inscription à un événement EventSphere.
// L'app est exportée séparément du serveur qui écoute, pour pouvoir la
// tester directement avec supertest (tests d'intégration).

import express from 'express';
import rateLimit from 'express-rate-limit';
import { validerInscription } from '../src/inscription.mjs';

export function creerApp() {
  const app = express();

  // Derrière le proxy de Render : fait confiance au 1er hop pour lire la
  // vraie IP client (X-Forwarded-For), utile au rate-limiter.
  app.set('trust proxy', 1);

  // Limitation de débit : protège toutes les routes (API + fichiers statiques
  // servis en aval) contre les abus / déni de service.
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 300, // requêtes par IP et par fenêtre
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

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
    // validerInscription applique lui-même un défaut {} si le corps est absent.
    const resultat = validerInscription(req.body);
    if (!resultat.valide) {
      return res.status(400).json({ erreurs: resultat.erreurs });
    }

    const { nom, email, type } = req.body;
    inscriptions.push({ nom, email, type, badge: resultat.badge });
    res.status(201).json({ badge: resultat.badge, type });
  });

  // Erreurs levées par express.json() : JSON malformé ou corps trop
  // volumineux. La signature à 4 arguments (dont _next non utilisé) est
  // requise par Express pour reconnaître un middleware d'erreur.
  app.use((err, req, res, _next) => {
    const message =
      err.type === 'entity.parse.failed' ? 'JSON invalide' : 'Requête invalide';
    res.status(400).json({ erreur: message });
  });

  return app;
}
