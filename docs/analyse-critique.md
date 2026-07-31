# Analyse critique de la réponse — Annexe A

> Pièce d'accompagnement au dossier de réponse ([README.md](../README.md)).
>
> Ce document ne redécrit pas la chaîne (voir le README) : il l'**analyse**. Il répond à trois
> questions que le jury se posera : *qu'est-ce que la solution résout réellement ? qu'apporte-t-elle
> au-delà de ce qui est demandé ? et quelles frictions l'automatisation introduit-elle ?*
>
> Il est volontairement **transparent sur les écarts** : nommer soi-même les limites est un gage de
> maturité, pas un aveu de faiblesse.

---

## 1. Ce que résout réellement la solution

L'annexe est explicite (§2) : *« l'objectif n'est pas de développer une application particulière, mais
de proposer une chaîne de développement industrialisée permettant de réduire le délai entre
l'expression du besoin et la mise en production »*. Le livrable central n'est donc pas le portail
d'inscription : **c'est la chaîne**. Le portail (§3 : *gestion des accréditations*) n'est qu'une preuve
qu'elle produit une application réelle, testée, sécurisée et déployée.

Reformulé en *problèmes métier résolus* plutôt qu'en fonctionnalités :

| Problème réel du client | Ce que la chaîne résout | Preuve dans le dépôt |
|---|---|---|
| « Chaque nouvel événement repart de zéro » | Squelette + CI/CD déjà câblés, réutilisables ; on ne recode que le métier | `src/` — fonctions pures réutilisées front/back |
| « La qualité dépend de qui code » (§2 : *quelles que soient les équipes*) | Portes automatiques identiques pour tous, y compris le code généré par IA | Quality Gate SonarCloud bloquante sur PR |
| « On découvre les régressions en production » | Pyramide de tests jouée à chaque PR + `pre-push` local | 4 niveaux : unit / intégration / e2e / BDD |
| « La sécurité est un audit de fin de projet » | *Security by Design* : SCA + analyse statique bloquants dans le pipeline | Trivy `exit-code:1`, 2 ReDoS déjà corrigés |
| « Le déploiement est manuel et non reproductible » | 1 commit = 1 image = 1 déploiement traçable, rollback en 1 clic | image Docker, `render.yaml`, sonde `/api/sante` |

### Correspondance avec les attentes du §4 (et statut honnête)

| Attente de l'annexe | Réponse apportée | Statut |
|---|---|---|
| **4.1 Développement rapide** — frameworks, réutilisation, IA raisonnée | Squelette + logique pure réutilisable, IA encadrée | ✅ couvert |
| **4.2 Industrialisation** — build auto, versionnage, CI | GitHub Actions, Docker multi-stage, `npm ci` sur lockfile | ✅ couvert |
| **4.3 Qualité** — statique, duplications, couverture, indicateurs | SonarCloud + couverture LCOV | ✅ couvert |
| **4.4 Sécurité** — **SAST, DAST, SCA, secrets, vulns d'images**, critères bloquants | SCA (Trivy + Dependabot), SAST (Sonar/CodeQL), critères bloquants | ⚠️ **partiel — voir point de vigilance n°1** |
| **4.5 Tests** — unit, intégration, fonctionnels, IA, CI | Pyramide 4 niveaux exécutée en CI | ✅ couvert |
| **4.6 Déploiement** — CD, GitOps, validation, rollback, versions | Docker + CD, sonde de santé, rollback, chemin K8s/GitOps | ✅ couvert |

---

## 2. Ce à quoi la solution répond **au-delà** de l'annexe

Éléments **non demandés** par le texte, qui constituent la différenciation de la proposition :

- **Substituabilité *démontrée* de la pile.** L'annexe demande une qualité homogène *« quelles que
  soient les technologies retenues »* (§2). La proposition va plus loin en prouvant que front (React)
  et back (Express) sont **interchangeables** sans toucher aux portes de contrôle. L'artefact standard
  livré est l'**image Docker**, pas le framework.
- **Fin de vie propre.** L'annexe insiste sur le caractère éphémère mais n'exige jamais la
  décommission. La proposition traite le « zéro donnée résiduelle » (données en mémoire, arrêt du
  service = purge implicite). Angle *sécurité des données* non sollicité.
- **Non-exposition des données personnelles.** L'annexe signale que les applications traitent des
  *« données parfois sensibles »* (§1) sans imposer de mesure. La réponse est concrète : les e-mails
  ne sont **jamais** renvoyés par l'API de listing. Réponse de type RGPD non réclamée.
- **Durcissement applicatif du démonstrateur.** Rate limiting, CORS restreint aux méthodes utiles,
  limite de taille du corps JSON, gestion centralisée des erreurs. Le §4.4 vise les *analyses du
  pipeline* ; le durcissement du code livré est un bonus.
- **Gouvernance de l'assistance IA.** L'annexe demande un *« usage raisonné »* de l'IA (§4.1). La
  proposition ajoute un principe fort : **tout code ou test généré passe par les mêmes portes que le
  reste** — la qualité ne dépend pas de l'origine du code.
- **Posture de transparence.** Documenter ce qui n'est **pas** encore câblé (feuille de route
  sécurité) est un signal de maturité que l'annexe ne demande pas.

---

## 3. Points de vigilance — écarts à assumer face à l'annexe

