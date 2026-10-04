import { Announcement } from '@/lib/types';
import { formatTimestamp } from '@/lib/announcements';
import ReactMarkdown from 'react-markdown';

interface AnnouncementsFeedProps {
  announcements: Announcement[];
  error?: string | null;
  loading?: boolean;
  onEdit?: (a: Announcement) => void;
  onDelete?: (id: string) => void;
}

export default function AnnouncementsFeed({ announcements, error, loading, onEdit, onDelete }: AnnouncementsFeedProps) {
  if (error) {
    return <p style={{ color: 'var(--accent-orange)' }}>{error}</p>;
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 0', gap: '0.75rem', color: 'var(--accent-gold)' }}>
        <div style={{ width: '16px', height: '16px', border: '2px solid var(--accent-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '0.9rem', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>Awaiting Capitol Broadcast...</span>
      </div>
    );
  }

  if (announcements.length === 0) {
    return <p style={{ color: '#aaa' }}>No announcements from the Capitol yet. Stay sharp, tribute.</p>;
  }

  return (
    <ul className="announcement-list">
      {announcements.map((announcement) => (
        <li key={announcement.id} className={`announcement-item announcement-item-${announcement.urgency}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                {announcement.title}
              </span>
              <time style={{ color: '#777', fontSize: '0.85rem' }} dateTime={announcement.created_at}>
                {formatTimestamp(announcement.created_at)}
              </time>
            </div>
            {(onEdit || onDelete) && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {onEdit && (
                  <button onClick={() => onEdit(announcement)} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button onClick={() => onDelete(announcement.id)} className="btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}>
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="announcement-content-markdown">
            <ReactMarkdown>{announcement.content}</ReactMarkdown>
          </div>
        </li>
      ))}
    </ul>
  );
}

