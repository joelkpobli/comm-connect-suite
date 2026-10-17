import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { profileSchema } from './profile-schema';

export const getProfile = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from('profiles').select('display_name, ui_locale, voice_language').eq('id', context.userId).single();
    if (error) throw new Error('Profile unavailable');
    return { ...data, email: String(context.claims['email'] ?? '') };
  });

export const saveProfile = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(input => profileSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { data: saved, error } = await context.supabase.from('profiles').update(data).eq('id', context.userId).select('display_name, ui_locale, voice_language').single();
    if (error) throw new Error('Profile update failed');
    return saved;
  });