// Logique métier de l'inscription à un événement EventSphere.
// Fonctions pures (sans DOM) : facilement testables par Vitest et
// réutilisables côté navigateur dans index.html.

import { slugifier } from './utils.mjs';

// Types de billets acceptés pour un événement.
export const TYPES_BILLET = ['standard', 'vip', 'presse'];

// Un nom est valide s'il contient au moins 2 caractères une fois nettoyé.
export function validerNom(nom) {
  return typeof nom === 'string' && nom.trim().length >= 2;
}

// Validation d'email volontairement simple mais suffisante pour l'exemple.
export function validerEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Le type de billet doit faire partie de la liste autorisée.
export function validerTypeBillet(type) {
  return TYPES_BILLET.includes(type);
}

// Génère un identifiant de badge lisible et déterministe,
// ex: "VIP-marie-durand". Réutilise slugifier() de utils.js.
export function genererIdentifiantBadge(nom, type) {
  if (!validerNom(nom) || !validerTypeBillet(type)) {
    throw new Error('Nom ou type de billet invalide');
  }
  return `${type.toUpperCase()}-${slugifier(nom)}`;
}

// Valide une inscription complète et renvoie les erreurs éventuelles.
// Renvoie { valide, erreurs, badge? }.
export function validerInscription({ nom, email, type } = {}) {
  const erreurs = {};

  if (!validerNom(nom)) {
    erreurs.nom = 'Le nom doit contenir au moins 2 caractères.';
  }
  if (!validerEmail(email)) {
    erreurs.email = "L'adresse e-mail n'est pas valide.";
  }
  if (!validerTypeBillet(type)) {
    erreurs.type = 'Veuillez choisir un type de billet.';
  }

  const valide = Object.keys(erreurs).length === 0;

  return valide
    ? { valide, erreurs, badge: genererIdentifiantBadge(nom, type) }
    : { valide, erreurs };
}
