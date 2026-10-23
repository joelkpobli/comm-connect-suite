// Catalogue images are AI-generated for Weechat (no third-party rights). Uploads stay in the browser only.
import p1 from '@/assets/personas/p1.jpg';
import p2 from '@/assets/personas/p2.jpg';
import p3 from '@/assets/personas/p3.jpg';
import p4 from '@/assets/personas/p4.jpg';
import p5 from '@/assets/personas/p5.jpg';
import p6 from '@/assets/personas/p6.jpg';
import salon from '@/assets/backgrounds/salon.jpg';
import piscine from '@/assets/backgrounds/piscine.jpg';
import bain from '@/assets/backgrounds/bain.jpg';
import bureau from '@/assets/backgrounds/bureau.jpg';
import cafe from '@/assets/backgrounds/cafe.jpg';
import jardin from '@/assets/backgrounds/jardin.jpg';

export type Gender = 'f' | 'm';
export const personas = [
  { id: 'p1', src: p1, g: 'f' as Gender, age: '30' },
  { id: 'p2', src: p2, g: 'm' as Gender, age: '40' },
  { id: 'p3', src: p3, g: 'f' as Gender, age: '20' },
  { id: 'p4', src: p4, g: 'm' as Gender, age: '20' },
  { id: 'p5', src: p5, g: 'f' as Gender, age: '50' },
  { id: 'p6', src: p6, g: 'm' as Gender, age: '60' },
];
export const backgrounds = [
  { id: 'salon', src: salon }, { id: 'piscine', src: piscine }, { id: 'bain', src: bain },
  { id: 'bureau', src: bureau }, { id: 'cafe', src: cafe }, { id: 'jardin', src: jardin },
] as const;

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export function checkImage(file: { type: string; size: number }): 'ok' | 'type' | 'size' {
  if (!IMAGE_TYPES.includes(file.type)) return 'type';
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) return 'size';
  return 'ok';
}

export const VOICE_MIN_S = 10;
export const VOICE_MAX_S = 30;
export const MAX_VOICE_BYTES = 10 * 1024 * 1024;
export function checkVoiceSample(seconds: number, bytes: number, type: string): 'ok' | 'type' | 'short' | 'long' | 'size' {
  if (!type.startsWith('audio/')) return 'type';
  if (bytes <= 0 || bytes > MAX_VOICE_BYTES) return 'size';
  if (!Number.isFinite(seconds) || seconds < VOICE_MIN_S) return 'short';
  if (seconds > VOICE_MAX_S) return 'long';
  return 'ok';
}
