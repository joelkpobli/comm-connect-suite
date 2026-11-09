// Server-fixed AI token prices for asynchronous tasks. The browser never sends an amount.
export const AI_TASK_PRICES = { imagePerUnit: 5, talkingPhotoPerSecond: 3 } as const;
export const TALKING_PHOTO_MAX_SECONDS = 60;
export const IMAGE_MAX_COUNT = 4;
export type AiTaskKind = 'talking_photo' | 'image_generation';
export function aiTaskCost(kind: AiTaskKind, units: number): number {
  if (!Number.isInteger(units) || units < 1) throw new Error('invalid_units');
  if (kind === 'image_generation') { if (units > IMAGE_MAX_COUNT) throw new Error('invalid_units'); return units * AI_TASK_PRICES.imagePerUnit; }
  if (units > TALKING_PHOTO_MAX_SECONDS) throw new Error('invalid_units');
  return units * AI_TASK_PRICES.talkingPhotoPerSecond;
}
export const aiTaskReference = (kind: AiTaskKind, userId: string, taskId: string, refund = false) => `ai:${refund ? 'refund:' : ''}${kind}:${userId}:${taskId}`;
