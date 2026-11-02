# Weechat Cloud Live — passerelle GPU (Option 1)

Webcam (PC) → WebRTC → ce serveur GPU → moteur d'avatar → WebRTC → Weechat → Unity Video Capture.

## Statut honnête
- Transport WebRTC, vérification du compte Weechat et limite de sessions : prêts.
- Moteur d'avatar complet (corps, tenue, décor) : **pas encore choisi ni validé**. Le mode
  `passthrough` renvoie l'image d'origine pour tester la latence réseau seulement.
- Débit de points : non branché ; aucun accès payant tant qu'il ne l'est pas.

## Lancer un test (coût : temps de pod uniquement, ~0,40 $/h sur RTX 4090)
1. RunPod → Deploy → Custom image construite depuis ce dossier (`docker build -t weechat-gateway .`).
2. Variables : `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (clé publique), `WEECHAT_ENGINE=passthrough`.
3. Exposer le port TCP/HTTP 8443, puis ouvrir `https://<pod>/health`.
4. **Éteindre le pod après le test.**

Aucune image n'est enregistrée sur le serveur.
