import { describe, it, expect } from 'vitest';
import { WHATSAPP_NUMBER, WHATSAPP_DISPLAY, whatsappLink } from '@/lib/weechat/contact';

describe('Contact d’aide réel (WhatsApp)', () => {
  it('utilise le numéro fourni par le propriétaire', () => {
    expect(WHATSAPP_NUMBER).toBe('+2290157685935');
    expect(WHATSAPP_DISPLAY).toBe('+229 01 57 68 59 35');
  });

  it('construit un lien wa.me sans séparateur ni signe', () => {
    expect(whatsappLink('fr').startsWith('https://wa.me/2290157685935?text=')).toBe(true);
    expect(whatsappLink('en').startsWith('https://wa.me/2290157685935?text=')).toBe(true);
  });

  it('prépare un message dans la langue de l’interface', () => {
    const fr = decodeURIComponent(whatsappLink('fr').split('text=')[1]!);
    const en = decodeURIComponent(whatsappLink('en').split('text=')[1]!);
    expect(fr).toContain('Bonjour');
    expect(en).toContain('Hello');
    expect(fr).not.toBe(en);
  });
});
