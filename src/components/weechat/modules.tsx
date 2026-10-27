import { Link } from '@tanstack/react-router';
import { ImageIcon, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTitle } from './shared';
import { useDemo } from './provider';
import { PersonaStudio } from './persona-studio';
import { LocalMediaPanel } from './local-media';
import { personas, backgrounds } from '@/lib/weechat/persona-catalog';

export function SwapLivePage() {
  const { locale } = useDemo(); const fr = locale === 'fr';
  return <><PageTitle title="Swap Live" subtitle={fr ? 'Caméra, persona et sortie vidéo plein écran pour OBS.' : 'Camera, persona and full-screen video output for OBS.'} />
    <div className="grid gap-6"><LocalMediaPanel name="Weechat" /><PersonaStudio /></div></>;
}

export function SwapPhotoPage() {
  const { locale } = useDemo(); const fr = locale === 'fr';
  return <><PageTitle title="Swap Photo" subtitle={fr ? 'Transformez une photo avec un visage autorisé.' : 'Transform a photo with an authorised face.'} />
    <section className="rounded-lg border border-input p-8 text-center grid gap-3 justify-items-center">
      <ImageIcon size={40} className="text-muted-foreground" />
      <span className="subtle-label">{fr ? 'BIENTÔT DISPONIBLE' : 'COMING SOON'}</span>
      <p className="max-w-md text-muted-foreground">{fr ? 'Ce module n’est pas encore construit. Aucun point ne sera déduit.' : 'This module is not built yet. No points will be charged.'}</p>
      <Button asChild variant="outline"><Link to="/avatars">{fr ? 'Voir le catalogue' : 'See the catalogue'} <ArrowRight /></Link></Button>
    </section></>;
}

export function AvatarsPage() {
  const { locale } = useDemo(); const fr = locale === 'fr';
  return <><PageTitle title={fr ? 'Catalogue d’avatars' : 'Avatar catalogue'} subtitle={fr ? 'Personnages et décors réels sous licence libre.' : 'Real, freely licensed characters and backgrounds.'} action={<Button asChild><Link to="/swap-live">{fr ? 'Utiliser dans Swap Live' : 'Use in Swap Live'} <ArrowRight /></Link></Button>} />
    <h2 className="mb-3 text-lg font-semibold">{fr ? 'Personnages' : 'Characters'}</h2>
    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">{personas.map(p => <figure key={p.id} className="rounded-lg border border-input p-3"><img src={p.src} alt="" className="mx-auto h-56 object-contain" loading="lazy" /><figcaption className="mt-2 text-xs text-muted-foreground">{p.credit}</figcaption></figure>)}</div>
    <h2 className="mb-3 text-lg font-semibold">{fr ? 'Décors' : 'Backgrounds'}</h2>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{backgrounds.map(b => <figure key={b.id} className="overflow-hidden rounded-lg border border-input"><img src={b.src} alt="" className="aspect-video w-full object-cover" loading="lazy" /><figcaption className="p-2 text-xs text-muted-foreground">{b.credit}</figcaption></figure>)}</div></>;
}
