import { Announcement } from '@/lib/types';
import { formatTimestamp } from '@/lib/announcements';

interface AnnouncementsFeedProps {
  announcements: Announcement[];
  error?: string | null;
}

export default function AnnouncementsFeed({ announcements, error }: AnnouncementsFeedProps) {
  if (error) {
    return <p style={{ color: 'var(--accent-orange)' }}>{error}</p>;
  }

  if (announcements.length === 0) {
    return <p style={{ color: '#aaa' }}>No announcements from the Capitol yet. Stay sharp, tribute.</p>;
  }

  return (
    <ul className="announcement-list">
      {announcements.map((announcement) => (
        <li key={announcement.id} className={`announcement-item announcement-item-${announcement.urgency}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
              {announcement.title}
            </span>
            <span className={`urgency-badge urgency-${announcement.urgency}`}>
              {announcement.urgency}
            </span>
          </div>
          <p style={{ color: '#aaa', margin: '0.5rem 0' }}>{announcement.content}</p>
          <time style={{ color: '#777', fontSize: '0.85rem' }} dateTime={announcement.created_at}>
            {formatTimestamp(announcement.created_at)}
          </time>
        </li>
      ))}
    </ul>
  );
}
