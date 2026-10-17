import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';
const url = process.env['SUPABASE_URL']; const key = process.env['SUPABASE_SERVICE_ROLE_KEY'];
const pub = process.env['SUPABASE_PUBLISHABLE_KEY'];
describe.skipIf(!url || !key || !pub)('Real credit ledger', () => {
 let admin: SupabaseClient; let user: SupabaseClient; let visitor: SupabaseClient; let id = ''; let other = '';
 const password = `T3st-${crypto.randomUUID()}`;
 beforeAll(async () => {
  if (!url || !key || !pub) throw new Error('Missing test environment');
  admin = createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  user = createClient(url,pub,{auth:{persistSession:false,autoRefreshToken:false}});
  visitor = createClient(url,pub,{auth:{persistSession:false,autoRefreshToken:false}});
  for (const tag of ['a','b']) {
   const email = `credits-${tag}-${crypto.randomUUID()}@example.com`;
   const {data,error} = await admin.auth.admin.createUser({email,password,email_confirm:true});
   if(error) throw error;
   if(tag==='a') { id=data.user.id; const result=await user.auth.signInWithPassword({email,password}); if(result.error) throw result.error; } else other=data.user.id;
  }
 },30000);
 afterAll(async()=>{ for(const uid of [id,other]) if(uid) await admin.auth.admin.deleteUser(uid); });
 const post = (amount:number,reference:string,kind='adjustment',uid=id) => admin.rpc('post_credit_operation',{p_user_id:uid,p_amount:amount,p_kind:kind,p_reason:'Test',p_reference:reference});
 it('starts at zero',async()=>{expect((await user.rpc('get_credit_totals')).data?.[0].balance).toBe(0);});
 it('credits 100 and debits 30 atomically',async()=>{
  expect((await post(100,crypto.randomUUID())).error).toBeNull();
  expect((await post(-30,crypto.randomUUID(),'usage')).error).toBeNull();
  expect((await user.rpc('get_credit_totals')).data?.[0]).toEqual({balance:70,received:100,consumed:30});
 });
 it('applies concurrent duplicate retries once',async()=>{
  const ref=crypto.randomUUID(); const results=await Promise.all([post(10,ref),post(10,ref)]);
  expect(results.every(r=>r.error===null)).toBe(true); expect(results[0].data).toBe(results[1].data);
  expect((await user.rpc('get_credit_totals')).data?.[0].balance).toBe(80);
  expect((await post(11,ref)).error).not.toBeNull();
 });
 it('rejects insufficient funds without changing balance',async()=>{
  expect((await post(-81,crypto.randomUUID(),'usage')).error).not.toBeNull();
  expect((await user.rpc('get_credit_totals')).data?.[0].balance).toBe(80);
 });
 it('rejects invalid operations and retry after failed operation succeeds once',async()=>{
  const ref=crypto.randomUUID(); expect((await post(0,ref)).error).not.toBeNull();
  expect((await post(5,ref)).error).toBeNull();
  expect((await post(5,ref)).error).toBeNull();
  expect((await user.rpc('get_credit_totals')).data?.[0].balance).toBe(85);
 });
 it('serializes concurrent debits against insufficient balance',async()=>{
  const result=await Promise.all([post(-60,crypto.randomUUID(),'usage'),post(-60,crypto.randomUUID(),'usage')]);
  expect(result.filter(r=>r.error===null)).toHaveLength(1);
  expect((await user.rpc('get_credit_totals')).data?.[0].balance).toBe(25);
 });
 it('hides another account and denies browser writes',async()=>{
  expect((await post(20,crypto.randomUUID(),'adjustment',other)).error).toBeNull();
  expect((await user.from('credit_transactions').select('id').eq('user_id',other)).data).toEqual([]);
  expect((await user.rpc('post_credit_operation',{p_user_id:id,p_amount:999,p_kind:'adjustment',p_reason:'Attack',p_reference:crypto.randomUUID()})).error).not.toBeNull();
  expect((await user.from('credit_transactions').insert({user_id:id,amount:999,kind:'adjustment',reason:'Attack',reference:crypto.randomUUID()})).error).not.toBeNull();
  expect((await visitor.from('credit_transactions').select('id')).error).not.toBeNull();
 });
 it('preserves immutable history',async()=>{
  const {data}=await user.from('credit_transactions').select('id').limit(1); const tx=data?.[0]?.id;
  expect(tx).toBeTruthy();
  expect((await admin.from('credit_transactions').update({amount:999}).eq('id',tx)).error).not.toBeNull();
 });
 it('returns coherent totals and movements in one snapshot',async()=>{
  const {data,error}=await user.rpc('get_credit_snapshot');
  expect(error).toBeNull();
  expect(data.totals.balance).toBe(25);
  expect(data.entries.reduce((sum:number,row:{amount:number})=>sum+row.amount,0)).toBe(25);
  expect((await visitor.rpc('get_credit_snapshot')).error).not.toBeNull();
 });
});
