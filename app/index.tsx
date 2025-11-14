import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useSelector } from 'react-redux';
import { ActivityIndicator, View } from 'react-native';
import { nucleus } from '../Buddy_variables';
import { useGetWorkoutPlanRequestsQuery } from '../store/api/enhancedApi';

export default function Index() {
  console.log('📱 [INDEX] Index component rendering');
  const { user, loading } = useAuth();
  console.log('📱 [INDEX] Auth state - loading:', loading, 'user:', user?.id || 'null');
  
  const onboardingCompleted = useSelector((state: any) => state.user?.onboardingCompleted);
  console.log('📱 [INDEX] Onboarding completed:', onboardingCompleted);

  // Check for active workout plan generation
  const { data: requestsData, isLoading: isLoadingRequests } = useGetWorkoutPlanRequestsQuery(
    { userId: user?.id || '' },
    { skip: !user?.id || !onboardingCompleted }
  );
  console.log('📱 [INDEX] Workout plan requests - isLoading:', isLoadingRequests, 'hasData:', !!requestsData);

  const requests = requestsData?.workout_plan_requestsCollection?.edges?.map(edge => edge.node) || [];
  const latestRequest = requests[0];
  const isGeneratingPlan = latestRequest?.status === 'pending' || latestRequest?.status === 'processing';
  console.log('📱 [INDEX] Plan generation status - isGenerating:', isGeneratingPlan, 'latestRequest:', latestRequest?.status);

  // Show loading state while checking auth or requests
  if (loading || (onboardingCompleted && isLoadingRequests)) {
    console.log('📱 [INDEX] Showing loading screen - loading:', loading, 'isLoadingRequests:', isLoadingRequests);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: nucleus.light.semantic.bg.subtle }}>
        <ActivityIndicator size="large" color={nucleus.light.global.blue["50"]} />
      </View>
    );
  }

  // Not authenticated -> login
  if (!user) {
    console.log('📱 [INDEX] No user, redirecting to /login');
    return <Redirect href="/login" />;
  }

  // Authenticated but onboarding not completed -> welcome
  if (!onboardingCompleted) {
    console.log('📱 [INDEX] Onboarding not completed, redirecting to /welcome');
    return <Redirect href="/welcome" />;
  }

  // Authenticated, onboarding completed, but plan is generating -> progress screen
  if (isGeneratingPlan) {
    console.log('📱 [INDEX] Plan generating, redirecting to /workout-plan-progress');
    return <Redirect href="/workout-plan-progress" />;
  }

  // Authenticated and onboarding completed -> main app
  console.log('📱 [INDEX] All checks passed, redirecting to /(tabs)');
  return <Redirect href="/(tabs)" />;
}
