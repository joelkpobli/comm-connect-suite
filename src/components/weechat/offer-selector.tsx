import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Check, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Currency, Plan } from '@/lib/weechat/landing-copy';
export function OfferSelector({ plans, currency, locale, action }: {
  plans: Plan[]; currency: Currency; locale: 'fr' | 'en'; action?: (plan: Plan) => React.ReactNode;
}) {
  const [selectedId, setSelectedId] = useState(() => plans.find(p => p.popular)?.id ?? plans[0]?.id);
  const selected = plans.find(p => p.id === selectedId) ?? plans.find(p => p.popular) ?? plans[0];
  if (!selected) return null;
  const fr = locale === 'fr';
  const unit = currency === 'XOF' ? 'FCFA' : currency === 'EUR' ? '€' : '$';
  return <div className="offer-selector">
    <div className="offer-list" role="group" aria-label={fr ? 'Choisir une offre' : 'Choose an offer'}>
      {plans.map(p => <Button key={p.id} variant="ghost" aria-pressed={p.id === selected.id} className="offer-option" onClick={() => setSelectedId(p.id)}>
        <span className="offer-name">{p.name}{p.popular && <small>{fr ? 'Recommandé' : 'Recommended'}</small>}</span>
        <span className="offer-cost">{p.price[currency]} <small>{unit}</small></span>
        <Check size={16} className={p.id === selected.id ? 'opacity-100' : 'opacity-0'} />
      </Button>)}
    </div>
    <section className="offer-detail" aria-label={selected.name} aria-live="polite">
      <div className="offer-detail-heading"><h3>{selected.name}</h3><span><Clock size={14} />{selected.validity} {fr ? 'jours' : 'days'}</span></div>
      <ul>{selected.lines[locale].map(line => <li key={line}><Check size={16} /><span>{line}</span></li>)}</ul>
      {action ? action(selected) : <Button asChild variant="outline"><Link to="/credits">{fr ? 'Choisir cette offre' : 'Choose this offer'}<ArrowRight size={16} /></Link></Button>}
    </section>
  </div>;
}