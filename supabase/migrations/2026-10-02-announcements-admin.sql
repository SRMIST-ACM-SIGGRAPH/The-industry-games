-- Migration: Announcements Engine (requirements.md §5) + admin role (§6)
-- Run this in the Supabase SQL Editor. Idempotent — safe to run more than once.

-- 1. Urgency level for announcements (General / Urgent / Critical)
ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS urgency TEXT NOT NULL DEFAULT 'general'
  CHECK (urgency IN ('general', 'urgent', 'critical'));

-- 2. Admin flag on user profiles
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. SECURITY DEFINER helper so RLS policies can check admin status
--    without recursive policy lookups on public.users.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.users WHERE id = auth.uid()),
    FALSE
  );
$$;

-- 4. RLS policies for announcements (public SELECT already exists in supabase_schema.sql)
DROP POLICY IF EXISTS "Admins can broadcast announcements" ON public.announcements;
CREATE POLICY "Admins can broadcast announcements" ON public.announcements
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update announcements" ON public.announcements;
CREATE POLICY "Admins can update announcements" ON public.announcements
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete announcements" ON public.announcements;
CREATE POLICY "Admins can delete announcements" ON public.announcements
  FOR DELETE USING (public.is_admin());

-- 5. Enable Supabase Realtime for the announcements table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'announcements' AND schemaname = 'public'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
  END IF;
END $$;

-- 6. Promote an admin (run once per admin, replacing the email):
-- UPDATE public.users SET is_admin = true WHERE srm_email = 'your-email@srmist.edu.in';
