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
    // Les suites de non-alphanumériques sont déjà réduites à un seul '-',
    // donc un simple ^- / -$ suffit (pas de quantificateur = pas de ReDoS).
    .replace(/^-|-$/g, '');
}
