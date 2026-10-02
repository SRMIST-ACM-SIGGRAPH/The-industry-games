import { supabase } from '@/lib/supabase';

/**
 * Checks whether the currently authenticated user has `is_admin` set on
 * their profile row. Returns false when no session exists.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;

  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .single();

  if (error) return false;
  return data?.is_admin === true;
}
