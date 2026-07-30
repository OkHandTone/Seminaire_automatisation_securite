import { describe, it, expect } from 'vitest';
import {
  TYPES_BILLET,
  validerNom,
  validerEmail,
  validerTypeBillet,
  genererIdentifiantBadge,
  validerInscription,
} from '../../src/inscription.mjs';

describe('validerNom', () => {
  it('accepte un nom d\'au moins 2 caractères', () => {
    expect(validerNom('Marie Durand')).toBe(true);
  });

  it('refuse un nom trop court ou vide', () => {
    expect(validerNom('A')).toBe(false);
    expect(validerNom('   ')).toBe(false);
    expect(validerNom(undefined)).toBe(false);
  });
});

describe('validerEmail', () => {
  it('accepte une adresse bien formée', () => {
    expect(validerEmail('marie@example.com')).toBe(true);
  });

  it('refuse une adresse invalide', () => {
    expect(validerEmail('marie@')).toBe(false);
    expect(validerEmail('marie.example.com')).toBe(false);
    expect(validerEmail('')).toBe(false);
  });
});

describe('validerTypeBillet', () => {
  it('accepte les types autorisés', () => {
    for (const type of TYPES_BILLET) {
      expect(validerTypeBillet(type)).toBe(true);
    }
  });

  it('refuse un type inconnu', () => {
    expect(validerTypeBillet('gratuit')).toBe(false);
    expect(validerTypeBillet('')).toBe(false);
  });
});

describe('genererIdentifiantBadge', () => {
  it('génère un identifiant lisible et déterministe', () => {
    expect(genererIdentifiantBadge('Marie Durand', 'vip')).toBe('VIP-marie-durand');
  });

  it('lève une erreur si les données sont invalides', () => {
    expect(() => genererIdentifiantBadge('A', 'vip')).toThrow();
    expect(() => genererIdentifiantBadge('Marie', 'gratuit')).toThrow();
  });
});

describe('validerInscription', () => {
  it('valide une inscription complète et fournit le badge', () => {
    const resultat = validerInscription({
      nom: 'Jean Martin',
      email: 'jean.martin@example.com',
      type: 'standard',
    });
    expect(resultat.valide).toBe(true);
    expect(resultat.erreurs).toEqual({});
    expect(resultat.badge).toBe('STANDARD-jean-martin');
  });

  it('remonte toutes les erreurs quand tout est invalide', () => {
    const resultat = validerInscription({ nom: '', email: 'nope', type: '' });
    expect(resultat.valide).toBe(false);
    expect(resultat.erreurs.nom).toBeDefined();
    expect(resultat.erreurs.email).toBeDefined();
    expect(resultat.erreurs.type).toBeDefined();
    expect(resultat.badge).toBeUndefined();
  });

  it('gère un appel sans argument', () => {
    const resultat = validerInscription();
    expect(resultat.valide).toBe(false);
  });
});
