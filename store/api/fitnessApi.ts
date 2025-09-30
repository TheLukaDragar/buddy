import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

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
    prepareHeaders: async (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.fitnessPlayer?.token;
      if (token) {
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
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          await queryFulfilled;
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
      query: (body) => ({
        url: '/fitness/mix',
        method: 'POST',
        body,
      }),
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
