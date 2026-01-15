import type { PayloadAction } from '@reduxjs/toolkit';
import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { GetWorkoutDayQuery } from '../../graphql/generated';
import { ActiveWorkoutState, WorkoutSession } from '../../types/workout';

// Type for workout entries from database
type WorkoutPlansCollection = NonNullable<GetWorkoutDayQuery['workout_plansCollection']>;
type WorkoutPlanEdge = NonNullable<WorkoutPlansCollection['edges']>[number];
type WorkoutPlanNode = NonNullable<WorkoutPlanEdge['node']>;
type WorkoutEntriesCollection = NonNullable<WorkoutPlanNode['workout_entriesCollection']>;
type WorkoutEntryEdge = NonNullable<WorkoutEntriesCollection['edges']>[number];
export type WorkoutEntryNode = NonNullable<WorkoutEntryEdge['node']>;

// Enhanced workout state with Redux pattern
export interface WorkoutState {
  // Core state
  status: 'inactive' | 'selected' | 'preparing' | 'exercising' | 'set-complete' | 'resting' | 'rest-ending' | 'exercise-transition' | 'workout-completed';
  session: WorkoutSession | null;
  
  // Database session reference (new - source of truth)
  sessionId: string | null; // Reference to workout_sessions.id
  
  // Database workout entries (new structure)
  workoutEntries: WorkoutEntryNode[] | null;
  planId: string | null;
  dayName: string | null;
  
  // Active workout tracking (cached in Redux, synced to DB)
  activeWorkout: ActiveWorkoutState | null;
  
  // Warmup phase tracking (ephemeral - stays in Redux)
  warmup: {
    phase: 'inactive' | 'ready' | 'active' | 'completed';
    startTime: number | null;
    duration: number; // 600 seconds = 10 minutes
    remaining: number;
  };
  
  // Timers state (ephemeral - stays in Redux)
  timers: {
    setTimer: {
      active: boolean;
      startTime: number;
      duration: number;
      remaining: number;
    } | null;
    restTimer: {
      active: boolean;
      startTime: number;
      duration: number;
      remaining: number;
      isLastSet: boolean;
    } | null;
  };
  
  // Voice agent integration (real-time state - stays in Redux)
  voiceAgent: {
    connected: boolean;
  };
  
  // UI state (ephemeral - stays in Redux)
  userActivityPingActive: boolean;
  
  // Context messages moved to DB (workout_session_chat table)
  // Keeping empty array for backward compatibility during migration
  contextMessages: Array<{
    event: string;
    message: string;
    data: any;
    timestamp: number;
    sent: boolean;
  }>;
}

const initialState: WorkoutState = {
  status: 'inactive',
  session: null,
  sessionId: null, // New: Reference to DB session
  workoutEntries: null,
  planId: null,
  dayName: null,
  activeWorkout: null,
  warmup: {
    phase: 'inactive',
    startTime: null,
    duration: 600, // 10 minutes in seconds
    remaining: 600,
  },
  timers: {
    setTimer: null,
    restTimer: null,
  },
  voiceAgent: {
    connected: false,
  },
  userActivityPingActive: false,
  contextMessages: [],
};

