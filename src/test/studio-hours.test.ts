import { describe, expect, it } from 'vitest';
import { CAMERA_STUDIO_BONUS_SECONDS, studioBonusHours, studioPacks } from '@/lib/weechat/studio-hours';
describe('Approved Studio offers', () => {
  it('includes 3 days (72 hours) once with camera activation', () => expect(CAMERA_STUDIO_BONUS_SECONDS).toBe(259200));
  it.each([['decouverte', 6], ['starter', 24], ['standard', 72], ['premium', 168], ['ultimate', 720]] as const)
   ('%s includes %s hours', (id, hours) => expect(studioBonusHours[id]).toBe(hours));
  it.each([['studio-week', 168, 3000], ['studio-month', 720, 10000], ['studio-year', 8760, 50000]] as const)
   ('%s has the approved duration and price', (id, hours, amountXOF) => expect(studioPacks.find(p => p.id === id)).toMatchObject({ hours, amountXOF }));
});