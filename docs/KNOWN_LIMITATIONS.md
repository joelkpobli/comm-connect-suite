# Limites et prochaine reprise

## Verdict
**Pas prêt pour une commercialisation complète.** Authentification, paramètres/lectures crédits et représentation locale sont construits. Audio et vidéo locaux passent avec signaux de test; capture matérielle reste à vérifier. Traduction, avatar animé, caméra virtuelle et achats restent non opérationnels.

## Blocages externes
- Site URL, retours et SMTP: état hébergé non vérifié; propriétaire doit confirmer et tester l'e-mail réel.
- Paiements: pays du marchand, devise, prix validés, choix compatible et identifiants absents. Aucun service choisi ou activé et aucune dépense engagée.
- Traduction générale: pas de fournisseur autorisé ni de budget/identifiants; ne pas remplacer par des phrases prédéfinies.
- Caméra virtuelle externe: pont logiciel et tests sur Windows/applications physiques nécessaires; un navigateur ne crée pas une caméra système.
- Consentement local explicite livré; validation juridique, licences commerciales et décisions DOC/DEC originales restent à vérifier; ne pas inventer leur contenu.

## Travaux encore exécutables, non terminés dans ce lot
- Les écrans existants, menus et messages d'authentification ont désormais des libellés français/anglais; parcours clés anglais testés. Une revue linguistique exhaustive de chaque variante et erreur native de navigateur reste recommandée.
- Langue et nom du profil sont synchronisés dans l'espace privé; le choix du menu est local tant que les préférences ne sont pas enregistrées dans Paramètres.
- Contrats de paiement désactivés livrés; catalogue commercial attend pays, devise et prix validés. Pagination historique reste hors de ce lot.
- Choix/consentement avatar statique/photo et permissions microphone/caméra livrés. Capture matérielle et permissions dans l'aperçu intégré restent à tester sur l'ordinateur cible; ouvrir l'app dans un onglet HTTPS si la politique de l'aperçu bloque la capture.
- Recontrôle natif de ce lot: navigateur sécurisé, audio et vidéo retournent NotFoundError (aucun appareil), sans injection ni remplacement. Le panneau isolé affiche « Indisponible » et la cause réelle. Ce test n'est pas un parcours connecté complet: Supabase externe ne fournit pas de session gérée pour ce lot; les tests d'isolation en base restent réellement exécutés.
- Reconnaissance, traduction, synthèse et animation: interfaces désactivées préparées, pas de moteur installé. Choix de modèle/fournisseur, licences, budget zéro et matériel cible nécessaires avant activation; aucun faux résultat présenté.
- Paiement signé/remboursement/réconciliation: à implémenter une fois les exigences commerciales et identifiants fournis.

Ce lot poursuit jusqu'au graphe audio et flux vidéo locaux et aux contrats de paiement. Aucun travail ne continue en arrière-plan après la réponse. **Blocages actuels: appareils physiques/Windows, décisions/licences et fournisseur de traduction autorisé compatible avec le budget zéro, informations commerciales pour sélectionner le paiement, réglages e-mail Supabase.**