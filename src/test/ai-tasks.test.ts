import { describe, it, expect } from 'vitest';
import { aiTaskCost, aiTaskReference } from '@/lib/weechat/ai-pricing';
import { getAdapter, AdapterUnavailable } from '@/lib/weechat/ai-adapters.server';
describe('AI async tasks', () => {
  it('image costs 5 tokens each', () => expect(aiTaskCost('image_generation', 2)).toBe(10));
  it('talking photo costs 3 tokens per second', () => expect(aiTaskCost('talking_photo', 5)).toBe(15));
  it('rejects too many images', () => expect(() => aiTaskCost('image_generation', 5)).toThrow());
  it('rejects talking photo over 15 s', () => expect(() => aiTaskCost('talking_photo', 16)).toThrow());
  it('refund reference differs from debit', () => expect(aiTaskReference('talking_photo', 'u', 't', true)).not.toBe(aiTaskReference('talking_photo', 'u', 't')));
  it('swap photo costs 2 tokens', () => expect(aiTaskCost('face_swap', 1)).toBe(2));
  it('fails closed without provider', () => { const t = process.env['REPLICATE_API_TOKEN']; delete process.env['REPLICATE_API_TOKEN']; expect(() => getAdapter('image_generation')).toThrow(AdapterUnavailable); if (t) process.env['REPLICATE_API_TOKEN'] = t; });
});
