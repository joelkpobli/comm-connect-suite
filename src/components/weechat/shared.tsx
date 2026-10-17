import { Link } from '@tanstack/react-router';
import { ArrowUpRight, ArrowDownLeft, Gift, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useDemo } from './provider';
import { uiCopy } from '@/lib/weechat/ui-copy';
import { formatCredits, type Transaction } from '@/lib/weechat/demo-data';
import type { ReactNode } from 'react';
export function Brand({ compact = false }: { compact?: boolean }) { const { locale } = useDemo(); const tr = (text: string) => uiCopy(text, locale);
  return <Link to="/" className="brand" aria-label={tr('Weechat — Accueil')}><svg className="brand-mark" viewBox="0 0 40 34" fill="none" aria-hidden="true"><path d="M4 6L12 28L20 12L28 28L36 6" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" /></svg>{!compact && <span>Weechat<span className="brand-period">.</span></span>}</Link>;
}
export function LanguageSelect() {
  const { locale, setLocale } = useDemo(); const tr = (text: string) => uiCopy(text, locale);
  return <select aria-label={tr('Langue de l’interface')} value={locale} onChange={e => setLocale(e.target.value === 'en' ? 'en' : 'fr')} className="language-select"><option value="fr">FR</option><option value="en">EN</option></select>;
}
export function DemoBadge() { const { t } = useDemo(); return <span className="demo-badge"><span />{t('demo')}</span>; }
export function PageTitle({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) { return <header className="page-title"><div className="min-w-0"><h1>{title}</h1><p>{subtitle}</p></div>{action}</header>; }
export function Notice({ children }: { children: ReactNode }) { return <div role="status" className="notice"><Check size={17} className="shrink-0" />{children}</div>; }
export function DemoModal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) { const { locale } = useDemo(); const tr = (text: string) => uiCopy(text, locale); return <Dialog open onOpenChange={open => { if (!open) onClose(); }}><DialogContent className="modal"><DialogTitle>{title}</DialogTitle><DialogDescription className="sr-only">{tr('Démonstration visuelle locale, sans appel ni paiement réel.')}</DialogDescription>{children}</DialogContent></Dialog>; }
export function TransactionRows({ rows }: { rows: Transaction[] }) { const { locale } = useDemo(); const tr = (text: string) => uiCopy(text, locale); return <div className="transaction-list">{rows.map(row => <div className="transaction-row" key={row.id}><span className={`transaction-icon ${row.amount > 0 ? 'positive' : ''}`}>{row.type === 'gift' ? <Gift size={17} /> : row.amount > 0 ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}</span><div className="min-w-0"><strong>{row.title}</strong><small>{row.date}</small></div><span className={`transaction-amount ${row.amount > 0 ? 'positive' : ''}`}>{row.amount > 0 ? '+' : '−'}{formatCredits(Math.abs(row.amount))}<small>{tr('crédits')}</small></span></div>)}</div>; }
