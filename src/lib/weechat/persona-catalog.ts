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
// Target faces (facEvo-style preset grid): real photos from Pexels, free licence.
import face1 from '@/assets/faces/face1.webp';
import face2 from '@/assets/faces/face2.webp';
import face3 from '@/assets/faces/face3.webp';
import face4 from '@/assets/faces/face4.webp';
import face5 from '@/assets/faces/face5.webp';
import face6 from '@/assets/faces/face6.webp';
import face7 from '@/assets/faces/face7.webp';
import face8 from '@/assets/faces/face8.webp';
import face9 from '@/assets/faces/face9.webp';
import face10 from '@/assets/faces/face10.webp';
import face11 from '@/assets/faces/face11.webp';
import face12 from '@/assets/faces/face12.webp';
import body1 from '@/assets/faces/body1.webp';
import body2 from '@/assets/faces/body2.webp';
import body3 from '@/assets/faces/body3.webp';
import body4 from '@/assets/faces/body4.webp';
import body5 from '@/assets/faces/body5.webp';
import body6 from '@/assets/faces/body6.webp';
export const faces = [
  { id: 'body1', src: body1, g: 'f' as Gender, credit: 'Pexels · photo 10745026 · Licence Pexels' },
  { id: 'body2', src: body2, g: 'f' as Gender, credit: 'Pexels · photo 7928896 · Licence Pexels' },
  { id: 'body3', src: body3, g: 'f' as Gender, credit: 'Pexels · photo 6109145 · Licence Pexels' },
  { id: 'body4', src: body4, g: 'f' as Gender, credit: 'Pexels · photo 9805731 · Licence Pexels' },
  { id: 'body5', src: body5, g: 'm' as Gender, credit: 'Pexels · photo 6608637 · Licence Pexels' },
  { id: 'body6', src: body6, g: 'm' as Gender, credit: 'Pexels · photo 32612443 · Licence Pexels' },
  { id: 'face1', src: face1, g: 'f' as Gender, credit: 'Pexels · photo 15361970 · Licence Pexels' },
  { id: 'face2', src: face2, g: 'm' as Gender, credit: 'Pexels · photo 20249686 · Licence Pexels' },
  { id: 'face3', src: face3, g: 'm' as Gender, credit: 'Pexels · photo 29690107 · Licence Pexels' },
  { id: 'face4', src: face4, g: 'm' as Gender, credit: 'Pexels · photo 18032391 · Licence Pexels' },
  { id: 'face5', src: face5, g: 'm' as Gender, credit: 'Pexels · photo 19456417 · Licence Pexels' },
  { id: 'face6', src: face6, g: 'f' as Gender, credit: 'Pexels · photo 2520446 · Licence Pexels' },
  { id: 'face7', src: face7, g: 'f' as Gender, credit: 'Pexels · photo 1586335 · Licence Pexels' },
  { id: 'face8', src: face8, g: 'f' as Gender, credit: 'Pexels · photo 35555305 · Licence Pexels' },
  { id: 'face9', src: face9, g: 'f' as Gender, credit: 'Pexels · photo 29491346 · Licence Pexels' },
  { id: 'face10', src: face10, g: 'm' as Gender, credit: 'Pexels · photo 17910791 · Licence Pexels' },
  { id: 'face11', src: face11, g: 'm' as Gender, credit: 'Pexels · photo 13375591 · Licence Pexels' },
  { id: 'face12', src: face12, g: 'm' as Gender, credit: 'Pexels · photo 17555243 · Licence Pexels' },
];

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
