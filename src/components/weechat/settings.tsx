import { useEffect, useState, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { UserRound, ShieldCheck, Languages, Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageTitle, Notice } from './shared';
import { useDemo } from './provider';
import { profileQuery } from '@/lib/weechat/profile-query';
import { saveProfile } from '@/lib/weechat/profile.functions';
import { profileSchema } from '@/lib/weechat/profile-schema';

const labels = {
  fr: { title: 'Un espace à votre image.', sub: 'Votre profil et vos préférences.', profile: 'Profil', security: 'Sécurité', language: 'Langues', personal: 'Informations personnelles', name: 'Nom complet', email: 'Adresse e-mail', voice: 'Langue vocale souhaitée', ui: 'Langue de l’interface', save: 'Enregistrer', saving: 'Enregistrement…', saved: 'Profil enregistré.', failed: 'Enregistrement impossible. Réessayez.', invalid: 'Vérifiez le nom et les langues sélectionnées.', password: 'Mot de passe', reset: 'Réinitialiser le mot de passe', secure: 'Recevez un lien personnel par e-mail.', voiceNote: 'Traduction vocale non disponible.', categories: 'Catégories des paramètres' },
  en: { title: 'Make this space yours.', sub: 'Your profile and preferences.', profile: 'Profile', security: 'Security', language: 'Languages', personal: 'Personal information', name: 'Full name', email: 'Email address', voice: 'Preferred spoken language', ui: 'Interface language', save: 'Save', saving: 'Saving…', saved: 'Profile saved.', failed: 'Unable to save. Try again.', invalid: 'Check your name and selected languages.', password: 'Password', reset: 'Reset password', secure: 'Receive a personal link by email.', voiceNote: 'Voice translation unavailable.', categories: 'Settings categories' },
};
export function SettingsPage() {
  const { data } = useSuspenseQuery(profileQuery);
  const client = useQueryClient(); const save = useServerFn(saveProfile);
  const { locale, setLocale } = useDemo(); const c = labels[locale];
  const [tab, setTab] = useState('profile');
  const [name, setName] = useState(data.display_name ?? '');
  const [voice, setVoice] = useState(data.voice_language);
  const [busy, setBusy] = useState(false); const [notice, setNotice] = useState('');
  useEffect(() => { setLocale(data.ui_locale === 'en' ? 'en' : 'fr'); }, [data.ui_locale]);
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
    {[{ id: 'profile', label: c.profile, icon: UserRound }, { id: 'security', label: c.security, icon: ShieldCheck }, { id: 'language', label: c.language, icon: Languages }].map(n => <Button variant="ghost" aria-pressed={tab === n.id} key={n.id} onClick={() => { setTab(n.id); setNotice(''); }}><n.icon />{n.label}</Button>)}
    </nav><form className="settings-form" onSubmit={submit}>
    {tab === 'profile' && <><h2>{c.personal}</h2><div className="settings-avatar"><span className="user-avatar">{name.slice(0, 2).toUpperCase() || 'W'}</span><strong>{name}</strong></div><label className="field"><span>{c.name}</span><Input value={name} maxLength={80} autoComplete="name" onChange={e => setName(e.target.value)} /></label><label className="field"><span>{c.email}</span><Input type="email" value={data.email} readOnly autoComplete="email" /></label></>}
    {tab === 'security' && <><h2>{c.password}</h2><p>{c.secure}</p><Button asChild variant="outline"><Link to="/recuperation"><ShieldCheck />{c.reset}</Link></Button></>}
    {tab === 'language' && <><h2>{c.ui}</h2><div className="language-options">{(['fr', 'en'] as const).map(l => <Button type="button" key={l} variant="outline" aria-pressed={locale === l} onClick={() => setLocale(l)}><span>{l === 'fr' ? 'Français' : 'English'}</span>{locale === l && <Check />}</Button>)}</div><label className="field"><span>{c.voice}</span><select className="w-full rounded-md border border-input bg-background p-3 text-foreground" value={voice} onChange={e => setVoice(e.target.value)}>{[{ id: 'fr', name: 'Français' }, { id: 'en', name: 'English' }, { id: 'es', name: 'Español' }, { id: 'de', name: 'Deutsch' }, { id: 'pt', name: 'Português' }].map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></label><p>{c.voiceNote}</p></>}
    {tab !== 'security' && <div className="settings-save"><Button type="submit" disabled={busy}><Save />{busy ? c.saving : c.save}</Button></div>}{notice && <Notice>{notice}</Notice>}
    </form></div></>;
}
