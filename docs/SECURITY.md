# Sécurité — résultats constatés

Le précédent durcissement est conservé: profils isolés, rôles non modifiables, fonction automatique RLS inaccessible, colonnes profil protégées et langues validées. Les 11 tests négatifs sur deux comptes temporaires repassent.

## Corrections dans ce lot
- Fonctions serveur profil et crédits: session obligatoire, propriétaire vérifié et RLS.
- Ajout de l'attachement de session sans retirer la protection CSRF existante.
- Schéma de validation nom/langues côté serveur.
- Registre crédit: verrouillage par utilisateur, références uniques, déduplication, refus de découvert et écritures directes interdites.
- Un test a détecté une lecture visiteur permise par des droits hérités sur la nouvelle table. Révocation explicite corrigée; test repassé.
- Lecture cohérente solde/historique dans un instantané unique.
- Cache vidé à la déconnexion, y compris lors d'un changement de session.
- Métadonnées des pages d'authentification ne prétendent plus à des comptes fictifs.

Les clés privilégiées sont lues seulement dans les tests serveur et ne sont pas ajoutées au code navigateur. Aucun nouveau secret, service payant ou publication.

## Alerte existante
Supabase signale encore une fonction SECURITY DEFINER accessible aux connectés (`has_role` selon l'audit précédent). Elle reste nécessaire aux autorisations et n'a pas été affaiblie. Cette alerte préexistante n'est pas une nouvelle alerte de migration.

## Non certifié
Livraison réelle des e-mails, configuration hébergée de redirection/SMTP, protections commerciales de paiement, audit complet du bundle publié et tests Windows externes non certifiés. Le simple indicateur build OK ne prouve pas la préparation production.

## Consentement et médias locaux — 17 octobre 2026
- Aucun appel getUserMedia sans consentement distinct et clic Activer; une permission accordée au navigateur ne vaut pas consentement à l'envoi/conservation.
- Arrêt explicite, retrait du consentement, sortie du panneau, onglet masqué ou page quittée: tracks arrêtés. Résultats tardifs invalidés et arrêtés.
- Photos JPEG/PNG/WebP jusqu'à 5 Mo: décodage local, rejet SVG, URL blob révoquée au remplacement/retrait/démontage. Aucun upload ni conservation des consentements.
- Déclaration d'autorisation et refus d'usurpation pour photos/avatars. Cela n'est pas une preuve automatique d'identité ni un consentement juridique distant auditable.
- Pas de transcription distante, reconnaissance vocale du navigateur potentiellement hébergée, cloning vocal ou synthèse externe introduits sous une promesse « local uniquement ».
- Paiements fail-closed; un événement client ne peut pas attribuer de crédits. Aucune modification SQL dans ce lot.