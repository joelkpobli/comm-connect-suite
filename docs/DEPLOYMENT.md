# Déploiement — procédure non exécutée

**Ne pas publier ce lot comme produit complet.** Aucun déploiement n'a été effectué.

Recontrôle: l'endpoint public de réglages Auth confirme l'inscription e-mail activée et l'auto-confirmation désactivée; fournisseurs tiers listés désactivés. Il ne renvoie ni Site URL, ni allow-list de redirections, ni configuration SMTP. Les points 1–4 ci-dessous restent donc des actions propriétaire, et non des paramètres déclarés manquants après lecture du dashboard.

1. Dans Supabase weechat-production, Authentication → URL Configuration, vérifier Site URL `https://comm-connect-suite.lovable.app`.
2. Ajouter les retours exacts:
   - `https://comm-connect-suite.lovable.app/connexion`
   - `https://comm-connect-suite.lovable.app/reinitialisation`
   - `https://id-preview--bb7dacc9-4318-4cf0-a3d2-21ed45c5ce4d.lovable.app/connexion`
   - `https://id-preview--bb7dacc9-4318-4cf0-a3d2-21ed45c5ce4d.lovable.app/reinitialisation`
3. Vérifier confirmation e-mail obligatoire et configurer un SMTP autorisé sans mettre son secret dans le frontend.
4. Tester inscription, lien de confirmation, connexion, récupération et réinitialisation avec une vraie boîte e-mail. Les tests de comptes préconfirmés ne remplacent pas ce parcours.
5. Vérifier variables serveur SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SERVICE_ROLE_KEY; variables navigateur VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY. Aucune valeur secrète dans cette documentation.
6. Vérifier sauvegardes/restauration depuis Supabase, alertes, quotas et politique de conservation; état non vérifié dans ce lot.
7. Terminer traductions, parcours crédits et intégrations annoncées; exécuter la régression et vérifier le build courant.
8. Obtenir l'autorisation explicite de publication; utiliser alors Publish dans Lovable.
9. Tester sur l'URL publiée, en nouvelle fenêtre, tous les parcours critiques; ne pas supposer que l'aperçu prouve la production.

Retour arrière: rétablir une version application connue sans retirer les migrations ni les mouvements réels; désactiver les nouvelles actions, puis corriger avec migrations additives. Faire un essai de restauration avant tout changement destructif.