import { makeRedirectUri, ResponseType, useAuthRequest } from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    clearAuth,
    restoreFromStorage,
    selectIsAuthenticated,
    selectSpotifyAuth,
    setError,
    setInitialized,
    setLoading,
    setTokens,
    setUser,
    updateAccessToken,
} from '../store/slices/spotifyAuthSlice';

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

const CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID || '9cfd1c91afc240f1a5c93dab32f23b0c';

/**
 * Clean, simple Spotify auth hook that manages everything through Redux
 */
export const useSpotifyAuth = () => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector(selectSpotifyAuth);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const redirectUri = makeRedirectUri({
    scheme: 'buddy',
    path: 'spotify-auth-callback',
  });

  const [request, response, promptAsync] = useAuthRequest(
    {
      responseType: ResponseType.Code,
      clientId: CLIENT_ID,
      scopes: [
        'user-read-email',
        'user-read-private',
        'user-read-playback-state',
        'user-modify-playback-state',
        'user-read-currently-playing',
        'streaming',
        'playlist-read-private',
        'playlist-read-collaborative',
        'playlist-modify-public',
        'playlist-modify-private',
        'user-follow-modify',
        'user-follow-read',
        'user-library-read',
        'user-library-modify',
        'user-top-read',
        'user-read-recently-played',
      ],
      redirectUri,
      usePKCE: true,
    },
    discovery
  );

  // Initialize - load tokens from storage on app start
  useEffect(() => {
    const initializeAuth = async () => {
      if (authState.isInitialized) return;
      
      dispatch(setLoading(true));
      console.log('[Spotify Auth] Initializing...');

      try {
        const [accessToken, refreshToken, expiresAt, user] = await Promise.all([
          SecureStore.getItemAsync('spotify_access_token'),
          SecureStore.getItemAsync('spotify_refresh_token'),
          SecureStore.getItemAsync('spotify_expires_at'),
          SecureStore.getItemAsync('spotify_user'),
        ]);

        if (accessToken) {
          console.log('[Spotify Auth] Found stored tokens');
          dispatch(restoreFromStorage({ 
          accessToken: accessToken || undefined, 
          refreshToken: refreshToken || undefined, 
          expiresAt: expiresAt || undefined, 
          user: user || undefined 
        }));
          
          // If no user data, fetch it
          if (!user && accessToken) {
            await fetchUserProfile(accessToken);
          }
        } else {
          console.log('[Spotify Auth] No stored tokens found');
        }
      } catch (error) {
        console.error('[Spotify Auth] Failed to initialize:', error);
        dispatch(setError('Failed to load authentication'));
      } finally {
        dispatch(setInitialized());
      }
    };

    initializeAuth();
  }, [authState.isInitialized, dispatch]);

  // Handle OAuth response
  useEffect(() => {
    if (!response) return;

    if (response.type === 'success' && response.params?.code) {
      const { code } = response.params;
      const codeVerifier = request?.codeVerifier;
      
      if (codeVerifier) {
        exchangeCodeForToken(code, codeVerifier);
      } else {
        dispatch(setError('Missing code verifier for PKCE'));
      }
    } else if (response.type === 'error') {
      dispatch(setError(response.params?.error_description || 'Authentication failed'));
    }
  }, [response, request, dispatch]);

  // Exchange authorization code for tokens
  const exchangeCodeForToken = async (code: string, codeVerifier: string) => {
    dispatch(setLoading(true));
    console.log('[Spotify Auth] Exchanging code for token...');

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          client_id: CLIENT_ID,
          code_verifier: codeVerifier,
        }).toString(),
      });

      const data = await response.json();

      if (data.access_token) {
        console.log('[Spotify Auth] Token exchange successful');
        dispatch(setTokens({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresIn: data.expires_in || 3600,
        }));

        // Fetch user profile
        await fetchUserProfile(data.access_token);
      } else {
        throw new Error(data.error_description || 'Failed to exchange code for token');
      }
    } catch (error) {
      console.error('[Spotify Auth] Token exchange failed:', error);
      dispatch(setError(error instanceof Error ? error.message : 'Token exchange failed'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Fetch user profile
  const fetchUserProfile = async (token: string) => {
    try {
      console.log('[Spotify Auth] Fetching user profile...');
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('[Spotify Auth] User profile fetched:', userData.display_name);
        dispatch(setUser(userData));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch user profile');
      }
    } catch (error) {
      console.error('[Spotify Auth] Failed to fetch user profile:', error);
      dispatch(setError(error instanceof Error ? error.message : 'Failed to fetch user profile'));
    }
  };

  // Refresh access token
  const refreshAccessToken = async (): Promise<string | null> => {
    if (!authState.refreshToken) {
      console.warn('[Spotify Auth] No refresh token available');
      return null;
    }

    try {
      console.log('[Spotify Auth] Refreshing access token...');
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: authState.refreshToken,
          client_id: CLIENT_ID,
        }).toString(),
      });

      const data = await response.json();

      if (data.access_token) {
        console.log('[Spotify Auth] Token refresh successful');
        dispatch(updateAccessToken({
          accessToken: data.access_token,
          expiresIn: data.expires_in || 3600,
        }));
        return data.access_token;
      } else {
        throw new Error(data.error_description || 'Failed to refresh token');
      }
    } catch (error) {
      console.error('[Spotify Auth] Token refresh failed:', error);
      dispatch(setError(error instanceof Error ? error.message : 'Token refresh failed'));
      return null;
    }
  };

  // Public methods
  const login = () => {
    dispatch(setError(null));
    console.log('[Spotify Auth] Starting login flow...');
    promptAsync();
  };

  const logout = () => {
    console.log('[Spotify Auth] Logging out...');
    dispatch(clearAuth());
  };

  return {
    // State
    isAuthenticated,
    loading: authState.loading,
    error: authState.error,
    user: authState.user,
    accessToken: authState.accessToken,
    
    // Actions
    login,
    logout,
    refreshAccessToken,
    
    // Internal state for debugging
    isInitialized: authState.isInitialized,
  };
};
