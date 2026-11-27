import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Route } from '@/routes/api/public/desktop-charge';
const { rpc, user } = vi.hoisted(()=>({rpc:vi.fn(),user:vi.fn()}));
vi.mock('@tanstack/react-router',()=>({createFileRoute:()=> (options:unknown)=>options}));
vi.mock('@/integrations/supabase/client.server',()=>({supabaseAdmin:{rpc,auth:{getUser:user}}}));
const route=Route as unknown as {server:{handlers:{POST:(args:{request:Request})=>Promise<Response>}}};
const request=()=>new Request('https://www.weechat.online/api/public/desktop-charge',{method:'POST',headers:{authorization:'Bearer test-session','content-type':'application/json'},body:JSON.stringify({service:'studio_diffusion',sessionId:'00000000-0000-4000-8000-000000000001',block:0})});
beforeEach(()=>{
 vi.clearAllMocks();user.mockResolvedValue({data:{user:{id:'owner',app_metadata:{camera_license:true}}},error:null});
 rpc.mockImplementation(async(name:string)=>({data:name==='studio_hours_ready'?true:259190,error:null}));
});
describe('Studio Windows consumption',()=>{
 it('debits 10 Studio seconds, never GPU points',async()=>{
  const r=await route.server.handlers.POST({request:request()});
  expect(await r.json()).toMatchObject({ok:true,balance:259190,wallet:'studio',cost:10});
  expect(rpc).toHaveBeenCalledWith('post_studio_operation',expect.objectContaining({p_seconds:-10,p_user_id:'owner',p_reference:'desktop:studio:owner:00000000-0000-4000-8000-000000000001:0'}));
  expect(rpc.mock.calls.some(c=>c[0]==='post_credit_operation')).toBe(false);
 });
 it('does not fall back to points when Studio is unavailable',async()=>{
  rpc.mockResolvedValue({data:false,error:null});
  expect((await route.server.handlers.POST({request:request()})).status).toBe(503);
  expect(rpc).toHaveBeenCalledTimes(1);
 });
 it('requires camera licence before any usage debit',async()=>{
  user.mockResolvedValue({data:{user:{id:'owner',app_metadata:{}}},error:null});
  expect((await route.server.handlers.POST({request:request()})).status).toBe(403);
  expect(rpc).not.toHaveBeenCalled();
 });
});