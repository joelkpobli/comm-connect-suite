import { describe, expect, it } from 'vitest';
import { isLow, lowBalanceKey } from '@/lib/weechat/low-balance';

describe('low balance alert', () => {
  it('Swap Live alerts under 120 points', () => { expect(isLow('swap_live', 119)).toBe(true); expect(isLow('swap_live', 120)).toBe(false); });
  it('translation alerts under 2 minutes', () => { expect(isLow('audio', 119)).toBe(true); expect(isLow('audio', 120)).toBe(false); });
  it('sends at most one email per day per service', () => {
    const u = '00000000-0000-0000-0000-000000000001';
    expect(lowBalanceKey('swap_live', u, new Date('2026-11-23T08:00:00Z'))).toBe(lowBalanceKey('swap_live', u, new Date('2026-11-23T22:00:00Z')));
    expect(lowBalanceKey('swap_live', u, new Date('2026-11-23T08:00:00Z'))).not.toBe(lowBalanceKey('swap_live', u, new Date('2026-11-24T08:00:00Z')));
  });
});
