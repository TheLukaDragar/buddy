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
      
      // Check if Play Services are available with detailed logging
      try {
        const playServicesAvailable = await GoogleSignin.hasPlayServices({ 
          showPlayServicesUpdateDialog: true 
        });
        console.log('✅ AuthService: Google Play Services available:', playServicesAvailable);
      } catch (playServicesError: any) {
        console.error('❌ AuthService: Google Play Services error:', playServicesError);
        return {
          success: false,
          error: {
            message: 'Google Play Services not available or outdated. Please update Google Play Services.',
            code: 'PLAY_SERVICES_ERROR',
          },
        };
      }
      
      // Sign in with Google
      console.log('🔧 AuthService: Attempting Google Sign-In...');
      const userInfo = await GoogleSignin.signIn();
      console.log('🔧 AuthService: Raw Google Sign-In response:', JSON.stringify(userInfo, null, 2));
      
      // Check for the token in the response
      const idToken = userInfo.data?.idToken || userInfo.idToken;
      if (!idToken) {
        console.error('❌ AuthService: No ID token in response. Full response:', userInfo);
        throw new Error('No ID token received from Google Sign-In');
      }

      console.log('✅ AuthService: Google Sign-In successful, ID token received');
      console.log('🔧 AuthService: ID token length:', idToken.length);

      // Sign in with Supabase using the ID token
      console.log('🔧 AuthService: Attempting Supabase sign-in...');
      const { data, error } = await this.supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
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
      console.error('❌ AuthService: Error code:', error.code);
      console.error('❌ AuthService: Error message:', error.message);
      
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
      } else if (error.code === '12500' || error.message?.includes('non-recoverable sign in failure')) {
        return {
          success: false,
          error: {
            message: 'Configuration error. This often happens on emulators. Try on a real device or check your Google Cloud Console setup.',
            code: 'CONFIGURATION_ERROR',
          },
        };
      }
      
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          code: error.code?.toString(),
        },
      };
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<AuthResult> {
    try {
      // Sign out from Google if the user was signed in with Google
      // Ignore errors if user wasn't signed in with Google
      try {
        await GoogleSignin.signOut();
        console.log('✅ AuthService: Signed out from Google');
      } catch (googleError) {
        // Silently ignore Google sign-out errors (user might have signed in with email)
        console.log('ℹ️ AuthService: Google sign-out skipped (likely email login)');
      }

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

      console.log('✅ AuthService: Signed out from Supabase');
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
    console.log('🔧 [AUTH_SERVICE] getSession called');
    try {
      console.log('🔧 [AUTH_SERVICE] Calling supabase.auth.getSession()');
      const result = await this.supabase.auth.getSession();
      console.log('🔧 [AUTH_SERVICE] getSession completed - hasSession:', !!result.data?.session);
      return result;
    } catch (error) {
      console.error('🔧 [AUTH_SERVICE] getSession error:', error);
      throw error;
    }
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

  /**
   * Send OTP to email address
   */
  async signInWithOtp(email: string): Promise<AuthResult> {
    try {
      console.log('🔧 AuthService: Sending OTP to email:', email);
      
      const { data, error } = await this.supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true, // Allow new users to sign up
          // Force OTP instead of Magic Link
          emailRedirectTo: undefined, // This ensures OTP mode
        },
      });

      if (error) {
        console.error('❌ AuthService: OTP send error:', error);
        return {
          success: false,
          error: {
            message: error.message,
            code: error.status?.toString(),
          },
        };
      }

      console.log('✅ AuthService: OTP sent successfully');
      return { success: true };
    } catch (error: any) {
      console.error('❌ AuthService: OTP send error:', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to send OTP',
        },
      };
    }
  }

  /**
   * Verify OTP code
   */
  async verifyOtp(email: string, token: string): Promise<AuthResult> {
    try {
      console.log('🔧 AuthService: Verifying OTP for email:', email);
      
      const { data, error } = await this.supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });

      if (error) {
        console.error('❌ AuthService: OTP verification error:', error);
        return {
          success: false,
          error: {
            message: error.message,
            code: error.status?.toString(),
          },
        };
      }

      console.log('✅ AuthService: OTP verified successfully');
      return { success: true };
    } catch (error: any) {
      console.error('❌ AuthService: OTP verification error:', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to verify OTP',
        },
      };
    }
  }
}

// Export a singleton instance
export const authService = new AuthService();