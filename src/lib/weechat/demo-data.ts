export const initialBalance = 1250;
export const packs = [
  { id: 'starter', name: 'Découverte', credits: 1000, price: '9,99', detail: 'Pour découvrir de nouveaux horizons' },
  { id: 'explorer', name: 'Explorateur', credits: 2500, price: '19,99', detail: 'Pour vos échanges du quotidien', popular: true },
  { id: 'world', name: 'Globe-trotter', credits: 5000, price: '34,99', detail: 'Pour aller encore plus loin' },
  { id: 'premium', name: 'Sans frontières', credits: 10000, price: '59,99', detail: 'Pour toutes vos connexions' },
];
export type Transaction = { id: string; date: string; title: string; type: 'purchase' | 'usage' | 'gift'; amount: number };
export const demoTransactions: Transaction[] = [
  { id: 'demo-1', date: '15 oct. 2026', title: 'Pack Explorateur', type: 'purchase', amount: 2500 },
  { id: 'demo-2', date: '14 oct. 2026', title: 'Échange multilingue · exemple', type: 'usage', amount: -450 },
  { id: 'demo-3', date: '12 oct. 2026', title: 'Échange multilingue · exemple', type: 'usage', amount: -600 },
  { id: 'demo-4', date: '10 oct. 2026', title: 'Échange multilingue · exemple', type: 'usage', amount: -400 },
  { id: 'demo-5', date: '08 oct. 2026', title: 'Crédits de bienvenue', type: 'gift', amount: 200 },
];
export const platforms = ['WhatsApp', 'Zoom', 'Teams', 'Google Meet', 'Discord', 'Messenger', 'Instagram', 'Snapchat'];
export const languages = ['Français', 'English', 'Español', 'Deutsch', 'Português'];
export const formatCredits = (n: number) => new Intl.NumberFormat('fr-FR').format(n);
