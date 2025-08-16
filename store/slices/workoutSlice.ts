import type { PayloadAction } from '@reduxjs/toolkit';
import { createSelector, createSlice } from '@reduxjs/toolkit';
import { ActiveWorkoutState, WorkoutSession } from '../../types/workout';

// Enhanced workout state with Redux pattern
export interface WorkoutState {
  // Core state
  status: 'inactive' | 'selected' | 'preparing' | 'exercising' | 'set-complete' | 'resting' | 'rest-ending' | 'exercise-transition';
  session: WorkoutSession | null;
  
  // Active workout tracking
  activeWorkout: ActiveWorkoutState | null;
  
  // Timers state (we'll handle actual timers in middleware)
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
  
  // Voice agent integration
  voiceAgent: {
    connected: boolean;
    needsContextSync: boolean;
  };
  
  // UI state
  userActivityPingActive: boolean;
  
  // System events for middleware to handle
  pendingSystemUpdates: Array<{
    event: string;
    data: any;
    timestamp: number;
  }>;
}

const initialState: WorkoutState = {
  status: 'inactive',
  session: null,
  activeWorkout: null,
  timers: {
    setTimer: null,
    restTimer: null,
  },
  voiceAgent: {
    connected: false,
    needsContextSync: false,
  },
  userActivityPingActive: false,
  pendingSystemUpdates: [],
};

