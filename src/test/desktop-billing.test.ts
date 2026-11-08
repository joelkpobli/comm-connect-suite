import { describe, expect, it } from 'vitest';
import { desktopBlockCost } from '@/lib/weechat/desktop-billing';

describe('desktop billing', () => {
  it('Studio Diffusion costs 1 point per second (10 per block)', () => expect(desktopBlockCost('studio_diffusion')).toBe(10));
  it('Swap Live costs 2 points per second (20 per block)', () => expect(desktopBlockCost('swap_live')).toBe(20));
});
