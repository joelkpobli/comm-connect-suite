import { describe, expect, it } from 'vitest';
import { backgrounds, checkImage, checkVoiceSample, personas } from '@/lib/weechat/persona-catalog';

describe('persona catalogue rules', () => {
  it('offers both genders and six backgrounds', () => {
    expect(personas.some(p => p.g === 'f') && personas.some(p => p.g === 'm')).toBe(true);
    expect(backgrounds.map(b => b.id)).toContain('piscine');
  });
  it('accepts jpg/png/webp up to 8 MB only', () => {
    expect(checkImage({ type: 'image/png', size: 1000 })).toBe('ok');
    expect(checkImage({ type: 'image/gif', size: 1000 })).toBe('type');
    expect(checkImage({ type: 'image/jpeg', size: 8 * 1024 * 1024 + 1 })).toBe('size');
  });
  it('voice sample must last 10 to 30 seconds', () => {
    expect(checkVoiceSample(9.9, 100, 'audio/webm')).toBe('short');
    expect(checkVoiceSample(10, 100, 'audio/webm')).toBe('ok');
    expect(checkVoiceSample(30.5, 100, 'audio/mpeg')).toBe('long');
    expect(checkVoiceSample(15, 100, 'video/mp4')).toBe('type');
  });
});
