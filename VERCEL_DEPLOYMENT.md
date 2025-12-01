# Vercel Deployment Guide

## Environment Variables

This application requires Supabase environment variables to be configured in Vercel.

### Required Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Where to Find These Values

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### After Adding Environment Variables

1. Redeploy your application in Vercel
2. The build should now succeed

### Note

The build will succeed even without these variables (using placeholder values), but the application will not function correctly at runtime. Make sure to add these variables before deploying to production.

