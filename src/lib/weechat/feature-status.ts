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
  { id: 'swap', to: '/swap-live', title: 'Swap Live', status: fr ? 'Windows · Essai non relié au compte' : 'Windows · Trial not linked to account', detail: fr ? 'Remplacer un visage dans la webcam. Le moteur Windows est distinct du site ; aucun point n’y est débité actuellement.' : 'Replace a webcam face. The Windows engine is separate from the website; it currently charges no points.', action: fr ? 'Voir les prérequis' : 'View prerequisites' },
  { id: 'translation', to: '/traduction', title: fr ? 'Traduction en direct' : 'Live translation', status: fr ? 'Service connecté · Appels à valider' : 'Service connected · Calls to validate', detail: fr ? 'Micro → Palabra → voix traduite et sous-titres. Utilise le solde audio, pas les points vidéo.' : 'Microphone → Palabra → translated speech and subtitles. Uses the audio balance, not video points.', action: fr ? 'Ouvrir la traduction' : 'Open translation' },
  { id: 'restyle', to: '/restyle-live', title: 'Restyle Live', status: fr ? 'Filtres locaux uniquement' : 'Local filters only', detail: fr ? 'Ajuster les couleurs et le contraste de votre webcam. Ce n’est pas une transformation IA de tenue, de décor ou de corps.' : 'Adjust webcam colours and contrast. Not an AI transformation of clothes, scenery or body.', action: fr ? 'Ouvrir les filtres' : 'Open filters' },
  { id: 'photo', to: '/swap-photo', title: 'Swap Photo', status: fr ? 'Indisponible · Moteur absent' : 'Unavailable · Missing engine', detail: fr ? 'Remplacer un visage dans une image fixe. Aucun résultat ni téléchargement transformé n’est disponible actuellement.' : 'Replace a face in a still image. No transformed result or download is currently available.', action: fr ? 'Voir ce qui manque' : 'View missing requirements' },
] as const;