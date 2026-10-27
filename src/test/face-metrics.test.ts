import { describe, it, expect } from 'vitest';
import { faceState, smooth } from '@/lib/weechat/face-metrics';

const pts = () => Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5 }));
function face(noseX: number) {
  const p = pts(); p[234] = { x: 0.4, y: 0.5 }; p[454] = { x: 0.6, y: 0.5 }; p[10] = { x: 0.5, y: 0.35 }; p[152] = { x: 0.5, y: 0.65 }; p[1] = { x: noseX, y: 0.5 };
  return p;
}

describe('face metrics', () => {
  it('returns null without enough landmarks', () => { expect(faceState([], [])).toBeNull(); });
  it('centered nose gives zero yaw', () => { expect(faceState(face(0.5), [])!.yaw).toBeCloseTo(0); });
  it('nose to the right gives positive yaw', () => { expect(faceState(face(0.55), [])!.yaw).toBeGreaterThan(0.5); });
  it('reads jaw open blendshape', () => { expect(faceState(face(0.5), [{ categoryName: 'jawOpen', score: 0.7 }])!.mouth).toBe(0.7); });
  it('smooth moves halfway at alpha 0.5', () => {
    const a = faceState(face(0.5), [])!; const b = { ...a, mouth: 1 };
    expect(smooth({ ...a, mouth: 0 }, b, 0.5).mouth).toBe(0.5);
  });
});
