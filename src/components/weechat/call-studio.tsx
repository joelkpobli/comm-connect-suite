import { useEffect, useRef, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Mic, Square, Volume2, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useDemo } from './provider';
import { providerStatus, realRelay } from '@/lib/weechat/communication.functions';
import { PersonaStudio } from './persona-studio';

type L = 'fr' | 'en' | 'es' | 'de';
const voices: Record<L, { id: string; name: string; g: 'f' | 'm' }[]> = {
  en: [{ id: 'aura-2-thalia-en', name: 'Thalia', g: 'f' }, { id: 'aura-2-helena-en', name: 'Helena', g: 'f' }, { id: 'aura-2-apollo-en', name: 'Apollo', g: 'm' }, { id: 'aura-2-arcas-en', name: 'Arcas', g: 'm' }],
  fr: [{ id: 'aura-2-agathe-fr', name: 'Agathe', g: 'f' }, { id: 'aura-2-hector-fr', name: 'Hector', g: 'm' }],
  es: [{ id: 'aura-2-celeste-es', name: 'Celeste', g: 'f' }],
  de: [{ id: 'aura-2-viktoria-de', name: 'Viktoria', g: 'f' }, { id: 'aura-2-julius-de', name: 'Julius', g: 'm' }],
};
const copy = {
  fr: { title: 'Studio d’appel', intro: 'Vous parlez votre langue. Votre voix choisie parle celle de l’autre. Sa réponse s’affiche ici en français.', mine: 'Ma langue', theirs: 'Langue de l’interlocuteur', voice: 'Voix qui me représente', f: 'Féminine', m: 'Masculine', face: 'Visage qui me représente', faceNote: 'Visage animé pas encore disponible : image fixe uniquement.', consent: 'J’accepte d’envoyer mes enregistrements aux services de traduction. Rien n’est conservé.', me: 'Je parle', them: 'L’interlocuteur parle', stop: 'Terminer la phrase', busy: 'Traduction…', convo: 'Conversation', empty: 'Aucun échange pour l’instant.', you: 'Vous', other: 'Interlocuteur', heard: 'Entendu par l’autre', listen: 'Écouter', missing: 'Service non configuré.', denied: 'Micro refusé ou indisponible.', failed: 'Échec de la traduction.', limit: 'Essai sur cet appareil, phrase par phrase (environ 2,5 s). Pas encore relié à WhatsApp, Instagram ou TikTok.' },
  en: { title: 'Call studio', intro: 'You speak your language. Your chosen voice speaks theirs. Their reply appears here in your language.', mine: 'My language', theirs: 'Their language', voice: 'Voice representing me', f: 'Female', m: 'Male', face: 'Face representing me', faceNote: 'Animated face not available yet: still image only.', consent: 'I agree to send my recordings to translation services. Nothing is kept.', me: 'I speak', them: 'They speak', stop: 'End sentence', busy: 'Translating…', convo: 'Conversation', empty: 'No exchange yet.', you: 'You', other: 'Them', heard: 'Heard by them', listen: 'Listen', missing: 'Service not configured.', denied: 'Microphone denied or unavailable.', failed: 'Translation failed.', limit: 'Trial on this device, sentence by sentence (about 2.5 s). Not yet connected to WhatsApp, Instagram or TikTok.' },
};
type Turn = { who: 'me' | 'them'; original: string; translated: string; audio: string; ms: number };
const sel = 'w-full rounded-md border border-input bg-background p-3 text-foreground';

