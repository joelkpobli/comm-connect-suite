# Architecture de paiement — désactivée

## État livré
Interfaces uniquement, aucun service activé et aucune dépense. Initiation interdite même si une configuration future paraît complète. Aucun prix commercial inventé. Les exemples existants restent simulés et ne changent pas le solde réel.

## Chaîne future obligatoire
1. Utilisateur connecté sélectionne un identifiant de pack approuvé; jamais un montant ou nombre de crédits faisant autorité.
2. Fonction serveur authentifiée lit le catalogue et crée une commande durable propriétaire avec prix, devise et crédits figés.
3. Adaptateur fournisseur crée un checkout de test depuis les valeurs serveur. Secrets lus dans le gestionnaire serveur seulement.
4. Retour navigateur affiche l'état, sans créditer.
5. Endpoint serveur public vérifie la signature sur le corps brut, relit la commande et correspondance montant/devise/statut marchand.
6. Attribution via `post_credit_operation`, référence unique fournisseur+événement/commande. La reprise d'un webhook ne double jamais les crédits.
7. Remboursement partiel/complet, événements désordonnés et réconciliation relisent l'état du fournisseur; remboursement financier et reprise de crédits sont deux opérations distinctes à définir commercialement.

États envisagés: pending, succeeded, failed, partially_refunded, refunded. Ces types ne constituent pas un moteur de paiement implémenté. Aucun test de signature, checkout ou remboursement réel revendiqué.

## Données requises avant suite
Pays d'enregistrement du marchand, devise, packs/prix définitifs en crédits, règles de taxes/remboursement. Puis vérification d'éligibilité et consentement avant toute activation. L'intégration intégrée peut ne pas nécessiter de compte fournisseur préexistant; aucune clé ne sera demandée avant de déterminer le parcours approprié. Vérifier aussi le plan et le respect du budget 0 €: ne pas activer un service payant pour débloquer ce lot.

Le stockage futur reste uniquement dans weechat-production. Toute future migration doit conserver grants explicites, RLS owner-only et accès privilégié strict. Pas de table, migration ou webhook ajouté ici.