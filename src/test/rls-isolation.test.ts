// Negative access tests against the real weechat-production database.
// Runs only when the server key is available (never in the browser); creates two
// throwaway confirmed accounts and deletes them afterwards.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const URL = process.env['SUPABASE_URL'];
const SERVICE = process.env['SUPABASE_SERVICE_ROLE_KEY'];
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzYWlydXdkZW14bndka2hwenN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxMTE3NzQsImV4cCI6MjEwNzY4Nzc3NH0.uHihAQ6uLE_dkQDamLA4VI3ZbTk5XqjAjhVeXeoCMMQ';
const opts = { auth: { persistSession: false, autoRefreshToken: false } };

describe.skipIf(!URL || !SERVICE)('Isolation des comptes (base réelle)', () => {
  let admin: SupabaseClient; let a: SupabaseClient; let anon: SupabaseClient;
  let idA = ''; let idB = '';
  const pwd = `T3st-${crypto.randomUUID()}`;

  async function makeUser(tag: string) {
    const email = `rls-${tag}-${Date.now()}@example.com`;
    const { data, error } = await admin.auth.admin.createUser({ email, password: pwd, email_confirm: true, user_metadata: { display_name: `Essai ${tag}` } });
    if (error) throw error;
    return { id: data.user.id, email };
  }

  beforeAll(async () => {
    admin = createClient(URL!, SERVICE!, opts);
    anon = createClient(URL!, ANON, opts);
    const ua = await makeUser('a'); const ub = await makeUser('b');
    idA = ua.id; idB = ub.id;
    a = createClient(URL!, ANON, opts);
    const { error } = await a.auth.signInWithPassword({ email: ua.email, password: pwd });
    if (error) throw error;
  }, 30000);

  afterAll(async () => {
    for (const id of [idA, idB]) if (id) await admin.auth.admin.deleteUser(id);
  });

  it('lit son propre profil et son rôle user', async () => {
    const { data } = await a.from('profiles').select('id').eq('id', idA);
    expect(data).toHaveLength(1);
    const { data: roles } = await a.from('user_roles').select('role');
    expect(roles?.map(r => r.role)).toEqual(['user']);
  });

  it('ne voit pas le profil d’un autre', async () => {
    const { data } = await a.from('profiles').select('id').eq('id', idB);
    expect(data).toEqual([]);
    const { data: all } = await a.from('profiles').select('id');
    expect(all?.map(r => r.id)).toEqual([idA]);
  });

  it('ne peut pas modifier le profil d’un autre', async () => {
    await a.from('profiles').update({ display_name: 'piraté' }).eq('id', idB);
    const { data } = await admin.from('profiles').select('display_name').eq('id', idB).single();
    expect(data?.display_name).toBe('Essai b');
  });

  it('ne peut ni créer ni supprimer de profil', async () => {
    expect((await a.from('profiles').insert({ id: crypto.randomUUID() })).error).not.toBeNull();
    await a.from('profiles').delete().eq('id', idA);
    expect((await admin.from('profiles').select('id').eq('id', idA)).data).toHaveLength(1);
  });

  it('ne peut pas modifier les dates de son profil', async () => {
    const { error } = await a.from('profiles').update({ created_at: '2000-01-01T00:00:00Z' }).eq('id', idA);
    expect(error).not.toBeNull();
  });

  it('refuse une langue inconnue', async () => {
    const { error } = await a.from('profiles').update({ ui_locale: 'xx' }).eq('id', idA);
    expect(error).not.toBeNull();
  });

  it('ne peut pas s’attribuer le rôle admin', async () => {
    expect((await a.from('user_roles').insert({ user_id: idA, role: 'admin' })).error).not.toBeNull();
    expect((await admin.rpc('has_role', { _user_id: idA, _role: 'admin' })).data).toBe(false);
  });

  it('ne peut ni modifier ni supprimer son rôle', async () => {
    await a.from('user_roles').update({ role: 'admin' }).eq('user_id', idA);
    await a.from('user_roles').delete().eq('user_id', idA);
    const { data } = await admin.from('user_roles').select('role').eq('user_id', idA);
    expect(data?.map(r => r.role)).toEqual(['user']);
  });

  it('ne voit pas les rôles d’un autre', async () => {
    const { data } = await a.from('user_roles').select('user_id').eq('user_id', idB);
    expect(data).toEqual([]);
  });

  it('un visiteur non connecté ne lit rien', async () => {
    expect((await anon.from('profiles').select('id')).error).not.toBeNull();
    expect((await anon.from('user_roles').select('id')).error).not.toBeNull();
  });

  it('personne ne peut lancer rls_auto_enable', async () => {
    expect((await a.rpc('rls_auto_enable' as never)).error).not.toBeNull();
    expect((await anon.rpc('rls_auto_enable' as never)).error).not.toBeNull();
  });
});