// Create the workout slice
const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    // Workout lifecycle actions
    selectWorkout: {
      reducer: (state, action: PayloadAction<{ session: WorkoutSession; timestamp: number }>) => {
        if (state.status !== 'inactive') {
          console.warn('Cannot select workout - already active');
          return;
        }

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

        // Queue system update
        state.pendingSystemUpdates.push({
          event: 'workout-selected',
          data: {
            workoutName: session.name,
            exercises: session.exercises.map(e => e.name),
            currentExercise: session.exercises[0].name,
          },
          timestamp,
        });
      },
      prepare: (session: WorkoutSession) => ({
        payload: { session, timestamp: Date.now() }
      })
    },

    startExercisePreparation: (state) => {
      if (!['selected', 'rest-ending', 'exercise-transition'].includes(state.status)) {
        console.warn('Cannot start preparation from state:', state.status);
        return;
      }

      state.status = 'preparing';
      if (state.activeWorkout) {
        state.activeWorkout.phase = 'preparing';
        state.activeWorkout.currentPhaseStartTime = new Date();
        state.activeWorkout.exerciseConfirmed = false;
        state.activeWorkout.timeRemaining = undefined; // Clear rest timer display
      }

      const timestamp = Date.now();
      state.pendingSystemUpdates.push({
        event: 'exercise-preparation',
        data: {
          exerciseName: state.activeWorkout?.currentExercise?.name,
          setNumber: (state.activeWorkout?.currentSetIndex || 0) + 1,
          targetReps: state.activeWorkout?.currentSet?.targetReps,
          targetWeight: state.activeWorkout?.currentSet?.targetWeight,
        },
        timestamp,
      });
    },

    confirmReadyAndStartSet: (state) => {
      if (!state.activeWorkout || !state.session) return;

      // Handle different states where user can start a set
      const currentSetIndex = state.activeWorkout.currentSetIndex;
      const totalSets = state.activeWorkout.currentExercise?.sets.length || 0;
      const isLastSet = currentSetIndex >= totalSets - 1;

      if (state.status === 'resting') {
        // Clear rest timer
        state.timers.restTimer = null;
        
        if (isLastSet) {
          // User is ready after final set - will complete exercise
          state.pendingSystemUpdates.push({
            event: 'complete-exercise-requested',
            data: {},
            timestamp: Date.now(),
          });
          return;
        } else {
          // User ready during normal rest - advance to next set and go to preparing
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
          
          // Go to preparing state and STOP here - don't start exercising
          state.status = 'preparing';
          state.activeWorkout.phase = 'preparing';
          state.activeWorkout.currentPhaseStartTime = new Date();
          return;
        }
      } else if (state.status === 'rest-ending') {
        // Clear rest timer and advance to next set
        state.timers.restTimer = null;
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
        
        // Go to preparing state and STOP here - don't start exercising
        state.status = 'preparing';
        state.activeWorkout.phase = 'preparing';
        state.activeWorkout.currentPhaseStartTime = new Date();
        return;
      } else if (state.status === 'exercise-transition') {
        // User ready for new exercise - transition to preparing
        state.status = 'preparing';
        state.activeWorkout.phase = 'preparing';
        state.activeWorkout.currentPhaseStartTime = new Date();
        return;
      } else if (state.status !== 'preparing') {
        console.warn('Cannot start set from state:', state.status);
        return;
      }

      // Start the set
      state.status = 'exercising';
      state.activeWorkout.phase = 'exercising';
      state.activeWorkout.isPaused = false;
      state.activeWorkout.totalPauseTime = 0;
      state.activeWorkout.currentPhaseStartTime = new Date();

      const setDuration = state.activeWorkout.currentSet?.targetTime || 45;
      const timestamp = Date.now();

      // Set up set timer
      state.timers.setTimer = {
        active: true,
        startTime: timestamp,
        duration: setDuration * 1000,
        remaining: setDuration * 1000,
      };

      state.userActivityPingActive = true;

      state.pendingSystemUpdates.push({
        event: 'set-started',
        data: {
          setNumber: state.activeWorkout.currentSetIndex + 1,
          targetReps: state.activeWorkout.currentSet?.targetReps,
          duration: setDuration,
        },
        timestamp,
      });
    },

    completeSet: {
      reducer: (state, action: PayloadAction<{ actualReps?: number; timestamp: number }>) => {
        if (state.status !== 'exercising' || !state.activeWorkout) {
          console.warn('Cannot complete set from state:', state.status);
          return;
        }

        const { actualReps, timestamp } = action.payload;

        // Clear set timer
        state.timers.setTimer = null;
        state.userActivityPingActive = false;

        // Update set data
        if (state.activeWorkout.currentSet) {
          state.activeWorkout.currentSet.actualReps = actualReps || state.activeWorkout.currentSet.targetReps;
          state.activeWorkout.currentSet.isCompleted = true;
        }

        // Reset pause state
        state.activeWorkout.isPaused = false;
        state.activeWorkout.totalPauseTime = 0;

        state.status = 'set-complete';
        state.activeWorkout.phase = 'resting';
        state.activeWorkout.completedSets++;

        // Add to completed sets tracking
        if (state.activeWorkout.currentExercise && state.activeWorkout.currentSet) {
          state.activeWorkout.setsCompleted.push({
            exerciseId: state.activeWorkout.currentExercise.id,
            setId: state.activeWorkout.currentSet.id,
            performance: {
              actualReps: state.activeWorkout.currentSet.actualReps,
              actualWeight: state.activeWorkout.currentSet.actualWeight,
              difficulty: state.activeWorkout.currentSet.difficulty,
            },
          });
        }

        state.pendingSystemUpdates.push({
          event: 'set-completed',
          data: {
            setNumber: state.activeWorkout.currentSetIndex + 1,
            actualReps: state.activeWorkout.currentSet?.actualReps,
            targetReps: state.activeWorkout.currentSet?.targetReps,
          },
          timestamp,
        });


      },
      prepare: (actualReps?: number) => ({
        payload: { actualReps, timestamp: Date.now() }
      })
    },

    startRest: (state) => {
      if (state.status !== 'set-complete' || !state.activeWorkout) {
        console.warn('Cannot start rest from state:', state.status);
        return;
      }

      state.status = 'resting';
      const restDuration = state.activeWorkout.currentSet?.restTimeAfter || 60;
      const timestamp = Date.now();

      // Check if this is the last set of the exercise
      const currentSetIndex = state.activeWorkout.currentSetIndex;
      const totalSets = state.activeWorkout.currentExercise?.sets.length || 0;
      const isLastSet = currentSetIndex >= totalSets - 1;

      // Set up rest timer
      state.timers.restTimer = {
        active: true,
        startTime: timestamp,
        duration: restDuration * 1000,
        remaining: restDuration * 1000,
        isLastSet,
      };

      state.pendingSystemUpdates.push({
        event: 'rest-started',
        data: {
          duration: restDuration,
          setJustCompleted: currentSetIndex + 1,
          isLastSet,
          currentSetIndex,
          totalSets,
        },
        timestamp,
      });
    },

    triggerRestEnding: (state) => {
      if (state.status !== 'resting') {
        console.warn('Cannot trigger rest ending from state:', state.status);
        return;
      }

      state.status = 'rest-ending';
      
      // Use actual remaining time instead of hardcoded 10
      const actualTimeRemaining = state.activeWorkout?.timeRemaining || 10;
      
      state.pendingSystemUpdates.push({
        event: 'rest-ending',
        data: {
          timeRemaining: actualTimeRemaining,
          nextSetNumber: (state.activeWorkout?.currentSetIndex || 0) + 2,
        },
        timestamp: Date.now(),
      });
    },

    completeExercise: (state) => {
      if (!state.activeWorkout || !state.session) return;

      // Clear all timers
      state.timers.setTimer = null;
      state.timers.restTimer = null;
      state.userActivityPingActive = false;

      // Check if workout is complete
      if (state.activeWorkout.currentExerciseIndex >= state.session.exercises.length - 1) {
        state.pendingSystemUpdates.push({
          event: 'complete-workout-requested',
          data: {},
          timestamp: Date.now(),
        });
        return;
      }

      // Move to next exercise
      state.activeWorkout.currentExerciseIndex++;
      state.activeWorkout.currentSetIndex = 0;
      state.activeWorkout.completedExercises++;
      state.activeWorkout.currentExercise = state.session.exercises[state.activeWorkout.currentExerciseIndex];
      state.activeWorkout.currentSet = state.activeWorkout.currentExercise.sets[0];

      // Transition to exercise-transition state
      state.status = 'exercise-transition';

      state.pendingSystemUpdates.push({
        event: 'exercise-changed',
        data: {
          newExercise: state.activeWorkout.currentExercise.name,
          exerciseIndex: state.activeWorkout.currentExerciseIndex + 1,
          totalExercises: state.session.exercises.length,
          description: state.activeWorkout.currentExercise.description,
          sets: state.activeWorkout.currentExercise.sets.length,
          targetReps: state.activeWorkout.currentSet.targetReps,
          targetWeight: state.activeWorkout.currentSet.targetWeight,
        },
        timestamp: Date.now(),
      });
    },

    completeWorkout: (state) => {
      if (!state.activeWorkout || !state.session) return;

      // Clear all timers
      state.timers.setTimer = null;
      state.timers.restTimer = null;
      state.userActivityPingActive = false;

      const workoutSummary = {
        sessionName: state.session.name,
        totalTime: Date.now() - state.activeWorkout.startTime.getTime(),
        completedExercises: state.activeWorkout.completedExercises,
        totalExercises: state.activeWorkout.totalExercises,
        completedSets: state.activeWorkout.completedSets,
        totalSets: state.activeWorkout.totalSets,
        setsCompleted: state.activeWorkout.setsCompleted,
        adjustmentsMade: state.activeWorkout.adjustmentsMade,
        isFullyCompleted: state.activeWorkout.completedExercises === state.activeWorkout.totalExercises,
      };

      state.pendingSystemUpdates.push({
        event: 'workout-completed',
        data: workoutSummary,
        timestamp: Date.now(),
      });

      // Reset to inactive state
      state.status = 'inactive';
      state.session = null;
      state.activeWorkout = null;
    },

    finishWorkoutEarly: (state) => {
      if (!state.activeWorkout || !state.session) return;

      // Clear all timers
      state.timers.setTimer = null;
      state.timers.restTimer = null;
      state.userActivityPingActive = false;

      const workoutSummary = {
        sessionName: state.session.name,
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

      state.pendingSystemUpdates.push({
        event: 'workout-finished-early',
        data: workoutSummary,
        timestamp: Date.now(),
      });

      // Reset to inactive state
      state.status = 'inactive';
      state.session = null;
      state.activeWorkout = null;
    },

    // Voice agent integration
    setVoiceAgentStatus: (state, action: PayloadAction<boolean>) => {
      const wasConnected = state.voiceAgent.connected;
      state.voiceAgent.connected = action.payload;
      
      // When agent connects, mark that context sync is needed
      if (action.payload && !wasConnected && state.activeWorkout) {
        state.voiceAgent.needsContextSync = true;
      }
    },

    contextSyncCompleted: (state) => {
      state.voiceAgent.needsContextSync = false;
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
      if (state.status === 'exercising') {
        // Auto-complete the set
        state.timers.setTimer = null;
        state.userActivityPingActive = false;
        
        if (state.activeWorkout?.currentSet) {
          state.activeWorkout.currentSet.isCompleted = true;
        }
        
        state.status = 'set-complete';
        
        state.pendingSystemUpdates.push({
          event: 'set-auto-completed',
          data: {},
          timestamp: Date.now(),
        });
      }
    },

    restTimerExpired: (state) => {
      if (state.status === 'resting' && state.timers.restTimer) {
        const isLastSet = state.timers.restTimer.isLastSet;
        
        if (isLastSet) {
          // Auto-complete exercise
          state.pendingSystemUpdates.push({
            event: 'complete-exercise-requested',
            data: { auto: true },
            timestamp: Date.now(),
          });
        } else {
          // Trigger rest ending
          state.status = 'rest-ending';
          
          // Use actual remaining time instead of hardcoded 10
          const actualTimeRemaining = state.activeWorkout?.timeRemaining || 10;
          
          state.pendingSystemUpdates.push({
            event: 'rest-ending',
            data: {
              timeRemaining: actualTimeRemaining,
              nextSetNumber: (state.activeWorkout?.currentSetIndex || 0) + 2,
            },
            timestamp: Date.now(),
          });
        }
      }
    },

    // Pause/Resume - Works for exercising, resting, and rest-ending states
    pauseSet: (state, action: PayloadAction<{ reason: string }>) => {
      const pauseableStates = ['exercising', 'resting', 'rest-ending'];
      if (!pauseableStates.includes(state.status) || !state.activeWorkout) return;

      state.activeWorkout.isPaused = true;
      state.activeWorkout.pauseStartTime = new Date();
      
      // Pause appropriate timer based on current state
      if (state.status === 'exercising' && state.timers.setTimer) {
        state.timers.setTimer.active = false;
      } else if ((state.status === 'resting' || state.status === 'rest-ending') && state.timers.restTimer) {
        state.timers.restTimer.active = false;
      }
      
      state.userActivityPingActive = false;

      // Send appropriate event based on state
      const eventName = state.status === 'exercising' ? 'set-paused' : 'rest-paused';
      state.pendingSystemUpdates.push({
        event: eventName,
        data: { reason: action.payload.reason, state: state.status },
        timestamp: Date.now(),
      });
    },

    resumeSet: (state) => {
      const resumeableStates = ['exercising', 'resting', 'rest-ending'];
      if (!resumeableStates.includes(state.status) || !state.activeWorkout?.isPaused) return;

      // Calculate pause duration and add to total
      if (state.activeWorkout.pauseStartTime) {
        const pauseDuration = Date.now() - state.activeWorkout.pauseStartTime.getTime();
        state.activeWorkout.totalPauseTime += pauseDuration;
      }

      state.activeWorkout.isPaused = false;
      state.activeWorkout.pauseStartTime = undefined;
      
      // Resume appropriate timer based on current state
      if (state.status === 'exercising' && state.timers.setTimer) {
        state.timers.setTimer.active = true;
      } else if ((state.status === 'resting' || state.status === 'rest-ending') && state.timers.restTimer) {
        state.timers.restTimer.active = true;
      }
      
      state.userActivityPingActive = true;

      // Send appropriate event based on state
      const eventName = state.status === 'exercising' ? 'set-resumed' : 'rest-resumed';
      state.pendingSystemUpdates.push({
        event: eventName,
        data: { state: state.status },
        timestamp: Date.now(),
      });
    },

    // Adjustments
    adjustWeight: (state, action: PayloadAction<{ newWeight: number; reason: string }>) => {
      if (!state.activeWorkout?.currentSet) return;

      const { newWeight, reason } = action.payload;
      const oldWeight = state.activeWorkout.currentSet.targetWeight || 0;
      
      state.activeWorkout.currentSet.targetWeight = newWeight;
      
      state.activeWorkout.adjustmentsMade.push({
        type: 'weight',
        from: oldWeight,
        to: newWeight,
        reason,
        timestamp: new Date(),
      });

      state.pendingSystemUpdates.push({
        event: 'weight-adjusted',
        data: { from: oldWeight, to: newWeight, reason },
        timestamp: Date.now(),
      });
    },

    adjustReps: (state, action: PayloadAction<{ newReps: number; reason: string }>) => {
      if (!state.activeWorkout?.currentSet) return;

      const { newReps, reason } = action.payload;
      const oldReps = state.activeWorkout.currentSet.targetReps;
      
      state.activeWorkout.currentSet.targetReps = newReps;
      
      state.activeWorkout.adjustmentsMade.push({
        type: 'reps',
        from: oldReps,
        to: newReps,
        reason,
        timestamp: new Date(),
      });

      state.pendingSystemUpdates.push({
        event: 'reps-adjusted',
        data: { from: oldReps, to: newReps, reason },
        timestamp: Date.now(),
      });
    },

    adjustRestTime: (state, action: PayloadAction<{ newRestTime: number; reason: string }>) => {
      if (!state.activeWorkout?.currentSet) return;

      const { newRestTime, reason } = action.payload;
      const oldRestTime = state.activeWorkout.currentSet.restTimeAfter || 60;
      
      state.activeWorkout.currentSet.restTimeAfter = newRestTime;
      
      state.activeWorkout.adjustmentsMade.push({
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

      state.pendingSystemUpdates.push({
        event: 'rest-time-adjusted',
        data: { from: oldRestTime, to: newRestTime, reason },
        timestamp: Date.now(),
      });
    },

    // Clear processed system updates
    clearProcessedSystemUpdates: (state) => {
      state.pendingSystemUpdates = [];
    },

    // Navigation actions
    jumpToSet: (state, action: PayloadAction<{ targetSetNumber: number; reason: string }>) => {
      if (!state.activeWorkout?.currentExercise) return;

      const { targetSetNumber, reason } = action.payload;
      const currentExercise = state.activeWorkout.currentExercise;
      const totalSets = currentExercise.sets.length;
      
      // Validate set number (1-based input, convert to 0-based)
      const targetSetIndex = targetSetNumber - 1;
      if (targetSetIndex < 0 || targetSetIndex >= totalSets) {
        return;
      }

      // Clear all timers and timing data
      state.timers.setTimer = null;
      state.timers.restTimer = null;
      state.userActivityPingActive = false;

      // Reset all timing data to ensure clean state
      state.activeWorkout.elapsedTime = 0;
      state.activeWorkout.totalPauseTime = 0;
      state.activeWorkout.pauseStartTime = undefined;

      // Update context to target set
      state.activeWorkout.currentSetIndex = targetSetIndex;
      state.activeWorkout.currentSet = currentExercise.sets[targetSetIndex];
      state.activeWorkout.isPaused = false;

      // Transition to preparing state
      state.status = 'preparing';
      state.activeWorkout.phase = 'preparing';
      state.activeWorkout.currentPhaseStartTime = new Date();
      
      state.pendingSystemUpdates.push({
        event: 'set-jumped',
        data: {
          targetSetNumber,
          exercise: currentExercise.name,
          targetReps: state.activeWorkout.currentSet?.targetReps,
          targetWeight: state.activeWorkout.currentSet?.targetWeight,
          reason,
        },
        timestamp: Date.now(),
      });
    },

    previousSet: (state) => {
      if (!state.activeWorkout?.currentExercise) return;
      
      const currentSetIndex = state.activeWorkout.currentSetIndex;
      if (currentSetIndex > 0) {
        // Clear all timers and timing data
        state.timers.setTimer = null;
        state.timers.restTimer = null;
        state.userActivityPingActive = false;
        
        // Reset timing data
        state.activeWorkout.elapsedTime = 0;
        state.activeWorkout.totalPauseTime = 0;
        state.activeWorkout.pauseStartTime = undefined;
        
        // Update set data
        state.activeWorkout.currentSetIndex = currentSetIndex - 1;
        state.activeWorkout.currentSet = state.activeWorkout.currentExercise.sets[currentSetIndex - 1];
        state.activeWorkout.isPaused = false;
        state.status = 'preparing';
        state.activeWorkout.phase = 'preparing';
        state.activeWorkout.currentPhaseStartTime = new Date();
      }
    },

    nextSet: (state) => {
      if (!state.activeWorkout?.currentExercise) return;
      
      const currentSetIndex = state.activeWorkout.currentSetIndex;
      const totalSets = state.activeWorkout.currentExercise.sets.length;
      
      if (currentSetIndex < totalSets - 1) {
        // Clear all timers and timing data
        state.timers.setTimer = null;
        state.timers.restTimer = null;
        state.userActivityPingActive = false;
        
        // Reset timing data
        state.activeWorkout.elapsedTime = 0;
        state.activeWorkout.totalPauseTime = 0;
        state.activeWorkout.pauseStartTime = undefined;
        
        // Update set data
        state.activeWorkout.currentSetIndex = currentSetIndex + 1;
        state.activeWorkout.currentSet = state.activeWorkout.currentExercise.sets[currentSetIndex + 1];
        state.activeWorkout.isPaused = false;
        state.status = 'preparing';
        state.activeWorkout.phase = 'preparing';
        state.activeWorkout.currentPhaseStartTime = new Date();
      }
    },

    // Cleanup
    cleanup: (state) => {
      state.timers.setTimer = null;
      state.timers.restTimer = null;
      state.userActivityPingActive = false;
      state.status = 'inactive';
      state.session = null;
      state.activeWorkout = null;
      state.pendingSystemUpdates = [];
    },
  },
});

