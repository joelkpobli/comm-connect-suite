// Server-fixed AI token prices for asynchronous tasks. The browser never sends an amount.
export const AI_TASK_PRICES = { imagePerUnit: 5, talkingPhotoPerSecond: 6, faceSwapPerPhoto: 2, characterSwapPerSecond: 15 } as const;
export const TALKING_PHOTO_MAX_SECONDS = 15;
export const IMAGE_MAX_COUNT = 4;
export const CHARACTER_SWAP_MAX_SECONDS = 15;
export const CHARACTER_SWAP_MAX_BYTES = 25 * 1024 * 1024;
export type AiTaskKind = 'talking_photo' | 'image_generation' | 'face_swap' | 'character_swap';
export function aiTaskCost(kind: AiTaskKind, units: number): number {
  if (!Number.isInteger(units) || units < 1) throw new Error('invalid_units');
  if (kind === 'image_generation') { if (units > IMAGE_MAX_COUNT) throw new Error('invalid_units'); return units * AI_TASK_PRICES.imagePerUnit; }
  if (kind === 'face_swap') { if (units !== 1) throw new Error('invalid_units'); return AI_TASK_PRICES.faceSwapPerPhoto; }
  if (kind === 'character_swap') { if (units > CHARACTER_SWAP_MAX_SECONDS) throw new Error('invalid_units'); return units * AI_TASK_PRICES.characterSwapPerSecond; }
  if (units > TALKING_PHOTO_MAX_SECONDS) throw new Error('invalid_units');
  return units * AI_TASK_PRICES.talkingPhotoPerSecond;
}
export const aiTaskReference = (kind: AiTaskKind, userId: string, taskId: string, refund = false) => `ai:${refund ? 'refund:' : ''}${kind}:${userId}:${taskId}`;
