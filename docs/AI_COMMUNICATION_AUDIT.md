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

## Lot 2 — adaptateurs réels (mode réel séparé du mode simulé)
- `real-providers.server.ts` : Deepgram (reconnaissance), DeepL (traduction), ElevenLabs (voix). Côté serveur uniquement, erreur `missing_provider_key` explicite sans clé, aucun repli simulé.
- `communication.functions.ts` : fonctions serveur authentifiées (connexion requise), validation des langues fr/en/es/de/pt et des tailles.
- Simulations conservées uniquement dans les tests.
- Avatar : non intégré, non déclaré fonctionnel (aucun flux vidéo réel testé).
- Windows : voir `docs/WINDOWS_VIRTUAL_DEVICES.md`.

### Offres gratuites (à confirmer par le propriétaire lors de l'inscription)
| Service | Offre | Clé serveur |
|---|---|---|
| DeepL API Free | 500 000 caractères/mois | `DEEPL_API_KEY` (finit par `:fx`) |
| Deepgram | crédit d'essai à l'inscription | `DEEPGRAM_API_KEY` |
| ElevenLabs Free | ~10 000 caractères/mois, usage commercial non autorisé en gratuit | `ELEVENLABS_API_KEY` |

Premier parcours testable une fois les clés fournies : texte FR → EN (DeepL seul), puis FR parlé → EN entendu.
Tests réels fournisseurs : **non exécutés** (aucune clé). Coûts engagés : 0 €.

## Réévaluation 2026-10-22 — Deepgram fournisseur unique STT + TTS

Sources officielles : developers.deepgram.com/docs/tts-models, /docs/tts-models-languages-overview, deepgram.com/pricing.

- **STT Nova-3** (`/v1/listen?model=nova-3`) : fr, en, es, de, pt pris en charge.
- **TTS Aura-2** (`/v1/speak`) : en, es, de, fr, nl, it, ja. **Portugais non pris en charge** → erreur explicite `unsupported_language`. Flux TTS (`/v2/speak`) est anglais uniquement.
- Voix retenues : en `aura-2-thalia-en`, fr `aura-2-agathe-fr`, es `aura-2-celeste-es`, de `aura-2-julius-de`.
- Crédit de démarrage : 200 $ offerts, sans carte bancaire, sans expiration annoncée (Pay As You Go). TTS ≈ 0,045 $ / 1 000 caractères (page produit). Concurrence PAYG : 50 REST STT, 45 TTS. À reconfirmer dans la console au moment de l'inscription.
- ElevenLabs retiré : gratuit sans usage commercial, et une clé de moins à gérer.
- Traduction : DeepL API Free conservé (`DEEPL_API_KEY`, se termine par `:fx`).

Implémentation : `deepgramSynthesize`, `relayTurn` (fr→en puis retour en→fr) et la fonction serveur authentifiée `realRelay`. Clé absente → `missing_provider_key`, jamais de repli simulé. Les réponses simulées existent uniquement dans `src/test/real-providers.test.ts`.

### Premier test réel — actions nécessaires
1. Créer un compte sur console.deepgram.com (sans carte), créer une clé API.
2. Créer un compte DeepL API Free et copier la clé `…:fx`.
3. Me demander d'enregistrer `DEEPGRAM_API_KEY` et `DEEPL_API_KEY` dans les secrets du serveur.
4. Se connecter à Weechat et enregistrer une courte phrase en français ; vérifier transcription, traduction anglaise et voix anglaise, puis le retour anglais → français.

## Étude DeepL Voice API (documentation officielle)

Sources : developers.deepl.com/docs/voice/overview, /docs/voice/supported-voice-languages, /docs/voice/voice-api-requirements, /api-reference/voice/request-session, /api-reference/voice/deepl-voice-api-service-specification-updates ; support.deepl.com « DeepL API plans », « Usage count and billing ».

- **Accès gratuit : non.** Le plan Developer/Free (clé `:fx`) n'inclut pas la Voice API ; abonnement payant API Growth (ou Enterprise) obligatoire. Les plans « DeepL Voice » (applications) ne donnent pas accès à l'API.
- **Sortie :** une session WebSocket fournit transcription, traduction texte (≤ 5 cibles) **et voix traduite audible** (≤ 1 cible vocale par session).
- **Langues :** fr, en (US/UK), es, de, pt (PT et BR) supportées en transcription, traduction et voix — couvre le portugais, absent de Deepgram Aura-2.
- **Facturation :** à la minute audio, arrondie à la minute supérieure, en plus d'un abonnement fixe. Prix non lus directement sur deepl.com : sources tierces (~26–32,50 $/mois Growth, ~0,062 $/min speech-to-speech) **à confirmer**. Usage commercial couvert par les plans payants ; pas d'entraînement sur données clients.
- **Latence :** aucune valeur officielle chiffrée ; non mesurée ici. Contraintes : morceaux 50–250 ms recommandés (≤ 100 Ko / 1 s), flux ≤ 2× temps réel, fermeture après 30 s sans audio, reconnexion à gérer côté client.
- **Intégration :** POST `/v3/voice/realtime` côté serveur (clé secrète) → jeton éphémère à usage unique → WebSocket ouverte par le navigateur ; la clé ne quitte jamais le serveur. Nécessite un nouveau client streaming (actuellement le relais est requête/réponse).
- **Remplacement :** pourrait remplacer tout le pipeline Deepgram STT + DeepL texte + Aura-2, mais **incompatible avec le budget 0,00 €**.

