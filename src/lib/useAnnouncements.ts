'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchAnnouncements, subscribeToAnnouncements } from '@/lib/announcements';
import { Announcement } from '@/lib/types';

/**
 * Fetches announcements (newest first) and keeps them live via a
 * Supabase Realtime channel. Each consumer gets its own uniquely-named
 * channel, cleaned up on unmount.
 */
export function useAnnouncements(limit?: number) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const channelName = useRef(`announcements-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const load = async () => {
      try {
        const data = await fetchAnnouncements(limit);
        if (!cancelled) {
          setAnnouncements(data);
          setError(null);
        }
      } catch {
        if (!cancelled) setError('Unable to load announcements.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    const channel = supabase
      .channel(channelName.current)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const announcement = payload.new as Announcement;
            setAnnouncements((prev) => [announcement, ...prev].slice(0, limit ?? prev.length + 1));
          } else if (payload.eventType === 'UPDATE') {
            const announcement = payload.new as Announcement;
            setAnnouncements((prev) => prev.map(a => a.id === announcement.id ? announcement : a));
          } else if (payload.eventType === 'DELETE') {
            const oldId = payload.old.id;
            setAnnouncements((prev) => prev.filter(a => a.id !== oldId));
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  return { announcements, error, loading };
}
