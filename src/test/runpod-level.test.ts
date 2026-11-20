import { describe, it, expect } from 'vitest';
import { runpodLevel } from '@/lib/weechat/founder-shared';
describe('runpod balance alert', () => {
  it('critical under 1 $', () => expect(runpodLevel(0.99)).toBe('billing'));
  it('warning under 3 $', () => expect(runpodLevel(2.5)).toBe('low'));
  it('ok from 3 $', () => expect(runpodLevel(9.51)).toBe('ok'));
});
import { palabraLevel } from '@/lib/weechat/founder-shared';
describe('palabra minutes alert', () => {
  it('critical under 15 min', () => expect(palabraLevel(14)).toBe('billing'));
  it('warning under 60 min', () => expect(palabraLevel(30)).toBe('low'));
  it('ok from 60 min', () => expect(palabraLevel(60)).toBe('ok'));
});
