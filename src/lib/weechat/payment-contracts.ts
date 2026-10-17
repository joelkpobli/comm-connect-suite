// Architecture only: no provider, endpoint, prices, secrets, persistence or payment activation.
export type PaymentState = 'pending' | 'succeeded' | 'failed' | 'partially_refunded' | 'refunded';
export type ApprovedCatalogueItem = { id: string; currency: string; priceMinor: number; credits: number };
export type PaymentConfiguration = { merchantCountry?: string; currency?: string; catalogue?: ApprovedCatalogueItem[]; providerApproved: boolean; testVerified: boolean };
export function paymentBlockers(config: PaymentConfiguration): string[] {
  const blockers = ['payments_not_enabled'];
  if (!config.merchantCountry) blockers.push('merchant_country_required');
  if (!config.currency) blockers.push('currency_required');
  if (!config.catalogue?.length || config.catalogue.some(item => !Number.isSafeInteger(item.priceMinor) || item.priceMinor <= 0 || !Number.isSafeInteger(item.credits) || item.credits <= 0 || item.currency !== config.currency)) blockers.push('approved_catalogue_required');
  if (!config.providerApproved) blockers.push('provider_review_required');
  if (!config.testVerified) blockers.push('verified_test_flow_required');
  return blockers;
}
export function initiatePayment(): never { throw new Error('Payments are not enabled'); }
// Future implementations must be server-only. Verified events still require durable
// order lookup, amount/currency matching and unique ledger references before fulfillment.
export interface FutureServerPaymentAdapter {
  createTestCheckout(itemId: string, ownerId: string): Promise<{ url: string; providerReference: string }>;
  verifySignedEvent(rawBody: string, signature: string): Promise<{ reference: string; state: PaymentState; orderId: string; amountMinor: number; currency: string }>;
  reconcile(providerReference: string): Promise<PaymentState>;
  refund(providerReference: string, amountMinor: number): Promise<string>;
}
