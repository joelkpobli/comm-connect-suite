import { beforeEach, describe, expect, it, vi } from 'vitest';
import { grantItem } from '@/lib/weechat/fulfillment.server';
import { findItem } from '@/lib/weechat/catalog';
const { rpc, getUser } = vi.hoisted(() => ({ rpc: vi.fn(), getUser: vi.fn() }));
vi.mock('@/integrations/supabase/client.server', () => ({ supabaseAdmin: { rpc, auth: { admin: { getUserById: getUser } } } }));
beforeEach(() => {
  vi.clearAllMocks();
  rpc.mockImplementation(async (name: string) => ({ error: null, data: name === 'studio_hours_ready' ? true : 1 }));
  getUser.mockResolvedValue({ data: { user: { app_metadata: { camera_license: true } } }, error: null });
});
describe('Verified Studio fulfillment', () => {
  it.each([['decouverte',6],['starter',24],['standard',72],['premium',168],['ultimate',720]] as const)('%s credits %s hours with an idempotent purchase reference', async (id,hours) => {
    const item = findItem(id); if (!item) throw new Error('Missing item');
    await grantItem(item,'owner','whop:verified','Whop');
    expect(rpc).toHaveBeenCalledWith('post_studio_operation',expect.objectContaining({ p_user_id:'owner',p_seconds:hours*3600,p_reference:'studio:whop:verified' }));
    expect(rpc).toHaveBeenCalledWith('post_credit_operation',expect.objectContaining({p_amount:item.points}));
  });
  it('camera gift uses an owner-specific 72-hour reference independent of invoices',async()=>{
    const item=findItem('camera-license'); if(!item) throw new Error('Missing item');
    await grantItem(item,'owner','whop:first','Whop');
    await grantItem(item,'owner','whop:second','Whop');
    const gifts=rpc.mock.calls.filter(c=>c[0]==='post_studio_operation');
    expect(gifts).toHaveLength(2);
    for(const call of gifts) expect(call[1]).toMatchObject({p_seconds:259200,p_reference:'camera-welcome:owner'});
  });
  it('dedicated pack never credits GPU points or AI tokens',async()=>{
    const item=findItem('studio-month'); if(!item) throw new Error('Missing item');
    await grantItem(item,'owner','whop:month','Whop');
    expect(rpc).toHaveBeenCalledWith('post_studio_operation',expect.objectContaining({p_seconds:2592000}));
    expect(rpc.mock.calls.some(c=>['post_credit_operation','post_ai_token_operation'].includes(c[0] as string))).toBe(false);
  });
  it('refuses dedicated fulfillment when Studio is unavailable',async()=>{
    rpc.mockResolvedValue({error:null,data:false});
    const item=findItem('studio-week'); if(!item) throw new Error('Missing item');
    await expect(grantItem(item,'owner','whop:week','Whop')).rejects.toThrow('Studio fulfillment unavailable');
    expect(rpc).toHaveBeenCalledTimes(1);
  });
});