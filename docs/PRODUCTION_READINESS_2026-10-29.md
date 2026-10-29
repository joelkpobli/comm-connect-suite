# Audit de lancement Weechat — 29 octobre 2026

## Verdict

**Pas prêt pour un lancement commercial présentant toutes les fonctions comme opérationnelles.** Une version expérimentale peut être évaluée, mais aucun déploiement ni paiement n'a été activé dans ce lot. Le backend reste exclusivement le Supabase externe existant. Aucun appel fournisseur IA n'a été effectué pendant cet audit.

## Restyle Live livré

- Nouvelle page membre `/restyle-live`, entrée du menu et accès direct depuis le tableau de bord.
- Capture webcam réelle après consentement, sans capture microphone, stockage ou transmission réseau par le module.
- Quatre effets locaux : naturel, noir et blanc, couleurs vives, contraste graphique ; intensité 0–100 %, contraste 60–160 %, réinitialisation.
- Canvas de sortie 1280 × 720, plein écran, commande commune de caméra virtuelle avec Swap Live.
- Arrêt au retrait du consentement, à la fermeture de page, au passage en arrière-plan ou à l'annulation d'une permission encore en attente.
- **Ce n'est pas une restylisation IA**, ni un changement photoréaliste de personne. Aucun tarif Restyle n'est exécuté et aucun point n'est débité par cet aperçu local. Le moteur IA reste non connecté.

## Preuves de ce lot

- Suite complète : **155 tests réussis dans 21 fichiers**. Huit nouveaux tests Restyle couvrent consentement, vidéo seule, annulation tardive, masquage, sortie, absence de réseau/stockage et bornes des effets.
- Tests de registre et d'isolation exécutés par la suite existante sur son environnement Supabase configuré : ce n'est pas une certification complète des paramètres hébergés ni du parcours membre de production.
- Aperçu : dernières entrées de compilation `build OK`.
- Navigateur : `/restyle-live` sans session redirige bien vers `/connexion`.
- Montage **isolé du composant**, sans contourner le contrôle d'accès aux données : capture de caméra synthétique Chromium, effet sélectionné, image non vide, retrait du consentement et `video.srcObject === null` après arrêt. Aucun message d'erreur JavaScript ; pas de dépassement horizontal à 390 px.
- Les captures d'écran montrent un signal synthétique, **pas une webcam physique ni une personne**.
- La session propriétaire n'est pas disponible avec le Supabase externe non géré : **parcours membre connecté de bout en bout non vérifié**. Aucun identifiant demandé, aucun compte propriétaire choisi arbitrairement.
- Les tests audio valident des adaptateurs, messages et conversions, pas un appel audio réel. Aucune consommation de crédit Palabra/Deepgram/DeepL pendant cet audit.

## Tout ce qui reste avant un lancement complet

