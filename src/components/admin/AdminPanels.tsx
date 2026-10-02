'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function LoadingPanel() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--accent-gold)', fontFamily: 'var(--font-display)' }}>
      Verifying Clearance...
    </div>
  );
}

export function ForbiddenPanel() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '6rem 2rem 4rem' }}>
      <h1 style={{ color: 'var(--accent-red)', fontSize: '3rem', marginBottom: '1rem' }}>403</h1>
      <h2 style={{ color: 'var(--foreground)', marginBottom: '1rem' }}>Access Denied</h2>
      <p style={{ color: '#aaa', maxWidth: '480px', marginBottom: '2.5rem' }}>
        This area of the Capitol is restricted. Your tribute clearance does not permit entry.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link href="/dashboard" className="btn btn-primary">Return to Dashboard</Link>
        <button onClick={handleLogout} className="btn" style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
