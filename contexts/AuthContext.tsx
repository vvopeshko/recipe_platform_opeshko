'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { useRouter } from 'next/navigation';
import { supabase, ensureProfile } from '@/lib/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Helper function to convert Supabase user to our User type
const convertSupabaseUser = async (supabaseUser: SupabaseUser | null): Promise<User | null> => {
  if (!supabaseUser) {
    console.log('convertSupabaseUser: No supabaseUser provided');
    return null;
  }

  console.log('convertSupabaseUser: Converting user', supabaseUser.email);

  // Fetch user profile if it exists (non-blocking, don't let errors block)
  let profile = null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', supabaseUser.id)
      .single();
    
    if (!error && data) {
      profile = data;
      console.log('convertSupabaseUser: Profile found', profile);
    } else if (error) {
      // Table might not exist or profile doesn't exist - that's okay
      console.log('convertSupabaseUser: Profile fetch error (non-blocking):', error.message);
    }
  } catch (error: any) {
    // Profile table might not exist yet - that's okay, continue without it
    console.log('convertSupabaseUser: Profile error (non-blocking):', error?.message || 'Unknown error');
  }

  // Always return a user object even if profile fetch failed
  const user: User = {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    username: profile?.username || supabaseUser.email?.split('@')[0] || undefined,
    avatar_url: profile?.avatar_url || undefined,
  };
  
  console.log('convertSupabaseUser: Returning user', user.email);
  return user;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    let sessionChecked = false;

    // Get initial session - this runs first
    const initializeAuth = async () => {
      try {
        console.log('🔍 [INIT] Initializing auth - checking session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ [INIT] Error getting session:', error);
          if (mounted) {
            setUser(null);
            setIsLoading(false);
          }
          sessionChecked = true;
          return;
        }

        console.log('📦 [INIT] Session check result:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          email: session?.user?.email || 'none'
        });

        if (session?.user && mounted) {
          console.log('✅ [INIT] Session found on page load, user:', session.user.email);
          
          // Set user immediately with basic info (don't wait for profile)
          const basicUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            username: session.user.email?.split('@')[0] || undefined,
          };
          
          console.log('👤 [INIT] Setting basic user in state:', basicUser.email);
          if (mounted) {
            setUser(basicUser);
            setIsLoading(false);
            sessionChecked = true;
          }
          
          // Then fetch profile and update user in background
          convertSupabaseUser(session.user).then((fullUser) => {
            if (mounted && fullUser) {
              console.log('✅ [INIT] Updating user with profile data:', fullUser.email);
              setUser(fullUser);
            }
          }).catch((error) => {
            console.error('⚠️ [INIT] Error converting user (non-blocking):', error);
            // User is already set with basic info, so continue
          });
          
          // Ensure profile exists in background
          if (session.user.email) {
            ensureProfile(session.user.id, session.user.email).catch((profileError) => {
              console.error('⚠️ [INIT] Error ensuring profile (non-blocking):', profileError);
            });
          }
        } else {
          console.log('❌ [INIT] No session found on page load');
          if (mounted) {
            setUser(null);
            setIsLoading(false);
            sessionChecked = true;
          }
        }
      } catch (error: any) {
        console.error('❌ [INIT] Error initializing auth:', error);
        if (mounted) {
          setUser(null);
          setIsLoading(false);
          sessionChecked = true;
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('🔄 [LISTENER] Auth state changed:', event, session?.user?.email);

      // Handle different auth events
      if (event === 'SIGNED_OUT') {
        console.log('🚪 [LISTENER] SIGNED_OUT event - clearing user');
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      // Ignore INITIAL_SESSION if we already checked the session
      // (This prevents double-setting and potential race conditions)
      if (event === 'INITIAL_SESSION') {
        console.log('⏳ [LISTENER] INITIAL_SESSION - skipping (already handled by initializeAuth)');
        return;
      }

      // For SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED events
      if (session?.user) {
        console.log('✅ [LISTENER] User found in listener, event:', event);
        
        // Set basic user immediately
        const basicUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          username: session.user.email?.split('@')[0] || undefined,
        };
        
        if (mounted) {
          console.log('👤 [LISTENER] Setting user from listener:', basicUser.email);
          setUser(basicUser);
          setIsLoading(false);
        }
        
        // Fetch profile in background
        convertSupabaseUser(session.user).then((fullUser) => {
          if (mounted && fullUser) {
            console.log('✅ [LISTENER] Updating user with profile data:', fullUser.email);
            setUser(fullUser);
          }
        }).catch((error) => {
          console.error('⚠️ [LISTENER] Error converting user (non-blocking):', error);
        });
        
        // Ensure profile exists in background
        if (session.user.email) {
          ensureProfile(session.user.id, session.user.email).catch((error) => {
            console.error('⚠️ [LISTENER] Error ensuring profile (non-blocking):', error);
          });
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.session || !data.user) {
        throw new Error('Login failed: No session created');
      }

      // Set user immediately for faster feedback
      if (data.user.email) {
        try {
          await ensureProfile(data.user.id, data.user.email);
        } catch (profileError) {
          console.error('Error ensuring profile:', profileError);
          // Continue anyway
        }
        
        const convertedUser = await convertSupabaseUser(data.user);
        console.log('Login successful, setting user:', convertedUser?.email);
        if (convertedUser) {
          setUser(convertedUser);
        }
      }
      // Note: onAuthStateChange listener will also fire and update the user
      // This gives immediate feedback while the listener ensures consistency
    } catch (error: any) {
      console.error('Login error:', error);
      // Provide user-friendly error messages
      if (error.message.includes('Invalid login credentials') || error.message.includes('Invalid')) {
        throw new Error('Invalid email or password. Please try again.');
      }
      throw new Error(error.message || 'Failed to login. Please try again.');
    }
  };

  const register = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Create profile for new user (always create, even if email confirmation is needed)
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              username: email.split('@')[0],
            });

          if (profileError && !profileError.message.includes('duplicate key')) {
            console.error('Profile creation error:', profileError);
            // Continue anyway, profile might already exist
          }
        } catch (profileErr) {
          console.error('Error creating profile:', profileErr);
          // Continue anyway
        }

        // If session exists (email confirmation disabled), log user in
        if (data.session) {
          const convertedUser = await convertSupabaseUser(data.user);
          setUser(convertedUser);
        } else {
          // Email confirmation required - user needs to check email
          // Don't set user yet, they need to confirm first
          throw new Error('Please check your email to confirm your account before logging in.');
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      // Provide user-friendly error messages
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        throw new Error('This email is already registered. Please login instead.');
      }
      if (error.message.includes('Password')) {
        throw new Error('Password must be at least 8 characters long.');
      }
      if (error.message.includes('check your email')) {
        throw error; // Re-throw the email confirmation message
      }
      throw new Error(error.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Try to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        // If error is "Auth session missing", that's fine - just clear local state
        if (error.message?.includes('session missing') || error.message?.includes('session')) {
          console.log('No active session to sign out from - clearing local state');
        } else {
          console.error('Logout error:', error);
          // For other errors, log but continue with clearing local state
        }
      }
      
      // Always clear user state and redirect, even if signOut had an error
      setUser(null);
      router.push('/');
    } catch (error: any) {
      // If signOut throws an error, still clear local state
      console.error('Logout error (continuing anyway):', error);
      setUser(null);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

