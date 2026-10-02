'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { isCurrentUserAdmin } from '@/lib/admin';

export type AdminGuardStatus = 'loading' | 'unauthenticated' | 'forbidden' | 'authorized';

/**
 * Client-side guard for /admin routes: requires a verified session and
 * `is_admin: true` on the user's profile. Mirrors the dashboard's
 * getSession() pattern since there is no server middleware yet.
 */
export function useAdminGuard(): AdminGuardStatus {
  const router = useRouter();
  const [status, setStatus] = useState<AdminGuardStatus>('loading');

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const admin = await isCurrentUserAdmin();
      if (!cancelled) setStatus(admin ? 'authorized' : 'forbidden');
    };

    check();
    return () => { cancelled = true; };
  }, [router]);

  return status;
}
