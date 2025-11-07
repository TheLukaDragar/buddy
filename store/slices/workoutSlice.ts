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

        // Middleware will handle context message generation
      },
      prepare: (workoutEntries: WorkoutEntryNode[], planId: string, dayName: string, sessionId: string) => ({
        payload: { workoutEntries, planId, dayName, sessionId, timestamp: Date.now() }
      })
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

        // Clear set timer
        state.timers.setTimer = null;
        state.userActivityPingActive = false;

        // Update set data
        state.activeWorkout!.currentSet!.actualReps = actualReps || state.activeWorkout!.currentSet!.targetReps;
        state.activeWorkout!.currentSet!.isCompleted = true;

        // Reset pause state
        state.activeWorkout!.isPaused = false;
        state.activeWorkout!.totalPauseTime = 0;

        state.status = 'set-complete';
        state.activeWorkout!.phase = 'resting';
        state.activeWorkout!.completedSets++;

        // Add to completed sets tracking
        state.activeWorkout!.setsCompleted.push({
          exerciseId: state.activeWorkout!.currentExercise!.id,
          setId: state.activeWorkout!.currentSet!.id,
          performance: {
            actualReps: state.activeWorkout!.currentSet!.actualReps,
            actualWeight: state.activeWorkout!.currentSet!.actualWeight,
            difficulty: state.activeWorkout!.currentSet!.difficulty,
          },
        });

        // Middleware will handle context message generation


      },
      prepare: (actualReps?: number) => ({
        payload: { actualReps, timestamp: Date.now() }
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

      // Check if workout is complete
      if (state.activeWorkout!.currentExerciseIndex >= totalExercises - 1) {
        // Workout is complete - transition to workout-completed state (final state)
        state.status = 'workout-completed';
        state.activeWorkout!.completedExercises++;
        
        // Middleware will handle context message generation
        return;
      }

      // Move to next exercise
      state.activeWorkout!.currentExerciseIndex++;
      state.activeWorkout!.currentSetIndex = 0;
      state.activeWorkout!.completedExercises++;

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

      const workoutSummary = {
        sessionName: workoutName,
        totalTime: Date.now() - state.activeWorkout!.startTime.getTime(),
        completedExercises: state.activeWorkout!.completedExercises,
        totalExercises: state.activeWorkout!.totalExercises,
        completedSets: state.activeWorkout!.completedSets,
        totalSets: state.activeWorkout!.totalSets,
        setsCompleted: state.activeWorkout!.setsCompleted,
        adjustmentsMade: state.activeWorkout!.adjustmentsMade,
        isFullyCompleted: false,
        finishedEarly: true,
        currentExercise: state.activeWorkout!.currentExercise?.name,
        currentSet: state.activeWorkout!.currentSetIndex + 1,
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
      if (state.timers.setTimer) {
        state.timers.setTimer.remaining = action.payload.remaining;
      }
      if (state.activeWorkout) {
        state.activeWorkout.elapsedTime = action.payload.elapsed;
        state.activeWorkout.exactSeconds = Math.floor(action.payload.elapsed / 1000);
      }
    },

    updateRestTimer: (state, action: PayloadAction<{ remaining: number; elapsed: number }>) => {
      if (state.timers.restTimer) {
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
        // Rest timer fully expired - auto-advance to preparing state (middleware handles isLastSet)
        state.timers.restTimer = null;
        
        if (state.activeWorkout) {
          // Advance to next set
          state.activeWorkout.currentSetIndex++;
          if (state.activeWorkout.currentExercise) {
            state.activeWorkout.currentSet = state.activeWorkout.currentExercise.sets[state.activeWorkout.currentSetIndex];
          }
          
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
      
      state.activeWorkout.currentSet = state.activeWorkout.currentExercise.sets[0];
      
      // Transition to preparing state
      state.status = 'preparing';
      state.activeWorkout.phase = 'preparing';
      state.activeWorkout.currentPhaseStartTime = new Date();
      
      // Middleware will handle context message generation
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
  },
});

// Export actions
export const {
  selectWorkout,
  selectWorkoutFromEntries,
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