**Recommandation :** conserver Deepgram Nova-3 + DeepL API Free + Aura-2 pour le prototype ; réévaluer DeepL Voice API dès qu'un budget est approuvé (gain : un seul flux, portugais vocal). Aucun appel effectué, aucune dépense.

## 2026-10-23 — Connexion réelle Deepgram + DeepL (état)
- Secrets serveur `DEEPGRAM_API_KEY` et `DEEPL_API_KEY` : **absents** à cette date ; aucun appel réel effectué, aucun test réel déclaré réussi.
- Adaptateurs : erreurs `provider_unreachable` (réseau) et `invalid_response` (réponse illisible/vide) ajoutées ; clés DeepL non `:fx` refusées (budget 0 €, seul `api-free.deepl.com` est utilisé).
- Interface : Paramètres → Communication → « Essai réel : enregistrer et traduire » (consentement explicite, 8 s max, micro coupé après enregistrement et à la sortie de l'écran, aucune conservation). Sens FR→EN, EN→FR, FR→ES, FR→DE. Portugais : reconnaissance et traduction possibles, pas de voix Aura-2 → erreur explicite.
- Tests automatisés (simulés, sans réseau) : 13 dans `src/test/real-providers.test.ts`.
- Coûts : Deepgram consomme le crédit d'essai offert (pas de carte) ; DeepL Free 500 000 caractères/mois. Aucune dépense engagée.
- Non opérationnel : caméra/micro virtuels, WhatsApp/Instagram/TikTok, avatar animé.
- **Premier essai réel (2026-10-23, serveur, vraies API)** : phrase française produite par Deepgram Aura (voix Agathe) puis relais complet. FR→EN : transcription exacte, traduction « Hello, I'm calling to confirm our appointment for tomorrow. », MP3 18 576 octets, 2 490 ms. EN→FR : « Bonjour. Je peux te retrouver demain à dix heures. », MP3 24 048 octets, 2 389 ms. Latence au-dessus de l'objectif de 1 800 ms (mode tour par tour, non streaming). Micro réel non testé (aucun appareil dans l'environnement).

## Naturel des voix — 2026-10-23
Source : developers.deepgram.com/docs/tts-models et /docs/tts-media-output-settings.
- Ancien réglage : MP3 imposé par Deepgram à 22 050 Hz / 48 kbps (compression audible). Nouveau : linear16 WAV 24 kHz (format REST par défaut, non compressé).
- Voix documentées retenues pour comparaison : FR Agathe, Hector ; EN Thalia, Helena, Arcas, Apollo, Draco ; DE Julius, Viktoria ; ES Celeste. PT : aucune voix Aura-2.
- Texte : seule une ponctuation finale est ajoutée si absente ; aucun mot modifié, aucun SSML, aucune accélération.
- Latence détaillée affichée : reconnaissance / traduction / voix.
- Mesure réelle (même phrase, temps total HTTP) : MP3 Agathe 1,87 s, WAV Agathe 1,98 s, Hector 2,10 s ; MP3 Thalia 1,71 s, WAV Thalia 2,49 s, Helena 2,75 s, Arcas 2,49 s, Apollo 3,49 s, Draco 1,89 s. Une seule mesure, variable selon le réseau.
- Échantillons dans Files « comparaison-voix ». Naturel NON validé : écoute humaine comparative requise. Les tests automatisés ne vérifient que format, voix autorisées et erreurs.

## 2026-10-23 — Persona visuel et voix de référence (Studio d'appel)
- Catalogue : 6 portraits et 6 arrière-plans (salon, piscine, salle de bain, bureau, café, jardin) générés par IA pour Weechat, sans droits tiers.
- Imports utilisateur : photo et arrière-plan (JPG/PNG/WebP ≤ 8 Mo) après attestation de droits ; restent dans le navigateur (aucun envoi, aucun stockage).
- Composition locale à deux couches (fond + visage) avec flou réglable et mention « Image générée par IA » (AI Act art. 50). Image fixe : aucun suivi des mouvements.
- Voix de référence : enregistrement ou import 10–30 s après attestation ; locale uniquement. Clonage vocal NON branché (Deepgram Aura-2 ne le propose pas ; options : Cartesia / ElevenLabs payants, XTTS/OpenVoice sur GPU).
- Non vérifié : affichage connecté (session de test impossible sur Supabase externe), vrai micro.
