import { useEffect, useRef, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { ArrowLeftRight, Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useDemo } from './provider';
import { useUsageMeter, UsageBadge } from './usage-meter';
import { palabraSession, palabraStatus } from '@/lib/weechat/communication.functions';
import { PALABRA_CODES, PALABRA_LANGUAGES, PALABRA_SAMPLE_RATE, buildSetTask, floatToPcmBase64, parsePalabraMessage, pcmBase64ToFloat, type PalabraLang } from '@/lib/weechat/palabra';

const copy = {
  fr: { title: 'Traduction en direct (streaming)', intro: 'Parlez sans vous arrêter : votre voix est traduite en continu, en moins d’une seconde, dans 48 langues.', from: 'Je parle', to: 'L’autre entend', clone: 'Garder le timbre de ma voix (clonage automatique)', consent: 'J’accepte que ma voix soit envoyée au service de traduction Palabra pendant la session. Rien n’est conservé.', start: 'Démarrer la traduction', stop: 'Arrêter', connecting: 'Connexion…', live: '● En direct', out: 'Sortie de la voix traduite', def: 'Sortie par défaut', cable: 'Choisissez « CABLE Input » pour WhatsApp/Zoom (micro « CABLE Output »). Utilisez un casque pour éviter l’écho.', missing: 'Service Palabra non configuré : la clé n’est pas encore enregistrée.', denied: 'Micro refusé ou indisponible.', failed: 'La connexion à Palabra a échoué.', heard: 'Ce que vous dites', said: 'Ce que l’autre entend', empty: 'Les sous-titres apparaîtront ici.' },
  en: { title: 'Live translation (streaming)', intro: 'Speak continuously: your voice is translated in under a second, in 48 languages.', from: 'I speak', to: 'They hear', clone: 'Keep my voice timbre (automatic cloning)', consent: 'I agree my voice is sent to the Palabra translation service during the session. Nothing is kept.', start: 'Start translation', stop: 'Stop', connecting: 'Connecting…', live: '● Live', out: 'Translated voice output', def: 'Default output', cable: 'Pick “CABLE Input” for WhatsApp/Zoom (mic “CABLE Output”). Use headphones to avoid echo.', missing: 'Palabra service not configured: the key is not saved yet.', denied: 'Microphone denied or unavailable.', failed: 'Connection to Palabra failed.', heard: 'What you say', said: 'What they hear', empty: 'Subtitles will appear here.' },
};
const sel = 'w-full rounded-md border border-input bg-background p-3 text-foreground';
const WORKLET = `class P extends AudioWorkletProcessor{constructor(){super();this.b=[];this.n=0}process(i){const c=i[0]&&i[0][0];if(c){this.b.push(new Float32Array(c));this.n+=c.length;if(this.n>=2400){const o=new Float32Array(this.n);let k=0;for(const x of this.b){o.set(x,k);k+=x.length}this.port.postMessage(o,[o.buffer]);this.b=[];this.n=0}}return true}}registerProcessor('pcm-out',P)`;
type Line = { id: string; src: string; dst: string };

export function LiveTranslator() {
  const { locale } = useDemo(); const c = copy[locale];
  const status = useServerFn(palabraStatus); const session = useServerFn(palabraSession);
  const [ready, setReady] = useState<boolean | null>(null);
  const [from, setFrom] = useState<PalabraLang>('fr'); const [to, setTo] = useState<PalabraLang>('en');
  const [clone, setClone] = useState(true); const [agree, setAgree] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'connecting' | 'live'>('idle'); const [msg, setMsg] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [outs, setOuts] = useState<MediaDeviceInfo[]>([]); const [sink, setSink] = useState('');
  const r = useRef<{ ws?: WebSocket; stream?: MediaStream; inCtx?: AudioContext; outCtx?: AudioContext; t: number }>({ t: 0 });

  const meterRef = useRef<{ end(): void } | null>(null);
  const stop = () => {
    meterRef.current?.end();
    const s = r.current;
    try { if (s.ws?.readyState === WebSocket.OPEN) s.ws.send(JSON.stringify({ message_type: 'end_task', data: {} })); } catch { /* closing */ }
    s.ws?.close(); s.stream?.getTracks().forEach(t => t.stop()); void s.inCtx?.close(); void s.outCtx?.close();
    r.current = { t: 0 }; setPhase('idle');
  };
  const meter = useUsageMeter('audio', () => stop()); meterRef.current = meter;
  useEffect(() => { status().then(s => setReady(s.configured)).catch(() => setReady(false)); }, [status]);
  useEffect(() => { const h = () => { if (document.hidden) stop(); }; document.addEventListener('visibilitychange', h); return () => { document.removeEventListener('visibilitychange', h); stop(); }; }, []);
  const loadOuts = async () => { try { setOuts((await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'audiooutput' && d.deviceId && d.deviceId !== 'default')); } catch { setOuts([]); } };
  useEffect(() => { void loadOuts(); }, []);
  const pickFrom = (l: PalabraLang) => { if (l === to) setTo(from); setFrom(l); };
  const pickTo = (l: PalabraLang) => { if (l === from) setFrom(to); setTo(l); };

  const upsert = (id: string, patch: Partial<Line>) => setLines(ls => {
    const i = ls.findIndex(l => l.id === id);
    if (i < 0) return [...ls.slice(-30), { id, src: '', dst: '', ...patch }];
    const n = ls.slice(); n[i] = { ...n[i]!, ...patch }; return n;
  });

  async function start() {
    setMsg(''); setLines([]); setPhase('connecting');
    const paid = await meter.begin();
    if (paid !== 'ok') { setMsg(paid === 'insufficient' ? (locale === 'fr' ? 'Minutes de traduction insuffisantes pour démarrer.' : 'Not enough translation minutes to start.') : c.failed); setPhase('idle'); return; }
    let stream: MediaStream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } }); }
    catch { setMsg(c.denied); stop(); return; }
    r.current.stream = stream; void loadOuts();
    const res = await session().catch(() => ({ ok: false as const, error: 'provider_unreachable' }));
    if (!res.ok) { setMsg(res.error === 'missing_provider_key' ? c.missing : c.failed); stop(); return; }
    const outCtx = new AudioContext({ sampleRate: PALABRA_SAMPLE_RATE }); r.current.outCtx = outCtx;
    const sc = outCtx as AudioContext & { setSinkId?: (id: string) => Promise<void> };
    if (sink && sc.setSinkId) await sc.setSinkId(sink).catch(() => undefined);
    const ws = new WebSocket(`${res.wsUrl}?token=${encodeURIComponent(res.token)}`); r.current.ws = ws;
    ws.onopen = () => ws.send(JSON.stringify(buildSetTask(from, to, { voiceCloning: clone })));
    ws.onerror = () => { setMsg(c.failed); stop(); };
    ws.onclose = () => { if (r.current.ws === ws) stop(); };
    ws.onmessage = async (e) => {
      const ev = parsePalabraMessage(typeof e.data === 'string' ? e.data : '');
      if (!ev) return;
      if (ev.kind === 'started' && !r.current.inCtx) {
        const inCtx = new AudioContext({ sampleRate: PALABRA_SAMPLE_RATE }); r.current.inCtx = inCtx;
        await inCtx.audioWorklet.addModule(URL.createObjectURL(new Blob([WORKLET], { type: 'application/javascript' })));
        const node = new AudioWorkletNode(inCtx, 'pcm-out');
        node.port.onmessage = (m: MessageEvent<Float32Array>) => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ message_type: 'input_audio_data', data: { data: floatToPcmBase64(m.data) } })); };
        inCtx.createMediaStreamSource(stream).connect(node); setPhase('live');
      } else if (ev.kind === 'audio') {
        const f = pcmBase64ToFloat(ev.b64); if (!f.length) return;
        const b = outCtx.createBuffer(1, f.length, PALABRA_SAMPLE_RATE); b.copyToChannel(f, 0);
        const src = outCtx.createBufferSource(); src.buffer = b; src.connect(outCtx.destination);
        const at = Math.max(outCtx.currentTime + 0.05, r.current.t); src.start(at); r.current.t = at + b.duration;
      } else if (ev.kind === 'text') {
        upsert(ev.id || String(Date.now()), ev.stage === 'partial' || ev.stage === 'final' ? { src: ev.text } : { dst: ev.text });
      } else if (ev.kind === 'error') { setMsg(`${c.failed} (${ev.detail})`); }
      else if (ev.kind === 'end') stop();
    };
  }

  const busy = phase !== 'idle';
  const langSelect = (v: PalabraLang, on: (l: PalabraLang) => void, label: string) => <label className="field"><span>{label}</span>
    <select className={sel} value={v} disabled={busy} onChange={e => on(e.target.value as PalabraLang)}>{PALABRA_CODES.map(l => <option key={l} value={l}>{PALABRA_LANGUAGES[l]}</option>)}</select></label>;
  return <section className="panel grid gap-4" aria-labelledby="live-tr">
    <header><h2 id="live-tr">{c.title}</h2><p className="text-sm text-muted-foreground">{c.intro}</p></header>
    <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
      {langSelect(from, pickFrom, c.from)}
      <Button type="button" variant="outline" size="icon" disabled={busy} aria-label="swap" onClick={() => { setFrom(to); setTo(from); }}><ArrowLeftRight /></Button>
      {langSelect(to, pickTo, c.to)}
    </div>
    <label className="flex items-center gap-2 text-sm"><Checkbox checked={clone} disabled={busy} onCheckedChange={v => setClone(v === true)} />{c.clone}</label>
    <label className="field"><span>{c.out}</span>
      <select className={sel} value={sink} disabled={busy} onChange={e => setSink(e.target.value)} onFocus={() => void loadOuts()}>
        <option value="">{c.def}</option>{outs.map(o => <option key={o.deviceId} value={o.deviceId}>{o.label || o.deviceId.slice(0, 8)}</option>)}
      </select></label>
    <p className="text-sm text-muted-foreground">{c.cable}</p>
    <label className="flex items-start gap-2"><Checkbox checked={agree} disabled={busy} onCheckedChange={v => setAgree(v === true)} /><span className="text-sm">{c.consent}</span></label>
    <UsageBadge service="audio" meter={meter} fr={locale === 'fr'} />
    {ready === false && <p role="alert">{c.missing}</p>}
    <div className="flex flex-wrap items-center gap-3">
      {busy ? <Button type="button" onClick={stop}><Square />{c.stop}</Button>
        : <Button type="button" disabled={!agree || !ready} onClick={() => void start()}><Mic />{c.start}</Button>}
      {phase === 'connecting' && <span className="text-sm text-muted-foreground">{c.connecting}</span>}
      {phase === 'live' && <span className="text-sm font-semibold text-primary">{c.live}</span>}
    </div>
    {msg && <p role="alert">{msg}</p>}
    <ol className="grid gap-2" aria-live="polite">
      {lines.length === 0 && <li className="text-muted-foreground">{c.empty}</li>}
      {lines.filter(l => l.src || l.dst).map(l => <li key={l.id} className="rounded-lg border border-input p-3">
        <p className="text-xs text-muted-foreground">{c.heard} : {l.src}</p><p className="text-lg">{l.dst}</p>
      </li>)}
    </ol>
  </section>;
}
