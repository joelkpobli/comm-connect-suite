import { BLOCK_SECONDS, SWAP_POINTS_PER_SECOND } from './usage-meter';

// Capabilities describe the checked-in execution paths, not a detected installation.
export const featureCapabilities = {
  swap: { accountLinked: false, metered: false, availableInBrowser: false },
  translation: { accountLinked: true, metered: true, bidirectionalCallValidated: false },
  restyle: { aiConnected: false, metered: false, localFilters: true },
  photo: { engineConnected: false, metered: false },
  payment: { enabled: false },
} as const;

export const usagePolicy = { swapPointsPerSecond: SWAP_POINTS_PER_SECOND, blockSeconds: BLOCK_SECONDS };

export const featureCards = (fr: boolean) => [
  { id: 'swap', to: '/swap-live', title: 'Swap Live', status: fr ? 'Application Windows' : 'Windows app', detail: fr ? 'Votre avatar en direct dans WhatsApp, Zoom, Teams et TikTok Live, à 2 points par seconde.' : 'Your live avatar in WhatsApp, Zoom, Teams and TikTok Live, at 2 points per second.', action: fr ? 'Commencer' : 'Get started' },
  { id: 'translation', to: '/traduction', title: fr ? 'Traduction en direct' : 'Live translation', status: fr ? 'Prêt à l’emploi' : 'Ready to use', detail: fr ? 'Micro → Palabra → voix traduite et sous-titres. Utilise le solde audio, pas les points vidéo.' : 'Microphone → Palabra → translated speech and subtitles. Uses the audio balance, not video points.', action: fr ? 'Ouvrir la traduction' : 'Open translation' },
  { id: 'restyle', to: '/restyle-live', title: 'Restyle Live', status: fr ? 'Gratuit' : 'Free', detail: fr ? 'Ajustez les couleurs et le contraste de votre webcam pour une image soignée.' : 'Adjust your webcam colours and contrast for a polished image.', action: fr ? 'Ouvrir les filtres' : 'Open filters' },
  { id: 'photo', to: '/swap-photo', title: 'Swap Photo', status: fr ? 'Disponible · Jetons IA' : 'Available · AI tokens', detail: fr ? 'Swap Photo, création d’images et photo parlante, payés en jetons IA.' : 'Swap Photo, image creation and talking photo, paid with AI tokens.', action: fr ? 'Ouvrir le Studio IA' : 'Open AI Studio' },
] as const;