import { Smartphone, Globe2, Lock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemo } from './provider';
import { virtualNumbersAffiliateUrl } from '@/lib/weechat/virtual-numbers';

export function VirtualNumbersOffer({ compact = false }: { compact?: boolean }) {
  const { locale } = useDemo(); const fr = locale !== 'en';
  const items = fr
    ? [[Smartphone, 'Sans carte SIM', 'Recevez le code SMS pour activer WhatsApp, Telegram ou TikTok.'], [Globe2, 'Plus de 150 pays', 'France, États-Unis, Royaume-Uni, Canada et bien d’autres.'], [Lock, 'Vie privée', 'Gardez votre numéro personnel pour vous.']]
    : [[Smartphone, 'No SIM card', 'Receive the SMS code to activate WhatsApp, Telegram or TikTok.'], [Globe2, '150+ countries', 'France, USA, UK, Canada and many more.'], [Lock, 'Privacy', 'Keep your personal number to yourself.']];
  return <div className="space-y-6">
    {!compact && <p className="dl-lead">{fr ? 'Aucun compte Weechat requis. Choisissez le pays et l’application, payez chez notre partenaire et recevez votre code.' : 'No Weechat account needed. Pick a country and app, pay with our partner and receive your code.'}</p>}
    <div className="dl-steps">{items.map(([I, t, d]) => { const Icon = I as typeof Lock; return <div key={t as string} className="dl-card"><Icon size={22} /><h3>{t as string}</h3><p>{d as string}</p></div>; })}</div>
    <div className="lp-actions"><Button size="lg" asChild><a href={virtualNumbersAffiliateUrl} target="_blank" rel="noopener sponsored">{fr ? 'Obtenir un numéro virtuel' : 'Get a virtual number'} <ExternalLink /></a></Button></div>
    <p className="text-sm text-muted-foreground">{fr ? 'Service fourni par notre partenaire SMS-Activate : paiement, numéro et code sont gérés sur son site. Usage légal uniquement.' : 'Service provided by our partner SMS-Activate: payment, number and code are handled on its site. Lawful use only.'}</p>
  </div>;
}
