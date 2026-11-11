import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ArrowRight, AudioLines, Camera, Coins, Globe, Image, Monitor, Sparkles, Users, Video, Languages, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { creditsQuery, audioQuery, aiTokensQuery, validityQuery, fmtExpiry } from '@/lib/weechat/credits-query';
import { profileQuery } from '@/lib/weechat/profile-query';
import { getCameraLicense } from '@/lib/weechat/payments.functions';
import { formatCredits } from '@/lib/weechat/demo-data';
import { PageTitle, TransactionRows } from './shared';
import { CreditsPage } from './credits';
import { useDemo } from './provider';

const mmss = (s: number) => `${Math.floor(s / 60)} min${s % 60 ? ` ${s % 60} s` : ''}`;

export function DashboardPage() {
  const { locale } = useDemo(); const fr = locale === 'fr';
  const { data: credits } = useSuspenseQuery(creditsQuery);
  const { data: profile } = useSuspenseQuery(profileQuery);
  const { data: audio } = useQuery(audioQuery); const { data: tokens } = useQuery(aiTokensQuery); const { data: v } = useQuery(validityQuery);
  const { data: hasLicense } = useQuery({ queryKey: ['camera-license'], queryFn: () => getCameraLicense() });
  const pts = credits.totals.balance;
  const rows = credits.entries.slice(0, 5).map(r => ({ id: r.id, date: new Date(r.created_at).toLocaleString(locale), title: r.reason, amount: r.amount, type: r.amount < 0 ? 'usage' as const : 'purchase' as const }));

  const balances = [
    { icon: Coins, label: fr ? 'Points · Swap Live & Studio' : 'Points · Swap Live & Studio', value: `${formatCredits(pts)} pts`, hint: `≈ ${mmss(Math.floor(pts / 2))} Swap Live · ${mmss(pts)} Studio`, exp: fmtExpiry(v?.credits, !fr) },
    { icon: AudioLines, label: fr ? 'Minutes · Traduction vocale' : 'Minutes · Voice translation', value: audio === undefined ? '…' : mmss(audio), hint: fr ? 'Appels et lives traduits' : 'Translated calls and lives', exp: fmtExpiry(v?.audio, !fr) },
    { icon: Sparkles, label: fr ? 'Jetons IA · Studio photo' : 'AI tokens · Photo studio', value: formatCredits(tokens ?? 0), hint: fr ? 'Swap Photo, images, photo parlante' : 'Swap Photo, images, talking photo', exp: fmtExpiry(v?.tokens, !fr) },
  ];
  const features = [
    { icon: Video, title: 'Swap Live & Studio', desc: fr ? 'Changez de visage ou diffusez une vidéo dans vos appels.' : 'Swap your face or broadcast a video in your calls.', badge: fr ? 'Application Windows requise' : 'Windows app required', badgeIcon: Monitor, to: '/telecharger' as const, cta: fr ? 'Télécharger / Lancer' : 'Download / Launch' },
    { icon: Languages, title: fr ? 'Traduction vocale live' : 'Live voice translation', desc: fr ? 'Parlez votre langue, votre interlocuteur entend la sienne.' : 'Speak your language, they hear theirs.', badge: fr ? 'Directement sur le Web' : 'Right on the web', badgeIcon: Globe, to: '/traduction' as const, cta: fr ? 'Démarrer un appel' : 'Start a call' },
    { icon: Image, title: fr ? 'Swap Photo & Studio IA' : 'Swap Photo & AI Studio', desc: fr ? 'Changez un visage sur photo, créez des images.' : 'Swap faces on photos, create images.', badge: fr ? 'Directement sur le Web' : 'Right on the web', badgeIcon: Globe, to: '/swap-photo' as const, cta: fr ? 'Créer une image / Swap' : 'Create / Swap' },
    { icon: Users, title: fr ? 'Catalogue d’avatars' : 'Avatar catalogue', desc: fr ? 'Visages HD prêts à importer dans l’application.' : 'HD faces ready to import into the app.', badge: fr ? 'Téléchargement libre' : 'Free download', badgeIcon: FolderOpen, to: '/avatars' as const, cta: fr ? 'Voir les avatars' : 'View avatars' },
  ];

  return <div className="space-y-10">
    <PageTitle title={`${fr ? 'Bonjour' : 'Hello'}, ${profile.display_name || profile.email}`} subtitle={fr ? 'Vos soldes, vos outils et vos recharges, au même endroit.' : 'Your balances, tools and top-ups in one place.'} />

    <section aria-label={fr ? 'Soldes' : 'Balances'} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {balances.map(b => <article key={b.label} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><b.icon size={18} className="text-primary" />{b.label}</div>
        <p className="text-3xl font-bold tracking-tight text-foreground">{b.value}</p>
        <p className="text-sm text-muted-foreground">{b.hint}</p>
        <p className="mt-auto text-xs text-muted-foreground">{b.exp}</p>
      </article>)}
      <article className="flex flex-col gap-3 rounded-lg border border-primary/40 bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Camera size={18} className="text-primary" />Weechat Camera</div>
        {hasLicense
          ? <p className="text-2xl font-bold text-primary">{fr ? 'Active à vie ✓' : 'Lifetime active ✓'}</p>
          : <><p className="text-2xl font-bold text-foreground">{fr ? 'Non activée' : 'Not active'}</p><Button asChild className="mt-auto"><a href="#recharge">{fr ? 'Débloquer à vie · 10 000 FCFA' : 'Unlock for life · 10,000 FCFA'}</a></Button></>}
      </article>
    </section>

    <section>
      <h2 className="mb-4 text-xl font-semibold">{fr ? 'Vos fonctionnalités' : 'Your features'}</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {features.map(f => <article key={f.title} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/15 text-primary"><f.icon size={22} /></span>
          <h3 className="text-lg font-semibold">{f.title}</h3>
          <p className="flex-1 text-sm text-muted-foreground">{f.desc}</p>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"><f.badgeIcon size={13} />{f.badge}</span>
          <Button asChild variant="outline"><Link to={f.to}>{f.cta}<ArrowRight size={16} /></Link></Button>
        </article>)}
      </div>
    </section>

    <section id="recharge" className="scroll-mt-24">
      <h2 className="mb-4 text-xl font-semibold">{fr ? 'Recharger' : 'Top up'}</h2>
      <CreditsPage embedded />
    </section>

    <section>
      <div className="dashboard-section-header"><h2>{fr ? 'Dernières activités' : 'Latest activity'}</h2><Link to="/historique">{fr ? 'Historique complet' : 'Full history'}<ArrowRight size={15} /></Link></div>
      {rows.length ? <TransactionRows rows={rows} /> : <p className="text-sm text-muted-foreground">{fr ? 'Aucune activité pour le moment.' : 'No activity yet.'}</p>}
    </section>
  </div>;
}
