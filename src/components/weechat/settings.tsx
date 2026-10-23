import { useState, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { UserRound, ShieldCheck, Languages, Save, Check, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageTitle, Notice } from './shared';
import { useDemo } from './provider';
import { profileQuery } from '@/lib/weechat/profile-query';
import { saveProfile } from '@/lib/weechat/profile.functions';
import { profileSchema } from '@/lib/weechat/profile-schema';
import { settingsLabels } from '@/lib/weechat/settings-copy';
import { LocalMediaPanel } from './local-media';
import { RelayTrial } from './relay-trial';
import { mediaCopy } from '@/lib/weechat/media-copy';

export function SettingsPage() {
  const { data } = useSuspenseQuery(profileQuery);
  const client = useQueryClient(); const save = useServerFn(saveProfile);
  const { locale, setLocale } = useDemo(); const c = settingsLabels[locale];
  const [tab, setTab] = useState('profile');
  const [name, setName] = useState(data.display_name ?? '');
  const [voice, setVoice] = useState(data.voice_language);
  const [busy, setBusy] = useState(false); const [notice, setNotice] = useState('');
  async function submit(e: FormEvent) {
    e.preventDefault(); setNotice('');
    const parsed = profileSchema.safeParse({ display_name: name, ui_locale: locale, voice_language: voice });
    if (!parsed.success) { setNotice(c.invalid); return; }
    setBusy(true);
    try {
      const saved = await save({ data: parsed.data });
      client.setQueryData(profileQuery.queryKey, { ...saved, email: data.email });
      setNotice(c.saved);
    } catch { setNotice(c.failed); } finally { setBusy(false); }
  }
  return <><PageTitle title={c.title} subtitle={c.sub} /><div className="settings-layout"><nav className="settings-nav" aria-label={c.categories}>
    {[{ id: 'profile', label: c.profile, icon: UserRound }, { id: 'security', label: c.security, icon: ShieldCheck }, { id: 'language', label: c.language, icon: Languages }, { id: 'media', label: mediaCopy[locale].tab, icon: Camera }].map(n => <Button variant="ghost" aria-pressed={tab === n.id} key={n.id} onClick={() => { setTab(n.id); setNotice(''); }}><n.icon />{n.label}</Button>)}
    </nav><form className="settings-form" onSubmit={submit}>
    {tab === 'profile' && <><h2>{c.personal}</h2><div className="settings-avatar"><span className="user-avatar">{name.slice(0, 2).toUpperCase() || 'W'}</span><strong>{name}</strong></div><label className="field"><span>{c.name}</span><Input value={name} maxLength={80} autoComplete="name" onChange={e => setName(e.target.value)} /></label><label className="field"><span>{c.email}</span><Input type="email" value={data.email} readOnly autoComplete="email" /></label></>}
    {tab === 'security' && <><h2>{c.password}</h2><p>{c.secure}</p><Button asChild variant="outline"><Link to="/recuperation"><ShieldCheck />{c.reset}</Link></Button></>}
    {tab === 'language' && <><h2>{c.ui}</h2><div className="language-options">{(['fr', 'en'] as const).map(l => <Button type="button" key={l} variant="outline" aria-pressed={locale === l} onClick={() => setLocale(l)}><span>{l === 'fr' ? 'Français' : 'English'}</span>{locale === l && <Check />}</Button>)}</div><label className="field"><span>{c.voice}</span><select className="w-full rounded-md border border-input bg-background p-3 text-foreground" value={voice} onChange={e => setVoice(e.target.value)}>{[{ id: 'fr', name: 'Français' }, { id: 'en', name: 'English' }, { id: 'es', name: 'Español' }, { id: 'de', name: 'Deutsch' }, { id: 'pt', name: 'Português' }].map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></label><p>{c.voiceNote}</p></>}
    {tab === 'media' && <><LocalMediaPanel name={data.display_name || data.email} /><RelayTrial /></>}
    {tab !== 'security' && tab !== 'media' && <div className="settings-save"><Button type="submit" disabled={busy}><Save />{busy ? c.saving : c.save}</Button></div>}{notice && <Notice>{notice}</Notice>}
    </form></div></>;
}
