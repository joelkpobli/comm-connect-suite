import { useDemo } from './provider';
import { uiCopy } from '@/lib/weechat/ui-copy';
import { whatsappLink, WHATSAPP_DISPLAY } from '@/lib/weechat/contact';

// Aide toujours accessible : ouvre WhatsApp vers le numéro du propriétaire du projet.
export function WhatsAppFloat() {
  const { locale } = useDemo();
  const tr = (text: string) => uiCopy(text, locale);
  const label = `${tr('Aide sur WhatsApp')} ${WHATSAPP_DISPLAY}`;
  return (
    <a className="wa-float" href={whatsappLink(locale)} target="_blank" rel="noreferrer" aria-label={label} title={label}>
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.5.5c-.2.2-.3.4-.1.7.2.3.9 1.5 2 2.4 1.4 1.2 2.5 1.6 2.9 1.8.3.2.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.4 0 .1 0 .7-.2 1.3Z" /></svg>
      <span>{tr('Aide')}</span>
    </a>
  );
}
