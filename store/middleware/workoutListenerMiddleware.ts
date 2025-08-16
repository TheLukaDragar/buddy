import { createListenerMiddleware, isAnyOf, type TypedStartListening } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '../index';
import {
    adjustRestTime,
    clearProcessedSystemUpdates,
    completeExercise,
    completeSet,
    completeWorkout,
    confirmReadyAndStartSet,
    contextSyncCompleted,
    finishWorkoutEarly,
    jumpToSet,
    nextSet,
    pauseSet,
    previousSet,
    restTimerExpired,
    resumeSet,
    selectWorkout,
    setTimerExpired,
    setVoiceAgentStatus,
    startRest,
    triggerRestEnding,
    updateRestTimer,
    updateSetTimer,
} from '../slices/workoutSlice';

// Create the listener middleware with proper typing
const workoutListenerMiddleware = createListenerMiddleware();

// Create typed versions of the start listening function
type AppStartListening = TypedStartListening<RootState, AppDispatch>;
const startAppListening = workoutListenerMiddleware.startListening.withTypes<RootState, AppDispatch>();

// Timer management (using number type for React Native compatibility)
let activeTimers: {
  setTimer?: ReturnType<typeof setTimeout>;
  restTimer?: ReturnType<typeof setTimeout>;
  userActivityPing?: ReturnType<typeof setTimeout>;
  setUpdateInterval?: ReturnType<typeof setInterval>;
  restUpdateInterval?: ReturnType<typeof setInterval>;
} = {};

// Helper to clear all timers
const clearAllTimers = () => {
  Object.entries(activeTimers).forEach(([key, timer]) => {
    if (timer) {
      if (key.includes('Interval')) {
        clearInterval(timer as ReturnType<typeof setInterval>);
      } else {
        clearTimeout(timer as ReturnType<typeof setTimeout>);
      }
    }
  });
  activeTimers = {};
};

// Helper to start timer updates - Clean countdown implementation
const startTimerUpdates = (
  _originalStartTime: number, // Ignored - we use our own timing
  duration: number,
  type: 'set' | 'rest',
  dispatch: any
) => {
  const intervalKey = type === 'set' ? 'setUpdateInterval' : 'restUpdateInterval';
  const updateAction = type === 'set' ? updateSetTimer : updateRestTimer;
  const expiredAction = type === 'set' ? setTimerExpired : restTimerExpired;

  // Clear existing interval
  if (activeTimers[intervalKey]) {
    clearInterval(activeTimers[intervalKey]);
  }

  // Convert duration to seconds for clean countdown
  const totalSeconds = Math.floor(duration / 1000);
  let remainingSeconds = totalSeconds;
  const startTime = Date.now();
  
  // Dispatch initial state immediately
  console.log(`${type.toUpperCase()} TIMER UPDATE:`, {
    elapsed: 0,
    remaining: remainingSeconds,
    duration: totalSeconds
  });
  dispatch(updateAction({ 
    remaining: remainingSeconds * 1000, 
    elapsed: 0 
  }));

  // Start countdown timer
  activeTimers[intervalKey] = setInterval(() => {
    const elapsedMs = Date.now() - startTime;
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    
    // Calculate remaining based on elapsed seconds
    remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
    
    console.log(`${type.toUpperCase()} TIMER UPDATE:`, {
      elapsed: elapsedSeconds,
      remaining: remainingSeconds,
      duration: totalSeconds
    });
    
    dispatch(updateAction({ 
      remaining: remainingSeconds * 1000,
      elapsed: elapsedMs 
    }));
    
    // Check if timer expired
    if (remainingSeconds <= 0) {
      clearInterval(activeTimers[intervalKey]);
      delete activeTimers[intervalKey];
      dispatch(expiredAction());
    }
  }, 1000);
};

