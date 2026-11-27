import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { BLOCK_SECONDS, MAX_SESSION_BLOCKS } from '@/lib/weechat/usage-meter';
import { desktopBlockCost, type DesktopService } from '@/lib/weechat/desktop-billing';
import { studioClient, studioReady } from '@/lib/weechat/studio-hours';

// Windows app billing. The caller proves its identity with its own Supabase access
// token; amounts are fixed here, never sent by the app. Each block has a unique reference.
const Body = z.object({
  service: z.enum(['swap_live', 'studio_diffusion']),
  sessionId: z.string().uuid(),
  block: z.number().int().min(0).max(MAX_SESSION_BLOCKS),
});

const json = (d: unknown, status = 200) => Response.json(d, { status });

export const Route = createFileRoute('/api/public/desktop-charge')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
        if (!token) return json({ ok: false, error: 'unauthorized' }, 401);
        let input: z.infer<typeof Body>;
        try { input = Body.parse(await request.json()); } catch { return json({ ok: false, error: 'bad_request' }, 400); }
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
        const { data: u, error: ue } = await supabaseAdmin.auth.getUser(token);
        if (ue || !u.user) return json({ ok: false, error: 'unauthorized' }, 401);
        const user = u.user;
        const license = Boolean(user.app_metadata?.['camera_license']);
        if (!license) return json({ ok: false, error: 'license_required', license: false }, 403);
        const service = input.service as DesktopService;
        if (service === 'studio_diffusion') {
          if (!(await studioReady(supabaseAdmin))) return json({ ok: false, error: 'failed', wallet: 'studio', license }, 503);
          const r = await studioClient(supabaseAdmin).rpc('post_studio_operation', {
            p_user_id: user.id, p_seconds: -BLOCK_SECONDS,
            p_reference: `desktop:studio:${user.id}:${input.sessionId}:${input.block}`,
            p_reason: 'Studio Diffusion — bloc de 10 secondes', p_days: 0,
          });
          if (r.error) return json({ ok: false, error: /insufficient/i.test(r.error.message) ? 'insufficient' : 'failed', balance: 0, wallet: 'studio', license }, 402);
          return json({ ok: true, balance: Number(r.data ?? 0), wallet: 'studio', cost: BLOCK_SECONDS, license });
        }
        const cost = desktopBlockCost(service);
        const from = input.block * BLOCK_SECONDS;
        const label = service === 'swap_live' ? 'Swap Live (Windows)' : 'Studio Diffusion Vidéo (Windows)';
        await supabaseAdmin.rpc('expire_balances', { p_user_id: user.id });
        const { error } = await supabaseAdmin.rpc('post_credit_operation', {
          p_user_id: user.id, p_amount: -cost, p_kind: 'usage',
          p_reason: `${label} — ${from}-${from + BLOCK_SECONDS} s`,
          p_reference: `desktop:${service}:${user.id}:${input.sessionId}:${input.block}`,
        });
        const { data: rows } = await supabaseAdmin.from('credit_transactions').select('amount').eq('user_id', user.id);
        const balance = (rows ?? []).reduce((s, r) => s + Number(r.amount), 0);
        const { maybeSendLowBalance } = await import('@/lib/weechat/low-balance.server');
        await maybeSendLowBalance('swap_live', user.id, balance, user.email);
        if (error) {
          const insufficient = /insufficient/i.test(error.message);
          if (!insufficient) console.error('desktop-charge', error.message);
          return json({ ok: false, error: insufficient ? 'insufficient' : 'failed', balance, license }, insufficient ? 402 : 500);
        }
        return json({ ok: true, balance, cost, license });
      },
    },
  },
});
