# Weechat — état des lieux et plan vers la production

## État des lieux (constaté)
- 8 écrans en place (accueil, connexion, inscription, récupération, tableau de bord, crédits, historique, paramètres), design néon bleu conservé, 11 tests qui passent.
- Toutes les données sont fictives (solde 1250, packs, transactions) et vivent en mémoire dans le navigateur.
- Supabase externe connecté (réf. psairuwdemxnwdkhpzsw, vérifié comme weechat-production) : auth joignable, aucune table, aucune règle d'accès.
- Lovable Cloud non activé. Aucune clé secrète dans le frontend.
- Point à nettoyer : deux clients Supabase coexistent (le module maison et celui généré par la connexion). On garde un seul client.

## Écarts avec une application réelle
- Pas de vrais comptes ni de session, pages privées accessibles à tous.
- Profil, solde et historique non enregistrés.
- Achat de crédits simulé : aucun paiement.
- Traduction, caméra virtuelle, appels : non construits (toujours présentés comme à venir).

## Schéma proposé (rien créé avant votre accord)
- profiles : id (= utilisateur), nom affiché, langue d'interface, langue vocale, dates. Créé automatiquement à l'inscription. Chacun lit et modifie uniquement le sien.
- user_roles : rôles (admin, user) dans une table séparée, jamais sur le profil. Lecture de ses propres rôles uniquement.
- credit_packs : catalogue des packs. Lecture publique, modification réservée au serveur.
- credit_transactions : historique (montant +/-, type achat/usage/bonus, référence). Lecture de ses propres lignes ; aucune écriture depuis le navigateur.
- Solde = somme des transactions, calculé par une fonction de base de données ; jamais modifiable par l'utilisateur.

## Étapes vérifiables
1. Nettoyage : un seul client Supabase, tests toujours verts.
2. Authentification : inscription, connexion, mot de passe oublié + page de réinitialisation, déconnexion, pages privées protégées. Test réel avec un compte.
3. Profil et paramètres branchés sur profiles.
4. Crédits : packs, solde et historique réels, écritures uniquement côté serveur. Les données fictives restent en repli tant que non vérifié.
5. Paiement : choix du prestataire (à décider), achat crédité seulement après confirmation du paiement.
6. Production : gestion des erreurs, tests, audit sécurité, puis publication sur votre demande.
7. Fonctionnalités Weechat réelles, une par une, plus tard.

## Questions avant de lancer l'étape 2
- Confirmation d'e-mail obligatoire à l'inscription, ou connexion immédiate ?
- Connexion Google souhaitée en plus de l'e-mail ?

## Détails techniques
- Pages privées regroupées sous une zone protégée côté client ; logique serveur via fonctions serveur authentifiées (pas d'Edge Functions).
- Chaque table : droits explicites, RLS activée, politiques limitées à auth.uid() ; écritures de crédits via le rôle de service uniquement, après vérification.
- Les migrations sont soumises une à une avec leur description.
