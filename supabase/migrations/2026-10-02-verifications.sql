-- Issue 7: Verification Panel
-- Allows admins to verify or reject team payment proofs.

-- 1. Add RLS policy allowing admins to update any team (for payment_status).
CREATE POLICY "Admins can update any team" ON public.ig_teams
  FOR UPDATE USING (public.is_admin());

-- 2. Ensure admins can read all payment proofs from storage
-- The bucket 'ig_payment_proofs' was created without RLS or with partial RLS.
-- Let's make sure Admins can SELECT from the bucket.
CREATE POLICY "Admins can read all payment proofs" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'ig_payment_proofs' AND public.is_admin()
  );

-- Also, standard users need to be able to read their own payment proofs if they aren't already.
-- Assuming "Users can update their own files" and "Users can upload to their buckets" exists.
