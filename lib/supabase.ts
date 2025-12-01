// Supabase Client Configuration
// This file will be used once you start implementing Supabase integration

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

// Helper function to get the current user
export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    
    if (error) {
      // Ignore "session missing" errors - just means user isn't logged in
      if (!error.message?.includes('session missing') && !error.message?.includes('session')) {
        console.error('Error getting current user:', error);
      }
      return null;
    }
    
    return user;
  } catch (error: any) {
    // Handle any thrown errors gracefully
    if (!error.message?.includes('session missing')) {
      console.error('Error getting current user:', error);
    }
    return null;
  }
};

// Helper function to get user profile
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
  
  return data;
};

// Helper function to ensure profile exists (create if doesn't exist)
export const ensureProfile = async (userId: string, email: string) => {
  // Check if profile exists
  const existingProfile = await getUserProfile(userId);
  
  if (existingProfile) {
    return existingProfile;
  }

  // Create profile if it doesn't exist
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      username: email.split('@')[0],
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    return null;
  }

  return data;
};

