import { useState } from 'react';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { creditsQuery, audioQuery, aiTokensQuery, validityQuery, fmtExpiry } from '@/lib/weechat/credits-query';
import { Link } from '@tanstack/react-router';
import { ArrowRight, AudioLines, Check, Clock, Coins, History, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useServerFn } from '@tanstack/react-start';
import { startCheckout, getCameraLicense } from '@/lib/weechat/payments.functions';
import { cameraLicense } from '@/lib/weechat/landing-copy';
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
  const [selected, setSelected] = useState<Plan>(swapPlans[2] ?? swapPlans[0] as Plan);
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
  const isAudio = selected.audioMin != null;
  const qty = selected.aiTokens ? `${formatCredits(selected.aiTokens)} ${en ? 'AI tokens' : 'jetons IA'}` : isAudio ? `${selected.audioMin} min` : `${formatCredits(selected.points ?? 0)} pts`;

  const card = (p: Plan) => <label key={p.id} className={`credit-pack ${selected.id === p.id ? 'selected' : ''}`}>
    <input type="radio" name="pack" value={p.id} checked={selected.id === p.id} onChange={() => { setSelected(p); }} />
    <span className="pack-check">{selected.id === p.id && <Check size={13} />}</span>
    {p.popular && <span className="popular-label"><Sparkles size={12} />{en ? 'Best choice' : 'Meilleur choix'}</span>}
    <span className="pack-name">{p.name}</span>
    {p.aiTokens ? <Sparkles size={27} className="text-primary" /> : p.audioMin != null ? <AudioLines size={27} className="text-primary" /> : <Coins size={27} className="text-primary" />}
    <strong>{p.aiTokens ? formatCredits(p.aiTokens) : p.audioMin != null ? p.audioMin : formatCredits(p.points ?? 0)}<small>{p.aiTokens ? (en ? ' tokens' : ' jetons') : p.audioMin != null ? ' min' : ' pts'}</small></strong>
    <p>{(en ? p.lines.en : p.lines.fr)[0]}</p>
    <span className="pack-price">{p.price[cur]} <small>{sym(cur)}</small></span>
    <span className="pack-example"><Clock size={12} /> {en ? `Valid ${p.validity} days` : `Valable ${p.validity} jours`}</span>
  </label>;

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
    <div className="lp-currow"><span>{en ? 'Pack type' : 'Type de pack'}</span><div className="lp-toggle" role="group">{(['swap', 'audio', 'tokens'] as const).map(k => <Button variant="ghost" key={k} type="button" className={kind === k ? 'active' : ''} aria-pressed={kind === k} onClick={() => { setKind(k); setSelected(k === 'swap' ? swapPlans[2] ?? swapPlans[0] as Plan : k === 'audio' ? audioPlans[1] ?? audioPlans[0] as Plan : tokenPlans[2] ?? tokenPlans[0] as Plan); }}>{k === 'swap' ? 'Swap Live' : k === 'audio' ? (en ? 'Audio translation' : 'Traduction audio') : (en ? 'AI tokens' : 'Jetons IA')}</Button>)}</div></div>
    <div className="dashboard-section-header" id="audio"><h2>{kind === 'swap' ? 'Swap Live' : kind === 'audio' ? (en ? 'Audio translation' : 'Traduction audio') : (en ? 'AI tokens' : 'Jetons IA')}</h2><span className="subtle-label">{kind === 'swap' ? (en ? 'POINTS · 2 PTS PER SECOND' : 'POINTS · 2 PTS PAR SECONDE') : kind === 'audio' ? 'MINUTES' : (en ? 'SWAP PHOTO 2 · IMAGE 5 · TALKING PHOTO 3/S' : 'SWAP PHOTO 2 · IMAGE 5 · PHOTO PARLANTE 3/S')}</span></div>
    <div className="credit-packs">{(kind === 'swap' ? swapPlans : kind === 'audio' ? audioPlans : tokenPlans).map(card)}</div>
    <div className="purchase-summary"><div><strong>{selected.name}</strong><p>{qty} · {selected.price[cur]} {sym(cur)}</p></div><Button size="lg" disabled={busy !== null} onClick={() => pay(selected.id)}>{busy === selected.id ? '…' : (en ? 'Pay with Mobile Money' : 'Payer par Mobile Money')}</Button></div>
    {payError && <p role="alert" className="mt-2 text-sm text-destructive">{en ? 'Payment could not start. Please try again.' : 'Le paiement n’a pas pu démarrer. Réessayez.'}</p>}
    <div className="purchase-summary mt-4"><div><strong>{en ? 'Weechat Camera licence (lifetime)' : 'Licence Weechat Camera (à vie)'}</strong><p>{cameraLicense.price.XOF} FCFA · {en ? 'one-time payment, included in Premium and Ultimate' : 'paiement unique, incluse dans Premium et Ultimate'}</p></div>{hasLicense ? <span className="demo-badge"><span />{en ? 'Licence active' : 'Licence active'}</span> : <Button size="lg" variant="outline" disabled={busy !== null} onClick={() => pay('camera-license')}>{busy === 'camera-license' ? '…' : (en ? 'Buy licence' : 'Acheter la licence')}</Button>}</div>
    <div className="credits-footnote"><ShieldCheck size={18} /><p>{en ? 'Secure payment by PayDunya.' : 'Paiement sécurisé par PayDunya.'}<span>{en ? 'Your balance is credited automatically after confirmation. Card payment coming soon.' : 'Votre solde est crédité automatiquement après confirmation. Paiement par carte bientôt.'}</span></p></div>

  </>;
}
