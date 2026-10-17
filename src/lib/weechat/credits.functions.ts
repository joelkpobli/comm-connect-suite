import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
export const getCredits = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: totals, error } = await context.supabase.rpc('get_credit_totals');
  if (error) throw new Error('Credits unavailable');
  const { data: entries, error: historyError } = await context.supabase.from('credit_transactions').select('id, amount, kind, reason, reference, created_at').eq('user_id', context.userId).order('created_at', { ascending: false }).order('id').limit(100);
  if (historyError) throw new Error('History unavailable');
  return { totals: totals[0] ?? { balance: 0, received: 0, consumed: 0 }, entries: entries ?? [] };
});