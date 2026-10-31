import { faces } from '@/lib/weechat/persona-catalog';
import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTitle } from './shared';
import { useDemo } from './provider';
import { usagePolicy } from '@/lib/weechat/feature-status';

export function SwapLivePage() {
  const { locale } = useDemo(); const fr = locale === 'fr';
  return <><PageTitle title="Swap Live" subtitle={fr ? 'Changement de visage : moteur Windows, pas une animation de photo dans le navigateur.' : 'Face replacement: Windows engine, not a browser photo animation.'} />
    <section className="grid gap-5 border-y border-border py-6">
      <h2 className="text-xl font-semibold">{fr ? 'Essai Windows distinct du compte Weechat' : 'Windows trial separate from your Weechat account'}</h2>
      <p className="text-muted-foreground">{fr ? 'Le moteur local utilise votre webcam et une photo de visage autorisée. Il ne se connecte pas encore à votre compte, ne vérifie pas votre solde et ne retire aucun point.' : 'The local engine uses your webcam and an authorised face photo. It does not yet sign into your account, check your balance or debit points.'}</p>
      <p className="text-sm">{fr ? `Tarif prévu : ${usagePolicy.swapPointsPerSecond} points/s. Le décompte sécurisé et l’arrêt sur solde insuffisant ne sont pas encore reliés au moteur Windows.` : `Planned rate: ${usagePolicy.swapPointsPerSecond} points/s. Secure billing and stopping on insufficient balance are not yet connected to the Windows engine.`}</p>
      <p className="text-sm text-muted-foreground">{fr ? 'Qualité, fluidité, caméra virtuelle et droits commerciaux du modèle restent à valider avant lancement commercial. Aucun appel compatible n’est garanti.' : 'Quality, frame rate, virtual camera and commercial model rights must be validated before commercial release. Call compatibility is not guaranteed.'}</p>
      <div className="flex flex-wrap gap-3"><Button asChild><Link to="/telecharger" hash="swap">{fr ? 'Installation et utilisation Windows' : 'Windows setup and usage'}<ArrowRight /></Link></Button><Button asChild variant="outline"><Link to="/avatars">{fr ? 'Voir les visages du catalogue' : 'View catalogue faces'}</Link></Button></div>
    </section></>;

}

export function AvatarsPage() {
  const { locale } = useDemo(); const fr = locale === 'fr';
  return <><PageTitle title={fr ? 'Catalogue d’avatars' : 'Avatar catalogue'} subtitle={fr ? 'Visages réels sous licence libre, prêts pour le swap.' : 'Real, freely licensed faces ready to swap.'} action={<Button asChild variant="outline"><Link to="/telecharger" hash="swap">{fr ? 'Guide des photos autorisées' : 'Authorised photo guide'} <ArrowRight /></Link></Button>} />
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">{faces.map(p => <figure key={p.id} className="overflow-hidden rounded-lg border border-input"><img src={p.src} alt="" className="aspect-[4/5] w-full object-cover" loading="lazy" /><figcaption className="p-2 text-[10px] text-muted-foreground">{p.credit}</figcaption></figure>)}</div></>;
}

export { SwapPhotoPage } from './swap-photo';
