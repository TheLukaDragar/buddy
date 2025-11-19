import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import * as React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import { default as Animated, FadeIn, default as ReanimatedAnimated } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { useBuddyTheme } from "@/constants/BuddyTheme";
import { nucleus } from "../Buddy_variables.js";
import ExerciseCard from "../components/ExerciseCard";
import {
    useGetWorkoutSessionAdjustmentsQuery,
    useGetWorkoutSessionQuery,
    useGetWorkoutSessionSetsQuery
} from "../graphql/generated";

// Compact Progress Bar Component (smaller version of workout progress)
interface CompactProgressBarProps {
  completed: number;
  total: number;
  label: string;
}

const CompactProgressBar: React.FC<CompactProgressBarProps> = ({ completed, total, label }) => {
  const segments = Array.from({ length: total }, (_, i) => ({
    index: i,
    isCompleted: i < completed,
  }));

  const segmentWidth = 100 / total;

  return (
    <View style={styles.compactProgressContainer}>
      <View style={styles.compactProgressHeader}>
        <Text style={styles.compactProgressLabel}>{label}</Text>
        <Text style={styles.compactProgressCount}>{completed}/{total}</Text>
      </View>
      <View style={styles.compactProgressBarContainer}>
        {segments.map((segment, index) => {
          return (
            <View 
              key={index}
              style={[
                styles.compactProgressSegment,
                { 
                  width: `${segmentWidth}%`,
                  backgroundColor: nucleus.light.global.white, // Base color (same as active workout)
                }
              ]}
            >
              {/* Fill for completed segments (same pattern as active workout) */}
              {segment.isCompleted && (
                <View 
                  style={[
                    styles.compactProgressSegmentFill,
                    { 
                      backgroundColor: nucleus.light.global.brand["70"], // Same green/yellow as active workout
                    }
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

// Adjustment Display Component
interface AdjustmentDisplayProps {
  adjustments: Array<{
    type: 'weight' | 'reps' | 'rest';
    from: number;
    to: number;
    reason: string;
    exerciseId?: string;
    exerciseName?: string;
    affectedSetNumbers?: number[];
  }>;
  exercises?: Array<{
    id: string;
    exercise_id: string;
    sets: number;
    reps?: string | null;
    weight?: string | null;
  }>;
}

const AdjustmentDisplay: React.FC<AdjustmentDisplayProps> = ({ adjustments, exercises = [] }) => {
  if (adjustments.length === 0) return null;

  // Create exercise lookup map
  const exerciseMap = new Map(exercises.map(e => [e.exercise_id, e]));

  // Group adjustments by exercise_id
  const adjustmentsByExercise = new Map<string, typeof adjustments>();
  
  adjustments.forEach(adj => {
    if (adj.exerciseId) {
      if (!adjustmentsByExercise.has(adj.exerciseId)) {
        adjustmentsByExercise.set(adj.exerciseId, []);
      }
      adjustmentsByExercise.get(adj.exerciseId)!.push(adj);
    }
  });

  // If no exercise grouping, fall back to type grouping
  if (adjustmentsByExercise.size === 0) {
    const weightChanges = adjustments.filter(a => a.type === 'weight');
    const repsChanges = adjustments.filter(a => a.type === 'reps');
    const restChanges = adjustments.filter(a => a.type === 'rest');

    const getNetChange = (changes: typeof adjustments) => {
      if (changes.length === 0) return null;
      const first = changes[0].from;
      const last = changes[changes.length - 1].to;
      return { from: first, to: last, delta: last - first };
    };

    const weightChange = getNetChange(weightChanges);
    const repsChange = getNetChange(repsChanges);
    const restChange = getNetChange(restChanges);

    return (
      <ReanimatedAnimated.View 
        entering={FadeIn.duration(600).delay(400)}
        style={styles.adjustmentsCard}
      >
        <Text style={styles.adjustmentsTitle}>Progress Made</Text>
        <View style={styles.adjustmentsList}>
          {weightChange && (
            <View style={styles.adjustmentItem}>
              <Text style={styles.adjustmentText}>
                Weight: {weightChange.from}kg → {weightChange.to}kg
                {weightChange.delta !== 0 && (
                  <Text style={styles.adjustmentDelta}>
                    {' '}({weightChange.delta > 0 ? '+' : ''}{weightChange.delta}kg)
                  </Text>
                )}
              </Text>
            </View>
          )}
          {repsChange && (
            <View style={styles.adjustmentItem}>
              <Text style={styles.adjustmentText}>
                Reps: {repsChange.from} → {repsChange.to}
                {repsChange.delta !== 0 && (
                  <Text style={styles.adjustmentDelta}>
                    {' '}({repsChange.delta > 0 ? '+' : ''}{repsChange.delta})
                  </Text>
                )}
              </Text>
            </View>
          )}
          {restChange && (
            <View style={styles.adjustmentItem}>
              <Text style={styles.adjustmentText}>
                Rest: {restChange.from}s → {restChange.to}s
                {restChange.delta !== 0 && (
                  <Text style={styles.adjustmentDelta}>
                    {' '}({restChange.delta > 0 ? '+' : ''}{restChange.delta}s)
                  </Text>
                )}
              </Text>
            </View>
          )}
        </View>
      </ReanimatedAnimated.View>
    );
  }

  // Group by exercise and show per-exercise adjustments
  return (
    <ReanimatedAnimated.View 
      entering={FadeIn.duration(600).delay(400)}
      style={styles.adjustmentsCard}
    >
      <Text style={styles.adjustmentsTitle}>Progress Made</Text>
      <View style={styles.adjustmentsList}>
        {Array.from(adjustmentsByExercise.entries()).map(([exerciseId, exerciseAdjustments]) => {
          const exercise = exerciseMap.get(exerciseId);
          const exerciseName = exerciseAdjustments[0]?.exerciseName || exercise?.exercise_id || 'Exercise';
          
          // Group by type within this exercise, but show individual adjustments
          const weightChanges = exerciseAdjustments.filter(a => a.type === 'weight');
          const repsChanges = exerciseAdjustments.filter(a => a.type === 'reps');
          const restChanges = exerciseAdjustments.filter(a => a.type === 'rest');

          // Show individual adjustments instead of net changes
          const renderAdjustments = (changes: typeof exerciseAdjustments, typeLabel: string, unit: string) => {
            if (changes.length === 0) return null;
            
            return changes.map((adj, idx) => {
              const delta = adj.to - adj.from;
              const setsText = adj.affectedSetNumbers && adj.affectedSetNumbers.length > 0
                ? ` (Sets ${adj.affectedSetNumbers.sort((a, b) => a - b).join(', ')})`
                : '';
              
              return (
                <View key={`${typeLabel}-${idx}`} style={styles.adjustmentItem}>
                  <Text style={styles.adjustmentText}>
                    {typeLabel}: {adj.from}{unit} → {adj.to}{unit}
                    {delta !== 0 && (
                      <Text style={styles.adjustmentDelta}>
                        {' '}({delta > 0 ? '+' : ''}{delta}{unit})
                      </Text>
                    )}
                    {setsText && (
                      <Text style={styles.adjustmentSets}>
                        {setsText}
                      </Text>
                    )}
                  </Text>
                </View>
              );
            });
          };

          return (
            <View key={exerciseId} style={styles.adjustmentExerciseGroup}>
              <Text style={styles.adjustmentExerciseName}>{exerciseName}</Text>
              {renderAdjustments(weightChanges, 'Weight', 'kg')}
              {renderAdjustments(repsChanges, 'Reps', '')}
              {renderAdjustments(restChanges, 'Rest', 's')}
            </View>
          );
        })}
      </View>
    </ReanimatedAnimated.View>
  );
};

// Helper function to get equipment icon (same as workout.tsx)
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

// Exercise List Component
interface ExerciseListProps {
  exercises: Array<{ 
    id: string;
    exercise_id: string;
    sets: number;
    reps?: string | null;
    weight?: string | null;
    time?: string | null;
    notes?: string | null;
  }>;
}

const ExerciseList: React.FC<ExerciseListProps> = ({ exercises }) => {
  const handleExercisePress = (exercise: any) => {
    // Could navigate to exercise details if needed
    console.log('Exercise pressed:', exercise);
  };

  return (
    <ReanimatedAnimated.View 
      entering={FadeIn.duration(600).delay(600)}
      style={styles.exerciseListContainer}
    >
      <Text style={styles.exerciseListTitle}>Completed Exercises</Text>
      <View style={styles.exerciseList}>
        {exercises.map((exercise) => (
          <Animated.View
            key={exercise.id}
            style={styles.exerciseCardWrapper}
            entering={FadeIn.duration(300)}
          >
            <ExerciseCard
              workoutEntry={{
                id: exercise.id,
                exercise_id: exercise.exercise_id,
                sets: exercise.sets,
                reps: exercise.reps || null,
                weight: exercise.weight || null,
                time: exercise.time || null,
                notes: exercise.notes || null,
              }}
              onPress={handleExercisePress}
              getEquipmentIcon={getEquipmentIcon}
              isAdjustMode={false}
            />
          </Animated.View>
        ))}
      </View>
    </ReanimatedAnimated.View>
  );
};

export default function WorkoutCompletedScreen() {
  const theme = useBuddyTheme();
  const params = useLocalSearchParams<{ sessionId?: string | string[] }>();
  // Handle case where useLocalSearchParams might return array or single value
  const sessionId = params?.sessionId 
    ? (Array.isArray(params.sessionId) ? params.sessionId[0] : params.sessionId)
    : undefined;

  // Log sessionId from params
  React.useEffect(() => {
    console.log('📋 [WORKOUT-COMPLETED] Route params:', params);
    console.log('📋 [WORKOUT-COMPLETED] Extracted sessionId:', sessionId);
  }, [params, sessionId]);

  // Query workout session data
  const { data: sessionData, isLoading: isLoadingSession, error: sessionError, refetch: refetchSession } = useGetWorkoutSessionQuery(
    { id: sessionId || '' },
    { 
      skip: !sessionId,
      refetchOnMountOrArgChange: true, // Refetch when navigating to this screen to get latest data
    }
  );

  // Refetch session data after a short delay to ensure we get the latest data after mutation completes
  React.useEffect(() => {
    if (sessionId) {
      // Small delay to allow mutation to complete before refetching
      const timer = setTimeout(() => {
        refetchSession();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [sessionId, refetchSession]);

  // Query workout session sets
  const { data: setsData, isLoading: isLoadingSets } = useGetWorkoutSessionSetsQuery(
    { sessionId: sessionId || '' },
    { skip: !sessionId }
  );

  // Query workout adjustments
  const { data: adjustmentsData, isLoading: isLoadingAdjustments } = useGetWorkoutSessionAdjustmentsQuery(
    { sessionId: sessionId || '' },
    { skip: !sessionId }
  );

  // Extract session data
  const session = sessionData?.workout_sessionsCollection?.edges?.[0]?.node;
  const isLoading = isLoadingSession || isLoadingSets || isLoadingAdjustments;

  // Log session data
  React.useEffect(() => {
    if (sessionData) {
      console.log('📊 [WORKOUT-COMPLETED] Session data received:', {
        hasData: !!sessionData,
        edgesCount: sessionData?.workout_sessionsCollection?.edges?.length || 0,
        session: session ? {
          id: session.id,
          day_name: session.day_name,
          status: session.status,
          total_time_ms: session.total_time_ms,
          completed_exercises: session.completed_exercises,
          total_exercises: session.total_exercises,
          completed_sets: session.completed_sets,
          total_sets: session.total_sets,
          is_fully_completed: session.is_fully_completed,
          finished_early: session.finished_early,
          completed_at: session.completed_at,
        } : null,
      });
    }
    if (sessionError) {
      console.error('❌ [WORKOUT-COMPLETED] Session query error:', sessionError);
    }
  }, [sessionData, sessionError, session]);

  // Log sets data
  React.useEffect(() => {
    if (setsData) {
      const sets = setsData?.workout_session_setsCollection?.edges?.map(e => e.node) || [];
      console.log('🎯 [WORKOUT-COMPLETED] Sets data received:', {
        hasData: !!setsData,
        setsCount: sets.length,
        sets: sets.map(s => ({
          id: s.id,
          workout_entry_id: s.workout_entry_id,
          exercise_id: s.exercise_id,
          set_number: s.set_number,
          is_completed: s.is_completed,
          actual_reps: s.actual_reps,
          actual_weight: s.actual_weight,
          actual_time: s.actual_time,
        })),
      });
    }
  }, [setsData]);

  // Log adjustments data
  React.useEffect(() => {
    if (adjustmentsData) {
      const adjustments = adjustmentsData?.workout_session_adjustmentsCollection?.edges?.map(e => e.node) || [];
      console.log('🔧 [WORKOUT-COMPLETED] Adjustments data received:', {
        hasData: !!adjustmentsData,
        adjustmentsCount: adjustments.length,
        adjustments: adjustments.map(a => ({
          id: a.id,
          type: a.type,
          from_value: a.from_value,
          to_value: a.to_value,
          reason: a.reason,
          affected_set_numbers: a.affected_set_numbers,
        })),
      });
    }
  }, [adjustmentsData]);

  // Format time helper
  const formatTime = (ms: number | null | undefined) => {
    if (!ms) return '0 min';
    
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    
    if (minutes > 0) {
      return `${minutes} min`;
    }
    
    return `${seconds}s`;
  };

  // Reconstruct exercises from sets
  const completedExercises = React.useMemo(() => {
    if (!setsData?.workout_session_setsCollection?.edges) {
      console.log('⚠️ [WORKOUT-COMPLETED] No sets data available for exercise reconstruction');
      return [];
    }
    
    const sets = setsData.workout_session_setsCollection.edges.map(e => e.node);
    console.log('🔄 [WORKOUT-COMPLETED] Reconstructing exercises from', sets.length, 'sets');
    
    // Group sets by workout_entry_id to reconstruct exercises
    const exercisesByEntry = sets.reduce((acc, set) => {
      const entryId = set.workout_entry_id;
      if (!entryId) return acc;
      
      if (!acc[entryId]) {
        acc[entryId] = {
          id: entryId,
          exercise_id: set.exercise_id,
          sets: [],
        };
      }
      acc[entryId].sets.push(set);
      return acc;
    }, {} as Record<string, { id: string; exercise_id: string; sets: any[] }>);

    console.log('📦 [WORKOUT-COMPLETED] Grouped into', Object.keys(exercisesByEntry).length, 'exercise entries');

    // Convert to array format for ExerciseCard
    const exercises = Object.values(exercisesByEntry).map((entry) => {
      // Get the first completed set's values as defaults
      const firstSet = entry.sets.find(s => s.is_completed) || entry.sets[0];
      
      const exercise = {
        id: entry.id,
        exercise_id: entry.exercise_id,
        sets: entry.sets.filter(s => s.is_completed).length || entry.sets.length,
        reps: firstSet?.actual_reps?.toString() || firstSet?.target_reps?.toString() || null,
        weight: firstSet?.actual_weight?.toString() || firstSet?.target_weight?.toString() || null,
        time: firstSet?.actual_time?.toString() || firstSet?.target_time?.toString() || null,
        notes: firstSet?.user_notes || null,
      };
      
      return exercise;
    });

    console.log('✅ [WORKOUT-COMPLETED] Reconstructed exercises:', exercises.map(e => ({
      id: e.id,
      exercise_id: e.exercise_id,
      sets: e.sets,
      reps: e.reps,
      weight: e.weight,
    })));

    return exercises;
  }, [setsData]);

  // Transform adjustments data
  const formattedAdjustments = React.useMemo(() => {
    if (!adjustmentsData?.workout_session_adjustmentsCollection?.edges) {
      console.log('⚠️ [WORKOUT-COMPLETED] No adjustments data available');
      return [];
    }
    
    const rawAdjustments = adjustmentsData.workout_session_adjustmentsCollection.edges.map(e => e.node);
    console.log('🔄 [WORKOUT-COMPLETED] Processing', rawAdjustments.length, 'raw adjustments');
    
    const filtered = rawAdjustments.filter(adj => ['weight', 'reps', 'rest'].includes(adj.type));
    console.log('📊 [WORKOUT-COMPLETED] Filtered to', filtered.length, 'relevant adjustments (weight/reps/rest)');
    
    const formatted = filtered.map(adj => ({
      type: adj.type as 'weight' | 'reps' | 'rest',
      from: parseFloat(adj.from_value) || 0,
      to: parseFloat(adj.to_value) || 0,
      reason: adj.reason,
      exerciseId: adj.exercise_id || undefined,
      exerciseName: adj.exercises?.name || undefined,
      affectedSetNumbers: adj.affected_set_numbers 
        ? adj.affected_set_numbers.filter((n): n is number => n !== null)
        : undefined,
    }));

    console.log('✅ [WORKOUT-COMPLETED] Formatted adjustments:', formatted);

    return formatted;
  }, [adjustmentsData]);

  // Calculate total weight lifted
  const totalWeightLifted = React.useMemo(() => {
    if (!setsData?.workout_session_setsCollection?.edges) {
      return 0;
    }
    
    const sets = setsData.workout_session_setsCollection.edges.map(e => e.node);
    
    // Calculate: for each completed set, multiply reps × weight (if weight exists and > 0)
    const total = sets.reduce((sum, set) => {
      if (!set.is_completed) return sum;
      
      const reps = set.actual_reps || 0;
      const weight = set.actual_weight ? parseFloat(set.actual_weight.toString()) : 0;
      
      // Only count if weight exists and is greater than 0 (exclude bodyweight)
      if (weight > 0 && reps > 0) {
        return sum + (reps * weight);
      }
      
      return sum;
    }, 0);
    
    return total;
  }, [setsData]);

  // Prepare display data
  const displayData = React.useMemo(() => {
    const data = {
      workoutName: session?.day_name || 'Workout',
      totalTime: session?.total_time_ms || 0,
      completedExercises: session?.completed_exercises || 0,
      totalExercises: session?.total_exercises || 0,
      completedSets: session?.completed_sets || 0,
      totalSets: session?.total_sets || 0,
      finishedEarly: session?.finished_early || false,
      totalWeightLifted,
      exercises: completedExercises,
      adjustments: formattedAdjustments,
      aiSummary: null, // Will be populated by AI
    };

    console.log('🎨 [WORKOUT-COMPLETED] Final display data:', {
      workoutName: data.workoutName,
      totalTime: data.totalTime,
      completedExercises: data.completedExercises,
      totalExercises: data.totalExercises,
      completedSets: data.completedSets,
      totalSets: data.totalSets,
      totalWeightLifted: data.totalWeightLifted,
      exercisesCount: data.exercises.length,
      adjustmentsCount: data.adjustments.length,
    });

    return data;
  }, [session, completedExercises, formattedAdjustments, totalWeightLifted]);

  // Handle loading state
  if (isLoading) {
    return (
      <SafeAreaView 
        style={[styles.container, { backgroundColor: nucleus.light.semantic.bg.canvas }]}
        edges={['top', 'bottom']}
      >
        <SystemBars style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={nucleus.light.global.blue["70"]} />
          <Text style={styles.loadingText}>Loading workout summary...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Handle error state
  if (!sessionId || sessionError || !session) {
    return (
      <SafeAreaView 
        style={[styles.container, { backgroundColor: nucleus.light.semantic.bg.canvas }]}
        edges={['top', 'bottom']}
      >
        <SystemBars style="dark" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Workout session not found</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.errorButton}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: nucleus.light.semantic.bg.canvas }]}
      edges={['top', 'bottom']}
    >
      <SystemBars style="dark" />
      
      {/* Back Button */}
      <ReanimatedAnimated.View 
        entering={FadeIn.duration(400).delay(100)}
        style={styles.backButtonContainer}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Image
            source={require('../assets/icons/back.svg')}
            style={styles.backIcon}
            contentFit="contain"
          />
        </TouchableOpacity>
      </ReanimatedAnimated.View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <ReanimatedAnimated.Text 
          entering={FadeIn.duration(800).delay(200)}
          style={styles.title}
        >
          {displayData.workoutName}
        </ReanimatedAnimated.Text>

        {/* Encouraging Message */}
        <ReanimatedAnimated.Text 
          entering={FadeIn.duration(600).delay(300)}
          style={styles.encouragingMessage}
        >
          {displayData.finishedEarly 
            ? "You finished early! Every bit of effort counts."
            : "Great work! You completed your workout."}
        </ReanimatedAnimated.Text>

        {/* Stats Card */}
        <ReanimatedAnimated.View 
          entering={FadeIn.duration(600).delay(400)}
          style={styles.statsCard}
        >
          {/* Time */}
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Time</Text>
            <Text style={styles.statValue}>{formatTime(displayData.totalTime)}</Text>
          </View>

          {/* Total Weight Lifted */}
          {displayData.totalWeightLifted > 0 && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Weight Lifted</Text>
              <Text style={styles.statValue}>
                {displayData.totalWeightLifted >= 1000 
                  ? `${(displayData.totalWeightLifted / 1000).toFixed(1)}t`
                  : `${Math.round(displayData.totalWeightLifted)}kg`}
              </Text>
            </View>
          )}

          {/* Exercises Progress */}
          <CompactProgressBar
            completed={displayData.completedExercises}
            total={displayData.totalExercises}
            label="Exercises"
          />

          {/* Sets Progress */}
          <CompactProgressBar
            completed={displayData.completedSets}
            total={displayData.totalSets}
            label="Sets"
          />
        </ReanimatedAnimated.View>

        {/* Adjustments Display */}
        <AdjustmentDisplay 
          adjustments={displayData.adjustments} 
          exercises={displayData.exercises}
        />

        {/* AI Generated Summary - TODO: Implement later */}
        {/* <ReanimatedAnimated.View 
          entering={FadeIn.duration(600).delay(500)}
          style={styles.summaryCard}
        >
          <Text style={styles.summaryTitle}>Workout Summary</Text>
          <Text style={styles.summaryText}>
            {displayData.aiSummary || 'Summary will be generated...'}
          </Text>
        </ReanimatedAnimated.View> */}

        {/* Exercise List */}
        <ExerciseList exercises={displayData.exercises} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButtonContainer: {
    position: 'absolute',
    left: 8,
    top: 8,
    zIndex: 100,
  },
  backButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
  },
  backIcon: {
    width: 32,
    height: 32,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 32,
    lineHeight: 38.4,
    color: nucleus.light.global.grey["90"],
    textAlign: 'center',
    marginBottom: 8,
    includeFontPadding: false,
  },
  encouragingMessage: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: nucleus.light.global.grey["70"],
    textAlign: 'center',
    marginBottom: 32,
    includeFontPadding: false,
  },
  statsCard: {
    width: '100%',
    backgroundColor: nucleus.light.semantic.bg.subtle,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    gap: 20,
  },
  statItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  statLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    lineHeight: 20,
    color: nucleus.light.global.grey["70"],
    includeFontPadding: false,
  },
  statValue: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24,
    lineHeight: 28.8,
    color: nucleus.light.global.grey["90"],
    includeFontPadding: false,
  },
  compactProgressContainer: {
    width: '100%',
    gap: 8,
  },
  compactProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  compactProgressLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    lineHeight: 20,
    color: nucleus.light.global.grey["70"],
    includeFontPadding: false,
  },
  compactProgressCount: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    lineHeight: 20,
    color: nucleus.light.global.grey["80"],
    includeFontPadding: false,
  },
  compactProgressBarContainer: {
    height: 20,
    borderRadius: 6,
    overflow: 'hidden',
    flexDirection: 'row',
    gap: 2,
  },
  compactProgressSegment: {
    height: '100%',
    position: 'relative',
    borderRadius: 4,
  },
  compactProgressSegmentFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    borderRadius: 4,
  },
  adjustmentsCard: {
    width: '100%',
    backgroundColor: nucleus.light.semantic.bg.subtle,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: nucleus.light.semantic.bg.subtle,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    lineHeight: 24,
    color: nucleus.light.global.grey["90"],
    marginBottom: 12,
    includeFontPadding: false,
  },
  summaryText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: nucleus.light.global.grey["80"],
    includeFontPadding: false,
  },
  adjustmentsTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    lineHeight: 24,
    color: nucleus.light.global.grey["90"],
    marginBottom: 12,
    includeFontPadding: false,
  },
  adjustmentsList: {
    gap: 10,
  },
  adjustmentExerciseGroup: {
    marginBottom: 16,
  },
  adjustmentExerciseName: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    lineHeight: 22,
    color: nucleus.light.global.grey["90"],
    marginBottom: 8,
    includeFontPadding: false,
  },
  adjustmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  adjustmentText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: nucleus.light.global.grey["80"],
    flex: 1,
    includeFontPadding: false,
  },
  adjustmentSets: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    lineHeight: 16,
    color: nucleus.light.global.grey["60"],
    includeFontPadding: false,
  },
  adjustmentDelta: {
    fontFamily: 'PlusJakartaSans-Medium',
    color: nucleus.light.global.blue["70"],
  },
  exerciseListContainer: {
    width: '100%',
    marginBottom: 32,
  },
  exerciseListTitle: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    lineHeight: 22,
    color: nucleus.light.global.grey["70"],
    marginBottom: 16,
    includeFontPadding: false,
  },
  exerciseList: {
    gap: 16,
  },
  exerciseCardWrapper: {
    alignSelf: 'stretch',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    lineHeight: 22,
    color: nucleus.light.global.grey["70"],
    includeFontPadding: false,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    paddingHorizontal: 32,
  },
  errorText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 18,
    lineHeight: 24,
    color: nucleus.light.global.grey["80"],
    textAlign: 'center',
    includeFontPadding: false,
  },
  errorButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 48,
    backgroundColor: nucleus.light.global.blue["70"],
  },
  errorButtonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    lineHeight: 20,
    color: nucleus.light.global.blue["10"],
    includeFontPadding: false,
  },
});