export function CallStudio() {
  const { locale } = useDemo(); const c = copy[locale];
  const status = useServerFn(providerStatus); const relay = useServerFn(realRelay);
  const [ready, setReady] = useState<boolean | null>(null);
  const [mine, setMine] = useState<L>('fr'); const [theirs, setTheirs] = useState<L>('en');
  const [voice, setVoice] = useState(voices.en[0]!.id);
  const [agree, setAgree] = useState(false); const [phase, setPhase] = useState<'idle' | 'me' | 'them' | 'busy'>('idle');
  const [turns, setTurns] = useState<Turn[]>([]); const [msg, setMsg] = useState('');
  const rec = useRef<MediaRecorder | null>(null); const stream = useRef<MediaStream | null>(null); const timer = useRef(0);
  const stopTracks = () => { stream.current?.getTracks().forEach(t => t.stop()); stream.current = null; };
  useEffect(() => { status().then(s => setReady(s.recognition && s.translation)).catch(() => setReady(false)); return () => { clearTimeout(timer.current); if (rec.current) rec.current.onstop = null; stopTracks(); }; }, [status]);
  const pickTheirs = (l: L) => { setTheirs(l); setVoice(voices[l][0]!.id); };
  const langs = (Object.keys(voices) as L[]);

  async function start(who: 'me' | 'them') {
    setMsg('');
    try { stream.current = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { setMsg(c.denied); return; }
    const r = new MediaRecorder(stream.current); const chunks: Blob[] = [];
    r.ondataavailable = e => chunks.push(e.data);
    r.onstop = async () => {
      clearTimeout(timer.current); stopTracks(); setPhase('busy');
      const blob = new Blob(chunks, { type: r.mimeType || 'audio/webm' });
      const buf = new Uint8Array(await blob.arrayBuffer()); let s = ''; for (const b of buf) s += String.fromCharCode(b);
      const source = who === 'me' ? mine : theirs; const target = who === 'me' ? theirs : mine;
      const v = who === 'me' ? voice : voices[mine][0]!.id;
      try {
        const res = await relay({ data: { audioBase64: btoa(s), mime: blob.type.split(';')[0]!, source, target, voice: v } });
        if (!res.ok) setMsg(res.error === 'missing_provider_key' ? c.missing : c.failed);
        else {
          const audio = `data:audio/wav;base64,${res.value.speechBase64}`;
          setTurns(t => [...t, { who, original: res.value.transcript, translated: res.value.translation, audio, ms: res.ms }]);
          if (who === 'me') void new Audio(audio).play();
        }
      } catch { setMsg(c.failed); }
      setPhase('idle');
    };
    rec.current = r; r.start(); setPhase(who);
    timer.current = window.setTimeout(() => { if (r.state === 'recording') r.stop(); }, 8000);
  }

  const can = agree && ready && phase === 'idle' && mine !== theirs;
  return <div className="grid gap-6">
    <header><h1>{c.title}</h1><p>{c.intro}</p><p className="text-sm text-muted-foreground">{c.limit}</p></header>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <section className="panel grid gap-4">
        <label className="field"><span>{c.mine}</span><select className={sel} value={mine} onChange={e => setMine(e.target.value as L)}>{langs.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}</select></label>
        <label className="field"><span>{c.theirs}</span><select className={sel} value={theirs} onChange={e => pickTheirs(e.target.value as L)}>{langs.filter(l => l !== mine).map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}</select></label>
        <fieldset className="grid gap-2"><legend className="mb-2 font-semibold">{c.voice}</legend>
          {voices[theirs].map(v => <label key={v.id} className={`flex items-center gap-2 rounded-md border p-2 ${voice === v.id ? 'border-primary' : 'border-input'}`}><input type="radio" name="voice" checked={voice === v.id} onChange={() => setVoice(v.id)} />{v.name} · {c[v.g]}</label>)}
        </fieldset>
        <label className="flex items-start gap-2"><Checkbox checked={agree} onCheckedChange={v => setAgree(v === true)} /><span className="text-sm">{c.consent}</span></label>
        {ready === false && <p role="alert">{c.missing}</p>}
      </section>
      <section className="panel grid content-start gap-4" aria-labelledby="convo">
        <h2 id="convo">{c.convo}</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {phase === 'me' ? <Button type="button" onClick={() => rec.current?.stop()}><Square />{c.stop}</Button> : <Button type="button" disabled={!can} onClick={() => start('me')}><Mic />{phase === 'busy' ? c.busy : `${c.me} (${mine.toUpperCase()})`}</Button>}
          {phase === 'them' ? <Button type="button" variant="outline" onClick={() => rec.current?.stop()}><Square />{c.stop}</Button> : <Button type="button" variant="outline" disabled={!can} onClick={() => start('them')}><UserRound />{`${c.them} (${theirs.toUpperCase()})`}</Button>}
        </div>
        {msg && <p role="alert">{msg}</p>}
        <ol className="grid gap-3" aria-live="polite">
          {turns.length === 0 && <li className="text-muted-foreground">{c.empty}</li>}
          {turns.map((t, i) => <li key={i} className={`rounded-lg border border-input p-3 ${t.who === 'me' ? 'ml-8 bg-secondary' : 'mr-8'}`}>
            <strong>{t.who === 'me' ? c.you : c.other}</strong>
            {t.who === 'me' ? <><p>{t.original}</p><p className="text-sm text-muted-foreground">{c.heard} : {t.translated}</p></> : <><p className="text-lg">{t.translated}</p><p className="text-sm text-muted-foreground">{t.original}</p></>}
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground"><Button type="button" size="sm" variant="ghost" onClick={() => void new Audio(t.audio).play()}><Volume2 />{c.listen}</Button>{t.ms} ms</div>
          </li>)}
        </ol>
      </section>
    </div>
    <PersonaStudio />
  </div>;
}
