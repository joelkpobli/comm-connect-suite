import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Coins, Languages, Video, Sparkles, Image, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { creditsQuery } from '@/lib/weechat/credits-query';
import { profileQuery } from '@/lib/weechat/profile-query';
import { featureCards } from '@/lib/weechat/feature-status';
import { formatCredits } from '@/lib/weechat/demo-data';
import { PageTitle, TransactionRows } from './shared';
import { useDemo } from './provider';

export function DashboardPage() {
  const { locale } = useDemo(); const fr = locale === 'fr';
  const { data: credits } = useSuspenseQuery(creditsQuery);
  const { data: profile } = useSuspenseQuery(profileQuery);
  const icons = { swap: Video, translation: Languages, restyle: Sparkles, photo: Image };
  const rows = credits.entries.slice(0, 3).map(r => ({ id: r.id, date: new Date(r.created_at).toLocaleString(locale), title: r.reason, amount: r.amount, type: r.amount < 0 ? 'usage' as const : 'purchase' as const }));
  return <>
    <PageTitle title={`${fr ? 'Bonjour' : 'Hello'}, ${profile.display_name || profile.email}`} subtitle={fr ? 'Vos fonctions, leurs limites et vos soldes réels.' : 'Your features, their limits and actual balances.'} action={<Button asChild variant="outline"><Link to="/telecharger"><BookOpen />{fr ? 'Guides par fonction' : 'Feature guides'}</Link></Button>} />
    <section className="mb-8 flex flex-wrap items-center justify-between gap-4 border-y border-border py-5">
      <div><span className="text-sm text-muted-foreground">{fr ? 'Solde de points' : 'Point balance'}</span><p className="mt-2 text-3xl font-semibold">{formatCredits(credits.totals.balance)} <span className="text-sm text-muted-foreground">pts</span></p></div>
      <Button asChild variant="outline"><Link to="/credits"><Coins />{fr ? 'Soldes et tarifs' : 'Balances and pricing'}</Link></Button>
    </section>
    <section><h2 className="mb-4 text-lg font-semibold">{fr ? 'Fonctions de communication' : 'Communication features'}</h2>
      <div className="grid gap-4 md:grid-cols-2">{featureCards(fr).map(f => { const Icon = icons[f.id]; return <article key={f.id} className="flex flex-col gap-3 rounded-md border border-border bg-card p-5"><div className="flex items-center gap-3"><Icon className="text-primary" size={24} /><h3 className="text-lg font-semibold">{f.title}</h3></div><span className="text-sm font-medium text-primary">{f.status}</span><p className="flex-1 text-sm leading-relaxed text-muted-foreground">{f.detail}</p><div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link to={f.to}>{f.action}<ArrowRight size={16} /></Link></Button><Button asChild variant="ghost"><Link to="/telecharger" hash={f.id}>{fr ? 'Guide' : 'Guide'}<BookOpen size={16} /></Link></Button></div></article>; })}</div>
    </section>
    <section className="mt-8"><div className="dashboard-section-header"><h2>{fr ? 'Derniers mouvements de points' : 'Latest point transactions'}</h2><Link to="/historique">{fr ? 'Historique' : 'History'}<ArrowRight size={15} /></Link></div>{rows.length ? <TransactionRows rows={rows} /> : <p className="text-sm text-muted-foreground">{fr ? 'Aucun mouvement.' : 'No transactions.'}</p>}</section>
  </>;
}
