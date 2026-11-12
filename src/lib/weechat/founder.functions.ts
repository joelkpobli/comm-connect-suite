// Founder (admin) server functions. Every handler verifies the admin role through the caller's own session first.
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { MAINTENANCE_MODULES } from './founder-shared';

type Ctx = { supabase: { rpc: (fn: 'has_role', args: { _user_id: string; _role: 'admin' }) => PromiseLike<{ data: boolean | null }> }; userId: string };

async function admin(context: Ctx) {
  const { data } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  if (!data) throw new Error('Forbidden');
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  return supabaseAdmin;
}

async function all<T>(fetchPage: (from: number, to: number) => PromiseLike<{ data: T[] | null }>): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; from < 20000; from += 1000) {
    const { data } = await fetchPage(from, from + 999);
    out.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return out;
}

/** Cheap check the shell uses to show the Founder entry. */
export const amIFounder = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  return Boolean(data);
});

const day = (iso: string) => iso.slice(0, 10);

export const getFounderOverview = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const db = await admin(context);
  const since = new Date(Date.now() - 30 * 86400_000).toISOString();
  const [credits, audio, tokens, users, provider] = await Promise.all([
    all<{ user_id: string; amount: number; kind: string; reason: string; reference: string; created_at: string }>((a, b) => db.from('credit_transactions').select('user_id, amount, kind, reason, reference, created_at').range(a, b)),
    all<{ user_id: string; seconds: number; kind: string; reference: string; created_at: string }>((a, b) => db.from('audio_time_transactions').select('user_id, seconds, kind, reference, created_at').range(a, b)),
    all<{ user_id: string; tokens: number; kind: string; reference: string; created_at: string }>((a, b) => db.from('ai_token_transactions').select('user_id, tokens, kind, reference, created_at').range(a, b)),
    db.auth.admin.listUsers({ perPage: 1000 }),
    db.from('provider_usage_events').select('provider, kind, status, cost_usd, error, created_at').gte('created_at', since).order('created_at', { ascending: false }).limit(1000),
  ]);
  // Packs bought = distinct PayDunya invoices, labelled by the ledger reason.
  const packs = new Map<string, { label: string; at: string }>();
  for (const r of credits) if (r.reference.startsWith('paydunya:')) packs.set(r.reference.split(':').slice(0, 2).join(':'), { label: r.reason.replace(/^Achat\s*—?\s*/i, ''), at: r.created_at });
  for (const r of [...audio, ...tokens]) { const k = r.reference.split(':').slice(0, 2).join(':'); if (r.reference.startsWith('paydunya:') && !packs.has(k)) packs.set(k, { label: 'Pack audio / jetons', at: r.created_at }); }
  const packCounts: Record<string, number> = {};
  for (const p of packs.values()) packCounts[p.label] = (packCounts[p.label] ?? 0) + 1;

  const days: Record<string, { day: string; points: number; audioMin: number; tokens: number; signups: number; packs: number }> = {};
  for (let i = 29; i >= 0; i--) { const d = day(new Date(Date.now() - i * 86400_000).toISOString()); days[d] = { day: d.slice(5), points: 0, audioMin: 0, tokens: 0, signups: 0, packs: 0 }; }
  for (const r of credits) if (r.kind === 'usage' && days[day(r.created_at)]) days[day(r.created_at)]!.points += -r.amount;
  for (const r of audio) if (r.kind === 'usage' && days[day(r.created_at)]) days[day(r.created_at)]!.audioMin += Math.round(-r.seconds / 6) / 10;
  for (const r of tokens) if (r.kind === 'usage' && days[day(r.created_at)]) days[day(r.created_at)]!.tokens += -r.tokens;
  for (const p of packs.values()) if (days[day(p.at)]) days[day(p.at)]!.packs += 1;
  const list = users.data?.users ?? [];
  for (const u of list) if (days[day(u.created_at)]) days[day(u.created_at)]!.signups += 1;

  const ev = provider.data ?? [];
  const providers: Record<string, { calls: number; ok: number; billing: number; failed: number; costUsd: number; lastError: string | null; lastAt: string | null }> = {};
  for (const e of ev) {
    const p = (providers[e.provider] ??= { calls: 0, ok: 0, billing: 0, failed: 0, costUsd: 0, lastError: null, lastAt: e.created_at });
    p.calls++; p[e.status as 'ok' | 'billing' | 'failed']++; p.costUsd += Number(e.cost_usd);
    if (!p.lastError && e.status !== 'ok') p.lastError = e.error;
  }
  const sum = <T,>(a: T[], f: (x: T) => number) => a.reduce((s, x) => s + f(x), 0);
  return {
    totals: {
      users: list.length, packsSold: packs.size,
      cameraLicenses: list.filter((u) => (u.app_metadata as Record<string, unknown>)?.['camera_license'] === true).length,
      pointsConsumed: -sum(credits.filter((r) => r.kind === 'usage'), (r) => r.amount),
      audioMinutesConsumed: Math.round(-sum(audio.filter((r) => r.kind === 'usage'), (r) => r.seconds) / 60),
      tokensConsumed: -sum(tokens.filter((r) => r.kind === 'usage'), (r) => r.tokens),
    },
    packCounts: Object.entries(packCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    daily: Object.values(days),
    providers,
    recentErrors: ev.filter((e) => e.status !== 'ok').slice(0, 10),
    recentPayments: [...packs.entries()].sort((a, b) => b[1].at.localeCompare(a[1].at)).slice(0, 15).map(([ref, p]) => ({ ref, ...p })),
  };
});

