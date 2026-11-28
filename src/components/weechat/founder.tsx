import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, AlertTriangle, Ban, Bell, CreditCard, ExternalLink, Search, ShieldCheck, Trash2, Users, Wallet, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { amIFounder, founderAdjustBalance, founderDeleteUser, founderNotifyUser, founderProviderHealth, founderSetMaintenance, founderSetSuspended, getFounderOverview, listFounderUsers } from '@/lib/weechat/founder.functions';
import { MAINTENANCE_MODULES, MODULE_LABELS, PROVIDER_BILLING_URLS, type MaintenanceModule } from '@/lib/weechat/founder-shared';
import { listContactMessages } from '@/lib/weechat/contact.functions';
import { maintenanceQuery } from './system-banners';
import { PageTitle } from './shared';

const card = 'rounded-xl border border-border bg-card p-4';
const axis = { stroke: 'var(--muted-foreground)', fontSize: 11 };
const tip = { contentStyle: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--foreground)' } };

export function FounderPage() {
  const check = useServerFn(amIFounder);
  const { data: ok, isLoading } = useQuery({ queryKey: ['am-i-founder-page'], queryFn: () => check() });
  if (isLoading) return <p className="p-6 text-muted-foreground">Chargement…</p>;
  if (!ok) return <div className="p-6"><PageTitle title="Accès réservé" subtitle="Cet espace est réservé au fondateur de Weechat." /></div>;
  return <div className="space-y-6">
    <PageTitle title="Espace Fondateur" subtitle="Ventes, utilisateurs, maintenance et santé des fournisseurs IA." />
    <ProviderAlerts />
    <Tabs defaultValue="overview">
      <TabsList className="flex h-auto flex-wrap"><TabsTrigger value="overview"><Activity className="mr-1 size-4" />Vue d'ensemble</TabsTrigger><TabsTrigger value="users"><Users className="mr-1 size-4" />Utilisateurs</TabsTrigger><TabsTrigger value="maintenance"><Wrench className="mr-1 size-4" />Maintenance</TabsTrigger><TabsTrigger value="providers"><ShieldCheck className="mr-1 size-4" />Fournisseurs IA</TabsTrigger><TabsTrigger value="messages"><Bell className="mr-1 size-4" />Messages</TabsTrigger></TabsList>
      <TabsContent value="overview"><Overview /></TabsContent>
      <TabsContent value="users"><UsersPanel /></TabsContent>
      <TabsContent value="maintenance"><MaintenancePanel /></TabsContent>
      <TabsContent value="providers"><ProvidersPanel /></TabsContent>
      <TabsContent value="messages"><MessagesPanel /></TabsContent>
    </Tabs>
  </div>;
}

function useOverview() { const f = useServerFn(getFounderOverview); return useQuery({ queryKey: ['founder-overview'], queryFn: () => f() }); }

