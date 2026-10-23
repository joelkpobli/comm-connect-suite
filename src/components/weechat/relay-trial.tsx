import { useEffect, useRef, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useDemo } from './provider';
import { providerStatus, realRelay } from '@/lib/weechat/communication.functions';

const copy = {
  fr: { title: 'Essai réel : enregistrer et traduire', note: 'Appel réel à Deepgram et DeepL. Rien n’est conservé. Pas encore utilisable dans un appel.', consent: 'J’accepte d’envoyer cet enregistrement aux services de traduction pour cet essai.', record: 'Enregistrer (8 s max)', stop: 'Arrêter et traduire', working: 'Traduction en cours…', heard: 'Compris', translated: 'Traduit', missing: 'Service non configuré : clé manquante.', ready: 'Services configurés.', failed: 'Échec', denied: 'Micro refusé ou indisponible.', dir: 'Sens' },
  en: { title: 'Real trial: record and translate', note: 'Real call to Deepgram and DeepL. Nothing is kept. Not usable in a call yet.', consent: 'I agree to send this recording to the translation services for this trial.', record: 'Record (8 s max)', stop: 'Stop and translate', working: 'Translating…', heard: 'Heard', translated: 'Translated', missing: 'Service not configured: missing key.', ready: 'Services configured.', failed: 'Failed', denied: 'Microphone denied or unavailable.', dir: 'Direction' },
};
const dirs = [['fr', 'en'], ['en', 'fr'], ['fr', 'es'], ['fr', 'de']] as const;

export function RelayTrial() {
  const { locale } = useDemo(); const c = copy[locale];
  const status = useServerFn(providerStatus); const relay = useServerFn(realRelay);
  const [keys, setKeys] = useState<boolean | null>(null);
  const [agree, setAgree] = useState(false); const [dir, setDir] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'rec' | 'busy'>('idle');
  const [msg, setMsg] = useState(''); const [out, setOut] = useState<{ t: string; tr: string; ms: number } | null>(null);
  const rec = useRef<MediaRecorder | null>(null); const stream = useRef<MediaStream | null>(null); const timer = useRef(0);
  const stopTracks = () => { stream.current?.getTracks().forEach(t => t.stop()); stream.current = null; };
  useEffect(() => { status().then(s => setKeys(s.recognition && s.translation)).catch(() => setKeys(false)); return () => { clearTimeout(timer.current); if (rec.current?.state === 'recording') rec.current.onstop = null; stopTracks(); }; }, [status]);

  async function start() {
    setMsg(''); setOut(null);
    try { stream.current = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { setMsg(c.denied); return; }
    const r = new MediaRecorder(stream.current); const chunks: Blob[] = [];
    r.ondataavailable = e => chunks.push(e.data);
    r.onstop = async () => {
      stopTracks(); setPhase('busy');
      const blob = new Blob(chunks, { type: r.mimeType || 'audio/webm' });
      const buf = new Uint8Array(await blob.arrayBuffer()); let s = ''; for (const b of buf) s += String.fromCharCode(b);
      const [source, target] = dirs[dir]!;
      try {
        const res = await relay({ data: { audioBase64: btoa(s), mime: blob.type.split(';')[0]!, source, target } });
        if (!res.ok) setMsg(res.error === 'missing_provider_key' ? c.missing : `${c.failed} : ${res.provider} (${res.error})`);
        else { setOut({ t: res.value.transcript, tr: res.value.translation, ms: res.ms }); void new Audio(`data:audio/mpeg;base64,${res.value.speechBase64}`).play(); }
      } catch { setMsg(c.failed); }
      setPhase('idle');
    };
    rec.current = r; r.start(); setPhase('rec');
    timer.current = window.setTimeout(() => { if (r.state === 'recording') r.stop(); }, 8000);
  }

  return <section className="mt-6 grid gap-3" aria-labelledby="relay-title">
    <h2 id="relay-title">{c.title}</h2><p>{c.note}</p>
    <p role="status">{keys === null ? '…' : keys ? c.ready : c.missing}</p>
    <label className="field"><span>{c.dir}</span><select className="w-full rounded-md border border-input bg-background p-3 text-foreground" value={dir} onChange={e => setDir(Number(e.target.value))}>{dirs.map(([s, t], i) => <option key={i} value={i}>{s.toUpperCase()} → {t.toUpperCase()}</option>)}</select></label>
    <label className="flex items-start gap-2"><Checkbox checked={agree} onCheckedChange={v => setAgree(v === true)} /><span>{c.consent}</span></label>
    {phase === 'rec'
      ? <Button type="button" onClick={() => rec.current?.stop()}><Square />{c.stop}</Button>
      : <Button type="button" disabled={!agree || !keys || phase === 'busy'} onClick={start}><Mic />{phase === 'busy' ? c.working : c.record}</Button>}
    {msg && <p role="alert">{msg}</p>}
    {out && <dl><dt>{c.heard}</dt><dd>{out.t}</dd><dt>{c.translated}</dt><dd>{out.tr}</dd><dd>{out.ms} ms</dd></dl>}
  </section>;
}
