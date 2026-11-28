import { PlanCompare } from './pricing-extras';
import { OfferSelector } from './offer-selector';
import { studioPlans, withStudioBonuses } from '@/lib/weechat/studio-hours';
import { useState } from 'react';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { creditsQuery, audioQuery, aiTokensQuery, validityQuery, studioQuery, fmtExpiry } from '@/lib/weechat/credits-query';
import { Link } from '@tanstack/react-router';
import { ArrowRight, AudioLines, Check, Clock, Coins, History, ShieldCheck, CreditCard, Smartphone, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useServerFn } from '@tanstack/react-start';
import { startCheckout, getCameraLicense } from '@/lib/weechat/payments.functions';
import { cameraLicense, landingCopy } from '@/lib/weechat/landing-copy';
import { PageTitle } from './shared';
import { useDemo } from './provider';
import { formatCredits } from '@/lib/weechat/demo-data';
import { swapPlans, audioPlans, tokenPlans, type Currency, type Plan } from '@/lib/weechat/landing-copy';

/** Audio minutes come from the separate audio-time ledger (stored in seconds). */
const fmtAudio = (sec: number | undefined) => sec === undefined ? '…' : sec % 60 ? `${Math.floor(sec / 60)} min ${sec % 60} s` : `${sec / 60} min`;

const sym = (c: Currency) => (c === 'XOF' ? 'FCFA' : c === 'EUR' ? '€' : '$');

/** Two separate balances (points + audio minutes) for the member header. */
export function BalanceChips() {
  const { locale } = useDemo();
  const { data } = useQuery(creditsQuery); const { data: audio } = useQuery(audioQuery);
  const en = locale === 'en';
  return <div className="balance-chips" aria-label={en ? 'Your balances' : 'Vos soldes'}>
    <Link to="/credits" className="balance-chip" title={en ? 'Points (Swap Live, Restyle, Photo)' : 'Points (Swap Live, Restyle, Photo)'}><Coins size={15} /><strong>{data ? formatCredits(data.totals.balance) : '…'}</strong><span>pts</span></Link>
    <Link to="/credits" hash="audio" className="balance-chip" title={en ? 'Audio translation minutes' : 'Minutes de traduction audio'}><AudioLines size={15} /><strong>{fmtAudio(audio)}</strong></Link>
  </div>;
}

