import { Image } from "expo-image";
import { router } from "expo-router";
import * as React from "react";
import { Animated, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { useBuddyTheme } from "@/constants/BuddyTheme";
import { SystemBars } from "react-native-edge-to-edge";
import { nucleus } from "../Buddy_variables.js";
import { useAuth } from "../contexts/AuthContext";
import type { RootState } from "../store";
import { useGetWorkoutPlanRequestsQuery } from "../store/api/enhancedApi";
import { useAppDispatch, useAppSelector } from "../store/hooks";


interface ProgressStepProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  emoji: string;
  isComplete: boolean;
  isActive: boolean;
  progress: number;
}

function ProgressStep({
  stepNumber,
  totalSteps,
  title,
  emoji,
  isComplete,
  isActive,
  progress,
}: ProgressStepProps) {
  const theme = useBuddyTheme();
  const animatedWidth = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: isComplete ? 1 : isActive ? progress : 0,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [isComplete, isActive, progress]);

  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={[
          styles.stepIcon,
          { backgroundColor: nucleus.light.global.brand["50"] }
        ]}>
          <Text style={styles.stepEmoji}>{emoji}</Text>
        </View>
        <View style={styles.stepTextWrapper}>
          <Text style={[
            styles.stepLabel,
            { color: nucleus.light.semantic.fg.muted }
          ]}>
            Step {stepNumber}/{totalSteps}
          </Text>
          <Text style={[
            styles.stepTitle,
            { color: nucleus.light.semantic.fg.base }
          ]}>
            {title}
          </Text>
        </View>
      </View>
      <View style={[
        styles.progressTrack,
        { backgroundColor: nucleus.light.semantic.bg.canvas }
      ]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: nucleus.light.semantic.accent.bold,
              width: animatedWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

export default function WorkoutPlanProgress() {
  const theme = useBuddyTheme();
  const { user } = useAuth();
  const [isCancelling, setIsCancelling] = React.useState(false);
  const dispatch = useAppDispatch();

  // Get profile from Redux
  const extractedProfile = useAppSelector((state: RootState) => (state as any).user?.extractedProfile);

  // Monitor workout plan requests with real-time updates
  const { data: requestsData, isLoading } = useGetWorkoutPlanRequestsQuery(
    { userId: user?.id || '' },
    { skip: !user?.id, pollingInterval: 2000, refetchOnReconnect: true, refetchOnFocus: true, refetchOnMountOrArgChange: true } // Poll every 2 seconds for updates
  );

  const requests = requestsData?.workout_plan_requestsCollection?.edges?.map(edge => edge.node) || [];
  const latestRequest = requests[0]; // Most recent request


  const steps = [
    {
      title: "Creating profile 🎯",
      emoji: "👤",
    },
    {
      title: "Generating workout plan 🏋",
      emoji: "📝",
    },
    {
      title: "Building exercise profiles 🚀",
      emoji: "💪",
    },
  ];


  // Simple 3-step progress logic
  const getProgressInfo = () => {
    // Step 1: Profile Generation - check if profile exists in Redux
    const profileComplete = extractedProfile && extractedProfile.length > 0;

    if (!profileComplete) {
      return {
        currentStep: 0, // Working on profile (step 1)
        stepProgress: 0.7, // Slowly loading until profile done
        isComplete: false,
        showButton: false,
        stepDescription: 'Creating your personalized fitness profile...'
      };
    }

    // Step 2: Plan Generation - check workout plan status
    if (!latestRequest) {
      return {
        currentStep: 1, // Working on plan (step 2), profile (step 1) complete
        stepProgress: 0.2, // Just started plan generation
        isComplete: false,
        showButton: false,
        stepDescription: 'Starting workout plan generation...'
      };
    }

    // Handle failed requests (errors or cancellation)
    if (latestRequest.status === 'failed') {
      const errorMessage = latestRequest.error_message;
      const isCancelled = !errorMessage; // No error message = user cancelled

      return {
        currentStep: 0,
        stepProgress: 0,
        isComplete: false,
        showButton: true, // Show button to try again or go back
        hasError: !isCancelled,
        stepDescription: isCancelled
          ? 'Generation cancelled. You can try again anytime.'
          : `Generation failed: ${errorMessage || 'Unknown error occurred'}`
      };
    }

    // Step 3: Exercise Profiles - track exercises_completed/exercises_total
    // CRITICAL: Check if current_step is actually set (not null/undefined) before using it
    // If it's null, the request was just created and progress hasn't started yet
    const currentStep = latestRequest.current_step ?? null;
    const exercisesTotal = latestRequest.exercises_total ?? null;
    const exercisesCompleted = latestRequest.exercises_completed ?? null;

    // If current_step is null, the request was just created - show initial state
    if (currentStep === null || currentStep === undefined) {
      // Request just created, show initial plan generation progress
      let timeProgress = 0.1; // Start at 10%

      if (latestRequest.created_at) {
        const startTime = new Date(latestRequest.created_at).getTime();
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        // For the first few seconds, show minimal progress to avoid confusion
        const maxSeconds = 3; // First 3 seconds show minimal progress
        const progressRange = 0.1; // 10% to 20% = 10% range for initial state
        const timeBasedProgress = Math.min(elapsedSeconds / maxSeconds, 1) * progressRange;
        timeProgress = 0.1 + timeBasedProgress; // 10% to 20%
      }

      return {
        currentStep: 1, // Working on plan (step 2), profile complete
        stepProgress: timeProgress, // 10% -> 20% initially
        isComplete: false,
        showButton: false,
        stepDescription: latestRequest.step_description || 'Starting workout plan generation...'
      };
    }

    // Now we know current_step is set, use it properly
    if (currentStep >= 3 && exercisesTotal !== null && exercisesTotal > 0) {
      // Step 3: Generating exercise profiles - show actual progress
      const exerciseProgress = exercisesCompleted !== null && exercisesTotal > 0 
        ? exercisesCompleted / exercisesTotal 
        : 0;

      return {
        currentStep: 2, // Working on exercises (step 3), profile + plan complete
        stepProgress: exerciseProgress,
        isComplete: latestRequest.status === 'completed',
        showButton: latestRequest.status === 'completed',
        stepDescription: latestRequest.status === 'completed'
          ? 'Your personalized workout plan is ready!'
          : `Creating exercise profiles: ${exercisesCompleted || 0}/${exercisesTotal}`
      };
    } else if (currentStep >= 2) {
      // Step 2: Creating workout structure - use created_at for progress
      let structureProgress = 0.2; // Start at 20%

      if (latestRequest.created_at) {
        const startTime = new Date(latestRequest.created_at).getTime();
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        const maxSeconds = 10; // Expect ~10 seconds for structure creation
        const progressRange = 0.7; // 20% to 90% = 70% range
        const timeBasedProgress = Math.min(elapsedSeconds / maxSeconds, 1) * progressRange;
        structureProgress = 0.2 + timeBasedProgress; // 20% to 90%
      }

      return {
        currentStep: 1, // Step 2 active, step 1 complete
        stepProgress: structureProgress,
        isComplete: false,
        showButton: false,
        stepDescription: latestRequest.step_description || 'Creating your workout structure...'
      };
    } else {
      // Still working on plan generation (current_step: 1)
      // Use created_at timestamp for consistent progress calculation
      let timeProgress = 0.1; // Start at 10%

      if (latestRequest.created_at) {
        const startTime = new Date(latestRequest.created_at).getTime();
        const elapsedMinutes = (Date.now() - startTime) / (1000 * 60);
        const maxMinutes = 5; // Expect ~5 minutes for plan generation
        const progressRange = 0.8; // 10% to 90% = 80% range
        const timeBasedProgress = Math.min(elapsedMinutes / maxMinutes, 1) * progressRange;
        timeProgress = 0.1 + timeBasedProgress; // 10% to 90%
      }

      return {
        currentStep: 1, // Working on plan (step 2), profile complete
        stepProgress: timeProgress, // 10% -> 90% over 5 minutes
        isComplete: false,
        showButton: false,
        stepDescription: latestRequest.step_description || 'Generating workout plan...'
      };
    }
  };

  const { currentStep, stepProgress, isComplete, showButton, stepDescription, hasError } = getProgressInfo();

  const handleContinue = () => {
    router.push("/(tabs)");
  };

  const handleCancel = async () => {
    if (!latestRequest || isCancelling) return;

    setIsCancelling(true);
    try {
      // Simple database update using Supabase directly
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase
        .from('workout_plan_requests')
        .update({ status: 'failed' })
        .eq('request_id', latestRequest.request_id);

      if (error) throw error;

      console.log('✅ Cancelled workout plan generation');
      router.push("/(tabs)");
    } catch (error) {
      console.error('❌ Failed to cancel workout plan generation:', error);
      setIsCancelling(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[
      styles.container,
      { backgroundColor: nucleus.light.semantic.bg.subtle }
    ]}>
      <SystemBars style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Character Animation */}
        <View style={styles.characterContainer}>
          <Image
            source={require("../assets/login/logo.png")}
            style={styles.characterImage}
            contentFit="contain"
          />
        </View>

        {/* Title and Description */}
        <View style={styles.titleContainer}>
          <Text style={[
            styles.titleText,
            { color: nucleus.light.semantic.fg.base }
          ]}>
            {hasError
              ? "Oops! Something went wrong 😞"
              : isComplete
                ? "You're all set! 🎉"
                : currentStep === 0
                  ? "Creating your profile..."
                  : currentStep === 1
                    ? "Designing your workouts..."
                    : "Building exercise library..."
            }
          </Text>
          <Text style={[
            styles.descriptionText,
            { color: nucleus.light.semantic.fg.base }
          ]}>
            {stepDescription}
          </Text>
        </View>

        {/* Progress Steps */}
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => {
            const stepIsComplete = isComplete || index < currentStep;
            const stepIsActive = index === currentStep;

            // Dynamic titles based on completion status
            let stepTitle = step.title;
            if (stepIsComplete) {
              if (index === 0) stepTitle = "Profile created 🎯";
              else if (index === 1) stepTitle = "Workout plan generated 🏋";
              else if (index === 2) stepTitle = "Exercise profiles ready 🚀";
            }

            return (
              <ProgressStep
                key={index}
                stepNumber={index + 1}
                totalSteps={steps.length}
                title={stepTitle}
                emoji={step.emoji}
                isComplete={stepIsComplete}
                isActive={stepIsActive}
                progress={stepIsActive ? stepProgress : 0}
              />
            );
          })}
        </View>
      </ScrollView>

      {/* Action Button */}
      {showButton && (
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleContinue}
            style={[
              styles.button,
              {
                backgroundColor: hasError
                  ? nucleus.light.global.red["60"]
                  : nucleus.light.global.blue["70"]
              }
            ]}
            labelStyle={[
              styles.buttonLabel,
              { color: nucleus.light.global.blue["10"] }
            ]}
            contentStyle={styles.buttonContent}
            compact={false}
          >
            {hasError ? "Try Again" : "Let's do this 💪"}
          </Button>
        </View>
      )}

      {/* Cancel Link - Only show when not complete and has active request */}
      {!isComplete && latestRequest && latestRequest.status === 'processing' && (
        <View style={styles.cancelContainer}>
          <Pressable onPress={handleCancel} disabled={isCancelling}>
            <Text style={[
              styles.cancelText,
              { color: nucleus.light.semantic.fg.muted }
            ]}>
              {isCancelling ? 'Cancelling...' : 'Cancel generation'}
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  characterContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  characterImage: {
    width: 130,
    height: 196,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 26,
  },
  titleText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 8,
    includeFontPadding: false,
  },
  descriptionText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    includeFontPadding: false,
  },
  exerciseProgressText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 8,
    includeFontPadding: false,
  },
  stepsContainer: {
    gap: 40,
  },
  stepContainer: {
    gap: 16,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  stepEmoji: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    includeFontPadding: false,
  },
  stepTextWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  stepLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    lineHeight: 18,
    includeFontPadding: false,
  },
  stepTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    lineHeight: 17,
    includeFontPadding: false,
  },
  progressTrack: {
    height: 8,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 9999,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  button: {
    borderRadius: 48,
    minHeight: 48,
    justifyContent: 'center',
  },
  buttonContent: {
    minHeight: 48,
    paddingHorizontal: 24,
    paddingVertical: 0,
  },
  buttonLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    lineHeight: 20,
    marginVertical: 0,
    includeFontPadding: false,
  },
  cancelContainer: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  cancelText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    lineHeight: 20,
    textDecorationLine: 'underline',
  },
});
