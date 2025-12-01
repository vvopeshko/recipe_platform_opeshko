# Storage Bucket Setup Guide

## Quick Setup Steps

### 1. Create the Bucket

1. Go to **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Set:
   - **Name**: `recipe-images`
   - **Public bucket**: ✅ **Toggle ON** (this is important!)
4. Click **"Create bucket"**

### 2. Set Up Storage Policies

After creating the bucket, you need to set up policies:

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to **Storage** → **Policies** → **recipe-images**
2. Click **"New Policy"**

**Policy 1: Public Read Access**
- Policy name: `Public read access`
- Allowed operation: `SELECT`
- Policy definition:
  ```sql
  bucket_id = 'recipe-images'
  ```

**Policy 2: Authenticated Upload**
- Policy name: `Authenticated users can upload`
- Allowed operation: `INSERT`
- Policy definition:
  ```sql
  bucket_id = 'recipe-images' AND
  auth.role() = 'authenticated'
  ```

**Policy 3: Update Own Files**
- Policy name: `Users can update own uploads`
- Allowed operation: `UPDATE`
- Policy definition:
  ```sql
  bucket_id = 'recipe-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
  ```

**Policy 4: Delete Own Files**
- Policy name: `Users can delete own uploads`
- Allowed operation: `DELETE`
- Policy definition:
  ```sql
  bucket_id = 'recipe-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
  ```

#### Option B: Using SQL Editor

Run this in **Supabase Dashboard** → **SQL Editor**:

```sql
-- Policy 1: Public Read Access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'recipe-images');

-- Policy 2: Authenticated Upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'recipe-images' AND
  auth.role() = 'authenticated'
);

-- Policy 3: Update Own Files
CREATE POLICY "Users can update own uploads"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'recipe-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Delete Own Files
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'recipe-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. Verify Setup

1. Go to **Storage** → **recipe-images**
2. Try uploading a test file manually through the dashboard
3. Check that the file appears and is accessible via public URL

## Troubleshooting

### Error: "Bucket not found"
- Verify the bucket name is exactly `recipe-images` (case-sensitive)
- Check that the bucket exists in Storage → Buckets list

### Error: "Permission denied"
- Check that the bucket is set to **Public**
- Verify the storage policies are created correctly
- Ensure you're logged in when uploading

### Error: "Policy violation"
- Make sure all four policies are created
- Check that the INSERT policy allows authenticated users
- Verify your user is authenticated

### Images not showing
- Check that the bucket is **Public**
- Verify the SELECT policy allows public read access
- Check the image URL in the browser console


