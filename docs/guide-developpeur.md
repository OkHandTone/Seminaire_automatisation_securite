# Guide du développeur — EventSphere

> Comment travailler au quotidien sur ce dépôt : lancer l'appli, développer, et surtout **quoi faire
> selon la situation dans laquelle vous vous trouvez** (push refusé, PR bloquée, PR Dependabot,
> rollback…).
>
> Pour la vision d'ensemble de la chaîne, voir le [README](../README.md). Pour l'analyse vis-à-vis de
> l'appel d'offres, voir [l'analyse critique](analyse-critique.md).

---

## 1. Démarrage

### Prérequis
- **Node.js** en version LTS (la CI utilise `lts/*`).
- **Git**.
- **Docker** (optionnel, seulement pour tester l'image de production en local).

### Installation
```bash
npm ci
```
> Utilisez `npm ci` (et non `npm install`) : il installe **exactement** les versions du `package-lock.json`,
> comme le fait la CI. Le script `prepare` installe aussi le hook Git `pre-push` (Husky) automatiquement.

### Lancer l'appli en local
Deux terminaux :
```bash
npm run dev:api     # API Express  → http://localhost:3001
npm run dev         # Front Vite   → http://localhost:5173
```

### Les commandes que vous utiliserez tous les jours
| Commande | Ce qu'elle fait |
|---|---|
| `npm test` | Tests unitaires + intégration (Vitest). **C'est ce que joue le hook `pre-push`.** |
| `npm run test:watch` | Les mêmes tests, en continu pendant que vous codez |
| `npm run coverage` | Tests + rapport de couverture (comme SonarCloud en CI) |
| `npm run test:e2e` | Tests fonctionnels navigateur (Playwright) |
| `npm run test:bdd` | Scénarios métier en français (Cucumber) |
| `npm run build` | Construit le front de production dans `dist/` |

---

## 2. Le cycle normal (le « chemin heureux »)

1. **Créer une branche** à partir de `main` :
   ```bash
   git checkout main && git pull
   git checkout -b feat/ma-fonctionnalite
   ```
2. **Coder.** Mettez la logique métier dans `src/` (fonctions pures), exposez-la via `server/` (API)
   et/ou `client/` (interface).
3. **Écrire/mettre à jour les tests** au même endroit que le code testé (`tests/unit`, `tests/integration`…).
4. **Vérifier en local** : `npm test` (et `npm run coverage` si vous touchez à la logique métier).
5. **Commit** avec un message clair (convention *Conventional Commits* : `feat:`, `fix:`, `docs:`, `test:`, `chore:`…).
6. **Pousser** : `git push -u origin feat/ma-fonctionnalite`.
   → Le hook **`pre-push` rejoue `npm test`** : si un test échoue, **le push est refusé** (voir Cas B).
7. **Ouvrir une Pull Request** vers `main`. La CI démarre automatiquement.
8. **Faire passer les portes** (voir Cas C), obtenir une revue, puis **fusionner**.

> ⚠️ **`main` = production.** La fusion sur `main` déclenche le **déploiement automatique** (Render,
> `autoDeploy: true`). Ne poussez jamais directement sur `main` : tout passe par une branche + PR.

### Où tournent les contrôles ?
| Contrôle | Quand | Portée |
|---|---|---|
| **`pre-push`** (local) | à chaque `git push` | `npm test` (unit + intégration) |
| **Vitest** (CI) | tout `push` et toute PR | unit + intégration |
| **Playwright + Cucumber** (CI) | `push`/PR sur **`main`** | e2e + BDD |
| **SonarCloud** (CI) | `push`/PR sur **`main`** | qualité + couverture (Quality Gate) |
| **Trivy** (CI) | `push`/PR sur **`main`** | vulnérabilités des dépendances (`CRITICAL`/`HIGH`) |

---

## 3. Les différents cas dans lesquels vous pouvez vous trouver

> **Table de décision rapide** — trouvez votre situation, allez au cas correspondant.

| Votre situation | Cas |
|---|---|
| J'ajoute une fonctionnalité ou je corrige un bug | **A** |
| Mon `git push` est **refusé** | **B** |
| Ma **PR est bloquée** par la CI (coche rouge) | **C** |
| Une **PR automatique de Dependabot** est apparue | **D** |
| Une **faille est signalée** dans une dépendance sans correctif | **E** |
| Je dois **annuler un déploiement** (rollback) | **F** |
| J'utilise l'**IA** pour générer du code ou des tests | **G** |
| Je veux **changer une technologie** (framework, outil) | **H** |
| Je dois **conserver des données** (vrai projet, pas la démo) | **I** |
| Le **déploiement échoue** ou l'appli ne répond plus | **J** |

---

### Cas A — J'ajoute une fonctionnalité / je corrige un bug
1. Branche dédiée (`feat/…` ou `fix/…`).
2. Logique dans `src/` (pure, testable), branchée sur `server/` et/ou `client/`.
3. **Ajoutez les tests correspondants** — sinon la couverture baisse et la Quality Gate peut bloquer la PR (Cas C).
4. `npm test` en local, puis push + PR.

**Règle d'or :** une modification = des tests. Le code non testé est du code qui bloquera la PR ou cassera plus tard.

---

### Cas B — Mon `git push` est refusé
**Symptôme :** le push s'arrête, la sortie montre un échec de `npm test`.

**Pourquoi :** le hook `pre-push` (Husky) rejoue les tests **avant** l'envoi. C'est voulu : on ne pousse pas de code cassé.

**Quoi faire :**
1. Lisez le test en échec, reproduisez-le en local : `npm test` (ou `npm run test:watch`).
2. Corrigez le code **ou** le test.
3. Repoussez.

> 🚫 **Ne contournez pas** avec `git push --no-verify`. Vous ne feriez que déplacer l'échec vers la CI,
> où il bloquera quand même la PR — en plus visible et en plus lent. Le contournement n'est justifié
> que pour un push exceptionnel sans rapport avec le code (ex. documentation seule) et en connaissance de cause.

---

### Cas C — Ma PR est bloquée par la CI
**Symptôme :** une ou plusieurs coches rouges sur la PR. Ouvrez l'onglet **Checks** / **Details** pour voir laquelle.

| Porte rouge | Cause probable | Quoi faire |
|---|---|---|
| **Vitest** | Un test unit/intégration échoue | Reproduire avec `npm test`, corriger |
| **Playwright / Cucumber** | Parcours utilisateur cassé **ou** test instable (*flaky*) | Rejouer `npm run test:e2e` / `test:bdd` ; si instable, relancer le job et fiabiliser le scénario |
| **SonarCloud (Quality Gate)** | Couverture insuffisante, code dupliqué, *code smells*, *hotspots* de sécurité | Ouvrir le rapport Sonar depuis la PR ; ajouter des tests, dédupliquer, traiter les points signalés |
| **Trivy** | Dépendance avec vulnérabilité `CRITICAL`/`HIGH` | Voir **Cas E** |

**Principe :** une porte rouge **empêche la fusion**. C'est l'effet recherché — mieux vaut une PR
bloquée qu'une régression en production. Corrigez la cause, poussez à nouveau : la CI se relance seule.

> 💡 Les tests **Playwright/Sonar/Trivy** ne se déclenchent que sur les PR **ciblant `main`**. Si votre
> PR vise `main` et que vous ne les voyez pas, vérifiez la cible de la PR.

---

### Cas D — Une PR automatique de Dependabot est apparue
**Symptôme :** une PR ouverte par `dependabot[bot]` proposant de monter une ou plusieurs dépendances
(npm, GitHub Actions, ou image Docker). Elles arrivent quotidiennement (8h–8h30), **groupées**.

**Quoi faire :**
1. **Ne pas fusionner à l'aveugle.** Laissez la CI tourner : elle valide que la montée de version ne casse rien.
2. Lisez le résumé de Dependabot (changelog, niveau : patch / mineur / majeur).
3. Si la CI est verte et que le changement est mineur/patch → fusion.
4. Si c'est une **montée majeure** ou que la CI casse → traiter comme un vrai changement (tester,
   adapter le code), éventuellement sur une branche dédiée.

> ⚠️ Le flux quotidien peut faire du bruit. La bonne pratique est de **traiter ces PR régulièrement**
> plutôt que de les laisser s'accumuler : une dépendance à jour = moins de failles (Cas E).

---

### Cas E — Une faille est signalée dans une dépendance (Trivy rouge)
**Symptôme :** la porte **Trivy** échoue avec une vulnérabilité `CRITICAL` ou `HIGH`.

**Quoi faire, dans l'ordre :**
1. **Un correctif existe ?** Montez la dépendance vers la version corrigée (souvent une PR Dependabot
   existe déjà — voir Cas D). C'est le cas le plus fréquent.
2. **Pas encore de correctif (vuln transitive) ?** Options :
   - Vérifier si le code **utilise réellement** le chemin vulnérable.
   - Forcer une version corrigée d'une dépendance transitive (`overrides` dans `package.json`) si disponible.
   - En dernier recours et **de façon tracée**, documenter une exception temporaire, avec une échéance de revue.
3. **Ne masquez jamais une faille en douce.** Le critère bloquant est là pour protéger l'événement.

---

### Cas F — Je dois annuler un déploiement (rollback)
**Contexte :** chaque déploiement correspond à **un commit = une image**. Revenir en arrière = redéployer l'image précédente.

**Quoi faire :**
- **Sur Render (démo)** : redéployer la version précédente depuis le tableau de bord (« Rollback » / « Redeploy » d'un déploiement antérieur).
- **Correction de fond** : ouvrez une PR de correctif (ou un `git revert` du commit fautif) → la fusion sur `main` redéploie une version saine.
- **Sur Kubernetes (à l'échelle)** : `kubectl rollout undo`.

> Le rollback est un filet, pas une solution : enchaînez toujours avec un correctif passant par les portes habituelles.

---

### Cas G — J'utilise l'IA pour générer du code ou des tests
**Autorisé et encouragé** (accélération). **Mais** le code/test généré n'a **aucun privilège** :
1. Il passe par **exactement les mêmes portes** que le reste (revue, Vitest, Sonar, Trivy).
2. **Vous relisez et comprenez** ce que vous intégrez : vous en êtes responsable, pas l'outil.
3. Un test généré doit vérifier quelque chose de **réel** (pas un test qui « passe pour passer »).

> Principe de la chaîne : *la qualité et la sécurité ne dépendent pas de l'origine du code.*

---

### Cas H — Je veux changer une technologie
La chaîne est **agnostique** : la logique métier (`src/`) et les portes de contrôle ne dépendent pas du framework.
- Changer le **front** (React → Vue/Svelte…) → n'impacte que `client/`.
- Changer le **back** (Express → Fastify/FastAPI/Go…) → n'impacte que `server/`.
- Le **métier** (`src/`) et la CI/CD restent inchangés.

**Quoi faire :** isolez le changement dans sa couche, gardez le contrat (mêmes entrées/sorties d'API),
et assurez-vous que les tests existants passent toujours. L'artefact livré reste l'**image Docker**.

---

### Cas I — Je dois conserver des données (vrai projet, pas la démo)
⚠️ **Important.** Le démonstrateur garde les données **en mémoire** : un redémarrage les efface. C'est
une simplification pédagogique. Un **projet réel** doit **persister** les données (inscriptions,
accréditations…), car elles doivent survivre à un redémarrage et sont souvent intégrées au SI du client.

**Quoi faire :**
1. Introduire un **stockage durable** (base de données, ou service adapté à la sensibilité des données).
2. Garder la logique métier dans `src/` ; n'ajouter la couche d'accès aux données que dans `server/`.
3. Ajouter les **tests d'intégration** correspondants.
4. Prévoir la **fin de vie** : la purge des données devient une étape **maîtrisée et volontaire**, plus un simple arrêt du service.

> La chaîne accueille ce changement sans être refaite : mêmes tests, mêmes portes qualité/sécurité, même déploiement.

---

### Cas J — Le déploiement échoue ou l'appli ne répond plus
**Symptôme :** déploiement en erreur sur Render, ou service indisponible après mise en ligne.

**Quoi faire :**
1. **La CI était-elle verte ?** Si non, la fusion n'aurait pas dû avoir lieu — corrigez la PR d'abord.
2. **Sonde de santé** : le service n'est basculé que si `/api/sante` répond. Vérifiez cet endpoint et les logs Render.
3. **Build Docker cassé ?** Testez l'image en local :
   ```bash
   docker build -t eventsphere .
   ```
   > Rappel : la chaîne elle-même peut casser. Exemple déjà rencontré sur ce projet — un outil
   > d'automatisation (Husky) absent en production avait fait échouer le build. Regardez d'abord les
   > logs de build, pas seulement le code applicatif.
4. Si l'incident est en production → **rollback** (Cas F), puis correctif.

---

## 4. Les 5 règles à retenir

1. **On ne pousse jamais sur `main` directement** — branche + PR (fusion = déploiement).
2. **Une modification = des tests** — sinon la porte qualité bloque, à juste titre.
3. **Une porte rouge se corrige, ne se contourne pas** (`--no-verify` et compagnie sont des impasses).
4. **Le code généré par IA passe les mêmes contrôles** que le reste.
5. **Les données en mémoire, c'est pour la démo** — un vrai projet doit les persister (Cas I).
