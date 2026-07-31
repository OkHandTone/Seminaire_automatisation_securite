import { useState } from 'react';
import { useTheme } from './useTheme.js';

// L'API est servie par le même service (même origine) : on utilise donc
// des URL relatives. En dev, Vite proxifie /api vers le serveur Express
// (voir vite.config.js). Surchargeable au build via VITE_API_URL.
const API_URL = import.meta.env.VITE_API_URL || '';

const CHAMPS_INITIAUX = { nom: '', email: '', type: '' };

export default function App() {
  const { theme, basculer } = useTheme();
  const [form, setForm] = useState(CHAMPS_INITIAUX);
  const [erreurs, setErreurs] = useState({});
  const [badge, setBadge] = useState(null);
  const [erreurReseau, setErreurReseau] = useState(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  const maj = (champ) => (e) =>
    setForm((f) => ({ ...f, [champ]: e.target.value }));

  async function soumettre(e) {
    e.preventDefault();
    setErreurs({});
    setBadge(null);
    setErreurReseau(null);
    setEnvoiEnCours(true);
    try {
      const res = await fetch(`${API_URL}/api/inscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setBadge(data.badge);
        setForm(CHAMPS_INITIAUX);
      } else {
        setErreurs(data.erreurs || {});
      }
    } catch {
      setErreurReseau('Impossible de contacter le serveur. Est-il démarré ?');
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <main>
      <div className="entete">
        <h1 id="titre">Salon de la Tech 2026</h1>
        <button
          type="button"
          id="bascule-theme"
          onClick={basculer}
          aria-pressed={theme === 'dark'}
          aria-label={
            theme === 'dark'
              ? 'Activer le thème clair'
              : 'Activer le thème sombre'
          }
          title={
            theme === 'dark'
              ? 'Activer le thème clair'
              : 'Activer le thème sombre'
          }
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
      <p className="sous-titre">
        Inscrivez-vous et récupérez votre badge d'accès.
      </p>

      <form id="formulaire-inscription" onSubmit={soumettre} noValidate>
        <label htmlFor="nom">Nom complet</label>
        <input
          id="nom"
          name="nom"
          autoComplete="name"
          value={form.nom}
          onChange={maj('nom')}
        />
        <div className="erreur" id="erreur-nom">{erreurs.nom || ''}</div>

        <label htmlFor="email">Adresse e-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={maj('email')}
        />
        <div className="erreur" id="erreur-email">{erreurs.email || ''}</div>

        <label htmlFor="type">Type de billet</label>
        <select id="type" name="type" value={form.type} onChange={maj('type')}>
          <option value="">— Choisir —</option>
          <option value="standard">Standard</option>
          <option value="vip">VIP</option>
          <option value="presse">Presse</option>
        </select>
        <div className="erreur" id="erreur-type">{erreurs.type || ''}</div>

        <button type="submit" id="bouton-inscription" disabled={envoiEnCours}>
          {envoiEnCours ? 'Envoi…' : "S'inscrire"}
        </button>
      </form>

      {erreurReseau && (
        <div className="erreur" id="erreur-reseau">{erreurReseau}</div>
      )}

      <div id="confirmation" hidden={!badge}>
        Inscription confirmée ! Votre identifiant de badge :{' '}
        <span id="badge">{badge || ''}</span>
      </div>
    </main>
  );
}
