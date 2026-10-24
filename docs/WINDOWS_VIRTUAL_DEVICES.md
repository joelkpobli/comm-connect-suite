# Weechat Companion pour Windows — architecture

Statut : **conçu, non construit**. Aucun binaire, pilote, certificat ni compatibilité n'existe à ce jour. Rien de ce document ne peut être réalisé depuis le navigateur.

## 1. Rôle
Le navigateur peut lire webcam et micro, mais ne peut pas créer de périphérique système. WhatsApp Desktop, Zoom, Teams, Meet (navigateur), Messenger et TikTok LIVE Studio ne voient que les périphériques Windows. L'application compagnon déclare :
- **Weechat Virtual Camera** (vidéo du persona composé) ;
- **Weechat Virtual Microphone** (voix traduite uniquement).

```text
Webcam/Micro réels ─► Capture (Media Foundation / WASAPI)
                         │
                         ▼
               Pipeline temps réel
   audio : STT streaming ─► traduction ─► TTS streaming
   vidéo : suivi visage local ─► rendu persona (GPU local ou distant)
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
  Caméra virtuelle (MF)        Micro virtuel (pilote audio)
          └──────────► Application d'appel ◄──────────┘
```

## 2. Composants
| Bloc | Technologie retenue | Remarques |
|---|---|---|
| Interface, zone de notification | Tauri 2 (Rust + interface web Weechat) | ~15 Mo, réutilise la charte |
| Capture | Media Foundation (vidéo), WASAPI (audio) | modes exclusifs évités |
| Caméra virtuelle Win11 22000+ | `MFCreateVirtualCamera`, source COM en mode utilisateur | pas de pilote noyau ; DLL signée |
| Caméra virtuelle Win10 | Filtre source DirectShow | couverture partielle (apps UWP/Store non garanties) |
| Micro virtuel | Pilote audio tiers sous licence OEM **ou** pilote KMDF/SysVAD propre | propre = signature attestation Microsoft + certificat EV |
| Transport interne | Mémoire partagée / texture D3D11 partagée (NV12, 1280×720, 30 i/s) | latence cible < 5 ms |
| Audio réel | Deepgram STT → DeepL → Deepgram Aura-2 (adaptateurs existants côté serveur Weechat) | clés jamais dans l'application |
| Suivi visage | MediaPipe Face/Pose via ONNX Runtime (CPU/DirectML) | local, aucun envoi d'images brutes pour le suivi |
| Rendu persona | Niveau A : image fixe + mouvements simples ; niveau B : modèle d'animation sur GPU | niveau B non réalisable à budget 0 € |

## 3. Échanges avec Weechat
- Connexion : flux appareil (code affiché, validation dans le compte web) ; jeton court stocké dans le Gestionnaire d'identifiants Windows.
- L'application ne reçoit jamais les clés Deepgram/DeepL : elle obtient du serveur Weechat un jeton éphémère ou passe par un relais serveur.
- Points : le serveur reste seul à débiter le registre (`post_credit_operation`, référence unique par session et tranche). L'application n'envoie que des preuves d'usage horodatées ; arrêt du flux si le solde est épuisé.
- Contrat de messages (WebSocket, JSON) : `session.start` (langues, voix, persona), `audio.chunk`, `transcript.partial|final`, `translation.final`, `tts.chunk`, `usage.tick`, `session.stop`, `error` (code explicite, jamais de bascule silencieuse en simulation).

## 4. Latence cible (non mesurée)
Audio : STT 250–300 ms + traduction 100–200 ms + premier son TTS 300–500 ms ≈ **0,7–1 s** en streaming (contre ~2,5 s mesurés aujourd'hui phrase par phrase). Vidéo : < 100 ms en rendu local.

## 5. Sécurité et confidentialité
- Aucune conservation audio/vidéo ; aucun enregistreur.
- Le micro virtuel n'émet que la voix traduite ; le son reçu va au casque et n'est pas réinjecté (anti-écho).
- Indicateur visible « diffusion active » et arrêt en un clic ; arrêt automatique à la fermeture ou en veille.
- Personas : seulement images du catalogue licencié ou importées avec attestation de droits ; mention d'IA, interdiction d'usurpation (règles 18+ du site).
- Mises à jour signées ; installation administrateur une seule fois, usage en droits standard.

## 6. Prérequis humains et coûts (non engagés)
| Besoin | Ordre de grandeur | Bloquant pour |
|---|---|---|
| Certificat de signature de code OV/EV | ~200–600 €/an | installation sans alerte SmartScreen |
| Compte Microsoft Partner Center + attestation pilote | frais + délai | micro virtuel propre |
| Licence pilote audio tiers | à négocier | micro virtuel sans développement noyau |
| PC Windows 10/11 réel avec webcam/micro | — | tout test réel |
| GPU (local RTX 3060+ ou serveur) | variable | rendu persona niveau B |

## 7. Plan de livraison
1. **P0 — Prototype caméra** : DLL `MFCreateVirtualCamera` diffusant une mire, vérifiée dans Zoom, Teams et WhatsApp Desktop.
2. **P1 — Micro virtuel** : pilote sous licence, lecture d'un fichier test, vérification dans les mêmes applications.
3. **P2 — Audio traduit en streaming** relié au compte Weechat et au débit de points.
4. **P3 — Persona niveau A** (image composée + suivi simple).
5. **P4 — Persona niveau B** sur GPU, après décision budgétaire.

## 8. Compatibilité
Aucune compatibilité n'est revendiquée avant test réel sur machine cible. Matrice à remplir : WhatsApp Desktop, Zoom, Teams, Google Meet (Chrome/Edge), Messenger (web), Instagram (web), Telegram Desktop, Discord, TikTok LIVE Studio. Téléphones (Android/iOS) : périphériques virtuels impossibles sans root/jailbreak ; hors périmètre.
