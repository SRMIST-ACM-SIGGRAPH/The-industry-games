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
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Users can read their own data and update it
CREATE POLICY "Users can read own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Teams can be read by their members
CREATE POLICY "Team members can view their team" ON public.teams FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.team_id = teams.id AND users.id = auth.uid())
);

-- Announcements are public
CREATE POLICY "Announcements are public" ON public.announcements FOR SELECT USING (true);
