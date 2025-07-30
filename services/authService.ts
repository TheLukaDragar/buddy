import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { getSupabase } from '../lib/supabase';

export interface AuthError {
  message: string;
  code?: string;
}

export interface AuthResult {
  success: boolean;
  error?: AuthError;
}

export class AuthService {
  private supabase = getSupabase();

  constructor() {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
      offlineAccess: true,
    });
  }

  /**
   * Sign in with Google OAuth using native Google Sign-In
   */
  async signInWithGoogle(): Promise<AuthResult> {
    try {
      console.log('🔧 AuthService: Starting native Google Sign-In...');
      console.log('🔧 AuthService: Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
      console.log('🔧 AuthService: Google Client ID:', process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);
      
      // Check if Play Services are available (Android only)
      await GoogleSignin.hasPlayServices();
      
      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();
      
      if (!userInfo.data?.idToken) {
        throw new Error('No ID token received from Google Sign-In');
      }

      console.log('✅ AuthService: Google Sign-In successful, signing in with Supabase...');

      // Sign in with Supabase using the ID token
      const { data, error } = await this.supabase.auth.signInWithIdToken({
        provider: 'google',
        token: userInfo.data.idToken,
      });

      if (error) {
        console.error('❌ AuthService: Supabase sign-in error:', error);
        return {
          success: false,
          error: {
            message: error.message,
            code: error.status?.toString(),
          },
        };
      }

      console.log('✅ AuthService: Supabase sign-in successful:', data);
      return { success: true };
    } catch (error: any) {
      console.error('❌ AuthService: Google Sign-In error:', error);
      
      // Handle specific Google Sign-In errors
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return {
          success: false,
          error: {
            message: 'Sign in was cancelled by the user',
            code: 'SIGN_IN_CANCELLED',
          },
        };
      } else if (error.code === statusCodes.IN_PROGRESS) {
        return {
          success: false,
          error: {
            message: 'Sign in is already in progress',
            code: 'IN_PROGRESS',
          },
        };
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return {
          success: false,
          error: {
            message: 'Google Play Services not available',
            code: 'PLAY_SERVICES_NOT_AVAILABLE',
          },
        };
      }
      
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<AuthResult> {
    try {
      const { error } = await this.supabase.auth.signOut();

      if (error) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.status?.toString(),
          },
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }

  /**
   * Get the current session
   */
  async getSession() {
    return await this.supabase.auth.getSession();
  }

  /**
   * Get the current user
   */
  async getUser() {
    return await this.supabase.auth.getUser();
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }
}

// Export a singleton instance
export const authService = new AuthService(); 