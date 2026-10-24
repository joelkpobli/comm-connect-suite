import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Check, ChevronDown, CreditCard, Fingerprint, Lock, ShieldCheck, Smartphone, Trash2, EyeOff, MessageCircle, Video, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemo } from './provider';
import { landingCopy, landingFaces, swapPlans, audioPlans, momoCountries, momoOperators, type Currency, type Plan } from '@/lib/weechat/landing-copy';
import clip1 from '@/assets/hero/hero-swap-1.mp4.asset.json';
import clip2 from '@/assets/hero/hero-swap-2.mp4.asset.json';
import clip3 from '@/assets/hero/hero-swap-3.mp4.asset.json';

const heroClips = [clip1.url, clip2.url, clip3.url];

// Official-style platform marks (simplified inline SVG, brand colors).
const platformLogos: { name: string; svg: React.ReactNode }[] = [
  { name: 'WhatsApp', svg: <svg viewBox="0 0 24 24" width="18" height="18" fill="#25D366"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.5.5c-.2.2-.3.4-.1.7.2.3.9 1.5 2 2.4 1.4 1.2 2.5 1.6 2.9 1.8.3.2.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.4 0 .1 0 .7-.2 1.3Z"/></svg> },
  { name: 'Zoom', svg: <svg viewBox="0 0 24 24" width="18" height="18" fill="#2D8CFF"><path d="M4 6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-1.2l4.4 3a.8.8 0 0 0 1.3-.6V6.8a.8.8 0 0 0-1.3-.6L15 9.2V8a2 2 0 0 0-2-2H4Z"/></svg> },
  { name: 'Teams', svg: <svg viewBox="0 0 24 24" width="18" height="18" fill="#6264A7"><rect x="2" y="7" width="11" height="11" rx="2"/><path d="M13 10h6a2 2 0 0 1 2 2v3a3 3 0 0 1-3 3h-5v-8Z" opacity=".7"/><circle cx="7.5" cy="10" r="1.6" fill="#fff"/><path d="M4.6 16.5c.4-2 1.5-3 2.9-3s2.5 1 2.9 3" stroke="#fff" strokeWidth="1.4" fill="none"/></svg> },
  { name: 'Google Meet', svg: <svg viewBox="0 0 24 24" width="18" height="18"><rect x="2" y="6" width="13" height="12" rx="2.5" fill="#00897B"/><path d="M15 10.5 21 7v10l-6-3.5v-3Z" fill="#F9AB00"/></svg> },
  { name: 'Messenger', svg: <svg viewBox="0 0 24 24" width="18" height="18"><defs><linearGradient id="msg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#00B2FF"/><stop offset="1" stopColor="#A033FF"/></linearGradient></defs><path fill="url(#msg)" d="M12 2C6.5 2 2 6.1 2 11.2c0 2.9 1.4 5.5 3.7 7.2V22l3.4-1.9c.9.3 1.9.4 2.9.4 5.5 0 10-4.1 10-9.3S17.5 2 12 2Zm5.7 7.4-3 4.8c-.5.8-1.5 1-2.3.5l-2.4-1.8a.6.6 0 0 0-.7 0l-3.2 2.4c-.4.3-.9-.2-.6-.6l3-4.8c.5-.8 1.5-1 2.3-.5l2.4 1.8c.2.2.5.2.7 0l3.2-2.4c.4-.3.9.2.6.6Z"/></svg> },
  { name: 'Instagram', svg: <svg viewBox="0 0 24 24" width="18" height="18"><defs><linearGradient id="ig" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#FEDA75"/><stop offset=".5" stopColor="#D62976"/><stop offset="1" stopColor="#962FBF"/></linearGradient></defs><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="url(#ig)"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="#fff" strokeWidth="1.8"/><circle cx="17.2" cy="6.8" r="1.3" fill="#fff"/></svg> },
  { name: 'TikTok', svg: <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#25F4EE" d="M16.6 3c.4 2 1.8 3.6 3.9 3.9v3c-1.5 0-2.9-.5-4-1.3v6.6A6.1 6.1 0 1 1 10 9.1v3.2a3 3 0 1 0 3.4 3V3h3.2Z"/><path fill="#FE2C55" d="M17.6 3.8c.5 1.7 1.8 3 3.6 3.3v2.2a7 7 0 0 1-3.9-1.4v7.3a6.4 6.4 0 1 1-6.4-6.4c.3 0 .7 0 1 .1v2.3a4.1 4.1 0 1 0 3.2 4V3.8h2.5Z" opacity=".85"/></svg> },
  { name: 'Telegram', svg: <svg viewBox="0 0 24 24" width="18" height="18" fill="#229ED9"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.9 6.9-1.7 8c-.1.6-.5.7-1 .4l-2.6-1.9-1.2 1.2c-.2.2-.3.3-.6.3l.2-2.7 5-4.5c.2-.2 0-.3-.3-.1l-6.2 3.9-2.6-.9c-.6-.2-.6-.6.1-.9l10-3.8c.5-.2.9.1.9.9Z"/></svg> },
  { name: 'Discord', svg: <svg viewBox="0 0 24 24" width="18" height="18" fill="#5865F2"><path d="M19.3 5.4A16 16 0 0 0 15.4 4l-.5 1a14 14 0 0 0-5.8 0L8.6 4a16 16 0 0 0-3.9 1.4C2.2 9.3 1.5 13.1 1.8 16.8A16 16 0 0 0 6.7 20l1-1.7a10 10 0 0 1-1.6-.8l.4-.3a11.4 11.4 0 0 0 11 0l.4.3c-.5.3-1 .6-1.6.8l1 1.7a16 16 0 0 0 4.9-3.2c.4-4.2-.7-7.9-2.9-11.4ZM8.7 14.6c-1 0-1.7-.9-1.7-2s.7-2 1.7-2 1.8.9 1.7 2c0 1.1-.7 2-1.7 2Zm6.6 0c-1 0-1.7-.9-1.7-2s.7-2 1.7-2 1.8.9 1.7 2c0 1.1-.7 2-1.7 2Z"/></svg> },
];

function VideoSwap({ live, lang, note }: { live: string; lang: string; note: string }) {
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI(v => (v + 1) % heroClips.length), 6500); return () => clearInterval(id); }, []);
  const cur = heroClips[i]!;
  return <div className="lp-swap" aria-label={note}>
    <video key={cur} className="lp-swap-img" src={cur} autoPlay muted loop playsInline />
    <div key={`b${i}`} className="lp-beam" aria-hidden="true" />
    <span className="lp-live-tag"><span />{live}</span>
    <span className="lp-lang-tag">{lang}</span>
  </div>;
}

function PlanCard({ plan, cur, locale, c }: { plan: Plan; cur: Currency; locale: 'fr' | 'en'; c: ReturnType<typeof landingCopy> }) {
  const sym = cur === 'XOF' ? 'FCFA' : cur === 'EUR' ? '€' : '$';
  return <article className={plan.popular ? 'popular' : ''}>
    {plan.popular && <span className="lp-pop">{c.popular}</span>}
    <header><h3>{plan.name}</h3>{plan.badge && <span className="lp-badge">{plan.badge}</span>}<span className="lp-validity">{plan.validity} {c.days}</span></header>
    <strong>{plan.price[cur]}<small>{sym}</small></strong>
    {plan.points && <p className="lp-pts">{new Intl.NumberFormat('fr-FR').format(plan.points)} {c.points}</p>}
    <ul>{plan.lines[locale].map(l => <li key={l}><Check size={15} />{l}</li>)}</ul>
    <Button asChild variant={plan.popular ? 'default' : 'outline'}><Link to="/credits">{c.choose} {plan.name}</Link></Button>
  </article>;
}

export function HomePage() {
  const { locale } = useDemo(); const c = landingCopy(locale);
  const [tab, setTab] = useState(0);
  const [mode, setMode] = useState<'swap' | 'audio'>('swap');
  const [cur, setCur] = useState<Currency>('XOF');
  const [open, setOpen] = useState<number | null>(0);
  const panel = c.panels[tab]!;
  const plans = mode === 'swap' ? swapPlans : audioPlans;
  const panelVideo = tab === 0 ? clip1.url : tab === 2 ? clip2.url : null;
  return <div className="lp">
    <nav className="lp-subnav" aria-label="Sections">{c.nav.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}</nav>

    <section className="lp-hero">
      <VideoSwap live={c.liveTag} lang={c.langTag} note={c.heroNote} />
      <div className="lp-hero-shade" aria-hidden="true" />
      <div className="lp-hero-inner">
        <h1>{c.heroTitle[0]}<br /><span>{c.heroTitle[1]}</span></h1>
        <p>{c.heroText}</p>
        <div className="lp-actions"><Button size="lg" asChild><Link to="/inscription">{c.start} <ArrowRight /></Link></Button><Button size="lg" variant="outline" asChild><a href="#pricing">{c.pricing}</a></Button></div>
        <small className="lp-note"><ShieldCheck size={14} />{c.heroNote}</small>
      </div>
    </section>

    <section className="lp-band">
      <span className="lp-eyebrow">{c.bandEyebrow}</span><h2>{c.bandTitle}</h2>
      <div className="lp-specs">{c.specs.map(s => <span key={s}>{s}</span>)}</div>
      <div className="lp-platforms">{platformLogos.map(p => <span key={p.name} className="lp-plat">{p.svg}{p.name}</span>)}</div>
      <small>{c.bandNote}</small>
    </section>

    <section id="how" className="lp-section"><h2>{c.howTitle}</h2><p className="lp-lead">{c.howText}</p>
      <div className="lp-steps">{c.steps.map(([t, d], n) => <article key={t}><span>0{n + 1}</span><h3>{t}</h3><p>{d}</p></article>)}</div>
    </section>

    <section id="features" className="lp-section"><h2>{c.featTitle}</h2>
      <div className="lp-tabs" role="tablist">{c.tabs.map((t, n) => <button key={t} role="tab" aria-selected={tab === n} className={tab === n ? 'active' : ''} onClick={() => setTab(n)}>{t}</button>)}</div>
      <div className="lp-panel">
        <div><span className="lp-status">{panel.status}</span><h3>{panel.title}</h3><p>{panel.text}</p><ul>{panel.points.map(p => <li key={p}><Check size={16} />{p}</li>)}</ul><Button asChild variant="outline"><Link to="/studio">{c.try} <ArrowRight /></Link></Button></div>
        <div className="lp-visual">{tab === 1
          ? <div className="lp-bubbles"><p><b>FR</b>{c.bubbles[0]}</p><p className="out"><b>EN</b>{c.bubbles[1]}</p></div>
          : panelVideo
            ? <video key={panelVideo} src={panelVideo} autoPlay muted loop playsInline />
            : <img src={landingFaces[4]!.src} alt="" />}</div>
      </div>
    </section>

    <section id="security" className="lp-section"><span className="lp-eyebrow">{c.secEyebrow}</span><h2>{c.secTitle}</h2>
      <div className="lp-cards">{c.sec.map(([t, d], n) => { const I = [Fingerprint, Lock, Trash2, EyeOff][n]!; return <article key={t}><I size={22} /><h3>{t}</h3><p>{d}</p></article>; })}</div>
    </section>

    <section id="payment" className="lp-section"><h2>{c.payTitle}</h2><p className="lp-lead">{c.payText}</p>
      <div className="lp-paygrid">
        <article>
          <Smartphone size={22} /><h3>{c.momoTitle}</h3><p>{c.momoText}</p>
          <h4>{c.momoOperators}</h4>
          <div className="lp-ops">{momoOperators.map(o => <span key={o}>{o}</span>)}</div>
          <h4>{c.momoCountries}</h4>
          <div className="lp-flags">{momoCountries.map(([f, n]) => <span key={n}><i>{f}</i>{n}</span>)}</div>
          <small className="lp-paynote"><Check size={14} />{c.momoNote}</small>
        </article>
        <article>
          <CreditCard size={22} /><h3>{c.cardTitle}</h3><p>{c.cardText}</p>
          <h4>{c.cardNetworks}</h4>
          <div className="lp-ops"><span className="lp-visa">VISA</span><span className="lp-mc"><i /><i />Mastercard</span></div>
          <small className="lp-paynote"><Check size={14} />{c.cardNote}</small>
        </article>
      </div>
    </section>

    <section id="pricing" className="lp-section">
      <span className="lp-eyebrow">{c.priceEyebrow}</span><h2>{c.priceTitle}</h2><p className="lp-lead">{c.priceText}</p>
      <p className="lp-modehint"><b>{c.modeSwap}</b> {c.priceModeHint.split('(')[1] ? `(${c.priceModeHint.split('(')[1]}` : ''}</p>
      <div className="lp-toggle">{([['swap', c.modeSwap, Video], ['audio', c.modeAudio, Mic]] as const).map(([k, label, I]) => <button key={k} className={mode === k ? 'active' : ''} aria-pressed={mode === k} onClick={() => setMode(k)}><I size={15} />{label}</button>)}</div>
      <div className="lp-currow"><span>{c.showPricesIn}</span><div className="lp-toggle">{(['XOF', 'EUR', 'USD'] as const).map(k => <button key={k} className={cur === k ? 'active' : ''} aria-pressed={cur === k} onClick={() => setCur(k)}>{k === 'XOF' ? 'FCFA' : k}</button>)}</div></div>
      <h3 className="lp-modetitle">{mode === 'swap' ? c.swapTitle : c.audioTitle}</h3>
      <p className="lp-lead">{mode === 'swap' ? c.swapSub : c.audioSub}</p>
      <div className={`lp-prices ${mode === 'audio' ? 'three' : ''}`}>{plans.map(p => <PlanCard key={p.id} plan={p} cur={cur} c={c} />)}</div>
      <small className="lp-conso">{c.consumptionNote}</small>
      <small className="lp-disclaimer">{c.priceDisclaimer}</small>
    </section>

    <section id="faq" className="lp-section narrow"><h2>{c.faqTitle}</h2>
      <div className="lp-faq">{c.faq.map(([q, a], n) => <div key={q} className={open === n ? 'open' : ''}><button aria-expanded={open === n} onClick={() => setOpen(open === n ? null : n)}>{q}<ChevronDown size={18} /></button>{open === n && <p>{a}</p>}</div>)}</div>
    </section>

    <section className="lp-help"><MessageCircle size={26} /><div><h3>{c.helpTitle}</h3><p>{c.helpText}</p></div><Button variant="outline" asChild><a href="mailto:contact@weechat.app">{c.helpCta}</a></Button></section>

    <section className="lp-final"><h2>{c.finalTitle}</h2><p>{c.finalText}</p><div className="lp-actions"><Button size="lg" asChild><Link to="/inscription">{c.signup}</Link></Button><Button size="lg" variant="outline" asChild><Link to="/connexion">{c.haveAccount}</Link></Button></div></section>
  </div>;
}