// Export actions
export const {
  selectWorkout,
  startExercisePreparation,
  confirmReadyAndStartSet,
  completeSet,
  startRest,
  triggerRestEnding,
  completeExercise,
  completeWorkout,
  finishWorkoutEarly,
  setVoiceAgentStatus,
  contextSyncCompleted,
  updateSetTimer,
  updateRestTimer,
  setTimerExpired,
  restTimerExpired,
  pauseSet,
  resumeSet,
  adjustWeight,
  adjustReps,
  adjustRestTime,
  jumpToSet,
  previousSet,
  nextSet,
  clearProcessedSystemUpdates,
  cleanup,
} = workoutSlice.actions;

// Selectors
export const selectWorkoutStatus = (state: { workout: WorkoutState }) => state.workout.status;
export const selectActiveWorkout = (state: { workout: WorkoutState }) => state.workout.activeWorkout;
export const selectCurrentExercise = (state: { workout: WorkoutState }) => state.workout.activeWorkout?.currentExercise;
export const selectCurrentSet = (state: { workout: WorkoutState }) => state.workout.activeWorkout?.currentSet;
export const selectTimers = (state: { workout: WorkoutState }) => state.workout.timers;
export const selectVoiceAgentStatus = (state: { workout: WorkoutState }) => state.workout.voiceAgent;
export const selectPendingSystemUpdates = (state: { workout: WorkoutState }) => state.workout.pendingSystemUpdates;

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
