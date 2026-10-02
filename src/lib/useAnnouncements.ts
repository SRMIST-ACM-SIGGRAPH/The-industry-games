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
  const channelName = useRef(`announcements-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchAnnouncements(limit);
        if (!cancelled) {
          setAnnouncements(data);
          setError(null);
        }
      } catch {
        if (!cancelled) setError('Unable to load announcements.');
      }
    };

    load();

    const channel = supabase
      .channel(channelName.current)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'announcements' },
        (payload) => {
          const announcement = payload.new as Announcement;
          setAnnouncements((prev) => [announcement, ...prev].slice(0, limit ?? prev.length + 1));
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  return { announcements, error };
}
