import { beforeEach, describe, expect, it, vi } from 'vitest';
import { findItem } from '@/lib/weechat/paydunya-catalog';
import { fulfillInvoice } from '@/lib/weechat/paydunya.server';

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock('@/integrations/supabase/client.server', () => ({
  supabaseAdmin: {
    rpc,
    auth: { admin: { getUserById: vi.fn().mockResolvedValue({ data: { user: { app_metadata: { camera_license: true } } }, error: null }) } },
  },
}));

describe('PayDunya translation bonuses', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    rpc.mockResolvedValue({ error: null });
    vi.stubEnv('PAYDUNYA_MASTER_KEY', 'test-master');
    vi.stubEnv('PAYDUNYA_PRIVATE_KEY', 'test-private');
    vi.stubEnv('PAYDUNYA_TOKEN', 'test-token');
  });

  it.each([
    ['standard', 49900, 1800, 90],
    ['premium', 84900, 3600, 365],
    ['ultimate', 150000, 7200, 365],
  ] as const)('%s credits the advertised bonus and applies pack validity', async (id, price, seconds, days) => {
    expect(findItem(id)?.audioSeconds).toBe(seconds);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      response_code: '00', status: 'completed', invoice: { total_amount: price },
      custom_data: { user_id: 'owner', item_id: id },
    }))));

    expect(await fulfillInvoice('test-invoice', 'owner')).toMatchObject({ status: 'completed', itemId: id });
    expect(rpc).toHaveBeenCalledWith('post_audio_operation', {
      p_user_id: 'owner', p_seconds: seconds, p_kind: 'purchase',
      p_reason: expect.any(String), p_reference: 'paydunya:test-invoice',
    });
    expect(rpc).toHaveBeenCalledWith('extend_validity', {
      p_user_id: 'owner', p_target: 'audio', p_days: days,
    });
  });

  it.each(['decouverte', 'starter', 'camera-license'])('%s does not include bonus translation time', id => {
    expect(findItem(id)?.audioSeconds).toBe(0);
  });

  it.each([['audio-flash', 600], ['audio-pro', 3600], ['audio-marathon', 7200]] as const)(
    '%s keeps its purchased audio duration', (id, seconds) => {
      expect(findItem(id)?.audioSeconds).toBe(seconds);
    },
  );
});