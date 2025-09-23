import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
import { selectTokenNeedsRefresh, selectValidToken, setTokens, updateAccessToken } from '../slices/spotifyAuthSlice';

// Spotify API Types
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  duration_ms: number;
  uri: string;
}

export interface SpotifyPlaybackState {
  is_playing: boolean;
  currently_playing_type: string;
  item?: SpotifyTrack;
  progress_ms?: number;
  device?: {
    id: string;
    name: string;
    type: string;
    volume_percent: number;
  };
}

export interface SpotifyDevice {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number;
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  product: 'free' | 'premium';
  country: string;
  followers: { total: number };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: Array<{ url: string; height: number; width: number }>;
  tracks: {
    total: number;
    items?: Array<{
      track: SpotifyTrack;
    }>;
  };
  uri: string;
}

export interface SpotifySearchResult {
  tracks?: {
    items: SpotifyTrack[];
    total: number;
  };
  playlists?: {
    items: SpotifyPlaylist[];
    total: number;
  };
  artists?: {
    items: Array<{
      id: string;
      name: string;
      images: Array<{ url: string; height: number; width: number }>;
      uri: string;
    }>;
    total: number;
  };
}

export interface PlaybackControlRequest {
  deviceId?: string;
  contextUri?: string;
  trackUri?: string;
  uris?: string[];
  volumePercent?: number;
  state?: boolean | 'track' | 'context' | 'off';
}

// Prevent concurrent refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// Clean base query with automatic token management
const spotifyBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const state = api.getState() as RootState;
  let token = selectValidToken(state);
  
  // Auto-refresh token if needed  
  if (!token && selectTokenNeedsRefresh(state)) {
    const refreshToken = state.spotifyAuth?.refreshToken;
    if (refreshToken) {
      // If already refreshing, wait for that promise
      if (isRefreshing && refreshPromise) {
        console.log('[Spotify API] Refresh already in progress, waiting...');
        token = await refreshPromise;
      } else {
        // Start new refresh
        isRefreshing = true;
        refreshPromise = (async (): Promise<string | null> => {
          try {
            console.log('[Spotify API] Auto-refreshing expired token...');
            const response = await fetch('https://accounts.spotify.com/api/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID || '9cfd1c91afc240f1a5c93dab32f23b0c',
              }).toString(),
            });

            // Log response details before parsing
            console.log('[Spotify API] Auto-refresh response status:', response.status);
            const contentType = response.headers.get('content-type');
            
            if (!contentType?.includes('application/json')) {
              const textResponse = await response.text();
              console.error('[Spotify API] Auto-refresh: Expected JSON but got:', contentType);
              console.error('[Spotify API] Auto-refresh response body:', textResponse.substring(0, 500));
              return null;
            }

            const data = await response.json();
            if (data.access_token) {
              // Check if Spotify provided a new refresh token
              if (data.refresh_token) {
                console.log('[Spotify API] New refresh token provided, updating both tokens');
                api.dispatch(setTokens({
                  accessToken: data.access_token,
                  refreshToken: data.refresh_token,
                  expiresIn: data.expires_in || 3600,
                }));
              } else {
                console.log('[Spotify API] No new refresh token, keeping existing one');
                api.dispatch(updateAccessToken({
                  accessToken: data.access_token,
                  expiresIn: data.expires_in || 3600,
                }));
              }
              console.log('[Spotify API] Token auto-refresh successful');
              return data.access_token;
            } else {
              console.error('[Spotify API] Auto-refresh failed - no access token returned:', data);
              return null;
            }
          } catch (error) {
            console.error('[Spotify API] Auto-refresh failed:', error);
            return null;
          } finally {
            // Reset refresh state
            isRefreshing = false;
            refreshPromise = null;
          }
        })();
        
        token = await refreshPromise;
      }
    }
  }

  if (!token) {
    return {
      error: {
        status: 401,
        statusText: 'Unauthorized',
        data: { enhancedMessage: 'Please connect your Spotify account to use music features.' }
      } as FetchBaseQueryError
    };
  }

  const baseQuery = fetchBaseQuery({
    baseUrl: 'https://api.spotify.com/v1',
    prepareHeaders: (headers) => {
      headers.set('Authorization', `Bearer ${token}`);
      headers.set('Content-Type', 'application/json');
      return headers;
    },
    responseHandler: async (response) => {
      // Handle empty responses (204, etc.) without trying to parse JSON
      if (response.status === 204) {
        return {};
      }
      
      // Check if response has content
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      // If no content or not JSON, return empty object
      if (contentLength === '0' || !contentType?.includes('application/json')) {
        return {};
      }
      
      // For JSON responses, parse normally
      return response.json();
    },
  });

  let result = await baseQuery(args, api, extraOptions);
  

  // Handle successful 204 responses (No Content) - these are successful operations
  if (result.error?.status === 204) {
    return { data: {} }; // Convert 204 error to successful empty response
  }

  // Handle 401 Unauthorized - token might still be invalid after refresh
  if (result.error?.status === 401) {
    console.log('[Spotify RTK] Request failed with 401 after token validation');
    return {
      error: {
        ...result.error,
        data: { enhancedMessage: 'Your Spotify session has expired. Please reconnect your account.' }
      } as FetchBaseQueryError
    };
  }

  // Enhance error messages for better UX
  if (result.error) {
    const error = result.error as FetchBaseQueryError & { data?: any };
    let enhancedMessage = '';

    if (error.status === 403) {
      if (error.data?.error?.message?.includes('PREMIUM_REQUIRED') || 
          error.data?.error?.reason === 'PREMIUM_REQUIRED') {
        enhancedMessage = 'This feature requires Spotify Premium. Please upgrade your account to use playback controls.';
      } else if (error.data?.error?.message?.includes('Restriction violated')) {
        enhancedMessage = 'Music playback is temporarily restricted. Please open Spotify, play a song manually, then try again.';
      }
    } else if (error.status === 404 && error.data?.error?.reason === 'NO_ACTIVE_DEVICE') {
      enhancedMessage = 'No active Spotify device found. Please start Spotify on any device and try again.';
    } else if (error.status === 502 || error.status === 503) {
      enhancedMessage = 'Spotify service is temporarily unavailable. Please try again in a moment.';
    }

    if (enhancedMessage) {
      return {
        error: {
          ...error,
          data: {
            ...error.data,
            enhancedMessage
          }
        } as FetchBaseQueryError
      };
    }
  }

  return result;
};

