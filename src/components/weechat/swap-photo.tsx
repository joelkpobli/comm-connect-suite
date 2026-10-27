import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Upload, Check, Lock, ArrowRight, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTitle } from './shared';
import { useDemo } from './provider';
import { personas, backgrounds, checkImage } from '@/lib/weechat/persona-catalog';

/** Swap Photo studio: face + target selection stays in the browser; generation engine not connected yet. */
export function SwapPhotoPage() {
  const { locale } = useDemo(); const fr = locale === 'fr';
  const [face, setFace] = useState<string | null>(null);
  const [faceErr, setFaceErr] = useState<string | null>(null);
  const [rights, setRights] = useState(false);
  const [target, setTarget] = useState<string>(personas[0].id);
  const [bg, setBg] = useState<string>(backgrounds[0].id);
  const [tried, setTried] = useState(false);
  useEffect(() => () => { if (face) URL.revokeObjectURL(face); }, [face]);

  const onFile = (f?: File) => {
    if (!f) return;
    const r = checkImage(f);
    if (r !== 'ok') { setFaceErr(r === 'type' ? (fr ? 'Format accepté : JPG, PNG ou WebP.' : 'Accepted: JPG, PNG or WebP.') : (fr ? 'Image trop lourde (8 Mo max).' : 'Image too large (8 MB max).')); return; }
    setFaceErr(null); setTried(false);
    setFace(URL.createObjectURL(f));
  };
  const p = personas.find(x => x.id === target)!; const b = backgrounds.find(x => x.id === bg)!;
  const ready = !!face && rights;

  return <><PageTitle title="Swap Photo" subtitle={fr ? 'Placez un visage autorisé sur un personnage et un décor.' : 'Put an authorised face on a character and background.'} />
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="grid gap-6 content-start">
        <section className="rounded-lg border border-input p-4 grid gap-3">
          <h2 className="font-semibold">1. {fr ? 'Votre visage' : 'Your face'}</h2>
          <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-input p-4 hover:bg-muted">
            {face ? <img src={face} alt={fr ? 'Visage importé' : 'Uploaded face'} className="h-16 w-16 rounded-md object-cover" /> : <Upload className="text-muted-foreground" />}
            <span className="text-sm">{face ? (fr ? 'Changer de photo' : 'Change photo') : (fr ? 'Importer un portrait de face (JPG, PNG, WebP)' : 'Upload a front-facing portrait')}</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={e => onFile(e.target.files?.[0])} />
          </label>
          {faceErr && <p role="alert" className="text-sm text-destructive">{faceErr}</p>}
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={rights} onChange={e => setRights(e.target.checked)} className="mt-1" />
            {fr ? 'Il s’agit de mon visage ou j’ai l’autorisation de la personne. Aucune usurpation.' : 'This is my face or I have the person’s permission. No impersonation.'}</label>
          <p className="text-xs text-muted-foreground">{fr ? 'La photo reste dans votre navigateur ; rien n’est envoyé.' : 'The photo stays in your browser; nothing is sent.'}</p>
        </section>
        <section className="rounded-lg border border-input p-4 grid gap-3">
          <h2 className="font-semibold">2. {fr ? 'Personnage' : 'Character'}</h2>
          <div className="grid grid-cols-3 gap-2">{personas.map(x => <button key={x.id} type="button" onClick={() => setTarget(x.id)} aria-pressed={target === x.id} className={`relative rounded-md border p-1 ${target === x.id ? 'border-primary ring-2 ring-primary' : 'border-input'}`}><img src={x.src} alt="" className="mx-auto h-28 object-contain" />{target === x.id && <Check size={16} className="absolute right-1 top-1 text-primary" />}</button>)}</div>
        </section>
        <section className="rounded-lg border border-input p-4 grid gap-3">
          <h2 className="font-semibold">3. {fr ? 'Décor' : 'Background'}</h2>
          <div className="grid grid-cols-3 gap-2">{backgrounds.map(x => <button key={x.id} type="button" onClick={() => setBg(x.id)} aria-pressed={bg === x.id} className={`overflow-hidden rounded-md border ${bg === x.id ? 'border-primary ring-2 ring-primary' : 'border-input'}`}><img src={x.src} alt="" className="aspect-video w-full object-cover" /></button>)}</div>
        </section>
      </div>
      <section className="rounded-lg border border-input p-4 grid gap-4 content-start">
        <h2 className="font-semibold">{fr ? 'Aperçu de la composition' : 'Composition preview'}</h2>
        <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
          <img src={b.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <img src={p.src} alt="" className="absolute bottom-[3%] left-1/2 h-[86%] -translate-x-1/2 object-contain" />
          {face && <img src={face} alt="" className="absolute right-3 top-3 h-16 w-16 rounded-full border-2 border-primary object-cover" />}
        </div>
        <p className="text-xs text-muted-foreground">{fr ? 'Aperçu local : le visage n’est pas encore fusionné. La fusion sera faite par le moteur IA.' : 'Local preview: the face is not merged yet. Merging will be done by the AI engine.'}</p>
        <Button disabled={!ready} onClick={() => setTried(true)}><ImageIcon />{fr ? 'Générer la photo' : 'Generate photo'}</Button>
        {!ready && <p className="text-sm text-muted-foreground">{fr ? 'Importez un visage et cochez l’autorisation pour continuer.' : 'Upload a face and tick the permission to continue.'}</p>}
        {tried && <div role="alert" className="rounded-md border border-input p-3 text-sm grid gap-2">
          <span className="flex items-center gap-2 font-semibold"><Lock size={16} />{fr ? 'Moteur photo pas encore relié' : 'Photo engine not connected yet'}</span>
          <span className="text-muted-foreground">{fr ? 'Aucune image n’a été créée et aucun point n’a été retiré. Le moteur sera activé dès que la clé du fournisseur sera ajoutée.' : 'No image was created and no points were charged. The engine will be enabled once the provider key is added.'}</span>
        </div>}
        <p className="text-xs text-muted-foreground">{fr ? 'Tarif en points : à définir avant activation.' : 'Points price: to be set before activation.'} <Link to="/credits" className="underline">{fr ? 'Recharge' : 'Top up'} <ArrowRight size={12} className="inline" /></Link></p>
        <p className="text-xs text-muted-foreground">{p.credit} · {b.credit}</p>
      </section>
    </div></>;
}
