import { Dispatch } from '@reduxjs/toolkit';
import type { ExtractedUserProfile } from '../prompts/generateUserProfile';
import { setError, setExtractedProfile, setLoading } from '../store/slices/userSlice';
import { generateAPIUrl } from '../utils';


class UserProfileService {
  /**
   * Generate a user profile from onboarding answers by calling the API
   */
  static async generateProfileFromAnswers(
    userAnswers: string[], 
    dispatch: Dispatch
  ): Promise<void> {
    dispatch(setLoading(true));
    dispatch(setError(null));

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

      const profile: ExtractedUserProfile = await response.json();
      console.log('Generated user profile:', profile);

      dispatch(setExtractedProfile(profile));
    } catch (error) {
      console.error('Error generating user profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate profile';
      dispatch(setError(errorMessage));
      
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }

  /**
   * Get a brief summary of the user's profile
   */
  static getProfileSummary(profile: ExtractedUserProfile): string {
    return profile.profileSummary;
  }
}

export default UserProfileService; 