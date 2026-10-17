import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound, ArrowLeft, ShieldCheck, Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Brand, Notice } from './shared';
import { useDemo } from './provider';
import { authCopy } from '@/lib/weechat/auth-copy';

type Mode = 'login' | 'signup' | 'reset' | 'update';

function authError(message: string, locale: 'fr' | 'en') {
  const m = message.toLowerCase();
  if (m.includes('email not confirmed')) return authCopy('Confirmez d’abord votre e-mail via le lien reçu.', locale);
  if (m.includes('invalid login')) return authCopy('E-mail ou mot de passe incorrect.', locale);
  if (m.includes('invalid') && m.includes('email')) return authCopy('Adresse e-mail refusée. Vérifiez-la.', locale);
  if (m.includes('already registered')) return authCopy('Un compte existe déjà avec cet e-mail.', locale);
  if (m.includes('rate limit')) return authCopy('Trop de tentatives. Réessayez dans quelques minutes.', locale);
  if (m.includes('password')) return authCopy('Mot de passe refusé : choisissez-en un plus robuste (8 caractères minimum).', locale);
  return authCopy('Une erreur est survenue. Réessayez.', locale);
}
const RESEND_COOLDOWN_SECONDS = 30;
const RECOVERY_FLAG = 'weechat-recovery';

// Only a session opened from the e-mailed recovery link may set a new password.
if (typeof window !== 'undefined') {
  if (/type=recovery/.test(window.location.hash)) sessionStorage.setItem(RECOVERY_FLAG, '1');
  supabase.auth.onAuthStateChange?.((event) => { if (event === 'PASSWORD_RECOVERY') sessionStorage.setItem(RECOVERY_FLAG, '1'); });
}
export function hasRecoveryGrant() { return typeof window !== 'undefined' && sessionStorage.getItem(RECOVERY_FLAG) === '1'; }

