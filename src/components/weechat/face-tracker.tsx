import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Maximize2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useDemo } from './provider';
import { faces, checkImage } from '@/lib/weechat/persona-catalog';
import { faceState, smooth, faceGeometry, blinkThreshold, DEFAULT_SENS, SENS_MIN, SENS_MAX, type FaceState, type FaceGeometry } from '@/lib/weechat/face-metrics';

const WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm';
const MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

type Status = 'off' | 'loading' | 'on' | 'denied' | 'error';

export function FaceTracker() {
  const { locale } = useDemo(); const fr = locale === 'fr';
  const [agree, setAgree] = useState(false);
  const [status, setStatus] = useState<Status>('off');
  const [target, setTarget] = useState<string>(faces[0]!.src);
  const [own, setOwn] = useState(''); const [ownRights, setOwnRights] = useState(false);
  const [err, setErr] = useState('');
  const [mesh, setMesh] = useState(false);
  const [st, setSt] = useState<FaceState | null>(null);
  const video = useRef<HTMLVideoElement>(null); const cv = useRef<HTMLCanvasElement>(null);
  const stream = useRef<MediaStream | null>(null); const raf = useRef(0); const lm = useRef<{ close(): void } | null>(null);
  const img = useRef<HTMLImageElement | null>(null); const meshRef = useRef(mesh); meshRef.current = mesh;
  const geo = useRef<{ src: string; g: FaceGeometry | null; skin: string }>({ src: '', g: null, skin: '' });
  const [sens, setSens] = useState(DEFAULT_SENS); const sensRef = useRef(sens); sensRef.current = sens;

  useEffect(() => { const i = new Image(); i.src = target; img.current = i; }, [target]);
  useEffect(() => () => { if (own) URL.revokeObjectURL(own); }, [own]);

  const stop = () => {
    cancelAnimationFrame(raf.current); stream.current?.getTracks().forEach(t => t.stop()); stream.current = null;
    lm.current?.close(); lm.current = null; setSt(null); setStatus('off');
  };
  useEffect(() => {
    const vis = () => { if (document.hidden) stop(); };
    document.addEventListener('visibilitychange', vis);
    return () => { document.removeEventListener('visibilitychange', vis); stop(); };
  }, []);

  const start = async () => {
    setStatus('loading');
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, facingMode: 'user' }, audio: false });
      stream.current = s; const v = video.current!; v.srcObject = s; await v.play();
      const { FilesetResolver, FaceLandmarker, DrawingUtils } = await import('@mediapipe/tasks-vision');
      const files = await FilesetResolver.forVisionTasks(WASM);
      const fl = await FaceLandmarker.createFromOptions(files, { baseOptions: { modelAssetPath: MODEL, delegate: 'GPU' }, runningMode: 'VIDEO', numFaces: 1, outputFaceBlendshapes: true });
      const imgLm = await FaceLandmarker.createFromOptions(files, { baseOptions: { modelAssetPath: MODEL, delegate: 'CPU' }, runningMode: 'IMAGE', numFaces: 1 });
      if (!stream.current) { fl.close(); imgLm.close(); return; }
      lm.current = { close: () => { fl.close(); imgLm.close(); } }; geo.current = { src: '', g: null, skin: '' }; setStatus('on');
      const c = cv.current!; const ctx = c.getContext('2d')!; const draw = new DrawingUtils(ctx);
      let prev: FaceState | null = null; let last = -1; let tick = 0;
      const loop = () => {
        if (!stream.current) return;
        if (v.currentTime !== last) {
          last = v.currentTime;
          const r = fl.detectForVideo(v, performance.now());
          c.width = v.videoWidth; c.height = v.videoHeight;
          ctx.save(); ctx.translate(c.width, 0); ctx.scale(-1, 1); ctx.drawImage(v, 0, 0);
          const pts = r.faceLandmarks[0];
          const s0 = pts ? faceState(pts, r.faceBlendshapes[0]?.categories ?? []) : null;
          prev = s0 ? smooth(prev, s0, 0.45) : null;
          if (pts && meshRef.current) draw.drawConnectors(pts, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: 'rgba(25,181,254,0.35)', lineWidth: 0.6 });
          ctx.restore();
          const im = img.current;
          if (im?.complete && im.naturalWidth && geo.current.src !== im.src) {
            geo.current = { src: im.src, g: null, skin: '' };
            try {
              const g = faceGeometry(imgLm.detect(im).faceLandmarks[0] ?? []);
              const t = document.createElement('canvas'); t.width = im.naturalWidth; t.height = im.naturalHeight;
              const tc = t.getContext('2d')!; tc.drawImage(im, 0, 0);
              const p = g ? tc.getImageData(g.cheek.x * t.width, g.cheek.y * t.height, 1, 1).data : null;
              geo.current = { src: im.src, g, skin: p ? `rgb(${p[0]},${p[1]},${p[2]})` : '' };
            } catch { /* portrait sans visage lisible : rendu simple */ }
          }
          if (prev && im?.complete && im.naturalWidth) {
            const S = sensRef.current, cl = (v: number) => Math.max(-1, Math.min(1, v));
            const hy = cl(prev.yaw * S.head), hp = cl(prev.pitch * S.head), hr = prev.roll * S.head;
            const hm = Math.min(1, prev.mouth * S.mouth), bt = blinkThreshold(S.blink);
            const W = c.width, H = c.height, sz = prev.size * W * 1.25;
            const nw = im.naturalWidth, nh = im.naturalHeight, g = geo.current.g;
            ctx.save(); ctx.translate(W - prev.cx * W, prev.cy * H); ctx.rotate(-hr);
            ctx.scale(1 - Math.abs(hy) * 0.25, 1 - Math.abs(hp) * 0.15);
            ctx.beginPath(); ctx.ellipse(0, 0, sz * 0.4, sz * 0.52, 0, 0, Math.PI * 2); ctx.clip();
            // Cadre le visage détecté du portrait au centre de l'ellipse.
            const k = g ? (sz * 0.8) / (g.face.w * nw) : Math.max((sz * 0.8) / nw, (sz * 1.04) / nh);
            const fx = g ? g.face.x + g.face.w / 2 : 0.5, fy = g ? g.face.y + g.face.h / 2 : 0.5;
            const dx = -fx * nw * k - hy * sz * 0.08, dy = -fy * nh * k + hp * sz * 0.05;
            const X = (u: number) => dx + u * nw * k, Y = (v: number) => dy + v * nh * k;
            ctx.drawImage(im, dx, dy, nw * k, nh * k);
            if (g) {
              // Bouche : la mâchoire du portrait descend avec la vôtre.
              const open = Math.min(1, hm) * g.mouth.h * nh * k * 2.2;
              if (open > 0.5) {
                ctx.fillStyle = 'rgb(40,12,16)';
                ctx.beginPath(); ctx.ellipse(X(g.mouth.x + g.mouth.w / 2), Y(g.jaw.y) + open / 2, (g.mouth.w * nw * k) / 2.1, open / 2 + 1, 0, 0, Math.PI * 2); ctx.fill();
                ctx.drawImage(im, g.jaw.x * nw, g.jaw.y * nh, g.jaw.w * nw, g.jaw.h * nh, X(g.jaw.x), Y(g.jaw.y) + open, g.jaw.w * nw * k, g.jaw.h * nh * k);
              }
              // Yeux : paupières qui se ferment avec les vôtres.
              if (prev.blink > bt && geo.current.skin) {
                ctx.fillStyle = geo.current.skin;
                for (const e of g.eyes) {
                  const eh = e.h * nh * k * Math.min(1, (prev.blink - bt) / 0.4);
                  ctx.beginPath(); ctx.ellipse(X(e.x + e.w / 2), Y(e.y) + eh / 2, (e.w * nw * k) / 2, eh / 2, 0, 0, Math.PI * 2); ctx.fill();
                }
              }
            }
            ctx.restore();
          }
          if (++tick % 6 === 0) setSt(prev);
        }
        raf.current = requestAnimationFrame(loop);
      };
      loop();
    } catch (e) {
      const n = (e as { name?: string }).name;
      stop(); setStatus(n === 'NotAllowedError' || n === 'SecurityError' ? 'denied' : 'error');
    }
  };

  const pick = (f?: File) => {
    if (!f) return; const r = checkImage(f);
    if (r !== 'ok') { setErr(r === 'type' ? (fr ? 'Format accepté : JPG, PNG ou WebP.' : 'Accepted: JPG, PNG or WebP.') : (fr ? 'Image trop lourde (8 Mo max).' : 'Image too large (8 MB max).')); return; }
    setErr(''); const u = URL.createObjectURL(f); setOwn(u); setTarget(u);
  };
  const pct = (v: number) => `${Math.round(v * 100)} %`;
  const dir = (v: number, a: string, b: string) => Math.abs(v) < 0.15 ? (fr ? 'centre' : 'center') : v > 0 ? a : b;

  return (
    <section className="panel grid gap-5">
      <div>
        <h2 className="text-lg font-semibold">{fr ? 'Suivi facial en direct' : 'Live face tracking'}</h2>
        <p className="text-sm text-muted-foreground">{fr ? 'Votre webcam est analysée sur cet appareil (MediaPipe). Rien n’est envoyé ni enregistré. Le visage choisi suit votre tête, ouvre la bouche et cligne des yeux avec vous. Le rendu photoréaliste par IA viendra ensuite.' : 'Your webcam is analysed on this device (MediaPipe). Nothing is sent or recorded. The chosen face follows your head, opens its mouth and blinks with you. Photoreal AI rendering comes next.'}</p>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">{fr ? '1. Visage cible' : '1. Target face'}</p>
        <div className="flex flex-wrap gap-2">
          {faces.map(f => (
            <button key={f.id} type="button" onClick={() => setTarget(f.src)} aria-pressed={target === f.src} aria-label={f.credit}
              className={`h-14 w-14 overflow-hidden rounded-full border-2 ${target === f.src ? 'border-primary' : 'border-transparent'}`}>
              <img src={f.src} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
          <label className={`flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-2 border-dashed ${own && target === own ? 'border-primary' : 'border-border'} ${ownRights ? '' : 'pointer-events-none opacity-50'}`} title={fr ? 'Importer un visage' : 'Upload a face'}>
            {own ? <img src={own} alt="" className="h-full w-full rounded-full object-cover" /> : <Upload className="h-5 w-5" />}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={!ownRights} onChange={e => pick(e.target.files?.[0])} />
          </label>
        </div>
        <label className="mt-2 flex items-start gap-2 text-xs text-muted-foreground"><Checkbox checked={ownRights} onCheckedChange={v => setOwnRights(v === true)} />{fr ? 'Pour importer : je détiens les droits sur cette photo et l’accord de la personne.' : 'To upload: I hold the rights to this photo and the person’s consent.'}</label>
        {err && <p role="alert" className="mt-1 text-sm text-destructive">{err}</p>}
      </div>

      <div className="grid gap-3">
        <p className="text-sm font-medium">{fr ? '2. Caméra' : '2. Camera'}</p>
        <label className="flex items-start gap-2 text-sm"><Checkbox checked={agree} onCheckedChange={v => setAgree(v === true)} disabled={status === 'on'} />{fr ? 'J’accepte que Weechat utilise ma caméra sur cet appareil pour suivre mon visage.' : 'I agree Weechat uses my camera on this device to track my face.'}</label>
        <div className="flex flex-wrap gap-2">
          {status === 'on' || status === 'loading'
            ? <Button variant="outline" onClick={stop}><CameraOff className="mr-2 h-4 w-4" />{fr ? 'Couper la caméra' : 'Turn camera off'}</Button>
            : <Button onClick={start} disabled={!agree}><Camera className="mr-2 h-4 w-4" />{fr ? 'Activer la caméra' : 'Turn camera on'}</Button>}
          <Button variant="outline" disabled={status !== 'on'} onClick={() => cv.current?.requestFullscreen?.()}><Maximize2 className="mr-2 h-4 w-4" />{fr ? 'Plein écran' : 'Full screen'}</Button>
          <label className="flex items-center gap-2 text-sm"><Checkbox checked={mesh} onCheckedChange={v => setMesh(v === true)} />{fr ? 'Afficher le maillage' : 'Show mesh'}</label>
        </div>
        <VcamControl canvas={cv} active={status === 'on'} fr={fr} />
        <div className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-3">
          {([['head', fr ? 'Mouvements de tête' : 'Head movement'], ['blink', fr ? 'Clignements' : 'Blinks'], ['mouth', fr ? 'Bouche' : 'Mouth']] as const).map(([k, label]) => (
            <div key={k} className="grid gap-2">
              <div className="flex justify-between text-sm"><span>{label}</span><span className="text-muted-foreground">{Math.round(sens[k] * 100)} %</span></div>
              <Slider min={SENS_MIN} max={SENS_MAX} step={0.1} value={[sens[k]]} aria-label={label} onValueChange={v => setSens(s => ({ ...s, [k]: v[0] ?? 1 }))} />
            </div>
          ))}
          <Button variant="ghost" size="sm" className="sm:col-span-3 justify-self-start" onClick={() => setSens(DEFAULT_SENS)}>{fr ? 'Réinitialiser les réglages' : 'Reset settings'}</Button>
        </div>
        <p role="status" className="text-sm text-muted-foreground">
          {status === 'loading' && (fr ? 'Chargement du suivi facial…' : 'Loading face tracking…')}
          {status === 'denied' && (fr ? 'Caméra refusée : autorisez-la dans les réglages du navigateur.' : 'Camera denied: allow it in browser settings.')}
          {status === 'error' && (fr ? 'Caméra ou suivi indisponible sur cet appareil.' : 'Camera or tracking unavailable on this device.')}
          {status === 'on' && (st ? (fr ? 'Visage détecté' : 'Face detected') : (fr ? 'Aucun visage : placez-vous face à la caméra.' : 'No face: look at the camera.'))}
        </p>
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
        <video ref={video} playsInline muted className="hidden" />
        <canvas ref={cv} className="h-full w-full object-contain" aria-label={fr ? 'Aperçu du suivi facial' : 'Face tracking preview'} />
      </div>

      {st && (
        <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
          <div><dt className="text-muted-foreground">{fr ? 'Tête' : 'Head'}</dt><dd>{dir(-st.yaw, fr ? 'droite' : 'right', fr ? 'gauche' : 'left')}</dd></div>
          <div><dt className="text-muted-foreground">{fr ? 'Hauteur' : 'Tilt'}</dt><dd>{dir(st.pitch, fr ? 'bas' : 'down', fr ? 'haut' : 'up')}</dd></div>
          <div><dt className="text-muted-foreground">{fr ? 'Bouche' : 'Mouth'}</dt><dd>{pct(st.mouth)}</dd></div>
          <div><dt className="text-muted-foreground">{fr ? 'Yeux fermés' : 'Eyes closed'}</dt><dd>{pct(st.blink)}</dd></div>
          <div><dt className="text-muted-foreground">{fr ? 'Sourire' : 'Smile'}</dt><dd>{pct(st.smile)}</dd></div>
        </dl>
      )}
    </section>
  );
}
