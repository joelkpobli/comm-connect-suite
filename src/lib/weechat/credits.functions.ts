import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
const snapshotSchema = z.object({ totals: z.object({ balance: z.number().int().safe(), received: z.number().int().safe(), consumed: z.number().int().safe() }), entries: z.array(z.object({ id: z.string(), amount: z.number().int().safe(), kind: z.string(), reason: z.string(), reference: z.string(), created_at: z.string() })) });
export const getCredits = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.rpc('get_credit_snapshot');
  if (error) throw new Error('Credits unavailable');
  return snapshotSchema.parse(data);
});