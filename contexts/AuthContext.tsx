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

    // Best practice: Call getSession() first, then set up onAuthStateChange listener
    // This ensures we get the session immediately without waiting for INITIAL_SESSION event
    const initializeAuth = async () => {
      try {
        console.log('🔐 [AUTH] Getting initial session...');
        const { data: { session: initialSession }, error } = await authService.getSession();

        if (error) {
          console.error('🔐 [AUTH] Error getting initial session:', error);
        }

        console.log('🔐 [AUTH] Initial session retrieved - user ID:', initialSession?.user?.id || 'null');

        // Set initial state
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        previousUserIdRef.current = initialSession?.user?.id ?? null;

        // Set loading to false BEFORE syncing profile (don't block on network calls)
        console.log('🔐 [AUTH] Setting loading to false (initial session loaded)');
        setLoading(false);

        // Sync user profile in background (don't block auth initialization)
        if (initialSession?.user) {
          console.log('🔐 [AUTH] Syncing user profile in background (initial session)');
          syncUserProfileWithDatabase(dispatch).then(() => {
            console.log('🔐 [AUTH] User profile sync completed (initial session)');
          }).catch((error) => {
            console.error('🔐 [AUTH] Failed to sync user profile on initial session:', error);
          });
        }

        initialSessionHandledRef.current = true;
      } catch (error) {
        console.error('🔐 [AUTH] Error during auth initialization:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes after initial session is loaded
    console.log('🔐 [AUTH] Setting up auth state change listener');
    const { data: { subscription } } = authService.onAuthStateChange(async (_event: string, session: Session | null) => {
      console.log('🔐 [AUTH] Auth state changed - event:', _event, 'session:', session ? 'exists' : 'null');

      // Skip INITIAL_SESSION since we already handled it above
      if (_event === 'INITIAL_SESSION') {
        console.log('🔐 [AUTH] Skipping INITIAL_SESSION event (already handled)');
        return;
      }

      try {
        const currentUserId = session?.user?.id ?? null;
        const previousUserId = previousUserIdRef.current;
        console.log('🔐 [AUTH] User IDs - current:', currentUserId, 'previous:', previousUserId);

        setSession(session);
        setUser(session?.user ?? null);

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
          // Don't await - sync in background to avoid blocking UI
          syncUserProfileWithDatabase(dispatch).then(() => {
            console.log('🔐 [AUTH] User profile sync on auth change completed');
          }).catch((error) => {
            console.error('🔐 [AUTH] Failed to sync user profile on auth change:', error);
          });
        } else if (!session?.user && previousUserId) {
          // User signed out, clear Redux state
          console.log('🧹 [AUTH] User signed out, clearing Redux state');
          dispatch(clearUserData());
        }

        // Set loading to false for sign-in/sign-out events
        console.log('🔐 [AUTH] Setting loading to false after auth change');
        setLoading(false);
      } catch (error) {
        console.error('🔐 [AUTH] Error during auth state change:', error);
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