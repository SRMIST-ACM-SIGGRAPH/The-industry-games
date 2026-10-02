'use client';

import { useAnnouncements } from '@/lib/useAnnouncements';
import { formatTimestamp } from '@/lib/announcements';

/**
 * Live banner/ticker for the landing page. Shows the latest announcement,
 * colour-coded by urgency; hidden entirely when nothing has been broadcast.
 */
export default function AnnouncementsTicker() {
  const { announcements, error } = useAnnouncements(1);
  const latest = announcements[0];

  if (error || !latest) return null;

  return (
    <div className={`ticker ticker-${latest.urgency}`} role="status" aria-live="polite">
      <span className="ticker-label">
        <span className={`urgency-badge urgency-${latest.urgency}`}>{latest.urgency}</span>
      </span>
      <div className="ticker-viewport">
        <div className="ticker-track">
          <span className="ticker-message">
            <strong>{latest.title}</strong> — {latest.content}
            <span className="ticker-time"> · {formatTimestamp(latest.created_at)}</span>
          </span>
          <span className="ticker-message" aria-hidden="true">
            <strong>{latest.title}</strong> — {latest.content}
            <span className="ticker-time"> · {formatTimestamp(latest.created_at)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
