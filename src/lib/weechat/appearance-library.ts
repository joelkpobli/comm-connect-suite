// Free appearance library: real photographs only (Wikimedia Commons + Pexels), no AI imagery, no token cost.
import { personas, backgrounds as legacyBackgrounds, type Gender } from './persona-catalog';
import newAvatars from './library-avatars.json';
import newBackgrounds from './library-backgrounds.json';

export type AvatarPose = 'stand' | 'sit' | 'half';
export type BgCategory = 'home' | 'office' | 'hotel' | 'outdoor' | 'other';
export interface LibAvatar { id: string; src: string; g: Gender; pose: AvatarPose; credit: string; page?: string; personal?: boolean }
export interface LibBackground { id: string; src: string; cat: BgCategory; credit: string; page?: string; personal?: boolean }

const legacyBgCat: Record<string, BgCategory> = { salon: 'home', villa: 'home', piscine: 'outdoor', piscine2: 'outdoor', jardin: 'outdoor' };

export const libraryAvatars: LibAvatar[] = [
  ...personas.map(p => ({ id: p.id, src: p.src, g: p.g, pose: 'stand' as const, credit: p.credit })),
  ...newAvatars.map(a => ({ id: a.id, src: a.url, g: a.g as Gender, pose: a.pose as AvatarPose, credit: a.credit, page: a.page })),
];
export const libraryBackgrounds: LibBackground[] = [
  ...legacyBackgrounds.map(b => ({ id: b.id, src: b.src, cat: legacyBgCat[b.id] ?? 'other', credit: b.credit })),
  ...newBackgrounds.map(b => ({ id: b.id, src: b.url, cat: b.cat as BgCategory, credit: `${b.source} · ${b.title}${b.author ? ` · ${b.author}` : ''} · ${b.license}`, page: b.page })),
];
export const BG_CATEGORIES: BgCategory[] = ['home', 'office', 'hotel', 'outdoor', 'other'];

export const APPEARANCE_PRICE_TOKENS = 0; // the whole library is free

export interface AppearancePrefs { avatarId: string; backgroundId: string; scale: number; x: number; y: number; blur: number; shadow: number }
export const DEFAULT_PREFS: AppearancePrefs = { avatarId: libraryAvatars[0]!.id, backgroundId: libraryBackgrounds[0]!.id, scale: 1, x: 0, y: 0, blur: 0, shadow: 5 };
export const PREFS_KEY = 'weechat.appearance.v1';
const clamp = (v: unknown, lo: number, hi: number, d: number) => typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d;

/** Parses stored preferences safely; unknown or corrupted values fall back to defaults. */
export function parsePrefs(raw: string | null): AppearancePrefs {
  let o: Record<string, unknown> = {};
  try { const v = raw ? JSON.parse(raw) : {}; if (v && typeof v === 'object') o = v; } catch { /* defaults */ }
  return {
    avatarId: typeof o.avatarId === 'string' ? o.avatarId : DEFAULT_PREFS.avatarId,
    backgroundId: typeof o.backgroundId === 'string' ? o.backgroundId : DEFAULT_PREFS.backgroundId,
    scale: clamp(o.scale, 0.4, 1.6, 1), x: clamp(o.x, -0.5, 0.5, 0), y: clamp(o.y, -0.4, 0.4, 0),
    blur: clamp(o.blur, 0, 8, 0), shadow: clamp(o.shadow, 0, 10, 5),
  };
}

/** Figure rectangle in the frame. Feet stay on the floor line; scale/offsets are user adjustments. */
export function placeAvatar(W: number, H: number, iw: number, ih: number, pose: AvatarPose, p: Pick<AppearancePrefs, 'scale' | 'x' | 'y'>) {
  const base = pose === 'stand' ? 0.86 : pose === 'sit' ? 0.7 : 0.78;
  const h = H * base * p.scale; const w = h * (iw / ih);
  const bottom = pose === 'half' ? H : H * 0.97;
  const floor = bottom + p.y * H;
  return { x: (W - w) / 2 + p.x * W, y: floor - h, w, h, floor };
}
