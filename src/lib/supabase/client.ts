import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// External Supabase project (BYO) — Lovable Cloud is intentionally NOT used.
// Only public values belong here: the publishable/anon key is designed for the
// browser. Never put a service-role or secret key in this module.
let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const url = import.meta.env['VITE_SUPABASE_URL'] as string | undefined;
  const key = import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] as string | undefined;
  if (!url || !key) return null; // demo mode: app keeps running on fictional data
  if (!client) {
    client = createClient(url, key);
  }
  return client;
}