// Helper to start user activity ping
const startUserActivityPing = () => {
  const ping = () => {
    // This would call the user activity callback if available
    // For now, we'll just log it
    console.log('🏃 [Workout Middleware] User activity ping');
    
    activeTimers.userActivityPing = setTimeout(ping, 30000) as ReturnType<typeof setTimeout>;
  };
  
  activeTimers.userActivityPing = setTimeout(ping, 30000) as ReturnType<typeof setTimeout>;
};

const stopUserActivityPing = () => {
  if (activeTimers.userActivityPing) {
    clearTimeout(activeTimers.userActivityPing);
    delete activeTimers.userActivityPing;
  }
};

// Listener for workout selection
startAppListening({
  actionCreator: selectWorkout,
  effect: async (action, listenerApi) => {
    const { dispatch } = listenerApi;
    
    console.log('🏋️ [Workout Middleware] Workout selected, starting preparation');
    
    // Auto-transition to preparation after brief delay
    setTimeout(() => {
      dispatch({ type: 'workout/startExercisePreparation' });
    }, 1000);
  },
});

// Listener for exercise preparation - ensure clean timer state
startAppListening({
  type: 'workout/startExercisePreparation',
  effect: async (action, listenerApi) => {
    console.log('🧹 [Workout Middleware] Starting exercise preparation - clearing rest timers');
    
    // Clear any lingering rest timer intervals
    if (activeTimers.restUpdateInterval) {
      clearInterval(activeTimers.restUpdateInterval);
      delete activeTimers.restUpdateInterval;
    }
    if (activeTimers.restTimer) {
      clearTimeout(activeTimers.restTimer);
      delete activeTimers.restTimer;
    }
  },
});

// Listener for set start - handles timer setup
startAppListening({
  actionCreator: confirmReadyAndStartSet,
  effect: async (action, listenerApi) => {
    const { dispatch, getState } = listenerApi;
    const state = getState() as RootState;
    const workoutState = state.workout;
    
    // Clear any existing rest timer intervals when starting a new set
    if (activeTimers.restUpdateInterval) {
      console.log('🧹 [Workout Middleware] Clearing rest timer interval for new set');
      clearInterval(activeTimers.restUpdateInterval);
      delete activeTimers.restUpdateInterval;
    }
    if (activeTimers.restTimer) {
      clearTimeout(activeTimers.restTimer);
      delete activeTimers.restTimer;
    }
    
    if (!workoutState.timers.setTimer || !workoutState.activeWorkout) return;
    
    const { startTime, duration } = workoutState.timers.setTimer;
    
    console.log('⏰ [Workout Middleware] Starting set timer:', duration / 1000, 'seconds');
    
    // Start timer updates
    startTimerUpdates(startTime, duration, 'set', dispatch);
    
    // Start user activity ping
    startUserActivityPing();
    
    // Don't auto-transition to rest - let the slice handle it
    // setTimeout(() => {
    //   dispatch(startRest());
    // }, 500);
  },
});

// Listener for set completion - cleanup timers
startAppListening({
  actionCreator: completeSet,
  effect: async (action, listenerApi) => {
    const { dispatch } = listenerApi;
    
    console.log('✅ [Workout Middleware] Set completed, clearing timers');
    
    // Clear set timer updates
    if (activeTimers.setUpdateInterval) {
      clearInterval(activeTimers.setUpdateInterval);
      delete activeTimers.setUpdateInterval;
    }
    
    // Stop user activity ping
    stopUserActivityPing();
    
    // Play end beep (placeholder - would integrate with actual beep system)
    console.log('🔊 [Workout Middleware] Playing end beep');
    
    // Don't auto-transition to rest - let the slice handle it
    // setTimeout(() => {
    //   dispatch(startRest());
    // }, 500);
  },
});

