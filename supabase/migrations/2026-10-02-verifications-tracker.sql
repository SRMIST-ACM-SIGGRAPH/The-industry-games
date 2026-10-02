-- 1. Add verified_by column to ig_teams
ALTER TABLE public.ig_teams ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.profiles(id);

-- 2. Create the storage bucket if it was missing (this fixes the 'no such bucket' error if they didn't run the previous script correctly)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ig_payment_proofs', 'ig_payment_proofs', true)
ON CONFLICT (id) DO NOTHING;
