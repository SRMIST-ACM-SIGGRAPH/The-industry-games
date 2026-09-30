'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--accent-gold)', fontFamily: 'var(--font-display)' }}>
        Loading Arena Data...
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '10rem', paddingBottom: '4rem', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: 'var(--accent-gold)', fontSize: '2.5rem' }}>Tribute Dashboard</h1>
          <p style={{ color: '#aaa', fontSize: '1.1rem' }}>Authenticated as: <span style={{ color: 'var(--foreground)' }}>{user?.email}</span></p>
        </div>
        <button onClick={handleLogout} className="btn" style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}>
          Sign Out / Disconnect
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Team Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: 'var(--panel-bg)', padding: '2rem', border: '1px solid var(--border-color)' }}
        >
          <h2 style={{ color: 'var(--accent-gold)', marginBottom: '1rem', fontSize: '1.5rem' }}>Alliance / Team</h2>
          <p style={{ color: '#aaa', marginBottom: '2rem' }}>You are not currently allied with any tributes. Form an alliance or proceed solo.</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" style={{ flex: 1 }}>Create Team</button>
            <button className="btn" style={{ flex: 1 }}>Join Team</button>
          </div>
        </motion.div>

        {/* Submissions Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ background: 'var(--panel-bg)', padding: '2rem', border: '1px solid var(--border-color)' }}
        >
          <h2 style={{ color: 'var(--accent-gold)', marginBottom: '1rem', fontSize: '1.5rem' }}>Submissions</h2>
          <p style={{ color: '#aaa', marginBottom: '2rem' }}>Upload your proposed solution PPT and payment proof for validation.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button className="btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>Upload Presentation</button>
            <button className="btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>Upload Payment Proof</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
