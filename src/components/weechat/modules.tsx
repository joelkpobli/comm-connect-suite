import { AppearanceStudio } from './appearance-studio';
import { faces } from '@/lib/weechat/persona-catalog';
import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTitle } from './shared';
import { useDemo } from './provider';
import { usagePolicy } from '@/lib/weechat/feature-status';

export function SwapLivePage() {
  const { locale } = useDemo(); const fr = locale === 'fr';
  const steps = fr ? [
    ['Installez Weechat pour Windows', 'Un seul installateur : l’application et la caméra virtuelle « Weechat Camera » sont prêtes en quelques minutes.'],
    ['Choisissez votre avatar', 'Sélectionnez un visage du catalogue ou votre propre photo autorisée, puis votre webcam, et cliquez « Démarrer ».'],
    ['Appelez avec votre avatar', 'Dans WhatsApp, Zoom, Teams, Google Meet ou TikTok Live, choisissez « Weechat Camera » comme caméra.'],
  ] : [
    ['Install Weechat for Windows', 'One installer: the app and the “Weechat Camera” virtual camera are ready in minutes.'],
    ['Choose your avatar', 'Pick a catalogue face or your own authorised photo, then your webcam, and click “Start”.'],
    ['Call with your avatar', 'In WhatsApp, Zoom, Teams, Google Meet or TikTok Live, select “Weechat Camera” as your camera.'],
  ];
  return <><PageTitle title="Swap Live" subtitle={fr ? 'Votre avatar en direct dans tous vos appels vidéo.' : 'Your live avatar in all your video calls.'} />
    <section className="grid gap-5 border-y border-border py-6">
      <ol className="grid gap-4 md:grid-cols-3">{steps.map(([t, d], i) => <li key={t} className="rounded-lg border border-border bg-card p-5"><span className="text-sm font-semibold text-primary">{fr ? 'Étape' : 'Step'} {i + 1}</span><h2 className="mt-1 text-lg font-semibold">{t}</h2><p className="mt-2 text-sm text-muted-foreground">{d}</p></li>)}</ol>
      <p className="text-sm">{fr ? `Tarif : ${usagePolicy.swapPointsPerSecond} points par seconde d’appel, décomptés depuis votre solde Weechat. Vous êtes prévenu avant que votre solde soit épuisé.` : `Rate: ${usagePolicy.swapPointsPerSecond} points per second of call, deducted from your Weechat balance. You are alerted before your balance runs out.`}</p>
      <div className="flex flex-wrap gap-3"><Button asChild><Link to="/telecharger" hash="swap">{fr ? 'Télécharger l’application Windows' : 'Download the Windows app'}<ArrowRight /></Link></Button><Button asChild variant="outline"><Link to="/avatars">{fr ? 'Voir les avatars' : 'View avatars'}</Link></Button></div>
    </section></>;
}

export function AvatarsPage() {
  const { locale } = useDemo(); const fr = locale === 'fr';
  return <><PageTitle title={fr ? 'Bibliothèque d’apparence' : 'Appearance library'} subtitle={fr ? 'Choisissez un avatar et un décor réels, ajustez le cadrage. Gratuit, enregistré automatiquement.' : 'Pick a real avatar and setting, adjust the framing. Free and saved automatically.'} action={<Button asChild variant="outline"><Link to="/telecharger" hash="swap">{fr ? 'Guide des photos autorisées' : 'Authorised photo guide'} <ArrowRight /></Link></Button>} />
    <AppearanceStudio />
    <section className="mt-10 grid gap-3"><h2 className="text-xl font-semibold">{fr ? 'Visages pour le Swap Live' : 'Faces for Swap Live'}</h2>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">{faces.map(p => <figure key={p.id} className="overflow-hidden rounded-lg border border-input"><img src={p.src} alt="" className="aspect-[4/5] w-full object-cover" loading="lazy" /></figure>)}</div></section></>;
}

export { SwapPhotoPage } from './swap-photo';
