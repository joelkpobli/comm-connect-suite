import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Image as ImageIcon, Sparkles, MessageSquareText, Loader2, Download, UserRound, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageTitle } from './shared';
import { useDemo } from './provider';
import { creditsQuery, aiTokensQuery, validityQuery, fmtExpiry } from '@/lib/weechat/credits-query';
import { AI_TASK_PRICES, CHARACTER_SWAP_MAX_BYTES, CHARACTER_SWAP_MAX_SECONDS, TALKING_PHOTO_MAX_SECONDS, type AiTaskKind } from '@/lib/weechat/ai-pricing';
import { startFaceSwapTask, startCharacterSwapTask, startImageGenerationTask, startTalkingPhotoTask, getAiTaskStatus } from '@/lib/weechat/ai-tasks.functions';

type Tab = 'swap' | 'image' | 'talk' | 'body';
const MAX_BYTES = 5 * 1024 * 1024;

function readImage(file: File): Promise<string> {
  return new Promise((ok, ko) => {
    if (!/^image\/(png|jpeg|webp)$/.test(file.type) || file.size > MAX_BYTES) return ko(new Error('format'));
    const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = () => ko(r.error); r.readAsDataURL(file);
  });
}

function Picker({ label, value, onChange }: { label: string; value: string | null; onChange: (v: string | null) => void }) {
  return <label className="grid gap-2 text-sm font-medium">{label}
    <div className="grid aspect-square place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/30">
      {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="text-muted-foreground" />}
    </div>
    <Input type="file" accept="image/png,image/jpeg,image/webp" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; try { onChange(await readImage(f)); } catch { onChange(null); alert('PNG, JPG ou WEBP, 5 Mo maximum.'); } }} />
  </label>;
}

/** Flip to true once the AI provider account is funded. */
const AI_STUDIO_AVAILABLE = false;

