# Analyse de la réponse à l'annexe A — version accessible

> Pièce d'accompagnement au dossier de réponse ([README.md](../README.md)).
>
> **À qui s'adresse ce document ?** À tout le monde — décideurs, acheteurs, chefs de projet,
> techniciens. Chaque terme technique est expliqué en langage courant (voir le **glossaire** en fin de
> document, ⓖ). L'objectif est de répondre clairement à trois questions :
>
> 1. **Qu'est-ce que notre solution résout vraiment ?**
> 2. **Qu'apporte-t-elle en plus de ce qui est demandé ?**
> 3. **Quelles difficultés l'automatisation crée-t-elle** (et pourquoi elles sont assumées) ?
>
> Les priorités sont classées avec la méthode **MoSCoW** (voir encadré ci-dessous).

---

## En une phrase

Le client ne nous demande pas *une application*, il nous demande une **usine à fabriquer des
applications** : rapide, fiable, sécurisée, réutilisable d'un événement à l'autre. Notre livrable est
donc cette **chaîne de fabrication** ; le portail d'inscription n'est là que pour prouver qu'elle
fonctionne de bout en bout.

---

## La méthode MoSCoW en 30 secondes

Une façon simple de classer ce qui compte, du plus au moins prioritaire :

| Catégorie | Signification | En clair |
|---|---|---|
| **M — Must have** | *Doit être là* | Indispensable. Sans ça, la réponse ne tient pas. |
| **S — Should have** | *Devrait être là* | Important, fortement attendu. Prévu, en cours. |
| **C — Could have** | *Pourrait être là* | Valeur ajoutée, « bonus » si le temps le permet. |
| **W — Won't have (this time)** | *Ne sera pas là (cette fois)* | Volontairement hors périmètre, et on explique pourquoi. |

---

## 1. Ce que notre solution résout — classé par priorité (MoSCoW)

### 🟢 MUST — l'indispensable, et c'est **livré**

Ce sont les fondations exigées par le client (§2 de l'annexe : *réduire le délai entre le besoin et la
mise en production, sans sacrifier la qualité ni la sécurité*).

| Ce qui est indispensable | Ce que ça résout, en clair | Fait ? |
|---|---|:--:|
| Chaîne **CI/CD** ⓖ automatisée | On ne refait pas les branchements à chaque projet : tout est déjà câblé | ✅ |
| **Tests automatiques** ⓖ à chaque modification | Les erreurs sont détectées tout de suite, pas le jour de l'événement | ✅ |
| Contrôle **qualité** bloquant | Le niveau de qualité ne dépend plus de la personne qui code | ✅ |
| Sécurité de base : **SAST** + **SCA** ⓖ + critères bloquants | On ne met jamais en ligne une faille connue de niveau élevé | ✅ |
| **Déploiement automatisé** + retour arrière (**rollback** ⓖ) | Mise en ligne fiable, traçable, annulable en un clic | ✅ |

**En résumé :** tout le socle attendu est en place et démontrable.

### 🟡 SHOULD — important, **prévu mais pas encore branché**

Le client cite explicitement ces contrôles de sécurité (§4.4). Nous en avons une partie ; le reste est
**planifié**, et la chaîne est déjà conçue pour les accueillir sans être refaite.

