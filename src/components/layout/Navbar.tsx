'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      padding: '1.5rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 100,
      background: 'linear-gradient(to bottom, rgba(10, 10, 10, 0.9), transparent)',
      borderBottom: '1px solid rgba(212, 175, 55, 0.1)'
    }}>
      <div>
        <Link href="/">
          <h2 style={{ fontSize: '1.5rem', color: 'var(--accent-gold)' }}>
            The Industry Games
          </h2>
        </Link>
      </div>
      
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <Link href="/#timeline" style={{ fontSize: '1rem', transition: 'color 0.3s' }}>
          Timeline
        </Link>
        <Link href="/#problems" style={{ fontSize: '1rem', transition: 'color 0.3s' }}>
          Problem Statements
        </Link>
        {user ? (
          <Link href="/dashboard" className="btn btn-primary">
            Dashboard
          </Link>
        ) : (
          <Link href="/login" className="btn btn-primary">
            Enter Arena
          </Link>
        )}
      </div>
    </nav>
  );
}
