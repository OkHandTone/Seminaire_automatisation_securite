import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { creerApp } from '../../server/app.js';

let app;

// Une app neuve par test : stockage en mémoire remis à zéro.
beforeEach(() => {
  app = creerApp();
});

describe('GET /api/sante', () => {
  it('répond que le service est en ligne', async () => {
    const res = await request(app).get('/api/sante');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ statut: 'ok' });
  });
});

describe('POST /api/inscriptions', () => {
  it('crée une inscription valide et renvoie le badge', async () => {
    const res = await request(app)
      .post('/api/inscriptions')
      .send({ nom: 'Marie Durand', email: 'marie.durand@example.com', type: 'vip' });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ badge: 'VIP-marie-durand', type: 'vip' });
  });

  it('refuse une inscription invalide avec le détail des erreurs', async () => {
    const res = await request(app)
      .post('/api/inscriptions')
      .send({ nom: '', email: 'nope', type: '' });
    expect(res.status).toBe(400);
    expect(res.body.erreurs.nom).toBeDefined();
    expect(res.body.erreurs.email).toBeDefined();
    expect(res.body.erreurs.type).toBeDefined();
  });

  it('refuse un corps JSON malformé', async () => {
    const res = await request(app)
      .post('/api/inscriptions')
      .set('Content-Type', 'application/json')
      .send('{ ceci nest pas du json');
    expect(res.status).toBe(400);
  });
});

describe('GET /api/inscriptions', () => {
  it('liste les inscriptions sans exposer les e-mails', async () => {
    await request(app)
      .post('/api/inscriptions')
      .send({ nom: 'Jean Martin', email: 'jean.martin@example.com', type: 'standard' });

    const res = await request(app).get('/api/inscriptions');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.inscriptions[0]).toEqual({
      nom: 'Jean Martin',
      type: 'standard',
      badge: 'STANDARD-jean-martin',
    });
    expect(res.body.inscriptions[0].email).toBeUndefined();
  });
});

describe('CORS', () => {
  it('répond au preflight OPTIONS avec les en-têtes CORS', async () => {
    const res = await request(app).options('/api/inscriptions');
    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('*');
    expect(res.headers['access-control-allow-methods']).toContain('POST');
  });
});

describe('routage', () => {
  it('renvoie 404 sur une ressource inconnue', async () => {
    const res = await request(app).get('/api/inconnu');
    expect(res.status).toBe(404);
  });
});