export function SwapPhotoPage() {
  const { locale } = useDemo(); const fr = locale === 'fr';
  const qc = useQueryClient();
  const points = useQuery(creditsQuery); const tokens = useQuery(aiTokensQuery); const validity = useQuery(validityQuery);
  const [tab, setTab] = useState<Tab>('body');
  const [target, setTarget] = useState<string | null>(null);
  const [face, setFace] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [count, setCount] = useState(1);
  const [script, setScript] = useState('');
  const [seconds, setSeconds] = useState(8);
  const [video, setVideo] = useState<{ data: string; preview: string; seconds: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ urls: string[]; video: boolean } | null>(null);
  const swap = useServerFn(startFaceSwapTask), gen = useServerFn(startImageGenerationTask), talk = useServerFn(startTalkingPhotoTask), body = useServerFn(startCharacterSwapTask), status = useServerFn(getAiTaskStatus);

  const currency = tab === 'body' ? 'points' : (fr ? 'jetons' : 'tokens');
  const errors: Record<string, string> = fr
    ? { insufficient: tab === 'body' ? 'Points insuffisants. Rechargez un pack.' : 'Jetons IA insuffisants. Rechargez un pack.', provider_billing: `Service IA momentanément indisponible. Vos ${currency} ont été remboursés.`, provider_failed: `La création a échoué. Vos ${currency} ont été remboursés.`, provider_not_configured: 'Service IA indisponible.', maintenance: `Maintenance technique en cours sur la génération IA. Aucun débit de ${currency}.`, failed: 'Une erreur est survenue.', timeout: 'Le traitement prend trop de temps. Réessayez plus tard.', video_too_long: `Vidéo trop longue : ${CHARACTER_SWAP_MAX_SECONDS} s et 25 Mo maximum.`, video_unreadable: 'Vidéo illisible. Utilisez un fichier MP4.' }
    : { insufficient: tab === 'body' ? 'Not enough points. Top up a pack.' : 'Not enough AI tokens. Top up a pack.', provider_billing: `AI service temporarily unavailable. Your ${currency} were refunded.`, provider_failed: `Creation failed. Your ${currency} were refunded.`, provider_not_configured: 'AI service unavailable.', maintenance: `AI generation is under maintenance. No ${currency} were charged.`, failed: 'Something went wrong.', timeout: 'Processing is taking too long. Try again later.', video_too_long: `Video too long: ${CHARACTER_SWAP_MAX_SECONDS} s and 25 MB max.`, video_unreadable: 'Unreadable video. Use an MP4 file.' };

  async function go(kind: AiTaskKind, start: () => Promise<{ ok: true; providerJobId: string } | { ok: false; error: string }>) {
    setBusy(true); setError(null); setResults(null);
    try {
      const r = await start();
      qc.invalidateQueries({ queryKey: kind === 'character_swap' ? creditsQuery.queryKey : aiTokensQuery.queryKey });
      if (!r.ok) { setError(errors[r.error] ?? errors['failed'] ?? 'Erreur / Error'); return; }
      for (let i = 0; i < 240; i++) {
        await new Promise((s) => setTimeout(s, i < 5 ? 2000 : 5000));
        const s = await status({ data: { kind, providerJobId: r.providerJobId } });
        if (s.state === 'completed') { setResults({ urls: ('resultUrls' in s && s.resultUrls) || [], video: kind === 'talking_photo' || kind === 'character_swap' }); return; }
        if (s.state === 'failed') { setError(fr ? 'Le fournisseur n’a pas terminé la création. Contactez le support avant de réessayer.' : 'The provider could not complete the creation. Contact support before retrying.'); return; }
      }
      setError(errors['timeout'] ?? 'Timeout');
    } catch { setError(errors['failed'] ?? 'Erreur / Error'); } finally { setBusy(false); }
  }

  async function pickVideo(f: File) {
    if (!/^video\/(mp4|quicktime)$/.test(f.type) || f.size > CHARACTER_SWAP_MAX_BYTES) { setVideo(null); setError(errors['video_too_long'] ?? '15 s max'); return; }
    const preview = URL.createObjectURL(f);
    const seconds = await new Promise<number>((ok) => { const v = document.createElement('video'); v.preload = 'metadata'; v.onloadedmetadata = () => ok(Math.ceil(v.duration || 0)); v.onerror = () => ok(0); v.src = preview; });
    if (!seconds || seconds > CHARACTER_SWAP_MAX_SECONDS) { URL.revokeObjectURL(preview); setVideo(null); setError(errors['video_too_long'] ?? '15 s max'); return; }
    const data = await new Promise<string>((ok, ko) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = () => ko(r.error); r.readAsDataURL(f); });
    setError(null); setVideo({ data, preview, seconds });
  }

  const tabs: [Tab, string, typeof ImageIcon, string][] = [
    ['body', fr ? 'Transformation totale' : 'Full transformation', UserRound, `${AI_TASK_PRICES.characterSwapPerSecond} ${fr ? 'points / seconde' : 'points / second'}`],
    ['swap', 'Swap Photo', ImageIcon, `${AI_TASK_PRICES.faceSwapPerPhoto} ${fr ? 'jetons / photo' : 'tokens / photo'}`],
    ['image', fr ? 'Créer une image' : 'Create an image', Sparkles, `${AI_TASK_PRICES.imagePerUnit} ${fr ? 'jetons / image' : 'tokens / image'}`],
    ['talk', fr ? 'Photo parlante' : 'Talking photo', MessageSquareText, `${AI_TASK_PRICES.talkingPhotoPerSecond} ${fr ? 'jetons / seconde' : 'tokens / second'}`],
  ];
  const cost = tab === 'body' ? (video?.seconds ?? 0) * AI_TASK_PRICES.characterSwapPerSecond : tab === 'swap' ? AI_TASK_PRICES.faceSwapPerPhoto : tab === 'image' ? count * AI_TASK_PRICES.imagePerUnit : seconds * AI_TASK_PRICES.talkingPhotoPerSecond;

  return <><PageTitle title={fr ? 'Studio IA' : 'AI Studio'} subtitle={fr ? 'Changez un visage sur une photo, créez des images ou faites parler une photo.' : 'Swap a face in a photo, create images or make a photo talk.'}
      action={<span className="rounded-full border border-border px-3 py-1 text-sm">{tab === 'body' ? points.data?.totals.balance ?? '…' : tokens.data ?? '…'} {tab === 'body' ? 'points' : fr ? 'jetons IA' : 'AI tokens'} · {fmtExpiry(tab === 'body' ? validity.data?.credits : validity.data?.tokens, !fr)}</span>} />
    {!AI_STUDIO_AVAILABLE && <div role="status" className="mb-4 rounded-xl border border-primary/40 bg-primary/10 p-4 text-sm"><strong className="mr-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">{fr ? 'Bientôt disponible' : 'Coming soon'}</strong>{fr ? 'Le Studio IA ouvre très bientôt. Aucun point ni jeton IA n’est débité avant l’ouverture.' : 'The AI Studio opens very soon. No points or AI tokens are charged before launch.'}</div>}
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{tabs.map(([id, label, Icon, price]) =>
      <Button key={id} type="button" variant="outline" disabled={busy} aria-pressed={tab === id} onClick={() => { setTab(id); setResults(null); setError(null); }} className={`flex h-auto min-h-11 justify-start whitespace-normal items-center gap-3 rounded-xl border p-3 text-left transition ${tab === id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
        <Icon className="text-primary" size={20} /><span><strong className="block text-sm">{label}</strong><small className="text-muted-foreground">{price}</small></span></Button>)}</div>

    <section className="mt-6 grid gap-5 rounded-2xl border border-border p-5">
      {tab === 'body' && <div className="grid gap-4">
        <p className="rounded-xl border border-primary/40 bg-primary/10 p-3 text-sm">{fr ? 'La personne de la vidéo est entièrement remplacée par celle de la photo : visage, cheveux, corps et vêtements. Les gestes, expressions, décor et son de la vidéo sont conservés.' : 'The person in the video is fully replaced by the one in the photo: face, hair, body and clothes. The video’s gestures, expressions, scenery and sound are kept.'}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">{fr ? `1. Votre vidéo (MP4, ${CHARACTER_SWAP_MAX_SECONDS} s max)` : `1. Your video (MP4, ${CHARACTER_SWAP_MAX_SECONDS} s max)`}
            <div className="grid aspect-square place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/30">{video ? <video src={video.preview} muted loop autoPlay playsInline className="h-full w-full object-cover" /> : <Film className="text-muted-foreground" />}</div>
            <Input type="file" accept="video/mp4,video/quicktime" onChange={(e) => { const f = e.target.files?.[0]; if (f) void pickVideo(f); }} /></label>
          <Picker label={fr ? '2. Photo du nouveau personnage (en pied, de face)' : '2. New character photo (full body, facing camera)'} value={face} onChange={setFace} />
        </div>
        <p className="text-xs text-muted-foreground">{fr ? 'Conseil : une seule personne bien visible dans la vidéo et sur la photo. Le traitement prend plusieurs minutes.' : 'Tip: one clearly visible person in both the video and the photo. Processing takes several minutes.'}</p>
      </div>}
      {tab === 'swap' && <div className="grid gap-4 sm:grid-cols-2"><Picker label={fr ? '1. Photo à transformer' : '1. Photo to transform'} value={target} onChange={setTarget} /><Picker label={fr ? '2. Nouveau visage' : '2. New face'} value={face} onChange={setFace} /></div>}
      {tab === 'image' && <div className="grid gap-3"><label className="grid gap-2 text-sm font-medium">{fr ? 'Décrivez votre image' : 'Describe your image'}<textarea className="min-h-24 rounded-md border border-input bg-background p-3 text-sm" maxLength={1000} value={prompt} onChange={(e) => setPrompt(e.target.value)} /></label>
        <label className="grid gap-2 text-sm font-medium">{fr ? 'Nombre d’images' : 'Number of images'}<select className="h-11 rounded-md border border-input bg-background px-3" value={count} onChange={(e) => setCount(Number(e.target.value))}>{[1, 2, 3, 4].map((n) => <option key={n}>{n}</option>)}</select></label></div>}
      {tab === 'talk' && <div className="grid gap-4 sm:grid-cols-2"><Picker label={fr ? 'Photo de la personne' : 'Photo of the person'} value={target} onChange={setTarget} />
        <div className="grid content-start gap-3"><label className="grid gap-2 text-sm font-medium">{fr ? 'Ce que la personne doit dire' : 'What the person should say'}<textarea className="min-h-32 rounded-md border border-input bg-background p-3 text-sm" maxLength={300} value={script} onChange={(e) => setScript(e.target.value)} /></label>
          <label className="grid gap-2 text-sm font-medium">{fr ? `Durée (max ${TALKING_PHOTO_MAX_SECONDS} s)` : `Length (max ${TALKING_PHOTO_MAX_SECONDS} s)`}<Input type="number" min={1} max={TALKING_PHOTO_MAX_SECONDS} value={seconds} onChange={(e) => setSeconds(Math.min(TALKING_PHOTO_MAX_SECONDS, Math.max(1, Number(e.target.value) || 1)))} /></label></div></div>}
      <p className="text-xs text-muted-foreground">{fr ? 'Utilisez uniquement des visages dont vous avez l’accord. Vos photos ne sont pas enregistrées par Weechat ; téléchargez le résultat, il expire au bout d’une heure.' : 'Only use faces you have consent for. Weechat does not store your photos; download the result, it expires after one hour.'}</p>
      <Button disabled={!AI_STUDIO_AVAILABLE || busy || (tab === 'body' && (!video || !face)) || (tab === 'swap' && (!target || !face)) || (tab === 'image' && prompt.trim().length < 3) || (tab === 'talk' && (!target || !script.trim()))}
        onClick={() => {
          if (tab === 'body') { if (!video || !face) return; const input = { video: video.data, characterImage: face }; void go('character_swap', () => body({ data: input })); }
          else if (tab === 'swap') { if (!target || !face) return; const input = { targetImage: target, faceImage: face }; void go('face_swap', () => swap({ data: input })); }
          else if (tab === 'image') void go('image_generation', () => gen({ data: { prompt, aspectRatio: '1:1', style: 'photo', count } }));
          else { if (!target) return; const input = { imageUrl: target, script, seconds }; void go('talking_photo', () => talk({ data: input })); }
        }}>
        {busy ? <><Loader2 className="animate-spin" />{fr ? 'Création en cours…' : 'Creating…'}</> : <>{fr ? 'Créer' : 'Create'} · {cost} {currency}</>}</Button>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {results && <div className="grid gap-3 sm:grid-cols-2">{results.urls.map((u) => <div key={u} className="grid gap-2">
        {results.video ? <video src={u} controls className="w-full rounded-xl" /> : <img src={u} alt="" className="w-full rounded-xl" />}
        <Button asChild variant="outline"><a href={u} target="_blank" rel="noreferrer"><Download />{fr ? 'Télécharger' : 'Download'}</a></Button></div>)}</div>}
    </section></>;
}
