import { describe, expect, it } from 'vitest';
import { canStart, minuteCost, minutesLeft, usageReference } from '@/lib/weechat/usage-meter';

describe('live usage metering', () => {
  it('audio translation costs 1 point per minute', () => expect(minuteCost('audio')).toBe(1));
  it('Swap Live costs 3 points per minute', () => expect(minuteCost('swap_live')).toBe(3));
  it('refuses to start Swap Live with 2 points', () => expect(canStart(2, 'swap_live')).toBe(false));
  it('allows audio with 1 point', () => expect(canStart(1, 'audio')).toBe(true));
  it('10 points give 3 Swap Live minutes', () => expect(minutesLeft(10, 'swap_live')).toBe(3));
  it('same minute of same session yields the same reference (no double debit)', () => {
    expect(usageReference('audio', 'u', 's', 2)).toBe(usageReference('audio', 'u', 's', 2));
    expect(usageReference('audio', 'u', 's', 2)).not.toBe(usageReference('audio', 'u', 's', 3));
  });
});
