
-- Create storage bucket for news images
INSERT INTO storage.buckets (id, name, public) VALUES ('news-images', 'news-images', true);

-- Allow admins to upload files
CREATE POLICY "Admin upload news images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'news-images' AND public.is_admin(auth.uid())
);

-- Allow admins to update files
CREATE POLICY "Admin update news images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'news-images' AND public.is_admin(auth.uid()))
WITH CHECK (bucket_id = 'news-images' AND public.is_admin(auth.uid()));

-- Allow admins to delete files
CREATE POLICY "Admin delete news images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'news-images' AND public.is_admin(auth.uid()));

-- Allow public to read news images
CREATE POLICY "Public read news images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'news-images');
