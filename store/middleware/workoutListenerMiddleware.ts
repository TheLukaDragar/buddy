import { createListenerMiddleware, isAnyOf, type TypedStartListening } from '@reduxjs/toolkit';
import { contextBridgeService } from '../../services/contextBridgeService';
import { getMusicStatus } from '../actions/musicActions';
import { getWorkoutStatus } from '../actions/workoutActions';
import { enhancedApi } from '../api/enhancedApi';
import type { AppDispatch, RootState } from '../index';
import {
    addContextMessage,
    adjustReps,
    adjustRestTime,
    adjustWeight,
    clearProcessedContextMessages,
    completeExercise,
    completeSet,
    completeWorkout,
    confirmReadyAndStartSet,
    extendRest,
    finishWorkoutEarly,
    jumpToSet,
    nextSet,
    pauseSet,
    previousSet,
    restTimerExpired,
    resumeSet,
    selectSessionId,
    selectWorkout,
    setTimerExpired,
    setVoiceAgentStatus,
    startExercisePreparation,
    startRest,
    syncWorkoutEntryUpdate,
    trackConversation,
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

// Debounce timers for adjustments to prevent rapid database updates
const adjustmentDebounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
const adjustmentUpdateFunctions: Map<string, () => Promise<void>> = new Map();

// Helper to debounce database updates for adjustments
const debounceAdjustmentUpdate = (
  key: string,
  updateFn: () => Promise<void>,
  delay: number = 800
) => {
  // Clear existing timer for this key
  const existingTimer = adjustmentDebounceTimers.get(key);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }
  
  // Store the update function
  adjustmentUpdateFunctions.set(key, updateFn);
  
  // Set new timer
  const timer = setTimeout(async () => {
    try {
      const fn = adjustmentUpdateFunctions.get(key);
      if (fn) {
        await fn();
      }
    } catch (error) {
      console.error(`Failed to execute debounced update for ${key}:`, error);
    } finally {
      adjustmentDebounceTimers.delete(key);
      adjustmentUpdateFunctions.delete(key);
    }
  }, delay);
  
  adjustmentDebounceTimers.set(key, timer);
};

// Helper to flush all pending debounced updates immediately
const flushPendingAdjustments = async () => {
  const pendingKeys = Array.from(adjustmentDebounceTimers.keys());
  const timers = Array.from(adjustmentDebounceTimers.values());
  const updateFns = Array.from(adjustmentUpdateFunctions.values());
  
  // Clear all timers
  timers.forEach(timer => clearTimeout(timer));
  adjustmentDebounceTimers.clear();
  
  // Execute all pending updates immediately
  if (updateFns.length > 0) {
    console.log(`🔄 Flushing ${updateFns.length} pending adjustment updates immediately...`);
    await Promise.all(updateFns.map(fn => fn().catch(err => {
      console.error('Error executing pending adjustment update:', err);
    })));
    adjustmentUpdateFunctions.clear();
    console.log('✅ All pending adjustments flushed');
  }
};

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
  
  // Clear all debounce timers and update functions
  adjustmentDebounceTimers.forEach((timer) => {
    clearTimeout(timer);
  });
  adjustmentDebounceTimers.clear();
  adjustmentUpdateFunctions.clear();
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
    const { dispatch, getState } = listenerApi;
    const state = getState() as RootState;
    const workoutState = state.workout;
    
    console.log('🏋️ [Workout Middleware] Workout selected, starting preparation');
    
    // Generate context message for workout selection
    if (workoutState.activeWorkout && workoutState.session) {
      const firstExercise = workoutState.activeWorkout.currentExercise?.name || 'Unknown';
      const systemMessage = `SYSTEM: workout-selected - User selected "${workoutState.session.name}" workout. First exercise: ${firstExercise}.`;
      
      dispatch(addContextMessage({
        event: 'workout-selected',
        message: systemMessage,
        data: {
          workoutName: workoutState.session.name,
          exercises: workoutState.session.exercises.map(e => e.name),
          currentExercise: firstExercise,
        },
      }));
      
      contextBridgeService.sendMessage(systemMessage).catch(err => 
        console.log('🎙️ Could not send workout selection message:', err)
      );
    }
    
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
    const { dispatch, getState } = listenerApi;
    const state = getState() as RootState;
    const workoutState = state.workout;
    
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
    
    // Generate context message for exercise preparation
    if (workoutState.activeWorkout?.currentExercise) {
      const currentExercise = workoutState.activeWorkout.currentExercise;
      const setNumber = workoutState.activeWorkout.currentSetIndex + 1;
      const contextMessage = `SYSTEM: exercise-preparation - User ready to learn ${currentExercise.name}, set ${setNumber} preparation phase.`;
      
      dispatch(addContextMessage({
        event: 'exercise-preparation',
        message: contextMessage,
        data: {
          exerciseName: currentExercise.name,
          setNumber,
          targetReps: workoutState.activeWorkout.currentSet?.targetReps,
          targetWeight: workoutState.activeWorkout.currentSet?.targetWeight,
        },
      }));
      
      contextBridgeService.sendContextualUpdate(contextMessage).catch(err => 
        console.log('🎙️ Could not send exercise preparation context:', err)
      );
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
    
    // Generate context message for set started
    if (workoutState.activeWorkout?.currentExercise) {
      const setNumber = workoutState.activeWorkout.currentSetIndex + 1;
      const durationSeconds = Math.floor(duration / 1000);
      const contextMessage = `SYSTEM: set-started - Set ${setNumber} timer active (${durationSeconds}s). User is exercising now.`;
      
      dispatch(addContextMessage({
        event: 'set-started',
        message: contextMessage,
        data: {
          setNumber,
          targetReps: workoutState.activeWorkout.currentSet?.targetReps,
          duration: durationSeconds,
        },
      }));
      
      contextBridgeService.sendContextualUpdate(contextMessage).catch(err => 
        console.log('🎙️ Could not send set started context:', err)
      );
    }
    
    // Don't auto-transition to rest - let the slice handle it
    // setTimeout(() => {
    //   dispatch(startRest());
    // }, 500);
  },
});

