# Heures Studio : activation externe

Le portefeuille Studio est déployé dans le projet Supabase existant ; disponibilité vérifiée par l'API. Les règles d'accès ont été contrôlées : consultation sous les droits du propriétaire, écritures réservées au service de paiement.

1. Les migrations Studio ont été appliquées via l'outil au projet `psairuwdemxnwdkhpzsw`. Ne pas réexécuter le script de préparation `docs/sql/studio-hours.sql` : l'historique officiel est dans `supabase/migrations`.
2. Les trois offres Whop ont été créées à paiement unique : 168 h à 3 000 FCFA, 720 h à 10 000 FCFA, 8 760 h à 50 000 FCFA. Aucun renouvellement automatique.
3. Publier le site et compiler l'application Windows. Vérifier une recharge connectée, son webhook rejoué deux fois, les heures reçues et leur consommation dans Windows.
4. Vérifier qu'un utilisateur ne peut ni lire le solde d'un autre, ni créditer ses heures, ni débiter ses points GPU via un pack Studio.

Bonus par achat Swap Live : Découverte 6 h, Starter 24 h, Standard 72 h, Premium 168 h, Ultimate 720 h. Les points, minutes audio et jetons IA restent inchangés. Le bonus caméra de 72 h est indépendant, une seule fois par utilisateur, également accordé aux détenteurs actuels lors de l'activation.

Les heures représentent du temps de diffusion consommé ; la validité est distincte (7 / 30 / 365 jours pour les offres dédiées, validité du pack pour les bonus). Le PC doit rester allumé et connecté. La disponibilité de TikTok Live, les droits sur les vidéos et les règles des plateformes restent applicables.

Whop : refus 400 reproduit avec `plan_id`; session créée avec HTTP 200 en envoyant `variant_id`. Aucun paiement effectué. PayDunya reste désactivé en l'absence de `PAYDUNYA_ENABLED=true` ; le diagnostic de confirmation avec un jeton invalide retourne HTTP 200 / code 1001, ce qui ne valide pas un paiement réel.

Vérifications connectées de `/credits` et `/tableau-de-bord` indisponibles : Lovable ne peut pas fournir de session pour le Supabase géré par l'utilisateur. Aucun mot de passe demandé ni compte fictif créé. Windows : syntaxe Python vérifiée, exécution réelle sur PC et nouvel installateur restent à vérifier. Les anciens achats Swap Live ne reçoivent pas rétroactivement les nouveaux bonus ; seules les licences existantes ont reçu leur cadeau unique lors de la migration.
