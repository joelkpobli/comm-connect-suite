import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Info, Wrench, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MODULE_LABELS, type MaintenanceModule } from '@/lib/weechat/founder-shared';

export const maintenanceQuery = { queryKey: ['maintenance'], queryFn: async () => (await supabase.from('maintenance_modules').select('module, active, message')).data ?? [], refetchInterval: 60_000 };

/** Maintenance announcements (everyone) and founder notices (signed-in user). */
export function SystemBanners({ signedIn }: { signedIn: boolean }) {
  const { data: modules } = useQuery(maintenanceQuery);
  const { data: notices } = useQuery({ queryKey: ['my-notices'], enabled: signedIn, queryFn: async () => (await supabase.from('user_notices').select('id, title, message, severity, created_at').order('created_at', { ascending: false }).limit(3)).data ?? [] });
  const [hidden, setHidden] = useState<string[]>([]);
  useEffect(() => { try { setHidden(JSON.parse(localStorage.getItem('weechat-hidden-notices') ?? '[]')); } catch { /* ignore */ } }, []);
  const hide = (id: string) => { const n = [...hidden, id]; setHidden(n); localStorage.setItem('weechat-hidden-notices', JSON.stringify(n)); };
  const active = (modules ?? []).filter((m) => m.active);
  const shown = (notices ?? []).filter((n) => !hidden.includes(n.id));
  if (!active.length && !shown.length) return null;
  return <div className="space-y-2 px-4 pt-3">
    {active.map((m) => <div key={m.module} role="status" className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-foreground">
      <Wrench className="mt-0.5 size-4 shrink-0 text-warning" /><div><strong>Maintenance — {MODULE_LABELS[m.module as MaintenanceModule] ?? m.module}</strong>{m.message && <p className="text-muted-foreground">{m.message}</p>}</div></div>)}
    {shown.map((n) => <div key={n.id} role="alert" className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${n.severity === 'info' ? 'border-primary/40 bg-primary/10' : 'border-destructive/40 bg-destructive/10'}`}>
      {n.severity === 'info' ? <Info className="mt-0.5 size-4 shrink-0 text-primary" /> : <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />}
      <div className="flex-1"><strong>{n.title}</strong><p className="text-muted-foreground">{n.message}</p></div>
      <button type="button" aria-label="Masquer" onClick={() => hide(n.id)} className="rounded p-1 hover:bg-muted"><X className="size-4" /></button></div>)}
  </div>;
}
