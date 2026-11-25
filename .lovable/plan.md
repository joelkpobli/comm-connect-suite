# E-mail en haut du logiciel Windows

## Constat
Le code a déjà été vérifié : l'en-tête du logiciel Windows n'affiche plus l'e-mail. On y voit seulement « ● Compte connecté », les soldes (points et minutes audio), l'état de la licence Weechat Camera et les boutons Recharger, Actualiser et Déconnexion.

Cette suppression date de ce matin, mais elle a été déplacée dans le **Build #27**, qui est en cours de compilation. Si l'e-mail apparaît encore chez vous, c'est que vous utilisez une version installée plus ancienne.

## Ce qu'il reste à faire
- Aucune modification de code n'est nécessaire.
- Attendre que le Build #27 passe au vert sur GitHub Actions.
- Le logiciel se mettra à jour automatiquement au prochain démarrage. Sinon, installez le nouveau Weechat-Setup.exe.
- Vérifier sur votre PC que l'en-tête n'affiche plus l'e-mail et que l'onglet « Transformation IA » est bien là.
