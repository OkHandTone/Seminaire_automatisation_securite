# language: fr
Fonctionnalité: Page d'accueil
  En tant que visiteur
  Je veux voir la page et interagir avec le bouton
  Afin de vérifier que la page fonctionne correctement

  Scénario: La page affiche le bon titre
    Étant donné que je visite la page
    Alors le titre de la page est "Bonjour Playwright"

  Scénario: Le bouton affiche un message au clic
    Étant donné que je visite la page
    Quand je clique sur le bouton
    Alors le message "Bouton cliqué !" s'affiche