export function CreditsPage({ embedded = false }: { embedded?: boolean } = {}) {
  const { locale } = useDemo();
  const en = locale === 'en';
  const { data: real } = useSuspenseQuery(creditsQuery); const { data: audio } = useQuery(audioQuery); const { data: tokens } = useQuery(aiTokensQuery); const { data: v } = useQuery(validityQuery);
  const [cur, setCur] = useState<Currency>('XOF');
    const [kind, setKind] = useState<'swap' | 'audio' | 'tokens' | 'studio' | 'camera'>('swap');
  const { data: studio } = useQuery(studioQuery);
  const checkout = useServerFn(startCheckout);
  const { data: hasLicense } = useQuery({ queryKey: ['camera-license'], queryFn: () => getCameraLicense() });
  const [busy, setBusy] = useState<string | null>(null);
  const [payError, setPayError] = useState(false);
  const [method, setMethod] = useState<'mobile' | 'card'>('mobile');
  const pay = async (itemId: string) => {
    setBusy(itemId); setPayError(false);
    try { const r = await checkout({ data: { itemId, method } }); if (r.ok) { window.location.href = r.url; return; } setPayError(true); }
    catch { setPayError(true); }
    setBusy(null);
  };
  const c = landingCopy(locale);
  const buy = (p: Plan) => <Button size="lg" className="w-full text-base font-semibold" variant={p.popular ? 'default' : 'outline'} disabled={busy !== null || (kind === 'studio' && !hasLicense)} onClick={() => pay(p.id)}>{busy === p.id ? '…' : (kind === 'studio' && !hasLicense ? (en ? 'Activate your camera licence first' : 'Activez d’abord votre licence caméra') : (en ? 'Continue to payment' : 'Continuer vers le paiement'))}</Button>;
  const list = kind === 'swap' ? withStudioBonuses(swapPlans, studio?.enabled === true) : kind === 'audio' ? audioPlans : kind === 'studio' ? studioPlans : tokenPlans;

  return <>
    {!embedded && <>
    <PageTitle title={en ? 'Balances and top-ups' : 'Soldes et recharges'} subtitle={en ? 'Choose only what you need. One-time purchases, no automatic renewal.' : 'Choisissez selon vos besoins. Achats ponctuels, sans renouvellement automatique.'} action={<Button asChild variant="outline"><Link to="/historique"><History />{en ? 'History' : 'Historique'}</Link></Button>} />
    <div className="dual-balance">
      <div className="credits-balance"><div className="flex items-center gap-4"><span className="credits-coin"><Coins size={26} /></span><div><span>{en ? 'Points · Swap Live, Restyle, Photo' : 'Points · Swap Live, Restyle, Photo'}</span><strong>{formatCredits(real.totals.balance)} <small>pts</small></strong><small className="block text-xs text-muted-foreground">{fmtExpiry(v?.credits, en)}</small></div></div><span className="demo-badge"><span />{en ? 'Real balance' : 'Solde réel'}</span></div>
      <div className="credits-balance"><div className="flex items-center gap-4"><span className="credits-coin"><AudioLines size={26} /></span><div><span>{en ? 'Audio translation minutes' : 'Minutes de traduction audio'}</span><strong>{fmtAudio(audio)}</strong><small className="block text-xs text-muted-foreground">{fmtExpiry(v?.audio, en)}</small></div></div><span className="demo-badge"><span />{en ? 'Real balance' : 'Solde réel'}</span></div>
      {studio?.enabled && <div className="credits-balance"><div><span>{en ? 'Studio broadcasting' : 'Diffusion Studio'}</span><strong>{Math.floor(studio.seconds / 3600)} h {Math.floor(studio.seconds % 3600 / 60)} min</strong><small>{fmtExpiry(studio.expiresAt, en)}</small></div></div>}
      <div className="credits-balance"><div className="flex items-center gap-4"><span className="credits-coin"><Coins size={26} /></span><div><span>{en ? 'AI tokens (Studio AI)' : 'Jetons IA (Studio IA)'}</span><strong>{formatCredits(tokens ?? 0)}</strong><small className="block text-xs text-muted-foreground">{fmtExpiry(v?.tokens, en)}</small></div></div><span className="demo-badge"><span />{en ? 'Real balance' : 'Solde réel'}</span></div>
    </div>
    </>}
    <div className="recharge-toolbar">
      <div className="offer-categories" role="group" aria-label={en ? 'Service' : 'Service'}>
        {(['swap', 'audio', 'tokens', ...(studio?.enabled ? ['studio'] as const : []), 'camera'] as const).map(k => <Button variant="ghost" key={k} aria-pressed={kind === k} onClick={() => { setKind(k); setPayError(false); }}>{k === 'swap' ? 'Swap Live' : k === 'audio' ? (en ? 'Translation' : 'Traduction') : k === 'tokens' ? 'Studio IA' : k === 'studio' ? (en ? 'Broadcasting' : 'Diffusion') : 'Weechat Camera'}</Button>)}
      </div>
      <div className="offer-currencies" role="group" aria-label={en ? 'Currency' : 'Devise'}>{(['XOF', 'EUR', 'USD'] as const).map(k => <Button size="sm" variant="ghost" key={k} aria-pressed={cur === k} onClick={() => setCur(k)}>{k === 'XOF' ? 'FCFA' : k}</Button>)}</div>
    </div>
    <div className="offer-currencies pay-methods" role="radiogroup" aria-label={en ? 'Payment method' : 'Moyen de paiement'}>
      <Button size="sm" variant="ghost" role="radio" aria-checked={method === 'mobile'} aria-pressed={method === 'mobile'} onClick={() => { setMethod('mobile'); setCur('XOF'); setPayError(false); }}><Smartphone size={15} />Mobile Money</Button>
      <Button size="sm" variant="ghost" role="radio" aria-checked={method === 'card'} aria-pressed={method === 'card'} onClick={() => { setMethod('card'); setPayError(false); }}><CreditCard size={15} />{en ? 'Bank card' : 'Carte bancaire'}</Button>
    </div>
    {kind !== 'camera' && <OfferSelector key={kind} plans={list} currency={cur} locale={locale} action={buy} />}
    {payError && <p role="alert" className="mt-3 text-sm text-destructive">{en ? 'Payment could not start. Please try again.' : 'Le paiement n’a pas pu démarrer. Réessayez.'}</p>}
    {kind === 'camera' && <div className="lp-prices one camera-offer"><article className="lp-camcard">
      <header><h3>{c.camTitle}</h3><span className="lp-badge">{c.camSub}</span></header>
      <strong>{cameraLicense.price[cur]}<small>{sym(cur)}</small></strong>
      {studio?.enabled && <p className="text-sm text-primary">{en ? '72 broadcasting hours included on activation, once per account.' : '72 heures de diffusion offertes à l’activation, une seule fois par compte.'}</p>}
      <ul>{c.camLines.map(l => <li key={l}><Check size={16} />{l}</li>)}</ul>
      {hasLicense ? <span className="demo-badge"><span />{en ? 'Lifetime licence active' : 'Licence active à vie'}</span> : <Button size="lg" className="w-full text-base font-semibold" disabled={busy !== null} onClick={() => pay('camera-license')}>{busy === 'camera-license' ? '…' : (en ? 'Buy the licence' : 'Acheter la licence')}</Button>}
    </article></div>}
    {kind === 'swap' && <PlanCompare locale={locale} cur={cur} studioEnabled={studio?.enabled === true} />}
    <div className="credits-footnote"><ShieldCheck size={18} /><p>{method === 'mobile' ? (en ? 'Mobile Money in 20+ African countries: Wave, Orange Money, MTN MoMo, Moov Money and more. Charged in FCFA.' : 'Mobile Money dans plus de 20 pays d’Afrique : Wave, Orange Money, MTN MoMo, Moov Money et autres. Montant débité en FCFA.') : (en ? 'Secure payment by Visa, Mastercard, Apple Pay or Google Pay.' : 'Paiement sécurisé par Visa, Mastercard, Apple Pay ou Google Pay.')}<span>{en ? 'Your balance is credited automatically after confirmation. ' : 'Votre solde est crédité automatiquement après confirmation.'}</span></p></div>

  </>;
}
