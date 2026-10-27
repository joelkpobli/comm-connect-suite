import { useEffect, useRef, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { chargeUsageMinute } from '@/lib/weechat/usage.functions';
import { minuteCost, minutesLeft, type UsageService } from '@/lib/weechat/usage-meter';

/** Debits one started minute upfront, then every 60 s; calls onExhausted when the balance runs out. */
export function useUsageMeter(service: UsageService, onExhausted: () => void) {
  const charge = useServerFn(chargeUsageMinute); const qc = useQueryClient();
  const [elapsed, setElapsed] = useState(0); const [balance, setBalance] = useState<number | null>(null);
  const [running, setRunning] = useState(false); const [exhausted, setExhausted] = useState(false);
  const s = useRef<{ id: string; minute: number; timer?: ReturnType<typeof setInterval>; t0: number }>({ id: '', minute: 0, t0: 0 });
  const cb = useRef(onExhausted); cb.current = onExhausted;

  const end = () => { if (s.current.timer) clearInterval(s.current.timer); s.current = { id: '', minute: 0, t0: 0 }; setRunning(false); void qc.invalidateQueries({ queryKey: ['credits'] }); };
  const debit = async (id: string, minute: number) => {
    const r = await charge({ data: { service, sessionId: id, minute } }).catch(() => ({ ok: false as const, error: 'failed' as const, balance: balance ?? 0 }));
    setBalance(r.balance); return r;
  };
  /** Returns 'ok', 'insufficient' or 'failed'. */
  const begin = async () => {
    setExhausted(false); const id = crypto.randomUUID();
    const r = await debit(id, 0);
    if (!r.ok) { if (r.error === 'insufficient') setExhausted(true); return r.error; }
    s.current = { id, minute: 0, t0: Date.now() }; setElapsed(0); setRunning(true);
    s.current.timer = setInterval(() => {
      const sec = Math.floor((Date.now() - s.current.t0) / 1000); setElapsed(sec);
      const due = Math.floor(sec / 60);
      if (due > s.current.minute) {
        s.current.minute = due; const cur = s.current.id;
        void debit(cur, due).then(x => { if (!x.ok && s.current.id === cur) { setExhausted(x.error === 'insufficient'); end(); cb.current(); } });
      }
    }, 1000);
    return 'ok' as const;
  };
  useEffect(() => () => { if (s.current.timer) clearInterval(s.current.timer); }, []);
  return { begin, end, elapsed, balance, running, exhausted };
}

const mmss = (n: number) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;

export function UsageBadge({ service, meter, fr }: { service: UsageService; meter: ReturnType<typeof useUsageMeter>; fr: boolean }) {
  const cost = minuteCost(service); const left = meter.balance === null ? null : minutesLeft(meter.balance, service);
  return <div className="grid gap-1 rounded-md border border-input bg-muted/40 p-3 text-sm" aria-live="polite">
    <p><strong>{fr ? 'Tarif' : 'Rate'} :</strong> {cost} {fr ? (cost > 1 ? 'points' : 'point') : (cost > 1 ? 'points' : 'point')} / min {fr ? '(chaque minute commencée est due)' : '(each started minute is charged)'}</p>
    {meter.running && <p><strong>{fr ? 'Durée' : 'Time'} :</strong> {mmss(meter.elapsed)} · <strong>{fr ? 'Solde' : 'Balance'} :</strong> {meter.balance} pts</p>}
    {meter.running && left !== null && left <= 1 && <p role="alert" className="font-semibold text-destructive">{fr ? 'Il vous reste moins d’une minute : la session va s’arrêter.' : 'Less than a minute left: the session will stop.'}</p>}
    {meter.exhausted && <p role="alert" className="font-semibold text-destructive">{fr ? 'Solde de points insuffisant.' : 'Not enough points.'} <Link to="/credits" className="underline">{fr ? 'Recharger mes points' : 'Top up my points'}</Link></p>}
  </div>;
}
