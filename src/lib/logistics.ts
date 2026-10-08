import { supabase } from '@/lib/supabase';

export interface AttendanceRecord {
  id: string;
  team_id: string;
  profile_id: string;
  attendance_date: string;
  status: 'Present' | 'Absent';
  meals: Record<string, { served_at: string; served_by: string }>;
  marked_at: string;
  updated_at: string;
  updated_by: string | null;
}

export async function fetchAttendance(date: string): Promise<Record<string, AttendanceRecord>> {
  const { data, error } = await supabase
    .from('ig_attendance')
    .select('*')
    .eq('attendance_date', date);

  if (error) throw error;

  const map: Record<string, AttendanceRecord> = {};
  for (const record of data || []) {
    map[record.profile_id] = record;
  }
  return map;
}

export async function upsertAttendance(
  team_id: string,
  profile_id: string,
  attendance_date: string,
  status: 'Present' | 'Absent',
  adminId: string
): Promise<AttendanceRecord> {
  const { data, error } = await supabase
    .from('ig_attendance')
    .upsert(
      {
        team_id,
        profile_id,
        attendance_date,
        status,
        updated_by: adminId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'team_id, profile_id, attendance_date' }
    )
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function serveMeal(
  attendance_id: string,
  meal_type: string,
  adminId: string,
  currentMeals: Record<string, { served_at: string; served_by: string }>
): Promise<AttendanceRecord> {
  const newMeals = {
    ...currentMeals,
    [meal_type]: {
      served_at: new Date().toISOString(),
      served_by: adminId,
    },
  };

  const { data, error } = await supabase
    .from('ig_attendance')
    .update({ meals: newMeals, updated_by: adminId, updated_at: new Date().toISOString() })
    .eq('id', attendance_id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}