// Create the workout slice
const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    // Workout lifecycle actions
    selectWorkout: {
      reducer: (state, action: PayloadAction<{ session: WorkoutSession; timestamp: number }>) => {
        const { session, timestamp } = action.payload;
        
        state.session = session;
        state.status = 'selected';
        state.activeWorkout = {
          sessionId: session.id,
          currentExerciseIndex: 0,
          currentSetIndex: 0,
          phase: 'preparing',
          startTime: new Date(timestamp),
          currentPhaseStartTime: new Date(timestamp),
          elapsedTime: 0,
          isPaused: false,
          totalPauseTime: 0,
          completedExercises: 0,
          completedSets: 0,
          totalExercises: session.exercises.length,
          totalSets: session.exercises.reduce((total, ex) => total + ex.sets.length, 0),
          currentExercise: session.exercises[0],
          currentSet: session.exercises[0].sets[0],
          exerciseConfirmed: false,
          setsCompleted: [],
          adjustmentsMade: [],
        };

        // Initialize warmup phase as 'ready' when workout is selected
        state.warmup = {
          phase: 'ready',
          startTime: null,
          duration: 600,
          remaining: 600,
        };

        // Middleware will handle context message generation
      },
      prepare: (session: WorkoutSession) => ({
        payload: { session, timestamp: Date.now() }
      })
    },

    // New action to select workout from database entries
    selectWorkoutFromEntries: {
      reducer: (state, action: PayloadAction<{ 
        workoutEntries: WorkoutEntryNode[]; 
        planId: string; 
        dayName: string; 
        sessionId: string; // New: Reference to DB session
        timestamp: number;
      }>) => {
        const { workoutEntries, planId, dayName, sessionId, timestamp } = action.payload;
        
        if (workoutEntries.length === 0) {
          return; // No entries, don't proceed
        }

        const firstEntry = workoutEntries[0];
        
        // Validate that first entry has exercise data (required for building exercise structure)
        if (!firstEntry.exercises) {
          console.error('⚠️ Workout entry missing exercise data:', firstEntry);
          return; // Cannot proceed without exercise data
        }

        state.workoutEntries = workoutEntries;
        state.planId = planId;
        state.dayName = dayName;
        state.sessionId = sessionId; // Store DB session ID
        state.status = 'selected';

        // Calculate total sets across all entries
        const totalSets = workoutEntries.reduce((sum, entry) => sum + entry.sets, 0);

        // Parse reps to get target reps for first set (e.g., "8–12" -> 8)
        const parseReps = (repsStr: string): number => {
          const match = repsStr.match(/(\d+)/);
          return match ? parseInt(match[1], 10) : 8;
        };

        // Parse weight to get target weight (e.g., "40kg" -> 40)
        const parseWeight = (weightStr: string | null | undefined): number | undefined => {
          if (!weightStr) return undefined;
          const match = weightStr.match(/(\d+(?:\.\d+)?)/);
          return match ? parseFloat(match[1]) : undefined;
        };

        // Parse time to get target time (e.g., "60s" -> 60)
        const parseTime = (timeStr: string | null | undefined): number | undefined => {
          if (!timeStr) return undefined;
          const match = timeStr.match(/(\d+)/);
          return match ? parseInt(match[1], 10) : undefined;
        };

        // Parse rest time from notes (e.g., "Rest 90 sec." -> 90)
        const parseRestTime = (notes: string | null | undefined): number => {
          if (!notes) return 90; // Default
          const match = notes.match(/[Rr]est\s+(\d+)/);
          return match ? parseInt(match[1], 10) : 90;
        };

        // Create WorkoutSet from first entry, first set
        const targetReps = parseReps(firstEntry.reps);
        const targetWeight = parseWeight(firstEntry.weight);
        const targetTime = parseTime(firstEntry.time);
        const restTimeAfter = parseRestTime(firstEntry.notes);

        // Create Exercise structure from first entry for compatibility
        const firstExercise = {
          id: firstEntry.exercise_id, // Use database source of truth instead of cached nested relationship
          name: firstEntry.exercises.name.replace(/\s*\([^)]*\)/g, '').trim(),
          description: firstEntry.exercises.instructions,
          type: 'strength' as const,
          muscleGroups: firstEntry.exercises.muscle_categories?.filter(Boolean) as string[] || [],
          sets: Array.from({ length: firstEntry.sets }, (_, i) => ({
            id: `${firstEntry.id}-set-${i + 1}`,
            setNumber: i + 1,
            targetReps,
            targetWeight,
            targetTime,
            restTimeAfter,
            isCompleted: false,
          })),
          videoUrl: firstEntry.exercises.slug 
            ? `https://kmtddcpdqkeqipyetwjs.supabase.co/storage/v1/object/public/workouts/processed/${firstEntry.exercises.slug}/${firstEntry.exercises.slug}_cropped_video.mp4`
            : undefined,
          equipment: [],
          instructions: firstEntry.exercises.instructions.split(/(?=\(\d+(?:st|nd|rd|th)\))/).filter(Boolean),
          tips: [],
          estimatedDuration: 0,
          // Additional exercise data for AI agent
          repLimitationsProgressionRules: firstEntry.exercises.rep_limitations_progression_rules,
          progressionByClientFeedback: firstEntry.exercises.progression_by_client_feedback,
          painInjuryProtocol: firstEntry.exercises.pain_injury_protocol,
          trainerNotes: firstEntry.exercises.trainer_notes,
          equipmentText: firstEntry.exercises.equipment_text,
          iconDescription: firstEntry.exercises.icon_description,
          videoDescription: firstEntry.exercises.video_description,
        } as NonNullable<typeof state.activeWorkout>['currentExercise'];

        state.activeWorkout = {
          sessionId: sessionId, // Use DB session ID instead of planId
          currentExerciseIndex: 0,
          currentSetIndex: 0,
          phase: 'preparing',
          startTime: new Date(timestamp),
          currentPhaseStartTime: new Date(timestamp),
          elapsedTime: 0,
          isPaused: false,
          totalPauseTime: 0,
          completedExercises: 0,
          completedSets: 0,
          totalExercises: workoutEntries.length,
          totalSets,
          currentExercise: firstExercise!,
          currentSet: firstExercise!.sets[0],
          exerciseConfirmed: false,
          setsCompleted: [],
          adjustmentsMade: [],
        };

        // Initialize warmup phase as 'ready' when workout is selected
        state.warmup = {
          phase: 'ready',
          startTime: null,
          duration: 600,
          remaining: 600,
        };

        // Middleware will handle context message generation
      },
      prepare: (workoutEntries: WorkoutEntryNode[], planId: string, dayName: string, sessionId: string) => ({
        payload: { workoutEntries, planId, dayName, sessionId, timestamp: Date.now() }
      })
    },

    // Resume workout from database session with full state restoration
    resumeWorkoutFromSession: {
      reducer: (state, action: PayloadAction<{
        sessionId: string;
        workoutEntries: WorkoutEntryNode[];
        planId: string;
        dayName: string;
        // Session progress data
        currentExerciseIndex: number;
        currentSetIndex: number;
        completedExercises: number;
        completedSets: number;
        totalExercises: number;
        totalSets: number;
        status: string; // Database status: 'selected', 'preparing', 'exercising', 'paused'
        startedAt: string; // ISO timestamp
        totalTimeMs: number;
        totalPauseTimeMs: number;
        // Completed sets data
        completedSetsData: Array<{
          workoutEntryId: string;
          exerciseId: string;
          setNumber: number;
          targetReps?: number | null;
          targetWeight?: number | null;
          targetTime?: number | null;
          actualReps?: number | null;
          actualWeight?: number | null;
          actualTime?: number | null;
          difficulty?: string | null;
          restStartedAt?: string | null;
          restCompletedAt?: string | null;
        }>;
        // Adjustments data
        adjustmentsData: Array<{
          type: string;
          workoutEntryId?: string | null;
          exerciseId?: string | null;
          fromValue: string;
          toValue: string;
          reason: string;
          timestamp: string;
        }>;
      }>) => {
        const {
          sessionId,
          workoutEntries,
          planId,
          dayName,
          currentExerciseIndex,
          currentSetIndex,
          completedExercises,
          completedSets,
          totalExercises,
          totalSets,
          status,
          startedAt,
          totalTimeMs,
          totalPauseTimeMs,
          completedSetsData,
          adjustmentsData,
        } = action.payload;

        if (workoutEntries.length === 0) {
          return; // No entries, don't proceed
        }

        // Validate that entries have exercise data
        if (!workoutEntries[0]?.exercises) {
          console.error('⚠️ Workout entry missing exercise data:', workoutEntries[0]);
          return;
        }

        state.workoutEntries = workoutEntries;
        state.planId = planId;
        state.dayName = dayName;
        state.sessionId = sessionId;

        // Helper functions for parsing
        const parseReps = (repsStr: string): number => {
          const match = repsStr.match(/(\d+)/);
          return match ? parseInt(match[1], 10) : 8;
        };

        const parseWeight = (weightStr: string | null | undefined): number | undefined => {
          if (!weightStr) return undefined;
          const match = weightStr.match(/(\d+(?:\.\d+)?)/);
          return match ? parseFloat(match[1]) : undefined;
        };

        const parseTime = (timeStr: string | null | undefined): number | undefined => {
          if (!timeStr) return undefined;
          const match = timeStr.match(/(\d+)/);
          return match ? parseInt(match[1], 10) : undefined;
        };

        const parseRestTime = (notes: string | null | undefined): number => {
          if (!notes) return 90;
          const match = notes.match(/[Rr]est\s+(\d+)/);
          return match ? parseInt(match[1], 10) : 90;
        };

        // Build exercises array from workout entries
        const exercises = workoutEntries.map((entry) => {
          if (!entry.exercises) {
            throw new Error(`Entry ${entry.id} missing exercise data`);
          }

          const targetReps = parseReps(entry.reps);
          const targetWeight = parseWeight(entry.weight);
          const targetTime = parseTime(entry.time);
          const restTimeAfter = parseRestTime(entry.notes);

          // Mark sets as completed based on completedSetsData
          const sets = Array.from({ length: entry.sets }, (_, i) => {
            const setNumber = i + 1;
            const completedSet = completedSetsData.find(
              (cs) => cs.workoutEntryId === entry.id && cs.setNumber === setNumber
            );

            return {
              id: `${entry.id}-set-${setNumber}`,
              setNumber,
              targetReps,
              targetWeight,
              targetTime,
              restTimeAfter,
              isCompleted: !!completedSet,
              actualReps: completedSet?.actualReps ?? undefined,
              actualWeight: completedSet?.actualWeight ? parseFloat(String(completedSet.actualWeight)) : undefined,
              actualTime: completedSet?.actualTime ?? undefined,
              difficulty: completedSet?.difficulty as 'easy' | 'medium' | 'hard' | 'impossible' | undefined,
            };
          });

          return {
            id: entry.exercise_id,
            name: entry.exercises.name.replace(/\s*\([^)]*\)/g, '').trim(),
            description: entry.exercises.instructions,
            type: 'strength' as const,
            muscleGroups: entry.exercises.muscle_categories?.filter(Boolean) as string[] || [],
            sets,
            videoUrl: entry.exercises.slug
              ? `https://kmtddcpdqkeqipyetwjs.supabase.co/storage/v1/object/public/workouts/processed/${entry.exercises.slug}/${entry.exercises.slug}_cropped_video.mp4`
              : undefined,
            equipment: [],
            instructions: entry.exercises.instructions.split(/(?=\(\d+(?:st|nd|rd|th)\))/).filter(Boolean),
            tips: [],
            estimatedDuration: 0,
            repLimitationsProgressionRules: entry.exercises.rep_limitations_progression_rules,
            progressionByClientFeedback: entry.exercises.progression_by_client_feedback,
            painInjuryProtocol: entry.exercises.pain_injury_protocol,
            trainerNotes: entry.exercises.trainer_notes,
            equipmentText: entry.exercises.equipment_text,
            iconDescription: entry.exercises.icon_description,
            videoDescription: entry.exercises.video_description,
          };
        });

        // Get current exercise
        const currentExercise = exercises[currentExerciseIndex];
        if (!currentExercise) {
          console.error('⚠️ Current exercise index out of bounds:', currentExerciseIndex);
          return;
        }

        // Validate and adjust currentSetIndex if out of bounds
        // This can happen if all sets were completed but index wasn't reset
        let adjustedSetIndex = currentSetIndex;
        if (currentSetIndex >= currentExercise.sets.length) {
          console.warn(`⚠️ Current set index ${currentSetIndex} out of bounds (exercise has ${currentExercise.sets.length} sets), adjusting to last set`);
          adjustedSetIndex = currentExercise.sets.length - 1;
        }

        // Get current set
        const currentSet = currentExercise.sets[adjustedSetIndex];
        if (!currentSet) {
          console.error('⚠️ Current set is undefined after adjustment:', adjustedSetIndex);
          return;
        }

        // Build setsCompleted array from completedSetsData
        const setsCompleted = completedSetsData.map((cs) => ({
          exerciseId: cs.exerciseId,
          setId: `${cs.workoutEntryId}-set-${cs.setNumber}`,
          performance: {
            actualReps: cs.actualReps ?? undefined,
            actualWeight: cs.actualWeight ? parseFloat(String(cs.actualWeight)) : undefined,
            difficulty: cs.difficulty as 'easy' | 'medium' | 'hard' | 'impossible' | undefined,
          },
        }));

        // Build adjustmentsMade array from adjustmentsData
        const adjustmentsMade = adjustmentsData.map((adj) => ({
          type: adj.type as 'weight' | 'reps' | 'rest',
          from: parseFloat(adj.fromValue) || 0,
          to: parseFloat(adj.toValue) || 0,
          reason: adj.reason,
          timestamp: new Date(adj.timestamp),
        }));

        // Check if current set is already completed in database
        const currentSetCompleted = completedSetsData.some(
          (cs) => cs.workoutEntryId === workoutEntries[currentExerciseIndex]?.id && 
                   cs.setNumber === (currentSetIndex + 1) // setNumber is 1-indexed
        );

        // Calculate elapsed time from start
        const startTime = new Date(startedAt);
        const now = new Date();
        const elapsedTime = totalTimeMs || (now.getTime() - startTime.getTime() - totalPauseTimeMs);

        // Map database status to Redux status
        // Strategy: Always resume paused at the start of the last segment for natural experience
        // Timers can't be perfectly restored, so pause at segment start and let user resume manually
        // Database: 'selected', 'preparing', 'exercising', 'paused'
        // Redux: 'selected', 'preparing', 'exercising', 'set-complete', 'resting', 'rest-ending', 'exercise-transition', 'workout-completed'
        let reduxStatus: WorkoutState['status'] = 'selected';
        let phase: ActiveWorkoutState['phase'] = 'preparing';
        let isPaused = false;

        // Check if we were in a rest period (last completed set has rest_started_at but no rest_completed_at)
        const lastCompletedSet = completedSetsData
          .filter(cs => cs.workoutEntryId === workoutEntries[currentExerciseIndex]?.id)
          .sort((a, b) => b.setNumber - a.setNumber)[0]; // Get most recent completed set for current exercise
        
        const wasInRest = lastCompletedSet?.restStartedAt && !lastCompletedSet?.restCompletedAt;

        // Strategy: Always resume paused at the START of the last segment for natural experience
        // Check if current set is completed first
        if (currentSetCompleted) {
          // Set already completed - transition to set-complete (will auto-transition to rest)
          // Then pause at start of rest segment for natural resume
          reduxStatus = 'set-complete';
          phase = 'resting';
          // Note: Will auto-transition to rest, then pause at start of rest
        } else if (wasInRest) {
          // We were in a rest period - resume paused at start of rest segment
          reduxStatus = 'resting';
          phase = 'resting';
          isPaused = true;
          console.log('⏸️ Resuming workout paused at start of rest segment - user can resume when ready');
        } else if (status === 'preparing' || status === 'selected') {
          // If preparing or selected, stay in that state (not paused - user hasn't started set yet)
          reduxStatus = status === 'preparing' ? 'preparing' : 'selected';
          phase = 'preparing';
        } else {
          // For 'exercising' or 'paused' status:
          // Resume paused at the START of the current set segment
          // This is most natural - user can resume when ready with fresh timer
          reduxStatus = 'exercising';
          phase = 'exercising';
          isPaused = true;
          console.log('⏸️ Resuming workout paused at start of current set segment - user can resume when ready');
        }

        state.status = reduxStatus;
        state.activeWorkout = {
          sessionId,
          currentExerciseIndex,
          currentSetIndex: adjustedSetIndex, // Use adjusted index
          phase,
          startTime,
          currentPhaseStartTime: new Date(), // Reset phase start time
          elapsedTime: Math.max(0, elapsedTime),
          isPaused: isPaused,
          totalPauseTime: totalPauseTimeMs || 0,
          pauseStartTime: isPaused ? new Date() : undefined,
          completedExercises,
          completedSets,
          totalExercises,
          totalSets,
          currentExercise,
          currentSet,
          exerciseConfirmed: adjustedSetIndex > 0 || completedSets > 0, // Confirmed if we've done any sets
          setsCompleted,
          adjustmentsMade,
        };

        // Initialize timers based on current state
        // If resuming to exercising state, create set timer with full duration
        // If resuming to resting state, create rest timer with full duration
        if (reduxStatus === 'exercising' && currentSet) {
          const targetTime = currentSet.targetTime || 45;
          state.timers.setTimer = {
            active: false, // Will be activated when user resumes
            startTime: Date.now(),
            duration: targetTime * 1000,
            remaining: targetTime * 1000, // Start with full duration
          };
          state.timers.restTimer = null;
        } else if (reduxStatus === 'resting' && currentSet) {
          const restTimeAfter = currentSet.restTimeAfter || 90;
          state.timers.restTimer = {
            active: false, // Will be activated when user resumes
            startTime: Date.now(),
            duration: restTimeAfter * 1000,
            remaining: restTimeAfter * 1000, // Start with full duration
            isLastSet: false, // Middleware will determine this
          };
          state.timers.setTimer = null;
        } else {
          // Reset timers for other states
          state.timers = {
            setTimer: null,
            restTimer: null,
          };
        }

        console.log('✅ Workout resumed from session:', {
          sessionId,
          currentExerciseIndex,
          originalSetIndex: currentSetIndex,
          adjustedSetIndex,
          completedExercises,
          completedSets,
          status: reduxStatus,
          setsCompletedCount: setsCompleted.length,
          adjustmentsCount: adjustmentsMade.length,
        });
      },
      prepare: (params: {
        sessionId: string;
        workoutEntries: WorkoutEntryNode[];
        planId: string;
        dayName: string;
        currentExerciseIndex: number;
        currentSetIndex: number;
        completedExercises: number;
        completedSets: number;
        totalExercises: number;
        totalSets: number;
        status: string;
        startedAt: string;
        totalTimeMs: number;
        totalPauseTimeMs: number;
        completedSetsData: Array<{
          workoutEntryId: string;
          exerciseId: string;
          setNumber: number;
          targetReps?: number | null;
          targetWeight?: number | null;
          targetTime?: number | null;
          actualReps?: number | null;
          actualWeight?: number | null;
          actualTime?: number | null;
          difficulty?: string | null;
        }>;
        adjustmentsData: Array<{
          type: string;
          workoutEntryId?: string | null;
          exerciseId?: string | null;
          fromValue: string;
          toValue: string;
          reason: string;
          timestamp: string;
        }>;
      }) => ({
        payload: params,
      }),
    },

    startExercisePreparation: (state) => {
      state.status = 'preparing';
      state.activeWorkout!.phase = 'preparing';
      state.activeWorkout!.currentPhaseStartTime = new Date();
      state.activeWorkout!.exerciseConfirmed = false;
      state.activeWorkout!.timeRemaining = undefined; // Clear rest timer display

      // Middleware will handle context message generation
    },

    confirmReadyAndStartSet: (state) => {
      // CRITICAL: If warmup phase is "ready", start warmup instead of a set
      if (state.warmup.phase === 'ready') {
        state.warmup.phase = 'active';
        state.warmup.startTime = Date.now();
        state.warmup.remaining = state.warmup.duration;
        // Keep status as 'selected' so UI shows warmup screen, not exercise screen
        state.status = 'selected';
        console.log('🔥 [Warmup] Started via start_set() - 10 minute timer active');
        return; // Don't proceed to set logic
      }

      // Handle different states where user can start a set
      const currentSetIndex = state.activeWorkout!.currentSetIndex;
      const totalSets = state.activeWorkout!.currentExercise?.sets.length || 0;
      const isLastSet = currentSetIndex >= totalSets - 1;

      if (state.status === 'resting') {
        // Clear rest timer
        state.timers.restTimer = null;
        
        if (isLastSet) {
          // User is ready after final set - will complete exercise
          // Middleware will handle context message generation
          return;
        } else {
          // User ready during normal rest - advance to next set and start exercising immediately
          state.activeWorkout!.currentSetIndex++;
          if (state.activeWorkout!.currentExercise) {
            state.activeWorkout!.currentSet = state.activeWorkout!.currentExercise.sets[state.activeWorkout!.currentSetIndex];
          }
          
          // Reset timing data for new set
          state.activeWorkout!.elapsedTime = 0;
          state.activeWorkout!.totalPauseTime = 0;
          state.activeWorkout!.pauseStartTime = undefined;
          state.activeWorkout!.isPaused = false;
          state.activeWorkout!.timeRemaining = undefined; // Clear rest timer display
          
          // Go directly to exercising state (user said they're ready)
          state.status = 'exercising';
          state.activeWorkout!.phase = 'exercising';
          state.activeWorkout!.currentPhaseStartTime = new Date();
          
          // Start set timer
          const targetTime = state.activeWorkout!.currentSet?.targetTime || 45;
          const startTime = Date.now();
          // Store start timestamp in set object (survives navigation)
          if (state.activeWorkout!.currentSet) {
            state.activeWorkout!.currentSet.setStartTimestamp = startTime;
          }
          state.timers.setTimer = {
            active: true,
            startTime,
            duration: targetTime * 1000,
            remaining: targetTime * 1000,
          };
        }
      } else if (state.status === 'rest-ending') {
        // Clear rest timer and advance to next set, start exercising immediately
        state.timers.restTimer = null;
        state.activeWorkout!.currentSetIndex++;
        if (state.activeWorkout!.currentExercise) {
          state.activeWorkout!.currentSet = state.activeWorkout!.currentExercise.sets[state.activeWorkout!.currentSetIndex];
        }
        
        // Reset timing data for new set
        state.activeWorkout!.elapsedTime = 0;
        state.activeWorkout!.totalPauseTime = 0;
        state.activeWorkout!.pauseStartTime = undefined;
        state.activeWorkout!.isPaused = false;
        state.activeWorkout!.timeRemaining = undefined; // Clear rest timer display
        
        // Go directly to exercising state (user confirmed readiness during rest-ending)
        state.status = 'exercising';
        state.activeWorkout!.phase = 'exercising';
        state.activeWorkout!.currentPhaseStartTime = new Date();
        
        // Start set timer
        const targetTime = state.activeWorkout!.currentSet?.targetTime || 45;
        const startTime = Date.now();
        state.timers.setTimer = {
          active: true,
          startTime,
          duration: targetTime * 1000,
          remaining: targetTime * 1000,
        };
      } else if (state.status === 'exercise-transition') {
        // User ready for new exercise - transition to preparing
        state.status = 'preparing';
        state.activeWorkout!.phase = 'preparing';
        state.activeWorkout!.currentPhaseStartTime = new Date();
        return;
      }

      // Start the set
      state.status = 'exercising';
      state.activeWorkout!.phase = 'exercising';
      state.activeWorkout!.isPaused = false;
      state.activeWorkout!.totalPauseTime = 0;
      state.activeWorkout!.currentPhaseStartTime = new Date();

      const setDuration = state.activeWorkout!.currentSet?.targetTime || 45;
      const timestamp = Date.now();

      // Store start timestamp in set object (survives navigation)
      if (state.activeWorkout!.currentSet) {
        state.activeWorkout!.currentSet.setStartTimestamp = timestamp;
      }

      // Set up set timer
      state.timers.setTimer = {
        active: true,
        startTime: timestamp,
        duration: setDuration * 1000,
        remaining: setDuration * 1000,
      };

      state.userActivityPingActive = true;

      // Middleware will handle context message generation
    },

    completeSet: {
      reducer: (state, action: PayloadAction<{ actualReps?: number; timestamp: number }>) => {
        const { actualReps, timestamp } = action.payload;

        // CRITICAL: If warmup phase is "active", complete warmup instead of a set
        if (state.warmup.phase === 'active' && state.status === 'selected') {
          state.warmup.phase = 'completed';
          state.warmup.remaining = 0;
          // Transition to preparing state for first exercise
          state.status = 'preparing';
          if (state.activeWorkout) {
            state.activeWorkout.phase = 'preparing';
            state.activeWorkout.currentPhaseStartTime = new Date();
          }
          console.log('🔥 [Warmup] Completed via complete_set() - transitioning to first exercise');
          return; // Don't proceed to set completion logic
        }

        // Capture pause time BEFORE clearing timer/resetting state
        const finalPauseTime = state.activeWorkout!.totalPauseTime ?? 0;

        // Store completion metadata in set object (survives navigation)
        if (state.activeWorkout!.currentSet) {
          state.activeWorkout!.currentSet.setCompletedAt = timestamp;
          state.activeWorkout!.currentSet.setPauseTimeMs = finalPauseTime;
        }

        // Clear set timer
        state.timers.setTimer = null;
        state.userActivityPingActive = false;

        // Update set data (safety check for undefined currentSet)
        if (!state.activeWorkout!.currentSet) {
          console.warn('⚠️ Cannot complete set - currentSet is undefined');
          return;
        }
        
        state.activeWorkout!.currentSet.actualReps = actualReps || state.activeWorkout!.currentSet.targetReps;
        // Set actualWeight to targetWeight when set is completed (for weight tracking)
        state.activeWorkout!.currentSet.actualWeight = state.activeWorkout!.currentSet.targetWeight;
        state.activeWorkout!.currentSet.isCompleted = true;

        // Reset pause state (but we've already captured it above)
        state.activeWorkout!.isPaused = false;
        state.activeWorkout!.totalPauseTime = 0;

        state.status = 'set-complete';
        state.activeWorkout!.phase = 'resting';
        state.activeWorkout!.completedSets++;

        // Add to completed sets tracking (safety check)
        if (state.activeWorkout!.currentExercise && state.activeWorkout!.currentSet) {
          state.activeWorkout!.setsCompleted.push({
            exerciseId: state.activeWorkout!.currentExercise.id,
            setId: state.activeWorkout!.currentSet.id,
            performance: {
              actualReps: state.activeWorkout!.currentSet.actualReps,
              actualWeight: state.activeWorkout!.currentSet.actualWeight,
              difficulty: state.activeWorkout!.currentSet.difficulty,
            },
          });
        }

        // Middleware will handle context message generation


      },
      prepare: (actualReps?: number) => ({
        payload: { 
          actualReps, 
          timestamp: Date.now(),
          // pauseTimeMs will be captured in reducer from state before reset
        }
      })
    },

    startRest: (state) => {
      state.status = 'resting';
      const restDuration = state.activeWorkout!.currentSet!.restTimeAfter || 60;
      const timestamp = Date.now();

      // Check if this is the last set of the exercise
      const currentSetIndex = state.activeWorkout!.currentSetIndex;
      const totalSets = state.activeWorkout!.currentExercise!.sets.length || 0;
      const isLastSet = currentSetIndex >= totalSets - 1;

      // Set up rest timer
      state.timers.restTimer = {
        active: true,
        startTime: timestamp,
        duration: restDuration * 1000,
        remaining: restDuration * 1000,
        isLastSet,
      };

      // Middleware will handle context message generation
    },

    triggerRestEnding: (state) => {
      state.status = 'rest-ending';
      
      // Use actual remaining time instead of hardcoded 10
      const actualTimeRemaining = state.activeWorkout?.timeRemaining || 10;
      
      // Middleware will handle context message generation
    },

    completeExercise: (state) => {

      // Clear all timers
      state.timers.setTimer = null;
      state.timers.restTimer = null;
      state.userActivityPingActive = false;

      // Determine if using workout entries or legacy session
      const usingWorkoutEntries = state.workoutEntries !== null && state.workoutEntries.length > 0;
      const totalExercises = usingWorkoutEntries 
        ? state.workoutEntries!.length 
        : (state.session?.exercises.length || 0);

      if (!state.activeWorkout) {
        console.warn('⚠️ completeExercise called but activeWorkout is null');
        return;
      }

      // We're completing the current exercise, so increment completedExercises
      // This represents "how many exercises have been fully completed"
      state.activeWorkout.completedExercises++;

      // Check if this was the last exercise
      if (state.activeWorkout.currentExerciseIndex >= totalExercises - 1) {
        // Workout is complete - transition to workout-completed state (final state)
        // completedExercises has already been incremented above, so it should equal totalExercises now
        state.status = 'workout-completed';
        
        // Middleware will handle context message generation
        return;
      }

      // Move to next exercise (not the last one)
      state.activeWorkout.currentExerciseIndex++;
      state.activeWorkout.currentSetIndex = 0;

      if (usingWorkoutEntries) {
        // Get next entry from workout entries
        const nextEntry = state.workoutEntries![state.activeWorkout!.currentExerciseIndex];
        
        // Parse values for next exercise
        const parseReps = (repsStr: string): number => {
          const match = repsStr.match(/(\d+)/);
          return match ? parseInt(match[1], 10) : 8;
        };
        const parseWeight = (weightStr: string | null | undefined): number | undefined => {
          if (!weightStr) return undefined;
          const match = weightStr.match(/(\d+(?:\.\d+)?)/);
          return match ? parseFloat(match[1]) : undefined;
        };
        const parseTime = (timeStr: string | null | undefined): number | undefined => {
          if (!timeStr) return undefined;
          const match = timeStr.match(/(\d+)/);
          return match ? parseInt(match[1], 10) : undefined;
        };
        const parseRestTime = (notes: string | null | undefined): number => {
          if (!notes) return 90;
          const match = notes.match(/[Rr]est\s+(\d+)/);
          return match ? parseInt(match[1], 10) : 90;
        };

        const targetReps = parseReps(nextEntry.reps);
        const targetWeight = parseWeight(nextEntry.weight);
        const targetTime = parseTime(nextEntry.time);
        const restTimeAfter = parseRestTime(nextEntry.notes);

        const nextExercise = {
          id: nextEntry.exercises.id,
          name: nextEntry.exercises.name.replace(/\s*\([^)]*\)/g, '').trim(),
          description: nextEntry.exercises.instructions,
          type: 'strength' as const,
          muscleGroups: nextEntry.exercises.muscle_categories?.filter(Boolean) as string[] || [],
          sets: Array.from({ length: nextEntry.sets }, (_, i) => ({
            id: `${nextEntry.id}-set-${i + 1}`,
            setNumber: i + 1,
            targetReps,
            targetWeight,
            targetTime,
            restTimeAfter,
            isCompleted: false,
          })),
          videoUrl: nextEntry.exercises.slug 
            ? `https://kmtddcpdqkeqipyetwjs.supabase.co/storage/v1/object/public/workouts/processed/${nextEntry.exercises.slug}/${nextEntry.exercises.slug}_cropped_video.mp4`
            : undefined,
          equipment: [],
          instructions: nextEntry.exercises.instructions.split(/(?=\(\d+(?:st|nd|rd|th)\))/).filter(Boolean),
          tips: [],
          estimatedDuration: 0,
          // Additional exercise data for AI agent
          repLimitationsProgressionRules: nextEntry.exercises.rep_limitations_progression_rules,
          progressionByClientFeedback: nextEntry.exercises.progression_by_client_feedback,
          painInjuryProtocol: nextEntry.exercises.pain_injury_protocol,
          trainerNotes: nextEntry.exercises.trainer_notes,
          equipmentText: nextEntry.exercises.equipment_text,
          iconDescription: nextEntry.exercises.icon_description,
          videoDescription: nextEntry.exercises.video_description,
        } as NonNullable<typeof state.activeWorkout>['currentExercise'];

        state.activeWorkout!.currentExercise = nextExercise!;
        state.activeWorkout!.currentSet = nextExercise!.sets[0];
      } else {
        // Legacy session path
        state.activeWorkout!.currentExercise = state.session!.exercises[state.activeWorkout!.currentExerciseIndex];
        state.activeWorkout!.currentSet = state.activeWorkout!.currentExercise.sets[0];
      }

      // Transition to exercise-transition state
      state.status = 'exercise-transition';

      // Middleware will handle context message generation
    },

    completeWorkout: (state) => {

      // Clear all timers
      state.timers.setTimer = null;
      state.timers.restTimer = null;
      state.userActivityPingActive = false;

      // Get workout name from either session (legacy) or dayName (new structure)
      const workoutName = state.session?.name || state.dayName || 'Workout';

      const workoutSummary = {
        sessionName: workoutName,
        totalTime: Date.now() - state.activeWorkout!.startTime.getTime(),
        completedExercises: state.activeWorkout!.completedExercises,
        totalExercises: state.activeWorkout!.totalExercises,
        completedSets: state.activeWorkout!.completedSets,
        totalSets: state.activeWorkout!.totalSets,
        setsCompleted: state.activeWorkout!.setsCompleted,
        adjustmentsMade: state.activeWorkout!.adjustmentsMade,
        isFullyCompleted: state.activeWorkout!.completedExercises === state.activeWorkout!.totalExercises,
      };

      // Middleware will handle context message generation

      // Reset to inactive state
      state.status = 'inactive';
      state.session = null;
      state.sessionId = null; // Clear DB session reference
      state.workoutEntries = null;
      state.planId = null;
      state.dayName = null;
      state.activeWorkout = null;
    },

    finishWorkoutEarly: (state) => {
      // Clear all timers
      state.timers.setTimer = null;
      state.timers.restTimer = null;
      state.userActivityPingActive = false;

      // Get workout name from either session (legacy) or dayName (new structure)
      const workoutName = state.session?.name || state.dayName || 'Workout';

      // Safety check - ensure activeWorkout exists
      if (!state.activeWorkout) {
        console.error('⚠️ Cannot finish workout early - activeWorkout is null');
        return;
      }

      const workoutSummary = {
        sessionName: workoutName,
        totalTime: Date.now() - state.activeWorkout.startTime.getTime(),
        completedExercises: state.activeWorkout.completedExercises,
        totalExercises: state.activeWorkout.totalExercises,
        completedSets: state.activeWorkout.completedSets,
        totalSets: state.activeWorkout.totalSets,
        setsCompleted: state.activeWorkout.setsCompleted,
        adjustmentsMade: state.activeWorkout.adjustmentsMade,
        isFullyCompleted: false,
        finishedEarly: true,
        currentExercise: state.activeWorkout.currentExercise?.name,
        currentSet: state.activeWorkout.currentSetIndex + 1,
      };

      // Middleware will handle context message generation

      // Reset to inactive state
      state.status = 'inactive';
      state.session = null;
      state.sessionId = null; // Clear DB session reference
      state.workoutEntries = null;
      state.planId = null;
      state.dayName = null;
      state.activeWorkout = null;
    },

    // Voice agent integration
    setVoiceAgentStatus: (state, action: PayloadAction<boolean>) => {
      state.voiceAgent.connected = action.payload;
    },

    // Timer updates (called by middleware)
    updateSetTimer: (state, action: PayloadAction<{ remaining: number; elapsed: number }>) => {
      // Create timer if it doesn't exist
      if (!state.timers.setTimer) {
        state.timers.setTimer = {
          active: false,
          startTime: Date.now(),
          duration: action.payload.remaining,
          remaining: action.payload.remaining,
        };
      } else {
        state.timers.setTimer.remaining = action.payload.remaining;
      }
      if (state.activeWorkout) {
        state.activeWorkout.elapsedTime = action.payload.elapsed;
        state.activeWorkout.exactSeconds = Math.floor(action.payload.elapsed / 1000);
      }
    },

    updateRestTimer: (state, action: PayloadAction<{ remaining: number; elapsed: number }>) => {
      // Create timer if it doesn't exist
      if (!state.timers.restTimer) {
        state.timers.restTimer = {
          active: false,
          startTime: Date.now(),
          duration: action.payload.remaining,
          remaining: action.payload.remaining,
          isLastSet: false, // Middleware will determine this
        };
      } else {
        state.timers.restTimer.remaining = action.payload.remaining;
      }
      if (state.activeWorkout) {
        state.activeWorkout.timeRemaining = Math.floor(action.payload.remaining / 1000);
      }
    },

    // Timer expiration (called by middleware)
    setTimerExpired: (state) => {
      // Just clear the timer - middleware will handle dispatching completeSet
      if (state.status === 'exercising') {
        state.timers.setTimer = null;
        state.userActivityPingActive = false;
      }
    },

    restTimerExpired: (state) => {
      if (state.status === 'resting') {
        // Trigger rest ending (middleware handles isLastSet logic)
        state.status = 'rest-ending';
        
        // Use actual remaining time instead of hardcoded 10
        const actualTimeRemaining = state.activeWorkout?.timeRemaining || 10;
        
        // Middleware will handle context message generation
      } else if (state.status === 'rest-ending') {
        // Rest timer fully expired - check if we should advance to next set or complete exercise
        state.timers.restTimer = null;
        
        if (state.activeWorkout && state.activeWorkout.currentExercise) {
          const currentSetIndex = state.activeWorkout.currentSetIndex;
          const totalSets = state.activeWorkout.currentExercise.sets.length;
          
          // Check if this was the last set of the current exercise
          if (currentSetIndex >= totalSets - 1) {
            // Last set completed - complete the exercise (middleware will handle transition)
            // Don't advance set index, let completeExercise handle it
            state.status = 'exercise-transition';
            state.activeWorkout.phase = 'transitioning';
            // Middleware will call completeExercise
          } else {
            // Advance to next set
            state.activeWorkout.currentSetIndex++;
            state.activeWorkout.currentSet = state.activeWorkout.currentExercise.sets[state.activeWorkout.currentSetIndex];
            
            // Reset timing data for new set
            state.activeWorkout.elapsedTime = 0;
            state.activeWorkout.totalPauseTime = 0;
            state.activeWorkout.pauseStartTime = undefined;
            state.activeWorkout.isPaused = false;
            state.activeWorkout.timeRemaining = undefined; // Clear rest timer display
            
            // Go to preparing state
            state.status = 'preparing';
            state.activeWorkout.phase = 'preparing';
            state.activeWorkout.currentPhaseStartTime = new Date();
            state.activeWorkout.exerciseConfirmed = false;
            
            // Middleware will handle context message generation
          }
        }
      }
    },

    // Pause/Resume - Pure state setter (no logic)
    pauseSet: (state, action: PayloadAction<{ reason: string }>) => {
      state.activeWorkout!.isPaused = true;
      state.activeWorkout!.pauseStartTime = new Date();
      
      // Pause appropriate timer based on current state
      if (state.status === 'exercising' && state.timers.setTimer) {
        state.timers.setTimer.active = false;
      } else if ((state.status === 'resting' || state.status === 'rest-ending') && state.timers.restTimer) {
        state.timers.restTimer.active = false;
      }
      
      state.userActivityPingActive = false;

      // Middleware will handle context message generation
    },

    resumeSet: (state) => {
      // Calculate pause duration and add to total
      if (state.activeWorkout!.pauseStartTime) {
        const pauseDuration = Date.now() - state.activeWorkout!.pauseStartTime.getTime();
        state.activeWorkout!.totalPauseTime += pauseDuration;
      }

      state.activeWorkout!.isPaused = false;
      state.activeWorkout!.pauseStartTime = undefined;
      
      // Resume appropriate timer based on current state
      if (state.status === 'exercising' && state.timers.setTimer) {
        state.timers.setTimer.active = true;
      } else if ((state.status === 'resting' || state.status === 'rest-ending') && state.timers.restTimer) {
        state.timers.restTimer.active = true;
      }
      
      state.userActivityPingActive = true;

      // Middleware will handle context message generation
    },

    // Adjustments - Pure state setters
    adjustWeight: (state, action: PayloadAction<{ newWeight: number; reason: string }>) => {
      const { newWeight, reason } = action.payload;
      const oldWeight = state.activeWorkout!.currentSet!.targetWeight || 0;
      
      // Update current set and all subsequent sets in current exercise
      const currentExercise = state.activeWorkout!.currentExercise!;
      const currentSetIndex = state.activeWorkout!.currentSetIndex;
      
      for (let i = currentSetIndex; i < currentExercise.sets.length; i++) {
        currentExercise.sets[i].targetWeight = newWeight;
      }
      
      // Update the current active set reference
      state.activeWorkout!.currentSet!.targetWeight = newWeight;
      
      state.activeWorkout!.adjustmentsMade.push({
        type: 'weight',
        from: oldWeight,
        to: newWeight,
        reason,
        timestamp: new Date(),
      });

      // Middleware will handle context message generation
    },

    adjustReps: (state, action: PayloadAction<{ newReps: number; reason: string }>) => {
      const { newReps, reason } = action.payload;
      const oldReps = state.activeWorkout!.currentSet!.targetReps;
      
      // Update current set and all subsequent sets in current exercise
      const currentExercise = state.activeWorkout!.currentExercise!;
      const currentSetIndex = state.activeWorkout!.currentSetIndex;
      
      for (let i = currentSetIndex; i < currentExercise.sets.length; i++) {
        currentExercise.sets[i].targetReps = newReps;
      }
      
      // Update the current active set reference
      state.activeWorkout!.currentSet!.targetReps = newReps;
      
      state.activeWorkout!.adjustmentsMade.push({
        type: 'reps',
        from: oldReps,
        to: newReps,
        reason,
        timestamp: new Date(),
      });

      // Middleware will handle context message generation
    },

    adjustRestTime: (state, action: PayloadAction<{ newRestTime: number; reason: string }>) => {
      const { newRestTime, reason } = action.payload;
      const oldRestTime = state.activeWorkout!.currentSet!.restTimeAfter || 60;
      
      // Update current set and all subsequent sets in current exercise
      const currentExercise = state.activeWorkout!.currentExercise!;
      const currentSetIndex = state.activeWorkout!.currentSetIndex;
      
      for (let i = currentSetIndex; i < currentExercise.sets.length; i++) {
        currentExercise.sets[i].restTimeAfter = newRestTime;
      }
      
      // Update the current active set reference
      state.activeWorkout!.currentSet!.restTimeAfter = newRestTime;
      
      state.activeWorkout!.adjustmentsMade.push({
        type: 'rest',
        from: oldRestTime,
        to: newRestTime,
        reason,
        timestamp: new Date(),
      });

      // If currently resting, adjust the timer
      if (['resting', 'rest-ending'].includes(state.status) && state.timers.restTimer) {
        const elapsed = Date.now() - state.timers.restTimer.startTime;
        const remaining = Math.max(10000, newRestTime * 1000 - elapsed);
        
        state.timers.restTimer.duration = newRestTime * 1000;
        state.timers.restTimer.remaining = remaining;
        
        if (remaining > 10000) {
          state.status = 'resting';
        } else {
          state.status = 'rest-ending';
        }
      }

      // Middleware will handle context message generation
    },

    extendRest: (state, action: PayloadAction<{ additionalSeconds: number }>) => {
      const { additionalSeconds } = action.payload;
      
      if (['resting', 'rest-ending'].includes(state.status)) {
        if (state.timers.restTimer) {
          // Extend existing rest timer
          const currentRemaining = state.timers.restTimer.remaining;
          const extendedTime = currentRemaining + (additionalSeconds * 1000);
          
          state.timers.restTimer.remaining = extendedTime;
          state.timers.restTimer.duration += (additionalSeconds * 1000);
          
          // Update status based on new remaining time
          if (extendedTime > 10000) {
            state.status = 'resting';
          } else {
            state.status = 'rest-ending';
          }
        } else {
          // Create a new rest timer with just the additional time (don't modify set's rest time)
          const baseRestDuration = state.activeWorkout?.currentSet?.restTimeAfter || 60;
          const extendedDuration = additionalSeconds; // Only use the additional time
          const timestamp = Date.now();
          
          state.timers.restTimer = {
            active: true,
            startTime: timestamp,
            duration: extendedDuration * 1000,
            remaining: extendedDuration * 1000,
            isLastSet: false, // middleware will determine this
          };
          
          state.status = 'resting';
        }
      }
      
      // Middleware will handle context message generation and timer restart
    },

    // Clear processed context messages
    clearProcessedContextMessages: (state) => {
      state.contextMessages = [];
    },

    // Navigation actions
    jumpToSet: (state, action: PayloadAction<{ targetSetNumber: number; reason: string }>) => {
      const { targetSetNumber, reason } = action.payload;
      const currentExercise = state.activeWorkout!.currentExercise!;
      const targetSetIndex = targetSetNumber - 1;

      // Clear all timers and timing data
      state.timers.setTimer = null;
      state.timers.restTimer = null;
      state.userActivityPingActive = false;

      // Reset all timing data to ensure clean state
      state.activeWorkout!.elapsedTime = 0;
      state.activeWorkout!.totalPauseTime = 0;
      state.activeWorkout!.pauseStartTime = undefined;

      // Update context to target set
      state.activeWorkout!.currentSetIndex = targetSetIndex;
      state.activeWorkout!.currentSet = currentExercise.sets[targetSetIndex];
      state.activeWorkout!.isPaused = false;

      // Transition to preparing state
      state.status = 'preparing';
      state.activeWorkout!.phase = 'preparing';
      state.activeWorkout!.currentPhaseStartTime = new Date();
      
      // Middleware will handle context message generation
    },

    jumpToExercise: (state, action: PayloadAction<{ exerciseSlug: string; reason: string }>) => {
      const { exerciseSlug, reason } = action.payload;
      
      if (!state.workoutEntries || !state.activeWorkout) {
        return;
      }
      
      // Find exercise index by slug
      const exerciseIndex = state.workoutEntries.findIndex(
        entry => entry.exercises?.slug === exerciseSlug
      );
      
      if (exerciseIndex === -1) {
        return; // Exercise not found
      }
      
      // Clear all timers
      state.timers.setTimer = null;
      state.timers.restTimer = null;
      state.userActivityPingActive = false;
      
      // Reset timing data
      state.activeWorkout.elapsedTime = 0;
      state.activeWorkout.totalPauseTime = 0;
      state.activeWorkout.pauseStartTime = undefined;
      
      // Update to target exercise
      state.activeWorkout.currentExerciseIndex = exerciseIndex;
      state.activeWorkout.currentSetIndex = 0;
      state.activeWorkout.isPaused = false;
      
      // Build exercise structure from entry
      const targetEntry = state.workoutEntries[exerciseIndex];
      const parseReps = (repsStr: string): number => {
        const match = repsStr.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 8;
      };
      const parseWeight = (weightStr: string | null | undefined): number | undefined => {
        if (!weightStr) return undefined;
        const match = weightStr.match(/(\d+(?:\.\d+)?)/);
        return match ? parseFloat(match[1]) : undefined;
      };
      const parseTime = (timeStr: string | null | undefined): number | undefined => {
        if (!timeStr) return undefined;
        const match = timeStr.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : undefined;
      };
      const parseRestTime = (notes: string | null | undefined): number => {
        if (!notes) return 90;
        const match = notes.match(/[Rr]est\s+(\d+)/);
        return match ? parseInt(match[1], 10) : 90;
      };
      
      const targetReps = parseReps(targetEntry.reps);
      const targetWeight = parseWeight(targetEntry.weight);
      const targetTime = parseTime(targetEntry.time);
      const restTimeAfter = parseRestTime(targetEntry.notes);
      
      state.activeWorkout.currentExercise = {
        id: targetEntry.exercises?.id || '',
        name: targetEntry.exercises?.name?.replace(/\s*\([^)]*\)/g, '').trim() || '',
        description: targetEntry.exercises?.instructions || '',
        type: 'strength' as const,
        muscleGroups: targetEntry.exercises?.muscle_categories?.filter(Boolean) as string[] || [],
        sets: Array.from({ length: targetEntry.sets }, (_, i) => ({
          id: `${targetEntry.id}-set-${i + 1}`,
          setNumber: i + 1,
          targetReps,
          targetWeight,
          targetTime,
          restTimeAfter,
          isCompleted: false,
        })),
        entryId: targetEntry.id,
        slug: targetEntry.exercises?.slug || '',
        videoUrl: targetEntry.exercises?.slug 
          ? `https://kmtddcpdqkeqipyetwjs.supabase.co/storage/v1/object/public/workouts/processed/${targetEntry.exercises.slug}/${targetEntry.exercises.slug}_cropped_video.mp4`
          : undefined,
        equipment: [],
        instructions: targetEntry.exercises?.instructions?.split(/(?=\(\d+(?:st|nd|rd|th)\))/).filter(Boolean) || [],
        tips: [],
        estimatedDuration: 0,
        repLimitationsProgressionRules: targetEntry.exercises?.rep_limitations_progression_rules,
        progressionByClientFeedback: targetEntry.exercises?.progression_by_client_feedback,
        painInjuryProtocol: targetEntry.exercises?.pain_injury_protocol,
        trainerNotes: targetEntry.exercises?.trainer_notes,
        equipmentText: targetEntry.exercises?.equipment_text,
        iconDescription: targetEntry.exercises?.icon_description,
        videoDescription: targetEntry.exercises?.video_description,
      } as NonNullable<typeof state.activeWorkout>['currentExercise'];
      
      if (state.activeWorkout.currentExercise) {
        state.activeWorkout.currentSet = state.activeWorkout.currentExercise.sets[0];
      }
      
      // Transition to preparing state
      state.status = 'preparing';
      state.activeWorkout.phase = 'preparing';
      state.activeWorkout.currentPhaseStartTime = new Date();
      
      // Middleware will handle context message generation
    },

    jumpToExerciseAndQueueCurrent: (state, action: PayloadAction<{ 
      targetExerciseSlug: string; 
      reason: string;
    }>) => {
      const { targetExerciseSlug, reason } = action.payload;
      
      if (!state.workoutEntries || !state.activeWorkout) {
        return;
      }
      
      const currentIndex = state.activeWorkout.currentExerciseIndex;
      const currentEntry = state.workoutEntries[currentIndex];
      
      if (!currentEntry) {
        console.warn('⚠️ Cannot queue current exercise - current entry not found');
        return;
      }
      
      // Find target exercise index
      const targetIndex = state.workoutEntries.findIndex(
        entry => entry.exercises?.slug === targetExerciseSlug
      );
      
      if (targetIndex === -1) {
        console.warn('⚠️ Target exercise not found:', targetExerciseSlug);
        return;
      }
      
      if (targetIndex === currentIndex) {
        console.warn('⚠️ Cannot queue current exercise to itself');
        return;
      }
      
      // Reorder: Move current exercise to end, shift others forward
      const reordered = [...state.workoutEntries];
      const [movedEntry] = reordered.splice(currentIndex, 1);
      reordered.push(movedEntry);
      
      // Find new index of target exercise after reorder
      const newTargetIndex = reordered.findIndex(
        entry => entry.exercises?.slug === targetExerciseSlug
      );
      
      if (newTargetIndex === -1) {
        console.error('⚠️ Target exercise not found after reorder');
        return;
      }
      
      // Update positions in the reordered array
      reordered.forEach((entry, index) => {
        // Update position property if it exists on the entry object
        // Note: This updates the in-memory object, DB sync will happen via middleware
        if (entry) {
          (entry as any).position = index + 1;
        }
      });
      
      // Update state
      state.workoutEntries = reordered;
      state.activeWorkout.currentExerciseIndex = newTargetIndex;
      
      // Build exercise structure from new target entry (reuse logic from jumpToExercise)
      const targetEntry = reordered[newTargetIndex];
      const parseReps = (repsStr: string): number => {
        const match = repsStr.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 8;
      };
      const parseWeight = (weightStr: string | null | undefined): number | undefined => {
        if (!weightStr) return undefined;
        const match = weightStr.match(/(\d+(?:\.\d+)?)/);
        return match ? parseFloat(match[1]) : undefined;
      };
      const parseTime = (timeStr: string | null | undefined): number | undefined => {
        if (!timeStr) return undefined;
        const match = timeStr.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : undefined;
      };
      const parseRestTime = (notes: string | null | undefined): number => {
        if (!notes) return 90;
        const match = notes.match(/[Rr]est\s+(\d+)/);
        return match ? parseInt(match[1], 10) : 90;
      };
      
      const targetReps = parseReps(targetEntry.reps);
      const targetWeight = parseWeight(targetEntry.weight);
      const targetTime = parseTime(targetEntry.time);
      const restTimeAfter = parseRestTime(targetEntry.notes);
      
      // Restore completed sets from setsCompleted array
      const completedSetsForTarget = state.activeWorkout.setsCompleted.filter(
        (sc) => sc.setId.startsWith(`${targetEntry.id}-set-`)
      );
      
      // Build sets array with restored completion status
      const sets = Array.from({ length: targetEntry.sets }, (_, i) => {
        const setNumber = i + 1;
        const setId = `${targetEntry.id}-set-${setNumber}`;
        const completedSet = completedSetsForTarget.find(sc => sc.setId === setId);
        
        return {
          id: setId,
          setNumber,
          targetReps,
          targetWeight,
          targetTime,
          restTimeAfter,
          isCompleted: !!completedSet,
          actualReps: completedSet?.performance?.actualReps,
          actualWeight: completedSet?.performance?.actualWeight,
          difficulty: completedSet?.performance?.difficulty,
        };
      });
      
      // Find first incomplete set (or last set if all completed)
      const firstIncompleteSetIndex = sets.findIndex(set => !set.isCompleted);
      const targetSetIndex = firstIncompleteSetIndex !== -1 ? firstIncompleteSetIndex : sets.length - 1;
      
      state.activeWorkout.currentExercise = {
        id: targetEntry.exercises?.id || '',
        name: targetEntry.exercises?.name?.replace(/\s*\([^)]*\)/g, '').trim() || '',
        description: targetEntry.exercises?.instructions || '',
        type: 'strength' as const,
        muscleGroups: targetEntry.exercises?.muscle_categories?.filter(Boolean) as string[] || [],
        sets,
        entryId: targetEntry.id,
        slug: targetEntry.exercises?.slug || '',
        videoUrl: targetEntry.exercises?.slug 
          ? `https://kmtddcpdqkeqipyetwjs.supabase.co/storage/v1/object/public/workouts/processed/${targetEntry.exercises.slug}/${targetEntry.exercises.slug}_cropped_video.mp4`
          : undefined,
        equipment: [],
        instructions: targetEntry.exercises?.instructions?.split(/(?=\(\d+(?:st|nd|rd|th)\))/).filter(Boolean) || [],
        tips: [],
        estimatedDuration: 0,
        repLimitationsProgressionRules: targetEntry.exercises?.rep_limitations_progression_rules,
        progressionByClientFeedback: targetEntry.exercises?.progression_by_client_feedback,
        painInjuryProtocol: targetEntry.exercises?.pain_injury_protocol,
        trainerNotes: targetEntry.exercises?.trainer_notes,
        equipmentText: targetEntry.exercises?.equipment_text,
        iconDescription: targetEntry.exercises?.icon_description,
        videoDescription: targetEntry.exercises?.video_description,
      } as NonNullable<typeof state.activeWorkout>['currentExercise'];
      
      // Set current set index to first incomplete set (or last set if all completed)
      state.activeWorkout.currentSetIndex = targetSetIndex;
      
      if (state.activeWorkout.currentExercise && sets[targetSetIndex]) {
        state.activeWorkout.currentSet = sets[targetSetIndex];
      }
      
      // Determine status based on progress
      const currentSet = sets[targetSetIndex];
      const isAllSetsCompleted = sets.every(set => set.isCompleted);
      const isLastSet = targetSetIndex === sets.length - 1;
      const wasCurrentSetCompleted = currentSet?.isCompleted;
      
      // Clear all timers initially (will be restored if needed)
      state.timers.setTimer = null;
      state.timers.restTimer = null;
      state.userActivityPingActive = false;
      
      // Reset timing data (preserve total pause time from workout)
      // Don't reset elapsedTime - it's cumulative for the whole workout
      state.activeWorkout.totalPauseTime = state.activeWorkout.totalPauseTime || 0;
      state.activeWorkout.pauseStartTime = undefined;
      state.activeWorkout.isPaused = true; // Start paused for natural resume
      
      // Determine initial status based on progress
      if (isAllSetsCompleted) {
        // All sets completed - transition to exercise-complete or next exercise
        state.status = 'exercise-transition';
        state.activeWorkout.phase = 'transitioning';
      } else if (wasCurrentSetCompleted && !isLastSet) {
        // Last set was completed, but not the final set - should be in rest
        state.status = 'resting';
        state.activeWorkout.phase = 'resting';
        // Initialize rest timer (will be paused)
        state.timers.restTimer = {
          active: false,
          startTime: Date.now(),
          duration: (currentSet?.restTimeAfter || restTimeAfter) * 1000,
          remaining: (currentSet?.restTimeAfter || restTimeAfter) * 1000,
          isLastSet: false,
        };
      } else {
        // Not completed yet - start at preparing state
        state.status = 'preparing';
        state.activeWorkout.phase = 'preparing';
        state.activeWorkout.exerciseConfirmed = false;
      }
      
      state.activeWorkout.currentPhaseStartTime = new Date();
      
      console.log(`🔄 [Jump & Queue] Moved exercise "${currentEntry.exercises?.name}" to back, jumped to "${targetEntry.exercises?.name}"`);
      
      // Middleware will handle DB sync and context message generation
    },

    previousSet: (state) => {
      const currentSetIndex = state.activeWorkout!.currentSetIndex;
      
      // Clear all timers and timing data
      state.timers.setTimer = null;
      state.timers.restTimer = null;
      state.userActivityPingActive = false;
      
      // Reset timing data
      state.activeWorkout!.elapsedTime = 0;
      state.activeWorkout!.totalPauseTime = 0;
      state.activeWorkout!.pauseStartTime = undefined;
      
      // Update set data
      state.activeWorkout!.currentSetIndex = currentSetIndex - 1;
      state.activeWorkout!.currentSet = state.activeWorkout!.currentExercise!.sets[currentSetIndex - 1];
      state.activeWorkout!.isPaused = false;
      state.status = 'preparing';
      state.activeWorkout!.phase = 'preparing';
      state.activeWorkout!.currentPhaseStartTime = new Date();
    },

    nextSet: (state) => {
      const currentSetIndex = state.activeWorkout!.currentSetIndex;
      
      // Clear all timers and timing data
      state.timers.setTimer = null;
      state.timers.restTimer = null;
      state.userActivityPingActive = false;
      
      // Reset timing data
      state.activeWorkout!.elapsedTime = 0;
      state.activeWorkout!.totalPauseTime = 0;
      state.activeWorkout!.pauseStartTime = undefined;
      
      // Update set data
      state.activeWorkout!.currentSetIndex = currentSetIndex + 1;
      state.activeWorkout!.currentSet = state.activeWorkout!.currentExercise!.sets[currentSetIndex + 1];
      state.activeWorkout!.isPaused = false;
      state.status = 'preparing';
      state.activeWorkout!.phase = 'preparing';
      state.activeWorkout!.currentPhaseStartTime = new Date();
    },

    // Cleanup
    cleanup: (state) => {
      state.timers.setTimer = null;
      state.timers.restTimer = null;
      state.userActivityPingActive = false;
      state.status = 'inactive';
      state.session = null;
      state.activeWorkout = null;
      state.contextMessages = [];
    },

    // Context message actions for middleware
    addContextMessage: (state, action: PayloadAction<{
      event: string;
      message: string;
      data: any;
    }>) => {
      const { event, message, data } = action.payload;
      state.contextMessages.push({
        event,
        message,
        data,
        timestamp: Date.now(),
        sent: false,
      });
    },

    markContextMessageSent: (state, action: PayloadAction<{ messageIndex: number }>) => {
      const { messageIndex } = action.payload;
      if (state.contextMessages[messageIndex]) {
        state.contextMessages[messageIndex].sent = true;
      }
    },

    // Track ElevenLabs conversation connections/disconnections
    trackConversation: (state, action: PayloadAction<{
      conversationId: string;
      eventType: 'connected' | 'disconnected';
      details?: string;
    }>) => {
      // This action is handled by middleware to sync to database
      // No state changes needed - just tracking for database sync
    },

    // Sync workout entry update from database (called when UpdateWorkoutEntry or SwapExerciseWithAlternative mutation completes)
    syncWorkoutEntryUpdate: (state, action: PayloadAction<{
      entryId: string;
      updates: {
        sets?: number;
        reps?: string;
        weight?: string;
        time?: string;
        notes?: string;
        isAdjusted?: boolean;
        adjustmentReason?: string;
        exerciseId?: string;
        exerciseData?: any; // Exercise object from mutation response
      };
    }>) => {
      const { entryId, updates } = action.payload;
      
      if (!state.workoutEntries || state.workoutEntries.length === 0) {
        return;
      }
      
      // Find and update the entry in workoutEntries array
      const entryIndex = state.workoutEntries.findIndex(entry => entry.id === entryId);
      if (entryIndex === -1) {
        return;
      }
      
      const entry = state.workoutEntries[entryIndex];
      const oldExerciseId = entry.exercise_id;
      const exerciseChanged = updates.exerciseId !== undefined && updates.exerciseId !== oldExerciseId;
      
      // Handle exercise swap (exerciseId change) - update entry first
      if (exerciseChanged && updates.exerciseId && updates.exerciseData) {
        entry.exercise_id = updates.exerciseId;
        entry.exercises = updates.exerciseData;
        console.log('🔄 Exercise swapped in workout entry:', {
          entryId,
          oldExerciseId,
          newExerciseId: updates.exerciseId,
          newExerciseName: updates.exerciseData?.name,
        });
      }
      
      // Update entry fields (these come from fresh GetWorkoutDay refetch after swap)
      // CRITICAL: After swap, updates.reps/time contain fresh data from refetch, not stale nested data
      if (updates.sets !== undefined) entry.sets = updates.sets;
      if (updates.reps !== undefined) entry.reps = updates.reps;
      if (updates.weight !== undefined) entry.weight = updates.weight;
      if (updates.time !== undefined) entry.time = updates.time;
      if (updates.notes !== undefined) entry.notes = updates.notes;
      if (updates.isAdjusted !== undefined) entry.is_adjusted = updates.isAdjusted;
      if (updates.adjustmentReason !== undefined) entry.adjustment_reason = updates.adjustmentReason;
      
      // If this is the current exercise, rebuild the currentExercise object
      const activeWorkout = state.activeWorkout;
      const currentExercise = activeWorkout?.currentExercise;
      const isCurrentExercise = activeWorkout && activeWorkout.currentExerciseIndex === entryIndex;
      
      if (isCurrentExercise) {
        const parseReps = (repsStr: string): number => {
          const match = repsStr.match(/(\d+)/);
          return match ? parseInt(match[1], 10) : 8;
        };
        const parseWeight = (weightStr: string | null | undefined): number | undefined => {
          if (!weightStr) return undefined;
          const match = weightStr.match(/(\d+(?:\.\d+)?)/);
          return match ? parseFloat(match[1]) : undefined;
        };
        const parseTime = (timeStr: string | null | undefined): number | undefined => {
          if (!timeStr) return undefined;
          const match = timeStr.match(/(\d+)/);
          return match ? parseInt(match[1], 10) : undefined;
        };
        const parseRestTime = (notes: string | null | undefined): number => {
          if (!notes) return 90;
          const match = notes.match(/[Rr]est\s+(\d+)/);
          return match ? parseInt(match[1], 10) : 90;
        };
        
        // CRITICAL: entry.reps/time are now fresh after updates applied above
        // After swap, these come from GetWorkoutDay refetch, ensuring correct values for new exercise
        const targetReps = parseReps(entry.reps);
        const targetWeight = parseWeight(entry.weight);
        const targetTime = parseTime(entry.time);
        const restTimeAfter = parseRestTime(entry.notes);
        
        // Preserve old sets data for completion status
        const oldSets = currentExercise?.sets || [];
        const currentSetIndex = activeWorkout.currentSetIndex;
        
        // If exercise changed, rebuild entire currentExercise object
        if (exerciseChanged && entry.exercises) {
          const exercise = entry.exercises;
          console.log('🔄 Rebuilding currentExercise after swap:', {
            oldExerciseId: currentExercise?.id,
            newExerciseId: entry.exercise_id,
            newExerciseName: exercise.name,
            entryExerciseId: entry.exercise_id,
          });
          
          // Create a completely new object to ensure reference changes
          const newCurrentExercise = {
            id: entry.exercise_id,
            name: exercise.name.replace(/\s*\([^)]*\)/g, '').trim(),
            description: exercise.instructions,
            type: 'strength' as const,
            muscleGroups: exercise.muscle_categories?.filter(Boolean) as string[] || [],
            sets: Array.from({ length: entry.sets }, (_, i) => ({
              id: `${entry.id}-set-${i + 1}`,
              setNumber: i + 1,
              targetReps,
              targetWeight,
              targetTime,
              restTimeAfter,
              isCompleted: oldSets[i]?.isCompleted || false,
              actualReps: oldSets[i]?.actualReps,
              actualWeight: oldSets[i]?.actualWeight,
            })),
            videoUrl: exercise.slug 
              ? `https://kmtddcpdqkeqipyetwjs.supabase.co/storage/v1/object/public/workouts/processed/${exercise.slug}/${exercise.slug}_cropped_video.mp4`
              : undefined,
            equipment: [],
            instructions: exercise.instructions.split(/(?=\(\d+(?:st|nd|rd|th)\))/).filter(Boolean),
            tips: [],
            estimatedDuration: 0,
            repLimitationsProgressionRules: exercise.rep_limitations_progression_rules,
            progressionByClientFeedback: exercise.progression_by_client_feedback,
            painInjuryProtocol: exercise.pain_injury_protocol,
            trainerNotes: exercise.trainer_notes,
            equipmentText: exercise.equipment_text,
            iconDescription: exercise.icon_description,
            videoDescription: exercise.video_description,
          } as NonNullable<typeof state.activeWorkout>['currentExercise'];
          
          // Assign the new object (Immer will handle immutability)
          activeWorkout.currentExercise = newCurrentExercise;
          
          // Log after assignment to verify it worked
          const assignedExercise = activeWorkout.currentExercise;
          if (assignedExercise) {
            console.log('✅ Created new currentExercise object:', {
              exerciseId: assignedExercise.id,
              exerciseName: assignedExercise.name,
              videoUrl: assignedExercise.videoUrl,
              objectReference: 'new',
              matchesEntry: assignedExercise.id === entry.exercise_id,
            });
          }
        } else if (currentExercise) {
          console.log('⚠️ Exercise did NOT change, only updating sets:', {
            exerciseId: currentExercise.id,
            exerciseName: currentExercise.name,
            exerciseChanged,
            entryExerciseId: entry.exercise_id,
            hasExercises: !!entry.exercises,
          });
          
          // Just rebuild sets array with updated values, preserving completion status
          currentExercise.sets = Array.from({ length: entry.sets }, (_, i) => ({
            id: `${entry.id}-set-${i + 1}`,
            setNumber: i + 1,
            targetReps,
            targetWeight,
            targetTime,
            restTimeAfter,
            isCompleted: oldSets[i]?.isCompleted || false,
            actualReps: oldSets[i]?.actualReps,
            actualWeight: oldSets[i]?.actualWeight,
          }));
        }
        
        // Update current set reference
        const updatedExercise = activeWorkout.currentExercise;
        if (updatedExercise && updatedExercise.sets[currentSetIndex]) {
          activeWorkout.currentSet = updatedExercise.sets[currentSetIndex];
        }
        
        console.log('✅ Final currentExercise state:', {
          exerciseId: updatedExercise?.id,
          exerciseName: updatedExercise?.name,
          setsCount: updatedExercise?.sets.length,
          entryExerciseId: entry.exercise_id,
          match: updatedExercise?.id === entry.exercise_id,
        });
      }
    },

    // Warmup phase actions
    startWarmup: (state) => {
      if (state.warmup.phase !== 'ready') {
        console.warn('⚠️ Cannot start warmup from phase:', state.warmup.phase);
        return;
      }
      
      state.warmup.phase = 'active';
      state.warmup.startTime = Date.now();
      state.warmup.remaining = state.warmup.duration;
      
      console.log('🔥 [Warmup] Started - 10 minute timer active');
      // Middleware will handle timer updates
    },

    updateWarmupTimer: (state, action: PayloadAction<number>) => {
      state.warmup.remaining = action.payload;
    },

    completeWarmup: (state) => {
      if (state.warmup.phase !== 'active') {
        console.warn('⚠️ Cannot complete warmup from phase:', state.warmup.phase);
        return;
      }
      
      state.warmup.phase = 'completed';
      state.warmup.remaining = 0;
      
      console.log('✅ [Warmup] Completed - transitioning to preparing');
      // Middleware will handle transition to preparing state
    },

    skipWarmup: (state) => {
      if (state.warmup.phase !== 'ready' && state.warmup.phase !== 'active') {
        console.warn('⚠️ Cannot skip warmup from phase:', state.warmup.phase);
        return;
      }
      
      state.warmup.phase = 'completed';
      state.warmup.remaining = 0;
      
      console.log('⏭️ [Warmup] Skipped - transitioning to preparing');
      // Middleware will handle transition to preparing state
    },

    pauseWarmup: (state) => {
      if (state.warmup.phase !== 'active') {
        console.warn('⚠️ Cannot pause warmup from phase:', state.warmup.phase);
        return;
      }
      
      // Timer will be paused in middleware
      console.log('⏸️ [Warmup] Paused');
    },

    resumeWarmup: (state) => {
      if (state.warmup.phase !== 'active') {
        console.warn('⚠️ Cannot resume warmup from phase:', state.warmup.phase);
        return;
      }
      
      // Timer will be resumed in middleware
      console.log('▶️ [Warmup] Resumed');
    },
  },
});

