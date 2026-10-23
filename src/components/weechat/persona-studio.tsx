import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useDemo } from './provider';
import { backgrounds, checkImage, checkVoiceSample, personas, VOICE_MAX_S, type Gender } from '@/lib/weechat/persona-catalog';

const copy = {
  fr: {
    face: '1. Visage qui me représente', all: 'Tous', f: 'Femmes', m: 'Hommes', age: 'ans env.', catalog: 'Images générées par IA pour Weechat, utilisables librement dans vos appels et lives.',
    myPhoto: 'Importer ma photo', rights: 'Je certifie détenir les droits sur cette image et l’accord de la personne représentée.',
    bg: '2. Arrière-plan', myBg: 'Importer mon arrière-plan', bgRights: 'Je certifie avoir le droit d’utiliser cette image.', blur: 'Flou d’arrière-plan', none: 'Aucun',
    bgNames: { salon: 'Salon', piscine: 'Piscine', bain: 'Salle de bain', bureau: 'Bureau', cafe: 'Café', jardin: 'Jardin' } as Record<string, string>,
    preview: '3. Aperçu de ce que l’autre verra', label: 'Image générée par IA · Weechat', still: 'Image fixe : le visage ne suit pas encore vos mouvements.',
    voice: '4. Ma voix de référence', voiceIntro: 'Enregistrez ou importez 10 à 30 secondes de voix. Elle servira à reproduire votre timbre quand le service sera branché.',
    voiceRights: 'C’est ma voix, ou j’ai l’accord écrit de la personne.', rec: 'Enregistrer', stop: 'Arrêter', upload: 'Importer un fichier audio', remove: 'Supprimer',
    voiceNote: 'Reproduction de voix pas encore disponible : l’appel utilise encore les voix du catalogue. L’extrait reste sur cet appareil.',
    errType: 'Format non accepté (JPG, PNG ou WebP).', errSize: 'Fichier trop lourd (8 Mo max).', errShort: 'Trop court : 10 secondes minimum.', errLong: 'Trop long : 30 secondes maximum.', errAudio: 'Fichier audio non valide.', denied: 'Micro refusé ou indisponible.', ok: 'Extrait prêt', s: 's',
  },
  en: {
    face: '1. Face representing me', all: 'All', f: 'Women', m: 'Men', age: 'approx.', catalog: 'AI-generated images made for Weechat, free to use in your calls and lives.',
    myPhoto: 'Upload my photo', rights: 'I confirm I hold the rights to this image and the consent of the person shown.',
    bg: '2. Background', myBg: 'Upload my background', bgRights: 'I confirm I may use this image.', blur: 'Background blur', none: 'None',
    bgNames: { salon: 'Living room', piscine: 'Pool', bain: 'Bathroom', bureau: 'Office', cafe: 'Café', jardin: 'Garden' } as Record<string, string>,
    preview: '3. Preview of what they will see', label: 'AI-generated image · Weechat', still: 'Still image: the face does not follow your movements yet.',
    voice: '4. My reference voice', voiceIntro: 'Record or upload 10 to 30 seconds of voice. It will be used to reproduce your tone once the service is connected.',
    voiceRights: 'This is my voice, or I have written consent from the speaker.', rec: 'Record', stop: 'Stop', upload: 'Upload an audio file', remove: 'Delete',
    voiceNote: 'Voice reproduction not available yet: calls still use catalogue voices. The sample stays on this device.',
    errType: 'Format not accepted (JPG, PNG or WebP).', errSize: 'File too large (8 MB max).', errShort: 'Too short: 10 seconds minimum.', errLong: 'Too long: 30 seconds maximum.', errAudio: 'Invalid audio file.', denied: 'Microphone denied or unavailable.', ok: 'Sample ready', s: 's',
  },
};

function loadImg(src: string) { return new Promise<HTMLImageElement>((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = src; }); }
function cover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const s = Math.max(w / img.width, h / img.height); const iw = img.width * s; const ih = img.height * s;
  ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
}
function audioSeconds(url: string) { return new Promise<number>(ok => { const a = new Audio(); a.preload = 'metadata'; a.onloadedmetadata = () => { if (a.duration === Infinity) { a.currentTime = 1e9; a.ontimeupdate = () => { a.ontimeupdate = null; ok(a.duration); }; } else ok(a.duration); }; a.onerror = () => ok(NaN); a.src = url; }); }

