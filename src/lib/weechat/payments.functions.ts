import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { catalogueIds } from './catalog';

/** Starts a checkout (Mobile Money via SebPay, card via Whop) for a catalogue item; the amount is decided server-side. */
export const startCheckout = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ itemId: z.enum(catalogueIds), method: z.enum(['mobile', 'card']).default('mobile') }).parse(d))
  .handler(async ({ data, context }) => {
    const origin = new URL(getRequest().url).origin;
    try {
      if (data.itemId.startsWith('studio-')) {
        const { studioReady } = await import('./studio-hours');
        if (!(await studioReady(context.supabase))) return { ok: false as const };
        const { data: account } = await context.supabase.auth.getUser();
        if (!account.user?.app_metadata?.['camera_license']) return { ok: false as const };
      }
      if (data.method === 'card') { const { createWhopCheckout } = await import('./whop.server'); return { ok: true as const, url: (await createWhopCheckout(data.itemId, context.userId, origin)).url }; }
      const { createSebpayCheckout } = await import('./sebpay.server');
      return { ok: true as const, url: (await createSebpayCheckout(data.itemId, context.userId, origin)).url };
    }
    catch { return { ok: false as const }; }
  });

/** Confirms a returning Mobile Money payment with SebPay (works even if the webhook arrives late). */
export const confirmCheckout = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ sessionId: z.string().min(4).max(120) }).parse(d))
  .handler(async ({ data, context }) => {
    try { const { fulfillSebpaySession } = await import('./sebpay.server'); const r = await fulfillSebpaySession(data.sessionId, context.userId); return { status: r.status, itemId: r.itemId ?? null }; }
    catch { return { status: 'failed' as const, itemId: null }; }
  });

/** Lifetime Weechat Camera licence flag (server-written app metadata, not user-editable). */
export const getCameraLicense = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.auth.getUser();
    return Boolean(data.user?.app_metadata?.['camera_license']);
  });
