import { describe, expect, it } from 'vitest';
import { profileSchema } from '@/lib/weechat/profile-schema';
const input = { display_name: 'Joël', ui_locale: 'fr', voice_language: 'pt' };
describe('Profile preferences', () => {
  it('accepts only French and English UI locales', () => {
    expect(profileSchema.safeParse({ ...input, ui_locale: 'en' }).success).toBe(true);
    expect(profileSchema.safeParse({ ...input, ui_locale: 'es' }).success).toBe(false);
  });
  it('supports five independent vocal preferences', () => {
    for (const voice_language of ['fr', 'en', 'es', 'de', 'pt']) expect(profileSchema.safeParse({ ...input, voice_language }).success).toBe(true);
    expect(profileSchema.safeParse({ ...input, voice_language: 'xx' }).success).toBe(false);
  });
  it('limits names to 80 characters', () => {
    expect(profileSchema.safeParse({ ...input, display_name: 'x'.repeat(80) }).success).toBe(true);
    expect(profileSchema.safeParse({ ...input, display_name: 'x'.repeat(81) }).success).toBe(false);
  });
});