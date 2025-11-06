import * as Haptics from 'expo-haptics';
import { Image } from "expo-image";
import React, { useEffect, useMemo, useState } from 'react';
import { BackHandler, Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AutoSkeletonView } from 'react-native-auto-skeleton';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Text } from 'react-native-paper';
import Animated, {
  Easing,
  Extrapolate,
  FadeIn,
  FadeOut,
  Layout,
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { nucleus } from '../Buddy_variables';
import { GetWorkoutEntryBasicQuery } from '../graphql/generated';
import { useGetExerciseByIdQuery, useGetWorkoutEntryBasicQuery, useSwapExerciseWithAlternativeMutation, useUpdateWorkoutEntryMutation } from '../store/api/enhancedApi';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// Helper function to get equipment icon based on slug
const getEquipmentIcon = (slug: string) => {
  const iconMap: { [key: string]: any } = {
    'back-extension-machine': require('../assets/equipment_icons/back-extension-machine.png'),
    'barbell': require('../assets/equipment_icons/barbell.png'),
    'barbells': require('../assets/equipment_icons/barbell.png'),
    'bench': require('../assets/equipment_icons/bench.png'),
    'body-weight': require('../assets/equipment_icons/body-weight.png'),
    'cable': require('../assets/equipment_icons/cable.png'),
    'cables': require('../assets/equipment_icons/cable.png'),
    'calf-raise-machine': require('../assets/equipment_icons/calf-raise-machine.png'),
    'chair': require('../assets/equipment_icons/chair.png'),
    'chairs': require('../assets/equipment_icons/chair.png'),
    'chest-fly-machine': require('../assets/equipment_icons/chest-fly-machine.png'),
    'decline-bench-press': require('../assets/equipment_icons/decline-bench-press.png'),
    'decline-bench': require('../assets/equipment_icons/decline-bench.png'),
    'dips-machine': require('../assets/equipment_icons/dips-machine.png'),
    'door-frame': require('../assets/equipment_icons/door-frame.png'),
    'dumbbell': require('../assets/equipment_icons/dumbbell.png'),
    'dumbbells': require('../assets/equipment_icons/dumbbell.png'),
    'ez-bar': require('../assets/equipment_icons/ez-bar.png'),
    'ez-bars': require('../assets/equipment_icons/ez-bar.png'),
    'filled-bag': require('../assets/equipment_icons/filled-bag.png'),
    'filled-bags': require('../assets/equipment_icons/filled-bag.png'),
    'hack-squat-machine': require('../assets/equipment_icons/hack-squat-machine.png'),
    'incline-bench-press': require('../assets/equipment_icons/incline-bench-press.png'),
    'incline-bench': require('../assets/equipment_icons/incline-bench.png'),
    'incline-chest-press-machine': require('../assets/equipment_icons/incline-chest-press-machine.png'),
    'kettlebell': require('../assets/equipment_icons/kettlebell.png'),
    'kettlebells': require('../assets/equipment_icons/kettlebell.png'),
    'knee-extension-machine': require('../assets/equipment_icons/knee-extension-machine.png'),
    'knee-flexion-machine': require('../assets/equipment_icons/knee-flexion-machine.png'),
    'leg-press': require('../assets/equipment_icons/leg-press.png'),
    'pull-up-bar': require('../assets/equipment_icons/pull-up-bar.png'),
    'pull-up-bars': require('../assets/equipment_icons/pull-up-bar.png'),
    'pull-up-machine': require('../assets/equipment_icons/pull-up-machine.png'),
    'resistance-band': require('../assets/equipment_icons/resistance-band.png'),
    'resistance-bands': require('../assets/equipment_icons/resistance-band.png'),
    'seated-calf-raise-machine': require('../assets/equipment_icons/seated-calf-raise-machine.png'),
    'shoulder-abduction-machine': require('../assets/equipment_icons/shoulder-abduction-machine.png'),
    'shoulder-press-machine': require('../assets/equipment_icons/shoulder-press-machine.png'),
    'sliders': require('../assets/equipment_icons/sliders.png'),
    'smith-machine': require('../assets/equipment_icons/smith-machine.png'),
    'squat-rack': require('../assets/equipment_icons/squat-rack.png'),
    'squat-racks': require('../assets/equipment_icons/squat-rack.png'),
    'suspension-trainer': require('../assets/equipment_icons/suspension-trainer.png'),
    'suspension-trainers': require('../assets/equipment_icons/suspension-trainer.png'),
    'swiss-ball': require('../assets/equipment_icons/swiss-ball.png'),
    'swiss-balls': require('../assets/equipment_icons/swiss-ball.png'),
    'towel': require('../assets/equipment_icons/towel.png'),
    'towels': require('../assets/equipment_icons/towel.png'),
    'trap-bar': require('../assets/equipment_icons/trap-bar.png'),
    'trap-bars': require('../assets/equipment_icons/trap-bar.png'),
    'weight-plate': require('../assets/equipment_icons/weight-plate.png'),
    'weight-plates': require('../assets/equipment_icons/weight-plate.png'),
  };
  
  // Try exact match first
  if (iconMap[slug]) {
    return iconMap[slug];
  }
  
  // Try with 's' added for plural
  const pluralSlug = slug + 's';
  if (iconMap[pluralSlug]) {
    return iconMap[pluralSlug];
  }
  
  // Try removing 's' for singular (in case slug is already plural)
  const singularSlug = slug.endsWith('s') ? slug.slice(0, -1) : slug;
  if (iconMap[singularSlug]) {
    return iconMap[singularSlug];
  }
  
  // Default fallback
  return require('../assets/equipment_icons/body-weight.png');
};

// Exercise Thumbnail Component
interface ExerciseThumbnailProps {
  exerciseName: string;
  slug?: string;
}

const ExerciseThumbnail: React.FC<ExerciseThumbnailProps> = React.memo(({ exerciseName, slug }) => {
  console.log('ExerciseThumbnail - Props:', { exerciseName, slug });
  
  // Create thumbnail URI
  const thumbnailUri = slug 
    ? `https://kmtddcpdqkeqipyetwjs.supabase.co/storage/v1/object/public/workouts/processed/${slug}/${slug}_cropped_thumbnail_low.jpg`
    : null;

  return (
    <View style={styles.heroContainer}>
      <Animated.View 
        key={slug || 'default'} 
        entering={FadeIn.duration(300).easing(Easing.out(Easing.ease))}
        exiting={FadeOut.duration(200).easing(Easing.in(Easing.ease))}
        layout={Layout.springify()}
        style={StyleSheet.absoluteFill}
      >
        {thumbnailUri ? (
          <Image
            source={{ uri: thumbnailUri }}
            style={styles.heroImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            placeholder={require('../assets/images/9_16_2.png')}
            placeholderContentFit="cover"
          />
        ) : (
          <Image
            source={require('../assets/images/9_16_2.png')}
            style={styles.heroImage}
            contentFit="cover"
          />
        )}
      </Animated.View>
    </View>
  );
});

// Alternative Exercise Card Component - fetches exercise data separately to avoid stale data
interface AlternativeExerciseCardProps {
  alternative: {
    node: {
      id: string;
      alternative_exercise_id: string;
      note?: string | null;
      position: number;
    };
  };
  onSelect: (exercise: any) => void;
  isSwapping: boolean;
}

const AlternativeExerciseCard: React.FC<AlternativeExerciseCardProps> = React.memo(({ alternative, onSelect, isSwapping }) => {
  // Fetch exercise data separately using alternative_exercise_id (always fresh!)
  const { data: exerciseData, isLoading } = useGetExerciseByIdQuery(
    { id: alternative.node.alternative_exercise_id },
    { skip: !alternative.node.alternative_exercise_id }
  );

  const altExercise = exerciseData?.exercisesCollection?.edges?.[0]?.node;

  const cleanName = altExercise?.name?.replace(/\s*\([^)]*\)/g, '').trim() || '';
  const thumbnailUrl = altExercise?.slug 
    ? `https://kmtddcpdqkeqipyetwjs.supabase.co/storage/v1/object/public/workouts/processed/${altExercise.slug}/${altExercise.slug}_cropped_thumbnail_low.jpg`
    : null;

  return (
    <TouchableOpacity
      key={`${alternative.node.id}-${alternative.node.alternative_exercise_id}`}
      style={styles.alternativeCard}
      onPress={() => altExercise && onSelect(altExercise)}
      activeOpacity={0.7}
      disabled={isSwapping || !altExercise}
    >
      <AutoSkeletonView 
        isLoading={isLoading || !altExercise}
        shimmerSpeed={1.5}
        animationType="gradient"
        defaultRadius={12}
      >
        <View style={styles.alternativeRow}>
          <View style={styles.alternativeImageContainer}>
            {thumbnailUrl ? (
              <Image
                source={{ uri: thumbnailUrl }}
                style={styles.alternativeImage}
                contentFit="cover"
                cachePolicy="memory-disk"
                onError={() => {
                  console.log('Failed to load alternative thumbnail:', thumbnailUrl);
                }}
                placeholder={require('../assets/exercises/squats.png')}
                placeholderContentFit="cover"
              />
            ) : (
              <Image
                source={require('../assets/exercises/squats.png')}
                style={styles.alternativeImage}
                contentFit="cover"
              />
            )}
          </View>
          <View style={styles.alternativeInfo}>
            <View style={styles.alternativeTextContainer}>
              <Text style={styles.alternativeName} numberOfLines={3} ellipsizeMode="tail">
                {cleanName}
              </Text>
              {alternative.node.note && (
                <Text style={styles.alternativeNote}>
                  {alternative.node.note}
                </Text>
              )}
            </View>
          </View>
        </View>
      </AutoSkeletonView>
    </TouchableOpacity>
  );
});

// Extract the workout entry node type from the generated GraphQL query
type WorkoutEntryNode = NonNullable<
  NonNullable<GetWorkoutEntryBasicQuery['workout_entriesCollection']>['edges'][0]['node']
>;

interface ExerciseInfoModalProps {
  visible: boolean;
  onClose: () => void;
  onAdjustmentComplete?: () => void;
  
  // Just pass the workout entry ID - modal will fetch its own data
  workoutEntryId: string;
}

const ExerciseInfoModal = React.memo<ExerciseInfoModalProps>(function ExerciseInfoModal({ visible, onClose, onAdjustmentComplete, workoutEntryId }) {
  const insets = useSafeAreaInsets();
  const SHEET_HEIGHT = SCREEN_HEIGHT;
  
  const translateY = useSharedValue(SHEET_HEIGHT);
  
  // Fetch workout entry data WITHOUT nested exercises (avoids stale data)
  const { data, isLoading: isLoadingEntry, error } = useGetWorkoutEntryBasicQuery(
    { id: workoutEntryId },
    { skip: !visible || !workoutEntryId }
  );
  
  const workoutEntryNode = data?.workout_entriesCollection?.edges[0]?.node;
  
  // Fetch main exercise data separately using exercise_id (always fresh!)
  const { data: mainExerciseData, isLoading: isLoadingMainExercise } = useGetExerciseByIdQuery(
    { id: workoutEntryNode?.exercise_id || '' },
    { skip: !visible || !workoutEntryNode?.exercise_id }
  );
  
  const mainExercise = mainExerciseData?.exercisesCollection?.edges?.[0]?.node;
  
  // RTK Query mutation hooks
  const [updateWorkoutEntry, { isLoading: isUpdating }] = useUpdateWorkoutEntryMutation();
  const [swapExerciseWithAlternative, { isLoading: isSwapping }] = useSwapExerciseWithAlternativeMutation();
  
  // Track if exercise has been swapped in this modal session
  const [hasSwapped, setHasSwapped] = useState(false);
  
  // State for Adjusting workout parameters
  const [adjustedSets, setAdjustedSets] = useState(0);
  const [adjustedReps, setAdjustedReps] = useState('8-12');
  const [adjustedTime, setAdjustedTime] = useState('');
  const [adjustedWeight, setAdjustedWeight] = useState('Body');
  
  // Hold-to-increment state
  const weightHoldIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const setsHoldIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const repsHoldIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Debounce timers for database updates (prevents excessive mutations during hold)
  const weightDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const setsDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const repsDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Update state when workout entry data loads
  useEffect(() => {
    if (workoutEntryNode) {
      setAdjustedSets(workoutEntryNode.sets);
      setAdjustedReps(workoutEntryNode.reps || '8-12');
      setAdjustedTime(workoutEntryNode.time || '');
      setAdjustedWeight(workoutEntryNode.weight || 'Body');
    }
  }, [workoutEntryNode]);
  
  // Parse reps to get min value for adjustment
  const parseReps = (reps: string): { min: number; max?: number; original: string } => {
    if (reps.includes('-')) {
      const [min, max] = reps.split('-').map(n => parseInt(n.trim()));
      return { min, max, original: reps };
    }
    const single = parseInt(reps);
    return { min: single, original: reps };
  };

  // Parse time to get numeric value for display
  const parseTime = (time: string): string => {
    if (!time) return '-';
    // Extract first number from time string (handles "30s", "60 seconds", "45", etc.)
    const match = time.match(/\d+/);
    return match ? match[0] : time;
  };
  
  // Parse weight to check if it's numeric
  const parseWeight = (weight: string): { value: number; unit: string } | null => {
    if (!weight || weight.toLowerCase() === 'body') return null;
    const match = weight.match(/^([\d.]+)\s*(kg|lbs?|lb)?$/i);
    if (match) {
      return { value: parseFloat(match[1]), unit: match[2] || '' };
    }
    return null;
  };
  
  // Adjust weight (simple increment) - debounced DB save
  const adjustWeightValue = (delta: number) => {
    setAdjustedWeight((currentWeight) => {
      const parsed = parseWeight(currentWeight);
      if (!parsed) return currentWeight;
      
      const newValue = Math.max(0, parsed.value + delta);
      const newWeight = `${newValue}${parsed.unit}`;
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Clear existing debounce timer
      if (weightDebounceRef.current) {
        clearTimeout(weightDebounceRef.current);
      }
      
      // Save to database after 500ms of inactivity
      weightDebounceRef.current = setTimeout(() => {
        updateWorkoutEntry({
          id: workoutEntryId,
          weight: newWeight,
          isAdjusted: true,
          adjustmentReason: 'User adjusted weight'
        });
      }, 500);
      
      return newWeight;
    });
  };
  
  // Adjust sets (simple increment) - debounced DB save
  const adjustSetsValue = (delta: number) => {
    setAdjustedSets((currentSets) => {
      const newSets = Math.max(1, currentSets + delta);
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Clear existing debounce timer
      if (setsDebounceRef.current) {
        clearTimeout(setsDebounceRef.current);
      }
      
      // Save to database after 500ms of inactivity
      setsDebounceRef.current = setTimeout(() => {
        updateWorkoutEntry({
          id: workoutEntryId,
          sets: newSets,
          isAdjusted: true,
          adjustmentReason: 'User adjusted sets'
        });
      }, 500);
      
      return newSets;
    });
  };
  
  // Hold-to-increment handlers with separate refs for timeouts
  const weightHoldTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const setsHoldTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const repsHoldTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const startHoldIncrement = (
    adjustFunction: () => void, 
    intervalRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>,
    timeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>
  ) => {
    // Clear any existing interval and timeout
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Call once immediately for instant feedback
    adjustFunction();
    
    // Start auto-incrementing after 300ms, then every 100ms
    timeoutRef.current = setTimeout(() => {
      // Haptic feedback when hold starts
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      intervalRef.current = setInterval(() => {
        adjustFunction();
      }, 100);
    }, 300);
  };
  
  const stopHoldIncrement = (
    intervalRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>,
    timeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>
  ) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
  
  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (weightHoldIntervalRef.current) {
        clearInterval(weightHoldIntervalRef.current);
      }
      if (setsHoldIntervalRef.current) {
        clearInterval(setsHoldIntervalRef.current);
      }
      if (repsHoldIntervalRef.current) {
        clearInterval(repsHoldIntervalRef.current);
      }
      
      // Clear debounce timers and flush pending updates
      if (weightDebounceRef.current) {
        clearTimeout(weightDebounceRef.current);
      }
      if (setsDebounceRef.current) {
        clearTimeout(setsDebounceRef.current);
      }
      if (repsDebounceRef.current) {
        clearTimeout(repsDebounceRef.current);
      }
    };
  }, []);
  
  // Adjust reps (simple increment) - debounced DB save
  const adjustRepsValue = (delta: number) => {
    setAdjustedReps((currentReps) => {
      const parsed = parseReps(currentReps);
      const newMin = Math.max(1, parsed.min + delta);
      let newReps: string;
      
      if (parsed.max) {
        const newMax = Math.max(newMin + 1, parsed.max + delta);
        newReps = `${newMin}-${newMax}`;
      } else {
        newReps = `${newMin}`;
      }
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Clear existing debounce timer
      if (repsDebounceRef.current) {
        clearTimeout(repsDebounceRef.current);
      }
      
      // Save to database after 500ms of inactivity
      repsDebounceRef.current = setTimeout(() => {
        updateWorkoutEntry({
          id: workoutEntryId,
          reps: newReps,
          isAdjusted: true,
          adjustmentReason: 'User adjusted reps'
        });
      }, 500);
      
      return newReps;
    });
  };
  
  // Handle alternative exercise selection
  const handleSelectAlternative = async (alternativeExercise: any) => {
    console.log('Selected alternative exercise:', alternativeExercise);
    console.log('Current workoutEntryNode:', workoutEntryNode);
    
    // Mark that a swap has occurred
    setHasSwapped(true);
    
    try {
      // Extract plan information for proper cache invalidation
      const planId = workoutEntryNode?.workout_plans?.id;
      const weekNumber = workoutEntryNode?.week_number;
      const day = workoutEntryNode?.day;
      
      console.log('Plan information for cache invalidation:', { planId, weekNumber, day });
      
      // Call the swap exercise mutation with plan information
      const result = await swapExerciseWithAlternative({
        workoutEntryId: workoutEntryId,
        newExerciseId: alternativeExercise.id,
        alternativeNote: `Swapped to ${alternativeExercise.name}`,
        // Pass plan information for specific cache invalidation
        planId: planId,
        weekNumber: weekNumber,
        day: day
      }).unwrap();
      
      console.log('Swap exercise mutation result:', result);
      
      // Don't close the modal - let user continue adjusting
      // The exercise data will automatically update via GetExerciseById refetch
      
      // Show success feedback
      console.log('✅ Exercise swapped successfully', result);
      
      // Call adjustment complete callback if provided (for parent component updates)
      if (onAdjustmentComplete) {
        onAdjustmentComplete();
      }
    } catch (error: any) {
      console.error('❌ Failed to swap exercise:', error);
      // Silently fail - don't show error to user
    }
  };

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 25, stiffness: 150, mass: 0.8 });
    } else {
      translateY.value = withSpring(SHEET_HEIGHT, { damping: 20, stiffness: 200 });
    }
  }, [visible, SHEET_HEIGHT]);

  // Handle hardware back button
  useEffect(() => {
    if (!visible) return;

    const handleBackPress = () => {
      translateY.value = withTiming(SHEET_HEIGHT, {
        duration: 250,
        easing: Easing.in(Easing.quad),
      }, (finished) => {
        if (finished) {
          runOnJS(onClose)();
        }
      });
      return true; // Prevent default back action
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => backHandler.remove();
  }, [visible, translateY, onClose, SHEET_HEIGHT]);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: { startY: number }) => {
      context.startY = translateY.value;
    },
    onActive: (event, context: { startY: number }) => {
      const newTranslateY = context.startY + event.translationY;
      translateY.value = Math.max(0, newTranslateY);
    },
    onEnd: (event) => {
      const shouldDismiss = event.translationY > SHEET_HEIGHT * 0.3 || event.velocityY > 800;
      if (shouldDismiss) {
        translateY.value = withTiming(SHEET_HEIGHT, {
          duration: 250,
          easing: Easing.in(Easing.quad),
        }, (finished) => {
          if (finished) {
            runOnJS(onClose)();
          }
        });
      } else {
        translateY.value = withTiming(0, {
          duration: 200,
          easing: Easing.out(Easing.quad),
        });
      }
    },
  });

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, SHEET_HEIGHT], [0.7, 0], Extrapolate.CLAMP),
  }));

  // Reset swap state when modal closes
  useEffect(() => {
    if (!visible) {
      setHasSwapped(false);
    }
  }, [visible]);

  // Extract alternatives from workoutEntryNode (just IDs, we'll fetch exercise data separately)
  const alternatives = useMemo(() => {
    if (!workoutEntryNode) return [];
    return workoutEntryNode.workout_entry_alternativesCollection?.edges || [];
  }, [workoutEntryNode]);

  // Extract exercise data from mainExercise (fetched separately - always fresh!)
  const exerciseData = useMemo(() => {
    if (!mainExercise) return null;
    
    return {
      name: mainExercise.name,
      slug: mainExercise.slug || undefined,
      id: mainExercise.id,
      instructions: mainExercise.instructions ? [mainExercise.instructions] : [],
      equipment_groups: mainExercise.equipment_groups,
      category: hasSwapped ? "Swapped to" : "Adjust Exercise"
    };
  }, [mainExercise, hasSwapped]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.backdrop, animatedBackdropStyle]} />

      <PanGestureHandler
        onGestureEvent={gestureHandler}
        activeOffsetY={20}
        failOffsetX={[-10, 10]}
      >
        <Animated.View style={[styles.sheet, animatedSheetStyle, { height: SHEET_HEIGHT }]}>
          <SafeAreaView style={styles.safeContainer} edges={['bottom']}>
            {/* Drag Handle */}
            <View style={styles.header}>
              <View style={styles.handle} />
            </View>

            {/* Close button */}
            <TouchableOpacity
              style={styles.overlayCloseButton}
              onPress={onClose}
              disabled={isSwapping}
            >
              
            </TouchableOpacity>

            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
              {/* Hero Thumbnail Section */}
              {exerciseData && (
                <View style={styles.videoContainer}>
                  <ExerciseThumbnail
                    exerciseName={exerciseData.name}
                    slug={exerciseData.slug}
                  />
                </View>
              )}

              {/* Content Container */}
              <View style={styles.contentContainer}>
                {/* Title Section */}
                {exerciseData && (
                  <View style={styles.titleSection}>
                    <Animated.View
                      key={hasSwapped ? 'swapped' : 'adjust'}
                      entering={FadeIn.duration(300).easing(Easing.out(Easing.ease))}
                      exiting={FadeOut.duration(200).easing(Easing.in(Easing.ease))}
                      layout={Layout.springify()}
                    >
                      <Text style={styles.categoryText}>{exerciseData.category}</Text>
                    </Animated.View>
                    <Animated.View
                      key={exerciseData.id}
                      entering={FadeIn.duration(300).easing(Easing.out(Easing.ease))}
                      exiting={FadeOut.duration(200).easing(Easing.in(Easing.ease))}
                      layout={Layout.springify()}
                    >
                      <Text style={styles.titleText}>{exerciseData.name}</Text>
                    </Animated.View>
                  </View>
                )}

                {/* Workout Info Display - Exactly like timer container in active_workout.tsx */}
                {workoutEntryNode && (
                  <View style={styles.infoContainer}>
                    {/* Weight - Centered in Left Section with Adjusters */}
                    <View style={styles.infoItemLeft}>
                      {parseWeight(adjustedWeight) ? (
                        <TouchableOpacity 
                          style={styles.adjusterButton}
                          onPressIn={() => startHoldIncrement(() => adjustWeightValue(1), weightHoldIntervalRef, weightHoldTimeoutRef)}
                          onPressOut={() => stopHoldIncrement(weightHoldIntervalRef, weightHoldTimeoutRef)}
                          activeOpacity={0.5}
                        >
                          <Image
                            source={require('../assets/icons/back.svg')}
                            style={[styles.adjusterIcon, { transform: [{ rotate: '90deg' }] }]}
                            contentFit="contain"
                          />
                        </TouchableOpacity>
                      ) : null}
                      <Text style={[styles.infoValue, { color: nucleus.light.global.blue["60"] }]}>
                        {parseWeight(adjustedWeight)?.value || adjustedWeight}
                      </Text>
                      <Text style={[styles.infoLabel, { color: nucleus.light.global.grey["90"] }]}>
                        WEIGHT
                      </Text>
                      {parseWeight(adjustedWeight) ? (
                        <TouchableOpacity 
                          style={styles.adjusterButton}
                          onPressIn={() => startHoldIncrement(() => adjustWeightValue(-1), weightHoldIntervalRef, weightHoldTimeoutRef)}
                          onPressOut={() => stopHoldIncrement(weightHoldIntervalRef, weightHoldTimeoutRef)}
                          activeOpacity={0.5}
                        >
                          <Image
                            source={require('../assets/icons/back.svg')}
                            style={[styles.adjusterIcon, { transform: [{ rotate: '-90deg' }] }]}
                            contentFit="contain"
                          />
                        </TouchableOpacity>
                      ) : null}
                    </View>

                    {/* Separator */}
                    <View style={styles.separator} />

                    {/* Sets - Centered in Middle Section with Adjusters */}
                    <View style={styles.infoItemCenter}>
                      <TouchableOpacity 
                        style={styles.adjusterButton}
                        onPressIn={() => startHoldIncrement(() => adjustSetsValue(1), setsHoldIntervalRef, setsHoldTimeoutRef)}
                        onPressOut={() => stopHoldIncrement(setsHoldIntervalRef, setsHoldTimeoutRef)}
                        activeOpacity={0.5}
                      >
                        <Image
                          source={require('../assets/icons/back.svg')}
                          style={[styles.adjusterIcon, { transform: [{ rotate: '90deg' }] }]}
                          contentFit="contain"
                        />
                      </TouchableOpacity>
                      <Text style={[styles.infoValue, { color: nucleus.light.global.blue["60"] }]}>
                        {adjustedSets}
                      </Text>
                      <Text style={[styles.infoLabel, { color: nucleus.light.global.grey["90"] }]}>
                        SETS
                      </Text>
                      <TouchableOpacity 
                        style={styles.adjusterButton}
                        onPressIn={() => startHoldIncrement(() => adjustSetsValue(-1), setsHoldIntervalRef, setsHoldTimeoutRef)}
                        onPressOut={() => stopHoldIncrement(setsHoldIntervalRef, setsHoldTimeoutRef)}
                        activeOpacity={0.5}
                      >
                        <Image
                          source={require('../assets/icons/back.svg')}
                          style={[styles.adjusterIcon, { transform: [{ rotate: '-90deg' }] }]}
                          contentFit="contain"
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Separator */}
                    <View style={styles.separator} />

                    {/* Reps or Time - Centered in Right Section with Adjusters */}
                    <View style={styles.infoItemRight}>
                      <TouchableOpacity 
                        style={styles.adjusterButton}
                        onPressIn={() => startHoldIncrement(() => adjustRepsValue(1), repsHoldIntervalRef, repsHoldTimeoutRef)}
                        onPressOut={() => stopHoldIncrement(repsHoldIntervalRef, repsHoldTimeoutRef)}
                        activeOpacity={0.5}
                      >
                        <Image
                          source={require('../assets/icons/back.svg')}
                          style={[styles.adjusterIcon, { transform: [{ rotate: '90deg' }] }]}
                          contentFit="contain"
                        />
                      </TouchableOpacity>
                      <Text style={[styles.infoValue, { color: nucleus.light.global.blue["60"] }]}>
                        {workoutEntryNode.time && !workoutEntryNode.reps 
                          ? parseTime(adjustedTime)
                          : (adjustedReps ? parseReps(adjustedReps).min : '-')
                        }
                      </Text>
                      <Text style={[styles.infoLabel, { color: nucleus.light.global.grey["90"] }]}>
                        {workoutEntryNode.time && !workoutEntryNode.reps ? 'TIME' : 'REPS'}
                      </Text>
                      <TouchableOpacity 
                        style={styles.adjusterButton}
                        onPressIn={() => startHoldIncrement(() => adjustRepsValue(-1), repsHoldIntervalRef, repsHoldTimeoutRef)}
                        onPressOut={() => stopHoldIncrement(repsHoldIntervalRef, repsHoldTimeoutRef)}
                        activeOpacity={0.5}
                      >
                        <Image
                          source={require('../assets/icons/back.svg')}
                          style={[styles.adjusterIcon, { transform: [{ rotate: '-90deg' }] }]}
                          contentFit="contain"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              
              

                  {/* Alternatives Section - Using card style from workout.tsx */}
                  {alternatives && alternatives.length > 0 && (
                    <View style={styles.alternativesSection}>
                      <Text style={styles.equipmentTitle}>Similar Alternatives</Text>
                      <View style={styles.alternativesList}>
                        {alternatives.map((alternative) => (
                          <AlternativeExerciseCard
                            key={alternative.node.id}
                            alternative={alternative}
                            onSelect={handleSelectAlternative}
                            isSwapping={isSwapping}
                          />
                        ))}
                      </View>
                    </View>
                  )}
              </View>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
});

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
    backgroundColor: '#000000',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: nucleus.light.semantic.bg.canvas,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  safeContainer: {
    flex: 1,
  },
  header: {
    height: 24,
    paddingTop: 8,
    paddingBottom: 11,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  handle: {
    width: 48,
    height: 5,
    flexShrink: 0,
    backgroundColor: nucleus.light.semantic.bg.muted,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 8,
  },
  videoContainer: {
    position: 'relative',
    height: 200,
    width: '100%',
    backgroundColor: nucleus.light.semantic.bg.muted,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
    alignSelf: 'stretch',
  },
  overlayCloseButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  overlayCloseIcon: {
    width: 32,
    height: 32,
    tintColor: nucleus.light.semantic.fg.base,
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    height: 200,
    width: '100%',
    backgroundColor: nucleus.light.semantic.bg.muted,
    overflow: 'hidden',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignSelf: 'stretch',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    alignSelf: 'stretch',
  },

  
  contentContainer: {
    padding: 24,
    paddingTop: 16,
    gap: 12,
  },
  titleSection: {
    alignItems: 'center',
    gap: 0,
  },
  categoryText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    lineHeight: 18,
    color: nucleus.light.semantic.fg.base,
    textAlign: 'center',
    includeFontPadding: false,
  },
  titleText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 32,
    lineHeight: 38.4, // 1.2 * 32
    letterSpacing: -1,
    color: nucleus.light.semantic.fg.base,
    textAlign: 'center',
    includeFontPadding: false,
  },
  instructionsSection: {
    gap: 8,
  },
  instructionText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24, // 1.5 * 16
    color: nucleus.light.semantic.fg.muted,
    includeFontPadding: false,
  },
  tipsContainer: {
    marginTop: 16,
    gap: 4,
  },
  tipText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: nucleus.light.semantic.fg.muted,
    includeFontPadding: false,
  },
  equipmentSection: {
    gap: 16,
  },
  equipmentTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24,
    lineHeight: 28.8, // 1.2 * 24
    letterSpacing: -1,
    color: nucleus.light.semantic.fg.base,
    includeFontPadding: false,
  },
  equipmentSubtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    lineHeight: 18,
    color: nucleus.light.semantic.fg.base,
    fontWeight: '600',
    includeFontPadding: false,
  },
  // New unified equipment UI styles (bigger than workout screen)
  equipmentContainer: {
    gap: 12,
  },
  equipmentGroupWrapper: {
    gap: 12,
  },
  equipmentAlternativesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  equipmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: nucleus.light.semantic.bg.subtle,
    borderRadius: 24,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 16,
    gap: 12,
  },
  equipmentChipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: nucleus.light.global.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  equipmentChipImage: {
    width: 30,
    height: 30,
  },
  equipmentChipText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    color: nucleus.light.global.grey[80],
    letterSpacing: 0,
  },
  equipmentOrText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    fontWeight: '400',
    color: nucleus.light.global.grey[60],
    paddingHorizontal: 4,
  },
  equipmentAndSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  equipmentAndLine: {
    flex: 1,
    height: 1,
    backgroundColor: nucleus.light.global.grey[30],
  },
  equipmentAndText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    fontWeight: '400',
    color: nucleus.light.global.grey[60],
    paddingHorizontal: 6,
  },
  // Workout Info Display Styles - Exactly from active_workout.tsx
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 0,
  },
  infoItemLeft: {
    display: 'flex',
    width: 72,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  infoItemCenter: {
    display: 'flex',
    width: 72,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  infoItemRight: {
    display: 'flex',
    width: 72,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  adjusterButton: {
    paddingVertical:0,
    paddingHorizontal: 20,
  },
  adjusterIcon: {
    width: 28,
    height: 28,
    tintColor: nucleus.light.global.grey["50"],
  },
  infoValue: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    lineHeight: 21.6, // 1.2 * 18
    includeFontPadding: false,
  },
  infoLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    lineHeight: 14,
    includeFontPadding: false,
  },
  separator: {
    width: 1,
    height: 32,
    backgroundColor: '#D9D9D9',
  },
  // Alternatives card styles - copied from workout.tsx
  alternativesSection: {
    gap: 16,
  },
  alternativesList: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
    alignSelf: 'stretch',
  },
  alternativeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  alternativeRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  alternativeImageContainer: {
    width: 96,
    height: 96,
    borderRadius: 12,
    flexShrink: 0,
  },
  alternativeImage: {
    position: 'absolute',
    height: '100%',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  alternativeInfo: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-start',
    flexDirection: 'row',
    position: 'relative',
  },
  alternativeTextContainer: {
    gap: 6,
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    paddingTop: 4,
  },
  alternativeName: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    color: nucleus.light.global.grey[80],
    includeFontPadding: false,
    textAlign: 'left',
  },
  alternativeNote: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: nucleus.light.global.grey[70],
    includeFontPadding: false,
    textAlign: 'left',
    flexWrap: 'wrap',
    flexShrink: 0,
  },
});

export default ExerciseInfoModal;
