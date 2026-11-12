// Browser-safe founder constants: maintenance modules and provider cost estimates.
export const MAINTENANCE_MODULES = ['global', 'swap_live', 'studio', 'translation', 'ai_generation', 'payments'] as const;
export type MaintenanceModule = (typeof MAINTENANCE_MODULES)[number];
export const MODULE_LABELS: Record<MaintenanceModule, string> = {
  global: 'Toute la plateforme', swap_live: 'Swap Live Webcam', studio: 'Studio (Diffusion + Transformation)',
  translation: 'Traduction vocale live', ai_generation: 'Génération IA (Swap Photo, images, photo parlante)', payments: 'Paiements PayDunya',
};
/** Estimated provider cost in USD per successful call, used for the founder spend view (not an invoice). */
export const PROVIDER_COST_USD: Record<string, number> = { face_swap: 0.004, image_generation: 0.003, talking_photo: 0.05 };
/** Consecutive provider billing failures that auto-pause a module. */
export const AUTO_PAUSE_AFTER = 2;
export const PROVIDER_BILLING_URLS: Record<string, string> = {
  replicate: 'https://replicate.com/account/billing',
  palabra: 'https://app.palabra.ai',
  paydunya: 'https://app.paydunya.com',
};
