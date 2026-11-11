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
  validity: number; // days
  lines: { fr: string[]; en: string[] };
};

export const swapPlans: Plan[] = [
  {
    id: 'decouverte', name: 'Pack Découverte', badge: 'Offre découverte', price: { XOF: '4 999', EUR: '7,60', USD: '8,30' }, points: 417, validity: 7,
    lines: { fr: ['417 points (3 min 28 s de Swap Live)', 'Visage en direct sur votre webcam', 'Valable 7 jours'], en: ['417 points (3 min 28 s of Swap Live)', 'Live face on your webcam', 'Valid 7 days'] },
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
    lines: { fr: ['10 min de traduction vocale', '48 langues configurées', 'Sens de traduction au choix', 'Valable 30 jours'], en: ['10 min of voice translation', '48 configured languages', 'Choose translation direction', 'Valid 30 days'] },
  },
  {
    id: 'audio-pro', name: 'Audio Pro', popular: true, price: { XOF: '22 900', EUR: '35', USD: '38' }, audioMin: 60, validity: 30,
    lines: { fr: ['1 h de traduction vocale', '48 langues configurées', 'Sens de traduction au choix', 'Voix traduite · Latence à valider', 'Valable 30 jours'], en: ['1 h of voice translation', '48 configured languages', 'Choose translation direction', 'Translated speech · Latency to validate', 'Valid 30 days'] },
  },
  {
    id: 'audio-marathon', name: 'Audio Marathon', price: { XOF: '39 900', EUR: '61', USD: '66' }, audioMin: 120, validity: 60,
    lines: { fr: ['2 h de traduction vocale', '48 langues configurées', 'Sens de traduction au choix', 'Voix traduite · Latence à valider', 'Support prioritaire', 'Valable 60 jours'], en: ['2 h of voice translation', '48 configured languages', 'Choose translation direction', 'Translated speech · Latency to validate', 'Priority support', 'Valid 60 days'] },
  },
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
  specs: ['Palabra intégré', '48 langues configurées', 'Pas d’enregistrement Weechat', 'Connexion sécurisée'],
  bandNote: 'Plateformes cibles · compatibilité non encore validée',
  howTitle: 'Comment ça marche', howText: 'Trois étapes pour commencer avec Weechat.',
  steps: [['Choisissez votre mode', 'Swap Live, traduction vocale ou les deux.'], ['Configurez en quelques secondes', 'Visage, décor, voix et langues de chaque interlocuteur.'], ['Passez en direct', 'Parlez dans votre langue, votre interlocuteur entend la sienne.']],
  featTitle: 'Tout ce que Weechat fait en direct',
  tabs: ['Swap Live', 'Traduction en temps réel', 'Restyle Live', 'Photo & vidéo'],
  panels: [
    { title: 'Swap Live : un visage remplacé dans la webcam.', text: 'Le moteur Windows traite la webcam localement. Il ne transforme pas le corps, la tenue, le décor ou les objets par une phrase. L’essai téléchargé n’est pas encore lié au compte Weechat.', points: ['Photo autorisée et webcam nécessaires', 'Moteur Windows distinct du navigateur', 'Qualité et caméra virtuelle à valider'], status: 'Essai Windows · Points non reliés' },
    { title: 'Votre micro traduit dans une autre langue.', text: 'Palabra renvoie la voix traduite et les sous-titres dans Weechat. Une session traduit votre micro ; la réception automatique de l’interlocuteur et les appels dans les deux sens restent à valider.', points: ['Palabra streaming · 48 langues configurées', 'Solde audio séparé · Tranches de 10 secondes', 'Routage Windows avec VB-Cable à tester'], status: 'Service connecté · Appels réels à valider' },
    { title: 'Restyle Live : des filtres webcam locaux.', text: 'Changez les couleurs et le contraste de votre webcam. La restylisation IA à partir d’une phrase ou d’une image n’est pas connectée.', points: ['Noir et blanc, couleurs vives, contraste', 'Traitement local sans débit de points', 'Pas de redessin IA du corps ou du décor'], status: 'Filtres locaux disponibles · IA indisponible' },
    { title: 'Swap Photo : remplacer un visage dans une image fixe.', text: 'Cette fonction nécessite un moteur de transformation qui n’est pas connecté actuellement. Aucun résultat transformé ni export ne peut être produit.', points: ['Moteur sous licence autorisée à intégrer', 'Consentement requis avant traitement', 'Aucun point débité actuellement'], status: 'Indisponible · Moteur non connecté' },
  ],
  bubbles: ['Bonjour, vous m’entendez bien ?', 'Hello, can you hear me clearly?'],
  try: 'Lire le guide de cette fonction',
  ctas: ['Essayer Swap Live', 'Essayer la traduction', 'Découvrir Restyle', 'Voir le Swap photo'],
  featured: 'En vedette',
  guide: 'Guide',
  secEyebrow: 'Confidentialité', secTitle: 'Vos visages restent les vôtres.',
  sec: [['Aucun profil biométrique', 'Le moteur Windows extrait des caractéristiques faciales en mémoire pour le swap ; aucun profil biométrique n’est enregistré par le site.'], ['Transferts sécurisés', 'Les échanges avec les services passent par notre serveur, sans clé exposée.'], ['Zéro conservation', 'Weechat n’enregistre pas le flux. La traduction envoie l’audio à Palabra avec consentement ; ses conditions s’appliquent.'], ['Médias privés', 'Vos photos importées restent dans votre navigateur.']],
  respTitle: 'Un outil neutre, un usage responsable', respText: 'L’usurpation d’identité, l’escroquerie et les deepfakes non consentis sont interdits. Les contenus générés doivent être signalés comme tels. Réservé aux 18 ans et plus.',
  payTitle: 'Payez avec vos moyens habituels, dans 24 pays africains et à l’international.',
  payText: 'Rechargez vos points par Mobile Money, Visa ou Mastercard.',
  momoTitle: 'Paiements mobiles en Afrique', momoText: 'Rechargez vos points directement depuis votre compte Mobile Money. La devise locale est convertie automatiquement en FCFA.',
  momoOperators: 'Principaux opérateurs', momoCountries: 'Pays couverts (24)', momoNote: 'Conversion automatique vers le FCFA',
  cardTitle: 'International & diaspora', cardText: 'Payez avec votre carte Visa ou Mastercard, où que vous soyez. Conversion automatique vers le FCFA.',
  cardNetworks: 'Réseaux de paiement acceptés', cardNote: 'Devises internationales prises en charge',
  priceEyebrow: 'Paiement à l’utilisation', priceTitle: 'Tarification simple et transparente', priceText: 'Vous ne payez que ce que vous consommez. Sans abonnement, sans frais cachés.',
  priceModeHint: 'Choisissez votre usage : points vidéo ou minutes de traduction.',
  modeSwap: 'Swap Live', modeAudio: 'Audio', showPricesIn: 'Afficher les prix en :',
  swapTitle: 'Swap Live', swapSub: 'Transformez votre visage et votre apparence en temps réel.',
  audioTitle: 'Traduction audio', audioSub: 'Parlez. On traduit votre voix en temps réel.',
  points: 'points', bonusLabel: 'Bonus inclus', choose: 'Choisir', popular: 'Meilleur choix', days: 'jours',
  consumptionNote: 'Consommation : Swap Live 2 pts/s · Studio Diffusion Vidéo (diffuser en direct une vidéo prête) 1 pt/s · Studio Transformation Avatar (l’IA remplace le visage de votre vidéo par celui d’une photo) 5 pts/s. Les points d’un pack servent à toutes ces fonctions.',
  camTitle: 'Licence Weechat Camera', camSub: 'Paiement unique · à vie', camLines: ['Weechat apparaît comme caméra dans WhatsApp, Facebook Live, TikTok, Google Meet, Zoom', 'Aucune expiration', 'Incluse dans Premium et Ultimate'], camNote: 'Achat prévu · paiement pas encore actif. Les points restent nécessaires pour Swap Live et Studio.',
  priceDisclaimer: 'Paiement unique par pack, sans abonnement.',
  faqTitle: 'Foire aux questions',
  faq: [
    ['Comment fonctionnent les points ?', 'Vous achetez des points prépayés, consommés selon vos actions : 2 points par seconde de Swap Live ou de Restyle, 2 points par photo. Les points ne correspondent pas à des minutes d’appel.'],
    ['Comment utiliser Weechat sur WhatsApp, Zoom ou Discord ?', 'Weechat se présente comme une caméra et un micro virtuels que vous sélectionnez dans votre application d’appel. Ce module Windows est en développement.'],
    ['Faut-il un ordinateur puissant ou une carte graphique (GPU) ?', 'Le Swap Live Windows est calculé sur votre PC. Les performances dépendent du matériel ; aucune fluidité n’est garantie sans test. Aucun serveur GPU payant n’est activé.'],
    ['Puis-je utiliser Weechat sur mon téléphone ?', 'Le Studio fonctionne dans le navigateur mobile pour les essais. L’intégration aux appels mobiles dépendra du module caméra virtuelle, en développement.'],
    ['Est-ce que Weechat est disponible sur Mac ?', 'Le module caméra virtuelle vise d’abord Windows. Une version Mac est à l’étude, sans date confirmée.'],
    ['Que se passe-t-il si je n’ai plus de points en plein live ?', 'Le moteur Windows ne contrôle pas encore les points. La traduction du site s’arrête si une tranche audio ne peut pas être débitée. Aucun retour automatique à votre vraie image n’est garanti.'],
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
  specs: ['Palabra integrated', '48 configured languages', 'No Weechat recording', 'Secure connection'],
  bandNote: 'Target platforms · compatibility not yet validated',
  howTitle: 'How it works', howText: 'Three steps to get started with Weechat.',
  steps: [['Pick your mode', 'Swap Live, voice translation or both.'], ['Set up in seconds', 'Face, background, voice and each speaker’s language.'], ['Go live', 'Speak your language, your contact hears theirs.']],
  featTitle: 'Everything Weechat does live',
  tabs: ['Swap Live', 'Real-time translation', 'Restyle Live', 'Photo & video'],
  panels: [
    { title: 'Swap Live: replace a webcam face.', text: 'The Windows engine processes your webcam locally. It does not transform body, clothing, scenery or objects from a prompt. The downloaded trial is not yet linked to your Weechat account.', points: ['Authorised photo and webcam required', 'Windows engine separate from the browser', 'Quality and virtual camera to validate'], status: 'Windows trial · Points not linked' },
    { title: 'Translate your microphone to another language.', text: 'Palabra returns translated speech and subtitles in Weechat. One session translates your microphone; automatic incoming speech and two-way calls remain to be validated.', points: ['Palabra streaming · 48 configured languages', 'Separate audio balance · 10-second blocks', 'Windows VB-Cable routing to test'], status: 'Service connected · Real calls to validate' },
    { title: 'Restyle Live: local webcam filters.', text: 'Change webcam colours and contrast. AI restyling from a prompt or reference image is not connected.', points: ['Monochrome, vivid colours, contrast', 'Local processing without point charges', 'No AI body or scenery redraw'], status: 'Local filters available · AI unavailable' },
    { title: 'Swap Photo: replace a face in a still image.', text: 'This feature requires a transformation engine that is not currently connected. No transformed result or export can be produced.', points: ['Authorised engine licence required', 'Consent required before processing', 'No points currently charged'], status: 'Unavailable · Engine not connected' },
  ],
  bubbles: ['Bonjour, vous m’entendez bien ?', 'Hello, can you hear me clearly?'],
  try: 'Read this feature guide',
  ctas: ['Try Swap Live', 'Try translation', 'Discover Restyle', 'See Swap photo'],
  featured: 'Featured',
  guide: 'Guide',
  secEyebrow: 'Privacy', secTitle: 'Your faces stay yours.',
  sec: [['No biometric profile', 'The Windows engine extracts facial features in memory for swapping; the website stores no biometric profile.'], ['Secure transfers', 'Service calls go through our server, no key exposed.'], ['Zero retention', 'Weechat does not record streams. Translation sends audio to Palabra with consent; provider terms apply.'], ['Private media', 'Uploaded photos stay in your browser.']],
  respTitle: 'A neutral tool, used responsibly', respText: 'Impersonation, fraud and non-consensual deepfakes are forbidden. Generated content must be disclosed. 18+ only.',
  payTitle: 'Pay the way you already do, in 24 African countries and worldwide.',
  payText: 'Top up your points with Mobile Money, Visa or Mastercard.',
  momoTitle: 'Mobile payments in Africa', momoText: 'Top up your points directly from your Mobile Money account. Local currency is automatically converted to FCFA.',
  momoOperators: 'Main operators', momoCountries: 'Covered countries (24)', momoNote: 'Automatic conversion to FCFA',
  cardTitle: 'International & diaspora', cardText: 'Pay with your Visa or Mastercard, wherever you are. Automatic conversion to FCFA.',
  cardNetworks: 'Accepted payment networks', cardNote: 'International currencies supported',
  priceEyebrow: 'Pay as you go', priceTitle: 'Simple, transparent pricing', priceText: 'You only pay for what you use. No subscription, no hidden fees.',
  priceModeHint: 'Pick your use: video points or translation minutes.',
  modeSwap: 'Swap Live', modeAudio: 'Audio', showPricesIn: 'Show prices in:',
  swapTitle: 'Swap Live', swapSub: 'Transform your face and appearance in real time.',
  audioTitle: 'Audio translation', audioSub: 'Speak. We translate your voice in real time.',
  points: 'points', bonusLabel: 'Included bonus', choose: 'Choose', popular: 'Best choice', days: 'days',
  consumptionNote: 'Usage: Swap Live 2 pts/s · Studio Video Broadcast (stream a ready video live) 1 pt/s · Studio Avatar Transformation (AI replaces the face in your video with a photo) 5 pts/s. A pack’s points work for all of these.',
  camTitle: 'Weechat Camera licence', camSub: 'One-time payment · lifetime', camLines: ['Weechat appears as a camera in WhatsApp, Facebook Live, TikTok, Google Meet, Zoom', 'No expiry', 'Included in Premium and Ultimate'], camNote: 'Planned purchase · payment not active yet. Points are still needed for Swap Live and Studio.',
  priceDisclaimer: 'One-time payment per pack, no commitment.',
  faqTitle: 'Frequently asked questions',
  faq: [
    ['How do points work?', 'You buy prepaid points consumed by your actions: 2 points per second of Swap Live or Restyle, 2 points per photo. Points are not call minutes.'],
    ['How do I use Weechat on WhatsApp, Zoom or Discord?', 'Weechat appears as a virtual camera and microphone that you select in your calling app. This Windows module is in development.'],
    ['Do I need a powerful computer or a GPU?', 'Windows Swap Live runs on your PC. Performance depends on hardware; no frame rate is guaranteed without testing. No paid GPU server is enabled.'],
    ['Can I use Weechat on my phone?', 'The Studio works in a mobile browser for trials. Integration with mobile calls depends on the virtual camera module, in development.'],
    ['Is Weechat available on Mac?', 'The virtual camera module targets Windows first. A Mac version is under consideration, with no confirmed date.'],
    ['What happens if I run out of points during a live?', 'The Windows engine does not yet check points. Website translation stops if an audio block cannot be debited. No automatic return to your real image is guaranteed.'],
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
