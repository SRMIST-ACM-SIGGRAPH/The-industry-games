'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { isCurrentUserAdmin } from '@/lib/admin';
import { isRegistrationClosed } from '@/lib/event';
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
    <nav className="navbar">
      <div className="navbar-brand">
        <Link href="/" className="navbar-brand-link">
          <img src="/mockingjay-logo.jpg" alt="Logo" className="navbar-logo" />
          <h2 className="navbar-title">
            The Industry Games
          </h2>
        </Link>
      </div>
      
      <div className="navbar-links">
        <Link href="/announcements" className="navbar-link">
          Announcements
        </Link>
        <Link href="/#timeline" className="navbar-link">
          Timeline
        </Link>
        <Link href="/#problems" className="navbar-link">
          Problem Statements
        </Link>
        <Link href="/#sponsors" className="navbar-link">
          Sponsors
        </Link>
        {isAdmin && (
          <Link href="/admin" className="navbar-link admin-link">
            Command Center
          </Link>
        )}
        {user ? (
          <Link href="/dashboard" className="btn btn-primary navbar-btn">
            Dashboard
          </Link>
        ) : (
          <Link href="/login" className="btn btn-primary navbar-btn">
            {isRegistrationClosed() ? 'Login' : 'Register'}
          </Link>
        )}
      </div>
    </nav>
  );
}
