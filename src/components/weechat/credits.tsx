import { useState } from 'react';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { creditsQuery, audioQuery, aiTokensQuery, validityQuery, fmtExpiry } from '@/lib/weechat/credits-query';
import { Link } from '@tanstack/react-router';
import { ArrowRight, AudioLines, Check, Clock, Coins, History, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useServerFn } from '@tanstack/react-start';
import { startCheckout, getCameraLicense } from '@/lib/weechat/payments.functions';
import { cameraLicense, landingCopy } from '@/lib/weechat/landing-copy';
import { PlanCard } from './home';
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
    const [kind, setKind] = useState<'swap' | 'audio' | 'tokens'>('swap');
  const checkout = useServerFn(startCheckout);
  const { data: hasLicense } = useQuery({ queryKey: ['camera-license'], queryFn: () => getCameraLicense() });
  const [busy, setBusy] = useState<string | null>(null);
  const [payError, setPayError] = useState(false);
  const pay = async (itemId: string) => {
    setBusy(itemId); setPayError(false);
    try { const r = await checkout({ data: { itemId } }); if (r.ok) { window.location.href = r.url; return; } setPayError(true); }
    catch { setPayError(true); }
    setBusy(null);
  };
  const c = landingCopy(locale);
  const buy = (p: Plan) => <Button size="lg" className="w-full text-base font-semibold" variant={p.popular ? 'default' : 'outline'} disabled={busy !== null} onClick={() => pay(p.id)}>{busy === p.id ? '…' : (en ? `Buy ${p.name}` : `Acheter ${p.name}`)}</Button>;
  const list = kind === 'swap' ? swapPlans : kind === 'audio' ? audioPlans : tokenPlans;

  return <>
    {!embedded && <>
    <PageTitle title={en ? 'Top up points' : 'Recharge de points'} subtitle={en ? 'Two separate balances: points for video, minutes for audio translation. Payment by Mobile Money via PayDunya.' : 'Deux soldes séparés : les points pour la vidéo, les minutes pour la traduction audio. Paiement par Mobile Money via PayDunya.'} action={<Button asChild variant="outline"><Link to="/historique"><History />{en ? 'History' : 'Historique'}</Link></Button>} />
    <div className="dual-balance">
      <div className="credits-balance"><div className="flex items-center gap-4"><span className="credits-coin"><Coins size={26} /></span><div><span>{en ? 'Points · Swap Live, Restyle, Photo' : 'Points · Swap Live, Restyle, Photo'}</span><strong>{formatCredits(real.totals.balance)} <small>pts</small></strong><small className="block text-xs text-muted-foreground">{fmtExpiry(v?.credits, en)}</small></div></div><span className="demo-badge"><span />{en ? 'Real balance' : 'Solde réel'}</span></div>
      <div className="credits-balance"><div className="flex items-center gap-4"><span className="credits-coin"><AudioLines size={26} /></span><div><span>{en ? 'Audio translation minutes' : 'Minutes de traduction audio'}</span><strong>{fmtAudio(audio)}</strong><small className="block text-xs text-muted-foreground">{fmtExpiry(v?.audio, en)}</small></div></div><span className="demo-badge"><span />{en ? 'Real balance' : 'Solde réel'}</span></div>
      <div className="credits-balance"><div className="flex items-center gap-4"><span className="credits-coin"><Coins size={26} /></span><div><span>{en ? 'AI tokens (Studio AI)' : 'Jetons IA (Studio IA)'}</span><strong>{formatCredits(tokens ?? 0)}</strong><small className="block text-xs text-muted-foreground">{fmtExpiry(v?.tokens, en)}</small></div></div><span className="demo-badge"><span />{en ? 'Real balance' : 'Solde réel'}</span></div>
    </div>
    </>}
    <div className="lp-currow"><span>{en ? 'Show prices in' : 'Afficher les prix en'}</span><div className="lp-toggle">{(['XOF', 'EUR', 'USD'] as const).map(k => <Button variant="ghost" key={k} type="button" className={cur === k ? 'active' : ''} aria-pressed={cur === k} onClick={() => setCur(k)}>{k === 'XOF' ? 'FCFA' : k}</Button>)}</div></div>
    <div className="lp-currow"><span>{en ? 'Pack type' : 'Type de pack'}</span><div className="lp-toggle" role="group">{(['swap', 'audio', 'tokens'] as const).map(k => <Button variant="ghost" key={k} type="button" className={kind === k ? 'active' : ''} aria-pressed={kind === k} onClick={() => { setKind(k); }}>{k === 'swap' ? 'Swap Live' : k === 'audio' ? (en ? 'Audio translation' : 'Traduction audio') : (en ? 'AI tokens' : 'Jetons IA')}</Button>)}</div></div>
    <div className="dashboard-section-header" id="audio"><h2>{kind === 'swap' ? 'Swap Live' : kind === 'audio' ? (en ? 'Audio translation' : 'Traduction audio') : (en ? 'AI tokens' : 'Jetons IA')}</h2><span className="subtle-label">{kind === 'swap' ? (en ? 'POINTS · 2 PTS PER SECOND' : 'POINTS · 2 PTS PAR SECONDE') : kind === 'audio' ? 'MINUTES' : (en ? 'SWAP PHOTO 2 · IMAGE 5 · TALKING PHOTO 3/S' : 'SWAP PHOTO 2 · IMAGE 5 · PHOTO PARLANTE 3/S')}</span></div>
    <div className="lp-prices four">{list.map(p => <PlanCard key={p.id} plan={p} cur={cur} locale={locale} c={c} action={buy(p)} />)}</div>
    {payError && <p role="alert" className="mt-3 text-sm text-destructive">{en ? 'Payment could not start. Please try again.' : 'Le paiement n’a pas pu démarrer. Réessayez.'}</p>}
    {kind === 'swap' && <div className="lp-prices one"><article className="lp-camcard">
      <header><h3>{c.camTitle}</h3><span className="lp-badge">{c.camSub}</span></header>
      <strong>{cameraLicense.price[cur]}<small>{sym(cur)}</small></strong>
      <ul>{c.camLines.map(l => <li key={l}><Check size={16} />{l}</li>)}</ul>
      {hasLicense ? <span className="demo-badge"><span />{en ? 'Lifetime licence active' : 'Licence active à vie'}</span> : <Button size="lg" className="w-full text-base font-semibold" disabled={busy !== null} onClick={() => pay('camera-license')}>{busy === 'camera-license' ? '…' : (en ? 'Buy the licence' : 'Acheter la licence')}</Button>}
    </article></div>}
    <div className="credits-footnote"><ShieldCheck size={18} /><p>{en ? 'Secure payment by PayDunya.' : 'Paiement sécurisé par PayDunya.'}<span>{en ? 'Your balance is credited automatically after confirmation. Card payment coming soon.' : 'Votre solde est crédité automatiquement après confirmation. Paiement par carte bientôt.'}</span></p></div>

  </>;
}
