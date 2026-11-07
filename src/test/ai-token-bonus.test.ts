import { describe, it, expect } from 'vitest';
import { findItem } from '@/lib/weechat/paydunya-catalog';
describe('AI token bonus', () => {
  it('Starter gives 100', () => expect(findItem('starter')?.aiTokens).toBe(100));
  it('Standard gives 200', () => expect(findItem('standard')?.aiTokens).toBe(200));
  it('Premium gives 450', () => expect(findItem('premium')?.aiTokens).toBe(450));
  it('Ultimate gives 1000', () => expect(findItem('ultimate')?.aiTokens).toBe(1000));
  it('Découverte gives none', () => expect(findItem('decouverte')?.aiTokens).toBe(0));
  it('Découverte valid 7 days', () => expect(findItem('decouverte')?.validityDays).toBe(7));
});
