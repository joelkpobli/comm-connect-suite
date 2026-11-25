import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { realRelay, realTranscribe, realTranslate, realSynthesize } from '@/lib/weechat/communication.functions';
import { founderAdjustBalance } from '@/lib/weechat/founder.functions';
import { fulfillInvoice } from '@/lib/weechat/paydunya.server';
import { usageReference } from '@/lib/weechat/usage-meter';

const { provider, write } = vi.hoisted(() => ({ provider: vi.fn(), write: vi.fn() }));
vi.mock('@/integrations/supabase/auth-middleware', () => ({ requireSupabaseAuth: {} }));
// Exercise real validators and handlers, with no network or paid provider work.
vi.mock('@tanstack/react-start', () => ({
  createServerFn: () => {
    let parse: (data: unknown) => unknown = data => data;
    const chain = {
      middleware: () => chain,
      inputValidator: (validator: typeof parse) => { parse = validator; return chain; },
      handler: (handler: (args: { data: unknown; context: unknown }) => unknown) =>
        (args: { data: unknown; context: unknown }) => handler({ ...args, data: parse(args.data) }),
    };
    return chain;
  },
}));
vi.mock('@/lib/weechat/real-providers.server', () => ({
  ProviderError: class extends Error {},
  relayTurn: provider, deepgramTranscribe: provider, deeplTranslate: provider, deepgramSynthesize: provider,
}));
vi.mock('@/integrations/supabase/client.server', () => ({ supabaseAdmin: { rpc: write } }));

const owner = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
const sessionId = '33333333-3333-4333-8333-333333333333';
const audio = { audioBase64: 'AQ==', mime: 'audio/webm', source: 'fr', target: 'en', language: 'fr', text: 'bonjour', sessionId, block: 0 };
const now = new Date('2026-11-25T12:00:00Z');
const paidRow = () => ({ user_id: owner, reference: usageReference('audio', owner, sessionId, 0), kind: 'usage', seconds: -10, created_at: now.toISOString() });

function context(row: Record<string, string | number> | null, failed = false, isAdmin = true) {
  const filters: ((row: Record<string, string | number>) => boolean)[] = [];
  const query = {
    select: () => query,
    eq: (key: string, value: string | number) => { filters.push(r => r[key] === value); return query; },
    gte: (key: string, value: string) => { filters.push(r => String(r[key]) >= value); return query; },
    lte: (key: string, value: string) => { filters.push(r => String(r[key]) <= value); return query; },
    maybeSingle: async () => ({ data: row && filters.every(f => f(row)) ? { id: 'paid' } : null, error: failed ? { message: 'unavailable' } : null }),
  };
  return { userId: owner, supabase: { from: () => query, rpc: vi.fn().mockResolvedValue({ data: isAdmin, error: null }) } };
}
async function invoke(fn: unknown, data: unknown, ctx = context(null)) {
  return await Reflect.apply(fn as (...args: unknown[]) => unknown, undefined, [{ data, context: ctx }]);
}

beforeEach(() => {
  vi.clearAllMocks(); vi.useFakeTimers(); vi.setSystemTime(now);
  provider.mockResolvedValue({ transcript: 'bonjour', translation: 'hello', speech: new Uint8Array([1]), timings: {} });
  write.mockResolvedValue({ error: null });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('prepaid translation authorization', () => {
  it.each([realRelay, realTranscribe, realTranslate, realSynthesize])('rejects unpaid provider actions before provider work', async fn => {
    expect(await invoke(fn, audio)).toMatchObject({ ok: false, error: 'not_paid' });
    expect(provider).not.toHaveBeenCalled();
  });
  it('requires a session and block rather than trusting sign-in alone', async () => {
    const { sessionId: _session, block: _block, ...withoutPayment } = audio;
    await expect(invoke(realRelay, withoutPayment)).rejects.toThrow();
    expect(provider).not.toHaveBeenCalled();
  });
  it.each([
    { user_id: other }, { reference: usageReference('audio', owner, sessionId, 1) },
    { kind: 'purchase', seconds: 10 }, { seconds: -1 },
    { created_at: '2026-11-25T11:59:49Z' }, { created_at: '2026-11-25T12:00:01Z' },
  ])('rejects wrong-owner, wrong-block, invalid or expired payments: %j', async overrides => {
    expect(await invoke(realRelay, audio, context({ ...paidRow(), ...overrides }))).toMatchObject({ error: 'not_paid' });
    expect(provider).not.toHaveBeenCalled();
  });
  it('fails closed when the ledger read fails', async () => {
    expect(await invoke(realRelay, audio, context(paidRow(), true))).toMatchObject({ error: 'not_paid' });
    expect(provider).not.toHaveBeenCalled();
  });
  it('allows a caller with the current ten-second prepaid block', async () => {
    expect(await invoke(realRelay, audio, context(paidRow()))).toMatchObject({ ok: true, value: { translation: 'hello' } });
    expect(provider).toHaveBeenCalledOnce();
  });
});

describe('founder self-credit restrictions', () => {
  it.each(['audio_minutes', 'tokens'])('rejects positive self-grants in %s', async wallet => {
    expect(await invoke(founderAdjustBalance, { userId: owner, wallet, amount: 100, reason: 'Test adjustment' })).toMatchObject({ ok: false });
    expect(write).not.toHaveBeenCalled();
  });
  it.each(['audio_minutes', 'tokens'])('preserves authorized adjustments for other users in %s', async wallet => {
    expect(await invoke(founderAdjustBalance, { userId: other, wallet, amount: 100, reason: 'Support adjustment' })).toMatchObject({ ok: true });
    expect(write).toHaveBeenCalledWith(wallet === 'tokens' ? 'post_ai_token_operation' : 'post_audio_operation', expect.objectContaining({ p_user_id: other }));
  });
  it.each(['audio_minutes', 'tokens'])('preserves self-withdrawals in %s', async wallet => {
    expect(await invoke(founderAdjustBalance, { userId: owner, wallet, amount: -1, reason: 'Correction' })).toMatchObject({ ok: true });
    expect(write).toHaveBeenCalledOnce();
  });
  it('still denies non-administrators attempting other-account adjustments', async () => {
    await expect(invoke(founderAdjustBalance, { userId: other, wallet: 'tokens', amount: 100, reason: 'Test' }, context(null, false, false))).rejects.toThrow('Forbidden');
    expect(write).not.toHaveBeenCalled();
  });
});

describe('payment mismatch diagnostics', () => {
  it('rejects mismatched invoices without exposing their token in logs', async () => {
    vi.stubEnv('PAYDUNYA_MASTER_KEY', 'test'); vi.stubEnv('PAYDUNYA_PRIVATE_KEY', 'test'); vi.stubEnv('PAYDUNYA_TOKEN', 'test');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      response_code: '00', status: 'completed', invoice: { total_amount: 1 }, custom_data: { user_id: owner, item_id: 'standard' },
    }))));
    const logs = vi.spyOn(console, 'error').mockImplementation(() => {});
    const token = 'test-private-invoice-token';
    expect(await fulfillInvoice(token, owner)).toEqual({ status: 'failed' });
    expect(logs).toHaveBeenCalledOnce();
    expect(JSON.stringify(logs.mock.calls)).not.toContain(token);
    expect(write).not.toHaveBeenCalled();
  });
});