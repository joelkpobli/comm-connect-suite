import { createFileRoute, Link } from '@tanstack/react-router';
import { Smartphone, Globe2, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemo } from '@/components/weechat/provider';
import { whatsappLink } from '@/lib/weechat/contact';

export const Route = createFileRoute('/numeros-virtuels')({
  head: () => ({ meta: [
    { title: 'Numéros virtuels bientôt disponibles · Weechat' },
    { name: 'description', content: 'Numéros virtuels internationaux pour WhatsApp et Telegram : bientôt disponibles sur Weechat.' },
    { property: 'og:title', content: 'Numéros virtuels bientôt disponibles · Weechat' },
    { property: 'og:description', content: 'Numéros virtuels internationaux pour WhatsApp et Telegram : bientôt disponibles sur Weechat.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
  ] }),
  component: VirtualNumbers,
});

function VirtualNumbers() {
  const { locale } = useDemo(); const fr = locale !== 'en';
  const items = fr
    ? [[Smartphone, 'Sans carte SIM', 'Activez WhatsApp ou Telegram sans puce physique.'], [Globe2, 'Plusieurs pays', 'France, États-Unis, Royaume-Uni, Canada et d’autres.'], [Lock, 'Vie privée', 'Gardez votre numéro personnel pour vous.']]
    : [[Smartphone, 'No SIM card', 'Activate WhatsApp or Telegram without a physical SIM.'], [Globe2, 'Many countries', 'France, USA, UK, Canada and more.'], [Lock, 'Privacy', 'Keep your personal number to yourself.']];
  return <div className="dl">
    <div><span className="dl-tag">{fr ? 'Bientôt disponible' : 'Coming soon'}</span>
      <h1>{fr ? 'Numéros virtuels' : 'Virtual numbers'} <span>{fr ? 'bientôt disponibles' : 'coming soon'}</span></h1>
      <p className="dl-lead">{fr ? 'Ce service sera bientôt disponible. Écrivez-nous pour être prévenu en priorité dès son ouverture.' : 'This service will be available soon. Message us to be notified first when it opens.'}</p></div>
    <div className="dl-steps">{items.map(([I, t, d]) => { const Icon = I as typeof Lock; return <div key={t as string} className="dl-card"><Icon size={22} /><h3>{t as string}</h3><p>{d as string}</p></div>; })}</div>
    <div className="lp-actions"><Button size="lg" asChild><a href={whatsappLink(locale)} target="_blank" rel="noreferrer">{fr ? 'Être prévenu sur WhatsApp' : 'Get notified on WhatsApp'}</a></Button><Button size="lg" variant="outline" asChild><Link to="/"><ArrowLeft />{fr ? 'Retour à l’accueil' : 'Back home'}</Link></Button></div>
  </div>;
}
