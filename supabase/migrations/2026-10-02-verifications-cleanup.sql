-- 1. Add DELETE policy for storage.objects so users can delete their own files
CREATE POLICY "Users can delete their own files" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id IN ('ig_payment_proofs', 'ig_submissions') AND owner = auth.uid()
);

-- 2. Make the bucket explicitly public just in case the previous script failed or had issues with createSignedUrl
UPDATE storage.buckets SET public = true WHERE id = 'ig_payment_proofs';
