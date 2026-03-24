
-- Add admin_response and is_published to feedback table
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS admin_response text;
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false;
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

-- Create public-documents storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('public-documents', 'public-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for public-documents bucket
CREATE POLICY "Public read public documents" ON storage.objects FOR SELECT TO public USING (bucket_id = 'public-documents');
CREATE POLICY "Admin upload public documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'public-documents' AND public.is_admin(auth.uid()));
CREATE POLICY "Admin delete public documents" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'public-documents' AND public.is_admin(auth.uid()));
