import { describe, expect, it } from 'vitest';
import { featureCapabilities, usagePolicy } from '@/lib/weechat/feature-status';

describe('Verified feature boundaries', () => {
  it('does not bill the unlinked Windows swap trial', () => {
    expect(featureCapabilities.swap.accountLinked).toBe(false);
    expect(featureCapabilities.swap.metered).toBe(false);
  });
  it('retains the specified Swap Live rate of 2 points per second', () => {
    expect(usagePolicy.swapPointsPerSecond).toBe(2);
    expect(usagePolicy.blockSeconds).toBe(10);
  });
  it('never enables purchases while payments are inactive', () => expect(featureCapabilities.payment.enabled).toBe(false));
  it('does not charge for disconnected photo generation', () => {
    expect(featureCapabilities.photo.engineConnected).toBe(false);
    expect(featureCapabilities.photo.metered).toBe(false);
  });
});