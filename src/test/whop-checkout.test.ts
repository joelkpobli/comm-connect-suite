import { afterEach, describe, expect, it, vi } from 'vitest';
import { createWhopCheckout } from '@/lib/weechat/whop.server';
import { whopVariants } from '@/lib/weechat/whop-variants';
import { paydunyaCatalogue } from '@/lib/weechat/paydunya-catalog';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });

const configure = () => {
  vi.stubEnv('WHOP_API_KEY', 'test-key');
  vi.stubEnv('WHOP_COMPANY_ID', 'biz_test');
};

describe('Whop existing-plan checkout contract', () => {
  it.each(paydunyaCatalogue.map(item => [item.id]))('sends the mapped variant_id and owner metadata for %s', async itemId => {
    configure();
    const fetcher = vi.fn().mockResolvedValue(Response.json({ purchase_url: 'https://whop.com/checkout/ch_test/' }));
    vi.stubGlobal('fetch', fetcher);
    const result = await createWhopCheckout(itemId, 'owner-test', 'https://www.weechat.online');
    expect(result.url).toBe('https://whop.com/checkout/ch_test/');
    expect(fetcher).toHaveBeenCalledOnce();
    const call = fetcher.mock.calls[0];
    expect(call?.[0]).toBe('https://api.whop.com/api/v1/checkout_configurations');
    const init = call?.[1] as RequestInit | undefined;
    expect(init?.method).toBe('POST');
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    expect(body).toEqual({ variant_id: whopVariants[itemId], mode: 'payment', metadata: { user_id: 'owner-test', item_id: itemId }, redirect_url: 'https://www.weechat.online/paiement-retour?provider=whop' });
    expect(body['variant_id']).toMatch(/^plan_/);
    expect(body).not.toHaveProperty('plan_id');
  });

  it('rejects unknown catalogue items without contacting Whop', async () => {
    configure();
    const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
    await expect(createWhopCheckout('invalid-item', 'owner-test', 'https://www.weechat.online')).rejects.toThrow('Unknown item');
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('fails closed on a rejection and logs only an allowlisted category', async () => {
    configure();
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ error: { type: 'invalid_request_error', message: 'private-customer-details' }, purchase_url: 'private-checkout-url' }, { status: 400 })));
    await expect(createWhopCheckout('starter', 'owner-test', 'https://www.weechat.online')).rejects.toThrow('Checkout unavailable');
    expect(log).toHaveBeenCalledWith('Whop checkout failed', 400, 'invalid_request_error');
    expect(JSON.stringify(log.mock.calls)).not.toContain('private-');
  });

  it('does not log unrecognized provider strings or non-JSON responses', async () => {
    configure();
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetcher = vi.fn()
      .mockResolvedValueOnce(Response.json({ error: { type: 'sensitive-value' } }, { status: 403 }))
      .mockResolvedValueOnce(new Response('private-body', { status: 500 }));
    vi.stubGlobal('fetch', fetcher);
    await expect(createWhopCheckout('starter', 'owner-test', 'https://www.weechat.online')).rejects.toThrow('Checkout unavailable');
    await expect(createWhopCheckout('starter', 'owner-test', 'https://www.weechat.online')).rejects.toThrow('Checkout unavailable');
    expect(log.mock.calls).toEqual([['Whop checkout failed', 403, 'provider_rejected'], ['Whop checkout failed', 500, 'provider_rejected']]);
  });

  it('does not return success without a checkout URL', async () => {
    configure(); vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({})));
    await expect(createWhopCheckout('starter', 'owner-test', 'https://www.weechat.online')).rejects.toThrow('Checkout unavailable');
  });
});