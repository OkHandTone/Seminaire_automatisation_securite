import { useEffect, useState } from 'react';

const CLE_STOCKAGE = 'theme';

/**
 * Détermine le thème initial : priorité au choix mémorisé de l'utilisateur,
 * puis à la préférence système, et sinon au thème clair.
 */
export function themeInitial() {
  try {
    const memorise = localStorage.getItem(CLE_STOCKAGE);
    if (memorise === 'light' || memorise === 'dark') return memorise;
  } catch {
    // localStorage indisponible (mode privé, SSR…) : on ignore.
  }
  if (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }
  return 'light';
}

/**
 * Hook de gestion du thème clair/sombre.
 * Applique l'attribut `data-theme` sur <html> et mémorise le choix.
 */
export function useTheme() {
  const [theme, setTheme] = useState(themeInitial);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(CLE_STOCKAGE, theme);
    } catch {
      // Persistance impossible : le thème reste appliqué pour la session.
    }
  }, [theme]);

  const basculer = () =>
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return { theme, basculer };
}
