-- Set the database timezone to IST (Indian Standard Time)
ALTER DATABASE postgres SET timezone TO 'Asia/Kolkata';

-- Users Table
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  srm_email TEXT NOT NULL UNIQUE,
  registration_number TEXT,
  phone_number TEXT,
  team_id UUID, -- References teams(id), to be added later
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles Table  (Pod 2 / Issue #3 — First-Login Onboarding)
-- One row per authenticated tribute (User), created on first login when they complete the
-- onboarding form. The /dashboard route stays gated until a COMPLETE row
-- exists here (see src/lib/profile.ts -> isProfileComplete).
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  college_email TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  department TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  github_url TEXT NOT NULL,
  linkedin_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams Table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  team_code TEXT NOT NULL UNIQUE,
  leader_id UUID REFERENCES public.users(id),
  payment_proof_url TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'rejected')),
  submission_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key from users to teams
ALTER TABLE public.users ADD CONSTRAINT fk_team FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE SET NULL;

-- Announcements Table
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage Buckets
-- Note: Buckets need to be created via the Supabase dashboard or API, but you can set policies here.
-- Buckets to create:
-- 1. 'submissions'
-- 2. 'payment_proofs'

-- RLS Policies

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Users can read their own data and update it
CREATE POLICY "Users can read own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Profiles: a tribute may only read, create, and update THEIR OWN profile row.
-- INSERT is required for first-login onboarding; the WITH CHECK clause forbids
-- writing a row for anyone else's id.
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Teams can be read by their members
CREATE POLICY "Team members can view their team" ON public.teams FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.team_id = teams.id AND users.id = auth.uid())
);

-- Announcements are public
CREATE POLICY "Announcements are public" ON public.announcements FOR SELECT USING (true);
