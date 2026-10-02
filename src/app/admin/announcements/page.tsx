'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminGuard } from '@/lib/useAdminGuard';
import { ForbiddenPanel, LoadingPanel } from '@/components/admin/AdminPanels';
import { fetchAnnouncements, formatTimestamp, subscribeToAnnouncements } from '@/lib/announcements';
import { Announcement, Urgency } from '@/lib/types';

const URGENCY_OPTIONS: { value: Urgency; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'critical', label: 'Critical' },
];

export default function AdminAnnouncements() {
  const status = useAdminGuard();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [urgency, setUrgency] = useState<Urgency>('general');
  const [broadcasting, setBroadcasting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [history, setHistory] = useState<Announcement[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      setHistory(await fetchAnnouncements());
      setHistoryError(null);
    } catch {
      setHistoryError('Could not load past broadcasts. Has the migration been applied?');
    }
  }, []);

  useEffect(() => {
    if (status !== 'authorized') return;
    loadHistory();

    const channel = subscribeToAnnouncements((announcement) => {
      setHistory((prev) => [announcement, ...prev]);
    });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [status, loadHistory]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setBroadcasting(true);
    setFeedback(null);

    const { error } = await supabase
      .from('announcements')
      .insert({ title: title.trim(), content: content.trim(), urgency });

    setBroadcasting(false);

    if (error) {
      setFeedback({ type: 'error', message: `Broadcast failed: ${error.message}` });
    } else {
      setFeedback({ type: 'success', message: 'Announcement broadcast to the arena.' });
      setTitle('');
      setContent('');
      setUrgency('general');
    }
  };

  if (status === 'loading' || status === 'unauthenticated') {
    return <LoadingPanel />;
  }

  if (status === 'forbidden') {
    return <ForbiddenPanel />;
  }

  return (
    <div className="container" style={{ paddingTop: '10rem', paddingBottom: '4rem', minHeight: '100vh' }}>
      <h1 style={{ color: 'var(--accent-gold)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
        Announcement Broadcasts
      </h1>
      <p style={{ color: '#aaa', fontSize: '1.1rem', marginBottom: '3rem' }}>
        Send a real-time proclamation to every tribute in the arena.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        {/* Broadcast Form */}
        <form onSubmit={handleBroadcast} className="admin-panel">
          <h2 style={{ color: 'var(--accent-gold)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            New Broadcast
          </h2>

          <label htmlFor="announcement-title" className="form-label">Title</label>
          <input
            id="announcement-title"
            className="input-field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Sponsorship Window Open"
            maxLength={120}
            required
          />

          <label htmlFor="announcement-content" className="form-label">Message</label>
          <textarea
            id="announcement-content"
            className="input-field"
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write the message tributes will receive..."
            maxLength={2000}
            required
          />

          <label htmlFor="announcement-urgency" className="form-label">Urgency Level</label>
          <div className="urgency-picker" role="radiogroup" aria-label="Urgency level">
            {URGENCY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={urgency === option.value}
                className={`urgency-chip urgency-${option.value} ${urgency === option.value ? 'urgency-chip-active' : ''}`}
                onClick={() => setUrgency(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          {feedback && (
            <p style={{ marginTop: '1rem', color: feedback.type === 'success' ? 'var(--accent-gold)' : 'var(--accent-orange)' }}>
              {feedback.message}
            </p>
          )}

          <button type="submit" className="btn btn-primary" disabled={broadcasting} style={{ width: '100%', marginTop: '1.5rem' }}>
            {broadcasting ? 'Broadcasting...' : 'Broadcast Announcement'}
          </button>
        </form>

        {/* Broadcast History */}
        <div className="admin-panel">
          <h2 style={{ color: 'var(--accent-gold)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            Broadcast History
          </h2>
          {historyError && <p style={{ color: 'var(--accent-orange)' }}>{historyError}</p>}
          {!historyError && history.length === 0 && (
            <p style={{ color: '#aaa' }}>No announcements broadcast yet.</p>
          )}
          <ul className="announcement-list">
            {history.map((announcement) => (
              <li key={announcement.id} className="announcement-item">
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
        </div>
      </div>
    </div>
  );
}