// Listener for rest start - handles rest timer
startAppListening({
  actionCreator: startRest,
  effect: async (action, listenerApi) => {
    const { dispatch, getState } = listenerApi;
    const state = getState() as RootState;
    const restTimer = state.workout.timers.restTimer;
    
    if (!restTimer) return;
    
    const { startTime, duration, isLastSet } = restTimer;
    
    console.log('😴 [Workout Middleware] Starting rest timer:', duration / 1000, 'seconds', isLastSet ? '(last set)' : '');
    
    // Start rest timer updates
    startTimerUpdates(startTime, duration, 'rest', dispatch);
    
    // Set up automatic transition based on whether it's the last set
    if (isLastSet) {
      // For last set, auto-complete exercise after full rest
      activeTimers.restTimer = setTimeout(() => {
        console.log('🏁 [Workout Middleware] Auto-completing exercise (last set)');
        dispatch(completeExercise());
      }, duration) as ReturnType<typeof setTimeout>;
    } else {
      // For non-last sets, trigger rest ending 10 seconds before the end
      const warningTime = Math.max(1000, duration - 10000); // Ensure at least 1 second
      activeTimers.restTimer = setTimeout(() => {
        console.log('⚠️ [Workout Middleware] Triggering 10-second warning (rest ending)');
        dispatch(triggerRestEnding());
      }, warningTime) as ReturnType<typeof setTimeout>;
    }
  },
});

// Listener for rest timer adjustment
startAppListening({
  actionCreator: adjustRestTime,
  effect: async (action, listenerApi) => {
    const { dispatch, getState } = listenerApi;
    const state = getState() as RootState;
    const workoutState = state.workout;
    
    // If currently resting, restart the timer with new duration
    if (['resting', 'rest-ending'].includes(workoutState.status) && workoutState.timers.restTimer) {
      console.log('⏰ [Workout Middleware] Adjusting active rest timer');
      
      // Clear existing rest timer
      if (activeTimers.restTimer) {
        clearTimeout(activeTimers.restTimer);
      }
      if (activeTimers.restUpdateInterval) {
        clearInterval(activeTimers.restUpdateInterval);
      }
      
      // Restart with new duration (from the updated slice state)
      const restTimer = workoutState.timers.restTimer;
      if (restTimer) {
        startTimerUpdates(0, restTimer.remaining, 'rest', dispatch);
        
        // Only set warning timer if we have more than 10 seconds left
        if (restTimer.remaining > 10000) {
          const warningTime = restTimer.remaining - 10000;
          activeTimers.restTimer = setTimeout(() => {
            dispatch(triggerRestEnding());
          }, warningTime) as ReturnType<typeof setTimeout>;
        }
      }
    }
  },
});

// Listener for pause/resume - handle timer suspension
startAppListening({
  actionCreator: pauseSet,
  effect: async (action, listenerApi) => {
    const { getState } = listenerApi;
    const state = getState() as RootState;
    const currentStatus = state.workout.status;
    
    console.log('⏸️ [Workout Middleware] Pausing timers for state:', currentStatus);
    
    if (currentStatus === 'exercising') {
      // Pause set timer updates
      if (activeTimers.setUpdateInterval) {
        clearInterval(activeTimers.setUpdateInterval);
        delete activeTimers.setUpdateInterval;
      }
    } else if (currentStatus === 'resting' || currentStatus === 'rest-ending') {
      // Pause rest timer updates
      if (activeTimers.restUpdateInterval) {
        clearInterval(activeTimers.restUpdateInterval);
        delete activeTimers.restUpdateInterval;
      }
      // Also pause the main rest timer
      if (activeTimers.restTimer) {
        clearTimeout(activeTimers.restTimer);
        delete activeTimers.restTimer;
      }
    }
    
    stopUserActivityPing();
  },
});

