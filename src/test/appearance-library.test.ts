import { describe, expect, it } from 'vitest';
import { APPEARANCE_PRICE_TOKENS, BG_CATEGORIES, libraryAvatars, libraryBackgrounds, parsePrefs, placeAvatar } from '@/lib/weechat/appearance-library';
import { personas, backgrounds } from '@/lib/weechat/persona-catalog';

describe('appearance library', () => {
  it('keeps every existing avatar and background', () => {
    for (const p of personas) expect(libraryAvatars.some(a => a.id === p.id)).toBe(true);
    for (const b of backgrounds) expect(libraryBackgrounds.some(x => x.id === b.id)).toBe(true);
  });
  it('every category has backgrounds and every item has a licence credit', () => {
    for (const c of BG_CATEGORIES) expect(libraryBackgrounds.filter(b => b.cat === c).length).toBeGreaterThan(2);
    expect([...libraryAvatars, ...libraryBackgrounds].every(x => /Pexels|Wikimedia/.test(x.credit))).toBe(true);
  });
  it('has no duplicate ids', () => {
    const ids = [...libraryAvatars, ...libraryBackgrounds].map(x => x.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('is free', () => { expect(APPEARANCE_PRICE_TOKENS).toBe(0); });
  it('restores saved prefs and clamps bad values', () => {
    const p = parsePrefs(JSON.stringify({ avatarId: 'm1', backgroundId: 'office-4', scale: 9, x: 0.2 }));
    expect(p).toMatchObject({ avatarId: 'm1', backgroundId: 'office-4', scale: 1.6, x: 0.2 });
    expect(parsePrefs('not json').scale).toBe(1);
  });
  it('size and position move the figure', () => {
    const a = placeAvatar(1280, 720, 300, 900, 'stand', { scale: 1, x: 0, y: 0 });
    const b = placeAvatar(1280, 720, 300, 900, 'stand', { scale: 1.2, x: 0.1, y: 0 });
    expect(b.h).toBeCloseTo(a.h * 1.2); expect(b.x + b.w / 2).toBeCloseTo(a.x + a.w / 2 + 128);
  });
});
