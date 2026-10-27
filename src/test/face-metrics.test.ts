import { describe, it, expect } from 'vitest';
import { faceState, smooth, faceGeometry, blinkThreshold } from '@/lib/weechat/face-metrics';

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

describe('faceGeometry', () => {
  it('returns null without a full face mesh', () => { expect(faceGeometry([])).toBeNull(); });
  it('places the jaw below the lips and above the chin', () => {
    const pts = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5 }));
    pts[13] = { x: 0.5, y: 0.6 }; pts[14] = { x: 0.5, y: 0.62 }; pts[152] = { x: 0.5, y: 0.8 };
    pts[61] = { x: 0.4, y: 0.61 }; pts[291] = { x: 0.6, y: 0.61 };
    const g = faceGeometry(pts)!;
    expect(g.jaw.y).toBeCloseTo(0.61);
    expect(g.jaw.h).toBeCloseTo(0.19);
    expect(g.mouth.w).toBeCloseTo(0.2);
  });
});

describe('blinkThreshold', () => {
  it('keeps the normal threshold at sensitivity 1', () => { expect(blinkThreshold(1)).toBeCloseTo(0.35); });
  it('reacts earlier at higher sensitivity', () => { expect(blinkThreshold(2)).toBeCloseTo(0.1); });
  it('reacts later at lower sensitivity', () => { expect(blinkThreshold(0.2)).toBeCloseTo(0.55); });
});
