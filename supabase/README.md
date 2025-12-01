# Supabase Database Setup Guide

This guide will help you set up the database schema for the Recipe Sharing Platform in Supabase.

## Prerequisites

1. A Supabase project created at [supabase.com](https://supabase.com)
2. Access to your Supabase project dashboard

## Setup Steps

### 1. Run the Schema SQL

1. Open your Supabase project dashboard
2. Go to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `schema.sql` and paste it into the editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. Verify that all tables were created successfully

### 2. Create Storage Bucket

1. Go to **Storage** in the left sidebar
2. Click **New bucket**
3. Configure the bucket:
   - **Name**: `recipe-images`
   - **Public bucket**: ✅ Enabled (checked)
   - Click **Create bucket**

### 3. Configure Storage Policies

After creating the bucket, go to **Storage** > **Policies** and add the following policies:

#### Policy 1: Public Read Access
```
Policy name: Public Access
Operation: SELECT
Target roles: anon, authenticated
Policy definition:
bucket_id = 'recipe-images'
```

#### Policy 2: Authenticated Upload
```
Policy name: Authenticated users can upload
Operation: INSERT
Target roles: authenticated
Policy definition:
bucket_id = 'recipe-images'
```

#### Policy 3: Update Own Files
```
Policy name: Users can update own uploads
Operation: UPDATE
Target roles: authenticated
Policy definition:
bucket_id = 'recipe-images' AND
auth.uid()::text = (storage.foldername(name))[1]
```

#### Policy 4: Delete Own Files
```
Policy name: Users can delete own uploads
Operation: DELETE
Target roles: authenticated
Policy definition:
bucket_id = 'recipe-images' AND
auth.uid()::text = (storage.foldername(name))[1]
```

### 4. Configure File Upload Settings

1. Go to **Storage** > **Settings**
2. Set **File size limit** to: `5242880` (5MB in bytes)
3. Optional: Configure allowed MIME types in your application code

### 5. Enable Email Authentication

1. Go to **Authentication** > **Providers**
2. Enable **Email** provider
3. Configure email templates if needed

### 6. Get Your Project Credentials

1. Go to **Project Settings** > **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (for client-side use)

### 7. Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ucvqeoccmhttugslpjvz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdnFlb2NjbWh0dHVnc2xwanZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNDYyMDYsImV4cCI6MjA3MTcyMjIwNn0.OM7YKlladrreh235c4iw7DbyIvbOCOgqeDTrpIDfOpY
```

## Database Structure

### Tables Created

1. **profiles** - User profile information
2. **categories** - Recipe categories (pre-populated with 12 categories)
3. **recipes** - Main recipe data
4. **ingredients** - Recipe ingredients
5. **steps** - Recipe cooking steps
6. **recipe_votes** - User likes/dislikes on recipes

### Relationships

- `profiles.id` → `auth.users.id`
- `recipes.user_id` → `auth.users.id`
- `recipes.category_id` → `categories.id`
- `ingredients.recipe_id` → `recipes.id` (CASCADE DELETE)
- `steps.recipe_id` → `recipes.id` (CASCADE DELETE)
- `recipe_votes.recipe_id` → `recipes.id` (CASCADE DELETE)
- `recipe_votes.user_id` → `auth.users.id` (CASCADE DELETE)

### Row Level Security (RLS)

All tables have RLS enabled with the following policies:
- **Public read access** for viewing recipes, ingredients, steps, and votes
- **Owner-only write access** for creating/updating/deleting recipes
- **User-specific access** for managing votes and profiles

## Verification

After setup, verify the schema:

1. Go to **Table Editor** and confirm all tables are visible
2. Check that categories table has 12 rows
3. Test inserting a recipe (you'll need to be authenticated)

## Next Steps

1. Install Supabase client library in your Next.js app:
   ```bash
   npm install @supabase/supabase-js
   ```

2. Create Supabase client utility (see `lib/supabase.ts`)

3. Replace mock data in the application with Supabase queries

## Troubleshooting

### RLS Policy Errors
- Ensure you're authenticated when testing write operations
- Check that policies are correctly applied in **Authentication** > **Policies**

### Storage Upload Errors
- Verify bucket is set to public
- Check file size limits (5MB)
- Ensure storage policies are correctly configured

### Foreign Key Errors
- Make sure categories exist before creating recipes
- Ensure user exists in auth.users before creating profiles

## Support

For issues with Supabase setup, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)


