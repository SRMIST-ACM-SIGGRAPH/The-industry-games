'use client';

import AnnouncementsFeed from '@/components/announcements/AnnouncementsFeed';
import { useAnnouncements } from '@/lib/useAnnouncements';

export default function AnnouncementsPage() {
  const { announcements, error } = useAnnouncements();

  return (
    <div style={{ paddingTop: '8rem', paddingBottom: '4rem', minHeight: '100vh' }} className="container mx-auto px-4 max-w-4xl">
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ color: 'var(--accent-gold)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>Announcements</h1>
        <p style={{ color: '#aaa', fontSize: '1.1rem' }}>Stay up to date with the latest broadcasts from the Gamemakers.</p>
      </div>
      
      <AnnouncementsFeed announcements={announcements} error={error} />
    </div>
  );
}