export function PersonaStudio() {
  const { locale } = useDemo(); const c = copy[locale];
  const [filter, setFilter] = useState<'all' | Gender>('all');
  const [face, setFace] = useState<string>(personas[0]!.src); const [myFace, setMyFace] = useState(''); const [faceRights, setFaceRights] = useState(false);
  const [bg, setBg] = useState<string>(backgrounds[0]!.src); const [myBg, setMyBg] = useState(''); const [bgRights, setBgRights] = useState(false);
  const [blur, setBlur] = useState(4); const [err, setErr] = useState('');
  const canvas = useRef<HTMLCanvasElement>(null);
  const [voiceUrl, setVoiceUrl] = useState(''); const [voiceS, setVoiceS] = useState(0); const [voiceRights, setVoiceRights] = useState(false); const [vErr, setVErr] = useState(''); const [recording, setRecording] = useState(false);
  const rec = useRef<MediaRecorder | null>(null); const stream = useRef<MediaStream | null>(null); const timer = useRef(0);
  const urls = useRef<string[]>([]);
  const track = (u: string) => { urls.current.push(u); return u; };
  const stopTracks = () => { stream.current?.getTracks().forEach(t => t.stop()); stream.current = null; };
  useEffect(() => () => { clearTimeout(timer.current); if (rec.current) rec.current.onstop = null; stopTracks(); urls.current.forEach(u => URL.revokeObjectURL(u)); }, []);

  useEffect(() => {
    let live = true; const cv = canvas.current; const ctx = cv?.getContext('2d'); if (!cv || !ctx) return;
    Promise.all([bg ? loadImg(bg) : null, loadImg(face)]).then(([b, f]) => {
      if (!live) return; const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H);
      if (b) { ctx.save(); ctx.filter = blur ? `blur(${blur}px)` : 'none'; cover(ctx, b, -blur * 2, -blur * 2, W + blur * 4, H + blur * 4); ctx.restore(); } else { ctx.fillStyle = getComputedStyle(cv).getPropertyValue('--surface-deep') || '#070B12'; ctx.fillRect(0, 0, W, H); }
      const r = H * 0.38; const cx = W / 2; const cy = H * 0.52;
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.closePath(); ctx.clip(); cover(ctx, f, cx - r, cy - r, r * 2, r * 2); ctx.restore();
      ctx.font = '600 14px system-ui, sans-serif'; const t = c.label; const tw = ctx.measureText(t).width;
      ctx.fillStyle = 'rgba(7,11,18,0.7)'; ctx.fillRect(12, H - 36, tw + 20, 24); ctx.fillStyle = '#ffffff'; ctx.textBaseline = 'middle'; ctx.fillText(t, 22, H - 24);
    }).catch(() => {});
    return () => { live = false; };
  }, [face, bg, blur, c.label]);

  function pickImage(file: File | undefined, kind: 'face' | 'bg') {
    setErr(''); if (!file) return;
    const v = checkImage(file); if (v !== 'ok') { setErr(v === 'type' ? c.errType : c.errSize); return; }
    const u = track(URL.createObjectURL(file));
    if (kind === 'face') { setMyFace(u); setFace(u); } else { setMyBg(u); setBg(u); }
  }
  async function acceptVoice(blob: Blob) {
    const u = track(URL.createObjectURL(blob)); const s = await audioSeconds(u);
    const v = checkVoiceSample(s, blob.size, blob.type || 'audio/webm');
    if (v !== 'ok') { setVErr(v === 'short' ? c.errShort : v === 'long' ? c.errLong : c.errAudio); return; }
    setVErr(''); setVoiceUrl(u); setVoiceS(Math.round(s));
  }
  async function startRec() {
    setVErr(''); try { stream.current = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { setVErr(c.denied); return; }
    const r = new MediaRecorder(stream.current); const chunks: Blob[] = [];
    r.ondataavailable = e => chunks.push(e.data);
    r.onstop = () => { clearTimeout(timer.current); stopTracks(); setRecording(false); void acceptVoice(new Blob(chunks, { type: r.mimeType || 'audio/webm' })); };
    rec.current = r; r.start(); setRecording(true);
    timer.current = window.setTimeout(() => { if (r.state === 'recording') r.stop(); }, VOICE_MAX_S * 1000);
  }

  const tile = (on: boolean) => `overflow-hidden rounded-lg border-2 ${on ? 'border-primary' : 'border-transparent'}`;
  const list = personas.filter(p => filter === 'all' || p.g === filter);
  return <div className="grid gap-6 lg:grid-cols-2">
    <section className="panel grid content-start gap-3" aria-labelledby="face-h">
      <h2 id="face-h">{c.face}</h2>
      <div className="flex gap-2">{(['all', 'f', 'm'] as const).map(k => <Button key={k} type="button" size="sm" variant={filter === k ? 'default' : 'outline'} onClick={() => setFilter(k)}>{c[k]}</Button>)}</div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {list.map(p => <button key={p.id} type="button" aria-pressed={face === p.src} aria-label={`${c[p.g]} ${p.age} ${c.age}`} onClick={() => setFace(p.src)} className={tile(face === p.src)}><img src={p.src} alt="" loading="lazy" width={816} height={816} className="aspect-square w-full object-cover" /></button>)}
        {myFace && <button type="button" aria-pressed={face === myFace} aria-label={c.myPhoto} onClick={() => setFace(myFace)} className={tile(face === myFace)}><img src={myFace} alt="" className="aspect-square w-full object-cover" /></button>}
      </div>
      <p className="text-sm text-muted-foreground">{c.catalog}</p>
      <label className="flex items-start gap-2"><Checkbox checked={faceRights} onCheckedChange={v => setFaceRights(v === true)} /><span className="text-sm">{c.rights}</span></label>
      <label className={`inline-flex w-fit items-center gap-2 rounded-md border border-input px-3 py-2 text-sm ${faceRights ? 'cursor-pointer' : 'pointer-events-none opacity-50'}`}><Upload size={16} />{c.myPhoto}<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={!faceRights} onChange={e => { pickImage(e.target.files?.[0], 'face'); e.target.value = ''; }} /></label>

      <h2 className="mt-4">{c.bg}</h2>
      <div className="grid grid-cols-3 gap-2">
        <button type="button" aria-pressed={bg === ''} onClick={() => setBg('')} className={`${tile(bg === '')} grid aspect-video place-items-center bg-secondary text-sm`}>{c.none}</button>
        {backgrounds.map(b => <button key={b.id} type="button" aria-pressed={bg === b.src} aria-label={c.bgNames[b.id]} onClick={() => setBg(b.src)} className={`${tile(bg === b.src)} relative`}><img src={b.src} alt="" loading="lazy" width={1280} height={720} className="aspect-video w-full object-cover" /><span className="absolute bottom-0 left-0 right-0 bg-background/80 px-1 text-xs">{c.bgNames[b.id]}</span></button>)}
        {myBg && <button type="button" aria-pressed={bg === myBg} aria-label={c.myBg} onClick={() => setBg(myBg)} className={tile(bg === myBg)}><img src={myBg} alt="" className="aspect-video w-full object-cover" /></button>}
      </div>
      <label className="flex items-start gap-2"><Checkbox checked={bgRights} onCheckedChange={v => setBgRights(v === true)} /><span className="text-sm">{c.bgRights}</span></label>
      <label className={`inline-flex w-fit items-center gap-2 rounded-md border border-input px-3 py-2 text-sm ${bgRights ? 'cursor-pointer' : 'pointer-events-none opacity-50'}`}><Upload size={16} />{c.myBg}<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={!bgRights} onChange={e => { pickImage(e.target.files?.[0], 'bg'); e.target.value = ''; }} /></label>
      <label className="field"><span>{c.blur} : {blur}px</span><input type="range" min={0} max={12} value={blur} onChange={e => setBlur(Number(e.target.value))} /></label>
      {err && <p role="alert" className="text-destructive">{err}</p>}
    </section>

    <div className="grid content-start gap-6">
      <section className="panel grid gap-3" aria-labelledby="prev-h">
        <h2 id="prev-h">{c.preview}</h2>
        <canvas ref={canvas} width={640} height={360} className="w-full rounded-lg" aria-label={c.preview} />
        <p className="text-sm text-muted-foreground">{c.still}</p>
      </section>
      <section className="panel grid gap-3" aria-labelledby="voice-h">
        <h2 id="voice-h">{c.voice}</h2>
        <p className="text-sm">{c.voiceIntro}</p>
        <label className="flex items-start gap-2"><Checkbox checked={voiceRights} onCheckedChange={v => setVoiceRights(v === true)} /><span className="text-sm">{c.voiceRights}</span></label>
        <div className="flex flex-wrap gap-2">
          {recording ? <Button type="button" onClick={() => rec.current?.stop()}><Square />{c.stop}</Button> : <Button type="button" disabled={!voiceRights} onClick={startRec}><Mic />{c.rec}</Button>}
          <label className={`inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm ${voiceRights && !recording ? 'cursor-pointer' : 'pointer-events-none opacity-50'}`}><Upload size={16} />{c.upload}<input type="file" accept="audio/*" className="sr-only" disabled={!voiceRights || recording} onChange={e => { const f = e.target.files?.[0]; if (f) void acceptVoice(f); e.target.value = ''; }} /></label>
        </div>
        {vErr && <p role="alert" className="text-destructive">{vErr}</p>}
        {voiceUrl && <div className="grid gap-2"><p role="status">{c.ok} · {voiceS} {c.s}</p><audio controls src={voiceUrl} className="w-full" /><Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => { URL.revokeObjectURL(voiceUrl); setVoiceUrl(''); }}><Trash2 />{c.remove}</Button></div>}
        <p className="text-sm text-muted-foreground">{c.voiceNote}</p>
      </section>
    </div>
  </div>;
}
