// Petite API HTTP d'inscription à un événement EventSphere.
// Sans dépendance externe (module http natif) pour limiter la surface
// d'attaque. Réutilise validerInscription() : une seule source de vérité
// pour les règles de validation, partagée avec le front (index.html).

import http from 'node:http';
import { pathToFileURL } from 'node:url';
import { validerInscription } from './inscription.mjs';

// Stockage en mémoire : l'appli est éphémère, liée à la durée de l'événement.
const inscriptions = [];

const LIMITE_CORPS = 1_000_000; // 1 Mo, garde-fou anti-abus.

function envoyerJson(res, code, donnees) {
  const corps = JSON.stringify(donnees);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(corps),
  });
  res.end(corps);
}

// Lit et parse le corps JSON de la requête, avec garde-fou de taille.
function lireCorpsJson(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > LIMITE_CORPS) {
        reject(new Error('Corps de requête trop volumineux'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error('JSON invalide'));
      }
    });
    req.on('error', reject);
  });
}

// Autorise le front (servi sur un autre port) à appeler l'API.
function appliquerCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export function creerServeur() {
  return http.createServer(async (req, res) => {
    const { method, url } = req;

    appliquerCors(res);

    // Requête préliminaire CORS (preflight) envoyée par le navigateur.
    if (method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Point de santé, utile pour les sondes de déploiement (Render/Docker).
    if (method === 'GET' && url === '/api/sante') {
      return envoyerJson(res, 200, { statut: 'ok' });
    }

    if (url === '/api/inscriptions') {
      if (method === 'GET') {
        // On n'expose pas les e-mails (donnée personnelle) dans la liste.
        const publiques = inscriptions.map(({ nom, type, badge }) => ({
          nom,
          type,
          badge,
        }));
        return envoyerJson(res, 200, {
          total: publiques.length,
          inscriptions: publiques,
        });
      }

      if (method === 'POST') {
        let corps;
        try {
          corps = await lireCorpsJson(req);
        } catch (e) {
          return envoyerJson(res, 400, { erreur: e.message });
        }

        const resultat = validerInscription(corps);
        if (!resultat.valide) {
          return envoyerJson(res, 400, { erreurs: resultat.erreurs });
        }

        inscriptions.push({
          nom: corps.nom,
          email: corps.email,
          type: corps.type,
          badge: resultat.badge,
        });
        return envoyerJson(res, 201, {
          badge: resultat.badge,
          type: corps.type,
        });
      }

      return envoyerJson(res, 405, { erreur: 'Méthode non autorisée' });
    }

    return envoyerJson(res, 404, { erreur: 'Ressource introuvable' });
  });
}

// Vide le stockage : réservé aux tests.
export function _reinitialiser() {
  inscriptions.length = 0;
}

// Démarrage direct : `node src/api.mjs` (sinon, module importé par les tests).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = process.env.PORT || 3001;
  creerServeur().listen(port, () => {
    console.log(`API EventSphere à l'écoute sur http://localhost:${port}`);
  });
}
