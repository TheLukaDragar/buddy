import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
import { setToken } from '../slices/fitnessPlayerSlice';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface Track {
  title: string;
  artist: string;
  genre: string;
  length: number;
  url: string;
  bitrate: string;
  energyLevel: string;
  bpm: number;
}

interface MixParameters {
  genre: string;
  style: string;
  percentage: number;
  energyLevel?: string;
  timePeriod?: string;
  bpm?: string;
}

interface MixRequest {
  topHits: boolean;
  explicitSongs: boolean;
  mixParameters: MixParameters[];
}

const FITNESS_BASE_URL = 'https://mod.partynet.serv.si';

export const fitnessApi = createApi({
  reducerPath: 'fitnessApi',
  baseQuery: fetchBaseQuery({
    baseUrl: FITNESS_BASE_URL,
    prepareHeaders: async (headers, { getState, endpoint }) => {
      const state = getState() as RootState;

      // Skip auth for token endpoint
      if (endpoint === 'getToken') {
        return headers;
      }

      // Check if token is valid
      const token = state.fitnessPlayer?.token;
      const tokenExpiresAt = state.fitnessPlayer?.tokenExpiresAt;
      const now = Date.now();
      const isTokenValid = token && tokenExpiresAt && tokenExpiresAt > now;

      if (isTokenValid) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ['Token', 'Genres', 'Styles', 'Mix'],
  endpoints: (builder) => ({
    getToken: builder.mutation<TokenResponse, void>({
      query: () => {
        const clientId = process.env.EXPO_PUBLIC_PARTYNET_CLIENT_ID || 'fitness';
        const clientSecret =  process.env.EXPO_PUBLIC_PARTYNET_CLIENT_SECRET || 'fitness';

        // Use raw string instead of URLSearchParams to match curl exactly
        const requestBody = 'client_id=fitness&client_secret=v9%24Tg7%21kLp2%40Qz6%23Xw8%5ERb1*&grant_type=client_credentials';

        console.log('[Fitness API] Authenticating with client_id:', clientId);

        return {
          url: '/oauth2/token',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'User-Agent': 'Buddy-Fitness-Player/1.0',
          },
          body: requestBody,
        };
      },
      invalidatesTags: ['Token'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Auto-store token in Redux
          dispatch(setToken({
            token: data.access_token,
            expiresIn: data.expires_in,
          }));
          console.log('[Fitness API] Token obtained and stored');
        } catch (error) {
          console.error('[Fitness API] Error fetching token:', error);
        }
      },
    }),
    getGenres: builder.query<string[], void>({
      query: () => '/fitness/genres',
      providesTags: ['Genres'],
    }),
    getStyles: builder.query<string[], string>({
      query: (genre) => `/fitness/genres/${genre}`,
      providesTags: (result, error, genre) => [{ type: 'Styles', id: genre }],
    }),
    getMix: builder.mutation<Track[], MixRequest>({
      async queryFn(body, { getState, dispatch }, _extraOptions, fetchWithBQ) {
        console.log('[Fitness API] getMix called with:', body);

        const state = getState() as RootState;
        const token = state.fitnessPlayer?.token;
        const tokenExpiresAt = state.fitnessPlayer?.tokenExpiresAt;
        const now = Date.now();
        const isTokenValid = token && tokenExpiresAt && tokenExpiresAt > now;

        console.log('[Fitness API] Token status:', {
          exists: !!token,
          isValid: isTokenValid,
          expiresAt: tokenExpiresAt ? new Date(tokenExpiresAt).toISOString() : 'N/A',
        });

        // Auto-fetch token if needed
        if (!isTokenValid) {
          console.log('[Fitness API] Token expired or missing, fetching new one...');
          try {
            await dispatch(fitnessApi.endpoints.getToken.initiate()).unwrap();
            console.log('[Fitness API] Token refreshed successfully');
          } catch (error) {
            console.error('[Fitness API] Failed to refresh token:', error);
            return { error: { status: 401, data: 'Failed to authenticate' } };
          }
        }

        // Now make the actual request with the fresh token
        console.log('[Fitness API] Making mix request to /fitness/mix');
        const result = await fetchWithBQ({
          url: '/fitness/mix',
          method: 'POST',
          body,
        });

        if (result.error) {
          console.error('[Fitness API] Mix request failed:', {
            status: result.error.status,
            data: result.error.data,
          });
          return { error: result.error };
        }

        // Handle response - API might return object with playlist property or direct array
        let tracks: Track[] = [];
        if (result.data) {
          if (Array.isArray(result.data)) {
            tracks = result.data;
          } else if ((result.data as any).playlist && Array.isArray((result.data as any).playlist)) {
            tracks = (result.data as any).playlist;
          }
        }

        console.log('[Fitness API] Mix request successful:', {
          trackCount: tracks.length,
          rawDataType: typeof result.data,
          isArray: Array.isArray(result.data),
        });

        return { data: tracks };
      },
      invalidatesTags: ['Mix'],
    }),
    
    // Note: /fitness/file is handled in expo-audio, not RTK Query, due to streaming
  }),
});

export const {
  useGetTokenMutation,
  useGetGenresQuery,
  useGetStylesQuery,
  useGetMixMutation,
} = fitnessApi;
