// Server-trusted catalogue for every checkout provider. Prices (FCFA) come from the
// public pricing grid; the browser only sends an item id, never an amount.
import { swapPlans, audioPlans, tokenPlans, cameraLicense } from './landing-copy';
import { studioPacks, studioBonusHours } from './studio-hours';

export type CatalogueItem = { id: string; label: string; amountXOF: number; amountUSD: number; points: number; audioSeconds: number; cameraLicense: boolean; aiTokens: number; validityDays: number; studioSeconds?: number };

/** AI-token bonus per Swap Live pack, taken from the pricing grid (server-fixed). */
export const aiTokenBonus: Record<string, number> = Object.fromEntries(swapPlans.map(p => [p.id, p.bonusAiTokens ?? 0]));

const xof = (s: string) => Number(s.replace(/\D/g, ''));
const usd = (s: string) => Number(s.replace(/\s/g, '').replace(',', '.'));

export const catalogue: CatalogueItem[] = [
  ...studioPacks.map(p => ({ id: p.id, label: `Weechat Studio ${p.name.fr}`, amountXOF: p.amountXOF, amountUSD: p.amountUSD, points: 0, audioSeconds: 0, cameraLicense: false, aiTokens: 0, validityDays: p.days, studioSeconds: p.hours * 3600 })),
  ...swapPlans.map(p => ({ id: p.id, label: `Weechat ${p.name}`, amountXOF: xof(p.price.XOF), amountUSD: usd(p.price.USD), points: p.points ?? 0, audioSeconds: (p.bonusAudioMin ?? 0) * 60, cameraLicense: cameraLicense.includedIn.includes(p.id), aiTokens: aiTokenBonus[p.id] ?? 0, validityDays: p.validity })),
  ...audioPlans.map(p => ({ id: p.id, label: `Weechat ${p.name}`, amountXOF: xof(p.price.XOF), amountUSD: usd(p.price.USD), points: 0, audioSeconds: (p.audioMin ?? 0) * 60, cameraLicense: false, aiTokens: 0, validityDays: p.validity })),
  ...tokenPlans.map(p => ({ id: p.id, label: `Weechat ${p.name}`, amountXOF: xof(p.price.XOF), amountUSD: usd(p.price.USD), points: 0, audioSeconds: 0, cameraLicense: false, aiTokens: p.aiTokens ?? 0, validityDays: p.validity })),
  { id: 'camera-license', label: 'Licence Weechat Camera (à vie)', amountXOF: cameraLicense.priceXOF, amountUSD: usd(cameraLicense.price.USD), points: 0, audioSeconds: 0, cameraLicense: true, aiTokens: 0, validityDays: 0 },
];

export const catalogueIds = catalogue.map(i => i.id) as [string, ...string[]];
for (const item of catalogue) {
  const hours = studioBonusHours[item.id];
  if (hours) item.studioSeconds = hours * 3600;
}
export const findItem = (id: string) => catalogue.find(i => i.id === id);
