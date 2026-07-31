import { useCallback, useEffect, useState } from 'react';

// L'API est servie par le même service (même origine) : on utilise donc
// des URL relatives. En dev, Vite proxifie /api vers le serveur Express
// (voir vite.config.js). Surchargeable au build via VITE_API_URL.
const API_URL = import.meta.env.VITE_API_URL || '';

const CHAMPS_INITIAUX = { nom: '', email: '', type: '' };

export default function App() {
  const [form, setForm] = useState(CHAMPS_INITIAUX);
  const [erreurs, setErreurs] = useState({});
  const [badge, setBadge] = useState(null);
  const [erreurReseau, setErreurReseau] = useState(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [inscrits, setInscrits] = useState([]);
  const [total, setTotal] = useState(0);
  const [erreurListe, setErreurListe] = useState(null);

  const maj = (champ) => (e) =>
    setForm((f) => ({ ...f, [champ]: e.target.value }));

  const chargerInscrits = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/inscriptions`);
      const data = await res.json();
      if (!res.ok) {
        setErreurListe('Impossible de charger la liste des inscrits.');
        return;
      }
      setInscrits(data.inscriptions || []);
      setTotal(data.total ?? 0);
      setErreurListe(null);
    } catch {
      setErreurListe('Impossible de charger la liste des inscrits.');
    }
  }, []);

  useEffect(() => {
    chargerInscrits();
  }, [chargerInscrits]);

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
        await chargerInscrits();
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
      <h1 id="titre">Salon de la Tech 2026</h1>
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

      <section id="liste-inscrits" aria-labelledby="titre-inscrits">
        <h2 id="titre-inscrits">Inscrits ({total})</h2>
        <p className="aide-liste">Les adresses e-mail ne sont pas affichées.</p>
        {erreurListe && (
          <div className="erreur" id="erreur-liste">{erreurListe}</div>
        )}
        {!erreurListe && inscrits.length === 0 && (
          <p id="liste-vide">Aucun inscrit pour le moment.</p>
        )}
        {inscrits.length > 0 && (
          <ul id="inscrits">
            {inscrits.map((i) => (
              <li key={i.badge} data-badge={i.badge}>
                <span className="inscrit-nom">{i.nom}</span>
                <span className="inscrit-type">{i.type}</span>
                <span className="inscrit-badge">{i.badge}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
