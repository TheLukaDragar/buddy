import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { generateAPIUrl } from '../../utils';

// Async thunk for profile generation
export const generateProfileFromAnswers = createAsyncThunk(
  'user/generateProfileFromAnswers',
  async (userAnswers: string[], { rejectWithValue }) => {
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
      return profileText;
    } catch (error) {
      console.error('Error generating user profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate profile';
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
}

const initialState: UserState = {
  onboardingAnswers: [],
  onboardingCompleted: false,
  extractedProfile: null,
  profileGenerated: false,
  isLoading: false,
  isLoadingProfile: false,
  error: null,
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
    clearProfileData: (state) => {
      state.extractedProfile = null;
      state.profileGenerated = false;
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
} = userSlice.actions;

export default userSlice.reducer; 