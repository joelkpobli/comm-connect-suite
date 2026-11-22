import { useState, type FormEvent } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDemo } from './provider';
import { contactSchema } from '@/lib/weechat/contact.functions';
import { whatsappLink, WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from '@/lib/weechat/contact';

const copy = {
  fr: { title: 'Contact et suggestions', sub: 'Une question, un problème ou une idée pour améliorer Weechat ? Écrivez-nous.', kind: 'Sujet', kinds: { question: 'Question', suggestion: 'Suggestion', probleme: 'Problème', partenariat: 'Partenariat' }, name: 'Votre nom', contact: 'E-mail ou numéro WhatsApp', message: 'Votre message', send: 'Envoyer sur WhatsApp', sending: 'Envoi…', ok: 'WhatsApp s’ouvre avec votre message : appuyez sur Envoyer dans WhatsApp.', err: 'Vérifiez les champs : message de 5 caractères minimum.', fail: 'Envoi impossible pour le moment. Essayez WhatsApp.', wa: 'Ou écrivez-nous sur WhatsApp' },
  en: { title: 'Contact and suggestions', sub: 'A question, a problem or an idea to improve Weechat? Write to us.', kind: 'Topic', kinds: { question: 'Question', suggestion: 'Suggestion', probleme: 'Problem', partenariat: 'Partnership' }, name: 'Your name', contact: 'Email or WhatsApp number', message: 'Your message', send: 'Send on WhatsApp', sending: 'Sending…', ok: 'WhatsApp is opening with your message: tap Send in WhatsApp.', err: 'Check the fields: message must be at least 5 characters.', fail: 'Sending failed for now. Try WhatsApp.', wa: 'Or message us on WhatsApp' },
} as const;
type Kind = keyof typeof copy.fr.kinds;

export function ContactPage() {
  const { locale } = useDemo(); const c = copy[locale === 'en' ? 'en' : 'fr'];
  const [form, setForm] = useState({ kind: 'question' as Kind, name: '', contact: '', message: '', website: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'err' | 'fail'>('idle');
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm(f => ({ ...f, [k]: e.target.value }));
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) return setState('err');
    const d = parsed.data;
    const text = `*Weechat — ${c.kinds[d.kind as Kind]}*\n${c.name} : ${d.name}\n${c.contact} : ${d.contact}\n\n${d.message}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    const win = window.open(url, '_blank', 'noopener');
    if (!win) window.location.href = url;
    setState('ok');
  }
  const field = 'w-full rounded-md border border-input bg-background px-3 py-2 text-base';
  return <section className="mx-auto max-w-2xl px-4 py-12">
    <h1 className="text-3xl font-bold">{c.title}</h1>
    <p className="mt-2 text-lg text-muted-foreground">{c.sub}</p>
    <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-xl border border-border bg-card p-6">
      <label className="block space-y-1"><span className="font-medium">{c.kind}</span>
        <select className={field} value={form.kind} onChange={set('kind')}>{(Object.keys(c.kinds) as Kind[]).map(k => <option key={k} value={k}>{c.kinds[k]}</option>)}</select></label>
      <label className="block space-y-1"><span className="font-medium">{c.name}</span><Input required maxLength={100} value={form.name} onChange={set('name')} /></label>
      <label className="block space-y-1"><span className="font-medium">{c.contact}</span><Input required maxLength={255} value={form.contact} onChange={set('contact')} /></label>
      <label className="block space-y-1"><span className="font-medium">{c.message}</span><textarea required minLength={5} maxLength={2000} rows={6} className={field} value={form.message} onChange={set('message')} /></label>
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={form.website} onChange={set('website')} />
      <Button type="submit" disabled={state === 'sending'}><Send className="mr-1 size-4" />{state === 'sending' ? c.sending : c.send}</Button>
      {state === 'ok' && <p role="status" className="text-primary">{c.ok}</p>}
      {(state === 'err' || state === 'fail') && <p role="alert" className="text-destructive">{c[state]}</p>}
    </form>
    <a href={whatsappLink(locale === 'en' ? 'en' : 'fr')} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 underline-offset-4 hover:underline"><MessageCircle className="size-4" />{c.wa} · {WHATSAPP_DISPLAY}</a>
  </section>;
}
