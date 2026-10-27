import { useState } from 'react';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { creditsQuery } from '@/lib/weechat/credits-query';
import { Link } from '@tanstack/react-router';
import { ArrowRight, AudioLines, Check, Clock, Coins, History, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTitle, DemoModal, Notice } from './shared';
import { useDemo } from './provider';
import { formatCredits } from '@/lib/weechat/demo-data';
import { swapPlans, audioPlans, type Currency, type Plan } from '@/lib/weechat/landing-copy';

/** Audio minutes have no persisted ledger yet: the counter is shown honestly at zero. */
export const AUDIO_MINUTES_AVAILABLE = 0;

const sym = (c: Currency) => (c === 'XOF' ? 'FCFA' : c === 'EUR' ? '€' : '$');

/** Two separate balances (points + audio minutes) for the member header. */
export function BalanceChips() {
  const { locale } = useDemo();
  const { data } = useQuery(creditsQuery);
  const en = locale === 'en';
  return <div className="balance-chips" aria-label={en ? 'Your balances' : 'Vos soldes'}>
    <Link to="/credits" className="balance-chip" title={en ? 'Points (Swap Live, Restyle, Photo)' : 'Points (Swap Live, Restyle, Photo)'}><Coins size={15} /><strong>{data ? formatCredits(data.totals.balance) : '…'}</strong><span>pts</span></Link>
    <Link to="/credits" hash="audio" className="balance-chip" title={en ? 'Audio translation minutes' : 'Minutes de traduction audio'}><AudioLines size={15} /><strong>{AUDIO_MINUTES_AVAILABLE}</strong><span>min</span></Link>
  </div>;
}

export function CreditsPage() {
  const { purchase, locale } = useDemo();
  const en = locale === 'en';
  const { data: real } = useSuspenseQuery(creditsQuery);
  const [cur, setCur] = useState<Currency>('XOF');
  const [selected, setSelected] = useState<Plan>(swapPlans[2]);
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const isAudio = selected.audioMin != null;
  const qty = isAudio ? `${selected.audioMin} min` : `${formatCredits(selected.points ?? 0)} pts`;

  const card = (p: Plan) => <label key={p.id} className={`credit-pack ${selected.id === p.id ? 'selected' : ''}`}>
    <input type="radio" name="pack" value={p.id} checked={selected.id === p.id} onChange={() => { setSelected(p); setDone(false); }} />
    <span className="pack-check">{selected.id === p.id && <Check size={13} />}</span>
    {p.popular && <span className="popular-label"><Sparkles size={12} />{en ? 'Best choice' : 'Meilleur choix'}</span>}
    <span className="pack-name">{p.name}</span>
    {p.audioMin != null ? <AudioLines size={27} className="text-primary" /> : <Coins size={27} className="text-primary" />}
    <strong>{p.audioMin != null ? p.audioMin : formatCredits(p.points ?? 0)}<small>{p.audioMin != null ? ' min' : ' pts'}</small></strong>
    <p>{(en ? p.lines.en : p.lines.fr)[0]}</p>
    <span className="pack-price">{p.price[cur]} <small>{sym(cur)}</small></span>
    <span className="pack-example"><Clock size={12} /> {en ? `Valid ${p.validity} days` : `Valable ${p.validity} jours`}</span>
  </label>;

  return <>
    <PageTitle title={en ? 'Top up points' : 'Recharge de points'} subtitle={en ? 'Two separate balances: points for video, minutes for audio translation. No payment is active yet.' : 'Deux soldes séparés : les points pour la vidéo, les minutes pour la traduction audio. Aucun paiement n’est encore actif.'} action={<Button asChild variant="outline"><Link to="/historique"><History />{en ? 'History' : 'Historique'}</Link></Button>} />
    <div className="dual-balance">
      <div className="credits-balance"><div className="flex items-center gap-4"><span className="credits-coin"><Coins size={26} /></span><div><span>{en ? 'Points · Swap Live, Restyle, Photo' : 'Points · Swap Live, Restyle, Photo'}</span><strong>{formatCredits(real.totals.balance)} <small>pts</small></strong></div></div><span className="demo-badge"><span />{en ? 'Real balance' : 'Solde réel'}</span></div>
      <div className="credits-balance"><div className="flex items-center gap-4"><span className="credits-coin"><AudioLines size={26} /></span><div><span>{en ? 'Audio translation minutes' : 'Minutes de traduction audio'}</span><strong>{AUDIO_MINUTES_AVAILABLE} <small>min</small></strong></div></div><span className="demo-badge"><span />{en ? 'Not yet connected' : 'Pas encore relié'}</span></div>
    </div>
    <div className="lp-currow"><span>{en ? 'Show prices in' : 'Afficher les prix en'}</span><div className="lp-toggle">{(['XOF', 'EUR', 'USD'] as const).map(k => <button key={k} type="button" className={cur === k ? 'active' : ''} aria-pressed={cur === k} onClick={() => setCur(k)}>{k === 'XOF' ? 'FCFA' : k}</button>)}</div></div>
    <div className="dashboard-section-header"><h2>Swap Live</h2><span className="subtle-label">{en ? 'POINTS · 2 PTS PER SECOND' : 'POINTS · 2 PTS PAR SECONDE'}</span></div>
    <div className="credit-packs">{swapPlans.map(card)}</div>
    <div className="dashboard-section-header" id="audio"><h2>{en ? 'Audio translation' : 'Traduction audio'}</h2><span className="subtle-label">{en ? 'MINUTES' : 'MINUTES'}</span></div>
    <div className="credit-packs">{audioPlans.map(card)}</div>
    <div className="purchase-summary"><div><strong>{en ? 'Simulation:' : 'Simulation :'} {selected.name}</strong><p>{qty} · {selected.price[cur]} {sym(cur)}</p></div><Button size="lg" onClick={() => { setDone(false); setConfirm(true); }}>{en ? 'Simulate purchase' : 'Simuler l’achat'}<ArrowRight /></Button></div>
    {done && <Notice>{en ? `Simulation complete: ${qty}. No payment made, your real balance is unchanged.` : `Simulation réussie : ${qty}. Aucun paiement effectué, votre solde réel est inchangé.`}</Notice>}
    <div className="credits-footnote"><ShieldCheck size={18} /><p>{en ? 'Payments are not active yet.' : 'Les paiements ne sont pas encore actifs.'}<span>{en ? 'Mobile Money and cards will open once the merchant account is ready.' : 'Mobile Money et cartes seront ouverts dès que le compte marchand sera prêt.'}</span></p></div>
    {confirm && <DemoModal title={en ? 'Confirm simulation' : 'Confirmer la simulation'} onClose={() => setConfirm(false)}><p className="text-muted-foreground text-sm">{selected.name} · {qty} · {selected.price[cur]} {sym(cur)}</p><p className="text-sm">{en ? 'No payment method will be requested and nothing will be charged.' : 'Aucun moyen de paiement ne sera demandé et aucun débit ne sera effectué.'}</p><Button onClick={() => { if (!isAudio) purchase(selected.points ?? 0, selected.name); setConfirm(false); setDone(true); }}>{en ? 'Confirm' : 'Confirmer'}<Check /></Button></DemoModal>}
  </>;
}
