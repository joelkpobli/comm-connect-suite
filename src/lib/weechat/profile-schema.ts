import { z } from 'zod';
export const profileSchema = z.object({
  display_name: z.string().trim().max(80),
  ui_locale: z.enum(['fr', 'en']),
  voice_language: z.enum(['fr', 'en', 'es', 'de', 'pt']),
});
export type ProfileInput = z.infer<typeof profileSchema>;