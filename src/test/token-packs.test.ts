import { describe, it, expect } from 'vitest';
import { findItem } from '@/lib/weechat/paydunya-catalog';

describe('AI token packs', () => {
  it.each([['tokens-100', 1000, 100], ['tokens-260', 2500, 260], ['tokens-550', 5000, 550], ['tokens-1200', 10000, 1200]])('%s costs %i FCFA for %i tokens', (id, xof, tokens) => {
    const i = findItem(id)!;
    expect(i.amountXOF).toBe(xof); expect(i.aiTokens).toBe(tokens); expect(i.points).toBe(0); expect(i.audioSeconds).toBe(0);
  });
});
