import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from 'vitest';
import { creerServeur, _reinitialiser } from '../../src/api.mjs';

let serveur;
let base;

beforeAll(async () => {
  serveur = creerServeur();
  await new Promise((resolve) => serveur.listen(0, resolve));
  const { port } = serveur.address();
  base = `http://localhost:${port}`;
});

afterAll(async () => {
  await new Promise((resolve) => serveur.close(resolve));
});

beforeEach(() => _reinitialiser());

describe('GET /api/sante', () => {
  it('répond que le service est en ligne', async () => {
    const res = await fetch(`${base}/api/sante`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ statut: 'ok' });
  });
});

describe('POST /api/inscriptions', () => {
  it('crée une inscription valide et renvoie le badge', async () => {
    const res = await fetch(`${base}/api/inscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom: 'Marie Durand',
        email: 'marie.durand@example.com',
        type: 'vip',
      }),
    });
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ badge: 'VIP-marie-durand', type: 'vip' });
  });

  it('refuse une inscription invalide avec le détail des erreurs', async () => {
    const res = await fetch(`${base}/api/inscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom: '', email: 'nope', type: '' }),
    });
    expect(res.status).toBe(400);
    const corps = await res.json();
    expect(corps.erreurs.nom).toBeDefined();
    expect(corps.erreurs.email).toBeDefined();
    expect(corps.erreurs.type).toBeDefined();
  });

  it('refuse un corps JSON malformé', async () => {
    const res = await fetch(`${base}/api/inscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ ceci nest pas du json',
    });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/inscriptions', () => {
  it('liste les inscriptions sans exposer les e-mails', async () => {
    await fetch(`${base}/api/inscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom: 'Jean Martin',
        email: 'jean.martin@example.com',
        type: 'standard',
      }),
    });

    const res = await fetch(`${base}/api/inscriptions`);
    expect(res.status).toBe(200);
    const corps = await res.json();
    expect(corps.total).toBe(1);
    expect(corps.inscriptions[0]).toEqual({
      nom: 'Jean Martin',
      type: 'standard',
      badge: 'STANDARD-jean-martin',
    });
    expect(corps.inscriptions[0].email).toBeUndefined();
  });
});

describe('routage', () => {
  it('renvoie 405 sur une méthode non autorisée', async () => {
    const res = await fetch(`${base}/api/inscriptions`, { method: 'PUT' });
    expect(res.status).toBe(405);
  });

  it('renvoie 404 sur une ressource inconnue', async () => {
    const res = await fetch(`${base}/api/inconnu`);
    expect(res.status).toBe(404);
  });
});
