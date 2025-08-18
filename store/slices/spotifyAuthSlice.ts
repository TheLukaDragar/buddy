import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  product: 'free' | 'premium';
  country: string;
  followers: { total: number };
  images?: Array<{ url: string; height: number; width: number }>;
}

export interface SpotifyAuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null; // Unix timestamp
  user: SpotifyUser | null;
  isInitialized: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: SpotifyAuthState = {
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  user: null,
  isInitialized: false,
  loading: false,
  error: null,
};

const spotifyAuthSlice = createSlice({
  name: 'spotifyAuth',
  initialState,
  reducers: {
    // Set tokens from OAuth flow
    setTokens: (state, action: PayloadAction<{
      accessToken: string;
      refreshToken?: string;
      expiresIn: number; // seconds
    }>) => {
      const { accessToken, refreshToken, expiresIn } = action.payload;
      state.accessToken = accessToken;
      if (refreshToken) state.refreshToken = refreshToken;
      state.expiresAt = Date.now() + (expiresIn * 1000);
      state.error = null;
      
      // Store in SecureStore async (fire and forget)
      SecureStore.setItemAsync('spotify_access_token', accessToken).catch(console.error);
      if (refreshToken) {
        SecureStore.setItemAsync('spotify_refresh_token', refreshToken).catch(console.error);
      }
      SecureStore.setItemAsync('spotify_expires_at', state.expiresAt.toString()).catch(console.error);
    },

    // Update only access token (for refresh)
    updateAccessToken: (state, action: PayloadAction<{
      accessToken: string;
      expiresIn: number;
    }>) => {
      const { accessToken, expiresIn } = action.payload;
      state.accessToken = accessToken;
      state.expiresAt = Date.now() + (expiresIn * 1000);
      state.error = null;
      
      // Update SecureStore
      SecureStore.setItemAsync('spotify_access_token', accessToken).catch(console.error);
      SecureStore.setItemAsync('spotify_expires_at', state.expiresAt.toString()).catch(console.error);
    },

    // Set user profile
    setUser: (state, action: PayloadAction<SpotifyUser>) => {
      state.user = action.payload;
      // Store user data
      SecureStore.setItemAsync('spotify_user', JSON.stringify(action.payload)).catch(console.error);
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      if (action.payload) {
        console.error('[Spotify Auth]', action.payload);
      }
    },

    // Mark as initialized (after loading from storage)
    setInitialized: (state) => {
      state.isInitialized = true;
      state.loading = false;
    },

    // Restore from storage
    restoreFromStorage: (state, action: PayloadAction<{
      accessToken?: string;
      refreshToken?: string;
      expiresAt?: string;
      user?: string;
    }>) => {
      const { accessToken, refreshToken, expiresAt, user } = action.payload;
      
      if (accessToken) state.accessToken = accessToken;
      if (refreshToken) state.refreshToken = refreshToken;
      if (expiresAt) state.expiresAt = parseInt(expiresAt, 10);
      if (user) {
        try {
          state.user = JSON.parse(user);
        } catch (e) {
          console.error('[Spotify Auth] Failed to parse stored user data');
        }
      }
    },

    // Clear all auth data
    clearAuth: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.expiresAt = null;
      state.user = null;
      state.error = null;
      
      // Clear SecureStore async
      SecureStore.deleteItemAsync('spotify_access_token').catch(console.error);
      SecureStore.deleteItemAsync('spotify_refresh_token').catch(console.error);
      SecureStore.deleteItemAsync('spotify_expires_at').catch(console.error);
      SecureStore.deleteItemAsync('spotify_user').catch(console.error);
    },
  },
});

export const {
  setTokens,
  updateAccessToken,
  setUser,
  setLoading,
  setError,
  setInitialized,
  restoreFromStorage,
  clearAuth,
} = spotifyAuthSlice.actions;

// Selectors
export const selectSpotifyAuth = (state: { spotifyAuth: SpotifyAuthState }) => state.spotifyAuth;
export const selectIsAuthenticated = (state: { spotifyAuth: SpotifyAuthState }) => {
  const auth = state.spotifyAuth;
  return !!(auth.accessToken && auth.user && auth.isInitialized);
};
export const selectTokenNeedsRefresh = (state: { spotifyAuth: SpotifyAuthState }) => {
  const auth = state.spotifyAuth;
  if (!auth.accessToken || !auth.expiresAt) return false;
  // Consider token expired if it expires within 5 minutes
  return Date.now() > (auth.expiresAt - 300000);
};
export const selectValidToken = (state: { spotifyAuth: SpotifyAuthState }) => {
  const auth = state.spotifyAuth;
  if (!auth.accessToken || !auth.expiresAt) return null;
  // Check if token is still valid (with 5 min buffer)
  if (Date.now() > (auth.expiresAt - 300000)) return null;
  return auth.accessToken;
};

export default spotifyAuthSlice.reducer;
