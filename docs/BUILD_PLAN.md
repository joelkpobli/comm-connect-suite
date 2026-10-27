# Weechat — Plan de construction (repartir sur de bonnes bases)

Principe : **un module = un écran = un test**. On ne passe au suivant que lorsque le précédent est validé sur une vraie machine.

## Les 5 modules produit

| # | Module | Écran | Ce qui marche déjà | Ce qu'il reste à construire | Dépendance externe |
|---|--------|-------|--------------------|-----------------------------|--------------------|
| 1 | Traduction vocale (Audio) | Studio → Appel | Deepgram STT + DeepL + Aura TTS, phrase par phrase (~2,5 s), sortie vers CABLE Input | Mode continu (streaming), sous-titres, test WhatsApp via VB-Cable | Clés Deepgram/DeepL (gratuites) |
| 2 | Swap Live (visage/persona) | Studio → Persona | Décor réel + silhouette en pied + ombre + sortie plein écran OBS | Suivi des mouvements (MediaPipe, navigateur), import avec détourage auto | Aucune pour le niveau navigateur ; GPU pour le photoréaliste |
| 3 | Restyle (tenue/décor par phrase) | à créer | — | Génération d'image à partir d'une phrase (asynchrone) | Service IA d'image |
| 4 | Photo / Vidéo | à créer | — | Génération photo (2 pts/photo), puis vidéo courte | Service IA d'image/vidéo |
| 5 | Lives (TikTok, etc.) | à créer | — | Sortie OBS → TikTok Live Studio, test réel | OBS + compte TikTok |

Socle commun déjà en place : comptes, profil, registre de points immuable, historique, paramètres, consentements micro/caméra.

## Ordre de construction (économe en crédits)

1. **Test réel Audio + Persona via OBS/VB-Cable sur WhatsApp** (aucun code nouveau tant que ce test n'a pas eu lieu).
2. **Sous-titres + mode continu** de la traduction (module 1).
3. **Suivi de mouvements MediaPipe** (module 2).
4. **Décompte réel des points** pendant une session (côté serveur, registre existant).
5. **Restyle / Photo** (modules 3–4) — décision de fournisseur et budget avant tout code.
6. **Paiement** Mobile Money/carte — décision commerciale et compte marchand requis.

## Règles pour ne pas gaspiller

- Une demande = un module. Pas de mélange landing + studio + paiement dans le même message.
- Chaque étape se termine par : tests automatiques verts + un test manuel décrit en 3 lignes.
- Les problèmes trouvés en test réel sont envoyés avec une capture et la phrase « ce que j'attendais / ce que j'ai vu ».

## Audit des écrans (état actuel)

| Écran | Rôle | Remarque |
|-------|------|----------|
| Accueil | Présentation, packs, paiements | Logos officiels, drapeaux, pack Découverte horizontal, bonus séparés |
| Connexion / Inscription / Récupération / Réinitialisation | Comptes réels | Fonctionnels, e-mail de confirmation requis |
| Tableau de bord | Solde de points + accès rapides | À recentrer sur 5 tuiles = 5 modules, avec statut (prêt / en test / à venir) |
| Points (achat) | Packs | Achat simulé, aucun paiement actif |
| Historique | Registre des points | Réel |
| Paramètres | Profil, langue, consentements | Réel |
| Studio | Appel + Persona | À découper en onglets par module (Audio, Persona, puis Restyle, Photo, Live) |