startAppListening({
  actionCreator: resumeSet,
  effect: async (action, listenerApi) => {
    const { dispatch, getState } = listenerApi;
    const state = getState() as RootState;
    const currentStatus = state.workout.status;
    
    console.log('▶️ [Workout Middleware] Resuming timers for state:', currentStatus);
    
    if (currentStatus === 'exercising') {
      const setTimer = state.workout.timers.setTimer;
      if (!setTimer) return;
      
      // Resume with remaining time
      startTimerUpdates(0, setTimer.remaining, 'set', dispatch);
      startUserActivityPing();
      
    } else if (currentStatus === 'resting' || currentStatus === 'rest-ending') {
      const restTimer = state.workout.timers.restTimer;
      if (!restTimer) return;
      
      // Resume with remaining time
      startTimerUpdates(0, restTimer.remaining, 'rest', dispatch);
      
      // Restart main rest timer if needed (with 10-second warning)
      if (restTimer.remaining > 10000 && currentStatus === 'resting') {
        const warningTime = restTimer.remaining - 10000;
        activeTimers.restTimer = setTimeout(() => {
          dispatch(triggerRestEnding());
        }, warningTime) as ReturnType<typeof setTimeout>;
      }
    }
  },
});

// Listener for voice agent connection - handle context sync
startAppListening({
  actionCreator: setVoiceAgentStatus,
  effect: async (action, listenerApi) => {
    const { dispatch, getState } = listenerApi;
    const connected = action.payload;
    
    if (connected) {
      const state = getState() as RootState;
      const workoutState = state.workout;
      
      if (workoutState.voiceAgent.needsContextSync && workoutState.activeWorkout) {
        console.log('🎙️ [Workout Middleware] Voice agent connected, syncing context');
        
        // Build context sync message
        const context = workoutState.activeWorkout;
        const currentExercise = context.currentExercise;
        const currentSet = context.currentSet;
        
        if (currentExercise && currentSet) {
          const setProgress = `${context.currentSetIndex + 1}/${currentExercise.sets.length}`;
          const exerciseProgress = `${context.currentExerciseIndex + 1}/${context.totalExercises}`;
          
          let contextMessage = `CONTEXT SYNC: Currently in "${workoutState.session?.name}" workout. `;
          contextMessage += `Exercise ${exerciseProgress}: "${currentExercise.name}". `;
          contextMessage += `Set ${setProgress} (${currentSet.targetReps} reps`;
          
          if (currentSet.targetWeight) {
            contextMessage += ` at ${currentSet.targetWeight}kg`;
          }
          
          contextMessage += `). State: ${workoutState.status}`;
          
          // Add time information if relevant
          if (workoutState.status === 'exercising') {
            contextMessage += `. Set timer: ${Math.floor((context.elapsedTime || 0) / 1000)}s elapsed`;
            if (context.isPaused) {
              contextMessage += ' (PAUSED)';
            }
          } else if (workoutState.status === 'resting' && workoutState.timers.restTimer) {
            const remaining = Math.floor(workoutState.timers.restTimer.remaining / 1000);
            contextMessage += `. Rest timer: ${remaining}s remaining`;
            if (context.isPaused) {
              contextMessage += ' (PAUSED)';
            }
          }
          
          contextMessage += '. User just connected to voice assistant.';
          
        //   // Send via context manager
        //   workoutContextManager.processSystemUpdate({
        //     type: 'SYSTEM',
        //     event: 'voice-agent-connected',
        //     data: {
        //       contextMessage,
        //       workout: workoutState.session?.name,
        //       exercise: currentExercise.name,
        //       exerciseIndex: context.currentExerciseIndex + 1,
        //       totalExercises: context.totalExercises,
        //       setIndex: context.currentSetIndex + 1,
        //       totalSets: currentExercise.sets.length,
        //       state: workoutState.status,
        //       targetReps: currentSet.targetReps,
        //       targetWeight: currentSet.targetWeight,
        //       isSetCompleted: currentSet.isCompleted,
        //       isPaused: context.isPaused,
        //     },
        //     timestamp: Date.now(),
        //   });
          
          dispatch(contextSyncCompleted());
        }
      }
    }
  },
});

