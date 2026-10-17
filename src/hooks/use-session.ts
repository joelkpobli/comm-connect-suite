import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useSessionUser() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);
  return user;
}

export function displayName(user: User | null) {
  const n = (user?.user_metadata?.['display_name'] as string | undefined)?.trim();
  return n || user?.email || '';
}

export function initials(user: User | null) {
  return displayName(user).split(/[\s@.]+/).filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('') || 'W';
}
