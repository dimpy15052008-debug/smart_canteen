-- SmartUni.Ai — Supabase Storage Bucket Configuration
-- Run via Supabase Dashboard or supabase CLI

-- Create private buckets for each document type
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('certificates', 'certificates', false, 10485760, ARRAY['application/pdf']),
  ('receipts',     'receipts',     false, 10485760, ARRAY['application/pdf']),
  ('avatars',      'avatars',      false,  5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: only the file owner (or admin) can read their own files
CREATE POLICY cert_owner_read ON storage.objects
  FOR SELECT USING (
    bucket_id = 'certificates' AND (
      auth.uid()::text = (storage.foldername(name))[1] OR
      EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    )
  );

CREATE POLICY receipt_owner_read ON storage.objects
  FOR SELECT USING (
    bucket_id = 'receipts' AND (
      auth.uid()::text = (storage.foldername(name))[1] OR
      EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    )
  );

-- Avatars are readable by authenticated users (profile display)
CREATE POLICY avatars_authenticated_read ON storage.objects
  FOR SELECT USING (
    bucket_id = 'avatars' AND auth.role() = 'authenticated'
  );
