import { useEffect, useRef, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { chargeUsageBlock } from '@/lib/weechat/usage.functions';
import { BLOCK_SECONDS, SWAP_POINTS_PER_SECOND, secondsLeft, type UsageService } from '@/lib/weechat/usage-meter';

/** Prepays one block upfront, then every BLOCK_SECONDS; calls onExhausted when the balance runs out. */
export function useUsageMeter(service: UsageService, onExhausted: () => void) {
  const charge = useServerFn(chargeUsageBlock); const qc = useQueryClient();
  const [elapsed, setElapsed] = useState(0); const [balance, setBalance] = useState<number | null>(null);
  const [running, setRunning] = useState(false); const [exhausted, setExhausted] = useState(false);
  const s = useRef<{ id: string; block: number; timer?: ReturnType<typeof setInterval>; t0: number }>({ id: '', block: 0, t0: 0 });
  const cb = useRef(onExhausted); cb.current = onExhausted;

  const refresh = () => { void qc.invalidateQueries({ queryKey: [service === 'audio' ? 'audio-seconds' : 'credits'] }); };
  const end = () => { const was = !!s.current.id; if (s.current.timer) clearInterval(s.current.timer); s.current = { id: '', block: 0, t0: 0 }; setRunning(false); if (was) refresh(); };
  const debit = async (id: string, block: number) => {
    const r = await charge({ data: { service, sessionId: id, block } }).catch(() => ({ ok: false as const, error: 'failed' as const, balance: 0 }));
    setBalance(r.balance); return r;
  };
  /** Returns 'ok', 'insufficient' or 'failed'. */
  const begin = async () => {
    setExhausted(false); const id = crypto.randomUUID();
    const r = await debit(id, 0);
    if (!r.ok) { if (r.error === 'insufficient') setExhausted(true); return r.error; }
    s.current = { id, block: 0, t0: Date.now() }; setElapsed(0); setRunning(true); refresh();
    s.current.timer = setInterval(() => {
      const sec = Math.floor((Date.now() - s.current.t0) / 1000); setElapsed(sec);
      const due = Math.floor(sec / BLOCK_SECONDS);
      if (due > s.current.block) {
        s.current.block = due; const cur = s.current.id;
        void debit(cur, due).then(x => { if (x.ok) refresh(); else if (s.current.id === cur) { setExhausted(x.error === 'insufficient'); end(); cb.current(); } });
      }
    }, 1000);
    return 'ok' as const;
  };
  useEffect(() => () => { if (s.current.timer) clearInterval(s.current.timer); }, []);
  return { begin, end, elapsed, balance, running, exhausted };
}

const mmss = (n: number) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;

export function UsageBadge({ service, meter, fr }: { service: UsageService; meter: ReturnType<typeof useUsageMeter>; fr: boolean }) {
  const audio = service === 'audio';
  const left = meter.balance === null ? null : secondsLeft(meter.balance, service);
  const rate = audio
    ? (fr ? 'Consomme vos minutes de traduction audio (pas vos points)' : 'Uses your audio translation minutes (not your points)')
    : (fr ? `${SWAP_POINTS_PER_SECOND} points par seconde` : `${SWAP_POINTS_PER_SECOND} points per second`);
  return <div className="grid gap-1 rounded-md border border-input bg-muted/40 p-3 text-sm" aria-live="polite">
    <p><strong>{fr ? 'Tarif' : 'Rate'} :</strong> {rate} · {fr ? `prépayé par tranche de ${BLOCK_SECONDS} s` : `prepaid in ${BLOCK_SECONDS} s blocks`}</p>
    {meter.running && <p><strong>{fr ? 'Durée' : 'Time'} :</strong> {mmss(meter.elapsed)} · <strong>{fr ? 'Reste' : 'Left'} :</strong> {left === null ? '…' : mmss(left)}{!audio && meter.balance !== null ? ` (${meter.balance} pts)` : ''}</p>}
    {meter.running && left !== null && left <= 30 && <p role="alert" className="font-semibold text-destructive">{fr ? 'Moins de 30 secondes restantes : la session va s’arrêter.' : 'Less than 30 seconds left: the session will stop.'}</p>}
    {meter.exhausted && <p role="alert" className="font-semibold text-destructive">{audio ? (fr ? 'Minutes de traduction épuisées.' : 'Translation minutes used up.') : (fr ? 'Solde de points insuffisant.' : 'Not enough points.')} <Link to="/credits" className="underline">{audio ? (fr ? 'Acheter un pack Audio' : 'Buy an Audio pack') : (fr ? 'Recharger mes points' : 'Top up my points')}</Link></p>}
  </div>;
}
