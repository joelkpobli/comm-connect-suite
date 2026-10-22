# Audit technique — communication IA (lot 1)

Source : directive « Audit technique et prototype réel de communication IA ». Aucun chiffre de latence fournisseur n'est retenu sans mesure dans ce projet.

## Statut
| Module | Statut |
|---|---|
| Capture micro/caméra, consentements, photo autorisée effaçable | Implémenté (validé synthétiquement, matériel à tester) |
| Orchestrateur de traduction fr/en/es/de/pt (`translation-pipeline.ts`) : états, annulation, erreurs, chemin retour, mesure de latence par étape | Implémenté, testé avec adaptateurs **simulés** uniquement |
| Reconnaissance, traduction, synthèse réelles | Bloqué : clé API / dépenses / licence |
| Avatar animé temps réel | Bloqué : clé API payante (Simli, HeyGen, Tavus) ou serveur GPU + revue licences (LivePortrait, MuseTalk) |
| Transport WebRTC | Non construit : serveur de signalisation et TURN requis |
| Caméra / micro virtuels Windows | Non réalisable dans le navigateur : application native signée + pilote audio |

Registre détaillé des fournisseurs et blocages : `src/lib/weechat/provider-audit.ts`.

## Points d'attention
- L'API Web Speech de Chrome envoie l'audio aux serveurs Google : écartée (règle zéro rétention).
- LivePortrait : poids InsightFace non commerciaux — usage commercial non autorisé sans licence.
- Windows : `MFCreateVirtualCamera` (Windows 11) expose une caméra ; le micro virtuel exige un pilote signé. Aucune compatibilité WhatsApp/Instagram/TikTok n'est revendiquée avant installation et test réels.

## Prototype avatar minimal (prêt à brancher)
Portrait autorisé → `AvatarAnimator.animate(audio, image)` → flux vidéo → mesure latence. Il manque uniquement un fournisseur approuvé et ses identifiants, stockés côté serveur.

## Actions humaines
1. Choisir un fournisseur avatar et fournir une clé (essai gratuit si existant) ou un serveur GPU.
2. Choisir STT/traduction/TTS (ex. clé DeepL Free) et accepter les conditions.
3. Valider le budget : tout fournisseur hébergé implique un coût à l'usage.
4. Machine Windows 11 + certificat de signature pour le module natif.

Coûts engagés : 0 €.
