// Server-trusted catalogue for PayDunya checkout. Prices (FCFA) come from the
// public pricing grid; the browser only sends an item id, never an amount.
import { swapPlans, audioPlans, cameraLicense } from './landing-copy';

export type CatalogueItem = { id: string; label: string; amountXOF: number; points: number; audioSeconds: number; cameraLicense: boolean };

const xof = (s: string) => Number(s.replace(/\D/g, ''));

export const paydunyaCatalogue: CatalogueItem[] = [
  ...swapPlans.map(p => ({ id: p.id, label: `Weechat ${p.name}`, amountXOF: xof(p.price.XOF), points: p.points ?? 0, audioSeconds: 0, cameraLicense: cameraLicense.includedIn.includes(p.id) })),
  ...audioPlans.map(p => ({ id: p.id, label: `Weechat ${p.name}`, amountXOF: xof(p.price.XOF), points: 0, audioSeconds: (p.audioMin ?? 0) * 60, cameraLicense: false })),
  { id: 'camera-license', label: 'Licence Weechat Camera (à vie)', amountXOF: cameraLicense.priceXOF, points: 0, audioSeconds: 0, cameraLicense: true },
];

export const catalogueIds = paydunyaCatalogue.map(i => i.id) as [string, ...string[]];
export const findItem = (id: string) => paydunyaCatalogue.find(i => i.id === id);
