'use client';

import { useEffect, useState } from 'react';
import AnnouncementsFeed from '@/components/announcements/AnnouncementsFeed';
import { useAnnouncements } from '@/lib/useAnnouncements';

/**
 * Dashboard announcements panel: shows the most recent broadcasts live,
 * with an "Announcements" tab opening a modal of the full alert history.
 */
export default function AnnouncementsPanel() {
  const { announcements, error } = useAnnouncements();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  return (
    <>
      <div
        className="admin-panel"
        style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-color)', padding: '2rem' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
          <h2 style={{ color: 'var(--accent-gold)', fontSize: '1.5rem' }}>Announcements</h2>
          <button className="btn" onClick={() => setModalOpen(true)} style={{ padding: '0.5rem 1rem' }}>
            Full History
          </button>
        </div>
        <AnnouncementsFeed announcements={announcements.slice(0, 3)} error={error} />
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div
            className="modal-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Announcement history"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'var(--accent-gold)', fontSize: '1.5rem' }}>Announcement History</h2>
              <button className="btn" onClick={() => setModalOpen(false)} aria-label="Close announcements" style={{ padding: '0.4rem 0.9rem' }}>
                Close
              </button>
            </div>
            <div className="modal-scroll">
              <AnnouncementsFeed announcements={announcements} error={error} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