Trois écarts identifiés entre le texte de l'annexe et l'état du démonstrateur. Les nommer permet de
préparer la réponse à l'oral plutôt que de les subir.

### Point n°1 — Sécurité : 3 contrôles sur 6 (axe évalué)

Le §4.4 cite explicitement six contrôles ; la Sécurité est un **axe d'évaluation à part entière** (§6).

| Contrôle demandé (§4.4) | Statut |
|---|---|
| Analyse statique de sécurité (SAST) | ✅ SonarCloud + CodeQL |
| Analyse des dépendances (SCA) | ✅ Trivy + Dependabot |
| Critères bloquants avant mise en production | ✅ Trivy `exit-code:1` + Quality Gate |
| Analyse dynamique (DAST) | 🔜 roadmap (p. ex. OWASP ZAP en CI) |
| Détection de secrets | 🔜 roadmap (Gitleaks / Trivy secret scanning) |
| Vulnérabilités des images / artefacts | 🔜 roadmap (Trivy mode `image`) |

**Réponse à préparer :** le pipeline est *conçu pour accueillir* ces trois contrôles comme des étapes
supplémentaires du même flux, sans refonte (déjà documenté dans le README, §7). Montrer le chemin
d'intégration vaut mieux que laisser le jury constater l'absence.

### Point n°2 — Un seul cas d'usage démontré sur huit

Le §3 énumère **8 cas d'usage** (accréditations, exposants, réservation de salles, bénévoles, suivi
logistique, portail visiteurs, tableaux de bord, outils d'administration). Le démonstrateur n'en
couvre **qu'un** (accréditations).

**Réponse à préparer :** la chaîne est **agnostique du cas d'usage** — le portail n'est qu'une preuve
d'exécution ; les sept autres réutilisent le même squelette, la même CI/CD et les mêmes portes de
contrôle. Le livrable évalué est la démarche, pas l'application.

### Point n°3 — Interactions avec l'infrastructure de la réponse principale

Le §5 demande explicitement de décrire *« les interactions avec l'infrastructure décrite dans la
réponse principale »*. Cette annexe est une **extension de périmètre**.

**Réponse à préparer :** expliciter le lien avec la réponse principale (où tournent les conteneurs,
réseau, gestion des secrets, intégration au SI). Le README l'évoque (« infrastructure événementielle
décrite dans la réponse principale ») mais reste général — à consolider.

---

## 4. Les difficultés que cette automatisation introduit

Industrialiser, c'est aussi créer des frictions. Les nommer soi-même est un gage de crédibilité : ce
ne sont pas des défauts de la démarche, mais sa **contrepartie assumée**.

### a) Le blocage de PR — la friction visible

- **Une porte rouge = merge impossible.** Une Quality Gate non tenue, un test Playwright *flaky* ou un
  Trivy `CRITICAL`/`HIGH` bloquent la fusion — parfois à tort (faux positif), ou pour une **vulnérabilité
  transitive sans correctif disponible**. Le développeur est bloqué par un facteur qu'il ne maîtrise pas.
- **Contournement tentant.** Le hook `pre-push` (Husky) est désactivable d'un `--no-verify`.
  L'automatisation locale n'est fiable que si l'équipe joue le jeu — d'où l'importance de la porte
  **serveur** (CI) comme filet réel.
- **Faux positifs coûteux.** Les deux ReDoS corrigés étaient de vrais gains, mais chaque *hotspot*
  SonarCloud/CodeQL demande une analyse humaine (réel ou à écarter ?). C'est du temps d'ingénieur.

### b) Le coût d'entretien — la friction invisible

- **Flux Dependabot quotidien** → bruit de PR à relire ; risque de « fatigue de mise à jour » et de
  merge automatique non vérifié.
- **Couverture 100 %** → objectif vertueux mais qui peut pousser à des tests fragiles ou à des
  exclusions à justifier (déjà le cas dans `sonar-project.properties`). Le 100 % n'est pas gratuit à
  maintenir.
- **Latence de CI** → quatre workflows (Vitest, Playwright, Sonar, Trivy) cumulent du temps sur *chaque*
  PR : la boucle de feedback n'est plus instantanée.
- **La chaîne elle-même est du code à maintenir.** Cas vécu dans ce dépôt : le build Docker a cassé
  parce que Husky était absent en production (commit `d856b1d`). L'outillage qui fiabilise peut
  lui-même devenir une source de panne.

### c) Les limites structurelles — choix assumés

- **Dépendances externes** — SonarCloud, Render, GitHub Actions : disponibilité, secrets/tokens à
  gérer, quotas. Un incident chez un tiers peut bloquer une livraison.
- **Persistance en mémoire** — choix assumé pour l'éphémère, mais un redémarrage = perte des
  inscriptions. À énoncer comme *contrainte de périmètre*, pas comme oubli.
- **Courbe d'apprentissage** — Git par PR, BDD Cucumber, lecture des rapports de sécurité : l'équipe
  doit monter en compétence. La productivité baisse *avant* de remonter.

---

## 5. Message de synthèse pour la soutenance

> Ces frictions ne sont pas des défauts, ce sont la **contrepartie assumée** de la garantie. Le blocage
> de PR est *l'effet recherché* : mieux vaut une livraison bloquée qu'une régression en production le
> jour de l'événement. La valeur de la chaîne se mesure précisément à ce qu'elle **refuse** de laisser
> passer.