| Attendu par le client | État | Traduction |
|---|:--:|---|
| **DAST** ⓖ (test de l'appli en fonctionnement) | 🔜 prévu | Vérifier l'appli « en marche », pas seulement son code |
| **Détection de secrets** ⓖ | 🔜 prévu | S'assurer qu'aucun mot de passe ne traîne dans le code |
| **Scan des images** ⓖ | 🔜 prévu | Contrôler aussi le « colis » livré, pas que son contenu |

> ⚠️ **Point d'attention n°1.** La sécurité est un **critère de notation** à part entière (§6). Nous
> couvrons **3 des 6 contrôles cités**. À l'oral, il vaut mieux l'annoncer et montrer le chemin
> d'intégration prévu, plutôt que de laisser le jury le découvrir.

### 🔵 COULD — la valeur ajoutée (non demandée, mais offerte)

| Bonus apporté | Pourquoi c'est utile |
|---|---|
| Pile technique **interchangeable** | On peut changer d'outils sans refaire la chaîne : un investissement durable |
| **Fin de vie propre** de l'appli | À la fin de l'événement, aucune donnée ne traîne |
| Les **e-mails ne sortent jamais** de l'appli | Protection des données personnelles (esprit RGPD ⓖ) |
| **Garde-fous** anti-abus (limite de débit, etc.) | L'appli résiste mieux aux usages malveillants |
| **Encadrement de l'IA** ⓖ | Le code généré par IA passe les mêmes contrôles que le reste |

### ⚪ WON'T (cette fois) — volontairement hors périmètre

Assumé, et justifié — ce n'est pas un oubli.

| Ce qu'on ne fait **pas** ici | Pourquoi c'est un choix |
|---|---|
| Base de données **dans le démonstrateur** | Ici les données sont gardées en mémoire pour rester simple. ⚠️ **Ce n'est valable que pour la démo** : un vrai projet devra **conserver les données** (voir encadré ci-dessous). |
| Coder les **8 cas d'usage** (§3) | Un seul suffit à prouver la chaîne ; les 7 autres réutilisent le même squelette |
| Interface graphique riche | On garde le portail simple pour laisser la **chaîne** au premier plan |

> 💾 **Important — la persistance des données dans un vrai projet.** Le démonstrateur conserve les
> inscriptions **en mémoire** : c'est une simplification pédagogique. Dans un projet réel, les données
> (inscriptions, accréditations…) **devront être conservées durablement** — typiquement dans une base
> de données — car elles doivent survivre à un redémarrage et sont souvent **intégrées au système
> d'information** du client (annexe §1 : *« données parfois sensibles… intégrées au SI »*). La chaîne
> est prévue pour l'accueillir : ajouter une base de données ne change ni les tests, ni les contrôles
> qualité/sécurité, ni le déploiement. La **fin de vie propre** (effacement des données à la fin de
> l'événement) reste alors une étape maîtrisée, mais volontaire, et non plus un simple arrêt du service.

> ⚠️ **Point d'attention n°2.** Le client liste **8 cas d'usage** possibles (accréditations, exposants,
> salles, bénévoles, logistique, portail visiteurs, tableaux de bord, administration). Notre démo n'en
> montre **qu'un**. Message à préparer : *la chaîne est indépendante du cas d'usage — le portail n'est
> qu'une preuve, les autres suivraient le même moule.*

---

## 2. Ce que nous apportons **au-delà** de la demande

Résumé des « Could have » ci-dessus, du point de vue du bénéfice client :

- **Un investissement réutilisable**, pas un projet jetable : la même chaîne resservira à chaque
  événement, même avec d'autres technologies.
- **Le respect des données personnelles intégré dès la conception**, alors que l'annexe ne fait que
  mentionner des « données sensibles ».
- **La transparence** : nous documentons noir sur blanc ce qui n'est *pas* encore fait. C'est un signe
  de sérieux, pas de faiblesse.

> ⚠️ **Point d'attention n°3.** Le §5 demande de décrire le **lien avec l'infrastructure de la réponse
> principale** (là où tournent réellement les applications). Ce point doit être explicité : notre
> document technique l'évoque mais reste général.

---

## 3. Les difficultés que l'automatisation crée (et pourquoi c'est voulu)

Automatiser apporte des garanties, mais crée aussi des **frictions**. Les nommer nous-mêmes est un gage
de sérieux : ce ne sont pas des défauts, ce sont la **contrepartie assumée** de la fiabilité.

### a) Ça peut **bloquer une livraison** — et c'est le but

- Si un contrôle échoue (test, qualité, sécurité), la modification est **bloquée** et ne peut pas être
  mise en ligne. C'est parfois frustrant — par exemple quand la faille détectée vient d'un composant
  extérieur qu'on ne maîtrise pas — mais **c'est exactement l'effet recherché** : mieux vaut une
  livraison retardée qu'une panne le jour de l'événement.
- Certains blocages sont de **fausses alertes** : il faut alors du temps humain pour vérifier. C'est le
  prix d'un filet de sécurité qui préfère « trop » alerter que « pas assez ».

### b) Ça demande de **l'entretien** (coût invisible)

- Les mises à jour automatiques de composants génèrent **beaucoup de notifications** à trier.
- Viser une couverture de tests maximale a un **coût de maintenance** : les tests doivent suivre.
- Les contrôles automatiques **ajoutent du temps** à chaque modification (quelques minutes d'attente).
- **La chaîne elle-même est un outil qui peut casser** : c'est déjà arrivé sur ce projet (un composant
  d'automatisation absent avait bloqué une construction). L'outil qui fiabilise doit lui-même être
  maintenu.

### c) Des **limites assumées**

- **Dépendance à des services extérieurs** (plateformes d'analyse et d'hébergement) : un incident chez
  eux peut ralentir une livraison.
- **Données en mémoire dans la démo** : un redémarrage efface les inscriptions. C'est acceptable pour
  le démonstrateur, mais **un vrai projet exigera une base de données** pour conserver les données
  (voir l'encadré « persistance » plus haut).
- **Montée en compétence** de l'équipe nécessaire au départ : la productivité baisse un peu **avant**
  de remonter.

---

## 4. À retenir pour la soutenance

> Ces frictions ne sont pas des défauts : ce sont la **contrepartie assumée** de la garantie. Le
> blocage automatique est *l'effet recherché* — mieux vaut une livraison bloquée qu'une panne le jour
> J. **La valeur de notre chaîne se mesure à ce qu'elle refuse de laisser passer.**

Et les trois points d'attention à ne pas éluder :

1. **Sécurité 3/6** — annoncer les 3 contrôles restants comme feuille de route.
2. **1 cas d'usage sur 8** — expliquer que la chaîne est indépendante du cas d'usage.
3. **Lien avec l'infrastructure principale** — à expliciter.

---

## Glossaire ⓖ

| Terme | Explication en langage courant |
|---|---|
| **CI/CD** | *Intégration / livraison continues.* La « chaîne de montage » automatique qui teste, contrôle et met en ligne le code à chaque modification. |
| **PR (pull request)** | Une proposition de modification du code, soumise à validation avant d'être intégrée. |
| **Tests automatiques** | Des vérifications programmées qui rejouent seules les scénarios importants pour détecter les erreurs. |
| **SAST** | Analyse du **code source** à la recherche de failles (on lit la recette). |
| **DAST** | Analyse de l'**application en fonctionnement** (on teste le plat cuisiné). |
| **SCA** | Contrôle des **composants externes** réutilisés, pour repérer ceux qui ont des failles connues. |
| **Détection de secrets** | Recherche de mots de passe ou clés oubliés par erreur dans le code. |
| **Scan d'image** | Vérification du « colis » (conteneur) livré, en plus de son contenu. |
| **Rollback** | Retour arrière : revenir en un clic à la version précédente qui fonctionnait. |
| **Rate limiting / garde-fou** | Limite du nombre de requêtes pour éviter les abus et les attaques. |
| **RGPD** | Réglementation européenne sur la protection des données personnelles. |
| **Encadrement de l'IA** | Le code produit par une IA passe exactement les mêmes contrôles que le code écrit à la main. |
| **Éphémère** | L'application ne vit que le temps de l'événement, puis est arrêtée proprement. |
