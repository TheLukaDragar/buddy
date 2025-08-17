import { createListenerMiddleware, isAnyOf, type TypedStartListening } from '@reduxjs/toolkit';
import { contextBridgeService } from '../../services/contextBridgeService';
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
    startExercisePreparation,
    startRest,
    triggerRestEnding,
    updateRestTimer,
    updateSetTimer
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

// Listener for weight adjustment
startAppListening({
  actionCreator: adjustWeight,
  effect: async (action, listenerApi) => {
    const { dispatch, getState } = listenerApi;
    // Generate context message for weight adjustment
    const { newWeight, reason } = action.payload;
    const state = getState() as RootState;
    const oldWeight = state.workout.activeWorkout?.currentSet?.targetWeight || 0;
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
    const { dispatch, getState } = listenerApi;
    // Generate context message for reps adjustment
    const { newReps, reason } = action.payload;
    const state = getState() as RootState;
    const oldReps = state.workout.activeWorkout?.currentSet?.targetReps || 0;
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
  },
});

// Listener for workout completion
startAppListening({
  actionCreator: completeWorkout,
  effect: async (action, listenerApi) => {
    const { dispatch, getState } = listenerApi;
    // Generate context message for workout completion
    const state = getState() as RootState;
    const systemMessage = `SYSTEM: workout-completed - User finished entire workout. Celebration and summary needed.`;
    
    // Get workout summary data
    const workoutSummary = {
      sessionName: state.workout.session?.name || 'Unknown',
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
        setTimeout(() => {
          console.log('🎙️ [Workout Middleware] Sending delayed context sync');
          
          // Get fresh state after delay
          const freshState = getState() as RootState;
          const freshWorkoutState = freshState.workout;
          
          if (!freshWorkoutState.activeWorkout) return;
          
          // Build context sync message
          const context = freshWorkoutState.activeWorkout;
          const currentExercise = context.currentExercise;
          const currentSet = context.currentSet;
          
          if (currentExercise && currentSet) {
            const setProgress = `${context.currentSetIndex + 1}/${currentExercise.sets.length}`;
            const exerciseProgress = `${context.currentExerciseIndex + 1}/${context.totalExercises}`;
            
            let contextMessage = `CONTEXT SYNC: Currently in "${freshWorkoutState.session?.name}" workout. `;
            contextMessage += `Exercise ${exerciseProgress}: "${currentExercise.name}". `;
            contextMessage += `Set ${setProgress} (${currentSet.targetReps} reps`;
            
            if (currentSet.targetWeight) {
              contextMessage += ` at ${currentSet.targetWeight}kg`;
            }
            
            contextMessage += `). State: ${freshWorkoutState.status}`;
            
            // Add time information if relevant
            if (freshWorkoutState.status === 'exercising') {
              contextMessage += `. Set timer: ${Math.floor((context.elapsedTime || 0) / 1000)}s elapsed`;
              if (context.isPaused) {
                contextMessage += ' (PAUSED)';
              }
            } else if (freshWorkoutState.status === 'resting' && freshWorkoutState.timers.restTimer) {
              const remaining = Math.floor(freshWorkoutState.timers.restTimer.remaining / 1000);
              contextMessage += `. Rest timer: ${remaining}s remaining`;
              if (context.isPaused) {
                contextMessage += ' (PAUSED)';
              }
            }
            
            contextMessage += '. User just connected to voice assistant.';
            
            // Send context sync via voice message service
            contextBridgeService.sendContextualUpdate(contextMessage).then((success) => {
              if (success) {
                console.log('🎙️ [Workout Middleware] Context sync sent successfully');
              } else {
                console.log('🎙️ [Workout Middleware] Context sync failed - voice agent not available');
              }
            });
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
      sessionName: state.workout.session?.name || 'Unknown',
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

// Export the middleware instance
export { workoutListenerMiddleware };

// Export helper functions for external use
export const workoutTimerHelpers = {
  clearAllTimers,
  isSetTimerActive: () => !!activeTimers.setUpdateInterval,
  isRestTimerActive: () => !!activeTimers.restUpdateInterval,
  isUserActivityPingActive: () => !!activeTimers.userActivityPing,
};
