import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Check, ChevronDown, CreditCard, Fingerprint, Lock, ShieldCheck, Smartphone, Trash2, EyeOff, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemo } from './provider';
import { packs, platforms, formatCredits } from '@/lib/weechat/demo-data';
import { landingCopy, landingFaces, EUR_TO_XOF } from '@/lib/weechat/landing-copy';

function FaceSwap({ note }: { note: string }) {
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI(v => (v + 1) % landingFaces.length), 3200); return () => clearInterval(id); }, []);
  const prev = landingFaces[(i - 1 + landingFaces.length) % landingFaces.length]!;
  const cur = landingFaces[i]!;
  return <div className="lp-swap" aria-label={note}>
    <img className="lp-swap-img" src={prev.src} alt="" />
    <div key={cur.id} className="lp-swap-next"><img className="lp-swap-img" src={cur.src} alt="" /></div>
    <div key={`b${cur.id}`} className="lp-beam" aria-hidden="true" />
    <span className="lp-swap-tag"><span />{cur.label}</span>
  </div>;
}

export function HomePage() {
  const { locale } = useDemo(); const c = landingCopy(locale);
  const [tab, setTab] = useState(0); const [cur, setCur] = useState<'EUR' | 'XOF'>('EUR'); const [open, setOpen] = useState<number | null>(0);
  const price = (p: string) => { const eur = Number(p.replace(',', '.')); return cur === 'EUR' ? `${p} €` : `${new Intl.NumberFormat('fr-FR').format(Math.round(eur * EUR_TO_XOF / 100) * 100)} FCFA`; };
  const panel = c.panels[tab]!;
  return <div className="lp">
    <nav className="lp-subnav" aria-label="Sections">{c.nav.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}</nav>

    <section className="lp-hero">
      <FaceSwap note={c.heroNote} />
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
      <div className="lp-platforms">{platforms.map(p => <span key={p}>{p}</span>)}<span>TikTok</span></div>
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
          : <img src={landingFaces[(tab * 2) % landingFaces.length]!.src} alt="" />}</div>
      </div>
    </section>

    <section id="security" className="lp-section"><span className="lp-eyebrow">{c.secEyebrow}</span><h2>{c.secTitle}</h2>
      <div className="lp-cards">{c.sec.map(([t, d], n) => { const I = [Fingerprint, Lock, Trash2, EyeOff][n]!; return <article key={t}><I size={22} /><h3>{t}</h3><p>{d}</p></article>; })}</div>
      <div className="lp-resp"><span>18+</span><div><h3>{c.respTitle}</h3><p>{c.respText}</p></div></div>
    </section>

    <section id="payment" className="lp-section"><h2>{c.payTitle}</h2><p className="lp-lead">{c.payText}</p>
      <div className="lp-cards two">{c.pay.map(([t, d], n) => { const I = n ? CreditCard : Smartphone; return <article key={t}><I size={22} /><h3>{t}</h3><p>{d}</p></article>; })}</div>
    </section>

    <section id="pricing" className="lp-section"><h2>{c.priceTitle}</h2><p className="lp-lead">{c.priceText}</p>
      <div className="lp-toggle">{(['EUR', 'XOF'] as const).map(k => <button key={k} className={cur === k ? 'active' : ''} aria-pressed={cur === k} onClick={() => setCur(k)}>{k === 'XOF' ? 'FCFA' : 'EUR'}</button>)}</div>
      <div className="lp-prices">{packs.map(p => <article key={p.id} className={p.popular ? 'popular' : ''}>{p.popular && <span className="lp-pop">{c.popular}</span>}<h3>{p.name}</h3><strong>{price(p.price)}</strong><p>{formatCredits(p.credits)} {c.credits}</p><Button asChild variant={p.popular ? 'default' : 'outline'}><Link to="/credits">{c.choose}</Link></Button></article>)}</div>
    </section>

    <section id="faq" className="lp-section narrow"><h2>{c.faqTitle}</h2>
      <div className="lp-faq">{c.faq.map(([q, a], n) => <div key={q} className={open === n ? 'open' : ''}><button aria-expanded={open === n} onClick={() => setOpen(open === n ? null : n)}>{q}<ChevronDown size={18} /></button>{open === n && <p>{a}</p>}</div>)}</div>
    </section>

    <section className="lp-help"><MessageCircle size={26} /><div><h3>{c.helpTitle}</h3><p>{c.helpText}</p></div><Button variant="outline" asChild><a href="mailto:contact@weechat.app">{c.helpCta}</a></Button></section>

    <section className="lp-final"><h2>{c.finalTitle}</h2><p>{c.finalText}</p><div className="lp-actions"><Button size="lg" asChild><Link to="/inscription">{c.signup}</Link></Button><Button size="lg" variant="outline" asChild><Link to="/connexion">{c.haveAccount}</Link></Button></div></section>
  </div>;
}