| Priorité | Chantier | État constaté / action de sortie |
|---|---|---|
| P0 | Restyle IA | Choisir un moteur autorisé pour usage commercial et compatible budget, le connecter côté serveur ou natif ; valider résultat, mouvements, qualité et latence. Les filtres locaux ne remplacent pas ce moteur. |
| P0 | Swap Live réel | MediaPipe suit le visage et anime/superpose une photo 2D ; pas de face swap photoréaliste. Moteur, licences, matériel GPU/coût et essais longue durée restent nécessaires. |
| P0 | Swap Photo et vidéo | Import et sélection existent ; moteur de transformation non connecté. Vérifier photo source/cible autorisée, erreurs, téléchargement, coût approuvé. La transformation de fichiers vidéo n'est pas implémentée. |
| P0 | Traduction continue fiable | Palabra **est bien connecté dans le code** : fonctions `palabraSession`/`palabraStatus`, WebSocket et AudioWorklet. Ne pas confondre absence d'essai actuel et absence de code. Restent microphone réel, qualité, latence mesurée, quotas et droits fournisseur ; ne pas promettre moins d'une seconde sans mesure. |
| P0 | Sécurité des démarrages audio | Le code actuel débite avant l'autorisation micro et avant confirmation du fournisseur. Annuler pendant les opérations asynchrones peut laisser des résultats tardifs reprendre. Ajouter génération/annulation, délais maximum, gestion d'erreur AudioContext/Worklet, libération URL temporaire et arrêt sur erreur fournisseur. Aucun débit injustifié en cas d'échec ne doit subsister. |
| P0 | Session et consommation serveur | Montants fixés serveur et références uniques existent. Mais la session/bloc restent demandés par le navigateur ; session autorisée et compteur temporel ne sont pas durablement contrôlés serveur. Tester saut/rejeu/concurrence de blocs, arrêt pendant débit, réponse perdue et lecture de solde échouée. Encadrer l'accès au jeton Palabra par une session financée/limitée pour éviter l'utilisation hors décompte. |
| P0 | Arrêt Swap Live | Capture et MediaPipe ont aussi des opérations asynchrones : tester arrêt pendant chargement ou permission tardive, erreurs en boucle, retrait du consentement et épuisement solde. Supprimer les assertions non-null existantes en ajoutant des gardes lors de cette correction. |
| P0 | Application Windows et pilotes | Pont web vers `virtual_camera_push` **existe**, maintenant partagé avec Restyle. Le compagnon et la DLL restent non compilés/non testés sur Windows ; récupérer/construire dépendances, vérifier licences et architecture, installer sans fausse réussite, désinstaller proprement, tester caméra reconnue et frames reçues. Aucun installateur utilisable certifié dans ce lot. |
| P0 | Audio sans OBS/VB-Cable | Sortie `setSinkId` existe mais les erreurs sont actuellement ignorées dans le streaming. Afficher une erreur, ne pas rediriger silencieusement vers les haut-parleurs. Fournir une solution native audio autorisée si l'objectif est zéro outil tiers ; VB-Cable n'est qu'une passerelle manuelle temporaire. |
| P0 | Appels et lives réels | Tester WhatsApp, Zoom, Meet, Messenger, Instagram, TikTok et les autres plateformes ciblées individuellement, versions desktop/web/mobile distinctes. Caméra virtuelle reconnue, voix traduite reçue par une deuxième personne, sens retour, sous-titres, latence et stabilité. Rien ne prouve aujourd'hui une compatibilité universelle. |
| P0 | Paiement | Aucun checkout/webhook réel. Contrat marchand et frais à accepter, fournisseur, commande durable, vérification serveur, attribution atomique idempotente, échecs/remboursements et test sandbox. Pas de paiement réel sous contrainte de zéro dépense sans décision propriétaire. |
| P0 | Catalogue commercial cohérent | Le serveur applique actuellement **2 points/s Swap Live, prépayés par blocs de 10 s** ; traduction via solde audio séparé. L'ancien résumé 3 points/min et 1 point/min n'est pas le code courant. Certaines quantités de photos des plans contredisent les 2 points/photo annoncés ; durées, expiration, bonus et accès caméra « à vie » ne sont pas des droits exécutés. Approuver les règles, synchroniser affichages/calculs/registre et implémenter les droits avant vente. Aucun tarif changé dans cet audit. |
| P0 | Authentification publiée | Confirmer Site URL, redirections, confirmation obligatoire, délivrabilité SMTP ; inscription, renvoi, récupération, changement de mot de passe et déconnexion avec vraie boîte mail. Les anciens contrôles ne certifient pas la configuration du jour. |
| P1 | Catalogue et identités | Vérifier licences de chaque photo/logo/modèle et autorisation d'usage commercial ; consentement des personnes/voix, imports, suppression de toutes les références au retrait, politique anti-usurpation et signalement. Clonage de timbre expérimental, non garanti. |
| P1 | Langues et bidirectionnalité | 48 codes configurés dans l'interface ; « 60+ » fournisseur n'est pas 60+ langues toutes testées dans Weechat. Vérifier source/cible/voix par langue et réception retour. Le panneau streaming actuel traite une direction ; une conversation simultanément bidirectionnelle ne découle pas du seul bouton d'inversion. |
| P1 | Documentation et messages anciens | `provider-audit.ts`, `KNOWN_LIMITATIONS` et plusieurs mentions de dashboard/prototype sont anciennes et parfois contradictoires. Reconstituer une source d'état par fonction, distinguer opérationnel/testé/expérimental/non disponible ; ne pas interpréter le registre ancien comme absence de Palabra. |
| P1 | Exploitation | Sauvegarde/restauration, journaux sans secrets/audio, surveillance, limites anti-abus, alertes quotas, CSP dépendances externes, panne fournisseur et stratégie de retour arrière. Hébergement gratuit et crédits d'essai ne garantissent pas une exploitation gratuite illimitée. |
| P1 | Contrôles finaux | Tests tablette/mobile/Windows, réseau lent/perdu, permissions refusées, changement périphérique, deux onglets, session expirée, accessibilité et tous boutons membre. Audit dépendances/sécurité puis autorisation explicite et essai sur l'URL publiée. |

