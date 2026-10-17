import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Camera, Mic, Square, UserRound, ImagePlus, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useDemo } from './provider';
import { mediaCopy } from '@/lib/weechat/media-copy';
import { LocalMediaSession, LocalAudioGraph, rmsLevel, validateLocalPhoto, type ConsentKind, type DeviceKind } from '@/lib/weechat/media-session';

export function LocalMediaPanel({ name }: { name: string }) {
  const { locale } = useDemo(); const c = mediaCopy[locale];
  const [session, setSession] = useState<LocalMediaSession | null>(null);
  useEffect(() => {
    const controller = new LocalMediaSession(window.isSecureContext ? navigator.mediaDevices : undefined);
    setSession(controller);
    const changed = () => { void controller.refreshDevices(); };
    navigator.mediaDevices?.addEventListener('devicechange', changed);
    const hidden = () => { if (document.hidden) controller.stopAll(); };
    document.addEventListener('visibilitychange', hidden);
    window.addEventListener('pagehide', controller.stopAll.bind(controller));
    return () => { controller.dispose(); navigator.mediaDevices?.removeEventListener('devicechange', changed); document.removeEventListener('visibilitychange', hidden); };
  }, []);
  return session ? <MediaControls session={session} name={name} /> : <p role="status">{c.idle}</p>;
}
function MediaControls({ session, name }: { session: LocalMediaSession; name: string }) {
  const { locale } = useDemo(); const c = mediaCopy[locale];
  const state = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  const [representation, setRepresentation] = useState<'initials' | 'camera' | 'photo' | 'avatar'>('initials');
  const [photo, setPhoto] = useState(''); const photoUrl = useRef(''); const fileGeneration = useRef(0);
  const [photoError, setPhotoError] = useState('');
  const [mirror, setMirror] = useState(true); const [fit, setFit] = useState<'contain' | 'cover'>('contain');
  const [selected, setSelected] = useState({ microphone: '', camera: '' });
  const [processing, setProcessing] = useState(true); const [muted, setMuted] = useState(false); const [gain, setGain] = useState(1);
  const [level, setLevel] = useState(0); const [audioReady, setAudioReady] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [avatar, setAvatar] = useState<'W' | '★' | '●'>('W');
  const videoRef = useRef<HTMLVideoElement>(null); const canvasRef = useRef<HTMLCanvasElement>(null); const outputRef = useRef<HTMLVideoElement>(null);
  const graphRef = useRef<LocalAudioGraph | null>(null); const fileRef = useRef<HTMLInputElement>(null);
  function clearPhoto() { ++fileGeneration.current; if (photoUrl.current) URL.revokeObjectURL(photoUrl.current); photoUrl.current = ''; setPhoto(''); if (fileRef.current) fileRef.current.value = ''; }
  useEffect(() => () => { ++fileGeneration.current; if (photoUrl.current) URL.revokeObjectURL(photoUrl.current); }, []);
  function consent(kind: ConsentKind, value: boolean) {
    session.consent(kind, value);
    if (!value && kind === 'photo') clearPhoto();
    if (!value && representation === kind) setRepresentation('initials');
  }
  function revoke() { (['microphone', 'camera', 'photo', 'avatar'] as const).forEach(kind => consent(kind, false)); setRepresentation('initials'); }
  async function loadPhoto(file?: File) {
    clearPhoto(); setPhotoError('');
    if (!file || !state.consent.photo) return;
    if (!validateLocalPhoto(file)) { setPhotoError(c.invalidPhoto); return; }
    const generation = fileGeneration.current; const url = URL.createObjectURL(file); const image = new Image(); image.src = url;
    try {
      await image.decode();
      if (generation !== fileGeneration.current || !session.getSnapshot().consent.photo) { URL.revokeObjectURL(url); return; }
      photoUrl.current = url; setPhoto(url); setRepresentation('photo');
    } catch { URL.revokeObjectURL(url); if (generation === fileGeneration.current) setPhotoError(c.invalidPhoto); }
  }
  useEffect(() => {
    const video = videoRef.current; if (!video) return;
    video.srcObject = state.streams.camera ?? null;
    if (state.streams.camera) void video.play().catch(() => {});
    return () => { video.srcObject = null; };
  }, [state.streams.camera]);
  useEffect(() => {
    const stream = state.streams.microphone; if (!stream) { setLevel(0); setAudioReady(false); return; }
    let graph: LocalAudioGraph;
    try { graph = new LocalAudioGraph(new AudioContext(), stream); graphRef.current = graph; void graph.context.resume().catch(() => setAudioReady(false)); setAudioReady(true); }
    catch { setAudioReady(false); return; }
    const samples = new Uint8Array(graph.analyser.fftSize);
    const timer = window.setInterval(() => { graph.analyser.getByteTimeDomainData(samples); setLevel(rmsLevel(samples)); }, 100);
    return () => { window.clearInterval(timer); graph.close(); graphRef.current = null; setAudioReady(false); setLevel(0); };
  }, [state.streams.microphone]);
  useEffect(() => { graphRef.current?.setGain(gain, muted); }, [gain, muted, state.streams.microphone]);
  useEffect(() => {
    const canvas = canvasRef.current; const output = outputRef.current; const ctx = canvas?.getContext('2d');
    if (!canvas || !output || !ctx) return;
    const style = getComputedStyle(canvas); const bg = style.getPropertyValue('--surface-deep'); const fg = style.getPropertyValue('--primary');
    const image = new Image(); if (photo) image.src = photo;
    let frame = 0; let stream: MediaStream | undefined;
    const paint = () => {
      ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
      const video = videoRef.current;
      const source = representation === 'camera' && state.consent.camera && video && video.readyState >= 2 ? video : representation === 'photo' && state.consent.photo && image.complete && image.naturalWidth ? image : null;
      if (source) {
        const sw = source instanceof HTMLVideoElement ? source.videoWidth : source.naturalWidth; const sh = source instanceof HTMLVideoElement ? source.videoHeight : source.naturalHeight;
        if (sw && sh) {
          const scale = fit === 'cover' ? Math.max(canvas.width / sw, canvas.height / sh) : Math.min(canvas.width / sw, canvas.height / sh);
          const w = sw * scale; const h = sh * scale; ctx.save();
          if (mirror && representation === 'camera') { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
          ctx.drawImage(source, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h); ctx.restore();
        }
      } else { ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '72px sans-serif'; ctx.fillText(representation === 'avatar' && state.consent.avatar ? avatar : name.slice(0, 2).toUpperCase() || 'W', canvas.width / 2, canvas.height / 2); }
      frame = requestAnimationFrame(paint);
    };
    paint();
    try { if (canvas.captureStream) { stream = canvas.captureStream(15); output.srcObject = stream; void output.play().catch(() => {}); setVideoReady(true); } else setVideoReady(false); } catch { setVideoReady(false); }
    return () => { cancelAnimationFrame(frame); stream?.getTracks().forEach(track => track.stop()); output.srcObject = null; };
  }, [representation, photo, mirror, fit, avatar, name, state.streams.camera, state.consent.camera, state.consent.photo, state.consent.avatar]);
  const issues = { denied: c.deniedError, missing: c.missingError, busy: c.busyError, unsupported: c.unsupportedError, constraints: c.constraintsError, unknown: c.unknownError };
  return <section className="local-media" aria-label={c.tab}>
    <h2>{c.title}</h2><p className="media-privacy"><ShieldCheck size={18} />{c.privacy}</p>
    <h3>{c.consentTitle}</h3><div className="media-consents">{(['microphone', 'camera', 'photo', 'avatar'] as const).map(kind => <label key={kind}><Checkbox checked={state.consent[kind]} onCheckedChange={value => consent(kind, value === true)} />{c[`${kind}Consent`]}</label>)}</div>
    <div className="media-devices">{(['microphone', 'camera'] as const).map((kind: DeviceKind) => <section key={kind} className="media-device"><h3>{kind === 'microphone' ? <Mic size={18} /> : <Camera size={18} />}{c[kind]}</h3><p role="status" data-device-status={kind}>{c[state.status[kind]]}</p><label className="field"><span>{c.device} · {c[kind]}</span><select className="form-select" value={selected[kind]} disabled={state.status[kind] === 'requesting'} onChange={e => { const id = e.target.value; setSelected(prev => ({ ...prev, [kind]: id })); if (state.status[kind] === 'active') void session.start(kind, id, processing); }}><option value="">{c.defaultDevice}</option>{state.devices.filter(d => d.kind === (kind === 'microphone' ? 'audioinput' : 'videoinput') && d.deviceId !== 'default').map((d, index) => <option key={d.deviceId} value={d.deviceId}>{d.label || `${c[kind]} ${index + 1}`}</option>)}</select></label><div className="media-actions"><Button type="button" disabled={!state.consent[kind] || state.status[kind] === 'requesting' || state.status[kind] === 'active'} onClick={() => { if (kind === 'camera') setRepresentation('camera'); void session.start(kind, selected[kind], processing); }}>{c.enable} {c[kind].toLowerCase()}</Button><Button type="button" variant="outline" disabled={!['active', 'requesting'].includes(state.status[kind])} onClick={() => session.stop(kind)}><Square size={14} />{c.stop}</Button></div>{state.issues[kind] && <p role="alert" className="text-destructive">{issues[state.issues[kind]]}</p>}</section>)}</div>
    <h3>{c.representation}</h3><div className="media-actions">{([{ id: 'initials', title: c.initials, Icon: UserRound }, { id: 'camera', title: c.camera, Icon: Camera }, { id: 'photo', title: c.photo, Icon: ImagePlus }, { id: 'avatar', title: c.avatar, Icon: UserRound }] as const).map(({ id, title, Icon }) => <Button key={id} type="button" variant="outline" aria-pressed={representation === id} disabled={id !== 'initials' && (!state.consent[id] || (id === 'photo' && !photo))} onClick={() => setRepresentation(id)}><Icon size={16} />{title}</Button>)}</div>
    <Input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" aria-label={c.choosePhoto} onChange={e => { void loadPhoto(e.target.files?.[0]); }} />
    <div className="media-actions"><Button type="button" variant="outline" disabled={!state.consent.photo} onClick={() => fileRef.current?.click()}><ImagePlus />{c.choosePhoto}</Button>{photo && <Button type="button" variant="ghost" onClick={() => { clearPhoto(); setRepresentation('initials'); }}>{c.clearPhoto}</Button>}<span className="text-muted-foreground text-xs">{c.photoHint}</span></div>{photoError && <p role="alert" className="text-destructive">{photoError}</p>}
    {representation === 'avatar' && <div className="media-actions">{(['W', '★', '●'] as const).map(value => <Button key={value} type="button" aria-label={`${c.avatar} ${value}`} aria-pressed={avatar === value} variant="outline" onClick={() => setAvatar(value)}>{value}</Button>)}</div>}
    <div className="media-preview-grid"><div><h3>{c.preview}</h3><div className="media-preview"><video ref={videoRef} muted playsInline className={representation === 'camera' && state.streams.camera ? `${mirror ? 'media-mirror' : ''} media-${fit}` : 'hidden'} aria-label={c.preview} />{representation === 'photo' && photo ? <img src={photo} alt={c.photoAlt} className={`media-${fit}`} /> : representation === 'avatar' ? <span className="media-monogram">{avatar}</span> : (representation !== 'camera' || !state.streams.camera) && <span className="media-monogram">{name.slice(0, 2).toUpperCase() || 'W'}</span>}</div></div><div><h3>{c.composition}</h3><div className="media-preview"><canvas ref={canvasRef} width={640} height={360} className={videoReady ? 'hidden' : ''} /><video ref={outputRef} muted playsInline className={videoReady ? '' : 'hidden'} aria-label={c.composition} /></div><p role="status">{videoReady ? c.videoReady : c.videoUnavailable}</p></div></div>
    <div className="media-actions"><label className="media-check"><Checkbox checked={mirror} onCheckedChange={v => setMirror(v === true)} />{c.mirror}</label><label className="media-check">{c.fit}<select className="form-select" value={fit} onChange={e => setFit(e.target.value === 'cover' ? 'cover' : 'contain')}><option value="contain">{c.contain}</option><option value="cover">{c.cover}</option></select></label></div><p className="media-note">{c.videoNote}</p>
    <section className="media-audio"><h3><Mic size={18} />{c.audio}</h3><label className="media-check"><Checkbox checked={processing} onCheckedChange={value => { const enabled = value === true; setProcessing(enabled); if (state.status.microphone === 'active') void session.start('microphone', selected.microphone, enabled); }} />{c.processing}</label><label className="media-check"><Checkbox checked={muted} onCheckedChange={v => setMuted(v === true)} />{c.mute}</label><label className="field"><span>{c.gain} · {gain.toFixed(1)}×</span><Input type="range" min="0" max="2" step="0.1" value={gain} onChange={e => setGain(Number(e.target.value))} /></label><meter min={0} max={100} value={level} aria-label={c.level} /><p role="status">{state.streams.microphone ? audioReady ? c.audioReady : c.audioUnavailable : c.stopped}</p><p className="media-note">{c.audioNote}</p></section>
    <div className="media-actions media-footer"><Button type="button" variant="outline" onClick={() => session.stopAll()}><Square />{c.stopAll}</Button><Button type="button" variant="ghost" onClick={revoke}><ShieldCheck />{c.revoke}</Button></div>
  </section>;
}
