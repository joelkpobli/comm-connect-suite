import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Maximize2, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { LocalMediaSession, type MediaSnapshot } from '@/lib/weechat/media-session';
import { DEFAULT_RESTYLE, RESTYLE_STYLES, restyleFilter, type RestyleStyle } from '@/lib/weechat/restyle';
import { useDemo } from './provider';
import { PageTitle } from './shared';
import { VcamControl } from './virtual-camera-control';

export function RestyleLivePage() {
  const { locale } = useDemo(); const fr = locale === 'fr';
  const session = useRef<LocalMediaSession | null>(null);
  const [snapshot, setSnapshot] = useState<MediaSnapshot | null>(null);
  const [style, setStyle] = useState<RestyleStyle>('natural');
  const [settings, setSettings] = useState(DEFAULT_RESTYLE);
  const [error, setError] = useState('');
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const filter = useRef('none'); filter.current = restyleFilter(style, settings.intensity, settings.contrast);
  useEffect(() => {
    const media = new LocalMediaSession(navigator.mediaDevices);
    session.current = media; setSnapshot(media.getSnapshot());
    const unsubscribe = media.subscribe(() => setSnapshot(media.getSnapshot()));
    const hide = () => { if (document.hidden) media.stopAll(); };
    const exit = () => media.stopAll();
    document.addEventListener('visibilitychange', hide); window.addEventListener('pagehide', exit);
    return () => { unsubscribe(); media.dispose(); session.current = null; document.removeEventListener('visibilitychange', hide); window.removeEventListener('pagehide', exit); };
  }, []);
  const stream = snapshot?.streams.camera;
  const active = snapshot?.status.camera === 'active';
  useEffect(() => {
    const v = video.current, c = canvas.current;
    if (!v || !c) return;
    const ctx = c.getContext('2d');
    v.srcObject = stream ?? null;
    if (!stream) { ctx?.clearRect(0, 0, c.width, c.height); return; }
    let disposed = false, frame = 0;
    const draw = () => {
      if (disposed || !ctx) return;
      if (v.readyState >= 2) {
        ctx.save(); ctx.filter = filter.current; ctx.translate(c.width, 0); ctx.scale(-1, 1);
        ctx.drawImage(v, 0, 0, c.width, c.height); ctx.restore();
      }
      frame = requestAnimationFrame(draw);
    };
    void v.play().then(() => {
      if (disposed) return;
      if (!ctx || !('filter' in ctx)) { setError(fr ? 'Les effets vidéo ne sont pas disponibles dans ce navigateur.' : 'Video effects are unavailable in this browser.'); session.current?.stop('camera'); return; }
      draw();
    }).catch(() => { if (!disposed) { setError(fr ? 'Lecture de la caméra impossible.' : 'Unable to play the camera.'); session.current?.stop('camera'); } });
    return () => { disposed = true; cancelAnimationFrame(frame); v.srcObject = null; ctx?.clearRect(0, 0, c.width, c.height); };
  }, [stream, fr]);
  const labels = { natural: fr ? 'Naturel' : 'Natural', mono: fr ? 'Noir et blanc' : 'Monochrome', vivid: fr ? 'Couleurs vives' : 'Vivid', graphic: fr ? 'Contraste graphique' : 'Graphic contrast' };
  const issue = snapshot?.issues.camera;
  const issueText = issue === 'denied' ? (fr ? 'Caméra refusée. Autorisez-la dans les réglages du navigateur.' : 'Camera denied. Allow it in browser settings.') : issue === 'missing' ? (fr ? 'Aucune caméra détectée.' : 'No camera detected.') : issue ? (fr ? 'Caméra indisponible. Vérifiez votre appareil et les applications qui l’utilisent.' : 'Camera unavailable. Check your device and apps using it.') : '';
  return <>
    <PageTitle title="Restyle Live" subtitle={fr ? 'Effets vidéo locaux · Version expérimentale' : 'Local video effects · Experimental version'} />
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-y border-border py-4 text-sm">
      <span className="flex items-center gap-2 text-primary"><Sparkles size={18} />{fr ? 'Aperçu local gratuit · Aucun point débité' : 'Free local preview · No points charged'}</span>
      <span className="text-muted-foreground">{fr ? 'Restylisation IA non connectée' : 'AI restyling not connected'}</span>
    </div>
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <section className="grid min-w-0 gap-4">
        <div className="relative aspect-video overflow-hidden rounded-md border border-border bg-muted">
          <video ref={video} muted playsInline className="hidden" />
          <canvas ref={canvas} width={1280} height={720} aria-label={fr ? 'Aperçu Restyle Live' : 'Restyle Live preview'} className="h-full w-full object-contain" />
          {!stream && <div className="pointer-events-none absolute inset-0 grid place-content-center justify-items-center gap-3 text-muted-foreground"><Camera size={36} /><span>{fr ? 'Caméra désactivée' : 'Camera off'}</span></div>}
        </div>
        <label className="flex items-start gap-2 text-sm"><Checkbox checked={snapshot?.consent.camera ?? false} onCheckedChange={value => session.current?.consent('camera', value === true)} />{fr ? 'J’autorise l’utilisation locale de ma caméra. Aucune image n’est envoyée ni enregistrée.' : 'I consent to local camera use. No image is sent or recorded.'}</label>
        <div className="flex flex-wrap gap-2">
          {stream || snapshot?.status.camera === 'requesting' ? <Button variant="outline" onClick={() => session.current?.stop('camera')}><CameraOff />{fr ? 'Couper la caméra' : 'Turn camera off'}</Button> : <Button disabled={!snapshot?.consent.camera} onClick={() => { setError(''); void session.current?.start('camera'); }}><Camera />{fr ? 'Activer la caméra' : 'Turn camera on'}</Button>}
          <Button variant="outline" disabled={!active} onClick={() => { void canvas.current?.requestFullscreen().catch(() => setError(fr ? 'Plein écran indisponible.' : 'Full screen unavailable.')); }}><Maximize2 />{fr ? 'Mode plein écran' : 'Full screen mode'}</Button>
        </div>
        {(error || issueText) && <p role="alert" className="text-sm text-destructive">{error || issueText}</p>}
        <p role="status" className="text-sm text-muted-foreground">{snapshot?.status.camera === 'requesting' ? (fr ? 'Autorisation de la caméra en attente…' : 'Waiting for camera permission…') : active ? (fr ? 'Caméra active · Effet local' : 'Camera active · Local effect') : snapshot?.status.camera === 'interrupted' ? (fr ? 'Caméra temporairement interrompue.' : 'Camera temporarily interrupted.') : ''}</p>
        <VcamControl canvas={canvas} active={active} fr={fr} />
      </section>
      <section className="grid gap-6 border-t border-border pt-4 xl:border-t-0 xl:pt-0">
        <div className="grid gap-3"><h2 className="font-semibold">{fr ? 'Style vidéo' : 'Video style'}</h2><div className="grid grid-cols-2 gap-2">{RESTYLE_STYLES.map(value => <Button key={value} variant={style === value ? 'secondary' : 'outline'} aria-pressed={style === value} onClick={() => setStyle(value)} className="h-auto min-h-11 whitespace-normal text-xs">{labels[value]}</Button>)}</div></div>
        <div className="grid gap-3"><label htmlFor="restyle-intensity" className="flex justify-between text-sm">{fr ? 'Intensité du style' : 'Style intensity'}<span>{settings.intensity} %</span></label><Slider id="restyle-intensity" aria-label={fr ? 'Intensité du style' : 'Style intensity'} min={0} max={100} step={1} disabled={style === 'natural'} value={[settings.intensity]} onValueChange={v => setSettings(s => ({ ...s, intensity: v[0] ?? 65 }))} /></div>
        <div className="grid gap-3"><label htmlFor="restyle-contrast" className="flex justify-between text-sm">{fr ? 'Contraste' : 'Contrast'}<span>{settings.contrast} %</span></label><Slider id="restyle-contrast" aria-label={fr ? 'Contraste' : 'Contrast'} min={60} max={160} step={1} value={[settings.contrast]} onValueChange={v => setSettings(s => ({ ...s, contrast: v[0] ?? 100 }))} /></div>
        <Button variant="ghost" className="justify-self-start" onClick={() => { setStyle('natural'); setSettings(DEFAULT_RESTYLE); }}><RotateCcw />{fr ? 'Réinitialiser' : 'Reset'}</Button>
      </section>
    </div>
  </>;
}