## Séquence de validation avec le propriétaire sur Windows

1. **Préflight sans dépense** : connexion au compte habituel ; relever Windows/navigateur, présence casque/micro/webcam, soldes Points et Audio ; vérifier plafond fournisseur et quota d'essai. Pas de recharge réelle ni de clé dans une capture.
2. **Restyle local** : ouvrir `/restyle-live`, vérifier consentement et permission, essayer chaque effet et réglage, plein écran/Échap, retirer consentement, changer d'onglet. La LED caméra doit s'éteindre ; aucun mouvement de points dans l'historique.
3. **Swap Live local** : vérifier droits photo, capture/suivi tête/bouche/clignements, arrêt pendant chargement et après démarrage, solde et historique. Le module existant est facturé par blocs : ne pas le démarrer pour un essai gratuit sans traiter le financement/échec de démarrage.
4. **Audio**, après validation du quota et du cycle démarrage/arrêt : FR→EN puis EN→FR, phrase parlée, transcription, sous-titres, sortie audible casque ; mesurer délai et qualité. Répéter avec refus micro, erreur fournisseur et arrêt immédiat. Vérifier le solde Audio, pas seulement Points.
5. **Appel WhatsApp à deux personnes** : sélectionner CABLE Input comme sortie traduite et CABLE Output comme micro WhatsApp, sans double écoute ; valider ce que reçoit l'autre personne puis sens retour. OBS peut rester utilisé temporairement pour comparer la vidéo.
6. **Sans OBS** : uniquement après compilation/installation du compagnon et de la DLL ; démarrer diffusion, sélectionner Weechat Virtual Camera dans l'application destinataire, vérifier mouvement/image, arrêt, reconnexion et désinstallation. La présence de la DLL ou du registre ne prouve pas la réception d'images.
7. **Endurance** : 10–15 minutes sur machine réelle, surveiller CPU/GPU, synchronisation lèvres/audio, coupures, changement de langues, épuisement solde et arrêt des appareils. Consommation fournisseur uniquement après accord et plafond vérifié.
8. **Publication** : seulement avec autorisation ; répéter les mêmes parcours sur `https://comm-connect-suite.lovable.app`, compte réel et deuxième participant.

## Ordre de construction économique conseillé

1. Fiabiliser démarrage/annulation/facturation et empêcher les appels IA non financés.
2. Valider une conversation FR↔EN réelle avec le propriétaire, sans nouvelle intégration.
3. Compiler et valider la sortie Windows sur le PC cible.
4. Sélectionner un seul moteur photo/live/restyle compatible budget/licence ; si aucun ne respecte 0 €, maintenir clairement les options expérimentales, sans les vendre comme opérationnelles.
5. Rendre le catalogue commercial cohérent, puis connecter le paiement en sandbox après accord marchand.
6. Tests de réception complets, exploitation et lancement approuvé.

**Blocages externes :** PC Windows et appareils physiques, session utilisateur, deuxième participant, validation commerciale/licences et plafonds fournisseur, paramètres SMTP/marchand et autorisation de publication. Aucun de ces contrôles ne peut être remplacé par une vidéo synthétique ou une suite de tests unitaires.