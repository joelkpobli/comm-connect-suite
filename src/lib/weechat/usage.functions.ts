import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { BLOCK_SECONDS, MAX_SESSION_BLOCKS, blockCost, usageReference, type UsageService } from './usage-meter';

export type ChargeResult = { ok: true; balance: number } | { ok: false; error: 'insufficient' | 'failed'; balance: number };

/** Audio translation balance, in seconds (separate from points). */
export const getAudioSeconds = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.rpc('get_audio_seconds');
  if (error) throw new Error('Audio balance unavailable');
  return Number(data ?? 0);
});

/** Debits one started block of live usage. Amounts are decided here, never by the browser. */
export const chargeUsageBlock = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ service: z.enum(['audio', 'swap_live']), sessionId: z.string().uuid(), block: z.number().int().min(0).max(MAX_SESSION_BLOCKS) }).parse(d))
  .handler(async ({ data, context }): Promise<ChargeResult> => {
    const service = data.service as UsageService;
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const from = data.block * BLOCK_SECONDS; const to = from + BLOCK_SECONDS;
    const reference = usageReference(service, context.userId, data.sessionId, data.block);
    const { error } = service === 'audio'
      ? await supabaseAdmin.rpc('post_audio_operation', { p_user_id: context.userId, p_seconds: -blockCost(service), p_kind: 'usage', p_reason: `Traduction en direct — ${from}-${to} s`, p_reference: reference })
      : await supabaseAdmin.rpc('post_credit_operation', { p_user_id: context.userId, p_amount: -blockCost(service), p_kind: 'usage', p_reason: `Swap Live — ${from}-${to} s`, p_reference: reference });
    let balance = 0;
    if (service === 'audio') { const r = await context.supabase.rpc('get_audio_seconds'); balance = Number(r.data ?? 0); }
    else { const r = await context.supabase.rpc('get_credit_totals'); const row = Array.isArray(r.data) ? r.data[0] : r.data; balance = Number(row?.balance ?? 0); }
    if (error) {
      console.error('chargeUsageBlock', error.message);
      return { ok: false, error: /insufficient/i.test(error.message) ? 'insufficient' : 'failed', balance };
    }
    return { ok: true, balance };
  });