// Export actions
export const {
  selectWorkout,
  selectWorkoutFromEntries,
  resumeWorkoutFromSession,
  startExercisePreparation,
  confirmReadyAndStartSet,
  completeSet,
  startRest,
  triggerRestEnding,
  completeExercise,
  completeWorkout,
  finishWorkoutEarly,
  setVoiceAgentStatus,
  updateSetTimer,
  updateRestTimer,
  setTimerExpired,
  restTimerExpired,
  pauseSet,
  resumeSet,
  adjustWeight,
  adjustReps,
  adjustRestTime,
  extendRest,
  jumpToSet,
  jumpToExercise,
  previousSet,
  nextSet,
  clearProcessedContextMessages,
  addContextMessage,
  markContextMessageSent,
  trackConversation,
  syncWorkoutEntryUpdate,
  cleanup,
  jumpToExerciseAndQueueCurrent,
  // Warmup actions
  startWarmup,
  updateWarmupTimer,
  completeWarmup,
  skipWarmup,
  pauseWarmup,
  resumeWarmup,
} = workoutSlice.actions;

// Selectors
export const selectWorkoutStatus = (state: { workout: WorkoutState }) => state.workout.status;
export const selectActiveWorkout = (state: { workout: WorkoutState }) => state.workout.activeWorkout;
export const selectWorkoutSession = (state: { workout: WorkoutState }) => state.workout.session;
export const selectSessionId = (state: { workout: WorkoutState }) => state.workout.sessionId; // New selector
export const selectCurrentExercise = (state: { workout: WorkoutState }) => state.workout.activeWorkout?.currentExercise;
export const selectCurrentSet = (state: { workout: WorkoutState }) => state.workout.activeWorkout?.currentSet;
export const selectTimers = (state: { workout: WorkoutState }) => state.workout.timers;
export const selectVoiceAgentStatus = (state: { workout: WorkoutState }) => state.workout.voiceAgent;
export const selectContextMessages = (state: { workout: WorkoutState }) => state.workout.contextMessages;
export const selectUnsentContextMessages = (state: { workout: WorkoutState }) => 
  state.workout.contextMessages.filter(msg => !msg.sent);