export const listFounderUsers = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const db = await admin(context);
  const [users, credits, audio, tokens] = await Promise.all([
    db.auth.admin.listUsers({ perPage: 1000 }),
    all<{ user_id: string; amount: number }>((a, b) => db.from('credit_transactions').select('user_id, amount').range(a, b)),
    all<{ user_id: string; seconds: number }>((a, b) => db.from('audio_time_transactions').select('user_id, seconds').range(a, b)),
    all<{ user_id: string; tokens: number }>((a, b) => db.from('ai_token_transactions').select('user_id, tokens').range(a, b)),
  ]);
  const bal = (rows: { user_id: string }[], f: (r: never) => number) => { const m: Record<string, number> = {}; for (const r of rows) m[r.user_id] = (m[r.user_id] ?? 0) + f(r as never); return m; };
  const p = bal(credits, (r: { amount: number }) => r.amount), a = bal(audio, (r: { seconds: number }) => r.seconds), t = bal(tokens, (r: { tokens: number }) => r.tokens);
  return (users.data?.users ?? []).map((u) => ({
    id: u.id, email: u.email ?? '', createdAt: u.created_at, lastSignIn: u.last_sign_in_at ?? null,
    confirmed: Boolean(u.email_confirmed_at), suspended: Boolean((u as { banned_until?: string | null }).banned_until && new Date((u as { banned_until?: string }).banned_until!) > new Date()),
    cameraLicense: (u.app_metadata as Record<string, unknown>)?.['camera_license'] === true,
    points: p[u.id] ?? 0, audioSeconds: a[u.id] ?? 0, tokens: t[u.id] ?? 0,
  })).sort((x, y) => y.createdAt.localeCompare(x.createdAt));
});

export const founderAdjustBalance = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid(), wallet: z.enum(['points', 'audio_minutes', 'tokens']), amount: z.number().int().min(-1_000_000).max(1_000_000).refine((v) => v !== 0), reason: z.string().trim().min(3).max(150) }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin(context);
    const ref = `founder:${context.userId}:${crypto.randomUUID()}`;
    const reason = `Ajustement fondateur — ${data.reason}`;
    const r = data.wallet === 'points' ? await db.rpc('post_credit_operation', { p_user_id: data.userId, p_amount: data.amount, p_kind: 'adjustment', p_reason: reason, p_reference: ref })
      : data.wallet === 'audio_minutes' ? await db.rpc('post_audio_operation', { p_user_id: data.userId, p_seconds: data.amount * 60, p_kind: 'adjustment', p_reason: reason, p_reference: ref })
      : await db.rpc('post_ai_token_operation', { p_user_id: data.userId, p_tokens: data.amount, p_kind: 'adjustment', p_reason: reason, p_reference: ref });
    if (r.error) return { ok: false as const, error: /insufficient/i.test(r.error.message) ? 'Solde insuffisant pour ce retrait.' : 'Opération refusée.' };
    return { ok: true as const };
  });

