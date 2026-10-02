import AnnouncementsPanel from '@/components/announcements/AnnouncementsPanel';

export default function AnnouncementsPage() {
  return (
    <div style={{ paddingTop: '8rem', minHeight: '100vh' }} className="container mx-auto px-4 max-w-4xl">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--accent-gold)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>Announcements</h1>
        <p style={{ color: '#aaa' }}>Stay up to date with the latest broadcasts from the Gamemakers.</p>
      </div>
      <AnnouncementsPanel />
    </div>
  );
}