export function AuthPage({ mode }: { mode: Mode }) {
  const { t, locale } = useDemo(); const tr = (text: string) => authCopy(text, locale); const navigate = useNavigate();
  const [visible, setVisible] = useState(false); const [notice, setNotice] = useState(''); const [busy, setBusy] = useState(false);
  const [resendNotice, setResendNotice] = useState(''); const [resendOk, setResendOk] = useState(false); const [resendBusy, setResendBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown(s => s - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);
  // After the e-mail confirmation link, the session is opened on /connexion: go straight to the dashboard.
  useEffect(() => {
    if (mode !== 'login') return;
    const fromLink = /access_token=|type=signup/.test(window.location.hash) || new URLSearchParams(window.location.search).has('code');
    if (!fromLink) return;
    const go = () => navigate({ to: '/tableau-de-bord', replace: true });
    supabase.auth.getSession().then(({ data }) => { if (data.session) go(); });
    const { data } = supabase.auth.onAuthStateChange((event, s) => { if (event === 'SIGNED_IN' && s) go(); });
    return () => data.subscription.unsubscribe();
  }, [mode, navigate]);
  const withPassword = mode !== 'reset'; const withEmail = mode !== 'update';

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setNotice('');
    const form = e.currentTarget; const data = new FormData(form);
    const email = String(data.get('email') ?? '').trim(); const password = String(data.get('password') ?? '');
    if ((mode === 'signup' || mode === 'update') && password !== data.get('confirm')) { setNotice(tr('Les mots de passe ne correspondent pas.')); return; }
    setBusy(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { setNotice(authError(error.message, locale)); return; }
        navigate({ to: '/tableau-de-bord' });
      } else if (mode === 'signup') {
        const name = String(data.get('name') ?? '').trim().slice(0, 80);
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/connexion`, data: { display_name: name } } });
        if (error) { setNotice(authError(error.message, locale)); return; }
        form.reset();
        setNotice(tr('Compte créé. Ouvrez le lien envoyé par e-mail pour confirmer votre adresse, puis connectez-vous.'));
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reinitialisation` });
        if (error) { setNotice(authError(error.message, locale)); return; }
        setNotice(tr('Si un compte existe pour cet e-mail, un lien de réinitialisation vient d’être envoyé.'));
      } else {
        const { data: s } = await supabase.auth.getSession();
        if (!s.session || !hasRecoveryGrant()) { setNotice(tr('Lien expiré ou invalide. Demandez un nouveau lien.')); return; }
        const { error } = await supabase.auth.updateUser({ password });
        if (error) { setNotice(authError(error.message, locale)); return; }
        sessionStorage.removeItem(RECOVERY_FLAG);
        navigate({ to: '/tableau-de-bord' });
      }
    } catch { setNotice(authError('', locale)); } finally { setBusy(false); }
  }

  async function resendConfirmation() {
    const input = formRef.current?.elements.namedItem('email');
    const email = input instanceof HTMLInputElement ? input.value.trim() : '';
    if (!email) { setResendOk(false); setResendNotice(t('resendNeedEmail')); return; }
    setResendBusy(true); setResendOk(false); setResendNotice('');
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: `${window.location.origin}/connexion` } });
      if (error) { setResendOk(false); setResendNotice(authError(error.message, locale)); return; }
      setResendOk(true); setResendNotice(t('resendSent')); setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch { setResendOk(false); setResendNotice(authError('', locale)); } finally { setResendBusy(false); }
  }

  const title = mode === 'login' ? t('welcome') : mode === 'signup' ? t('signupTitle') : mode === 'reset' ? t('resetTitle') : tr('Nouveau mot de passe');
  const sub = mode === 'login' ? t('loginSub') : mode === 'signup' ? t('signupSub') : mode === 'reset' ? t('resetSub') : tr('Choisissez un nouveau mot de passe.');
  const cta = mode === 'login' ? t('login') : mode === 'signup' ? t('create') : mode === 'reset' ? t('send') : tr('Enregistrer');

  return <section className="auth-page"><div className="auth-story"><Brand /><span className="eyebrow">{tr('CHAQUE CONVERSATION EST UN DÉPART.')}</span><h2>{tr('Moins de barrières.')}<br /><span>{tr('Plus de connexions.')}</span></h2><p>{tr('Votre monde ne s’arrête pas à votre langue.')}</p><div className="auth-globe"><Globe2 strokeWidth={.5} /><span>FR</span><span>EN</span><span>ES</span></div></div><div className="auth-form-wrap"><div className="auth-form"><span className="auth-symbol">{mode === 'reset' || mode === 'update' ? <LockKeyhole /> : <AudioIcon />}</span><h1>{title}</h1><p className="auth-subtitle">{sub}</p>
    <form ref={formRef} onSubmit={submit}>
      {mode === 'signup' && <label className="field"><span>{t('name')}</span><div className="input-icon"><UserRound /><Input name="name" placeholder="Jean Dupont" required maxLength={80} autoComplete="name" /></div></label>}
      {withEmail && <label className="field"><span>{t('email')}</span><div className="input-icon"><Mail /><Input name="email" type="email" placeholder="vous@exemple.com" required maxLength={255} autoComplete="email" /></div></label>}
      {withPassword && <><label className="field"><span>{t('password')}</span><div className="input-icon"><LockKeyhole /><Input name="password" type={visible ? 'text' : 'password'} placeholder={tr('Votre mot de passe')} required minLength={mode === 'login' ? 1 : 8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /><Button type="button" variant="ghost" size="icon" aria-label={visible ? tr('Masquer le mot de passe') : tr('Afficher le mot de passe')} onClick={() => setVisible(v => !v)}>{visible ? <EyeOff /> : <Eye />}</Button></div></label>
        {(mode === 'signup' || mode === 'update') && <label className="field"><span>{t('confirm')}</span><div className="input-icon"><LockKeyhole /><Input name="confirm" type={visible ? 'text' : 'password'} placeholder={tr('Confirmez votre mot de passe')} required minLength={8} autoComplete="new-password" /></div></label>}</>}
      {mode === 'login' && <div className="auth-options"><span /><Link to="/recuperation">{t('forgot')}</Link></div>}
      <Button className="w-full" size="lg" type="submit" disabled={busy}>{busy ? tr('Patientez…') : cta}<ArrowRight /></Button>
    </form>
    {notice && <Notice>{notice}</Notice>}
    {mode === 'login' && <div className="auth-resend"><div className="auth-resend-side"><Button type="button" variant="outline" size="sm" disabled={resendBusy || cooldown > 0} onClick={resendConfirmation}><Mail size={14} />{resendBusy ? t('resendSending') : cooldown > 0 ? t('resendWait').replace('{s}', String(cooldown)) : t('resendConfirm')}</Button>{cooldown > 0 && <span className="auth-resend-timer" aria-hidden="true"><i style={{ width: `${(cooldown / RESEND_COOLDOWN_SECONDS) * 100}%` }} /></span>}</div>{resendNotice && <small data-ok={resendOk ? 'true' : 'false'}>{resendNotice}</small>}</div>}
    <div className="auth-divider"><span>WEECHAT</span></div>
    <p className="auth-foot">{mode === 'reset' || mode === 'update' ? <Link to="/connexion"><ArrowLeft size={14} />{t('backLogin')}</Link> : mode === 'login' ? <>{t('noAccount')} <Link to="/inscription">{t('register')}</Link></> : <>{t('hasAccount')} <Link to="/connexion">{t('login')}</Link></>}</p>
    <p className="auth-privacy"><ShieldCheck size={14} />{tr('Vos données de connexion sont protégées.')}</p></div></div></section>;
}
function AudioIcon() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 9v6m4-10v14m4-16v18m4-14v10m4-8v6" strokeLinecap="round" /></svg>; }
