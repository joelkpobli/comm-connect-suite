import { describe, it, expect } from 'vitest';
import { runpodLevel } from '@/lib/weechat/founder-shared';
describe('runpod balance alert', () => {
  it('critical under 1 $', () => expect(runpodLevel(0.99)).toBe('billing'));
  it('warning under 3 $', () => expect(runpodLevel(2.5)).toBe('low'));
  it('ok from 3 $', () => expect(runpodLevel(9.51)).toBe('ok'));
});
