// Server-only: records provider calls and auto-pauses a module after repeated billing failures.
import { AUTO_PAUSE_AFTER, PROVIDER_COST_USD, type MaintenanceModule } from './founder-shared';

type Status = 'ok' | 'billing' | 'failed';

export async function isModulePaused(module: MaintenanceModule): Promise<boolean> {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { data } = await supabaseAdmin.from('maintenance_modules').select('module, active').in('module', ['global', module]);
  return (data ?? []).some((r) => r.active);
}

export async function recordProviderEvent(provider: string, kind: string, status: Status, module: MaintenanceModule, error?: string) {
  try {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    await supabaseAdmin.from('provider_usage_events').insert({ provider, kind, status, cost_usd: status === 'ok' ? (PROVIDER_COST_USD[kind] ?? 0) : 0, error: error?.slice(0, 300) ?? null });
    if (status !== 'billing') return;
    const { data } = await supabaseAdmin.from('provider_usage_events').select('status').eq('provider', provider).order('created_at', { ascending: false }).limit(AUTO_PAUSE_AFTER);
    if ((data ?? []).length >= AUTO_PAUSE_AFTER && data!.every((r) => r.status === 'billing')) {
      await supabaseAdmin.from('maintenance_modules').update({ active: true, message: `Maintenance technique en cours sur ce service. Aucun jeton n'est débité. Retour imminent.`, updated_at: new Date().toISOString() }).eq('module', module);
    }
  } catch (e) { console.error('recordProviderEvent', e instanceof Error ? e.message : e); }
}
