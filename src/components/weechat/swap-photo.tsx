import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Upload, Check, Lock, ArrowRight, Sparkles, ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTitle } from './shared';
import { useDemo } from './provider';
import { faces, checkImage } from '@/lib/weechat/persona-catalog';

type Slot = { url: string; own: boolean } | null;

function useObjectUrl() {
  const [slot, setSlot] = useState<Slot>(null);
  useEffect(() => () => { if (slot?.own) URL.revokeObjectURL(slot.url); }, [slot]);
  return [slot, setSlot] as const;
}

/** Swap Photo (facEvo model): source photo + target face; the AI engine merges them. Not connected yet. */
export function SwapPhotoPage() {
  const { locale } = useDemo(); const fr = locale === 'fr';
  const [photo, setPhoto] = useObjectUrl();
  const [face, setFace] = useObjectUrl();
  const [err, setErr] = useState<string | null>(null);
  const [rights, setRights] = useState(false);
  const [tried, setTried] = useState(false);

  const load = (f: File | undefined, set: (s: Slot) => void) => {
    if (!f) return;
    const r = checkImage(f);
    if (r !== 'ok') { setErr(r === 'type' ? (fr ? 'Format accepté : JPG, PNG ou WebP.' : 'Accepted: JPG, PNG or WebP.') : (fr ? 'Image trop lourde (8 Mo max).' : 'Image too large (8 MB max).')); return; }
    setErr(null); setTried(false); set({ url: URL.createObjectURL(f), own: true });
  };
  const ready = !!photo && !!face && rights;

  const Drop = ({ slot, set, title, hint }: { slot: Slot; set: (s: Slot) => void; title: string; hint: string }) => (
    <div className="grid gap-2">
      <span className="text-sm font-semibold">{title}</span>
      <label className="relative flex aspect-[4/5] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border border-dashed border-input bg-muted/40 text-center hover:bg-muted">
        {slot ? <img src={slot.url} alt={title} className="absolute inset-0 h-full w-full object-cover" /> : <><ImagePlus className="text-muted-foreground" /><span className="px-3 text-xs text-muted-foreground">{hint}</span></>}
        <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={e => load(e.target.files?.[0], set)} />
      </label>
      {slot && <button type="button" onClick={() => set(null)} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><X size={12} />{fr ? 'Retirer' : 'Remove'}</button>}
    </div>
  );

  return <><PageTitle title="Swap Photo" subtitle={fr ? 'Mettez le visage de votre choix sur une photo, en quelques secondes.' : 'Put the face of your choice on a photo, in seconds.'} />
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="grid content-start gap-6">
        <section className="grid gap-4 rounded-lg border border-input p-4">
          <div className="grid grid-cols-2 gap-4">
            <Drop slot={photo} set={setPhoto} title={fr ? '1. Votre photo' : '1. Your photo'} hint={fr ? 'La photo à transformer (corps, pose, décor)' : 'The photo to transform'} />
            <Drop slot={face} set={setFace} title={fr ? '2. Visage souhaité' : '2. Target face'} hint={fr ? 'Importez un visage ou choisissez-en un ci-dessous' : 'Upload a face or pick one below'} />
          </div>
          {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={rights} onChange={e => setRights(e.target.checked)} className="mt-1" />
            {fr ? 'J’ai le droit d’utiliser ces visages (le mien, un modèle libre ou une personne consentante). Aucune usurpation.' : 'I have the right to use these faces. No impersonation.'}</label>
        </section>
        <section className="grid gap-3 rounded-lg border border-input p-4">
          <h2 className="font-semibold">{fr ? 'Visages prêts à l’emploi' : 'Ready-made faces'}</h2>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {faces.map(x => { const on = face?.url === x.src; return (
              <button key={x.id} type="button" onClick={() => { setFace({ url: x.src, own: false }); setTried(false); }} aria-pressed={on} aria-label={fr ? 'Choisir ce visage' : 'Pick this face'}
                className={`relative overflow-hidden rounded-md border ${on ? 'border-primary ring-2 ring-primary' : 'border-input'}`}>
                <img src={x.src} alt="" loading="lazy" className="aspect-[4/5] w-full object-cover" />
                {on && <Check size={16} className="absolute right-1 top-1 rounded-full bg-primary text-primary-foreground" />}
              </button>); })}
          </div>
          <p className="text-xs text-muted-foreground">{fr ? 'Photos réelles Pexels, licence libre.' : 'Real Pexels photos, free licence.'}</p>
        </section>
      </div>
      <section className="grid content-start gap-4 rounded-lg border border-input p-4">
        <h2 className="font-semibold">{fr ? 'Résultat' : 'Result'}</h2>
        <div className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-md bg-muted text-center text-sm text-muted-foreground">
          {photo ? <img src={photo.url} alt="" className="h-full w-full object-cover opacity-60" /> : <span className="px-6">{fr ? 'La photo transformée apparaîtra ici.' : 'The transformed photo will appear here.'}</span>}
        </div>
        <Button disabled={!ready} onClick={() => setTried(true)}><Sparkles />{fr ? 'Lancer le swap' : 'Run swap'}</Button>
        {!ready && <p className="text-sm text-muted-foreground">{fr ? 'Ajoutez une photo, un visage et cochez l’autorisation.' : 'Add a photo, a face and tick the permission.'}</p>}
        {tried && <div role="alert" className="grid gap-2 rounded-md border border-input p-3 text-sm">
          <span className="flex items-center gap-2 font-semibold"><Lock size={16} />{fr ? 'Moteur photo pas encore relié' : 'Photo engine not connected yet'}</span>
          <span className="text-muted-foreground">{fr ? 'Aucune image créée, aucun point retiré. Le moteur IA sera activé dès que sa clé sera ajoutée.' : 'No image created, no points charged. The AI engine will be enabled once its key is added.'}</span>
        </div>}
        <p className="flex items-center gap-1 text-xs text-muted-foreground"><Upload size={12} />{fr ? 'Vos photos restent dans votre navigateur.' : 'Your photos stay in your browser.'}</p>
        <p className="text-xs text-muted-foreground">{fr ? '2 points par photo une fois le moteur actif.' : '2 points per photo once the engine is live.'} <Link to="/credits" className="underline">{fr ? 'Recharge' : 'Top up'} <ArrowRight size={12} className="inline" /></Link></p>
      </section>
    </div></>;
}
