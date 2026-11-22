// Contact & suggestions: public submit (validated, inserted server-side), founder-only listing.
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const contactSchema = z.object({
  kind: z.enum(['question', 'suggestion', 'probleme', 'partenariat']),
  name: z.string().trim().min(1).max(100),
  contact: z.string().trim().min(3).max(255),
  message: z.string().trim().min(5).max(2000),
  website: z.string().max(0).optional(),
});

export const submitContactMessage = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => contactSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const db = supabaseAdmin as unknown as { from: (t: string) => { insert: (r: object) => PromiseLike<{ error: { message: string } | null }> } };
    const { error } = await db.from('contact_messages').insert({ kind: data.kind, name: data.name, contact: data.contact, message: data.message });
    if (error) throw new Error('Envoi impossible pour le moment.');
    return { ok: true };
  });

export const listContactMessages = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: isAdmin } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  if (!isAdmin) throw new Error('Forbidden');
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const db = supabaseAdmin as unknown as { from: (t: string) => { select: (c: string) => { order: (c: string, o: object) => { limit: (n: number) => PromiseLike<{ data: Array<{ id: string; kind: string; name: string; contact: string; message: string; created_at: string }> | null }> } } } };
  const { data } = await db.from('contact_messages').select('id, kind, name, contact, message, created_at').order('created_at', { ascending: false }).limit(200);
  return data ?? [];
});
