import { afterEach, describe, expect, it, vi } from 'vitest';
import { startCheckout } from '@/lib/weechat/payments.functions';

const { card, mobile } = vi.hoisted(() => ({ card: vi.fn(), mobile: vi.fn() }));
vi.mock('@/lib/weechat/whop.server', () => ({ createWhopCheckout: card }));
vi.mock('@/lib/weechat/sebpay.server', () => ({ createSebpayCheckout: mobile, fulfillSebpaySession: vi.fn() }));
vi.mock('@/integrations/supabase/auth-middleware', () => ({ requireSupabaseAuth: {} }));
vi.mock('@tanstack/react-start/server', () => ({ getRequest: () => new Request('https://www.weechat.online/credits') }));
vi.mock('@tanstack/react-start', () => ({
  createServerFn: () => {
    let parse: (value: unknown) => unknown = value => value;
    const chain = {
      middleware: () => chain,
      inputValidator: (validator: typeof parse) => { parse = validator; return chain; },
      handler: (handler: (args: { data: unknown; context: unknown }) => unknown) =>
        (args: { data: unknown; context: unknown }) => handler({ ...args, data: parse(args.data) }),
    };
    return chain;
  },
}));

afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

// Invoke the real handler and validation without making external purchases.
const checkout = startCheckout as unknown as (args: { data: { itemId: string; method: 'card' | 'mobile' }; context: { userId: string } }) => Promise<unknown>;

describe('Shared purchase entrypoint', () => {
  it('routes card purchases through Whop using the authenticated owner and catalogue ID', async () => {
    card.mockResolvedValue({ url: 'https://whop.com/checkout/ch_test/' });
    expect(await checkout({ data: { itemId: 'starter', method: 'card' }, context: { userId: 'owner-test' } })).toEqual({ ok: true, url: 'https://whop.com/checkout/ch_test/' });
    expect(card).toHaveBeenCalledWith('starter', 'owner-test', 'https://www.weechat.online');
    expect(mobile).not.toHaveBeenCalled();
  });

  it('routes Mobile Money purchases through SebPay using the authenticated owner', async () => {
    mobile.mockResolvedValue({ url: 'https://pay.sebpay.bj/s/cs_test', sessionId: 'cs_test' });
    expect(await checkout({ data: { itemId: 'starter', method: 'mobile' }, context: { userId: 'owner-test' } })).toEqual({ ok: true, url: 'https://pay.sebpay.bj/s/cs_test' });
    expect(mobile).toHaveBeenCalledWith('starter', 'owner-test', 'https://www.weechat.online');
    expect(card).not.toHaveBeenCalled();
  });

  it('fails closed when the card provider rejects checkout', async () => {
    card.mockRejectedValue(new Error('Checkout unavailable'));
    expect(await checkout({ data: { itemId: 'starter', method: 'card' }, context: { userId: 'owner-test' } })).toEqual({ ok: false });
    expect(mobile).not.toHaveBeenCalled();
  });
});