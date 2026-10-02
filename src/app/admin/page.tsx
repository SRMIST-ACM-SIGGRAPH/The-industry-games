'use client';

import Link from 'next/link';
import { useAdminGuard } from '@/lib/useAdminGuard';
import { ForbiddenPanel, LoadingPanel } from '@/components/admin/AdminPanels';

export default function AdminHome() {
  const status = useAdminGuard();

  if (status === 'loading' || status === 'unauthenticated') {
    return <LoadingPanel />;
  }

  if (status === 'forbidden') {
    return <ForbiddenPanel />;
  }

  return (
    <div className="container" style={{ paddingTop: '10rem', paddingBottom: '4rem', minHeight: '100vh' }}>
      <h1 style={{ color: 'var(--accent-gold)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
        Command Center
      </h1>
      <p style={{ color: '#aaa', fontSize: '1.1rem', marginBottom: '3rem' }}>
        Authenticated as a Gamemaker. Overseer tools are listed below.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="admin-panel">
          <h2 style={{ color: 'var(--accent-gold)', marginBottom: '1rem', fontSize: '1.5rem' }}>
            Broadcasts
          </h2>
          <p style={{ color: '#aaa', marginBottom: '2rem' }}>
            Broadcast announcements with urgency levels to every tribute in the arena.
          </p>
          <Link href="/admin/announcements" className="btn btn-primary">
            Open Broadcast Tool
          </Link>
        </div>

        <div className="admin-panel" style={{ opacity: 0.5 }}>
          <h2 style={{ color: 'var(--accent-gold)', marginBottom: '1rem', fontSize: '1.5rem' }}>
            Verification Panel
          </h2>
          <p style={{ color: '#aaa', marginBottom: '2rem' }}>
            Review payment proofs and toggle team verification. Coming with Issue #7.
          </p>
          <button className="btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            Pending — Issue #7
          </button>
        </div>
      </div>
    </div>
  );
}
