-- Storage Policies for recipe-images bucket
-- Run this in Supabase SQL Editor

-- First, make sure the bucket exists and is public
-- (You can create it in the Dashboard if it doesn't exist)

-- ============================================
-- POLICY 1: Public Read Access (SELECT)
-- ============================================
-- Allows anyone to view/download recipe images
CREATE POLICY IF NOT EXISTS "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'recipe-images');

-- ============================================
-- POLICY 2: Authenticated Upload (INSERT)
-- ============================================
-- Allows authenticated users to upload images
CREATE POLICY IF NOT EXISTS "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'recipe-images' AND
  auth.role() = 'authenticated'
);

-- ============================================
-- POLICY 3: Update Own Files (UPDATE)
-- ============================================
-- Allows users to update their own uploaded images
CREATE POLICY IF NOT EXISTS "Users can update own uploads"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'recipe-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- POLICY 4: Delete Own Files (DELETE)
-- ============================================
-- Allows users to delete their own uploaded images
CREATE POLICY IF NOT EXISTS "Users can delete own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'recipe-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Note: If you get an error that policies already exist, you can drop them first:
-- DROP POLICY IF EXISTS "Public read access" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can update own uploads" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete own uploads" ON storage.objects;


