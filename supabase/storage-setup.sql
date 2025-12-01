-- Storage Bucket and Policies Setup
-- Run this AFTER creating the bucket in Supabase Dashboard
-- Go to Storage > New bucket > Name: recipe-images > Public: true

-- Note: These policies should be created through the Supabase Dashboard UI
-- Go to Storage > Policies > recipe-images > New Policy
-- But if you prefer SQL, you can use the Supabase SQL Editor

-- ============================================
-- STORAGE POLICIES FOR recipe-images BUCKET
-- ============================================

-- Policy 1: Public Read Access
-- Allows anyone to view/download recipe images
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT
USING (bucket_id = 'recipe-images');

-- Policy 2: Authenticated Upload
-- Allows authenticated users to upload images
CREATE POLICY "Authenticated users can upload"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'recipe-images' AND
  auth.role() = 'authenticated'
);

-- Policy 3: Update Own Files
-- Allows users to update their own uploaded images
-- Note: File path should be: {user_id}/{filename}
CREATE POLICY "Users can update own uploads"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'recipe-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Delete Own Files
-- Allows users to delete their own uploaded images
CREATE POLICY "Users can delete own uploads"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'recipe-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- ALTERNATIVE: More Flexible Policy
-- ============================================
-- If you want to allow recipe owners to delete images
-- even if they didn't upload them directly, you could
-- create a function to check recipe ownership:

-- First, create a helper function (optional)
CREATE OR REPLACE FUNCTION is_recipe_owner(image_path TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  recipe_url TEXT;
BEGIN
  -- Extract recipe URL from image path
  -- This assumes images are stored as: {user_id}/{recipe_id}/{filename}
  -- You'll need to adjust based on your storage structure
  
  SELECT r.image_url INTO recipe_url
  FROM recipes r
  WHERE r.image_url LIKE '%' || image_path || '%'
  AND r.user_id = auth.uid();
  
  RETURN recipe_url IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


