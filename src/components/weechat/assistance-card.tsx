import { ArrowUpRight, Headset } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemo } from './provider';
import { uiCopy } from '@/lib/weechat/ui-copy';
import { WHATSAPP_DISPLAY, whatsappLink } from '@/lib/weechat/contact';

// Carte d'aide présente sur les écrans du compte : le numéro WhatsApp du
// propriétaire du projet est le seul point de contact, dans la langue de l'interface.
export function AssistanceCard() {
  const { locale } = useDemo();
  const tr = (text: string) => uiCopy(text, locale);
  return (
    <section className="assist-card" aria-labelledby="assist-title">
      <span className="assist-icon" aria-hidden="true"><Headset size={25} /></span>
      <div className="assist-text">
        <h2 id="assist-title">{tr('Besoin d’aide ?')}</h2>
        <p>{tr('Notre équipe vous répond sur WhatsApp, en français ou en anglais.')}</p>
        <p className="assist-number"><span>{tr('Numéro WhatsApp')}</span><strong>{WHATSAPP_DISPLAY}</strong></p>
      </div>
      <Button asChild className="assist-cta">
        <a href={whatsappLink(locale)} target="_blank" rel="noreferrer">{tr('Écrire sur WhatsApp')} <ArrowUpRight /></a>
      </Button>
    </section>
  );
}
