import { faces } from '@/lib/weechat/persona-catalog';
import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTitle } from './shared';
import { useDemo } from './provider';
import { FaceTracker } from './face-tracker';

export function SwapLivePage() {
  const { locale } = useDemo(); const fr = locale === 'fr';
  return <><PageTitle title="Swap Live" subtitle={fr ? 'Votre webcam, un visage cible qui suit vos mouvements, et le plein écran.' : 'Your webcam, a target face following your moves, and full screen.'} />
    <div className="grid gap-6"><FaceTracker /></div></>;
}

export function AvatarsPage() {
  const { locale } = useDemo(); const fr = locale === 'fr';
  return <><PageTitle title={fr ? 'Catalogue d’avatars' : 'Avatar catalogue'} subtitle={fr ? 'Visages réels sous licence libre, prêts pour le swap.' : 'Real, freely licensed faces ready to swap.'} action={<Button asChild><Link to="/swap-photo">{fr ? 'Utiliser dans Swap Photo' : 'Use in Swap Photo'} <ArrowRight /></Link></Button>} />
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">{faces.map(p => <figure key={p.id} className="overflow-hidden rounded-lg border border-input"><img src={p.src} alt="" className="aspect-[4/5] w-full object-cover" loading="lazy" /><figcaption className="p-2 text-[10px] text-muted-foreground">{p.credit}</figcaption></figure>)}</div></>;
}

export { SwapPhotoPage } from './swap-photo';
