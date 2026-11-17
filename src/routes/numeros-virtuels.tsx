import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { VirtualNumbersOffer } from '@/components/weechat/virtual-numbers-offer';
import { Button } from '@/components/ui/button';
import { useDemo } from '@/components/weechat/provider';
import { whatsappLink } from '@/lib/weechat/contact';

export const Route = createFileRoute('/numeros-virtuels')({
  head: () => ({ meta: [
    { title: 'Numéros virtuels internationaux · Weechat' },
    { name: 'description', content: 'Numéros virtuels internationaux pour WhatsApp et Telegram, sans carte SIM, paiement Mobile Money.' },
    { property: 'og:title', content: 'Numéros virtuels internationaux · Weechat' },
    { property: 'og:description', content: 'Numéros virtuels internationaux pour WhatsApp et Telegram, sans carte SIM, paiement Mobile Money.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
  ] }),
  component: VirtualNumbers,
});

function VirtualNumbers() {
  const { locale } = useDemo(); const fr = locale !== 'en';
  return <div className="dl">
    <div><span className="dl-tag">{fr ? 'Disponible' : 'Available'}</span>
      <h1>{fr ? 'Numéros virtuels' : 'Virtual numbers'} <span>{fr ? 'internationaux' : 'worldwide'}</span></h1></div>
    <VirtualNumbersOffer />
    <div className="lp-actions"><Button size="lg" variant="outline" asChild><a href={whatsappLink(locale)} target="_blank" rel="noreferrer">{fr ? 'Besoin d’aide ? Nous contacter' : 'Need help? Contact us'}</a></Button><Button size="lg" variant="ghost" asChild><Link to="/"><ArrowLeft />{fr ? 'Retour à l’accueil' : 'Back home'}</Link></Button></div>
  </div>;
}
