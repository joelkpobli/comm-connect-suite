import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSebpayCheckout, fulfillSebpaySession, verifySebpaySignature } from '@/lib/weechat/sebpay.server';
import { findItem } from '@/lib/weechat/catalog';

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock('@/integrations/supabase/client.server', () => ({
  supabaseAdmin: { rpc, auth: { admin: { getUserById: vi.fn().mockResolvedValue({ data: { user: { app_metadata: { camera_license: true } } }, error: null }) } } },
}));
const session = (over: Record<string, unknown>) => new Response(JSON.stringify({ id: 'cs_1', status: 'completed', transaction_status: 'approved', amount: 49900, currency: 'XOF', metadata: { user_id: 'owner', item_id: 'standard' }, ...over }));

beforeEach(() => {
  vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.clearAllMocks();
  rpc.mockResolvedValue({ error: null, data: false });
  vi.stubEnv('SEBPAY_PUBLIC_KEY', 'pk_live_x'); vi.stubEnv('SEBPAY_SECRET_KEY', 'sk_live_x');
});

describe('SebPay Mobile Money', () => {
  it('creates a session at the server catalogue price in FCFA with owner metadata', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'cs_1', checkout_url: 'https://pay.sebpay.bj/cs_1' }), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);
    expect(await createSebpayCheckout('standard', 'owner', 'https://www.weechat.online')).toEqual({ url: 'https://pay.sebpay.bj/cs_1', sessionId: 'cs_1' });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://newapi.sebpay.bj/api/v1/checkout/sessions');
    expect(JSON.parse(String(init.body))).toMatchObject({ amount: findItem('standard')?.amountXOF, currency: 'XOF', metadata: { user_id: 'owner', item_id: 'standard' }, callback_url: 'https://www.weechat.online/api/public/sebpay-webhook' });
  });

  it('uses the sandbox server for test keys', async () => {
    vi.stubEnv('SEBPAY_PUBLIC_KEY', 'pk_test_x');
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'cs_1', checkout_url: 'u' }), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);
    await createSebpayCheckout('starter', 'owner', 'https://x');
    expect(fetchMock.mock.calls[0]?.[0]).toBe('https://api.sandbox.sebpay.bj/api/v1/checkout/sessions');
  });

  it('credits an approved session once with the sebpay reference', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(session({})));
    expect(await fulfillSebpaySession('cs_1', 'owner')).toMatchObject({ status: 'completed', itemId: 'standard' });
    expect(rpc).toHaveBeenCalledWith('post_credit_operation', expect.objectContaining({ p_user_id: 'owner', p_reference: 'sebpay:cs_1' }));
  });

  it.each([
    ['pending payment', { transaction_status: 'pending', status: 'open' }, 'pending'],
    ['wrong amount', { amount: 100 }, 'failed'],
    ['wrong currency', { currency: 'EUR' }, 'failed'],
  ] as const)('does not credit a %s', async (_, over, status) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(session(over)));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect((await fulfillSebpaySession('cs_1', 'owner')).status).toBe(status);
    expect(rpc).not.toHaveBeenCalledWith('post_credit_operation', expect.anything());
  });

  it("refuses to reveal another user's session", async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(session({})));
    expect(await fulfillSebpaySession('cs_1', 'intruder')).toEqual({ status: 'failed' });
    expect(rpc).not.toHaveBeenCalled();
  });

  it('accepts only webhooks signed with the secret key', async () => {
    const body = '{"checkout_session_id":"cs_1","status":"approved"}';
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode('sk_live_x'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = Array.from(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body)))).map(b => b.toString(16).padStart(2, '0')).join('');
    expect(await verifySebpaySignature(body, sig)).toBe(true);
    expect(await verifySebpaySignature(body + ' ', sig)).toBe(false);
    expect(await verifySebpaySignature(body, null)).toBe(false);
  });
});
