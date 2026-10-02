import { supabase } from '@/lib/supabase';
import { Announcement } from '@/lib/types';

export async function fetchAnnouncements(limit?: number): Promise<Announcement[]> {
  let query = supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Announcement[];
}

/**
 * Subscribes to realtime INSERT events on public.announcements.
 * Returns the channel; call supabase.removeChannel(channel) to unsubscribe.
 */
export function subscribeToAnnouncements(
  onInsert: (announcement: Announcement) => void
) {
  const channel = supabase
    .channel('announcements')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'announcements' },
      (payload) => onInsert(payload.new as Announcement)
    )
    .subscribe();

  return channel;
}

export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
