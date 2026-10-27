# Données et crédits

Base externe existante uniquement. Profils et rôles préexistants conservés. Aucune suppression de données utilisateur; les comptes temporaires créés par les tests sont supprimés après chaque essai.

## Profils
`profiles`: nom, langue UI (fr/en), langue vocale (fr/en/es/de/pt). Lecture/modification de son propre profil, champs limités et validations préexistantes. `user_roles` conserve les rôles séparément, lisibles par leur propriétaire; aucun changement de rôle par le navigateur.

## Registre
`credit_transactions`: propriétaire (référence au profil), montant entier signé, catégorie, motif, référence unique et date.
- Lecture personnelle seulement; visiteurs refusés.
- Utilisateur et service ne peuvent pas écrire directement dans le registre.
- `post_credit_operation`, accessible uniquement au service privilégié, verrouille le profil pendant l'opération, refuse un solde négatif et déduplique les références.
- Même référence et mêmes paramètres: même mouvement; référence réutilisée avec d'autres paramètres: refus.
- Aucun solde initial inventé: zéro sans mouvement.
- Les mouvements ne sont pas modifiables. Les corrections doivent utiliser un nouveau mouvement compensateur.
- `get_credit_snapshot` lit solde/totaux et 100 derniers mouvements dans le même instantané SQL; les totaux couvrent tout l'historique.

## Migrations de ce lot
1. `20261017075139`: registre, validation, opération atomique et totaux.
2. `20261017075845`: révocation des droits hérités, écriture directe interdite même au service.
3. `20261017082210`: instantané cohérent solde/historique.

Aucun catalogue commercial ou prix définitif créé. Les packs visibles restent les anciens exemples, explicitement simulés. Paiements désactivés. Aucun endpoint public permettant une attribution arbitraire de crédits.

## Retour arrière
Ne pas supprimer le registre. Revenir à une version frontend précédente pour désactiver les lectures; conserver migrations et données. Corriger via migration additive révisée. Une opération créditée à tort exige un mouvement compensateur identifié, pas la modification du passé.
## Décompte en direct (usage)
Conforme à la page Tarifs : **Swap Live = 2 points/seconde** (registre de points) ; **Traduction en direct = minutes audio**, solde séparé `audio_time_transactions` (en secondes, lecture propriétaire uniquement, écriture via `post_audio_operation` réservée au service). `chargeUsageBlock` prépaye des tranches de 10 s, référence unique par tranche (aucun double débit) ; démarrage refusé et session coupée si le solde est insuffisant. Limite : le rythme est piloté par le navigateur ; un compteur serveur sera nécessaire pour l'application Windows. Les packs Audio achetés devront créditer ce registre lorsque le paiement réel sera actif.
