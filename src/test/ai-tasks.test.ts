import { describe, it, expect } from 'vitest';
import { aiTaskCost, aiTaskWallet, aiTaskReference, CHARACTER_SWAP_MAX_SECONDS } from '@/lib/weechat/ai-pricing';
import { getAdapter, AdapterUnavailable } from '@/lib/weechat/ai-adapters.server';
describe('AI async tasks', () => {
  it('image costs 5 tokens each', () => expect(aiTaskCost('image_generation', 2)).toBe(10));
  it('talking photo costs 6 tokens per second', () => expect(aiTaskCost('talking_photo', 5)).toBe(30));
  it('rejects too many images', () => expect(() => aiTaskCost('image_generation', 5)).toThrow());
  it('rejects talking photo over 15 s', () => expect(() => aiTaskCost('talking_photo', 16)).toThrow());
  it('refund reference differs from debit', () => expect(aiTaskReference('talking_photo', 'u', 't', true)).not.toBe(aiTaskReference('talking_photo', 'u', 't')));
  it('swap photo costs 2 tokens', () => expect(aiTaskCost('face_swap', 1)).toBe(2));
  it('full transformation costs 5 points per second', () => expect(aiTaskCost('character_swap', 10)).toBe(50));
  it('full transformation uses the points wallet', () => expect(aiTaskWallet('character_swap')).toBe('points'));
  it('other AI tasks keep their token wallet', () => { for (const kind of ['face_swap', 'image_generation', 'talking_photo'] as const) expect(aiTaskWallet(kind)).toBe('tokens'); });
  it('accepts the chosen maximum of 15 seconds for 75 points', () => { expect(CHARACTER_SWAP_MAX_SECONDS).toBe(15); expect(aiTaskCost('character_swap', 15)).toBe(75); });
  it('rejects full transformation over 15 s', () => expect(() => aiTaskCost('character_swap', 16)).toThrow());
  it('fails closed without provider', () => { const t = process.env['REPLICATE_API_TOKEN']; delete process.env['REPLICATE_API_TOKEN']; expect(() => getAdapter('image_generation')).toThrow(AdapterUnavailable); if (t) process.env['REPLICATE_API_TOKEN'] = t; });
});
