import { Image } from "expo-image";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import * as React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import { default as Animated, FadeIn, default as ReanimatedAnimated } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useBuddyTheme } from "@/constants/BuddyTheme";
import { nucleus } from "../Buddy_variables.js";
import ExerciseCard from "../components/ExerciseCard";
import { useAuth } from "../contexts/AuthContext";
import {
  useGetWorkoutSessionAdjustmentsQuery,
  useGetWorkoutSessionQuery,
  useGetWorkoutSessionSetsQuery
} from "../graphql/generated";
import { supabase } from "../lib/supabase";

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
    isApplied?: boolean;
  }>;
  exercises?: Array<{
    id: string;
    exercise_id: string;
    sets: number;
    reps?: string | null;
    weight?: string | null;
  }>;
  onSavePreference?: (exerciseId: string, adjustmentType: string, fromValue: string, toValue: string) => Promise<boolean>;
  isWorkoutInPast?: boolean;
}

const AdjustmentDisplay: React.FC<AdjustmentDisplayProps> = ({ adjustments, exercises = [], onSavePreference, isWorkoutInPast = false }) => {
  // Initialize appliedAdjustments from database (adjustments marked as is_applied)
  const [appliedAdjustments, setAppliedAdjustments] = React.useState<Set<string>>(() => {
    const initialApplied = new Set<string>();
    adjustments.forEach(adj => {
      if (adj.isApplied && adj.exerciseId) {
        const adjustmentKey = `${adj.exerciseId}-${adj.type}`;
        initialApplied.add(adjustmentKey);
      }
    });
    return initialApplied;
  });

  // Sync applied state when parent refetches (e.g. after reopening the page) so we show already-saved progressions
  React.useEffect(() => {
    const fromProps = new Set<string>();
    adjustments.forEach(adj => {
      if (adj.isApplied && adj.exerciseId) {
        fromProps.add(`${adj.exerciseId}-${adj.type}`);
      }
    });
    setAppliedAdjustments(prev => {
      const next = new Set(prev);
      fromProps.forEach(k => next.add(k));
      return next;
    });
  }, [adjustments]);

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

  // Helper function to calculate net change from multiple adjustments
  const getNetChange = (changes: typeof adjustments) => {
    if (changes.length === 0) return null;
    // Sort by from value to get chronological order (first adjustment to last)
    const sorted = [...changes].sort((a, b) => a.from - b.from);
    const first = sorted[0].from;
    const last = sorted[sorted.length - 1].to;
    return { from: first, to: last, delta: last - first };
  };

  // If no exercise grouping, fall back to type grouping
  if (adjustmentsByExercise.size === 0) {
    const weightChanges = adjustments.filter(a => a.type === 'weight');
    const repsChanges = adjustments.filter(a => a.type === 'reps');
    const restChanges = adjustments.filter(a => a.type === 'rest');

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

  // Group by exercise and show condensed net changes per exercise
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
          
          // Group by type within this exercise
          const weightChanges = exerciseAdjustments.filter(a => a.type === 'weight');
          const repsChanges = exerciseAdjustments.filter(a => a.type === 'reps');
          const restChanges = exerciseAdjustments.filter(a => a.type === 'rest');

          // Calculate net changes for each type
          const weightChange = getNetChange(weightChanges);
          const repsChange = getNetChange(repsChanges);
          const restChange = getNetChange(restChanges);

          // Render a single condensed line per adjustment type
          const renderNetChange = (
            change: ReturnType<typeof getNetChange>,
            typeLabel: string,
            unit: string,
            adjustmentType: string
          ) => {
            if (!change) return null;
            
            const adjustmentKey = `${exerciseId}-${adjustmentType}`;
            const isApplied = appliedAdjustments.has(adjustmentKey);
            
            const handleApply = async () => {
              if (onSavePreference) {
                const success = await onSavePreference(exerciseId, adjustmentType, change.from.toString(), change.to.toString());
                if (success) {
                  setAppliedAdjustments(prev => new Set(prev).add(adjustmentKey));
                }
              }
            };
            
            const handleUndo = async () => {
              if (onSavePreference) {
                // Revert by applying the original value
                const success = await onSavePreference(exerciseId, adjustmentType, change.to.toString(), change.from.toString());
                if (success) {
                  setAppliedAdjustments(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(adjustmentKey);
                    return newSet;
                  });
                }
              }
            };
            
            return (
              <View key={adjustmentKey} style={styles.adjustmentItem}>
                <View style={styles.adjustmentTextContainer}>
                  <Text style={styles.adjustmentText}>
                    {typeLabel}: {change.from}{unit} → {change.to}{unit}
                    {change.delta !== 0 && (
                      <Text style={styles.adjustmentDelta}>
                        {' '}({change.delta > 0 ? '+' : ''}{change.delta}{unit})
                      </Text>
                    )}
                  </Text>
                  {isApplied && (
                    <Text style={styles.appliedIndicator}>Saved</Text>
                  )}
                </View>
                {/* Apply/Undo button - hide if workout is in the past */}
                {onSavePreference && !isWorkoutInPast && (
                  <TouchableOpacity
                    style={[styles.applyButton, isApplied && styles.undoButton]}
                    onPress={isApplied ? handleUndo : handleApply}
                  >
                    <Text style={[styles.applyButtonText, isApplied && styles.undoButtonText]}>
                      {isApplied ? 'Undo' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          };

          return (
            <View key={exerciseId} style={styles.adjustmentExerciseGroup}>
              <Text style={styles.adjustmentExerciseName}>{exerciseName}</Text>
              {renderNetChange(weightChange, 'Weight', 'kg', 'weight')}
              {renderNetChange(repsChange, 'Reps', '', 'reps')}
              {renderNetChange(restChange, 'Rest', 's', 'rest')}
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
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
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

  // Query workout adjustments (refetch on mount/focus so reopened page shows already-saved state)
  const { data: adjustmentsData, isLoading: isLoadingAdjustments, refetch: refetchAdjustments } = useGetWorkoutSessionAdjustmentsQuery(
    { sessionId: sessionId || '' },
    { skip: !sessionId, refetchOnMountOrArgChange: true }
  );

  // Refetch adjustments when user returns to this screen so "already saved" progressions show correctly
  useFocusEffect(
    React.useCallback(() => {
      if (sessionId) {
        refetchAdjustments();
      }
    }, [sessionId, refetchAdjustments])
  );

  // Handler to save/apply adjustment to future workouts using Supabase client directly
  // Returns true on success, false on failure
  const handleSaveAdjustmentPreference = React.useCallback(async (
    exerciseId: string,
    adjustmentType: string,
    fromValue: string,
    toValue: string
  ): Promise<boolean> => {
    if (!user?.id) {
      console.error('User must be logged in to apply adjustments');
      return false;
    }

    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Prepare adjustment values based on type
    const adjustmentReason = `Applied from workout completion: ${adjustmentType} adjusted from ${fromValue} to ${toValue}`;
    const updateData: {
      reps?: string;
      weight?: string;
      time?: string;
      is_adjusted: boolean;
      adjustment_reason: string;
    } = {
      is_adjusted: true,
      adjustment_reason: adjustmentReason,
    };

    if (adjustmentType === 'reps') {
      updateData.reps = toValue;
    } else if (adjustmentType === 'weight') {
      updateData.weight = `${toValue}kg`;
    } else if (adjustmentType === 'rest') {
      updateData.time = `${toValue}s`;
    }

    try {
      // First, mark the adjustment as applied in workout_session_adjustments
      const { error: adjustmentUpdateError } = await supabase
        .from('workout_session_adjustments')
        .update({ is_applied: true })
        .eq('session_id', sessionId || '')
        .eq('exercise_id', exerciseId)
        .eq('type', adjustmentType);

      if (adjustmentUpdateError) {
        console.error('Failed to update adjustment is_applied flag:', adjustmentUpdateError);
        // Continue even if this fails, as the main update is more important
      }

      // Then, get all workout plan IDs for the user
      const { data: workoutPlans, error: plansError } = await supabase
        .from('workout_plans')
        .select('id')
        .eq('user_id', user.id);

      if (plansError) {
        throw plansError;
      }

      if (!workoutPlans || workoutPlans.length === 0) {
        console.log('No workout plans found for user');
        return false;
      }

      const workoutPlanIds = workoutPlans.map(plan => plan.id);

      // Update entries one workout plan at a time to avoid "too many records" error
      let totalAffected = 0;
      const batchSize = 1; // Process one workout plan at a time

      for (let i = 0; i < workoutPlanIds.length; i += batchSize) {
        const batch = workoutPlanIds.slice(i, i + batchSize);

        for (const planId of batch) {
          const { data, error } = await supabase
            .from('workout_entries')
            .update(updateData)
            .eq('workout_plan_id', planId)
            .eq('exercise_id', exerciseId)
            .gte('date', today)
            .select('id');

          if (error) {
            console.error(`Failed to update entries for plan ${planId}:`, error);
            // Continue with other plans even if one fails
            continue;
          }

          totalAffected += data?.length || 0;
        }
      }

      if (totalAffected > 0) {
        console.log(`✅ Applied adjustment to ${totalAffected} future workout${totalAffected > 1 ? 's' : ''}`);
      } else {
        // No future workouts found - return true to show "Saved" feedback
        // This preserves historical data integrity (workout_sessions are immutable)
        // When new workout plans are generated, they can incorporate these preferences
        console.log('No future workouts found - showing saved feedback (preference will apply to new plans)');
      }
      // Refetch adjustments so UI shows "Saved"
      refetchAdjustments();
      return true;
    } catch (error: any) {
      console.error('Failed to apply adjustment to future workouts:', error);
      return false;
    }
  }, [user?.id, sessionId, refetchAdjustments]);

  // Extract session data
  const session = sessionData?.workout_sessionsCollection?.edges?.[0]?.node;
  const isLoading = isLoadingSession || isLoadingSets || isLoadingAdjustments;

  // Check if this workout session is from a Train Now preset
  const isTrainNow = React.useMemo(() => {
    if (!setsData?.workout_session_setsCollection?.edges) return false;
    
    // Check if any set's workout entry has a preset_id
    const sets = setsData.workout_session_setsCollection.edges.map(e => e.node);
    return sets.some(set => set.workout_entries?.preset_id);
  }, [setsData]);

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

  // Format time helper (short, e.g. "24 min")
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
    if (minutes > 0) return `${minutes} min`;
    return `${seconds}s`;
  };

  // Reconstruct exercises from sets.
  // Group by workout_entry_id only (one row per slot). Swaps do NOT create extra entries —
  // the same workout_entry_id is used before and after swap, so we show one exercise per slot.
  // Use the last set's exercise_id so we display the exercise they finished with after any swaps.
  const completedExercises = React.useMemo(() => {
    if (!setsData?.workout_session_setsCollection?.edges) {
      console.log('⚠️ [WORKOUT-COMPLETED] No sets data available for exercise reconstruction');
      return [];
    }
    
    const sets = setsData.workout_session_setsCollection.edges.map(e => e.node);
    console.log('🔄 [WORKOUT-COMPLETED] Reconstructing exercises from', sets.length, 'sets');
    
    // Group sets by workout_entry_id only — one "completed exercise" per slot (swaps don't add rows)
    type SetNode = (typeof sets)[number];
    const exercisesByEntry = sets.reduce((acc, set) => {
      const entryId = set.workout_entry_id;
      if (!entryId) return acc;
      
      if (!acc[entryId]) {
        acc[entryId] = {
          id: entryId,
          sets: [] as SetNode[],
        };
      }
      acc[entryId].sets.push(set);
      return acc;
    }, {} as Record<string, { id: string; sets: SetNode[] }>);

    console.log('📦 [WORKOUT-COMPLETED] Grouped into', Object.keys(exercisesByEntry).length, 'exercise entries');

    // Convert to array: one row per workout_entry_id, use last set's exercise_id (post-swap exercise)
    const exercises = Object.values(exercisesByEntry).map((entry) => {
      const sortedSets = [...entry.sets].sort((a, b) => (a.set_number ?? 0) - (b.set_number ?? 0));
      const lastSet = sortedSets[sortedSets.length - 1];
      const firstSet = sortedSets.find(s => s.is_completed) || sortedSets[0];
      const exerciseId = lastSet?.exercise_id ?? entry.sets[0]?.exercise_id ?? '';

      return {
        id: entry.id,
        exercise_id: exerciseId,
        sets: entry.sets.filter(s => s.is_completed).length || entry.sets.length,
        reps: firstSet?.actual_reps?.toString() || firstSet?.target_reps?.toString() || null,
        weight: firstSet?.actual_weight?.toString() || firstSet?.target_weight?.toString() || null,
        time: firstSet?.actual_time?.toString() || firstSet?.target_time?.toString() || null,
        notes: firstSet?.user_notes || null,
      };
    });

    // Sort by order of first completed set so list order matches workout order
    exercises.sort((a, b) => {
      const aFirst = sets.find(s => s.workout_entry_id === a.id);
      const bFirst = sets.find(s => s.workout_entry_id === b.id);
      const aAt = aFirst?.completed_at ? new Date(aFirst.completed_at).getTime() : 0;
      const bAt = bFirst?.completed_at ? new Date(bFirst.completed_at).getTime() : 0;
      return aAt - bAt;
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
      isApplied: adj.is_applied || false,
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
    
    // Calculate: for each completed set, multiply reps × weight
    // For bodyweight exercises (weight = 0), count 5kg per rep
    const total = sets.reduce((sum, set) => {
      if (!set.is_completed) return sum;
      
      const reps = set.actual_reps || 0;
      const weight = set.actual_weight ? parseFloat(set.actual_weight.toString()) : 0;
      
      if (reps > 0) {
        // If weight is 0 (bodyweight exercise), count 5kg per rep
        const effectiveWeight = weight > 0 ? weight : 5;
        return sum + (reps * effectiveWeight);
      }
      
      return sum;
    }, 0);
    
    return total;
  }, [setsData]);

  // Check if workout is in the past (comparing dates only, not time)
  const isWorkoutInPast = React.useMemo(() => {
    if (!session?.date) return false;

    const workoutDate = new Date(session.date);
    const today = new Date();

    // Reset time components to compare only dates
    const workoutDateOnly = new Date(workoutDate.getFullYear(), workoutDate.getMonth(), workoutDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    return workoutDateOnly.getTime() < todayOnly.getTime();
  }, [session?.date]);

  // Prepare display data.
  // Use reconstructed list length for completedExercises so the count matches the list
  // (avoids showing e.g. 5/5 when swaps were incorrectly counted as extra exercises).
  const displayData = React.useMemo(() => {
    const data = {
      workoutName: session?.day_name || 'Workout',
      totalTime: session?.total_time_ms || 0,
      completedExercises: completedExercises.length > 0
        ? completedExercises.length
        : (session?.completed_exercises ?? 0),
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
        <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
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
        <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
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
      
      {/* Back Button - top inset like other screens */}
      <ReanimatedAnimated.View 
        entering={FadeIn.duration(400).delay(100)}
        style={[styles.backButtonContainer, { top: insets.top + 8 }]}
      >
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/')}
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
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Figma-style: celebratory icon at top */}
        <ReanimatedAnimated.View
          entering={FadeIn.duration(600).delay(200)}
          style={styles.celebratoryIconWrap}
        >
          <View style={styles.celebratoryIconCircle}>
            <Image
              source={require('../assets/icons/flash.svg')}
              style={styles.celebratoryIconBolt}
              contentFit="contain"
            />
          </View>
        </ReanimatedAnimated.View>

        {/* Title with Train Now badge */}
        <ReanimatedAnimated.View 
          entering={FadeIn.duration(800).delay(250)}
          style={styles.titleContainer}
        >
          <Text style={styles.title}>
            {displayData.workoutName}
          </Text>
          {isTrainNow && (
            <View style={[styles.trainNowBadge, { backgroundColor: nucleus.light.global.brand["40"] }]}>
              <Text style={[styles.trainNowText, { color: nucleus.light.global.brand["90"] }]}>
                Train Now
              </Text>
            </View>
          )}
        </ReanimatedAnimated.View>

        {/* Figma-style message (bold headline) — only when completed today */}
        {!isWorkoutInPast && (
          <ReanimatedAnimated.Text 
            entering={FadeIn.duration(600).delay(300)}
            style={styles.encouragingMessage}
          >
            {displayData.finishedEarly 
              ? "You finished early! Every bit of effort counts."
              : "You brought the heat today."}
          </ReanimatedAnimated.Text>
        )}

        {/* Stats Card — Figma layout: white card + shadow; top row Time + Weight, then progress bars */}
        <ReanimatedAnimated.View 
          entering={FadeIn.duration(600).delay(400)}
          style={styles.statsCard}
        >
          <View style={styles.statsTopRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatTime(displayData.totalTime)}</Text>
              <Text style={styles.statLabel}>Total time</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {displayData.totalWeightLifted > 0
                  ? displayData.totalWeightLifted >= 1000 
                    ? `${(displayData.totalWeightLifted / 1000).toFixed(1)}t`
                    : `${Math.round(displayData.totalWeightLifted)}kg`
                  : '—'}
              </Text>
              <Text style={styles.statLabel}>Total lifted weight</Text>
            </View>
          </View>

          <CompactProgressBar
            completed={displayData.completedExercises}
            total={displayData.totalExercises}
            label="Exercises"
          />

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
          onSavePreference={handleSaveAdjustmentPreference}
          isWorkoutInPast={isWorkoutInPast}
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
  celebratoryIconWrap: {
    marginBottom: 16,
    alignItems: 'center',
  },
  celebratoryIconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: nucleus.light.global.brand["30"],
    borderWidth: 4,
    borderColor: nucleus.light.global.brand["70"],
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebratoryIconBolt: {
    width: 64,
    height: 64,
    tintColor: nucleus.light.global.brand["80"],
  },
  titleContainer: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
    width: '100%',
  },
  title: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 32,
    lineHeight: 38.4,
    color: nucleus.light.global.grey["90"],
    textAlign: 'center',
    includeFontPadding: false,
  },
  encouragingMessage: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 20,
    lineHeight: 26,
    color: nucleus.light.global.grey["90"],
    textAlign: 'center',
    marginBottom: 28,
    includeFontPadding: false,
  },
  trainNowBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 32,
  },
  trainNowText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    lineHeight: 14,
    includeFontPadding: false,
  },
  statsCard: {
    width: '100%',
    backgroundColor: nucleus.light.global.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statsTopRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  statItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 100,
  },
  statLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    lineHeight: 20,
    color: nucleus.light.global.grey["70"],
    textAlign: 'center',
    includeFontPadding: false,
  },
  statValue: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 28,
    lineHeight: 33.6,
    color: nucleus.light.global.blue["70"],
    textAlign: 'center',
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
    marginBottom: 20,
  },
  adjustmentExerciseName: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    lineHeight: 22,
    color: nucleus.light.global.grey["90"],
    marginBottom: 12,
    includeFontPadding: false,
  },
  adjustmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 8,
    marginBottom: 12,
    flex: 1,
  },
  adjustmentTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adjustmentText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: nucleus.light.global.grey["80"],
    includeFontPadding: false,
  },
  appliedIndicator: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 11,
    lineHeight: 14,
    color: nucleus.light.global.brand["70"],
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
  applyButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: nucleus.light.global.blue["70"],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    minWidth: 80,
    minHeight: 40,
  },
  applyButtonText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: nucleus.light.global.blue["10"],
    lineHeight: 18,
    includeFontPadding: false,
  },
  undoButton: {
    backgroundColor: nucleus.light.global.grey["20"],
  },
  undoButtonText: {
    color: nucleus.light.global.grey["70"],
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

