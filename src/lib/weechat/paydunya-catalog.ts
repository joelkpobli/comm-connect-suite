// Server-trusted catalogue for PayDunya checkout. Prices (FCFA) come from the
// public pricing grid; the browser only sends an item id, never an amount.
import { swapPlans, audioPlans, tokenPlans, cameraLicense } from './landing-copy';

export type CatalogueItem = { id: string; label: string; amountXOF: number; points: number; audioSeconds: number; cameraLicense: boolean; aiTokens: number; validityDays: number };

/** AI-token bonus per Swap Live pack (server-fixed). */
export const aiTokenBonus: Record<string, number> = { starter: 100, standard: 200, premium: 450, ultimate: 1000 };

const xof = (s: string) => Number(s.replace(/\D/g, ''));

export const paydunyaCatalogue: CatalogueItem[] = [
  ...swapPlans.map(p => ({ id: p.id, label: `Weechat ${p.name}`, amountXOF: xof(p.price.XOF), points: p.points ?? 0, audioSeconds: (p.bonusAudioMin ?? 0) * 60, cameraLicense: cameraLicense.includedIn.includes(p.id), aiTokens: aiTokenBonus[p.id] ?? 0, validityDays: p.validity })),
  ...audioPlans.map(p => ({ id: p.id, label: `Weechat ${p.name}`, amountXOF: xof(p.price.XOF), points: 0, audioSeconds: (p.audioMin ?? 0) * 60, cameraLicense: false, aiTokens: 0, validityDays: p.validity })),
  ...tokenPlans.map(p => ({ id: p.id, label: `Weechat ${p.name}`, amountXOF: xof(p.price.XOF), points: 0, audioSeconds: 0, cameraLicense: false, aiTokens: p.aiTokens ?? 0, validityDays: p.validity })),
  { id: 'camera-license', label: 'Licence Weechat Camera (à vie)', amountXOF: cameraLicense.priceXOF, points: 0, audioSeconds: 0, cameraLicense: true, aiTokens: 0, validityDays: 0 },
];

export const catalogueIds = paydunyaCatalogue.map(i => i.id) as [string, ...string[]];
export const findItem = (id: string) => paydunyaCatalogue.find(i => i.id === id);
