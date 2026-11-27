import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { studioAccount, studioClient } from './studio-hours';
export const getStudioAccount = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const result = await studioClient(context.supabase).rpc('get_studio_account');
  if (result.error) return { enabled: false, seconds: 0, expiresAt: null };
  return { enabled: true, ...studioAccount(result.data) };
});
export const getStudioAvailability = createServerFn({ method: 'GET' }).handler(async () => {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { studioReady } = await import('./studio-hours');
  return studioReady(supabaseAdmin);
});