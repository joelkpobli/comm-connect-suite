// Real photographs from Wikimedia Commons (free licences, credits below). People cut out with transparent background.
// Uploads stay in the browser only.
import f1 from '@/assets/personas/f1.webp';
import f2 from '@/assets/personas/f2.webp';
import m1 from '@/assets/personas/m1.webp';
import salon from '@/assets/backgrounds/salon.jpg';
import villa from '@/assets/backgrounds/villa.jpg';
import piscine from '@/assets/backgrounds/piscine.jpg';
import piscine2 from '@/assets/backgrounds/piscine2.jpg';
import jardin from '@/assets/backgrounds/jardin.jpg';

export type Gender = 'f' | 'm';
export type Pose = 'stand' | 'sit';
export const personas = [
  { id: 'f1', src: f1, g: 'f' as Gender, credit: 'Wikimedia Commons · « Kubanino apud spegulo (Vieno) » · CC BY-SA 4.0' },
  { id: 'f2', src: f2, g: 'f' as Gender, credit: 'Wikimedia Commons · « Kubanino en la Muzeo de Polo Montañez » · CC BY-SA 4.0' },
  { id: 'm1', src: m1, g: 'm' as Gender, credit: 'Wikimedia Commons · « A young man standing in front of a mud thatched room » · CC BY-SA 4.0' },
];
export const backgrounds = [
  { id: 'salon', src: salon, credit: 'Wikimedia Commons · Modern living room · CC BY 2.0' },
  { id: 'villa', src: villa, credit: 'Wikimedia Commons · Villa Cavrois · CC BY-SA 4.0' },
  { id: 'piscine', src: piscine, credit: 'Wikimedia Commons · Villa Angelina infinity pool · CC BY-SA 4.0' },
  { id: 'piscine2', src: piscine2, credit: 'Wikimedia Commons · Villa Miragalli pool · CC BY-SA 3.0' },
  { id: 'jardin', src: jardin, credit: 'Wikimedia Commons · Bodnant Garden · CC BY-SA 4.0' },
] as const;

/** Full-body placement in a 16:9 frame: feet on the floor line, seated pose lower and smaller. */
export function placeFigure(W: number, H: number, iw: number, ih: number, pose: Pose) {
  const h = H * (pose === 'stand' ? 0.86 : 0.62);
  const w = h * (iw / ih);
  const floor = H * (pose === 'stand' ? 0.97 : 0.9);
  return { x: (W - w) / 2, y: floor - h, w, h, floor };
}

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
