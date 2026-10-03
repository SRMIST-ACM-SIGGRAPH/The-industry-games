'use client';

import Link from 'next/link';
import AnnouncementsFeed from '@/components/announcements/AnnouncementsFeed';
import { useAnnouncements } from '@/lib/useAnnouncements';

/**
 * Dashboard announcements panel: shows the most recent broadcasts live.
 * The "Full History" button navigates to the public announcements page.
 */
export default function AnnouncementsPanel() {
  const { announcements, error, loading } = useAnnouncements();

  return (
    <div
      className="admin-panel"
      style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-color)', padding: '2rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
        <h2 style={{ color: 'var(--accent-gold)', fontSize: '1.5rem' }}>Announcements</h2>
        <Link href="/announcements" className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          View All Announcements
        </Link>
      </div>
      <AnnouncementsFeed announcements={announcements.slice(0, 3)} error={error} loading={loading} />
    </div>
  );
}
