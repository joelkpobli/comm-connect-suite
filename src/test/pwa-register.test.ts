import { describe, it, expect } from 'vitest';
import { isSwAllowed } from '@/lib/pwa-register';
describe('offline worker guard', () => {
  it('allows the published site', () => expect(isSwAllowed('comm-connect-suite.lovable.app', false, '', true)).toBe(true));
  it('refuses the Lovable preview', () => expect(isSwAllowed('id-preview--bb7dacc9.lovable.app', false, '', true)).toBe(false));
  it('refuses inside an iframe', () => expect(isSwAllowed('comm-connect-suite.lovable.app', true, '', true)).toBe(false));
  it('refuses in development', () => expect(isSwAllowed('localhost', false, '', false)).toBe(false));
  it('honours ?sw=off', () => expect(isSwAllowed('comm-connect-suite.lovable.app', false, '?sw=off', true)).toBe(false));
});
