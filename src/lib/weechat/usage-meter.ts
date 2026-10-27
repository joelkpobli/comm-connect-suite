// Live usage billing rules (browser-safe), aligned on the pricing page (facEvo model):
// - Swap Live consumes POINTS: 2 points per second.
// - Live translation consumes the separate AUDIO MINUTES balance (seconds of talk time).
// Usage is prepaid in blocks of BLOCK_SECONDS; the server alone applies these amounts.
export const BLOCK_SECONDS = 10;
export const SWAP_POINTS_PER_SECOND = 2;
export type UsageService = 'audio' | 'swap_live';
export type UsageUnit = 'points' | 'audio_seconds';
export const MAX_SESSION_BLOCKS = 6 * 360; // 6 h

export const usageUnit = (service: UsageService): UsageUnit => (service === 'audio' ? 'audio_seconds' : 'points');

/** Amount debited for one started block, in the service's own unit. */
export const blockCost = (service: UsageService) => (service === 'audio' ? BLOCK_SECONDS : BLOCK_SECONDS * SWAP_POINTS_PER_SECOND);

/** Unique ledger reference: replaying the same block never debits twice. */
export const usageReference = (service: UsageService, userId: string, sessionId: string, block: number) =>
  `usage:${service}:${userId}:${sessionId}:${block}`;

export const canStart = (balance: number, service: UsageService) => balance >= blockCost(service);

/** Seconds of use left with the current balance (in that service's unit). */
export const secondsLeft = (balance: number, service: UsageService) =>
  service === 'audio' ? Math.max(0, balance) : Math.max(0, Math.floor(balance / SWAP_POINTS_PER_SECOND));

/** Pure local debit step used by the demo simulator (same rules as the server). */
export function simulateBlock(balance: number, service: UsageService): { ok: boolean; balance: number } {
  const cost = blockCost(service);
  return balance >= cost ? { ok: true, balance: balance - cost } : { ok: false, balance };
}
