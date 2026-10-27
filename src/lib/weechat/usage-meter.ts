// Live usage billing rules (browser-safe). Rates are fixed here and applied server-side only.
export const USAGE_RATES = { audio: 1, swap_live: 3 } as const;
export type UsageService = keyof typeof USAGE_RATES;
export const MAX_SESSION_MINUTES = 600;

/** Points to debit for one started minute of a service. */
export const minuteCost = (service: UsageService) => USAGE_RATES[service];

/** Unique ledger reference: replaying the same minute never debits twice. */
export const usageReference = (service: UsageService, userId: string, sessionId: string, minute: number) =>
  `usage:${service}:${userId}:${sessionId}:${minute}`;

export const canStart = (balance: number, service: UsageService) => balance >= minuteCost(service);

/** Minutes left with the current balance. */
export const minutesLeft = (balance: number, service: UsageService) => Math.max(0, Math.floor(balance / minuteCost(service)));
