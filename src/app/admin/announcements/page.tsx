'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminGuard } from '@/lib/useAdminGuard';
import { ForbiddenPanel, LoadingPanel } from '@/components/admin/AdminPanels';
import { fetchAnnouncements, subscribeToAnnouncements, deleteAnnouncement, updateAnnouncement } from '@/lib/announcements';
import AnnouncementsFeed from '@/components/announcements/AnnouncementsFeed';
import { Announcement, Urgency } from '@/lib/types';
import ReactMarkdown from 'react-markdown';

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
  const [showPreview, setShowPreview] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);


  const [history, setHistory] = useState<Announcement[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      setHistory(await fetchAnnouncements());
      setHistoryError(null);
    } catch {
      setHistoryError('Could not load past broadcasts. Has the migration been applied?');
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (status !== 'authorized') return;
    loadHistory();

    const channel = subscribeToAnnouncements((payload) => {
      if (payload.eventType === 'INSERT') {
        const ann = payload.new as Announcement;
        setHistory((prev) => [ann, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        const ann = payload.new as Announcement;
        setHistory((prev) => prev.map(a => a.id === ann.id ? ann : a));
      } else if (payload.eventType === 'DELETE') {
        const oldId = payload.old.id;
        setHistory((prev) => prev.filter(a => a.id !== oldId));
      }
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

    try {
      if (editingId) {
        await updateAnnouncement(editingId, { title: title.trim(), content: content.trim(), urgency });
        setFeedback({ type: 'success', message: 'Announcement updated.' });
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert({ title: title.trim(), content: content.trim(), urgency });
        if (error) throw error;
        setFeedback({ type: 'success', message: 'Announcement broadcast to the arena.' });
      }

      setEditingId(null);
      setTitle('');
      setContent('');
      setUrgency('general');
    } catch (error: any) {
      setFeedback({ type: 'error', message: `Broadcast failed: ${error.message}` });
    } finally {
      setBroadcasting(false);
    }
  };

  const handleEditClick = (ann: Announcement) => {
    setEditingId(ann.id);
    setTitle(ann.title);
    setContent(ann.content);
    setUrgency(ann.urgency);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await deleteAnnouncement(id);
    } catch (error: any) {
      alert(`Delete failed: ${error.message}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setUrgency('general');
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', alignItems: 'stretch' }}>
        {/* Broadcast Form */}
        <form onSubmit={handleBroadcast} className="admin-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: 'var(--accent-gold)', margin: 0, fontSize: '1.5rem' }}>
              {editingId ? 'Edit Broadcast' : 'New Broadcast'}
            </h2>
            {editingId && (
              <button type="button" className="btn" onClick={handleCancelEdit} style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                Cancel
              </button>
            )}
          </div>

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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <label htmlFor="announcement-content" className="form-label" style={{ margin: 0 }}>Message</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="btn"
                style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.6rem',
                  borderColor: !showPreview ? 'var(--accent-gold)' : 'var(--border-color)',
                  color: !showPreview ? 'var(--accent-gold)' : '#888'
                }}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="btn"
                style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.6rem',
                  borderColor: showPreview ? 'var(--accent-gold)' : 'var(--border-color)',
                  color: showPreview ? 'var(--accent-gold)' : '#888'
                }}
              >
                Markdown Preview
              </button>
            </div>
          </div>

          {!showPreview ? (
            <>
              <textarea
                id="announcement-content"
                className="input-field"
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write the message tributes will receive... (Markdown supported: **bold**, *italic*, [link](url), - lists)"
                maxLength={2000}
                required
              />
              <span style={{ fontSize: '0.75rem', color: '#666', marginTop: '-0.25rem', marginBottom: '0.5rem', display: 'block' }}>
                Tip: Use Markdown for formatting (**bold**, *italic*, [links](https://...), `code`, and bullet lists).
              </span>
            </>
          ) : (
            <div
              style={{
                minHeight: '120px',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                marginBottom: '1rem',
              }}
            >
              {content.trim() ? (
                <div className="announcement-content-markdown">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              ) : (
                <span style={{ color: '#666', fontStyle: 'italic', fontSize: '0.85rem' }}>Nothing to preview yet.</span>
              )}
            </div>
          )}

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
          <AnnouncementsFeed announcements={history} error={historyError} loading={loadingHistory} onEdit={handleEditClick} onDelete={handleDeleteClick} />
        </div>
      </div>
    </div>
  );
}
