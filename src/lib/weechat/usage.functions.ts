import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { MAX_SESSION_MINUTES, minuteCost, usageReference, type UsageService } from './usage-meter';

export type ChargeResult = { ok: true; balance: number } | { ok: false; error: 'insufficient' | 'failed'; balance: number };

/** Debits one started minute of live usage. Amount is decided here, never by the browser. */
export const chargeUsageMinute = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ service: z.enum(['audio', 'swap_live']), sessionId: z.string().uuid(), minute: z.number().int().min(0).max(MAX_SESSION_MINUTES) }).parse(d))
  .handler(async ({ data, context }): Promise<ChargeResult> => {
    const service = data.service as UsageService;
    const readBalance = async () => {
      const { data: t } = await context.supabase.rpc('get_credit_totals');
      const row = Array.isArray(t) ? t[0] : t;
      return Number(row?.balance ?? 0);
    };
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const label = service === 'audio' ? 'Traduction en direct' : 'Swap Live';
    const { error } = await supabaseAdmin.rpc('post_credit_operation', {
      p_user_id: context.userId, p_amount: -minuteCost(service), p_kind: 'usage',
      p_reason: `${label} — minute ${data.minute + 1}`,
      p_reference: usageReference(service, context.userId, data.sessionId, data.minute),
    });
    const balance = await readBalance();
    if (error) {
      console.error('chargeUsageMinute', error.message);
      return { ok: false, error: /insufficient|negative|balance/i.test(error.message) ? 'insufficient' : 'failed', balance };
    }
    return { ok: true, balance };
  });
