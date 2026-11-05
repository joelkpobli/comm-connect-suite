import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { catalogueIds } from './paydunya-catalog';
import { createInvoice, fulfillInvoice } from './paydunya.server';

/** Starts a PayDunya checkout for a catalogue item; the amount is decided server-side. */
export const startCheckout = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ itemId: z.enum(catalogueIds) }).parse(d))
  .handler(async ({ data, context }) => {
    const origin = new URL(getRequest().url).origin;
    try { return { ok: true as const, url: (await createInvoice(data.itemId, context.userId, origin)).url }; }
    catch { return { ok: false as const }; }
  });

/** Confirms a returning payment with PayDunya (works even if the IPN arrives late). */
export const confirmCheckout = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ token: z.string().min(6).max(100) }).parse(d))
  .handler(async ({ data, context }) => {
    try { const r = await fulfillInvoice(data.token, context.userId); return { status: r.status, itemId: r.itemId ?? null }; }
    catch { return { status: 'failed' as const, itemId: null }; }
  });

/** Lifetime Weechat Camera licence flag (server-written app metadata, not user-editable). */
export const getCameraLicense = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.auth.getUser();
    return Boolean(data.user?.app_metadata?.['camera_license']);
  });
