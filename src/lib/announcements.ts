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
export async function deleteAnnouncement(id: string) {
  const { error } = await supabase.from('announcements').delete().eq('id', id);
  if (error) throw error;
}

export async function updateAnnouncement(id: string, updates: Partial<Announcement>) {
  const { error } = await supabase.from('announcements').update(updates).eq('id', id);
  if (error) throw error;
}

/**
 * Subscribes to realtime events on public.announcements.
 */
export function subscribeToAnnouncements(
  onChange: (payload: any) => void
) {
  const channel = supabase
    .channel('announcements')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'announcements' },
      (payload) => onChange(payload)
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
