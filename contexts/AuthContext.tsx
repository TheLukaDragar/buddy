import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { authService } from '../services/authService';
import { syncUserProfileWithDatabase } from '../services/userProfileService';
import { AppDispatch } from '../store';
import { enhancedApi } from '../store/api/enhancedApi';
import { clearUserData } from '../store/slices/userSlice';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const previousUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Get initial session
    authService.getSession().then(async ({ data: { session } }) => {
      try {
        setSession(session);
        setUser(session?.user ?? null);
        previousUserIdRef.current = session?.user?.id ?? null;

        // Sync user profile from database when session is restored
        if (session?.user) {
          try {
            await syncUserProfileWithDatabase(dispatch);
          } catch (error) {
            console.error('Failed to sync user profile on session restore:', error);
          }
        }

        // Only set loading to false after sync completes
        setLoading(false);
      } catch (error) {
        console.error('Error during session initialization:', error);
        setLoading(false);
      }
    }).catch((error) => {
      console.error('Failed to get initial session:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(async (_event: string, session: Session | null) => {
      try {
        const currentUserId = session?.user?.id ?? null;
        const previousUserId = previousUserIdRef.current;

        setSession(session);
        setUser(session?.user ?? null);

        // Clear API cache ONLY when switching between different authenticated users
        // Don't clear on initial load (previousUserId = null) to prevent race conditions
        if (previousUserId && currentUserId && previousUserId !== currentUserId) {
          console.log('🧹 User switched accounts, clearing API cache to prevent stale data');
          dispatch(enhancedApi.util.resetApiState());
        }

        // Always update the ref to track current user
        previousUserIdRef.current = currentUserId;

        // Sync user profile from database when user signs in OR clear on sign out
        if (session?.user) {
          try {
            await syncUserProfileWithDatabase(dispatch);
          } catch (error) {
            console.error('Failed to sync user profile on auth change:', error);
          }
        } else if (!session?.user && previousUserId) {
          // User signed out, clear Redux state
          console.log('🧹 User signed out, clearing Redux state');
          dispatch(clearUserData());
        }

        // Only set loading to false after sync completes
        setLoading(false);
      } catch (error) {
        console.error('Error during auth state change:', error);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await authService.signInWithGoogle();
      
      if (!result.success) {
        console.error('Google sign in error:', result.error);
        throw new Error(result.error?.message || 'Sign in failed');
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const result = await authService.signOut();
      
      if (!result.success) {
        console.error('Sign out error:', result.error);
        throw new Error(result.error?.message || 'Sign out failed');
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithOtp = async (email: string) => {
    try {
      const result = await authService.signInWithOtp(email);

      if (!result.success) {
        console.error('OTP send error:', result.error);
        throw new Error(result.error?.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('OTP send error:', error);
      throw error;
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    try {
      const result = await authService.verifyOtp(email, token);

      if (!result.success) {
        console.error('OTP verification error:', result.error);
        throw new Error(result.error?.message || 'Failed to verify OTP');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithOtp,
    verifyOtp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 