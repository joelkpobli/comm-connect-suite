// Low-balance alert rules (browser-safe, no secrets).
export const LOW_POINTS = 120; // Swap Live: ~60 s at 2 points/s
export const LOW_AUDIO_SECONDS = 120; // translation: 2 minutes left
export type LowService = 'audio' | 'swap_live';

export const isLow = (service: LowService, balance: number) =>
  balance < (service === 'audio' ? LOW_AUDIO_SECONDS : LOW_POINTS);

/** One email per user, service and UTC day: the email service deduplicates on this key. */
export const lowBalanceKey = (service: LowService, userId: string, now: Date) =>
  `low-balance-${service}-${userId}-${now.toISOString().slice(0, 10)}`;
