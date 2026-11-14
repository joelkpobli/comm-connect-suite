import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useDemo } from './provider';
import { legalPages, type LegalSlug } from '@/lib/weechat/legal-pages';

export function LegalPage({ slug }: { slug: LegalSlug }) {
  const { locale } = useDemo(); const p = legalPages[locale === 'en' ? 'en' : 'fr'][slug];
  return <article className="legal-page">
    <Link to="/" className="legal-back"><ArrowLeft size={18} />{locale === 'en' ? 'Back home' : 'Retour à l’accueil'}</Link>
    <h1>{p.title}</h1><p className="legal-intro">{p.intro}</p>
    {p.sections.map(([t, items]) => <section key={t}><h2>{t}</h2><ul>{items.map(i => <li key={i}>{i}</li>)}</ul></section>)}
  </article>;
}
