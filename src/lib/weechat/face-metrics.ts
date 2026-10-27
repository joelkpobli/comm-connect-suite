/** Pure helpers turning MediaPipe face results into simple head/expression values. */
export type Blend = { categoryName: string; score: number };
export type Pt = { x: number; y: number; z?: number };
export type FaceState = { yaw: number; pitch: number; roll: number; mouth: number; blink: number; smile: number; cx: number; cy: number; size: number };

const score = (b: Blend[], n: string) => b.find(c => c.categoryName === n)?.score ?? 0;

export function faceState(pts: Pt[], blends: Blend[]): FaceState | null {
  if (pts.length < 455) return null;
  const L = pts[234]!, R = pts[454]!, nose = pts[1]!, top = pts[10]!, chin = pts[152]!;
  const w = Math.hypot(R.x - L.x, R.y - L.y) || 1e-6;
  const h = Math.hypot(chin.x - top.x, chin.y - top.y) || 1e-6;
  const mx = (L.x + R.x) / 2, my = (top.y + chin.y) / 2;
  const clamp = (v: number) => Math.max(-1, Math.min(1, v));
  return {
    yaw: clamp(((nose.x - mx) / w) * 4),
    pitch: clamp(((nose.y - my) / h) * 4),
    roll: Math.atan2(R.y - L.y, R.x - L.x),
    mouth: score(blends, 'jawOpen'),
    blink: (score(blends, 'eyeBlinkLeft') + score(blends, 'eyeBlinkRight')) / 2,
    smile: (score(blends, 'mouthSmileLeft') + score(blends, 'mouthSmileRight')) / 2,
    cx: mx, cy: my, size: Math.max(w, h),
  };
}

/** Exponential smoothing to avoid jitter; alpha in (0,1]. */
export function smooth(prev: FaceState | null, next: FaceState, alpha = 0.5): FaceState {
  if (!prev) return next;
  const o = {} as FaceState;
  (Object.keys(next) as (keyof FaceState)[]).forEach(k => { o[k] = prev[k] + (next[k] - prev[k]) * alpha; });
  return o;
}
