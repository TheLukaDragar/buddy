import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useSelector } from 'react-redux';
import { ActivityIndicator, View } from 'react-native';
import { nucleus } from '../Buddy_variables';
import { useGetWorkoutPlanRequestsQuery } from '../store/api/enhancedApi';

export default function Index() {
  const { user, loading } = useAuth();
  const onboardingCompleted = useSelector((state: any) => state.user?.onboardingCompleted);

  // Check for active workout plan generation
  const { data: requestsData, isLoading: isLoadingRequests } = useGetWorkoutPlanRequestsQuery(
    { userId: user?.id || '' },
    { skip: !user?.id || !onboardingCompleted }
  );

  const requests = requestsData?.workout_plan_requestsCollection?.edges?.map(edge => edge.node) || [];
  const latestRequest = requests[0];
  const isGeneratingPlan = latestRequest?.status === 'pending' || latestRequest?.status === 'processing';

  // Show loading state while checking auth or requests
  if (loading || (onboardingCompleted && isLoadingRequests)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: nucleus.light.semantic.bg.subtle }}>
        <ActivityIndicator size="large" color={nucleus.light.global.blue["50"]} />
      </View>
    );
  }

  // Not authenticated -> login
  if (!user) {
    return <Redirect href="/login" />;
  }

  // Authenticated but onboarding not completed -> welcome
  if (!onboardingCompleted) {
    return <Redirect href="/welcome" />;
  }

  // Authenticated, onboarding completed, but plan is generating -> progress screen
  if (isGeneratingPlan) {
    return <Redirect href="/workout-plan-progress" />;
  }

  // Authenticated and onboarding completed -> main app
  return <Redirect href="/(tabs)" />;
}
