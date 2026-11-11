import { Link } from '@tanstack/react-router';
import { ArrowUpRight, ArrowDownLeft, Gift, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useDemo } from './provider';
import { uiCopy } from '@/lib/weechat/ui-copy';
import { formatCredits, type Transaction } from '@/lib/weechat/demo-data';
import type { ReactNode } from 'react';
export function Brand({ compact = false }: { compact?: boolean }) { const { locale } = useDemo(); const tr = (text: string) => uiCopy(text, locale);
  return <Link to="/" className="brand" aria-label={tr('Weechat — Accueil')}><svg className="brand-mark" viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M20 3C10.6 3 3 10 3 18.8c0 4.6 2.1 8.7 5.4 11.6L7 37l7.2-3.3c1.8.5 3.8.8 5.8.8 9.4 0 17-7 17-15.7S29.4 3 20 3Z" fill="currentColor" /><path d="M11 18.5h2.6M15.6 14v9M20 11v15M24.4 14v9M27.4 18.5H29" stroke="var(--background)" strokeWidth="2.6" strokeLinecap="round" /></svg>{!compact && <span>Weechat<span className="brand-period">.</span></span>}</Link>;
}
export function LanguageSelect() {
  const { locale, setLocale } = useDemo(); const tr = (text: string) => uiCopy(text, locale);
  return <select aria-label={tr('Langue de l’interface')} value={locale} onChange={e => setLocale(e.target.value === 'en' ? 'en' : 'fr')} className="language-select"><option value="fr">FR</option><option value="en">EN</option></select>;
}
export function DemoBadge() { const { t } = useDemo(); return <span className="demo-badge"><span />{t('demo')}</span>; }
export function PageTitle({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) { return <header className="page-title"><div className="min-w-0"><h1>{title}</h1><p>{subtitle}</p></div>{action}</header>; }
export function Notice({ children }: { children: ReactNode }) { return <div role="status" className="notice"><Check size={17} className="shrink-0" />{children}</div>; }
export function DemoModal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) { const { locale } = useDemo(); const tr = (text: string) => uiCopy(text, locale); return <Dialog open onOpenChange={open => { if (!open) onClose(); }}><DialogContent className="modal"><DialogTitle>{title}</DialogTitle><DialogDescription className="sr-only">{tr('Démonstration visuelle locale, sans appel ni paiement réel.')}</DialogDescription>{children}</DialogContent></Dialog>; }
export function TransactionRows({ rows }: { rows: Transaction[] }) { const { locale } = useDemo(); const tr = (text: string) => uiCopy(text, locale); return <div className="transaction-list">{rows.map(row => <div className="transaction-row" key={row.id}><span className={`transaction-icon ${row.amount > 0 ? 'positive' : ''}`}>{row.type === 'gift' ? <Gift size={17} /> : row.amount > 0 ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}</span><div className="min-w-0"><strong>{row.title}</strong><small>{row.date}</small></div><span className={`transaction-amount ${row.amount > 0 ? 'positive' : ''}`}>{row.amount > 0 ? '+' : '−'}{formatCredits(Math.abs(row.amount))}<small>{locale === 'fr' ? 'points' : 'points'}</small></span></div>)}</div>; }
