import { useEffect, useRef, useState } from 'react';
import { Play, Square, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BLOCK_SECONDS, SWAP_POINTS_PER_SECOND, blockCost, secondsLeft, simulateBlock, type UsageService } from '@/lib/weechat/usage-meter';

type Log = { t: number; text: string };
const mmss = (n: number) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;

/** Local-only simulation of live billing: fictive balance, no camera, mic, server or ledger. */
export function UsageDemo({ service, fr }: { service: UsageService; fr: boolean }) {
  const audio = service === 'audio';
  const unit = audio ? (fr ? 's audio' : 'audio s') : 'pts';
  const [start, setStart] = useState(audio ? 45 : 70);
  const [speed, setSpeed] = useState(10);
  const [bal, setBal] = useState<number | null>(null);
  const [sec, setSec] = useState(0); const [running, setRunning] = useState(false);
  const [ended, setEnded] = useState(''); const [log, setLog] = useState<Log[]>([]);
  const st = useRef({ bal: 0, sec: 0, block: 0 }); const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const halt = (why: string) => { clearInterval(timer.current); setRunning(false); setEnded(why); };
  useEffect(() => () => clearInterval(timer.current), []);
  const add = (t: number, text: string) => setLog(l => [...l.slice(-7), { t, text }]);

  const go = () => {
    setLog([]); setEnded(''); setSec(0);
    const first = simulateBlock(start, service);
    if (!first.ok) { setBal(start); setEnded(fr ? 'Démarrage refusé : solde fictif insuffisant pour une tranche.' : 'Start refused: fictive balance too low for one block.'); return; }
    st.current = { bal: first.balance, sec: 0, block: 0 }; setBal(first.balance); setRunning(true);
    add(0, `${fr ? 'Tranche' : 'Block'} 1 : −${blockCost(service)} ${unit}`);
    timer.current = setInterval(() => {
      const s = st.current; s.sec += 1; setSec(s.sec);
      const due = Math.floor(s.sec / BLOCK_SECONDS);
      if (due > s.block) {
        s.block = due; const r = simulateBlock(s.bal, service);
        if (!r.ok) { add(s.sec, fr ? 'Solde épuisé → session coupée' : 'Balance used up → session stopped'); halt(fr ? `Session arrêtée automatiquement après ${mmss(s.sec)} : solde fictif épuisé.` : `Session stopped automatically after ${mmss(s.sec)}: fictive balance used up.`); return; }
        s.bal = r.balance; setBal(r.balance); add(s.sec, `${fr ? 'Tranche' : 'Block'} ${due + 1} : −${blockCost(service)} ${unit}`);
      }
    }, 1000 / speed);
  };

  const left = bal === null ? null : secondsLeft(bal, service);
  return <section className="panel grid gap-3" aria-labelledby={`demo-${service}`}>
    <header className="flex items-center gap-2"><FlaskConical size={18} /><h2 id={`demo-${service}`}>{fr ? 'Mode démonstration du décompte' : 'Billing demo mode'}</h2></header>
    <p className="text-sm text-muted-foreground">{fr ? 'Simulation locale : aucun micro, aucune caméra, aucun serveur, aucun vrai point débité.' : 'Local simulation: no mic, no camera, no server, no real points charged.'} {audio ? (fr ? 'Débite le solde de minutes audio' : 'Debits the audio minutes balance') : (fr ? `${SWAP_POINTS_PER_SECOND} points par seconde` : `${SWAP_POINTS_PER_SECOND} points per second`)} · {fr ? `tranches prépayées de ${BLOCK_SECONDS} s` : `prepaid ${BLOCK_SECONDS} s blocks`} ({blockCost(service)} {unit}).</p>
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="field"><span>{fr ? `Solde fictif de départ (${unit})` : `Fictive starting balance (${unit})`}</span><Input type="number" min={0} max={100000} value={start} disabled={running} onChange={e => setStart(Math.max(0, Math.min(100000, Number(e.target.value) || 0)))} /></label>
      <label className="field"><span>{fr ? 'Vitesse de simulation' : 'Simulation speed'}</span>
        <select className="w-full rounded-md border border-input bg-background p-3 text-foreground" value={speed} disabled={running} onChange={e => setSpeed(Number(e.target.value))}>{[1, 10, 30].map(v => <option key={v} value={v}>×{v}</option>)}</select></label>
    </div>
    <div className="flex flex-wrap items-center gap-3">
      {running ? <Button type="button" variant="outline" onClick={() => halt(fr ? 'Session arrêtée par vous.' : 'Session stopped by you.')}><Square />{fr ? 'Arrêter' : 'Stop'}</Button>
        : <Button type="button" onClick={go}><Play />{fr ? 'Lancer la simulation' : 'Run simulation'}</Button>}
      <span className="demo-badge"><span />{fr ? 'Simulation' : 'Simulation'}</span>
    </div>
    {bal !== null && <p className="text-sm" aria-live="polite"><strong>{fr ? 'Durée' : 'Time'} :</strong> {mmss(sec)} · <strong>{fr ? 'Solde fictif' : 'Fictive balance'} :</strong> {bal} {unit} · <strong>{fr ? 'Reste' : 'Left'} :</strong> {left === null ? '…' : mmss(left)}</p>}
    {running && left !== null && left <= 30 && <p role="alert" className="font-semibold text-destructive">{fr ? 'Moins de 30 secondes restantes : la session va s’arrêter.' : 'Less than 30 seconds left: the session will stop.'}</p>}
    {ended && <p role="alert" className="font-semibold">{ended}</p>}
    {log.length > 0 && <ol className="grid gap-1 text-xs text-muted-foreground">{log.map((l, i) => <li key={i}>{mmss(l.t)} — {l.text}</li>)}</ol>}
  </section>;
}
