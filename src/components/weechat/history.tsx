import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Search, ArrowDownLeft, ArrowUpRight, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageTitle } from './shared';
import { useDemo } from './provider';
import { creditsQuery } from '@/lib/weechat/credits-query';
import { formatCredits } from '@/lib/weechat/demo-data';
export function HistoryPage() {
 const { data } = useSuspenseQuery(creditsQuery); const { locale } = useDemo();
 const en = locale === 'en'; const [filter,setFilter] = useState('all'); const [search,setSearch] = useState('');
 const rows = data.entries.filter(r => (filter === 'all' || (filter === 'received' ? r.amount > 0 : r.amount < 0)) && `${r.reason} ${r.reference}`.toLowerCase().includes(search.toLowerCase()));
 return <><PageTitle title={en ? 'Credit history' : 'Historique des crédits'} subtitle={en ? 'Your personal credit movements.' : 'Vos mouvements de crédits personnels.'} /><div className="history-stats">{[{ icon: Coins, label: en ? 'Available balance' : 'Solde disponible', value: data.totals.balance }, { icon: ArrowDownLeft,label: en ? 'Credits received' : 'Crédits reçus', value: data.totals.received }, { icon: ArrowUpRight,label: en ? 'Credits consumed' : 'Crédits consommés',value:data.totals.consumed }].map(s => <div key={s.label}><s.icon size={20}/><span>{s.label}</span><strong>{formatCredits(s.value)}<small> {en ? 'credits' : 'crédits'}</small></strong></div>)}</div><section className="history-section"><div className="history-toolbar"><div className="segmented-control">{[{id:'all',label:en?'All':'Tout'},{id:'received',label:en?'Received':'Ajouts'},{id:'usage',label:en?'Used':'Utilisations'}].map(f=><Button key={f.id} variant="ghost" aria-pressed={filter===f.id} onClick={()=>setFilter(f.id)}>{f.label}</Button>)}</div><div className="input-icon search-input"><Search/><Input aria-label={en?'Search movements':'Rechercher un mouvement'} placeholder={en?'Reason or reference…':'Motif ou référence…'} value={search} onChange={e=>setSearch(e.target.value)}/></div></div>{rows.length ? <div className="transaction-list">{rows.map(r=><div className="transaction-row" key={r.id}><span className={`transaction-icon ${r.amount>0?'positive':''}`}>{r.amount>0?<ArrowDownLeft/>:<ArrowUpRight/>}</span><div className="min-w-0"><strong>{r.reason}</strong><small>{new Date(r.created_at).toLocaleString(locale)} · {r.reference}</small></div><span className={`transaction-amount ${r.amount>0?'positive':''}`}>{r.amount>0?'+':'−'}{formatCredits(Math.abs(r.amount))}</span></div>)}</div> : <div className="empty-state"><Coins size={28}/><h3>{en?'No movements':'Aucun mouvement'}</h3></div>}<p className="table-note">{en ? 'Up to 100 latest movements · Totals include your entire history' : '100 derniers mouvements au maximum · Totaux calculés sur tout votre historique'}</p></section></>;
}
