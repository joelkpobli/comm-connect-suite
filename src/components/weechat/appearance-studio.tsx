import { useEffect, useMemo, useRef, useState } from 'react';
import { Upload, Trash2, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDemo } from './provider';
import { checkImage } from '@/lib/weechat/persona-catalog';
import { BG_CATEGORIES, DEFAULT_PREFS, PREFS_KEY, libraryAvatars, libraryBackgrounds, parsePrefs, placeAvatar, type AppearancePrefs, type AvatarPose, type BgCategory, type LibAvatar, type LibBackground } from '@/lib/weechat/appearance-library';
import { deleteImage, listImages, saveImage, type StoredImage } from '@/lib/weechat/appearance-store';

const T = {
  fr: { avatars: 'Avatars', bgs: 'Arrière-plans', all: 'Tous', f: 'Femmes', m: 'Hommes', stand: 'En pied', sit: 'Assis', half: 'Mi-corps', mine: 'Mes images',
    cats: { home: 'Résidences', office: 'Bureaux', hotel: 'Hôtels et prestige', outdoor: 'Extérieurs', other: 'Cafés et bibliothèques' } as Record<BgCategory, string>,
    importAvatar: 'Importer mon avatar', importBg: 'Importer mon arrière-plan', rights: 'En important, vous certifiez détenir les droits sur l’image et l’accord de la personne représentée.',
    preview: 'Aperçu de votre apparence', size: 'Taille', posX: 'Position horizontale', posY: 'Position verticale', blur: 'Flou du décor', shadow: 'Ombre au sol', reset: 'Réinitialiser le cadrage', remove: 'Supprimer',
    saved: 'Enregistré automatiquement sur cet appareil', free: 'Gratuit : aucun jeton n’est utilisé.', noAlpha: 'Votre photo garde son fond d’origine. Pour un rendu naturel, importez un PNG détouré (fond transparent).',
    errType: 'Format non accepté (JPG, PNG ou WebP).', errSize: 'Fichier trop lourd (8 Mo max).', errStore: 'Impossible d’enregistrer l’image sur cet appareil.', still: 'Image fixe : le suivi des mouvements fera l’objet d’une étape ultérieure.', credit: 'Crédit photo' },
  en: { avatars: 'Avatars', bgs: 'Backgrounds', all: 'All', f: 'Women', m: 'Men', stand: 'Full body', sit: 'Seated', half: 'Half body', mine: 'My images',
    cats: { home: 'Homes', office: 'Offices', hotel: 'Hotels & prestige', outdoor: 'Outdoors', other: 'Cafés & libraries' } as Record<BgCategory, string>,
    importAvatar: 'Upload my avatar', importBg: 'Upload my background', rights: 'By uploading, you confirm you hold the rights to the image and consent of the person shown.',
    preview: 'Your appearance preview', size: 'Size', posX: 'Horizontal position', posY: 'Vertical position', blur: 'Background blur', shadow: 'Floor shadow', reset: 'Reset framing', remove: 'Delete',
    saved: 'Saved automatically on this device', free: 'Free: no tokens are used.', noAlpha: 'Your photo keeps its original background. For a natural result, upload a cut-out PNG (transparent background).',
    errType: 'Format not accepted (JPG, PNG or WebP).', errSize: 'File too large (8 MB max).', errStore: 'Could not save the image on this device.', still: 'Still image: movement tracking comes in a later stage.', credit: 'Photo credit' },
};

function loadImg(src: string) { return new Promise<HTMLImageElement>((ok, ko) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => ok(i); i.onerror = ko; i.src = src; }); }
function hasAlpha(img: HTMLImageElement) {
  const c = document.createElement('canvas'); c.width = 64; c.height = 64; const x = c.getContext('2d'); if (!x) return true;
  x.drawImage(img, 0, 0, 64, 64); const d = x.getImageData(0, 0, 64, 64).data; for (let i = 3; i < d.length; i += 4) if (d[i]! < 250) return true; return false;
}