// Listener for set timer expiration - dispatch proper completeSet action
startAppListening({
  actionCreator: setTimerExpired,
  effect: async (action, listenerApi) => {
    const { dispatch, getState } = listenerApi;
    const state = getState() as RootState;
    const workoutState = state.workout;
    
    console.log('⏰ [Workout Middleware] Set timer expired');
    
    // Only complete if set wasn't already completed manually
    if (workoutState.activeWorkout?.currentSet && !workoutState.activeWorkout.currentSet.isCompleted) {
      console.log('🎙️ Auto-completing set via proper action dispatch');
      
      // Dispatch the actual completeSet action using target reps (this will trigger the completeSet listener below)
      const targetReps = workoutState.activeWorkout.currentSet?.targetReps || 0;
      dispatch(completeSet(targetReps));
    } else {
      console.log('⏭️ Set already completed manually, skipping auto-completion');
    }
  },
});

// Listener for set completion - cleanup timers
startAppListening({
  actionCreator: completeSet,
  effect: async (action, listenerApi) => {
    const { dispatch, getState } = listenerApi;
    const state = getState() as RootState;
    const workoutState = state.workout;
    
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
    
    // Generate context message for set completion
    if (workoutState.activeWorkout) {
      const setNumber = workoutState.activeWorkout.currentSetIndex + 1;
      const systemMessage = `SYSTEM: set-completed - Set ${setNumber} finished. User needs feedback and next instructions.`;
      
      dispatch(addContextMessage({
        event: 'set-completed',
        message: systemMessage,
        data: {
          setNumber,
          actualReps: workoutState.activeWorkout.currentSet?.actualReps,
          targetReps: workoutState.activeWorkout.currentSet?.targetReps,
        },
      }));
      
      contextBridgeService.sendMessage(systemMessage).catch(err => 
        console.log('🎙️ Could not send set completion message:', err)
      );
    }
    
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
    
    // Generate context message for rest started
    if (state.workout.activeWorkout) {
      const setJustCompleted = state.workout.activeWorkout.currentSetIndex + 1;
      const durationSeconds = Math.floor(duration / 1000);
      const restMessage = `SYSTEM: rest-started - ${durationSeconds}s rest period active after set ${setJustCompleted}`;
      const contextMessage = isLastSet 
        ? `${restMessage}. This is the LAST SET of the exercise, no next set warning will be sent.`
        : `${restMessage}.`;
      
      dispatch(addContextMessage({
        event: 'rest-started',
        message: contextMessage,
        data: {
          duration: durationSeconds,
          setJustCompleted,
          isLastSet,
          currentSetIndex: setJustCompleted - 1,
          totalSets: state.workout.activeWorkout.currentExercise?.sets.length || 0,
        },
      }));
      
      contextBridgeService.sendContextualUpdate(contextMessage).catch(err => 
        console.log('🎙️ Could not send rest started context:', err)
      );
    }
    
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
    
    // Generate context message for rest time adjustment
    const { newRestTime, reason } = action.payload;
    const oldRestTime = workoutState.activeWorkout?.currentSet?.restTimeAfter || 60;
    const currentSetIndex = workoutState.activeWorkout?.currentSetIndex || 0;
    const totalSets = workoutState.activeWorkout?.currentExercise?.sets.length || 0;
    const remainingSets = totalSets - currentSetIndex;
    const contextMessage = `SYSTEM: rest-time-adjusted - Rest time changed from ${oldRestTime}s to ${newRestTime}s for current set and all ${remainingSets} remaining sets. Reason: ${reason}.`;
    
    dispatch(addContextMessage({
      event: 'rest-time-adjusted',
      message: contextMessage,
      data: { from: oldRestTime, to: newRestTime, reason },
    }));
    
    contextBridgeService.sendContextualUpdate(contextMessage).catch(err => 
      console.log('🎙️ Could not send rest adjustment context:', err)
    );
    
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

// Listener for rest extension
startAppListening({
  actionCreator: extendRest,
  effect: async (action, listenerApi) => {
    console.log('🎯 [Middleware] extendRest listener triggered!');
    console.log('🎯 [Middleware] action.payload:', action.payload);
    
    const { dispatch, getState } = listenerApi;
    const state = getState() as RootState;
    const workoutState = state.workout;
    
    // Generate context message for rest extension
    const { additionalSeconds } = action.payload;
    const currentRestRemaining = workoutState.timers.restTimer?.remaining || 0;
    const newTotalTime = currentRestRemaining + (additionalSeconds * 1000);
    const contextMessage = `SYSTEM: rest-extended - Rest time extended by ${additionalSeconds} seconds. Current rest now has ${Math.ceil(newTotalTime / 1000)} seconds remaining.`;
    
    dispatch(addContextMessage({
      event: 'rest-extended',
      message: contextMessage,
      data: { additionalSeconds, newRemaining: Math.ceil(newTotalTime / 1000) },
    }));
    
    contextBridgeService.sendContextualUpdate(contextMessage).catch(err => 
      console.log('🎙️ Could not send rest extension context:', err)
    );
    
    // If currently resting, extend or start the active timer
    if (['resting', 'rest-ending'].includes(workoutState.status)) {
      console.log('⏰ [Workout Middleware] Extending rest timer by', additionalSeconds, 'seconds');
      
      // Clear existing timers first
      if (activeTimers.restTimer) {
        clearTimeout(activeTimers.restTimer);
      }
      if (activeTimers.restUpdateInterval) {
        clearInterval(activeTimers.restUpdateInterval);
      }
      
      // Get updated state after the slice has processed the extension
      const updatedState = getState() as RootState;
      const restTimer = updatedState.workout.timers.restTimer;
      
      if (restTimer) {
        // Start timer updates with the new extended time
        startTimerUpdates(0, restTimer.remaining, 'rest', dispatch);
        
        // Set up warning timer if we have more than 10 seconds left
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

// Listener for weight adjustment
startAppListening({
  actionCreator: adjustWeight,
  effect: async (action, listenerApi) => {
    const { dispatch, getState, getOriginalState } = listenerApi;
    // Generate context message for weight adjustment
    const { newWeight, reason } = action.payload;
    // Get the state BEFORE the reducer updated it
    const originalState = getOriginalState() as RootState;
    const oldWeight = originalState.workout.activeWorkout?.currentSet?.targetWeight || 0;
    const state = getState() as RootState;
    const currentSetIndex = state.workout.activeWorkout?.currentSetIndex || 0;
    const totalSets = state.workout.activeWorkout?.currentExercise?.sets.length || 0;
    const remainingSets = totalSets - currentSetIndex;
    const contextMessage = `SYSTEM: weight-adjusted - Weight changed from ${oldWeight}kg to ${newWeight}kg for current set and all ${remainingSets} remaining sets. Reason: ${reason}.`;
    
    dispatch(addContextMessage({
      event: 'weight-adjusted',
      message: contextMessage,
      data: { from: oldWeight, to: newWeight, reason },
    }));
    
    contextBridgeService.sendContextualUpdate(contextMessage).catch(err => 
      console.log('🎙️ Could not send weight adjustment context:', err)
    );
  },
});

// Listener for reps adjustment  
startAppListening({
  actionCreator: adjustReps,
  effect: async (action, listenerApi) => {
    const { dispatch, getState, getOriginalState } = listenerApi;
    // Generate context message for reps adjustment
    const { newReps, reason } = action.payload;
    // Get the state BEFORE the reducer updated it
    const originalState = getOriginalState() as RootState;
    const oldReps = originalState.workout.activeWorkout?.currentSet?.targetReps || 0;
    const state = getState() as RootState;
    const currentSetIndex = state.workout.activeWorkout?.currentSetIndex || 0;
    const totalSets = state.workout.activeWorkout?.currentExercise?.sets.length || 0;
    const remainingSets = totalSets - currentSetIndex;
    const contextMessage = `SYSTEM: reps-adjusted - Reps changed from ${oldReps} to ${newReps} for current set and all ${remainingSets} remaining sets. Reason: ${reason}.`;
    
    dispatch(addContextMessage({
      event: 'reps-adjusted',
      message: contextMessage,
      data: { from: oldReps, to: newReps, reason },
    }));
    
    contextBridgeService.sendContextualUpdate(contextMessage).catch(err => 
      console.log('🎙️ Could not send reps adjustment context:', err)
    );
  },
});

// Listener for exercise completion
startAppListening({
  actionCreator: completeExercise,
  effect: async (action, listenerApi) => {
    const { dispatch, getState } = listenerApi;
    const state = getState() as RootState;
    const workoutState = state.workout;
    
    // Check if workout is completed
    if (workoutState.status === 'workout-completed') {
      // Clear all active timers when workout completes
      if (activeTimers.restTimer) {
        clearTimeout(activeTimers.restTimer);
        activeTimers.restTimer = undefined;
      }
      if (activeTimers.setTimer) {
        clearTimeout(activeTimers.setTimer);
        activeTimers.setTimer = undefined;
      }
      if (activeTimers.userActivityPing) {
        clearTimeout(activeTimers.userActivityPing);
        activeTimers.userActivityPing = undefined;
      }
      // Clear timer update intervals
      if (activeTimers.restUpdateInterval) {
        clearInterval(activeTimers.restUpdateInterval);
        activeTimers.restUpdateInterval = undefined;
      }
      if (activeTimers.setUpdateInterval) {
        clearInterval(activeTimers.setUpdateInterval);
        activeTimers.setUpdateInterval = undefined;
      }
      
      // Generate context message for workout completion
      const systemMessage = `SYSTEM: workout-completed - User finished entire workout. Call the show_ad tool immediately, then introduce the product naturally.`;
      
      // Get workout summary data
      const workoutSummary = {
        sessionName: workoutState.session?.name || workoutState.dayName || 'Unknown',
        totalTime: workoutState.activeWorkout ? Date.now() - workoutState.activeWorkout.startTime.getTime() : 0,
        completedExercises: workoutState.activeWorkout?.completedExercises || 0,
        totalExercises: workoutState.activeWorkout?.totalExercises || 0,
        completedSets: workoutState.activeWorkout?.completedSets || 0,
        totalSets: workoutState.activeWorkout?.totalSets || 0,
        setsCompleted: workoutState.activeWorkout?.setsCompleted || [],
        adjustmentsMade: workoutState.activeWorkout?.adjustmentsMade || [],
        isFullyCompleted: true,
      };
      
      dispatch(addContextMessage({
        event: 'workout-completed',
        message: systemMessage,
        data: workoutSummary,
      }));
      
      contextBridgeService.sendMessage(systemMessage).catch(err => 
        console.log('🎙️ Could not send workout completion message:', err)
      );
    } else {
      // Generate context message for exercise change
      if (workoutState.activeWorkout?.currentExercise) {
        const newExercise = workoutState.activeWorkout.currentExercise.name;
        const systemMessage = `SYSTEM: exercise-changed - Moving to ${newExercise}. User needs exercise explanation.`;
        
        dispatch(addContextMessage({
          event: 'exercise-changed',
          message: systemMessage,
          data: {
            newExercise,
            exerciseIndex: workoutState.activeWorkout.currentExerciseIndex + 1,
            totalExercises: workoutState.session?.exercises.length || 0,
            description: workoutState.activeWorkout.currentExercise.description,
            sets: workoutState.activeWorkout.currentExercise.sets.length,
            targetReps: workoutState.activeWorkout.currentSet?.targetReps,
            targetWeight: workoutState.activeWorkout.currentSet?.targetWeight,
          },
        }));
        
        contextBridgeService.sendMessage(systemMessage).catch(err => 
          console.log('🎙️ Could not send exercise change message:', err)
        );
      }
    }
  },
});

// Listener for workout completion
startAppListening({
  actionCreator: completeWorkout,
  effect: async (action, listenerApi) => {
    const { dispatch, getState } = listenerApi;
    // Generate context message for workout completion
    const state = getState() as RootState;
    const systemMessage = `SYSTEM: workout-completed - User finished entire workout. Call the show_ad tool immediately, then introduce the product naturally.`;
    
    // Get workout summary data
    const workoutSummary = {
      sessionName: state.workout.session?.name || state.workout.dayName || 'Unknown',
      totalTime: state.workout.activeWorkout ? Date.now() - state.workout.activeWorkout.startTime.getTime() : 0,
      completedExercises: state.workout.activeWorkout?.completedExercises || 0,
      totalExercises: state.workout.activeWorkout?.totalExercises || 0,
      completedSets: state.workout.activeWorkout?.completedSets || 0,
      totalSets: state.workout.activeWorkout?.totalSets || 0,
      setsCompleted: state.workout.activeWorkout?.setsCompleted || [],
      adjustmentsMade: state.workout.activeWorkout?.adjustmentsMade || [],
      isFullyCompleted: true,
    };
    
    dispatch(addContextMessage({
      event: 'workout-completed',
      message: systemMessage,
      data: workoutSummary,
    }));
    
    contextBridgeService.sendMessage(systemMessage).catch(err => 
      console.log('🎙️ Could not send workout completion message:', err)
    );
  },
});

// Listener for pause/resume - handle timer suspension
startAppListening({
  actionCreator: pauseSet,
  effect: async (action, listenerApi) => {
    const { dispatch, getState } = listenerApi;
    const state = getState() as RootState;
    const currentStatus = state.workout.status;
    
    console.log('⏸️ [Workout Middleware] Pausing timers for state:', currentStatus);
    
    // Generate context message for set paused
    const reason = action.payload?.reason || 'User requested pause';
    const eventName = currentStatus === 'exercising' ? 'set-paused' : 'rest-paused';
    const contextMessage = `SYSTEM: ${eventName} - Set paused due to: ${reason}.`;
    
    dispatch(addContextMessage({
      event: eventName,
      message: contextMessage,
      data: { reason, state: currentStatus },
    }));
    
    contextBridgeService.sendContextualUpdate(contextMessage).catch(err => 
      console.log('🎙️ Could not send set paused context:', err)
    );
    
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
    
    // Generate context message for set resumed
    const eventName = currentStatus === 'exercising' ? 'set-resumed' : 'rest-resumed';
    const contextMessage = `SYSTEM: ${eventName} - Set resumed, timer active again.`;
    
    dispatch(addContextMessage({
      event: eventName,
      message: contextMessage,
      data: { state: currentStatus },
    }));
    
    contextBridgeService.sendContextualUpdate(contextMessage).catch(err => 
      console.log('🎙️ Could not send set resumed context:', err)
    );
    
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
      const currentState = getState() as RootState;
      const workoutState = currentState.workout;
      
      // Always send context sync when agent connects (don't check needsContextSync)
      if (workoutState.activeWorkout) {
        console.log('🎙️ [Workout Middleware] Voice agent connected, will sync context in 2s');
        
        // Add delay to allow agent to fully connect
        setTimeout(async () => {
          console.log('🎙️ [Workout Middleware] Sending delayed context sync with status data');
          
          // Get fresh state after delay
          const freshState = getState() as RootState;
          const freshWorkoutState = freshState.workout;
          
          if (!freshWorkoutState.activeWorkout) return;
          
          try {
            // Call existing thunks to get status data
            const workoutStatusResult = await dispatch(getWorkoutStatus());
            const musicStatusResult = await dispatch(getMusicStatus());
            
            // Build context sync message with thunk results
            let contextMessage = `CONTEXT SYNC: All status data included - no need to call get_workout_status or get_music_status tools. if user is just about to start a new exercize call get_exercise_instructions. and follow up `;
            
            if (getWorkoutStatus.fulfilled.match(workoutStatusResult)) {
              const statusData = workoutStatusResult.payload;
              contextMessage += `WORKOUT STATUS: ${statusData.message}`;
              
              if (statusData.data) {
                const data = statusData.data;
                contextMessage += ` | Details: ${data.exerciseName}, Set ${data.setProgress}, State: ${data.status}`;
                if (data.isPaused) {
                  contextMessage += ' (PAUSED)';
                }
              }
            }
            
            // Add music status from thunk result
            if (getMusicStatus.fulfilled.match(musicStatusResult)) {
              const musicData = musicStatusResult.payload;
              contextMessage += `. MUSIC STATUS: Platform ${musicData.platform}`;
              
              if (musicData.platform === 'spotify') {
                if (musicData.isPlaying !== undefined) {
                  contextMessage += `, playback ${musicData.isPlaying ? 'active' : 'paused'}`;
                }
                if (musicData.currentTrack && musicData.artist) {
                  contextMessage += `, currently "${musicData.currentTrack}" by ${musicData.artist}`;
                }
                if (musicData.playlist) {
                  contextMessage += `, playlist "${musicData.playlist}"`;
                }
                if (musicData.volume) {
                  contextMessage += `, volume ${musicData.volume}%`;
                }
              } else if (musicData.platform === 'app') {
                contextMessage += `, playing ${musicData.currentTrack}`;
              }
            } else {
              contextMessage += `. MUSIC STATUS: Unable to get music status`;
            }
            
            contextMessage += '. User just connected to voice assistant. All status data provided above - proceed without calling status tools. respond and sum up what you see';
            
            // Send context sync via voice message service
            contextBridgeService.sendContextualUpdate(contextMessage).then((success) => {
              if (success) {
                console.log('🎙️ [Workout Middleware] Context sync with status data sent successfully');
              } else {
                console.log('🎙️ [Workout Middleware] Context sync failed - voice agent not available');
              }
            });
          } catch (error) {
            console.error('🎙️ [Workout Middleware] Error getting status data for context sync:', error);
            // Fallback to basic context sync without status data
            const basicContextMessage = `CONTEXT SYNC: User connected to voice assistant. Please call get_workout_status and get_music_status tools.`;
            contextBridgeService.sendContextualUpdate(basicContextMessage);
          }
        }, 2000);
      }
    }
  },
});

// Dedicated listener for rest ending trigger
startAppListening({
  actionCreator: triggerRestEnding,
  effect: async (action, listenerApi) => {
    const { dispatch, getState } = listenerApi;
    const state = getState() as RootState;
    const workoutState = state.workout;
    
    // Generate context message for rest ending
    if (workoutState.timers.restTimer) {
      const timeRemaining = Math.floor(workoutState.timers.restTimer.remaining / 1000);
      const restEndingMessage = `SYSTEM: rest-ending - Rest period ending in ${timeRemaining}s. Decide whether to call start_set immediately or to prompt the user for confirmation`;
      
      dispatch(addContextMessage({
        event: 'rest-ending',
        message: restEndingMessage,
        data: {
          timeRemaining,
          nextSetNumber: (workoutState.activeWorkout?.currentSetIndex || 0) + 2,
        },
      }));
      
      // Use smart send - will choose context update if agent is speaking to avoid interruption
      contextBridgeService.sendSmart(restEndingMessage).catch(err => 
        console.log('🎙️ Could not send rest ending message:', err)
      );
    }
  },
});

// Listener for rest timer expiration - prompt agent to start next set
startAppListening({
  actionCreator: restTimerExpired,
  effect: async (action, listenerApi) => {
    const { dispatch, getState } = listenerApi;
    const state = getState() as RootState;
    const workoutState = state.workout;
    
    console.log('😴 [Workout Middleware] Rest timer expired');
    
    // Generate context message for rest complete
    if (workoutState.activeWorkout?.currentExercise) {
      const setNumber = workoutState.activeWorkout.currentSetIndex + 1;
      const totalSets = workoutState.activeWorkout.currentExercise.sets.length;
      
      const systemMessage = `SYSTEM: rest-complete - Rest period finished. User ready for set ${setNumber} of ${totalSets}. Call start_set() immediately or ask user for readiness.`;
      
      dispatch(addContextMessage({
        event: 'rest-complete',
        message: systemMessage,
        data: {
          setNumber,
          totalSets,
          exerciseName: workoutState.activeWorkout.currentExercise.name,
        },
      }));
      
      // Use smart send to avoid interrupting if agent is speaking
      contextBridgeService.sendSmart(systemMessage).catch(err => 
        console.log('🎙️ Could not send rest complete message:', err)
      );
    }
  },
});

// Listener for context messages - log all generated messages
startAppListening({
  matcher: isAnyOf(
    selectWorkout,
    completeSet,
    completeExercise,
    completeWorkout,
    finishWorkoutEarly
  ),
  effect: async (action, listenerApi) => {
    const { dispatch, getState } = listenerApi;
    const state = getState() as RootState;
    const contextMessages = state.workout.contextMessages;
    
    // Process all context messages (just log for now)
    for (const message of contextMessages) {
      if (!message.sent) {
        console.log('📤 [Context Message]', message.event, message.data);
        
        // In the future, this is where we'd integrate with voice agent or analytics
        if (message.event === 'workout-completed' || message.event === 'workout-finished-early') {
          console.log('🎉 [Workout Summary]', {
            duration: Math.round(message.data.totalTime / 1000 / 60 * 10) / 10 + ' minutes',
            completion: message.data.isFullyCompleted ? 'Fully completed' : 'Finished early',
            sets: `${message.data.completedSets}/${message.data.totalSets}`,
            exercises: `${message.data.completedExercises}/${message.data.totalExercises}`
          });
        }
      }
    }
    
    // Don't clear messages - only clear on explicit cleanup
  },
});

// Listener for finish workout early
startAppListening({
  actionCreator: finishWorkoutEarly,
  effect: async (action, listenerApi) => {
    const { dispatch } = listenerApi;
    console.log('🏁 [Workout Middleware] Workout finished early');
    clearAllTimers();
    stopUserActivityPing();
    
    // Log workout summary
    const state = listenerApi.getState() as RootState;
    // Generate context message for early finish instead of reading pendingUpdates
    
    const workoutSummary = {
      sessionName: state.workout.session?.name || state.workout.dayName || 'Unknown',
      totalTime: state.workout.activeWorkout ? Date.now() - state.workout.activeWorkout.startTime.getTime() : 0,
      completedExercises: state.workout.activeWorkout?.completedExercises || 0,
      totalExercises: state.workout.activeWorkout?.totalExercises || 0,
      completedSets: state.workout.activeWorkout?.completedSets || 0,
      totalSets: state.workout.activeWorkout?.totalSets || 0,
      setsCompleted: state.workout.activeWorkout?.setsCompleted || [],
      adjustmentsMade: state.workout.activeWorkout?.adjustmentsMade || [],
      isFullyCompleted: false,
      finishedEarly: true,
      currentExercise: state.workout.activeWorkout?.currentExercise?.name,
      currentSet: (state.workout.activeWorkout?.currentSetIndex || 0) + 1,
    };
    
    dispatch(addContextMessage({
      event: 'workout-finished-early',
      message: 'SYSTEM: workout-finished-early - Workout finished before completion.',
      data: workoutSummary,
    }));
    
    console.log('📊 [Workout Summary]', workoutSummary);
    
    // Clear context messages after logging
    dispatch(clearProcessedContextMessages());
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

// Listener for auto-transition from exercise-transition to preparing
startAppListening({
  actionCreator: completeExercise,
  effect: async (action, listenerApi) => {
    const { dispatch, getState } = listenerApi;
    
    console.log('🔄 [Workout Middleware] Exercise completed, auto-transitioning to preparing in 1s');
    
    // Auto-transition to preparing after 1 second
    setTimeout(() => {
      const currentState = getState() as RootState;
      if (currentState.workout.status === 'exercise-transition') {
        console.log('🚀 [Workout Middleware] Auto-transitioning to preparing state');
        dispatch(startExercisePreparation());
      }
    }, 1000);
  },
});

// Listener for cleanup - clear all timers
startAppListening({
  type: 'workout/cleanup',
  effect: async (action, listenerApi) => {
    const { dispatch } = listenerApi;
    console.log('🧹 [Workout Middleware] Cleaning up all timers');
    clearAllTimers();
    stopUserActivityPing();
    dispatch(clearProcessedContextMessages());
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

// Listener for workout completion - clear system updates after logging
startAppListening({
  actionCreator: completeWorkout,
  effect: async (action, listenerApi) => {
    const { dispatch } = listenerApi;
    console.log('🎉 [Workout Middleware] Workout completed');
    
    // Clear system updates after they've been logged by the general listener
    setTimeout(() => {
      dispatch(clearProcessedContextMessages());
    }, 100);
  },
});

// ============================================================================
// DATABASE SYNC LISTENERS
// ============================================================================
// These listeners sync workout data to the database for persistence
// Note: Mutations will be available after codegen is run

// Listener for set completion - sync to workout_session_sets
startAppListening({
  actionCreator: completeSet,
  effect: async (action, listenerApi) => {
    const { dispatch, getState } = listenerApi;
    const state = getState() as RootState;
    const sessionId = selectSessionId(state);
    
    if (!sessionId || sessionId.startsWith('temp-')) {
      // Skip sync for temporary sessions (backward compatibility)
      return;
    }
    
    const activeWorkout = state.workout.activeWorkout;
    if (!activeWorkout?.currentExercise || !activeWorkout.currentSet) {
      return;
    }
    
    const currentEntry = state.workout.workoutEntries?.[activeWorkout.currentExerciseIndex];
    if (!currentEntry) {
      return;
    }
    
    try {
      // Sync set completion to database
      // Note: This will work once codegen is run and CompleteWorkoutSet mutation is available
      await dispatch(
        enhancedApi.endpoints.CompleteWorkoutSet.initiate({
          sessionId,
          workoutEntryId: currentEntry.id,
          exerciseId: activeWorkout.currentExercise.id,
          setNumber: activeWorkout.currentSetIndex + 1,
          targetReps: activeWorkout.currentSet.targetReps,
          targetWeight: activeWorkout.currentSet.targetWeight || null,
          targetTime: activeWorkout.currentSet.targetTime || null,
          actualReps: activeWorkout.currentSet.actualReps || null,
          actualWeight: activeWorkout.currentSet.actualWeight || null,
          actualTime: null, // Not tracked in Redux state, set to null
          startedAt: null, // Not tracked in Redux state, set to null
        })
      ).unwrap();
      
      console.log('✅ Synced set completion to database');
    } catch (error: any) {
      console.error('Failed to sync set completion to database:', error);
      // Don't throw - allow workout to continue even if sync fails
    }
  },
});

// Listener for reps adjustment - sync to workout_session_adjustments AND workout_entries table
// Debounced to prevent rapid database updates during hold-to-increment
startAppListening({
  actionCreator: adjustReps,
  effect: async (action, listenerApi) => {
    const { dispatch, getState, getOriginalState } = listenerApi;
    const state = getState() as RootState;
    const sessionId = selectSessionId(state);
    
    if (!sessionId || sessionId.startsWith('temp-')) {
      return;
    }
    
    const { newReps, reason } = action.payload;
    const originalState = getOriginalState() as RootState;
    const oldReps = originalState.workout.activeWorkout?.currentSet?.targetReps || 0;
    const activeWorkout = state.workout.activeWorkout;
    const currentEntry = state.workout.workoutEntries?.[activeWorkout?.currentExerciseIndex || 0];
    
    if (!activeWorkout || !currentEntry) {
      return;
    }
    
    // Debounce the database update - only execute after user stops adjusting for 800ms
    const debounceKey = `reps-${currentEntry.id}`;
    debounceAdjustmentUpdate(debounceKey, async () => {
      try {
        // Get latest state at the time of execution
        const latestState = listenerApi.getState() as RootState;
        const latestWorkout = latestState.workout.activeWorkout;
        const latestEntry = latestState.workout.workoutEntries?.[latestWorkout?.currentExerciseIndex || 0];
        
        if (!latestWorkout || !latestEntry) {
          return;
        }
        
        // Use the latest reps value from state
        const latestReps = latestWorkout.currentSet?.targetReps || newReps;
        const repsStr = latestReps.toString();
        
        // Update workout_entry table with new reps value (affects all future sets)
        await dispatch(
          enhancedApi.endpoints.UpdateWorkoutEntry.initiate({
            id: latestEntry.id,
            reps: repsStr,
            isAdjusted: true,
            adjustmentReason: reason || 'User adjusted reps',
          })
        ).unwrap();
        
        // Also log to workout_session_adjustments for tracking
        await dispatch(
          enhancedApi.endpoints.AddWorkoutAdjustment.initiate({
            sessionId,
            type: 'reps',
            workoutEntryId: latestEntry.id,
            exerciseId: latestWorkout.currentExercise?.id,
            fromValue: oldReps.toString(),
            toValue: latestReps.toString(),
            reason: reason || 'User adjusted reps',
            affectedSetNumbers: [latestWorkout.currentSetIndex + 1],
            affectsFutureSets: true,
          })
        ).unwrap();
        
        console.log('✅ Synced reps adjustment to database (workout_entry + session_adjustments)');
      } catch (error: any) {
        console.error('Failed to sync reps adjustment to database:', error);
      }
    }, 800);
  },
});

// Listener for weight adjustment - sync to workout_session_adjustments AND workout_entries table
// Debounced to prevent rapid database updates during hold-to-increment
startAppListening({
  actionCreator: adjustWeight,
  effect: async (action, listenerApi) => {
    const { dispatch, getState, getOriginalState } = listenerApi;
    const state = getState() as RootState;
    const sessionId = selectSessionId(state);
    
    if (!sessionId || sessionId.startsWith('temp-')) {
      return;
    }
    
    const { newWeight, reason } = action.payload;
    const originalState = getOriginalState() as RootState;
    const oldWeight = originalState.workout.activeWorkout?.currentSet?.targetWeight || 0;
    const activeWorkout = state.workout.activeWorkout;
    const currentEntry = state.workout.workoutEntries?.[activeWorkout?.currentExerciseIndex || 0];
    
    if (!activeWorkout || !currentEntry) {
      return;
    }
    
    // Debounce the database update - only execute after user stops adjusting for 800ms
    const debounceKey = `weight-${currentEntry.id}`;
    debounceAdjustmentUpdate(debounceKey, async () => {
      try {
        // Get latest state at the time of execution
        const latestState = listenerApi.getState() as RootState;
        const latestWorkout = latestState.workout.activeWorkout;
        const latestEntry = latestState.workout.workoutEntries?.[latestWorkout?.currentExerciseIndex || 0];
        
        if (!latestWorkout || !latestEntry) {
          return;
        }
        
        // Use the latest weight value from state
        const latestWeight = latestWorkout.currentSet?.targetWeight || newWeight;
        const weightStr = latestWeight.toString() + 'kg';
        
        // Update workout_entry table with new weight value (affects all future sets)
        await dispatch(
          enhancedApi.endpoints.UpdateWorkoutEntry.initiate({
            id: latestEntry.id,
            weight: weightStr,
            isAdjusted: true,
            adjustmentReason: reason || 'User adjusted weight',
          })
        ).unwrap();
        
        // Also log to workout_session_adjustments for tracking
        await dispatch(
          enhancedApi.endpoints.AddWorkoutAdjustment.initiate({
            sessionId,
            type: 'weight',
            workoutEntryId: latestEntry.id,
            exerciseId: latestWorkout.currentExercise?.id,
            fromValue: oldWeight.toString(),
            toValue: latestWeight.toString(),
            reason: reason || 'User adjusted weight',
            affectedSetNumbers: [latestWorkout.currentSetIndex + 1],
            affectsFutureSets: true,
          })
        ).unwrap();
        
        console.log('✅ Synced weight adjustment to database (workout_entry + session_adjustments)');
      } catch (error: any) {
        console.error('Failed to sync weight adjustment to database:', error);
      }
    }, 800);
  },
});

// Listener for UpdateWorkoutEntry mutation completion - sync Redux state from cache
// This ensures that when workout entries are updated (e.g., from adjust modal),
// the Redux state is immediately updated so the active workout screen reflects changes
startAppListening({
  matcher: (action): action is any => {
    return enhancedApi.endpoints.UpdateWorkoutEntry.matchFulfilled(action);
  },
  effect: async (action, listenerApi) => {
    const { dispatch } = listenerApi;
    
    const { id } = action.meta.arg.originalArgs;
    const updatedEntry = action.payload?.updateworkout_entriesCollection?.records?.[0];
    
    if (!updatedEntry) {
      return;
    }
    
    // Dispatch reducer action to update Redux state (handles immutability properly)
    dispatch(syncWorkoutEntryUpdate({
      entryId: id,
      updates: {
        sets: updatedEntry.sets,
        reps: updatedEntry.reps,
        weight: updatedEntry.weight,
        time: updatedEntry.time,
        notes: updatedEntry.notes,
        isAdjusted: updatedEntry.is_adjusted,
        adjustmentReason: updatedEntry.adjustment_reason,
      },
    }));
    
    console.log('✅ Synced workout entry update to Redux state');
  },
});

// Listener for SwapExerciseWithAlternative mutation completion - sync Redux state from cache
// This ensures that when exercises are swapped in the adjust modal,
// the Redux state is immediately updated so the active workout screen reflects the new exercise
startAppListening({
  matcher: (action): action is any => {
    return enhancedApi.endpoints.SwapExerciseWithAlternative.matchFulfilled(action);
  },
  effect: async (action, listenerApi) => {
    const { dispatch, getState } = listenerApi;
    const state = getState() as RootState;
    
    const { workoutEntryId, newExerciseId, alternativeNote } = action.meta.arg.originalArgs;
    const updatedEntry = action.payload?.updateworkout_entriesCollection?.records?.[0];
    
    if (!updatedEntry) {
      return;
    }
    
    // Get workout state to find old exercise name
    const workoutState = state.workout;
    const entryIndex = workoutState.workoutEntries?.findIndex(entry => entry.id === workoutEntryId) ?? -1;
    const oldEntry = entryIndex >= 0 ? workoutState.workoutEntries?.[entryIndex] : null;
    const oldExerciseName = oldEntry?.exercises?.name 
      ? oldEntry.exercises.name.replace(/\s*\([^)]*\)/g, '').trim()
      : 'previous exercise';
    const oldExerciseId = oldEntry?.exercise_id || null;
    
    // CRITICAL: Fetch exercise data separately - NEVER use nested data from mutation response
    let exerciseData;
    try {
      const exerciseResult = await dispatch(
        enhancedApi.endpoints.GetExerciseById.initiate({ id: newExerciseId }, { forceRefetch: true })
      ).unwrap();
      exerciseData = exerciseResult?.exercisesCollection?.edges?.[0]?.node;
      
      if (!exerciseData) {
        console.error(`❌ Failed to fetch exercise ${newExerciseId} after swap`);
        return;
      }
      
      console.log(`✅ Fetched fresh exercise data for swap: ${exerciseData.name}`);
    } catch (error: any) {
      console.error(`❌ Failed to fetch exercise ${newExerciseId} after swap:`, error);
      return;
    }
    
    const newExerciseName = exerciseData.name.replace(/\s*\([^)]*\)/g, '').trim();
    
    console.log('🔄 Swapping exercise in Redux state:', {
      workoutEntryId,
      oldExerciseId: 'will be checked in reducer',
      newExerciseId: updatedEntry.exercise_id,
      newExerciseName,
    });
    
    // CRITICAL: Refetch GetWorkoutDay to get fresh workoutEntries with updated nested data (reps/time)
    // This ensures we have the correct reps/time for the new exercise
    const planId = workoutState.planId;
    const weekNumber = oldEntry?.week_number;
    const day = oldEntry?.day;
    
    if (planId && weekNumber !== undefined && day) {
      try {
        console.log('🔄 Refetching GetWorkoutDay to get fresh workoutEntries after swap...');
        await dispatch(
          enhancedApi.endpoints.GetWorkoutDay.initiate(
            { planId, weekNumber, day },
            { forceRefetch: true }
          )
        ).unwrap();
        console.log('✅ Refetched GetWorkoutDay with fresh workoutEntries');
      } catch (error: any) {
        console.warn('⚠️ Failed to refetch GetWorkoutDay after swap, continuing with current data:', error);
        // Continue anyway - we'll use the exercise data we fetched
      }
    } else {
      console.warn('⚠️ Missing planId/weekNumber/day, cannot refetch GetWorkoutDay');
    }
    
    // Get fresh entry data from state after refetch
    const freshState = listenerApi.getState() as RootState;
    const freshEntry = freshState.workout.workoutEntries?.find(entry => entry.id === workoutEntryId);
    
    // Dispatch reducer action to update Redux state with exercise swap
    // Use fresh entry data if available, otherwise use what we have
    dispatch(syncWorkoutEntryUpdate({
      entryId: workoutEntryId,
      updates: {
        exerciseId: updatedEntry.exercise_id,
        exerciseData: exerciseData, // Use fresh data from GetExerciseById
        isAdjusted: updatedEntry.is_adjusted,
        adjustmentReason: updatedEntry.adjustment_reason,
        // Pass fresh entry data if refetch succeeded
        ...(freshEntry ? {
          sets: freshEntry.sets,
          reps: freshEntry.reps,
          weight: freshEntry.weight,
          time: freshEntry.time,
          notes: freshEntry.notes,
        } : {}),
      },
    }));
    
    // Log exercise swap to workout_session_adjustments for tracking
    const sessionId = workoutState.sessionId;
    if (sessionId && !sessionId.startsWith('temp-')) {
      try {
        await dispatch(
          enhancedApi.endpoints.AddWorkoutAdjustment.initiate({
            sessionId,
            type: 'exercise_swap',
            workoutEntryId: workoutEntryId,
            exerciseId: newExerciseId,
            fromValue: oldExerciseName,
            toValue: newExerciseName,
            reason: updatedEntry.adjustment_reason || 'User chose an alternative exercise',
            affectedSetNumbers: undefined, // Exercise swap affects all sets
            affectsFutureSets: true,
            // Omit metadata for now - can add later if needed
            // The exercise IDs are already tracked in fromValue/toValue and exerciseId fields
          })
        ).unwrap();
        
        console.log('✅ Logged exercise swap to workout_session_adjustments');
      } catch (error: any) {
        console.error('Failed to log exercise swap to workout_session_adjustments:', error);
        // Don't throw - allow workout to continue even if logging fails
      }
    }
    
    // Notify voice agent about exercise swap (works for both manual swaps from UI and agent swaps)
    const reason = alternativeNote || updatedEntry.adjustment_reason || 'User chose an alternative exercise';
    const contextMessage = `SYSTEM: exercise-swap - Exercise swapped from "${oldExerciseName}" to "${newExerciseName}". Reason: ${reason}. The current exercise is now "${newExerciseName}". Update your context accordingly.`;
    
    contextBridgeService.sendContextualUpdate(contextMessage).catch(err => 
      console.log('🎙️ Could not send exercise swap context:', err)
    );
    
    console.log('✅ Synced exercise swap to Redux state');
  },
});

// Listener for ElevenLabs conversation tracking - sync to workout_session_chat
// Only tracks conversation IDs, not individual messages (ElevenLabs stores those)
startAppListening({
  actionCreator: trackConversation,
  effect: async (action, listenerApi) => {
    const { dispatch, getState } = listenerApi;
    const state = getState() as RootState;
    const sessionId = selectSessionId(state);
    
    if (!sessionId || sessionId.startsWith('temp-')) {
      return;
    }
    
    const { conversationId, eventType, details } = action.payload;
    
    try {
      await dispatch(
        enhancedApi.endpoints.TrackWorkoutConversation.initiate({
          sessionId,
          conversationId,
          eventType,
          details: details || null,
        })
      ).unwrap();
      
      console.log(`✅ Tracked conversation ${eventType}: ${conversationId}`);
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      console.error(`❌ Failed to track conversation ${eventType}:`, errorMessage.substring(0, 200));
    }
  },
});

// Listener for status changes - sync to workout_sessions
startAppListening({
  matcher: isAnyOf(
    startExercisePreparation,
    confirmReadyAndStartSet,
    completeSet,
    startRest,
    triggerRestEnding,
    completeExercise,
    completeWorkout,
    finishWorkoutEarly,
    pauseSet,
    resumeSet
  ),
  effect: async (action, listenerApi) => {
    const { dispatch, getState } = listenerApi;
    const state = getState() as RootState;
    const sessionId = selectSessionId(state);
    
    if (!sessionId || sessionId.startsWith('temp-')) {
      return;
    }
    
    const status = state.workout.status;
    const activeWorkout = state.workout.activeWorkout;
    
    if (!activeWorkout) {
      return;
    }
    
    // Map Redux status to DB status
    // DB only allows: 'selected', 'preparing', 'exercising', 'paused', 'completed', 'finished_early', 'abandoned'
    // Redux has: 'inactive', 'selected', 'preparing', 'exercising', 'set-complete', 'resting', 'rest-ending', 'exercise-transition', 'workout-completed'
    let dbStatus: string;
    switch (status) {
      case 'selected':
        dbStatus = 'selected';
        break;
      case 'preparing':
      case 'exercise-transition':
        dbStatus = 'preparing';
        break;
      case 'exercising':
        dbStatus = 'exercising';
        break;
      case 'set-complete':
      case 'resting':
      case 'rest-ending':
        // These are all part of the exercising phase - keep as 'exercising'
        dbStatus = 'exercising';
        break;
      case 'workout-completed':
        dbStatus = 'completed';
        break;
      case 'inactive':
        // Don't sync inactive status
        return;
      default:
        // For any unknown status, default to 'exercising' to be safe
        console.warn(`⚠️ Unknown status "${status}", mapping to 'exercising'`);
        dbStatus = 'exercising';
    }
    
    // Safety check - ensure dbStatus is valid before sending
    const validStatuses = ['selected', 'preparing', 'exercising', 'paused', 'completed', 'finished_early', 'abandoned'];
    if (!validStatuses.includes(dbStatus)) {
      console.error(`❌ Invalid dbStatus "${dbStatus}" mapped from "${status}", skipping sync`);
      return;
    }
    
    console.log(`🔄 Syncing status: "${status}" -> "${dbStatus}"`);
    
    try {
      // Update session status - use mapped dbStatus, not raw status
      await dispatch(
        enhancedApi.endpoints.UpdateWorkoutSessionStatus.initiate({
          id: sessionId,
          status: dbStatus, // Use mapped status, not raw Redux status
          lastActivityAt: new Date().toISOString(),
        })
      ).unwrap();
      
      // Update progress
      await dispatch(
        enhancedApi.endpoints.UpdateWorkoutSessionProgress.initiate({
          id: sessionId,
          currentExerciseIndex: activeWorkout.currentExerciseIndex,
          currentSetIndex: activeWorkout.currentSetIndex,
          completedExercises: activeWorkout.completedExercises,
          completedSets: activeWorkout.completedSets,
          totalTimeMs: activeWorkout.elapsedTime,
          totalPauseTimeMs: activeWorkout.totalPauseTime,
          lastActivityAt: new Date().toISOString(),
        })
      ).unwrap();
      
      console.log('✅ Synced workout status to database');
    } catch (error: any) {
      console.error('Failed to sync workout status to database:', error);
    }
  },
});

// Listener for workout completion - mark session as completed
startAppListening({
  actionCreator: completeWorkout,
  effect: async (action, listenerApi) => {
    const { dispatch, getState } = listenerApi;
    
    // Flush any pending adjustment updates before completing
    await flushPendingAdjustments();
    
    const state = getState() as RootState;
    const sessionId = selectSessionId(state);
    
    if (!sessionId || sessionId.startsWith('temp-')) {
      return;
    }
    
    const activeWorkout = state.workout.activeWorkout;
    const isFullyCompleted = activeWorkout?.completedExercises === activeWorkout?.totalExercises;
    
    // Compute status based on completion state
    const dbStatus = 'completed'; // Always completed for completeWorkout action
    
    try {
      await dispatch(
        enhancedApi.endpoints.CompleteWorkoutSession.initiate({
          id: sessionId,
          status: dbStatus,
          completedAt: new Date().toISOString(),
          isFullyCompleted: !!isFullyCompleted,
          finishedEarly: false,
        })
      ).unwrap();
      
      console.log('✅ Synced workout completion to database');
    } catch (error: any) {
      console.error('Failed to sync workout completion to database:', error);
    }
  },
});

// Listener for early finish - mark session as finished early
startAppListening({
  actionCreator: finishWorkoutEarly,
  effect: async (action, listenerApi) => {
    const { dispatch, getState } = listenerApi;
    
    // Flush any pending adjustment updates before finishing early
    await flushPendingAdjustments();
    
    const state = getState() as RootState;
    const sessionId = selectSessionId(state);
    
    if (!sessionId || sessionId.startsWith('temp-')) {
      return;
    }
    
    const activeWorkout = state.workout.activeWorkout;
    const isFullyCompleted = activeWorkout?.completedExercises === activeWorkout?.totalExercises;
    
    // Compute status - always finished_early in this listener
    const dbStatus = 'finished_early';
    
    try {
      await dispatch(
        enhancedApi.endpoints.CompleteWorkoutSession.initiate({
          id: sessionId,
          status: dbStatus,
          completedAt: new Date().toISOString(),
          isFullyCompleted: !!isFullyCompleted,
          finishedEarly: true,
        })
      ).unwrap();
      
      console.log('✅ Synced early finish to database');
    } catch (error: any) {
      console.error('Failed to sync early finish to database:', error);
    }
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
