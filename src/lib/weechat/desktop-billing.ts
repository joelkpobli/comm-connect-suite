import { BLOCK_SECONDS, SWAP_POINTS_PER_SECOND } from './usage-meter';

// Windows app rates (points per second), fixed server-side.
export type DesktopService = 'swap_live' | 'studio_diffusion';
export const STUDIO_DIFFUSION_POINTS_PER_SECOND = 1;
export const desktopBlockCost = (s: DesktopService) =>
  BLOCK_SECONDS * (s === 'swap_live' ? SWAP_POINTS_PER_SECOND : STUDIO_DIFFUSION_POINTS_PER_SECOND);
