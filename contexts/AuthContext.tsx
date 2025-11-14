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
  console.log('🔐 [AUTH] AuthProvider component rendering');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const previousUserIdRef = useRef<string | null>(null);
  const initialSessionHandledRef = useRef<boolean>(false);

  useEffect(() => {
    console.log('🔐 [AUTH] AuthProvider useEffect - initializing auth');
    
    // Reset initial session flag on mount
    initialSessionHandledRef.current = false;
    
    // Add timeout to prevent infinite hanging
    const timeoutId = setTimeout(() => {
      console.error('🔐 [AUTH] TIMEOUT: Auth initialization took longer than 10 seconds, forcing loading to false');
      setLoading(false);
    }, 10000);
    
    // Listen for auth changes - this will fire INITIAL_SESSION event when ready
    // This is more reliable than calling getSession() directly, especially on first launch
    console.log('🔐 [AUTH] Setting up auth state change listener');
    const { data: { subscription } } = authService.onAuthStateChange(async (_event: string, session: Session | null) => {
      console.log('🔐 [AUTH] Auth state changed - event:', _event, 'session:', session ? 'exists' : 'null');
      try {
        const currentUserId = session?.user?.id ?? null;
        const previousUserId = previousUserIdRef.current;
        console.log('🔐 [AUTH] User IDs - current:', currentUserId, 'previous:', previousUserId);

        setSession(session);
        setUser(session?.user ?? null);

        // Handle initial session - this is fired when Supabase is ready
        if (_event === 'INITIAL_SESSION' && !initialSessionHandledRef.current) {
          initialSessionHandledRef.current = true;
          clearTimeout(timeoutId);
          console.log('🔐 [AUTH] Initial session received - user ID:', currentUserId || 'null');
          
          previousUserIdRef.current = currentUserId;

          // Sync user profile from database when session is restored
          if (session?.user) {
            console.log('🔐 [AUTH] Syncing user profile with database (initial session)');
            try {
              await syncUserProfileWithDatabase(dispatch);
              console.log('🔐 [AUTH] User profile sync completed (initial session)');
            } catch (error) {
              console.error('🔐 [AUTH] Failed to sync user profile on initial session:', error);
            }
          } else {
            console.log('🔐 [AUTH] No user session on initial load, skipping profile sync');
          }

          // Set loading to false after initial session is handled
          console.log('🔐 [AUTH] Setting loading to false (initial session handled)');
          setLoading(false);
          return;
        }

        // Clear API cache ONLY when switching between different authenticated users
        // Don't clear on initial load (previousUserId = null) to prevent race conditions
        if (previousUserId && currentUserId && previousUserId !== currentUserId) {
          console.log('🧹 [AUTH] User switched accounts, clearing API cache to prevent stale data');
          dispatch(enhancedApi.util.resetApiState());
        }

        // Always update the ref to track current user
        previousUserIdRef.current = currentUserId;

        // Sync user profile from database when user signs in OR clear on sign out
        if (session?.user) {
          console.log('🔐 [AUTH] Syncing user profile on auth change');
          try {
            await syncUserProfileWithDatabase(dispatch);
            console.log('🔐 [AUTH] User profile sync on auth change completed');
          } catch (error) {
            console.error('🔐 [AUTH] Failed to sync user profile on auth change:', error);
          }
        } else if (!session?.user && previousUserId) {
          // User signed out, clear Redux state
          console.log('🧹 [AUTH] User signed out, clearing Redux state');
          dispatch(clearUserData());
        }

        // Only set loading to false after sync completes (for non-initial events)
        if (_event !== 'INITIAL_SESSION') {
          console.log('🔐 [AUTH] Setting loading to false after auth change');
          setLoading(false);
        }
      } catch (error) {
        console.error('🔐 [AUTH] Error during auth state change:', error);
        clearTimeout(timeoutId);
        setLoading(false);
      }
    });

    return () => {
      console.log('🔐 [AUTH] Cleaning up auth state change listener');
      subscription.unsubscribe();
    };
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