import { supabase } from '@/lib/supabase';

// Shape of a row in the public.profiles table (see supabase_schema.sql).
export interface Profile {
  id: string;
  full_name: string;
  college_email: string;
  registration_number: string;
  department: string;
  academic_year: string;
  phone_number: string;
  github_url: string;
  linkedin_url: string;
  created_at?: string;
  updated_at?: string;
}

// A profile only counts as "complete" when every mandatory onboarding
// field is present. The /dashboard guard uses this to decide whether a
// tribute still needs to be sent to /onboarding.
export function isProfileComplete(profile: Profile | null): boolean {
  if (!profile) return false;
  return Boolean(
    profile.full_name?.trim() &&
      profile.college_email?.trim() &&
      profile.registration_number?.trim() &&
      profile.department?.trim() &&
      profile.academic_year?.trim() &&
      profile.phone_number?.trim() &&
      profile.github_url?.trim() &&
      profile.linkedin_url?.trim()
  );
}

// Fetch the current tribute's profile row, or null if they have not
// onboarded yet. maybeSingle() resolves a missing row to null instead of
// throwing, so callers can branch cleanly on completeness.
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, full_name, college_email, registration_number, department, academic_year, phone_number, github_url, linkedin_url, created_at, updated_at'
    )
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('getProfile error:', error.message);
    return null;
  }
  return (data as Profile) ?? null;
}
