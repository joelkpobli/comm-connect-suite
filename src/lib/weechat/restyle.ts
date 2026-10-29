export const RESTYLE_STYLES = ['natural', 'mono', 'vivid', 'graphic'] as const;
export type RestyleStyle = typeof RESTYLE_STYLES[number];
export const DEFAULT_RESTYLE = { intensity: 65, contrast: 100 };
export function restyleFilter(style: RestyleStyle, intensity: number, contrast: number): string {
  const amount = Math.min(100, Math.max(0, Number.isFinite(intensity) ? intensity : 0)) / 100;
  const base = Math.min(160, Math.max(60, Number.isFinite(contrast) ? contrast : 100)) / 100;
  if (style === 'mono') return `grayscale(${amount}) contrast(${base})`;
  if (style === 'vivid') return `saturate(${1 + amount * 1.8}) contrast(${base})`;
  if (style === 'graphic') return `saturate(${1 + amount}) contrast(${base * (1 + amount * 0.8)})`;
  return `contrast(${base})`;
}