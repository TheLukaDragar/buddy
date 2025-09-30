import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { generateWorkoutPlan } from '../../services/workoutPlanService';
import { generateAPIUrl } from '../../utils';

// Async thunk for profile generation
export const generateProfileFromAnswers = createAsyncThunk(
  'user/generateProfileFromAnswers',
  async (userAnswers: string[], { rejectWithValue, dispatch }) => {
    try {
      console.log('Calling API to generate user profile from answers:', userAnswers);

      const response = await fetch(generateAPIUrl('/api/generate-profile'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userAnswers }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      // Get the text response directly - this is now a simple text profile
      const profileText = await response.text();

      console.log('Generated user profile text:', profileText);

      // Save profile to database directly with upsert
      console.log('💾 Saving profile to database...');
      try {
        const { supabase } = await import('../../lib/supabase');
        const { data: { user } } = await supabase.auth.getUser();

        if (user?.id) {
          const { error } = await supabase
            .from('user_profiles')
            .upsert({
              user_id: user.id,
              profile_text: profileText,
              onboarding_answers: userAnswers, // Include the user answers
              onboarding_completed: true,
            }, {
              onConflict: 'user_id'
            });

          if (error) {
            console.error('❌ Database error:', error);
          } else {
            console.log('✅ Profile saved to database');
          }
        }
      } catch (dbError) {
        console.error('❌ Exception saving profile:', dbError);
      }

      // After profile is generated, trigger workout plan generation
      try {
        console.log('Starting workout plan generation with profile:', profileText);
        dispatch(generateWorkoutPlanFromProfile(profileText));
      } catch (workoutPlanError) {
        console.warn('Failed to start workout plan generation:', workoutPlanError);
        // Don't fail profile generation if workout plan generation fails
      }

      return profileText;
    } catch (error) {
      console.error('Error generating user profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate profile';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for workout plan generation
export const generateWorkoutPlanFromProfile = createAsyncThunk(
  'user/generateWorkoutPlanFromProfile',
  async (userProfile: string, { rejectWithValue }) => {
    try {
      console.log('Calling workout plan generation service with profile:', userProfile);

      const response = await generateWorkoutPlan({ userProfile });
      
      console.log('Workout plan generation started:', response);
      return response;
    } catch (error) {
      console.error('Error starting workout plan generation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start workout plan generation';
      return rejectWithValue(errorMessage);
    }
  }
);

export interface UserState {
  onboardingAnswers: string[];
  onboardingCompleted: boolean;
  extractedProfile: string | null;
  profileGenerated: boolean;
  isLoading: boolean;
  isLoadingProfile: boolean;
  error: string | null;
  // Workout plan generation
  workoutPlanRequestId: string | null;
  isGeneratingWorkoutPlan: boolean;
  workoutPlanError: string | null;
  // Spotify authentication
  spotifyAccessToken: string | null;
  spotifyRefreshToken: string | null;
  spotifyTokenExpiry: number | null;
  spotifyConnected: boolean;
}

const initialState: UserState = {
  onboardingAnswers: [],
  onboardingCompleted: false,
  extractedProfile: null,
  profileGenerated: false,
  isLoading: false,
  isLoadingProfile: false,
  error: null,
  // Workout plan generation
  workoutPlanRequestId: null,
  isGeneratingWorkoutPlan: false,
  workoutPlanError: null,
  // Spotify authentication
  spotifyAccessToken: null,
  spotifyRefreshToken: null,
  spotifyTokenExpiry: null,
  spotifyConnected: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setOnboardingAnswers: (state, action: PayloadAction<string[]>) => {
      state.onboardingAnswers = action.payload;
    },
    setOnboardingCompleted: (state, action: PayloadAction<boolean>) => {
      state.onboardingCompleted = action.payload;
    },
    setExtractedProfile: (state, action: PayloadAction<string>) => {
      state.extractedProfile = action.payload;
      state.profileGenerated = true;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setLoadingProfile: (state, action: PayloadAction<boolean>) => {
      state.isLoadingProfile = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearUserData: (state) => {
      state.onboardingAnswers = [];
      state.onboardingCompleted = false;
      state.extractedProfile = null;
      state.profileGenerated = false;
      state.error = null;
    },
    // Clear only profile data but keep onboarding completion status
    // Clear only profile data but keep onboarding completion status
    clearProfileData: (state) => {
      state.extractedProfile = null;
      state.profileGenerated = false;
    },
    // Spotify authentication actions
    setSpotifyTokens: (state, action: PayloadAction<{
      accessToken: string;
      refreshToken?: string;
      expiresIn: number;
    }>) => {
      state.spotifyAccessToken = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.spotifyRefreshToken = action.payload.refreshToken;
      }
      state.spotifyTokenExpiry = Date.now() + (action.payload.expiresIn * 1000);
      state.spotifyConnected = true;
    },
    refreshSpotifyToken: (state, action: PayloadAction<{
      accessToken: string;
      expiresIn: number;
    }>) => {
      state.spotifyAccessToken = action.payload.accessToken;
      state.spotifyTokenExpiry = Date.now() + (action.payload.expiresIn * 1000);
    },
    clearSpotifyTokens: (state) => {
      state.spotifyAccessToken = null;
      state.spotifyRefreshToken = null;
      state.spotifyTokenExpiry = null;
      state.spotifyConnected = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle pending state
      .addCase(generateProfileFromAnswers.pending, (state) => {
        state.isLoadingProfile = true;
        state.error = null;
      })
      // Handle success state
      .addCase(generateProfileFromAnswers.fulfilled, (state, action) => {
        state.extractedProfile = action.payload;
        state.profileGenerated = true;
        state.isLoadingProfile = false;
        state.error = null;
      })
      // Handle error state
      .addCase(generateProfileFromAnswers.rejected, (state, action) => {
        state.isLoadingProfile = false;
        state.error = action.payload as string;
      })
      // Handle workout plan generation
      .addCase(generateWorkoutPlanFromProfile.pending, (state) => {
        state.isGeneratingWorkoutPlan = true;
        state.workoutPlanError = null;
      })
      .addCase(generateWorkoutPlanFromProfile.fulfilled, (state, action) => {
        state.workoutPlanRequestId = action.payload.request_id;
        state.isGeneratingWorkoutPlan = false;
        state.workoutPlanError = null;
      })
      .addCase(generateWorkoutPlanFromProfile.rejected, (state, action) => {
        state.isGeneratingWorkoutPlan = false;
        state.workoutPlanError = action.payload as string;
      });
  },
});

export const {
  setOnboardingAnswers,
  setOnboardingCompleted,
  setExtractedProfile,
  setLoading,
  setLoadingProfile,
  setError,
  clearUserData,
  clearProfileData,
  setSpotifyTokens,
  refreshSpotifyToken,
  clearSpotifyTokens,
  
} = userSlice.actions;

// Note: generateWorkoutPlanFromProfile is already exported as part of the createAsyncThunk

export default userSlice.reducer; 