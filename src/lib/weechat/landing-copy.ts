// Landing page content (fr/en). Faces are real Unsplash photographs (Unsplash License, free commercial use, adults).
// Hero clips are short excerpts from the owner's own facEvo demo recordings (user-provided material).
export const landingFaces = [
  { id: 'f1', src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&h=1100&q=80', label: 'Léa · FR' },
  { id: 'f2', src: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&h=1100&q=80', label: 'Marco · ES' },
  { id: 'f3', src: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=900&h=1100&q=80', label: 'Awa · EN' },
  { id: 'f4', src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&h=1100&q=80', label: 'Jonas · DE' },
  { id: 'f5', src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&h=1100&q=80', label: 'Sofia · PT' },
];

// --- Pricing model: points (pts), never call minutes as a currency. ---
// Consumption rules (presentation): Swap Live 2 pts/s · Restyle 2 pts/s · Photo 2 pts/photo.
export type Currency = 'XOF' | 'EUR' | 'USD';
export type PlanPrice = Record<Currency, string>;
export type Plan = {
  id: string;
  name: string;
  badge?: string;
  popular?: boolean;
  price: PlanPrice;
  points?: number;
  audioMin?: number;
  bonusAudioMin?: number;
  aiTokens?: number;
  validity: number; // days
  lines: { fr: string[]; en: string[] };
};

export const swapPlans: Plan[] = [
  {
    id: 'decouverte', name: 'Pack Découverte', badge: 'Offre découverte', price: { XOF: '4 999', EUR: '7,60', USD: '8,30' }, points: 417, validity: 7,
    lines: { fr: ['Visage en direct sur votre webcam', 'Valable 7 jours'], en: ['Live face on your webcam', 'Valid 7 days'] },
  },
  {
    id: 'starter', name: 'Starter', price: { XOF: '19 900', EUR: '30,50', USD: '33' }, points: 1658, validity: 30,
    lines: { fr: ['Live : 13 min 49 s', 'Studio Diffusion Vidéo : 27 min 38 s', 'Valable 30 jours'], en: ['Live: 13 min 49 s', 'Studio Video Broadcast: 27 min 38 s', 'Valid 30 days'] },
  },
  {
    id: 'standard', name: 'Standard', popular: true, price: { XOF: '49 900', EUR: '76', USD: '83' }, points: 3960, bonusAudioMin: 30, validity: 90,
    lines: { fr: ['Live : 33 min', 'Studio Diffusion Vidéo : 66 min', 'Studio Transformation Avatar : 13 min 12 s', 'Bonus : Traduction 30 min', 'Valable 90 jours'], en: ['Live: 33 min', 'Studio Video Broadcast: 66 min', 'Studio Avatar Transformation: 13 min 12 s', 'Bonus: 30 min translation', 'Valid 90 days'] },
  },
  {
    id: 'premium', name: 'Premium', price: { XOF: '84 900', EUR: '129', USD: '141' }, points: 5640, bonusAudioMin: 60, validity: 365,
    lines: { fr: ['Live : 47 min', 'Live visage + voix traduite', 'Studio Diffusion Vidéo : 94 min', 'Studio Transformation Avatar : 18 min 48 s', 'Bonus : Traduction 1 h', 'Caméra virtuelle à vie incluse', 'Valable 365 jours'], en: ['Live: 47 min', 'Live face + translated voice', 'Studio Video Broadcast: 94 min', 'Studio Avatar Transformation: 18 min 48 s', 'Bonus: 1 h translation', 'Lifetime virtual camera included', 'Valid 365 days'] },
  },
  {
    id: 'ultimate', name: 'Ultimate', price: { XOF: '150 000', EUR: '229', USD: '250' }, points: 11400, bonusAudioMin: 120, validity: 365,
    lines: { fr: ['Live : 1 h 35 min', 'Live visage + voix traduite', 'Studio Diffusion Vidéo : 3 h 10 min', 'Studio Transformation Avatar : 38 min', 'Bonus : Traduction 2 h', 'Caméra virtuelle à vie incluse', 'Valable 365 jours'], en: ['Live: 1 h 35 min', 'Live face + translated voice', 'Studio Video Broadcast: 3 h 10 min', 'Studio Avatar Transformation: 38 min', 'Bonus: 2 h translation', 'Lifetime virtual camera included', 'Valid 365 days'] },
  },
];

export const audioPlans: Plan[] = [
  {
    id: 'audio-flash', name: 'Audio Flash', price: { XOF: '4 999', EUR: '7,60', USD: '8,30' }, audioMin: 10, validity: 30,
    lines: { fr: ['10 min de traduction vocale', '48 langues', 'Sens de traduction au choix', 'Valable 30 jours'], en: ['10 min of voice translation', '48 languages', 'Choose translation direction', 'Valid 30 days'] },
  },
  {
    id: 'audio-pro', name: 'Audio Pro', popular: true, price: { XOF: '22 900', EUR: '35', USD: '38' }, audioMin: 60, validity: 30,
    lines: { fr: ['1 h de traduction vocale', '48 langues', 'Sens de traduction au choix', 'Voix traduite et sous-titres', 'Valable 30 jours'], en: ['1 h of voice translation', '48 languages', 'Choose translation direction', 'Translated speech and subtitles', 'Valid 30 days'] },
  },
  {
    id: 'audio-marathon', name: 'Audio Marathon', price: { XOF: '39 900', EUR: '61', USD: '66' }, audioMin: 120, validity: 60,
    lines: { fr: ['2 h de traduction vocale', '48 langues', 'Sens de traduction au choix', 'Voix traduite et sous-titres', 'Support prioritaire', 'Valable 60 jours'], en: ['2 h of voice translation', '48 languages', 'Choose translation direction', 'Translated speech and subtitles', 'Priority support', 'Valid 60 days'] },
  },
];

// AI token packs (Studio IA: Swap Photo 2, image 5, talking photo 3/s). Separate wallet, not usable for Live or audio.
const tk = (n: number) => ({ fr: [`${n / 2} Swap Photos`, `ou ${Math.floor(n / 5)} images IA`, `ou ${Math.floor(n / 3)} s de photo parlante`, 'Valable 365 jours'], en: [`${n / 2} Swap Photos`, `or ${Math.floor(n / 5)} AI images`, `or ${Math.floor(n / 3)} s of talking photo`, 'Valid 365 days'] });
export const tokenPlans: Plan[] = [
  { id: 'tokens-100', name: 'Mini IA', price: { XOF: '1 000', EUR: '1,50', USD: '1,70' }, aiTokens: 100, validity: 365, lines: tk(100) },
  { id: 'tokens-260', name: 'Créateur IA', price: { XOF: '2 500', EUR: '3,80', USD: '4,20' }, aiTokens: 260, validity: 365, lines: tk(260) },
  { id: 'tokens-550', name: 'Studio IA', popular: true, price: { XOF: '5 000', EUR: '7,60', USD: '8,30' }, aiTokens: 550, validity: 365, lines: tk(550) },
  { id: 'tokens-1200', name: 'Pro IA', price: { XOF: '10 000', EUR: '15,25', USD: '16,70' }, aiTokens: 1200, validity: 365, lines: tk(1200) },
];

export const consumption = { live: 2, restyle: 2, photo: 2 }; // pts per second / per photo
// Studio points per second of video: Case 1 streams a ready video, Case 2 transforms it (costs more).
export const studioRates = { cas1: 1, cas2: 5 };
// Weechat Camera: one-time lifetime licence (FCFA), included in Premium and Ultimate.
export const cameraLicense = { priceXOF: 10000, price: { XOF: '10 000', EUR: '15,25', USD: '16,70' }, includedIn: ['premium', 'ultimate'] };

// Mobile Money coverage: 24 African countries (ISO 3166 code for the official flag + name).
export const momoCountries: [string, string][] = [
  ['ci', 'Côte d’Ivoire'], ['sn', 'Sénégal'], ['bj', 'Bénin'], ['tg', 'Togo'], ['ml', 'Mali'],
  ['bf', 'Burkina Faso'], ['ne', 'Niger'], ['gn', 'Guinée'], ['gw', 'Guinée-Bissau'], ['gh', 'Ghana'],
  ['ng', 'Nigeria'], ['sl', 'Sierra Leone'], ['cm', 'Cameroun'], ['cg', 'Congo-Brazzaville'], ['cd', 'Congo-Kinshasa'],
  ['ga', 'Gabon'], ['ke', 'Kenya'], ['rw', 'Rwanda'], ['ug', 'Ouganda'], ['tz', 'Tanzanie'],
  ['zm', 'Zambie'], ['mw', 'Malawi'], ['mz', 'Mozambique'], ['td', 'Tchad'],
];
export const momoOperators = ['Wave', 'Orange Money', 'MTN MoMo', 'Moov Money', 'Airtel Money'];

type L = 'fr' | 'en';
const fr = {
  heroTitle: ['Changez d’apparence.', 'Traduisez en direct.'],
  heroText: 'Persona, voix et traduction pour vos appels, lives et streams — Weechat accompagne vos applications existantes.',
  start: 'Commencer', pricing: 'Voir les tarifs', login: 'Connexion',
  heroNote: 'Paiement sécurisé Mobile Money et carte · points sans abonnement',
  liveTag: 'LIVE', langTag: 'FR → EN',
  bandEyebrow: 'Pensé pour vos appels et lives', bandTitle: 'Transformez. Traduisez. Sur vos plateformes.',
  specs: ['48 langues', 'Compatible WhatsApp, TikTok, Instagram', 'Pas d’enregistrement Weechat', 'Connexion sécurisée'],
  bandNote: '',
  howTitle: 'Comment ça marche', howText: 'Trois étapes pour commencer avec Weechat.',
  steps: [['Choisissez votre mode', 'Swap Live, traduction vocale ou les deux.'], ['Configurez en quelques secondes', 'Visage, décor, voix et langues de chaque interlocuteur.'], ['Passez en direct', 'Parlez dans votre langue, votre interlocuteur entend la sienne.']],
  featTitle: 'Tout ce que Weechat fait en direct',
  tabs: ['Swap Live', 'Traduction en temps réel', 'Studio Diffusion Vidéo', 'Studio Transformation Avatar', 'Restyle Live'],
  panels: [
    { title: 'Changez de visage en direct, dans votre appel.', text: 'Choisissez une photo autorisée : Weechat remplace votre visage dans la webcam et envoie l’image dans « Weechat Camera ». Vos expressions et mouvements de tête sont suivis en direct.', points: ['Cliquez sur un avatar pour changer de visage', 'Caméra « Weechat Camera » sans OBS', 'Traitement sur votre PC Windows'], status: 'Application Windows' },
    { title: 'Parlez dans votre langue. Weechat traduit pour votre interlocuteur.', text: 'Pendant un appel WhatsApp, Instagram ou un live TikTok, vous parlez français : votre interlocuteur entend votre message dans sa langue, avec les sous-titres.', points: ['48 langues disponibles', 'Voix traduite et sous-titres en direct', 'Minutes de traduction décomptées à la seconde'], status: 'Dans le navigateur' },
    { title: 'Diffusez une vidéo prête comme si c’était votre webcam.', text: 'Choisissez une vidéo MP4 : Weechat la lit en boucle dans « Weechat Camera », avec son propre son. Idéal pour un live TikTok ou une présentation.', points: ['Lecture en boucle sans coupure', 'Image dans Weechat Camera, son dans le micro virtuel', 'Aucune puissance de calcul nécessaire'], status: 'Application Windows · Studio' },
    { title: 'Créez une vidéo avatar à partir de votre vidéo et d’une photo.', text: 'Importez une vidéo de vous et la photo d’un visage autorisé. Weechat fabrique une nouvelle vidéo MP4 avec ce visage, en gardant vos mouvements et votre son. Vous pouvez ensuite la diffuser avec Studio Diffusion Vidéo.', points: ['Vidéo + photo → nouvelle vidéo MP4', 'Son d’origine conservé', 'Fichier enregistré sur votre Bureau'], status: 'Application Windows · Studio' },
    { title: 'Restyle Live : changez le style de votre image.', text: 'Appliquez des filtres à votre webcam en direct : noir et blanc, couleurs vives, contraste.', points: ['Filtres appliqués en direct', 'Traitement sur votre appareil', 'Sans consommation de points'], status: 'Dans le navigateur' },
  ],
  studioDemo: { video: 'Ma vidéo.mp4', photo: 'Photo du visage', result: 'Vidéo avatar.mp4', loop: 'Lecture en boucle', cam: 'Weechat Camera', mic: 'Micro virtuel', processing: 'Transformation…' },
  bubbles: ['Bonjour, vous m’entendez bien ?', 'Hello, can you hear me clearly?'],
  try: 'Lire le guide de cette fonction',
  ctas: ['Essayer Swap Live', 'Essayer la traduction', 'Télécharger le Studio', 'Créer ma vidéo avatar', 'Essayer Restyle'],
  featured: 'En vedette',
  guide: 'Guide',
  secEyebrow: 'Confidentialité', secTitle: 'Vos visages restent les vôtres.',
  sec: [['Aucun profil biométrique', 'Le moteur Windows extrait des caractéristiques faciales en mémoire pour le swap ; aucun profil biométrique n’est enregistré par le site.'], ['Transferts sécurisés', 'Les échanges avec les services passent par notre serveur, sans clé exposée.'], ['Zéro conservation', 'Weechat n’enregistre pas le flux. La voix traduite n’est jamais conservée.'], ['Médias privés', 'Vos photos importées restent dans votre navigateur.']],
  respTitle: 'Un outil neutre, un usage responsable', respText: 'L’usurpation d’identité, l’escroquerie et les deepfakes non consentis sont interdits. Les contenus générés doivent être signalés comme tels. Réservé aux 18 ans et plus.',
  payTitle: 'Payez avec vos moyens habituels, dans 24 pays africains et à l’international.',
  payText: 'Rechargez vos points par Mobile Money, Visa ou Mastercard.',
  momoTitle: 'Paiements mobiles en Afrique', momoText: 'Rechargez vos points directement depuis votre compte Mobile Money. La devise locale est convertie automatiquement en FCFA.',
  momoOperators: 'Principaux opérateurs', momoCountries: 'Pays couverts (24)', momoNote: 'Conversion automatique vers le FCFA',
  cardTitle: 'International & diaspora', cardText: 'Payez avec votre carte Visa ou Mastercard, où que vous soyez. Conversion automatique vers le FCFA.',
  cardNetworks: 'Réseaux de paiement acceptés', cardNote: 'Devises internationales prises en charge',
  priceEyebrow: 'Paiement à l’utilisation', priceTitle: 'Tarification simple et transparente', priceText: 'Vous ne payez que ce que vous consommez. Sans abonnement, sans frais cachés.',
  priceModeHint: 'Choisissez votre usage : points vidéo, minutes de traduction ou jetons IA.',
  modeSwap: 'Swap Live', modeAudio: 'Audio', modeTokens: 'Jetons IA', tokensTitle: 'Jetons IA', tokensSub: 'Pour le Studio IA : Swap Photo, images IA et photo parlante. Ne servent pas au Live ni à la traduction.', showPricesIn: 'Afficher les prix en :',
  swapTitle: 'Swap Live', swapSub: 'Transformez votre visage et votre apparence en temps réel.',
  audioTitle: 'Traduction audio', audioSub: 'Parlez. On traduit votre voix en temps réel.',
  points: 'points', bonusLabel: 'Bonus inclus', choose: 'Choisir', popular: 'Meilleur choix', days: 'jours',
  consumptionNote: 'Consommation : Swap Live 2 pts/s · Studio Diffusion Vidéo (diffuser en direct une vidéo prête) 1 pt/s · Studio Transformation Avatar (l’IA remplace le visage de votre vidéo par celui d’une photo) 5 pts/s. Les points d’un pack servent à toutes ces fonctions.',
  camTitle: 'Licence Weechat Camera', camSub: 'Paiement unique · à vie', camLines: ['Weechat apparaît comme caméra dans WhatsApp, Facebook Live, TikTok, Google Meet, Zoom', 'Aucune expiration', 'Incluse dans Premium et Ultimate'], camNote: '',
  priceDisclaimer: 'Paiement unique par pack, sans abonnement.',
  faqTitle: 'Foire aux questions',
  faq: [
    ['Comment fonctionnent les points ?', 'Vous achetez des points prépayés, consommés selon vos actions : 2 points par seconde de Swap Live ou de Restyle, 2 points par photo. Les points ne correspondent pas à des minutes d’appel.'],
    ['Comment utiliser Weechat sur WhatsApp, Zoom ou Discord ?', 'Weechat se présente comme une caméra et un micro virtuels que vous sélectionnez dans votre application d’appel.'],
    ['Faut-il un ordinateur puissant ou une carte graphique (GPU) ?', 'Le Swap Live Windows est calculé sur votre PC. Les performances dépendent du matériel ; aucune fluidité n’est garantie sans test.'],
    ['Puis-je utiliser Weechat sur mon téléphone ?', 'Le Studio fonctionne dans le navigateur mobile pour les essais.'],
    ['Est-ce que Weechat est disponible sur Mac ?', 'Le module caméra virtuelle vise d’abord Windows. Une version Mac est à l’étude, sans date confirmée.'],
    ['Que se passe-t-il si je n’ai plus de points en plein live ?', 'Le live s’arrête proprement à la fin de vos points. Rechargez en quelques secondes par Mobile Money ou carte pour continuer.'],
    ['Est-ce que l’application conserve mes vidéos ou mes visages ?', 'Non. Aucun enregistrement audio ou vidéo n’est conservé, et vos photos importées restent dans votre navigateur.'],
    ['Puis-je utiliser Weechat pour usurper l’identité de quelqu’un ?', 'Non. L’usurpation d’identité, l’escroquerie et les deepfakes non consentis sont strictement interdits et entraînent la suspension du compte.'],
    ['Suis-je responsable des contenus que je crée ?', 'Oui. Vous devez signaler les contenus générés comme tels et respecter les lois en vigueur dans votre pays.'],
  ],
  helpTitle: 'Besoin d’aide pour installer ?', helpText: 'L’installation ou la caméra virtuelle vous résiste ? Écrivez-nous, on vous accompagne pas à pas.', helpCta: 'Nous contacter',
  finalTitle: 'Lancez votre premier essai aujourd’hui.', finalText: 'Créez votre compte et testez la traduction vocale dans le Studio.', signup: 'Créer mon compte', haveAccount: 'J’ai déjà un compte',
  footerLegal: 'Conditions d’utilisation', footerPrivacy: 'Confidentialité', footerResp: 'Usage responsable · 18+',
};
const en: typeof fr = {
  heroTitle: ['Change your look.', 'Translate live.'],
  heroText: 'Persona, voice and translation for your calls, lives and streams — Weechat works alongside your existing apps.',
  start: 'Get started', pricing: 'See pricing', login: 'Sign in',
  heroNote: 'Secure Mobile Money and card payment · points, no subscription',
  liveTag: 'LIVE', langTag: 'FR → EN',
  bandEyebrow: 'Built for calls and lives', bandTitle: 'Transform. Translate. On your platforms.',
  specs: ['48 languages', 'Works with WhatsApp, TikTok, Instagram', 'No Weechat recording', 'Secure connection'],
  bandNote: '',
  howTitle: 'How it works', howText: 'Three steps to get started with Weechat.',
  steps: [['Pick your mode', 'Swap Live, voice translation or both.'], ['Set up in seconds', 'Face, background, voice and each speaker’s language.'], ['Go live', 'Speak your language, your contact hears theirs.']],
  featTitle: 'Everything Weechat does live',
  tabs: ['Swap Live', 'Real-time translation', 'Studio Video Broadcast', 'Studio Avatar Transformation', 'Restyle Live'],
  panels: [
    { title: 'Swap your face live, in your call.', text: 'Pick an authorised photo: Weechat replaces your face in the webcam and sends the image to “Weechat Camera”. Your expressions and head movements are followed live.', points: ['Click an avatar to switch faces', '“Weechat Camera” with no OBS', 'Processed on your Windows PC'], status: 'Windows app' },
    { title: 'Speak your language. Weechat translates for the other person.', text: 'During a WhatsApp or Instagram call or a TikTok live, you speak your language: the other person hears it in theirs, with subtitles.', points: ['48 languages available', 'Live translated voice and subtitles', 'Translation minutes counted by the second'], status: 'In the browser' },
    { title: 'Broadcast a ready-made video as if it were your webcam.', text: 'Pick an MP4 video: Weechat loops it in “Weechat Camera”, with its own sound. Great for a TikTok live or a presentation.', points: ['Seamless loop playback', 'Image in Weechat Camera, sound in the virtual mic', 'No heavy computing needed'], status: 'Windows app · Studio' },
    { title: 'Create an avatar video from your video and a photo.', text: 'Import a video of yourself and an authorised face photo. Weechat makes a new MP4 with that face, keeping your movements and sound. Then broadcast it with Studio Video Broadcast.', points: ['Video + photo → new MP4 video', 'Original sound kept', 'File saved to your Desktop'], status: 'Windows app · Studio' },
    { title: 'Restyle Live: change your image style.', text: 'Apply live webcam filters: monochrome, vivid colours, contrast.', points: ['Filters applied live', 'Processed on your device', 'No points used'], status: 'In the browser' },
  ],
  studioDemo: { video: 'My video.mp4', photo: 'Face photo', result: 'Avatar video.mp4', loop: 'Loop playback', cam: 'Weechat Camera', mic: 'Virtual mic', processing: 'Transforming…' },
  bubbles: ['Bonjour, vous m’entendez bien ?', 'Hello, can you hear me clearly?'],
  try: 'Read this feature guide',
  ctas: ['Try Swap Live', 'Try translation', 'Download Studio', 'Create my avatar video', 'Try Restyle'],
  featured: 'Featured',
  guide: 'Guide',
  secEyebrow: 'Privacy', secTitle: 'Your faces stay yours.',
  sec: [['No biometric profile', 'The Windows engine extracts facial features in memory for swapping; the website stores no biometric profile.'], ['Secure transfers', 'Service calls go through our server, no key exposed.'], ['Zero retention', 'Weechat does not record streams. Translated speech is never kept.'], ['Private media', 'Uploaded photos stay in your browser.']],
  respTitle: 'A neutral tool, used responsibly', respText: 'Impersonation, fraud and non-consensual deepfakes are forbidden. Generated content must be disclosed. 18+ only.',
  payTitle: 'Pay the way you already do, in 24 African countries and worldwide.',
  payText: 'Top up your points with Mobile Money, Visa or Mastercard.',
  momoTitle: 'Mobile payments in Africa', momoText: 'Top up your points directly from your Mobile Money account. Local currency is automatically converted to FCFA.',
  momoOperators: 'Main operators', momoCountries: 'Covered countries (24)', momoNote: 'Automatic conversion to FCFA',
  cardTitle: 'International & diaspora', cardText: 'Pay with your Visa or Mastercard, wherever you are. Automatic conversion to FCFA.',
  cardNetworks: 'Accepted payment networks', cardNote: 'International currencies supported',
  priceEyebrow: 'Pay as you go', priceTitle: 'Simple, transparent pricing', priceText: 'You only pay for what you use. No subscription, no hidden fees.',
  priceModeHint: 'Pick your use: video points, translation minutes or AI tokens.',
  modeSwap: 'Swap Live', modeAudio: 'Audio', modeTokens: 'AI tokens', tokensTitle: 'AI tokens', tokensSub: 'For the AI Studio: Swap Photo, AI images and talking photo. Not used for Live or translation.', showPricesIn: 'Show prices in:',
  swapTitle: 'Swap Live', swapSub: 'Transform your face and appearance in real time.',
  audioTitle: 'Audio translation', audioSub: 'Speak. We translate your voice in real time.',
  points: 'points', bonusLabel: 'Included bonus', choose: 'Choose', popular: 'Best choice', days: 'days',
  consumptionNote: 'Usage: Swap Live 2 pts/s · Studio Video Broadcast (stream a ready video live) 1 pt/s · Studio Avatar Transformation (AI replaces the face in your video with a photo) 5 pts/s. A pack’s points work for all of these.',
  camTitle: 'Weechat Camera licence', camSub: 'One-time payment · lifetime', camLines: ['Weechat appears as a camera in WhatsApp, Facebook Live, TikTok, Google Meet, Zoom', 'No expiry', 'Included in Premium and Ultimate'], camNote: '',
  priceDisclaimer: 'One-time payment per pack, no commitment.',
  faqTitle: 'Frequently asked questions',
  faq: [
    ['How do points work?', 'You buy prepaid points consumed by your actions: 2 points per second of Swap Live or Restyle, 2 points per photo. Points are not call minutes.'],
    ['How do I use Weechat on WhatsApp, Zoom or Discord?', 'Weechat appears as a virtual camera and microphone that you select in your calling app.'],
    ['Do I need a powerful computer or a GPU?', 'Windows Swap Live runs on your PC. Performance depends on hardware; no frame rate is guaranteed without testing.'],
    ['Can I use Weechat on my phone?', 'The Studio works in a mobile browser for trials.'],
    ['Is Weechat available on Mac?', 'The virtual camera module targets Windows first. A Mac version is under consideration, with no confirmed date.'],
    ['What happens if I run out of points during a live?', 'The live stops cleanly when your points run out. Top up in seconds by Mobile Money or card to continue.'],
    ['Does the app keep my videos or my faces?', 'No. No audio or video recording is kept, and your uploaded photos stay in your browser.'],
    ['Can I use Weechat to impersonate someone?', 'No. Impersonation, fraud and non-consensual deepfakes are strictly forbidden and lead to account suspension.'],
    ['Am I responsible for the content I create?', 'Yes. You must disclose generated content as such and comply with the laws of your country.'],
  ],
  helpTitle: 'Need help installing?', helpText: 'Struggling with setup or the virtual camera? Write to us, we’ll guide you step by step.', helpCta: 'Contact us',
  finalTitle: 'Start your first trial today.', finalText: 'Create your account and test voice translation in the Studio.', signup: 'Create my account', haveAccount: 'I already have an account',
  footerLegal: 'Terms of use', footerPrivacy: 'Privacy', footerResp: 'Responsible use · 18+',
};
export const landingCopy = (l: L) => (l === 'en' ? en : fr);
export const EUR_TO_XOF = 655.957; // fixed official parity

// Plan line presentation: each line gets an icon kind; bonuses and validity are shown apart.
export type LineKind = 'live' | 'restyle' | 'photo' | 'translate' | 'vcam' | 'languages' | 'speed' | 'support' | 'points' | 'validity';
export function classifyLine(line: string): { kind: LineKind; bonus: boolean } {
  const l = line.toLowerCase();
  const bonus = l.startsWith('bonus') || l.includes('virtuelle') || l.includes('virtual camera') || l.includes('prioritaire') || l.includes('priority');
  const kind: LineKind = l.includes('valable') || l.includes('valid') ? 'validity'
    : l.includes('virtuel') || l.includes('virtual') ? 'vcam'
    : l.includes('restyle') ? 'restyle'
    : l.includes('studio') ? 'live'
    : l.includes('photo') ? 'photo'
    : l.includes('point') ? 'points'
    : l.startsWith('live') || l.includes('en direct') || l.includes('live face') ? 'live'
    : l.includes('langue') || l.includes('language') ? 'languages'
    : l.includes('rapide') || l.includes('fast') ? 'speed'
    : l.includes('support') ? 'support'
    : 'translate';
  return { kind, bonus };
}
