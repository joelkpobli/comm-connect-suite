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
  validity: number; // days
  lines: { fr: string[]; en: string[] };
};

export const swapPlans: Plan[] = [
  {
    id: 'decouverte', name: 'Pack Découverte', badge: 'Offre découverte', price: { XOF: '4 999', EUR: '7,60', USD: '8,30' }, points: 417, validity: 3,
    lines: { fr: ['417 points (3 min 28 s de Swap Live)', 'Visage & apparence en direct', 'Valable 3 jours'], en: ['417 points (3 min 28 s of Swap Live)', 'Live face & appearance', 'Valid 3 days'] },
  },
  {
    id: 'starter', name: 'Starter', price: { XOF: '19 900', EUR: '30,50', USD: '33' }, points: 1658, validity: 30,
    lines: { fr: ['Live : 13 min 49 s', 'Restyle : 13 min 49 s', 'Photos : 829', 'Valable 30 jours'], en: ['Live: 13 min 49 s', 'Restyle: 13 min 49 s', 'Photos: 829', 'Valid 30 days'] },
  },
  {
    id: 'standard', name: 'Standard', popular: true, price: { XOF: '49 900', EUR: '76', USD: '83' }, points: 3960, validity: 90,
    lines: { fr: ['Live : 33 min', 'Restyle : 33 min', 'Photos : 1 980', 'Bonus : Traduction 30 min', 'Valable 90 jours'], en: ['Live: 33 min', 'Restyle: 33 min', 'Photos: 1,980', 'Bonus: 30 min translation', 'Valid 90 days'] },
  },
  {
    id: 'premium', name: 'Premium', price: { XOF: '84 900', EUR: '129', USD: '141' }, points: 5640, validity: 365,
    lines: { fr: ['Live : 47 min', 'Restyle : 47 min', 'Photos : 2 820', 'Bonus : Traduction 1 h', 'Caméra virtuelle à vie', 'Valable 365 jours'], en: ['Live: 47 min', 'Restyle: 47 min', 'Photos: 2,820', 'Bonus: 1 h translation', 'Lifetime virtual camera', 'Valid 365 days'] },
  },
  {
    id: 'ultimate', name: 'Ultimate', price: { XOF: '150 000', EUR: '229', USD: '250' }, points: 11400, validity: 365,
    lines: { fr: ['Live : 1 h 35 min', 'Restyle : 1 h 35 min', 'Photos : 5 700', 'Bonus : Traduction 2 h', 'Caméra virtuelle à vie', 'Valable 365 jours'], en: ['Live: 1 h 35 min', 'Restyle: 1 h 35 min', 'Photos: 5,700', 'Bonus: 2 h translation', 'Lifetime virtual camera', 'Valid 365 days'] },
  },
];

export const audioPlans: Plan[] = [
  {
    id: 'audio-flash', name: 'Audio Flash', price: { XOF: '4 999', EUR: '7,60', USD: '8,30' }, audioMin: 10, validity: 30,
    lines: { fr: ['10 min de traduction vocale', '70+ langues', 'Traduction dans les deux sens', 'Valable 30 jours'], en: ['10 min of voice translation', '70+ languages', 'Two-way translation', 'Valid 30 days'] },
  },
  {
    id: 'audio-pro', name: 'Audio Pro', popular: true, price: { XOF: '22 900', EUR: '35', USD: '38' }, audioMin: 60, validity: 30,
    lines: { fr: ['1 h de traduction vocale', '70+ langues', 'Traduction dans les deux sens', 'Voix ultra-rapide', 'Valable 30 jours'], en: ['1 h of voice translation', '70+ languages', 'Two-way translation', 'Ultra-fast voice', 'Valid 30 days'] },
  },
  {
    id: 'audio-marathon', name: 'Audio Marathon', price: { XOF: '39 900', EUR: '61', USD: '66' }, audioMin: 120, validity: 60,
    lines: { fr: ['2 h de traduction vocale', '70+ langues', 'Traduction dans les deux sens', 'Voix ultra-rapide', 'Support prioritaire', 'Valable 60 jours'], en: ['2 h of voice translation', '70+ languages', 'Two-way translation', 'Ultra-fast voice', 'Priority support', 'Valid 60 days'] },
  },
];