function Overview() {
  const { data, isLoading, error } = useOverview();
  if (isLoading) return <p className="text-muted-foreground">Chargement des statistiques…</p>;
  if (error || !data) return <p className="text-destructive">Statistiques indisponibles.</p>;
  const t = data.totals; const alerts = Object.entries(data.providers).filter(([, p]) => p.billing > 0);
  const kpis = [['Utilisateurs', t.users], ['Packs vendus', t.packsSold], ['Licences Weechat Camera', t.cameraLicenses], ['Points consommés', t.pointsConsumed], ['Minutes traduites', t.audioMinutesConsumed], ['Jetons IA consommés', t.tokensConsumed]] as const;
  return <div className="space-y-4">
    {alerts.length > 0 && <div className="flex items-start gap-3 rounded-xl border border-destructive/50 bg-destructive/10 p-4"><AlertTriangle className="size-5 text-destructive" /><div><strong>Recharge fournisseur nécessaire</strong><p className="text-sm text-muted-foreground">{alerts.map(([n]) => n).join(', ')} a refusé des requêtes pour solde insuffisant. Les utilisateurs ont été remboursés. Rechargez puis réactivez le module dans Maintenance.</p></div></div>}
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">{kpis.map(([l, v]) => <div key={l} className={card}><p className="text-xs text-muted-foreground">{l}</p><p className="mt-1 text-2xl font-semibold">{v.toLocaleString('fr-FR')}</p></div>)}</div>
    <div className="grid gap-4 lg:grid-cols-2">
      <div className={card}><h3 className="mb-3 font-medium">Consommation sur 30 jours</h3><div className="h-64"><ResponsiveContainer><LineChart data={data.daily}><CartesianGrid stroke="var(--border)" strokeDasharray="3 3" /><XAxis dataKey="day" {...axis} /><YAxis {...axis} /><Tooltip {...tip} /><Line dataKey="points" name="Points" stroke="var(--primary)" dot={false} /><Line dataKey="tokens" name="Jetons IA" stroke="var(--success)" dot={false} /><Line dataKey="audioMin" name="Minutes audio" stroke="var(--platform-yellow)" dot={false} /></LineChart></ResponsiveContainer></div></div>
      <div className={card}><h3 className="mb-3 font-medium">Inscriptions et packs achetés (30 jours)</h3><div className="h-64"><ResponsiveContainer><BarChart data={data.daily}><CartesianGrid stroke="var(--border)" strokeDasharray="3 3" /><XAxis dataKey="day" {...axis} /><YAxis allowDecimals={false} {...axis} /><Tooltip {...tip} /><Bar dataKey="signups" name="Inscriptions" fill="var(--success)" /><Bar dataKey="packs" name="Packs" fill="var(--primary)" /></BarChart></ResponsiveContainer></div></div>
      <div className={card}><h3 className="mb-3 font-medium">Répartition des packs vendus</h3>{data.packCounts.length ? <div className="h-64"><ResponsiveContainer><BarChart data={data.packCounts} layout="vertical"><XAxis type="number" allowDecimals={false} {...axis} /><YAxis type="category" dataKey="name" width={140} {...axis} /><Tooltip {...tip} /><Bar dataKey="count" name="Ventes" fill="var(--primary)" /></BarChart></ResponsiveContainer></div> : <p className="text-sm text-muted-foreground">Aucun pack vendu pour l'instant.</p>}</div>
      <div className={card}><h3 className="mb-3 flex items-center gap-2 font-medium"><CreditCard className="size-4" />Derniers paiements PayDunya</h3>{data.recentPayments.length ? <ul className="divide-y divide-border text-sm">{data.recentPayments.map(p => <li key={p.ref} className="flex justify-between gap-2 py-2"><span>{p.label}</span><span className="text-muted-foreground">{new Date(p.at).toLocaleString('fr-FR')}</span></li>)}</ul> : <p className="text-sm text-muted-foreground">Aucun paiement confirmé.</p>}</div>
    </div>
  </div>;
}

type U = Awaited<ReturnType<typeof listFounderUsers>>[number];
function UsersPanel() {
  const list = useServerFn(listFounderUsers);
  const { data, isLoading } = useQuery({ queryKey: ['founder-users'], queryFn: () => list() });
  const [q, setQ] = useState(''); const [sel, setSel] = useState<U | null>(null);
  const rows = (data ?? []).filter(u => u.email.toLowerCase().includes(q.toLowerCase()) || u.id.startsWith(q));
  return <div className="space-y-3">
    <div className="relative max-w-md"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="pl-9" placeholder="Rechercher par e-mail ou identifiant" value={q} onChange={e => setQ(e.target.value)} /></div>
    {isLoading ? <p className="text-muted-foreground">Chargement…</p> : <div className="overflow-x-auto rounded-xl border border-border"><table className="w-full text-sm"><thead className="bg-muted/50 text-left text-xs text-muted-foreground"><tr><th className="p-3">E-mail</th><th className="p-3">Inscription</th><th className="p-3 text-right">Points</th><th className="p-3 text-right">Minutes</th><th className="p-3 text-right">Jetons</th><th className="p-3">Statut</th><th className="p-3" /></tr></thead><tbody>
      {rows.map(u => <tr key={u.id} className="border-t border-border"><td className="p-3">{u.email}{u.cameraLicense && <span className="ml-2 rounded bg-primary/15 px-1.5 text-xs text-primary">Camera</span>}</td><td className="p-3 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td><td className="p-3 text-right">{u.points}</td><td className="p-3 text-right">{Math.floor(u.audioSeconds / 60)}</td><td className="p-3 text-right">{u.tokens}</td><td className="p-3">{u.suspended ? <span className="text-destructive">Suspendu</span> : u.confirmed ? 'Actif' : 'E-mail non confirmé'}</td><td className="p-3 text-right"><Button size="sm" variant="outline" onClick={() => setSel(u)}>Gérer</Button></td></tr>)}
      {!rows.length && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Aucun utilisateur.</td></tr>}
    </tbody></table></div>}
    <Dialog open={Boolean(sel)} onOpenChange={o => !o && setSel(null)}><DialogContent className="max-h-[90vh] overflow-y-auto">{sel && <UserActions u={sel} onDone={() => setSel(null)} />}</DialogContent></Dialog>
  </div>;
}

function UserActions({ u, onDone }: { u: U; onDone: () => void }) {
  const qc = useQueryClient(); const refresh = () => { qc.invalidateQueries({ queryKey: ['founder-users'] }); qc.invalidateQueries({ queryKey: ['founder-overview'] }); };
  const adjust = useServerFn(founderAdjustBalance), notify = useServerFn(founderNotifyUser), suspend = useServerFn(founderSetSuspended), del = useServerFn(founderDeleteUser);
  const [wallet, setWallet] = useState<'points' | 'audio_minutes' | 'tokens'>('points'); const [amount, setAmount] = useState(''); const [reason, setReason] = useState('');
  const [title, setTitle] = useState(''); const [msg, setMsg] = useState(''); const [sev, setSev] = useState<'info' | 'warning' | 'critical'>('warning'); const [confirm, setConfirm] = useState('');
  const done = (r: { ok: boolean; error?: string }, okMsg: string) => { if (r.ok) { toast.success(okMsg); refresh(); } else toast.error(r.error ?? 'Échec'); return r.ok; };
  const m = useMutation({ mutationFn: async (fn: () => Promise<void>) => fn() });
  const sel = 'h-9 rounded-md border border-input bg-background px-2 text-sm';
  return <>
    <DialogHeader><DialogTitle>{u.email}</DialogTitle></DialogHeader>
    <p className="text-sm text-muted-foreground">{u.points} pts · {Math.floor(u.audioSeconds / 60)} min · {u.tokens} jetons IA</p>
    <section className="space-y-2"><h4 className="flex items-center gap-2 font-medium"><Wallet className="size-4" />Recharge / retrait manuel</h4>
      <div className="flex gap-2"><select className={sel} value={wallet} onChange={e => setWallet(e.target.value as typeof wallet)}><option value="points">Points</option><option value="audio_minutes">Minutes audio</option><option value="tokens">Jetons IA</option></select><Input type="number" placeholder="ex. 500 ou -100" value={amount} onChange={e => setAmount(e.target.value)} /></div>
      <Input placeholder="Motif (ex. geste commercial)" value={reason} onChange={e => setReason(e.target.value)} />
      <Button disabled={m.isPending || !Number(amount) || reason.trim().length < 3} onClick={() => m.mutate(async () => { done(await adjust({ data: { userId: u.id, wallet, amount: Math.trunc(Number(amount)), reason } }), 'Solde mis à jour.'); setAmount(''); })}>Appliquer</Button></section>
    <section className="space-y-2 border-t border-border pt-3"><h4 className="flex items-center gap-2 font-medium"><Bell className="size-4" />Avertir l'utilisateur</h4>
      <Input placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} /><textarea className="min-h-20 w-full rounded-md border border-input bg-background p-2 text-sm" placeholder="Message affiché sur son espace" value={msg} onChange={e => setMsg(e.target.value)} />
      <div className="flex gap-2"><select className={sel} value={sev} onChange={e => setSev(e.target.value as typeof sev)}><option value="info">Information</option><option value="warning">Avertissement</option><option value="critical">Critique</option></select><Button disabled={m.isPending || title.trim().length < 2 || msg.trim().length < 2} onClick={() => m.mutate(async () => { if (done(await notify({ data: { userId: u.id, title, message: msg, severity: sev } }), 'Message envoyé.')) { setTitle(''); setMsg(''); } })}>Envoyer</Button></div></section>
    <section className="space-y-2 border-t border-border pt-3"><h4 className="flex items-center gap-2 font-medium"><Ban className="size-4" />Accès au compte</h4>
      <Button variant="outline" disabled={m.isPending} onClick={() => m.mutate(async () => { if (done(await suspend({ data: { userId: u.id, suspended: !u.suspended } }), u.suspended ? 'Compte réactivé.' : 'Compte suspendu.')) onDone(); })}>{u.suspended ? 'Réactiver le compte' : 'Suspendre le compte'}</Button>
      <div className="flex gap-2"><Input placeholder="Retapez l'e-mail pour supprimer" value={confirm} onChange={e => setConfirm(e.target.value)} /><Button variant="destructive" disabled={m.isPending || confirm.toLowerCase() !== u.email.toLowerCase()} onClick={() => m.mutate(async () => { if (done(await del({ data: { userId: u.id, confirmEmail: confirm } }), 'Compte supprimé.')) onDone(); })}><Trash2 className="size-4" />Supprimer</Button></div></section>
  </>;
}

function MaintenancePanel() {
  const qc = useQueryClient(); const { data } = useQuery(maintenanceQuery); const set = useServerFn(founderSetMaintenance);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const save = async (module: MaintenanceModule, active: boolean) => {
    const message = drafts[module] ?? data?.find(r => r.module === module)?.message ?? '';
    const r = await set({ data: { module, active, message } });
    if (r.ok) { toast.success(active ? 'Maintenance activée : tous les utilisateurs voient le message.' : 'Maintenance mise à jour.'); qc.invalidateQueries({ queryKey: ['maintenance'] }); } else toast.error('Échec');
  };
  return <div className="space-y-3"><p className="text-sm text-muted-foreground">Activez un module pour afficher un bandeau à tous les utilisateurs (et à vous). Écrivez ce qui reste utilisable, par exemple : « Ne lancez pas de Swap Photo ; le Studio et la traduction fonctionnent normalement. » La génération IA est bloquée côté serveur pendant sa maintenance, sans débit.</p>
    {MAINTENANCE_MODULES.map(mod => { const row = data?.find(r => r.module === mod); return <div key={mod} className={`${card} space-y-2`}><div className="flex items-center justify-between gap-3"><strong>{MODULE_LABELS[mod]}</strong><div className="flex items-center gap-2 text-sm"><span className={row?.active ? 'text-destructive' : 'text-muted-foreground'}>{row?.active ? 'En maintenance' : 'Opérationnel'}</span><Switch checked={Boolean(row?.active)} onCheckedChange={v => save(mod, v)} aria-label={`Maintenance ${MODULE_LABELS[mod]}`} /></div></div>
      <div className="flex gap-2"><Input placeholder="Message personnalisé affiché aux utilisateurs" value={drafts[mod] ?? row?.message ?? ''} onChange={e => setDrafts(d => ({ ...d, [mod]: e.target.value }))} /><Button variant="outline" onClick={() => save(mod, Boolean(row?.active))}>Enregistrer</Button></div></div>; })}
  </div>;
}

function useHealth() { const health = useServerFn(founderProviderHealth); return useQuery({ queryKey: ['founder-health'], queryFn: () => health(), refetchInterval: 120_000 }); }

const NAMES: Record<string, string> = { replicate: 'Replicate (Swap Photo, images, photo parlante)', palabra: 'Palabra (traduction vocale)', runpod: 'RunPod (serveur Swap Live)', sebpay: 'SebPay (Mobile Money)' };

/** Founder-wide alert strip: shown above every tab, plus a toast once per new alert. */
function ProviderAlerts() {
  const { data: h } = useHealth(); const { data: o } = useOverview();
  const [seen, setSeen] = useState('');
  const alerts = (h ?? []).filter(p => p.name !== 'sebpay').flatMap(p => {
    const refus = o?.providers[p.name]?.billing ?? 0;
    const amount = p.balanceUsd !== null ? `${p.balanceUsd.toFixed(2)} $ restants` : p.minutesLeft !== null ? `${p.minutesLeft} min restantes` : '';
    if (p.status === 'billing') return [{ n: p.name, crit: true, t: `${NAMES[p.name]} : solde épuisé${amount ? ` (${amount})` : ''} — rechargez maintenant.` }];
    if (p.status === 'low') return [{ n: p.name, crit: false, t: `${NAMES[p.name]} : solde bas (${amount}) — rechargez bientôt.` }];
    if (p.status === 'error') return [{ n: p.name, crit: false, t: `${NAMES[p.name]} : le service ne répond pas correctement.` }];
    if (p.status === 'missing') return [{ n: p.name, crit: false, t: `${NAMES[p.name]} : clé absente.` }];
    if (refus > 0) return [{ n: p.name, crit: true, t: `${NAMES[p.name]} : ${refus} refus pour solde insuffisant sur 30 jours — vérifiez votre crédit.` }];
    return [];
  });
  const key = alerts.map(a => a.t).join('|');
  if (key && key !== seen) { setSeen(key); alerts.forEach(a => (a.crit ? toast.error : toast.warning)(a.t)); }
  if (!h) return null;
  if (!alerts.length) return <p className={`${card} mb-4 text-sm text-primary`}>● Tous les fournisseurs ont un solde suffisant (vérifié toutes les 2 minutes).</p>;
  return <div className="mb-4 space-y-2">{alerts.map(a => <div key={a.n} className={`${card} flex flex-wrap items-center justify-between gap-2 border-destructive/60`}><span className="flex items-center gap-2 font-medium text-destructive"><AlertTriangle className="size-5 shrink-0" />{a.t}</span>{PROVIDER_BILLING_URLS[a.n] && <Button asChild size="sm"><a href={PROVIDER_BILLING_URLS[a.n]} target="_blank" rel="noreferrer">Recharger <ExternalLink className="size-3" /></a></Button>}</div>)}</div>;
}

function ProvidersPanel() {
  const { data: h, isFetching, refetch } = useHealth();
  const { data: o } = useOverview();
  const label = { ok: 'Connecté', low: 'Solde bas', billing: 'Solde épuisé', error: 'Erreur', missing: 'Clé absente', configured: 'Clé présente' } as const;
  return <div className="space-y-3">
    <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Vérification automatique toutes les 2 minutes. Après 2 refus pour solde insuffisant, le module passe seul en maintenance et les jetons sont remboursés.</p><Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>Vérifier</Button></div>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{(h ?? []).map(p => { const u = o?.providers[p.name]; const bad = p.name !== 'sebpay' && (p.status === 'billing' || p.status === 'low' || p.status === 'error' || (u?.billing ?? 0) > 0); return <div key={p.name} className={`${card} ${bad ? 'border-destructive/60' : ''} space-y-2`}>
      <div className="flex items-center justify-between"><strong>{NAMES[p.name] ?? p.name}</strong><span className={`text-sm ${bad ? 'text-destructive' : 'text-primary'}`}>● {label[p.status]}{p.ms !== null ? ` · ${p.ms} ms` : ''}</span></div>
      {p.balanceUsd !== null && <p className={`text-2xl font-semibold ${p.status === 'ok' ? '' : 'text-destructive'}`}>{p.balanceUsd.toFixed(2)} $ restants{p.status === 'low' ? ' — rechargez bientôt' : p.status === 'billing' ? ' — rechargez maintenant' : ''}</p>}
      {p.minutesLeft !== null && <p className={`text-2xl font-semibold ${p.status === 'ok' ? '' : 'text-destructive'}`}>{p.minutesLeft} min de traduction restantes{p.status === 'low' ? ' — rechargez bientôt' : p.status === 'billing' ? ' — rechargez maintenant' : ''}</p>}
      {p.name === 'replicate' && p.status === 'ok' && <p className="text-sm text-muted-foreground">Clé valide. Le solde exact n'est pas lisible : l'alerte se déclenche dès le premier refus pour solde insuffisant.</p>}
      {u ? <p className="text-sm text-muted-foreground">30 j : {u.calls} appels · {u.ok} réussis · {u.billing} refus solde · {u.failed} erreurs · ≈ {u.costUsd.toFixed(2)} $ estimés</p> : <p className="text-sm text-muted-foreground">Aucun appel enregistré sur 30 jours.</p>}
      {u?.lastError && <p className="truncate text-xs text-destructive" title={u.lastError}>Dernière erreur : {u.lastError}</p>}
      {PROVIDER_BILLING_URLS[p.name] && <Button asChild size="sm" variant={bad ? 'default' : 'outline'}><a href={PROVIDER_BILLING_URLS[p.name]} target="_blank" rel="noreferrer">{p.name === 'sebpay' ? 'Voir les encaissements' : 'Recharger'} <ExternalLink className="size-3" /></a></Button>}
    </div>; })}</div>
    <p className="text-xs text-muted-foreground">Replicate ne fournit pas le solde restant par API : le coût affiché est une estimation par appel. Configurez aussi une alerte de dépense et la recharge automatique par carte dans votre compte Replicate.</p>
  </div>;
}

function MessagesPanel() {
  const list = useServerFn(listContactMessages);
  const { data, isLoading, isError } = useQuery({ queryKey: ['founder-contact'], queryFn: () => list() });
  if (isLoading) return <p className="text-muted-foreground">Chargement…</p>;
  if (isError) return <p className="text-destructive">Messages indisponibles : la table contact_messages n'est peut-être pas encore créée.</p>;
  if (!data?.length) return <p className="text-muted-foreground">Aucun message reçu pour l'instant.</p>;
  return <div className="space-y-3">{data.map(m => <div key={m.id} className={card}><div className="flex flex-wrap justify-between gap-2 text-sm text-muted-foreground"><span><strong className="text-foreground">{m.name}</strong> · {m.contact} · {m.kind}</span><span>{new Date(m.created_at).toLocaleString('fr-FR')}</span></div><p className="mt-2 whitespace-pre-wrap">{m.message}</p></div>)}</div>;
}
