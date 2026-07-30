// Petites fonctions fictives pour illustrer les tests unitaires Vitest.

export function addition(a, b) {
  return a + b;
}

export function estPair(n) {
  return n % 2 === 0;
}

export function inverser(texte) {
  return String(texte).split('').reverse().join('');
}

export function slugifier(texte) {
  return String(texte)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
