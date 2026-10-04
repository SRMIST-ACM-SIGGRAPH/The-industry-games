'use client';

import Link from 'next/link';
import { useAnnouncements } from '@/lib/useAnnouncements';
import { formatTimestamp } from '@/lib/announcements';
import ReactMarkdown from 'react-markdown';

/**
 * Live banner/ticker for the landing page. Shows the latest announcement,
 * colour-coded by urgency; hidden entirely when nothing has been broadcast.
 */
export default function AnnouncementsTicker() {
  const { announcements, error } = useAnnouncements(1);
  const latest = announcements[0];

  if (error || !latest) return null;

  // Trim content while preserving markdown line breaks for headings like ### and lists
  const cleanContent = latest.content.trim();
  const textLength = (latest.title + cleanContent).length;

  // Dynamic duration ensures readable scrolling speed regardless of message length
  const durationSeconds = Math.max(35, Math.min(240, Math.round(textLength / 8) + 30));

  return (
    <div className={`ticker ticker-${latest.urgency}`} role="status" aria-live="polite">
      <span className="ticker-label">
        <span className={`urgency-badge urgency-${latest.urgency}`}>{latest.urgency}</span>
      </span>
      <Link href="/announcements" className="ticker-viewport" title="Click to view all Capitol announcements">
        <div className="ticker-track" style={{ animationDuration: `${durationSeconds}s` }}>
          <span className="ticker-message">
            <strong>{latest.title}</strong> — <span className="ticker-markdown"><ReactMarkdown>{cleanContent}</ReactMarkdown></span>
            <span className="ticker-time"> · {formatTimestamp(latest.created_at)}</span>
          </span>
          <span className="ticker-message" aria-hidden="true">
            <strong>{latest.title}</strong> — <span className="ticker-markdown"><ReactMarkdown>{cleanContent}</ReactMarkdown></span>
            <span className="ticker-time"> · {formatTimestamp(latest.created_at)}</span>
          </span>
        </div>
      </Link>
    </div>
  );
}

