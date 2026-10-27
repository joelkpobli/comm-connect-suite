import { describe, expect, it } from 'vitest';
import { blockCost, canStart, secondsLeft, usageReference, usageUnit } from '@/lib/weechat/usage-meter';

describe('live usage metering (pricing page rules)', () => {
  it('Swap Live costs 2 points per second (20 per 10 s block)', () => expect(blockCost('swap_live')).toBe(20));
  it('Swap Live uses points', () => expect(usageUnit('swap_live')).toBe('points'));
  it('live translation uses the audio minutes balance, not points', () => expect(usageUnit('audio')).toBe('audio_seconds'));
  it('live translation debits 10 seconds per block', () => expect(blockCost('audio')).toBe(10));
  it('Pack Découverte 417 pts gives 3 min 28 s of Swap Live', () => expect(secondsLeft(417, 'swap_live')).toBe(208));
  it('refuses Swap Live with 19 points', () => expect(canStart(19, 'swap_live')).toBe(false));
  it('refuses translation with 5 seconds left', () => expect(canStart(5, 'audio')).toBe(false));
  it('same block of same session yields same reference (no double debit)', () => {
    expect(usageReference('audio', 'u', 's', 2)).toBe(usageReference('audio', 'u', 's', 2));
    expect(usageReference('audio', 'u', 's', 2)).not.toBe(usageReference('audio', 'u', 's', 3));
  });
});
