import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ExtractedUserProfile } from '../../prompts/generateUserProfile';

export interface UserState {
  onboardingAnswers: string[];
  onboardingCompleted: boolean;
  extractedProfile: ExtractedUserProfile | null;
  profileGenerated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  onboardingAnswers: [],
  onboardingCompleted: false,
  extractedProfile: null,
  profileGenerated: false,
  isLoading: false,
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
    setExtractedProfile: (state, action: PayloadAction<ExtractedUserProfile>) => {
      state.extractedProfile = action.payload;
      state.profileGenerated = true;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
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
  },
});

export const {
  setOnboardingAnswers,
  setOnboardingCompleted,
  setExtractedProfile,
  setLoading,
  setError,
  clearUserData,
} = userSlice.actions;

export default userSlice.reducer; 