export function AppearanceStudio() {
  const { locale } = useDemo(); const c = T[locale];
  const [prefs, setPrefs] = useState<AppearancePrefs>(DEFAULT_PREFS); const [ready, setReady] = useState(false);
  const [mine, setMine] = useState<(StoredImage & { url: string })[]>([]);
  const [gender, setGender] = useState<'all' | 'f' | 'm'>('all'); const [pose, setPose] = useState<'all' | AvatarPose>('all'); const [cat, setCat] = useState<'all' | BgCategory | 'mine'>('all');
  const [err, setErr] = useState(''); const [opaque, setOpaque] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setPrefs(parsePrefs(localStorage.getItem(PREFS_KEY)));
    let urls: string[] = [];
    listImages().then(list => { const m = list.sort((a, b) => a.created - b.created).map(i => ({ ...i, url: URL.createObjectURL(i.blob) })); urls = m.map(x => x.url); setMine(m); }).catch(() => {}).finally(() => setReady(true));
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); }, [prefs, ready]);

  const myAvatars: LibAvatar[] = useMemo(() => mine.filter(i => i.kind === 'avatar').map(i => ({ id: i.id, src: i.url, g: 'f', pose: 'stand', credit: i.name, personal: true })), [mine]);
  const myBgs: LibBackground[] = useMemo(() => mine.filter(i => i.kind === 'background').map(i => ({ id: i.id, src: i.url, cat: 'other', credit: i.name, personal: true })), [mine]);
  const allAvatars = [...libraryAvatars, ...myAvatars]; const allBgs = [...libraryBackgrounds, ...myBgs];
  const avatar = allAvatars.find(a => a.id === prefs.avatarId) ?? libraryAvatars[0]!;
  const bg = allBgs.find(b => b.id === prefs.backgroundId) ?? libraryBackgrounds[0]!;
  const set = (p: Partial<AppearancePrefs>) => setPrefs(v => ({ ...v, ...p }));

  useEffect(() => {
    let live = true; const cv = canvas.current; const ctx = cv?.getContext('2d'); if (!cv || !ctx) return;
    Promise.all([loadImg(bg.src), loadImg(avatar.src)]).then(([b, f]) => {
      if (!live) return; const W = cv.width, H = cv.height; ctx.clearRect(0, 0, W, H);
      const k = prefs.blur * 2; const s = Math.max((W + k * 2) / b.width, (H + k * 2) / b.height);
      ctx.save(); ctx.filter = prefs.blur ? `blur(${prefs.blur}px)` : 'none'; ctx.drawImage(b, (W - b.width * s) / 2, (H - b.height * s) / 2, b.width * s, b.height * s); ctx.restore();
      const p = placeAvatar(W, H, f.width, f.height, avatar.pose, prefs);
      if (prefs.shadow && avatar.pose !== 'half') { ctx.save(); const cx = p.x + p.w / 2; const g = ctx.createRadialGradient(cx, p.floor, 0, cx, p.floor, p.w * 0.55); g.addColorStop(0, `rgba(0,0,0,${prefs.shadow / 12})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.translate(cx, p.floor); ctx.scale(1, 0.16); ctx.beginPath(); ctx.arc(0, 0, p.w * 0.55, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
      // light ambient match: slight edge softening so the figure does not look pasted
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 12; ctx.drawImage(f, p.x, p.y, p.w, p.h); ctx.restore();
      setOpaque(Boolean(avatar.personal) && !hasAlpha(f));
    }).catch(() => {});
    return () => { live = false; };
  }, [avatar, bg, prefs]);

  async function onImport(file: File | undefined, kind: 'avatar' | 'background') {
    setErr(''); if (!file) return; const v = checkImage(file); if (v !== 'ok') { setErr(v === 'type' ? c.errType : c.errSize); return; }
    const img: StoredImage = { id: `mine-${kind}-${Date.now()}`, kind, name: file.name.slice(0, 80), blob: file, created: Date.now() };
    try { await saveImage(img); } catch { setErr(c.errStore); return; }
    setMine(m => [...m, { ...img, url: URL.createObjectURL(file) }]);
    set(kind === 'avatar' ? { avatarId: img.id } : { backgroundId: img.id });
  }
  async function onRemove(id: string) {
    await deleteImage(id).catch(() => {});
    setMine(m => { const x = m.find(i => i.id === id); if (x) URL.revokeObjectURL(x.url); return m.filter(i => i.id !== id); });
    if (prefs.avatarId === id) set({ avatarId: DEFAULT_PREFS.avatarId }); if (prefs.backgroundId === id) set({ backgroundId: DEFAULT_PREFS.backgroundId });
  }

  const chip = (on: boolean) => on ? 'default' as const : 'outline' as const;
  const tile = (on: boolean) => `relative overflow-hidden rounded-lg border-2 bg-secondary transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${on ? 'border-primary' : 'border-transparent hover:border-border'}`;
  const avatarList = [...myAvatars, ...libraryAvatars.filter(a => (gender === 'all' || a.g === gender) && (pose === 'all' || a.pose === pose))];
  const bgList = cat === 'mine' ? myBgs : cat === 'all' ? [...myBgs, ...libraryBackgrounds] : libraryBackgrounds.filter(b => b.cat === cat);
  const Remove = ({ id }: { id: string }) => <button type="button" aria-label={c.remove} onClick={e => { e.stopPropagation(); void onRemove(id); }} className="absolute right-1 top-1 rounded-md bg-background/85 p-1 text-destructive"><Trash2 size={16} /></button>;
  const Picker = ({ kind, label }: { kind: 'avatar' | 'background'; label: string }) => <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-secondary focus-within:ring-2 focus-within:ring-ring"><Upload size={16} />{label}<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={e => { void onImport(e.target.files?.[0], kind); e.target.value = ''; }} /></label>;
  const Range = ({ label, value, min, max, step, on }: { label: string; value: number; min: number; max: number; step: number; on: (v: number) => void }) => <label className="grid gap-2 text-sm"><span className="flex justify-between"><span>{label}</span></span><Slider value={[value]} min={min} max={max} step={step} onValueChange={v => on(v[0]!)} aria-label={label} /></label>;

  return <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
    <section className="panel grid content-start gap-4">
      <Tabs defaultValue="avatars">
        <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="avatars">{c.avatars} ({allAvatars.length})</TabsTrigger><TabsTrigger value="bgs">{c.bgs} ({allBgs.length})</TabsTrigger></TabsList>
        <TabsContent value="avatars" className="grid gap-3 pt-3">
          <div className="flex flex-wrap gap-2">{(['all', 'f', 'm'] as const).map(k => <Button key={k} size="sm" variant={chip(gender === k)} onClick={() => setGender(k)}>{c[k]}</Button>)}<span className="mx-1 w-px bg-border" />{(['all', 'stand', 'sit', 'half'] as const).map(k => <Button key={k} size="sm" variant={chip(pose === k)} onClick={() => setPose(k)}>{c[k]}</Button>)}</div>
          <div className="grid max-h-[520px] grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4">{avatarList.map(a => <div key={a.id} role="button" tabIndex={0} aria-pressed={avatar.id === a.id} onClick={() => set({ avatarId: a.id })} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set({ avatarId: a.id }); } }} className={tile(avatar.id === a.id)}><img src={a.src} alt={a.personal ? a.credit : `${c[a.g]} · ${c[a.pose]}`} loading="lazy" className="aspect-[3/4] w-full object-contain" />{a.personal && <Remove id={a.id} />}</div>)}</div>
          <Picker kind="avatar" label={c.importAvatar} />
        </TabsContent>
        <TabsContent value="bgs" className="grid gap-3 pt-3">
          <div className="flex flex-wrap gap-2"><Button size="sm" variant={chip(cat === 'all')} onClick={() => setCat('all')}>{c.all}</Button>{BG_CATEGORIES.map(k => <Button key={k} size="sm" variant={chip(cat === k)} onClick={() => setCat(k)}>{c.cats[k]}</Button>)}{myBgs.length > 0 && <Button size="sm" variant={chip(cat === 'mine')} onClick={() => setCat('mine')}>{c.mine}</Button>}</div>
          <div className="grid max-h-[520px] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">{bgList.map(b => <div key={b.id} role="button" tabIndex={0} aria-pressed={bg.id === b.id} onClick={() => set({ backgroundId: b.id })} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set({ backgroundId: b.id }); } }} className={tile(bg.id === b.id)}><img src={b.src} alt={b.personal ? b.credit : c.cats[b.cat]} loading="lazy" className="aspect-video w-full object-cover" />{b.personal && <Remove id={b.id} />}</div>)}</div>
          <Picker kind="background" label={c.importBg} />
        </TabsContent>
      </Tabs>
      <p className="text-sm text-muted-foreground">{c.rights}</p>
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
    </section>
    <section className="panel grid content-start gap-4" aria-labelledby="ap-prev">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 id="ap-prev">{c.preview}</h2><span className="inline-flex items-center gap-1 text-sm text-primary"><Check size={16} />{c.saved}</span></div>
      <canvas ref={canvas} width={1280} height={720} className="aspect-video w-full rounded-lg border border-border bg-secondary" aria-label={c.preview} />
      {opaque && <p className="rounded-md border border-border bg-secondary p-3 text-sm">{c.noAlpha}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Range label={c.size} value={prefs.scale} min={0.4} max={1.6} step={0.02} on={v => set({ scale: v })} />
        <Range label={c.posX} value={prefs.x} min={-0.5} max={0.5} step={0.01} on={v => set({ x: v })} />
        <Range label={c.posY} value={prefs.y} min={-0.4} max={0.4} step={0.01} on={v => set({ y: v })} />
        <Range label={c.blur} value={prefs.blur} min={0} max={8} step={1} on={v => set({ blur: v })} />
        <Range label={c.shadow} value={prefs.shadow} min={0} max={10} step={1} on={v => set({ shadow: v })} />
        <div className="flex items-end"><Button variant="outline" onClick={() => set({ scale: 1, x: 0, y: 0, blur: 0, shadow: 5 })}><RotateCcw />{c.reset}</Button></div>
      </div>
      <p className="text-sm text-muted-foreground">{c.free} {c.still}</p>
    </section>
  </div>;
}