// Listener for system updates - process pending updates (log only, no context manager)
startAppListening({
  matcher: isAnyOf(
    selectWorkout,
    completeSet,
    triggerRestEnding,
    completeExercise,
    completeWorkout,
    finishWorkoutEarly
  ),
  effect: async (action, listenerApi) => {
    const { dispatch, getState } = listenerApi;
    const state = getState() as RootState;
    const pendingUpdates = state.workout.pendingSystemUpdates;
    
    // Process all pending system updates (just log for now)
    for (const update of pendingUpdates) {
      console.log('📤 [Workout Event]', update.event, update.data);
      
      // In the future, this is where we'd integrate with voice agent or analytics
      if (update.event === 'workout-completed' || update.event === 'workout-finished-early') {
        console.log('🎉 [Workout Summary]', {
          duration: Math.round(update.data.totalTime / 1000 / 60 * 10) / 10 + ' minutes',
          completion: update.data.isFullyCompleted ? 'Fully completed' : 'Finished early',
          sets: `${update.data.completedSets}/${update.data.totalSets}`,
          exercises: `${update.data.completedExercises}/${update.data.totalExercises}`
        });
      }
    }
    
    // Clear processed updates
    if (pendingUpdates.length > 0) {
      dispatch(clearProcessedSystemUpdates());
    }
  },
});

// Listener for finish workout early
startAppListening({
  actionCreator: finishWorkoutEarly,
  effect: async (action, listenerApi) => {
    console.log('🏁 [Workout Middleware] Workout finished early');
    clearAllTimers();
    stopUserActivityPing();
    
    // Log workout summary
    const state = listenerApi.getState() as RootState;
    const pendingUpdates = state.workout.pendingSystemUpdates;
    
    const finishUpdate = pendingUpdates.find(update => update.event === 'workout-finished-early');
    if (finishUpdate) {
      console.log('📊 [Workout Summary]', finishUpdate.data);
    }
  },
});

// Listeners for navigation actions - ensure clean timer state
startAppListening({
  matcher: isAnyOf(jumpToSet, previousSet, nextSet),
  effect: async (action, listenerApi) => {
    console.log('🔄 [Workout Middleware] Set navigation - clearing all timers');
    clearAllTimers();
    stopUserActivityPing();
    
    // Log the navigation
    if (jumpToSet.match(action)) {
      console.log('🎯 [Navigation] Jumped to set', action.payload.targetSetNumber);
    } else if (previousSet.match(action)) {
      console.log('⬅️ [Navigation] Previous set');
    } else if (nextSet.match(action)) {
      console.log('➡️ [Navigation] Next set');
    }
  },
});

// Listener for cleanup - clear all timers
startAppListening({
  type: 'workout/cleanup',
  effect: async () => {
    console.log('🧹 [Workout Middleware] Cleaning up all timers');
    clearAllTimers();
    stopUserActivityPing();
  },
});

// Listener for set completion - handle auto rest transition
startAppListening({
  actionCreator: completeSet,
  effect: async (action, listenerApi) => {
    const { dispatch, getState } = listenerApi;
    
    // Wait a brief moment, then start rest if still in set-complete state
    setTimeout(() => {
      const currentState = getState() as RootState;
      if (currentState.workout.status === 'set-complete') {
        console.log('⏰ [Workout Middleware] Auto-starting rest');
        dispatch(startRest());
      }
    }, 500);
  },
});

// Auto-complete exercise/workout listeners
startAppListening({
  type: 'workout/complete-exercise-requested',
  effect: async (action, listenerApi) => {
    const { dispatch } = listenerApi;
    console.log('🏁 [Workout Middleware] Exercise completion requested');
    dispatch(completeExercise());
  },
});

startAppListening({
  type: 'workout/complete-workout-requested',
  effect: async (action, listenerApi) => {
    const { dispatch } = listenerApi;
    console.log('🎉 [Workout Middleware] Workout completion requested');
    dispatch(completeWorkout());
  },
});

// Export the middleware instance
export { workoutListenerMiddleware };

// Export helper functions for external use
export const workoutTimerHelpers = {
  clearAllTimers,
  isSetTimerActive: () => !!activeTimers.setUpdateInterval,
  isRestTimerActive: () => !!activeTimers.restUpdateInterval,
  isUserActivityPingActive: () => !!activeTimers.userActivityPing,
};
