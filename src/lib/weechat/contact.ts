// Coordonnées d'aide réelles de Weechat (fournies par le propriétaire du projet).
// Le numéro est unique et sert de point de contact WhatsApp sur tous les écrans.
export const WHATSAPP_NUMBER = '+2290157685935';
export const WHATSAPP_DISPLAY = '+229 01 57 68 59 35';

const PREFILL: Record<'fr' | 'en', string> = {
  fr: "Bonjour Weechat, j'ai besoin d'aide.",
  en: 'Hello Weechat, I need help.',
};

export function whatsappLink(locale: 'fr' | 'en' = 'fr'): string {
  const digits = WHATSAPP_NUMBER.replace(/\D/g, '');
  const message = PREFILL[locale] ?? PREFILL.fr;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
