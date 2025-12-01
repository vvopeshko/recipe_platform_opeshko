# Storage Policy Setup - Quick Fix

Your bucket exists but you're missing the INSERT policy. Here's how to fix it:

## Option 1: Using SQL Editor (Fastest)

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **"New Query"**
3. Copy and paste this SQL:

```sql
-- Allow authenticated users to upload to recipe-images bucket
CREATE POLICY IF NOT EXISTS "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'recipe-images' AND
  auth.role() = 'authenticated'
);

-- Allow public to read images
CREATE POLICY IF NOT EXISTS "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'recipe-images');
```

4. Click **Run** (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

## Option 2: Using Dashboard UI

1. Go to **Supabase Dashboard** → **Storage** → **Policies**
2. Click on **recipe-images** bucket
3. Click **"New Policy"**

### Policy 1: INSERT (for uploading)
- **Policy name**: `Authenticated users can upload`
- **Allowed operation**: `INSERT`
- **Policy definition**:
  ```
  bucket_id = 'recipe-images' AND
  auth.role() = 'authenticated'
  ```
- Click **Review** → **Save policy**

### Policy 2: SELECT (for reading)
- **Policy name**: `Public read access`
- **Allowed operation**: `SELECT`
- **Policy definition**:
  ```
  bucket_id = 'recipe-images'
  ```
- Click **Review** → **Save policy**

## Verify It Works

1. Try creating a recipe again
2. Upload should work now!
3. Check the browser console for any errors

## Troubleshooting

If you get "policy already exists" error:
- Go to **Storage** → **Policies** → **recipe-images**
- Delete any existing policies
- Re-run the SQL or create new policies


