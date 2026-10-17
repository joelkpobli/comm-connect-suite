# Tests et preuves du lot

## Automatisation réellement exécutée
Avant l'instantané SQL: **36 tests passent**, six fichiers.
- Routage: 9 tests.
- Simulation locale et langue UI: 3 tests.
- Renvoi e-mail et compte à rebours: 2 tests.
- Isolation réelle de deux comptes: 11 tests.
- Validation profil: 3 tests.
- Registre réel: 8 tests (zéro initial; +100/-30; doublons concurrents; conflit de référence; insuffisance; opération invalide puis reprise; débits concurrents; isolation et écriture refusée; historique non modifiable).

Un test additionnel vérifie l'instantané solde/historique et le refus aux visiteurs. Voir le résultat final du lot avant de compter ce test comme validé.

Premier passage registre: 7/8; lecture anonyme non refusée. Droits hérités révoqués, nouveau passage 8/8. Les clients Supabase multiples avertissent dans les tests car chaque compte d'essai a son client isolé; l'application conserve un client navigateur unique.

## Navigateur réel
Compte d'essai confirmé créé uniquement pour tester puis supprimé:
- Connexion par formulaire et accès tableau de bord.
- Deux opérations privilégiées de test +100 et -30; affichage réel du solde **70**, reçus **100**, consommés **30**, et deux motifs dans Historique.
- Nom sauvegardé dans Paramètres puis relu après rechargement.
- UI English et langue vocale Português enregistrées puis relues après rechargement.
- Écran 390×844: menu fermé hors écran, formulaire accessible, aucun débordement horizontal.
- Aucun événement pageerror dans ce parcours. Captures revues.

Le test mobile a initialement montré le menu recouvrant la page. Ancrage gauche/haut de la barre fixe corrigé; vérification visuelle et géométrique repassée.

Les tests n'ont pas validé une boîte e-mail réelle, un paiement, une coupure réseau matérielle pendant commit, une caméra externe ou une traduction générale. La reprise après erreur SQL et les requêtes identiques concurrentes sont testées; cela ne remplace pas une panne réseau de bout en bout.

Commande de régression: `bunx vitest run`. Variables de test serveur: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_PUBLISHABLE_KEY; ne jamais publier leurs valeurs.