export const spotifyApi = createApi({
  reducerPath: 'spotifyApi',
  baseQuery: spotifyBaseQuery,
  tagTypes: ['PlaybackState', 'Devices', 'UserPlaylists', 'UserProfile'],
  endpoints: (builder) => ({
    // User Profile & Authentication
    getUserProfile: builder.query<SpotifyUser, void>({
      query: () => '/me',
      providesTags: ['UserProfile'],
    }),

    checkPremiumStatus: builder.query<boolean, void>({
      query: () => '/me',
      transformResponse: (response: SpotifyUser) => response.product === 'premium',
      providesTags: ['UserProfile'],
    }),

    // Playback State & Control
    getCurrentPlaybackState: builder.query<SpotifyPlaybackState | null, void>({
      query: () => '/me/player',
      providesTags: ['PlaybackState'],
      transformResponse: (response: any) => {
        if (!response || !response.item) return response;
        
        // Remove available_markets from both track and album data to reduce payload size
        if (response.item?.available_markets) {
          delete response.item.available_markets;
        }
        if (response.item?.album?.available_markets) {
          delete response.item.album.available_markets;
        }
        
        //console.log('🎵 [RTK] Cleaned playback state (no available_markets):', JSON.stringify(response.item, null, 2));
        return response;
      },
      transformErrorResponse: (response) => {
        // Return null for no active session instead of error
        if (response.status === 204) {
          return null;
        }
        return response;
      },
    }),

    getAvailableDevices: builder.query<{ devices: SpotifyDevice[]; hasActiveDevice: boolean }, void>({
      query: () => '/me/player/devices',
      providesTags: ['Devices'],
      transformResponse: (response: { devices: SpotifyDevice[] }) => {
        const devices = response.devices || [];
        const hasActiveDevice = devices.some(device => device.is_active);
        return { devices, hasActiveDevice };
      },
    }),

    // Playback Control Mutations
    playMusic: builder.mutation<void, PlaybackControlRequest>({
      query: ({ deviceId, contextUri, trackUri, uris }) => {
        const url = deviceId ? `/me/player/play?device_id=${deviceId}` : '/me/player/play';
        const body: any = {};
        
        if (contextUri) {
          body.context_uri = contextUri;
        } else if (trackUri) {
          body.uris = [trackUri];
        } else if (uris) {
          body.uris = uris;
        }

        return {
          url,
          method: 'PUT',
          body: Object.keys(body).length > 0 ? body : undefined,
        };
      },
      invalidatesTags: ['PlaybackState'],
    }),

    pauseMusic: builder.mutation<void, { deviceId?: string }>({
      query: ({ deviceId }) => ({
        url: deviceId ? `/me/player/pause?device_id=${deviceId}` : '/me/player/pause',
        method: 'PUT',
      }),
      invalidatesTags: ['PlaybackState'],
    }),

    nextTrack: builder.mutation<void, { deviceId?: string }>({
      query: ({ deviceId }) => ({
        url: deviceId ? `/me/player/next?device_id=${deviceId}` : '/me/player/next',
        method: 'POST',
      }),
      invalidatesTags: ['PlaybackState'],
    }),

    previousTrack: builder.mutation<void, { deviceId?: string }>({
      query: ({ deviceId }) => ({
        url: deviceId ? `/me/player/previous?device_id=${deviceId}` : '/me/player/previous',
        method: 'POST',
      }),
      invalidatesTags: ['PlaybackState'],
    }),

    setVolume: builder.mutation<void, { volumePercent: number; deviceId?: string }>({
      query: ({ volumePercent, deviceId }) => ({
        url: deviceId 
          ? `/me/player/volume?volume_percent=${volumePercent}&device_id=${deviceId}`
          : `/me/player/volume?volume_percent=${volumePercent}`,
        method: 'PUT',
      }),
      invalidatesTags: ['PlaybackState'],
    }),

    setShuffle: builder.mutation<void, { state: boolean; deviceId?: string }>({
      query: ({ state, deviceId }) => ({
        url: deviceId
          ? `/me/player/shuffle?state=${state}&device_id=${deviceId}`
          : `/me/player/shuffle?state=${state}`,
        method: 'PUT',
      }),
      invalidatesTags: ['PlaybackState'],
    }),

    setRepeat: builder.mutation<void, { state: 'track' | 'context' | 'off'; deviceId?: string }>({
      query: ({ state, deviceId }) => ({
        url: deviceId
          ? `/me/player/repeat?state=${state}&device_id=${deviceId}`
          : `/me/player/repeat?state=${state}`,
        method: 'PUT',
      }),
      invalidatesTags: ['PlaybackState'],
    }),

    transferPlayback: builder.mutation<void, { deviceId: string; play?: boolean }>({
      query: ({ deviceId, play = false }) => ({
        url: '/me/player',
        method: 'PUT',
        body: { device_ids: [deviceId], play },
      }),
      invalidatesTags: ['PlaybackState'], // Removed 'Devices' - handled optimistically
      async onQueryStarted({ deviceId }, { dispatch, queryFulfilled, getState }) {
        // Optimistic update: immediately mark new device as active
        const patchResult = dispatch(
          spotifyApi.util.updateQueryData('getAvailableDevices', undefined, (draft) => {
            if (draft?.devices) {
              // Mark all devices as inactive
              draft.devices.forEach(device => {
                device.is_active = false;
              });
              // Mark the target device as active
              const targetDevice = draft.devices.find(device => device.id === deviceId);
              if (targetDevice) {
                targetDevice.is_active = true;
              }
              // Update hasActiveDevice flag
              draft.hasActiveDevice = true;
            }
          })
        );

        try {
          await queryFulfilled;
          console.log('🎵 [RTK] Device transfer successful, keeping optimistic update');
        } catch (error) {
          console.log('🎵 [RTK] Device transfer failed, reverting optimistic update');
          patchResult.undo();
        }
      },
    }),

    // Search & Discovery
    search: builder.query<SpotifySearchResult, { query: string; type?: string; limit?: number }>({
      query: ({ query, type = 'track', limit = 20 }) => 
        `/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`,
    }),

    // Playlists
    getUserPlaylists: builder.query<{ items: SpotifyPlaylist[]; total: number }, { limit?: number }>({
      query: ({ limit = 20 }) => `/me/playlists?limit=${limit}`,
      providesTags: ['UserPlaylists'],
    }),

    getPlaylist: builder.query<SpotifyPlaylist, string>({
      query: (playlistId) => `/playlists/${playlistId}`,
    }),

    getWorkoutPlaylists: builder.query<SpotifySearchResult, void>({
      query: () => '/search?q=workout&type=playlist&limit=20',
    }),

    // User's Music Data
    getRecentlyPlayed: builder.query<{ items: Array<{ track: SpotifyTrack; played_at: string }> }, { limit?: number }>({
      query: ({ limit = 20 }) => `/me/player/recently-played?limit=${limit}`,
    }),

    getTopTracks: builder.query<{ items: SpotifyTrack[] }, { timeRange?: 'short_term' | 'medium_term' | 'long_term'; limit?: number }>({
      query: ({ timeRange = 'medium_term', limit = 20 }) => 
        `/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
    }),

    getLikedSongs: builder.query<{ items: Array<{ track: SpotifyTrack }> }, void>({
      keepUnusedDataFor: 3600, // Cache for 1 hour (3600 seconds)
      async queryFn(arg, api, extraOptions, baseQuery) {
        // Fetch ALL liked songs with pagination
        let allItems: Array<{ track: SpotifyTrack }> = [];
        let offset = 0;
        const limit = 50;
        
        while (true) {
          const result = await baseQuery(`/me/tracks?limit=${limit}&offset=${offset}`);
          
          if (result.error) {
            return { error: result.error };
          }
          
          const data = result.data as { items: Array<{ track: SpotifyTrack }> };
          allItems = [...allItems, ...data.items];
          
          // If we got fewer than the limit, we've reached the end
          if (data.items.length < limit) {
            break;
          }
          
          offset += limit;
          
          // Safety limit to prevent infinite loops
          if (offset > 5000) break;
        }
        
        return { data: { items: allItems } };
      },
    }),

    getTopArtists: builder.query<{ items: Array<{ id: string; name: string; images: Array<{ url: string }> }> }, { timeRange?: 'short_term' | 'medium_term' | 'long_term'; limit?: number }>({
      query: ({ timeRange = 'medium_term', limit = 20 }) => 
        `/me/top/artists?time_range=${timeRange}&limit=${limit}`,
    }),

    // Convenience mutations for common actions
    playPlaylist: builder.mutation<void, { playlistId: string; deviceId?: string }>({
      query: ({ playlistId, deviceId }) => {
        const url = deviceId ? `/me/player/play?device_id=${deviceId}` : '/me/player/play';
        return {
          url,
          method: 'PUT',
          body: { context_uri: `spotify:playlist:${playlistId}` },
        };
      },
      invalidatesTags: ['PlaybackState'],
    }),

    startPlayback: builder.mutation<void, { context_uri?: string; uris?: string[]; deviceId?: string; offset?: { position?: number; uri?: string } }>({
      query: ({ context_uri, uris, deviceId, offset }) => {
        const url = deviceId ? `/me/player/play?device_id=${deviceId}` : '/me/player/play';
        const body: any = {};
        if (context_uri) body.context_uri = context_uri;
        if (uris) body.uris = uris;
        if (offset) body.offset = offset;
        
        return {
          url,
          method: 'PUT',
          body,
        };
      },
      invalidatesTags: ['PlaybackState'],
    }),

    playTrack: builder.mutation<void, { trackUri: string; deviceId?: string }>({
      query: ({ trackUri, deviceId }) => {
        const url = deviceId ? `/me/player/play?device_id=${deviceId}` : '/me/player/play';
        return {
          url,
          method: 'PUT',
          body: { uris: [trackUri] },
        };
      },
      invalidatesTags: ['PlaybackState'],
    }),
  }),
});

// Export hooks for use in components
export const {
  // Queries
  useGetUserProfileQuery,
  useCheckPremiumStatusQuery,
  useGetCurrentPlaybackStateQuery,
  useGetAvailableDevicesQuery,
  useSearchQuery,
  useGetUserPlaylistsQuery,
  useGetPlaylistQuery,
  useGetWorkoutPlaylistsQuery,
  useGetRecentlyPlayedQuery,
  useGetTopTracksQuery,
  useGetLikedSongsQuery,
  useGetTopArtistsQuery,

  // Mutations
  usePlayMusicMutation,
  usePauseMusicMutation,
  useNextTrackMutation,
  usePreviousTrackMutation,
  useSetVolumeMutation,
  useSetShuffleMutation,
  useSetRepeatMutation,
  useTransferPlaybackMutation,
  usePlayPlaylistMutation,
  useStartPlaybackMutation,
  usePlayTrackMutation,

  // Lazy queries
  useLazySearchQuery,
  useLazyGetUserPlaylistsQuery,
} = spotifyApi;

// Export the reducer for store configuration
export default spotifyApi.reducer;