export const consumption = { live: 2, restyle: 2, photo: 2 }; // pts per second / per photo

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
  heroNote: 'Démonstration visuelle · la transformation vidéo en direct est en développement',
  liveTag: 'LIVE', langTag: 'FR → EN',
  bandEyebrow: 'Pensé pour vos appels et lives', bandTitle: 'Transformez. Traduisez. Sur vos plateformes.',
  specs: ['Traduction FR ⇄ EN', '5 langues ciblées', 'Zéro conservation', 'Connexion sécurisée'],
  bandNote: 'Plateformes cibles · compatibilité non encore validée',
  howTitle: 'Comment ça marche', howText: 'Trois étapes pour commencer avec Weechat.',
  steps: [['Choisissez votre mode', 'Swap Live, traduction vocale ou les deux.'], ['Configurez en quelques secondes', 'Visage, décor, voix et langues de chaque interlocuteur.'], ['Passez en direct', 'Parlez dans votre langue, votre interlocuteur entend la sienne.']],
  featTitle: 'Tout ce que Weechat fait en direct',
  tabs: ['Swap Live', 'Traduction en temps réel', 'Restyle Live', 'Photo & vidéo'],
  panels: [
    { title: 'Transformez votre apparence. En direct, en une phrase.', text: 'Choisissez un visage ou décrivez ce que vous voulez : Weechat transforme votre apparence, votre décor et les objets autour de vous en temps réel — sans montage ni interruption.', points: ['Visage & apparence transformés en direct', 'Tenue, décor et objets modifiés par une phrase', 'Expressions, gestes et mouvements conservés naturellement'], status: 'En développement' },
    { title: 'Parlez dans votre langue. Weechat traduit pour votre interlocuteur.', text: 'Weechat traduit vos conversations en temps réel et dans les deux sens, pour que chacun puisse parler dans sa langue.', points: ['Reconnaissance vocale Deepgram', 'Traduction DeepL', 'Voix de synthèse au choix'], status: 'Essai réel phrase par phrase dans le Studio' },
    { title: 'Donnez à vos vidéos le style que vous imaginez.', text: 'Un mot ou une image de référence suffit : le style est appliqué à toute la vidéo, sans casser le mouvement d’origine.', points: ['Animation 3D, effets visuels, stop-motion', 'Mouvement et cohérence préservés d’une image à l’autre', 'Aussi efficace sur un court extrait que sur une vidéo longue'], status: 'En développement' },
    { title: 'Un résultat réaliste, en quelques secondes.', text: 'Importez une photo dont vous détenez les droits et obtenez un résultat réaliste en quelques secondes.', points: ['Consentement explicite', 'Reste dans votre navigateur', 'Effaçable à tout moment'], status: 'Aperçu disponible dans le Studio' },
  ],
  bubbles: ['Bonjour, vous m’entendez bien ?', 'Hello, can you hear me clearly?'],
  try: 'Essayer dans le Studio',
  secEyebrow: 'Confidentialité', secTitle: 'Vos visages restent les vôtres.',
  sec: [['Aucun profil biométrique', 'Aucun gabarit d’identité n’est créé ni conservé.'], ['Transferts sécurisés', 'Les échanges avec les services passent par notre serveur, sans clé exposée.'], ['Zéro conservation', 'Audio et vidéo ne sont jamais enregistrés.'], ['Médias privés', 'Vos photos importées restent dans votre navigateur.']],
  respTitle: 'Un outil neutre, un usage responsable', respText: 'L’usurpation d’identité, l’escroquerie et les deepfakes non consentis sont interdits. Les contenus générés doivent être signalés comme tels. Réservé aux 18 ans et plus.',
  payTitle: 'Payez avec vos moyens habituels, dans 24 pays africains et à l’international.',
  payText: 'Rechargez vos points par Mobile Money, Visa ou Mastercard. Aucun paiement n’est encore actif.',
  momoTitle: 'Paiements mobiles en Afrique', momoText: 'Rechargez vos points directement depuis votre compte Mobile Money. La devise locale est convertie automatiquement en FCFA.',
  momoOperators: 'Principaux opérateurs', momoCountries: 'Pays couverts (24)', momoNote: 'Conversion automatique vers le FCFA',
  cardTitle: 'International & diaspora', cardText: 'Payez avec votre carte Visa ou Mastercard, où que vous soyez. Conversion automatique vers le FCFA.',
  cardNetworks: 'Réseaux de paiement acceptés', cardNote: 'Devises internationales prises en charge',
  priceEyebrow: 'Paiement à l’utilisation', priceTitle: 'Tarification simple et transparente', priceText: 'Vous ne payez que ce que vous consommez. Sans abonnement, sans frais cachés.',
  priceModeHint: 'Swap Live (visage et corps, traduction incluse dès Standard) ou Audio seul.',
  modeSwap: 'Swap Live', modeAudio: 'Audio', showPricesIn: 'Afficher les prix en :',
  swapTitle: 'Swap Live', swapSub: 'Transformez votre visage et votre apparence en temps réel.',
  audioTitle: 'Traduction audio', audioSub: 'Parlez. On traduit votre voix en temps réel.',
  points: 'points', bonusLabel: 'Bonus inclus', choose: 'Choisir', popular: 'Meilleur choix', days: 'jours',
  consumptionNote: '1 s de Live = 2 pts/s · Restyle = 2 pts/s · Photo = 2 pts/photo',
  priceDisclaimer: 'Grille de présentation · aucun paiement n’est encore actif sur Weechat.',
  faqTitle: 'Foire aux questions',
  faq: [
    ['Comment fonctionnent les points ?', 'Vous achetez des points prépayés, consommés selon vos actions : 2 points par seconde de Swap Live ou de Restyle, 2 points par photo. Les points ne correspondent pas à des minutes d’appel.'],
    ['Comment utiliser Weechat sur WhatsApp, Zoom ou Discord ?', 'Weechat se présente comme une caméra et un micro virtuels que vous sélectionnez dans votre application d’appel. Ce module Windows est en développement.'],
    ['Faut-il un ordinateur puissant ou une carte graphique (GPU) ?', 'Le traitement est prévu côté serveur, donc un ordinateur standard suffit. La configuration exacte sera confirmée lors des tests Windows.'],
    ['Puis-je utiliser Weechat sur mon téléphone ?', 'Le Studio fonctionne dans le navigateur mobile pour les essais. L’intégration aux appels mobiles dépendra du module caméra virtuelle, en développement.'],
    ['Est-ce que Weechat est disponible sur Mac ?', 'Le module caméra virtuelle vise d’abord Windows. Une version Mac est à l’étude, sans date confirmée.'],
    ['Que se passe-t-il si je n’ai plus de points en plein live ?', 'La transformation s’interrompt proprement et votre flux redevient votre image réelle. Vous êtes alerté avant épuisement.'],
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
  heroNote: 'Visual demo · live video transformation is in development',
  liveTag: 'LIVE', langTag: 'FR → EN',
  bandEyebrow: 'Built for calls and lives', bandTitle: 'Transform. Translate. On your platforms.',
  specs: ['FR ⇄ EN translation', '5 target languages', 'Zero retention', 'Secure connection'],
  bandNote: 'Target platforms · compatibility not yet validated',
  howTitle: 'How it works', howText: 'Three steps to get started with Weechat.',
  steps: [['Pick your mode', 'Swap Live, voice translation or both.'], ['Set up in seconds', 'Face, background, voice and each speaker’s language.'], ['Go live', 'Speak your language, your contact hears theirs.']],
  featTitle: 'Everything Weechat does live',
  tabs: ['Swap Live', 'Real-time translation', 'Restyle Live', 'Photo & video'],
  panels: [
    { title: 'Transform your appearance. Live, in one sentence.', text: 'Pick a face or describe what you want: Weechat transforms your appearance, your scene and the objects around you in real time — no editing, no interruption.', points: ['Face & appearance transformed live', 'Outfit, scene and objects changed with one sentence', 'Expressions, gestures and motion naturally preserved'], status: 'In development' },
    { title: 'Speak your language. Weechat translates for your contact.', text: 'Weechat translates your conversations in real time, both ways, so everyone can speak their own language.', points: ['Deepgram speech recognition', 'DeepL translation', 'Selectable synthetic voice'], status: 'Real sentence-by-sentence trial in the Studio' },
    { title: 'Give your videos the style you imagine.', text: 'One word or one reference image is enough: the style is applied to the whole video without breaking the original motion.', points: ['3D animation, visual effects, stop-motion', 'Motion and consistency preserved frame to frame', 'Works on short clips and long videos alike'], status: 'In development' },
    { title: 'A realistic result, in seconds.', text: 'Upload a photo you own the rights to and get a realistic result in seconds.', points: ['Explicit consent', 'Stays in your browser', 'Erasable anytime'], status: 'Preview available in the Studio' },
  ],
  bubbles: ['Bonjour, vous m’entendez bien ?', 'Hello, can you hear me clearly?'],
  try: 'Try it in the Studio',
  secEyebrow: 'Privacy', secTitle: 'Your faces stay yours.',
  sec: [['No biometric profile', 'No identity template is created or stored.'], ['Secure transfers', 'Service calls go through our server, no key exposed.'], ['Zero retention', 'Audio and video are never recorded.'], ['Private media', 'Uploaded photos stay in your browser.']],
  respTitle: 'A neutral tool, used responsibly', respText: 'Impersonation, fraud and non-consensual deepfakes are forbidden. Generated content must be disclosed. 18+ only.',
  payTitle: 'Pay the way you already do, in 24 African countries and worldwide.',
  payText: 'Top up your points with Mobile Money, Visa or Mastercard. No payment is active yet.',
  momoTitle: 'Mobile payments in Africa', momoText: 'Top up your points directly from your Mobile Money account. Local currency is automatically converted to FCFA.',
  momoOperators: 'Main operators', momoCountries: 'Covered countries (24)', momoNote: 'Automatic conversion to FCFA',
  cardTitle: 'International & diaspora', cardText: 'Pay with your Visa or Mastercard, wherever you are. Automatic conversion to FCFA.',
  cardNetworks: 'Accepted payment networks', cardNote: 'International currencies supported',
  priceEyebrow: 'Pay as you go', priceTitle: 'Simple, transparent pricing', priceText: 'You only pay for what you use. No subscription, no hidden fees.',
  priceModeHint: 'Swap Live (face and body, translation included from Standard) or Audio only.',
  modeSwap: 'Swap Live', modeAudio: 'Audio', showPricesIn: 'Show prices in:',
  swapTitle: 'Swap Live', swapSub: 'Transform your face and appearance in real time.',
  audioTitle: 'Audio translation', audioSub: 'Speak. We translate your voice in real time.',
  points: 'points', bonusLabel: 'Included bonus', choose: 'Choose', popular: 'Best choice', days: 'days',
  consumptionNote: '1 s of Live = 2 pts/s · Restyle = 2 pts/s · Photo = 2 pts/photo',
  priceDisclaimer: 'Presentation pricing · no payment is active on Weechat yet.',
  faqTitle: 'Frequently asked questions',
  faq: [
    ['How do points work?', 'You buy prepaid points consumed by your actions: 2 points per second of Swap Live or Restyle, 2 points per photo. Points are not call minutes.'],
    ['How do I use Weechat on WhatsApp, Zoom or Discord?', 'Weechat appears as a virtual camera and microphone that you select in your calling app. This Windows module is in development.'],
    ['Do I need a powerful computer or a GPU?', 'Processing is planned server-side, so a standard computer is enough. Exact requirements will be confirmed during Windows testing.'],
    ['Can I use Weechat on my phone?', 'The Studio works in a mobile browser for trials. Integration with mobile calls depends on the virtual camera module, in development.'],
    ['Is Weechat available on Mac?', 'The virtual camera module targets Windows first. A Mac version is under consideration, with no confirmed date.'],
    ['What happens if I run out of points during a live?', 'The transformation stops cleanly and your stream returns to your real image. You are warned before running out.'],
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
    : l.includes('photo') ? 'photo'
    : l.includes('point') ? 'points'
    : l.startsWith('live') || l.includes('en direct') || l.includes('live face') ? 'live'
    : l.includes('langue') || l.includes('language') ? 'languages'
    : l.includes('rapide') || l.includes('fast') ? 'speed'
    : l.includes('support') ? 'support'
    : 'translate';
  return { kind, bonus };
}
