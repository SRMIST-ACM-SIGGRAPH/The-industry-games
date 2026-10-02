-- Set the database timezone to IST (Indian Standard Time)
ALTER DATABASE postgres SET timezone TO 'Asia/Kolkata';

-- ==========================================
-- 1. GLOBAL PROFILES (Persistent)
-- ==========================================
-- One row per authenticated tribute. This table stays for future events.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  college_email TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  department TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  github_url TEXT NOT NULL,
  linkedin_url TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. EVENT-SPECIFIC TABLES (Industry Games)
-- ==========================================

-- Teams Table
CREATE TABLE public.ig_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  team_code TEXT NOT NULL UNIQUE,
  leader_id UUID REFERENCES public.profiles(id) NOT NULL,
  payment_proof_url TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'rejected')),
  submission_url TEXT,
  is_submitted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members Junction Table
CREATE TABLE public.ig_team_members (
  team_id UUID REFERENCES public.ig_teams(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (team_id, profile_id)
);

-- ==========================================
-- 3. ANNOUNCEMENTS
-- ==========================================
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('normal', 'high', 'critical')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ig_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ig_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Profiles are readable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);

-- IG TEAMS
CREATE POLICY "Authenticated users can view teams" ON public.ig_teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leaders can create teams" ON public.ig_teams FOR INSERT TO authenticated WITH CHECK (auth.uid() = leader_id);
CREATE POLICY "Leaders can update their team" ON public.ig_teams FOR UPDATE TO authenticated USING (auth.uid() = leader_id) WITH CHECK (auth.uid() = leader_id);

-- IG TEAM MEMBERS
CREATE POLICY "Authenticated users can view team members" ON public.ig_team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can join teams" ON public.ig_team_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Users can leave or be removed" ON public.ig_team_members FOR DELETE TO authenticated USING (
  auth.uid() = profile_id OR 
  auth.uid() IN (SELECT leader_id FROM public.ig_teams WHERE id = team_id)
);

-- ANNOUNCEMENTS
CREATE POLICY "Announcements are public to authenticated" ON public.announcements FOR SELECT TO authenticated USING (true);

-- ==========================================
-- 5. STORAGE BUCKETS & POLICIES
-- ==========================================
-- (Run this part separately in the dashboard if you hit permission errors, or run it here as superuser)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('ig_payment_proofs', 'ig_payment_proofs', false, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf']),
  ('ig_submissions', 'ig_submissions', false, 15728640, ARRAY['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Users can upload to their buckets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id IN ('ig_payment_proofs', 'ig_submissions')
);

CREATE POLICY "Users can update their own files" ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id IN ('ig_payment_proofs', 'ig_submissions') AND owner = auth.uid()
);

CREATE POLICY "Users can read own or admin can read all" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id IN ('ig_payment_proofs', 'ig_submissions') AND (
    owner = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    ) OR
    EXISTS (
      SELECT 1 FROM public.ig_team_members AS my_team
      JOIN public.ig_team_members AS uploader_team ON my_team.team_id = uploader_team.team_id
      WHERE my_team.profile_id = auth.uid() AND uploader_team.profile_id = storage.objects.owner
    )
  )
);

-- ==========================================
-- 6. RPC FUNCTIONS
-- ==========================================
CREATE OR REPLACE FUNCTION join_ig_team(p_team_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_team_id UUID;
  v_member_count INT;
BEGIN
  -- 1. Find the team by code
  SELECT id INTO v_team_id FROM public.ig_teams WHERE team_code = p_team_code;
  IF v_team_id IS NULL THEN
    RAISE EXCEPTION 'Invalid team code.';
  END IF;

  -- 2. Check if team is full (max 4 members)
  SELECT count(*) INTO v_member_count FROM public.ig_team_members WHERE team_id = v_team_id;
  IF v_member_count >= 4 THEN
    RAISE EXCEPTION 'This team is already full (max 4 members).';
  END IF;

  -- 3. Check if user is already in a team (handled by UNIQUE constraint, but good for custom error)
  IF EXISTS (SELECT 1 FROM public.ig_team_members WHERE profile_id = auth.uid()) THEN
    RAISE EXCEPTION 'You are already in a team.';
  END IF;

  -- 4. Insert into team members
  INSERT INTO public.ig_team_members (team_id, profile_id) VALUES (v_team_id, auth.uid());
  
  RETURN TRUE;
END;
$$;
