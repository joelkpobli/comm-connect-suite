import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Image as ImageIcon, Sparkles, MessageSquareText, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageTitle } from './shared';
import { useDemo } from './provider';
import { aiTokensQuery } from '@/lib/weechat/credits-query';
import { AI_TASK_PRICES, TALKING_PHOTO_MAX_SECONDS, type AiTaskKind } from '@/lib/weechat/ai-pricing';
import { startFaceSwapTask, startImageGenerationTask, startTalkingPhotoTask, getAiTaskStatus } from '@/lib/weechat/ai-tasks.functions';

type Tab = 'swap' | 'image' | 'talk';
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

export function SwapPhotoPage() {
  const { locale } = useDemo(); const fr = locale === 'fr';
  const qc = useQueryClient();
  const tokens = useQuery(aiTokensQuery);
  const [tab, setTab] = useState<Tab>('swap');
  const [target, setTarget] = useState<string | null>(null);
  const [face, setFace] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [count, setCount] = useState(1);
  const [script, setScript] = useState('');
  const [seconds, setSeconds] = useState(8);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ urls: string[]; video: boolean } | null>(null);
  const swap = useServerFn(startFaceSwapTask), gen = useServerFn(startImageGenerationTask), talk = useServerFn(startTalkingPhotoTask), status = useServerFn(getAiTaskStatus);

  const errors: Record<string, string> = fr
    ? { insufficient: 'Jetons IA insuffisants. Rechargez un pack.', provider_billing: 'Service IA momentanément indisponible. Vos jetons ont été remboursés.', provider_failed: 'La création a échoué. Vos jetons ont été remboursés.', provider_not_configured: 'Service IA indisponible.', failed: 'Une erreur est survenue.', timeout: 'Le traitement prend trop de temps. Réessayez plus tard.' }
    : { insufficient: 'Not enough AI tokens. Top up a pack.', provider_billing: 'AI service temporarily unavailable. Your tokens were refunded.', provider_failed: 'Creation failed. Your tokens were refunded.', provider_not_configured: 'AI service unavailable.', failed: 'Something went wrong.', timeout: 'Processing is taking too long. Try again later.' };

  async function go(kind: AiTaskKind, start: () => Promise<{ ok: true; providerJobId: string } | { ok: false; error: string }>) {
    setBusy(true); setError(null); setResults(null);
    try {
      const r = await start();
      qc.invalidateQueries({ queryKey: aiTokensQuery.queryKey });
      if (!r.ok) { setError(errors[r.error] ?? errors['failed']!); return; }
      for (let i = 0; i < 120; i++) {
        await new Promise((s) => setTimeout(s, i < 5 ? 2000 : 5000));
        const s = await status({ data: { kind, providerJobId: r.providerJobId } });
        if (s.state === 'completed') { setResults({ urls: ('resultUrls' in s && s.resultUrls) || [], video: kind === 'talking_photo' }); return; }
        if (s.state === 'failed') { setError(errors['provider_failed']!); return; }
      }
      setError(errors['timeout']!);
    } catch { setError(errors['failed']!); } finally { setBusy(false); }
  }

  const tabs: [Tab, string, typeof ImageIcon, string][] = [
    ['swap', 'Swap Photo', ImageIcon, `${AI_TASK_PRICES.faceSwapPerPhoto} ${fr ? 'jetons / photo' : 'tokens / photo'}`],
    ['image', fr ? 'Créer une image' : 'Create an image', Sparkles, `${AI_TASK_PRICES.imagePerUnit} ${fr ? 'jetons / image' : 'tokens / image'}`],
    ['talk', fr ? 'Photo parlante' : 'Talking photo', MessageSquareText, `${AI_TASK_PRICES.talkingPhotoPerSecond} ${fr ? 'jetons / seconde' : 'tokens / second'}`],
  ];
  const cost = tab === 'swap' ? AI_TASK_PRICES.faceSwapPerPhoto : tab === 'image' ? count * AI_TASK_PRICES.imagePerUnit : seconds * AI_TASK_PRICES.talkingPhotoPerSecond;

  return <><PageTitle title={fr ? 'Studio IA' : 'AI Studio'} subtitle={fr ? 'Changez un visage sur une photo, créez des images ou faites parler une photo.' : 'Swap a face in a photo, create images or make a photo talk.'}
      action={<span className="rounded-full border border-border px-3 py-1 text-sm">{tokens.data ?? '…'} {fr ? 'jetons IA' : 'AI tokens'}</span>} />
    <div className="grid gap-2 sm:grid-cols-3">{tabs.map(([id, label, Icon, price]) =>
      <button key={id} type="button" onClick={() => { setTab(id); setResults(null); setError(null); }} className={`flex min-h-11 items-center gap-3 rounded-xl border p-3 text-left transition ${tab === id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
        <Icon className="text-primary" size={20} /><span><strong className="block text-sm">{label}</strong><small className="text-muted-foreground">{price}</small></span></button>)}</div>

    <section className="mt-6 grid gap-5 rounded-2xl border border-border p-5">
      {tab === 'swap' && <div className="grid gap-4 sm:grid-cols-2"><Picker label={fr ? '1. Photo à transformer' : '1. Photo to transform'} value={target} onChange={setTarget} /><Picker label={fr ? '2. Nouveau visage' : '2. New face'} value={face} onChange={setFace} /></div>}
      {tab === 'image' && <div className="grid gap-3"><label className="grid gap-2 text-sm font-medium">{fr ? 'Décrivez votre image' : 'Describe your image'}<textarea className="min-h-24 rounded-md border border-input bg-background p-3 text-sm" maxLength={1000} value={prompt} onChange={(e) => setPrompt(e.target.value)} /></label>
        <label className="grid gap-2 text-sm font-medium">{fr ? 'Nombre d’images' : 'Number of images'}<select className="h-11 rounded-md border border-input bg-background px-3" value={count} onChange={(e) => setCount(Number(e.target.value))}>{[1, 2, 3, 4].map((n) => <option key={n}>{n}</option>)}</select></label></div>}
      {tab === 'talk' && <div className="grid gap-4 sm:grid-cols-2"><Picker label={fr ? 'Photo de la personne' : 'Photo of the person'} value={target} onChange={setTarget} />
        <div className="grid content-start gap-3"><label className="grid gap-2 text-sm font-medium">{fr ? 'Ce que la personne doit dire' : 'What the person should say'}<textarea className="min-h-32 rounded-md border border-input bg-background p-3 text-sm" maxLength={300} value={script} onChange={(e) => setScript(e.target.value)} /></label>
          <label className="grid gap-2 text-sm font-medium">{fr ? `Durée (max ${TALKING_PHOTO_MAX_SECONDS} s)` : `Length (max ${TALKING_PHOTO_MAX_SECONDS} s)`}<Input type="number" min={1} max={TALKING_PHOTO_MAX_SECONDS} value={seconds} onChange={(e) => setSeconds(Math.min(TALKING_PHOTO_MAX_SECONDS, Math.max(1, Number(e.target.value) || 1)))} /></label></div></div>}
      <p className="text-xs text-muted-foreground">{fr ? 'Utilisez uniquement des visages dont vous avez l’accord. Vos photos ne sont pas enregistrées par Weechat ; téléchargez le résultat, il expire au bout d’une heure.' : 'Only use faces you have consent for. Weechat does not store your photos; download the result, it expires after one hour.'}</p>
      <Button disabled={busy || (tab === 'swap' && (!target || !face)) || (tab === 'image' && prompt.trim().length < 3) || (tab === 'talk' && (!target || !script.trim()))}
        onClick={() => tab === 'swap' ? go('face_swap', () => swap({ data: { targetImage: target!, faceImage: face! } }))
          : tab === 'image' ? go('image_generation', () => gen({ data: { prompt, aspectRatio: '1:1', style: 'photo', count } }))
          : go('talking_photo', () => talk({ data: { imageUrl: target!, script, seconds } }))}>
        {busy ? <><Loader2 className="animate-spin" />{fr ? 'Création en cours…' : 'Creating…'}</> : <>{fr ? 'Créer' : 'Create'} · {cost} {fr ? 'jetons' : 'tokens'}</>}</Button>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {results && <div className="grid gap-3 sm:grid-cols-2">{results.urls.map((u) => <div key={u} className="grid gap-2">
        {results.video ? <video src={u} controls className="w-full rounded-xl" /> : <img src={u} alt="" className="w-full rounded-xl" />}
        <Button asChild variant="outline"><a href={u} target="_blank" rel="noreferrer"><Download />{fr ? 'Télécharger' : 'Download'}</a></Button></div>)}</div>}
    </section></>;
}
