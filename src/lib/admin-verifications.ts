import { supabase } from '@/lib/supabase';
import { Team } from '@/lib/types';

export async function fetchTeamsForVerification(): Promise<Team[]> {
  const { data, error } = await supabase
    .from('ig_teams')
    .select('*, verifier:profiles!verified_by(college_email)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Team[];
}

export async function updateTeamPaymentStatus(teamId: string, status: 'pending' | 'verified' | 'rejected', adminId: string): Promise<void> {
  const { error } = await supabase
    .from('ig_teams')
    .update({ payment_status: status, verified_by: adminId })
    .eq('id', teamId);

  if (error) throw error;
}

export function getPaymentProofUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const { data } = supabase.storage.from('ig_submissions').getPublicUrl(path);
  return data.publicUrl ? `${data.publicUrl}?t=${Date.now()}` : null;
}
