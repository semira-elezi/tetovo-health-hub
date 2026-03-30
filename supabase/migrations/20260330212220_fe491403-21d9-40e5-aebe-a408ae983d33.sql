
-- Add new columns to lab_results for file upload and AI summary
ALTER TABLE public.lab_results
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS file_url text,
  ADD COLUMN IF NOT EXISTS file_type text,
  ADD COLUMN IF NOT EXISTS summary text;

-- Create storage bucket for lab result files
INSERT INTO storage.buckets (id, name, public)
VALUES ('lab-results', 'lab-results', true)
ON CONFLICT (id) DO NOTHING;

-- RLS: Patients can read their own lab result files
CREATE POLICY "Patients read own lab files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'lab-results'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: Staff can upload lab result files
CREATE POLICY "Staff upload lab files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'lab-results'
  AND public.is_staff(auth.uid())
);

-- RLS: Staff can update lab result files
CREATE POLICY "Staff update lab files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'lab-results'
  AND public.is_staff(auth.uid())
);

-- RLS: Public read for lab-results bucket (since it's public)
CREATE POLICY "Public read lab files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'lab-results');
