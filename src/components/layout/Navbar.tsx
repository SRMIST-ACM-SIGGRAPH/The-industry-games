'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { isCurrentUserAdmin } from '@/lib/admin';
import { User } from '@supabase/supabase-js';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    isCurrentUserAdmin().then(setIsAdmin);
  }, [user]);

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 1000,
      background: 'rgba(10, 10, 10, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(212, 175, 55, 0.2)'
    }}>
      <div>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/mockingjay-logo.jpg" alt="Logo" style={{ height: '40px', width: '40px', borderRadius: '50%', objectFit: 'cover' }} />
          <h2 style={{ fontSize: '1.5rem', color: 'var(--accent-gold)', margin: 0 }}>
            The Industry Games
          </h2>
        </Link>
      </div>
      
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <Link href="/announcements" style={{ fontSize: '1rem', transition: 'color 0.3s' }}>
          Announcements
        </Link>
        <Link href="/#timeline" style={{ fontSize: '1rem', transition: 'color 0.3s' }}>
          Timeline
        </Link>
        <Link href="/#problems" style={{ fontSize: '1rem', transition: 'color 0.3s' }}>
          Problem Statements
        </Link>
        {isAdmin && (
          <Link href="/admin" style={{ fontSize: '1rem', color: 'var(--accent-orange)', transition: 'color 0.3s' }}>
            Command Center
          </Link>
        )}
        {user ? (
          <Link href="/dashboard" className="btn btn-primary">
            Dashboard
          </Link>
        ) : (
          <Link href="/login" className="btn btn-primary">
            Register
          </Link>
        )}
      </div>
    </nav>
  );
}