export const selectWarmup = (state: { workout: WorkoutState }) => state.workout.warmup; // New warmup selector

// Complex selectors
export const selectWorkoutProgress = createSelector(
  [selectActiveWorkout],
  (activeWorkout) => {
    if (!activeWorkout) return { exerciseProgress: 0, setProgress: 0, overallProgress: 0 };
    
    const exerciseProgress = activeWorkout.currentExerciseIndex / activeWorkout.totalExercises;
    const setProgress = activeWorkout.completedSets / activeWorkout.totalSets;
    const overallProgress = (activeWorkout.completedExercises + (activeWorkout.currentSetIndex / (activeWorkout.currentExercise?.sets.length || 1))) / activeWorkout.totalExercises;
    
    return { exerciseProgress, setProgress, overallProgress };
  }
);

export const selectWorkoutContext = createSelector(
  [selectWorkoutStatus, selectActiveWorkout, selectCurrentExercise, selectCurrentSet, selectTimers],
  (status, activeWorkout, currentExercise, currentSet, timers) => {
    if (!activeWorkout || !currentExercise || !currentSet) return null;
    
    return {
      status,
      sessionId: activeWorkout.sessionId,
      exerciseIndex: activeWorkout.currentExerciseIndex,
      setIndex: activeWorkout.currentSetIndex,
      targetReps: currentSet.targetReps,
      targetWeight: currentSet.targetWeight,
      timeRemaining: timers.restTimer?.remaining ? Math.floor(timers.restTimer.remaining / 1000) : undefined,
      currentExercise,
      currentSet,
      isPaused: activeWorkout.isPaused,
      elapsedTime: activeWorkout.elapsedTime,
    };
  }
);

export default workoutSlice.reducer;