export const founderNotifyUser = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid(), title: z.string().trim().min(2).max(120), message: z.string().trim().min(2).max(1000), severity: z.enum(['info', 'warning', 'critical']) }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin(context);
    const { error } = await db.from('user_notices').insert({ user_id: data.userId, title: data.title, message: data.message, severity: data.severity });
    return error ? { ok: false as const, error: 'Envoi impossible.' } : { ok: true as const };
  });

export const founderSetSuspended = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid(), suspended: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    if (data.userId === context.userId) return { ok: false as const, error: 'Vous ne pouvez pas suspendre votre propre compte.' };
    const db = await admin(context);
    const { error } = await db.auth.admin.updateUserById(data.userId, { ban_duration: data.suspended ? '876000h' : 'none' });
    return error ? { ok: false as const, error: 'Opération refusée.' } : { ok: true as const };
  });

export const founderDeleteUser = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid(), confirmEmail: z.string().email() }).parse(d))
  .handler(async ({ data, context }) => {
    if (data.userId === context.userId) return { ok: false as const, error: 'Vous ne pouvez pas supprimer votre propre compte.' };
    const db = await admin(context);
    const u = await db.auth.admin.getUserById(data.userId);
    if (u.data.user?.email?.toLowerCase() !== data.confirmEmail.toLowerCase()) return { ok: false as const, error: "L'e-mail de confirmation ne correspond pas." };
    const { error } = await db.auth.admin.deleteUser(data.userId);
    if (error) { console.error('founderDeleteUser', error.message); return { ok: false as const, error: 'Suppression impossible : le compte a un historique de paiements. Suspendez-le plutôt.' }; }
    return { ok: true as const };
  });

export const founderSetMaintenance = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ module: z.enum(MAINTENANCE_MODULES), active: z.boolean(), message: z.string().trim().max(500) }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin(context);
    const { error } = await db.from('maintenance_modules').update({ active: data.active, message: data.message, updated_at: new Date().toISOString() }).eq('module', data.module);
    return error ? { ok: false as const } : { ok: true as const };
  });

/** Live health of external providers. Replicate exposes no balance API, so only key validity and recent billing errors are reported. */
export const founderProviderHealth = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  await admin(context);
  const check = async (name: string, configured: boolean, probe?: () => Promise<Response>) => {
    if (!configured) return { name, configured, status: 'missing' as const, httpStatus: null as number | null, ms: null as number | null };
    if (!probe) return { name, configured, status: 'configured' as const, httpStatus: null, ms: null };
    const t = Date.now();
    try { const r = await probe(); return { name, configured, status: r.ok ? 'ok' as const : r.status === 402 ? 'billing' as const : 'error' as const, httpStatus: r.status, ms: Date.now() - t }; }
    catch { return { name, configured, status: 'error' as const, httpStatus: null, ms: Date.now() - t }; }
  };
  const rep = process.env['REPLICATE_API_TOKEN'];
  return Promise.all([
    check('replicate', Boolean(rep), () => fetch('https://api.replicate.com/v1/account', { headers: { Authorization: `Bearer ${rep}` } })),
    check('palabra', Boolean(process.env['PALABRA_API_KEY'])),
    check('paydunya', Boolean(process.env['PAYDUNYA_MASTER_KEY'])),
    check('deepgram', Boolean(process.env['DEEPGRAM_API_KEY'])),
    check('deepl', Boolean(process.env['DEEPL_API_KEY'])),
  ]);
});
