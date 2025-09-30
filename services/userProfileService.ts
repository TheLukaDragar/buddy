import { supabase } from '../lib/supabase';
import { enhancedApi } from '../store/api/enhancedApi';
import type { AppDispatch } from '../store';

export interface UserProfileData {
  profileText: string;
  onboardingCompleted: boolean;
}

/**
 * Loads user profile from database
 */
export async function loadUserProfileFromDatabase(dispatch?: any): Promise<UserProfileData | null> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    console.log('No authenticated user, cannot load profile');
    return null;
  }

  console.log('🔍 Loading profile for user ID:', session.user.id);

  // If no dispatch provided, get it from the store lazily
  if (!dispatch) {
    const { store } = await import('../store');
    dispatch = store.dispatch;
  }

  try {
    console.log('🔍 Making GraphQL query for user ID:', session.user.id);
    const result = await dispatch(
      enhancedApi.endpoints.GetUserProfile.initiate({
        userId: session.user.id
      })
    ).unwrap();
    console.log('📄 GraphQL result:', JSON.stringify(result, null, 2));

    const profile = result?.user_profilesCollection?.edges?.[0]?.node;
    
    if (profile) {
      console.log('✅ Loaded user profile from database:', profile.id, 'for user:', profile.user_id);
      return {
        profileText: profile.profile_text,
        onboardingCompleted: profile.onboarding_completed
      };
    }

    console.log('No user profile found in database');
    return null;
  } catch (error) {
    console.error('❌ Failed to load user profile from database:', error);
    return null;
  }
}

/**
 * Saves user profile to database
 */
export async function saveUserProfileToDatabase(profileData: UserProfileData, dispatch: AppDispatch): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    console.error('No authenticated user, cannot save profile');
    return false;
  }

  try {
    // First try to update existing profile
    const updateResult = await dispatch(
      enhancedApi.endpoints.UpdateUserProfile.initiate({
        userId: session.user.id,
        profileText: profileData.profileText,
        onboardingCompleted: profileData.onboardingCompleted
      })
    ).unwrap();

    if (updateResult?.updateuser_profilesCollection?.records?.length > 0) {
      console.log('✅ Updated user profile in database');
      return true;
    }

    // If no records were updated, try to insert new profile
    const insertResult = await dispatch(
      enhancedApi.endpoints.InsertUserProfile.initiate({
        userId: session.user.id,
        profileText: profileData.profileText,
        onboardingCompleted: profileData.onboardingCompleted
      })
    ).unwrap();

    if (insertResult?.insertIntouser_profilesCollection?.records && insertResult.insertIntouser_profilesCollection.records.length > 0) {
      console.log('✅ Inserted new user profile in database');
      return true;
    }

    console.error('❌ Failed to save user profile to database');
    return false;
  } catch (error) {
    console.error('❌ Failed to save user profile to database:', error);
    return false;
  }
}

/**
 * Updates only onboarding completion status
 * This function is idempotent - it won't fail if onboarding is already completed
 */
export async function updateOnboardingStatus(onboardingCompleted: boolean, dispatch: AppDispatch): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    console.error('No authenticated user, cannot update onboarding status');
    return false;
  }

  try {
    // First check if user profile exists and current status
    const currentProfile = await loadUserProfileFromDatabase(dispatch);

    if (currentProfile && currentProfile.onboardingCompleted === onboardingCompleted) {
      console.log(`✅ Onboarding status already set to ${onboardingCompleted}, no update needed`);
      return true;
    }

    const result = await dispatch(
      enhancedApi.endpoints.UpdateOnboardingStatus.initiate({
        userId: session.user.id,
        onboardingCompleted
      })
    ).unwrap();

    if (result?.updateuser_profilesCollection?.records?.length > 0) {
      console.log('✅ Updated onboarding status in database');
      return true;
    }

    // If no records were updated but we got here, it might be because there's no profile yet
    // Try to insert a new profile with just the onboarding status
    if (result?.updateuser_profilesCollection?.records?.length === 0) {
      console.log('No existing profile found, creating new profile with onboarding status');
      const insertResult = await dispatch(
        enhancedApi.endpoints.InsertUserProfile.initiate({
          userId: session.user.id,
          profileText: '', // Empty profile text for now
          onboardingCompleted
        })
      ).unwrap();

      if (insertResult?.insertIntouser_profilesCollection?.records && insertResult.insertIntouser_profilesCollection.records.length > 0) {
        console.log('✅ Created new profile with onboarding status');
        return true;
      }
    }

    console.error('❌ Failed to update onboarding status in database');
    return false;
  } catch (error) {
    console.error('❌ Failed to update onboarding status in database:', error);
    return false;
  }
}

/**
 * Syncs Redux state with database on app startup
 */
export async function syncUserProfileWithDatabase(dispatch: AppDispatch): Promise<void> {
  try {
    const dbProfile = await loadUserProfileFromDatabase(dispatch);

    if (dbProfile) {
      // Update Redux state with database data
      dispatch({
        type: 'user/setExtractedProfile',
        payload: dbProfile.profileText
      });

      dispatch({
        type: 'user/setOnboardingCompleted',
        payload: dbProfile.onboardingCompleted
      });

      console.log('✅ Synced user profile from database to Redux');
    } else {
      // Clear Redux state if no profile found in database to prevent stale data
      dispatch({
        type: 'user/setExtractedProfile',
        payload: null
      });

      dispatch({
        type: 'user/setOnboardingCompleted',
        payload: false
      });

      console.log('🧹 No user profile found in database, cleared Redux state');
    }
  } catch (error) {
    console.error('❌ Failed to sync user profile with database:', error);
  }
}
