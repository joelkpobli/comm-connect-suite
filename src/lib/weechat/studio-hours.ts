import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
export const CAMERA_STUDIO_BONUS_SECONDS = 72 * 3600;
export const studioBonusHours: Record<string, number> = { decouverte: 6, starter: 24, standard: 72, premium: 168, ultimate: 720 };
export const studioPacks = [
  { id: 'studio-week', name: { fr: 'Semaine', en: 'Week' }, hours: 168, days: 7, amountXOF: 3000, amountUSD: 5 },
  { id: 'studio-month', name: { fr: 'Mois', en: 'Month' }, hours: 720, days: 30, amountXOF: 10000, amountUSD: 16.7 },
  { id: 'studio-year', name: { fr: 'Année', en: 'Year' }, hours: 8760, days: 365, amountXOF: 50000, amountUSD: 83.5 },
] as const;
// Extend only the generated client's RPC surface; never create another Supabase client.
type StudioRpc = { rpc(name: 'get_studio_account' | 'studio_hours_ready' | 'post_studio_operation', args?: Record<string, unknown>): PromiseLike<{ data: unknown; error: { message: string } | null }> };
export const studioClient = (client: SupabaseClient<Database>) => client as unknown as StudioRpc;
export async function studioReady(client: SupabaseClient<Database>) {
  const result = await studioClient(client).rpc('studio_hours_ready');
  return !result.error && result.data === true;
}
export function studioAccount(data: unknown) {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== 'object') return { seconds: 0, expiresAt: null };
  const r = row as Record<string, unknown>;
  return { seconds: Math.max(0, Number(r['seconds']) || 0), expiresAt: typeof r['expires_at'] === 'string' ? r['expires_at'] : null };
}