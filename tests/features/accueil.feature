# language: fr
Fonctionnalité: Inscription à un événement
  En tant que visiteur d'un événement EventSphere
  Je veux m'inscrire et obtenir mon badge
  Afin d'accéder à l'événement

  Scénario: La page présente l'événement
    Étant donné que je visite la page
    Alors le titre de la page est "Salon de la Tech 2026"

  Scénario: Une inscription valide génère un badge
    Étant donné que je visite la page
    Quand je m'inscris avec le nom "Marie Durand", l'email "marie.durand@example.com" et le billet "vip"
    Alors mon badge "VIP-marie-durand" s'affiche

  Scénario: Une inscription incomplète est refusée
    Étant donné que je visite la page
    Quand je valide le formulaire sans rien remplir
    Alors un message d'erreur sur le nom s'affiche
