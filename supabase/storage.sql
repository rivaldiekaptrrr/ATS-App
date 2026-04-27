-- Storage Policies for 'cv-files' bucket
-- Run this in Supabase SQL Editor to enable file uploads

-- 1. Create the bucket (Public)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cv-files', 'cv-files', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow Public Read Access (So logos are visible to everyone)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'cv-files' );

-- 3. Allow Authenticated Users to Upload (For HR changing logos)
CREATE POLICY "Authenticated can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'cv-files' );

-- 4. Allow Authenticated Users to Update/Replace files
CREATE POLICY "Authenticated can update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'cv-files' );

-- 5. Allow Authenticated Users to Delete files
CREATE POLICY "Authenticated can delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'cv-files' );
