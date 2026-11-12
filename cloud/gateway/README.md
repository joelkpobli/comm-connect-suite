# Weechat Cloud Live — passerelle GPU

Webcam (PC, capteur de mouvements) → WebRTC → serveur GPU → avatar animé → WebRTC → Weechat Camera.

## Moteur `liveportrait_engine` (LivePortrait, MIT)
- L'utilisateur choisit un avatar du catalogue (`avatars/<id>.jpg`) : sa tenue et son décor restent ceux de l'avatar.
- La webcam ne fournit que les mouvements (tête, regard, bouche, expressions). Si le visage est perdu, l'avatar reste affiché, jamais la vraie webcam.
- Limite : anime un portrait / haut du corps. Pas de corps entier qui danse ou saute.
- Statut : **non validé sur GPU** (aucun pod testé). `WEECHAT_ENGINE=passthrough` reste disponible pour un test réseau.

## Test (~0,40 $/h sur RTX 4090, dépôt minimum RunPod ≈ 10 $)
1. Ajouter des photos d'avatars dans `avatars/`, puis `docker build -t weechat-gateway .`
2. Variables : `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (publique).
3. Exposer 8443, ouvrir `/health`, lancer `weechat_cloud.py --server ... --token ... --avatar <id>`.
4. **Éteindre le pod après le test.** Aucune image n'est enregistrée.
