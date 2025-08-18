// WorkoutStateMachine: Clean Implementation

import { Exercise, WorkoutSession, WorkoutSet } from '../types/workout';

export type WorkoutState = 
  | 'inactive'           // State 0: No workout
  | 'selected'           // State 2: Workout selected, need intro
  | 'preparing'          // State 3: Agent explaining, waiting for user ready
  | 'exercising'         // State 4: Set timer active
  | 'set-complete'       // State 5: Set done, transitioning to rest
  | 'resting'            // State 6: Rest timer active, feedback collection
  | 'rest-ending'        // State 7: 10s warning, prepare next set
  | 'exercise-transition'; // State 8: Between exercises, agent introduces new exercise

export interface WorkoutContext {
  sessionId: string;
  exerciseIndex: number;
  setIndex: number;
  targetReps: number;
  targetWeight?: number;
  timeRemaining?: number;
  currentExercise: Exercise;
  currentSet: WorkoutSet;
}

export interface SystemUpdate {
  type: 'SYSTEM';
  event: string;
  data: any;
  timestamp: number;
}

export type ContextUpdateCallback = (update: SystemUpdate) => void;
export type BeepCallback = (type: 'start' | 'end') => Promise<boolean>;

export class WorkoutStateMachine {
  private static instance: WorkoutStateMachine;
  
  // Instance tracking
  private instanceId: string = Math.random().toString(36).substr(2, 9);
  
  // Core state
  private state: WorkoutState = 'inactive';
  private session: WorkoutSession | null = null;
  private context: WorkoutContext | null = null;
  
  // Timers (React Native compatible)
  private setTimer: ReturnType<typeof setTimeout> | null = null;
  private restTimer: ReturnType<typeof setTimeout> | null = null;
  
  // Callbacks
  private onContextUpdate: ContextUpdateCallback | null = null;
  private onUserActivityNeeded: (() => void) | null = null;
  private onBeepRequested: BeepCallback | null = null;
  
  // Voice agent status
  private voiceAgentConnected: boolean = false;
  
  // State tracking
  private setStartTime: number = 0;
  private restStartTime: number = 0;
  private isPaused: boolean = false;
  private pauseStartTime: number = 0;
  private totalPauseTime: number = 0;
  private restPauseStartTime: number = 0;
  private totalRestPauseTime: number = 0;
  
  private constructor() {}
  
  public static getInstance(): WorkoutStateMachine {
    if (!WorkoutStateMachine.instance) {
      WorkoutStateMachine.instance = new WorkoutStateMachine();
      console.log('🏗️ [State Machine] New instance created:', WorkoutStateMachine.instance.instanceId);
    }
    return WorkoutStateMachine.instance;
  }

  // Callback registration
  public setContextUpdateCallback(callback: ContextUpdateCallback | null): void {
    this.onContextUpdate = callback;
  }

  public setUserActivityCallback(callback: (() => void) | null): void {
    this.onUserActivityNeeded = callback;
  }

  public setBeepCallback(callback: BeepCallback | null): void {
    this.onBeepRequested = callback;
  }

  // Voice agent status management
  public setVoiceAgentStatus(connected: boolean): void {
    const wasConnected = this.voiceAgentConnected;
    this.voiceAgentConnected = connected;
    
    console.log(`🎙️ [State Machine] Voice agent ${connected ? 'connected' : 'disconnected'}`);
    
    // When agent connects, send current context
    if (connected && !wasConnected && this.context) {
      this.sendContextSync();
    }
  }

  public isVoiceAgentConnected(): boolean {
    return this.voiceAgentConnected;
  }

  // Send current context to voice agent on connection
  private sendContextSync(): void {
    if (!this.context || !this.session) {
      console.log('🎙️ [Context Sync] No active workout context to sync');
      return;
    }

    const currentExercise = this.context.currentExercise;
    const currentSet = this.context.currentSet;
    const setProgress = `${this.context.setIndex + 1}/${currentExercise.sets.length}`;
    const exerciseProgress = `${this.context.exerciseIndex + 1}/${this.session.exercises.length}`;
    
    let contextMessage = `CONTEXT SYNC: Currently in "${this.session.name}" workout. `;
    contextMessage += `Exercise ${exerciseProgress}: "${currentExercise.name}". `;
    contextMessage += `Set ${setProgress} (${this.context.targetReps} reps`;
    
    if (this.context.targetWeight) {
      contextMessage += ` at ${this.context.targetWeight}kg`;
    }
    
    contextMessage += `). State: ${this.state}`;
    
    // Add time information if relevant
    if (this.state === 'exercising') {
      const elapsed = this.getElapsedTime();
      contextMessage += `. Set timer: ${elapsed}s elapsed`;
      if (this.isPaused) {
        contextMessage += ' (PAUSED)';
      }
    } else if (this.state === 'resting') {
      const elapsed = this.getElapsedTime();
      const restTime = currentSet.restTimeAfter || 60;
      const remaining = Math.max(0, restTime - elapsed);
      contextMessage += `. Rest timer: ${remaining}s remaining`;
      if (this.isPaused) {
        contextMessage += ' (PAUSED)';
      }
    }
    
    // Add completion status
    if (currentSet.isCompleted) {
      contextMessage += '. Current set is completed';
    }
    
    contextMessage += '. User just connected to voice assistant.';

    console.log('🎙️ [Context Sync] Sending context:', contextMessage);
    
    this.sendSystemUpdate('voice-agent-connected', {
      contextMessage,
      workout: this.session.name,
      exercise: currentExercise.name,
      exerciseIndex: this.context.exerciseIndex + 1,
      totalExercises: this.session.exercises.length,
      setIndex: this.context.setIndex + 1,
      totalSets: currentExercise.sets.length,
      state: this.state,
      targetReps: this.context.targetReps,
      targetWeight: this.context.targetWeight,
      isSetCompleted: currentSet.isCompleted,
      isPaused: this.isPaused
    });
  }

  // State getters
  public getState(): WorkoutState {
    return this.state;
  }

  public getContext(): WorkoutContext | null {
    return this.context;
  }

  public isActive(): boolean {
    return this.state !== 'inactive';
  }

  public isPausedState(): boolean {
    return this.isPaused;
  }

  // Core state machine transitions
  public selectWorkout(session: WorkoutSession): boolean {
    if (this.state !== 'inactive') {
      console.warn('Cannot select workout - already active');
      return false;
    }

    this.session = session;
    this.context = {
      sessionId: session.id,
      exerciseIndex: 0,
      setIndex: 0,
      targetReps: session.exercises[0].sets[0].targetReps,
      targetWeight: session.exercises[0].sets[0].targetWeight,
      currentExercise: session.exercises[0],
      currentSet: session.exercises[0].sets[0]
    };

    this.transitionTo('selected');
    this.sendSystemUpdate('workout-selected', {
      workoutName: session.name,
      exercises: session.exercises.map(e => e.name),
      currentExercise: this.context.currentExercise.name
    });

    // Automatically transition to preparing state after a brief delay
    setTimeout(() => {
      this.startExercisePreparation();
    }, 1000);

    return true;
  }

  public startExercisePreparation(): boolean {
    if (this.state !== 'selected' && this.state !== 'rest-ending' && this.state !== 'exercise-transition') {
      console.warn('Cannot start preparation from state:', this.state);
      return false;
    }

    this.transitionTo('preparing');
    this.sendSystemUpdate('exercise-preparation', {
      exerciseName: this.context!.currentExercise.name,
      setNumber: this.context!.setIndex + 1,
      targetReps: this.context!.targetReps,
      targetWeight: this.context!.targetWeight
    });

    return true;
  }

  public confirmReadyAndStartSet(): boolean {
    console.log('🔍 [State Machine] confirmReadyAndStartSet called - Instance:', this.instanceId, 'State:', this.state, 'Context:', !!this.context);
    
    // Handle different states where user can start a set
    if (this.state === 'resting') {
      this.clearRestTimer();
      
      // Check if this was the final set of the exercise
      const currentSetIndex = this.context!.setIndex;
      const totalSets = this.context!.currentExercise.sets.length;
      const isLastSet = currentSetIndex >= totalSets - 1;
      
      console.log('🔍 [State Machine] During rest - Set:', currentSetIndex + 1, 'of', totalSets, 'isLastSet:', isLastSet);
      
      if (isLastSet) {
        // User is ready after final set - complete the exercise
        console.log('🔍 [State Machine] User ready after final set - completing exercise');
        return this.completeExercise();
      } else {
        // User ready during normal rest - advance to next set
        console.log('🔍 [State Machine] User ready during normal rest - advancing to next set');
        this.advanceToNextSetData();
        this.transitionTo('preparing');
      }
    } else if (this.state === 'rest-ending') {
      // User ready during rest ending - advance to next set first
      this.clearRestTimer();
      this.advanceToNextSetData();
      this.transitionTo('preparing');
    } else if (this.state === 'exercise-transition') {
      // User ready for new exercise - transition to preparing
      this.transitionTo('preparing');
    } else if (this.state !== 'preparing') {
      console.warn('❌ [State Machine] Cannot start set from state:', this.state, 'Instance:', this.instanceId);
      return false;
    }

    this.transitionTo('exercising');
    this.setStartTime = Date.now();
    this.totalPauseTime = 0; // Reset pause tracking for new set
    this.pauseStartTime = 0;
    this.isPaused = false;
    
    // Start set timer (e.g., 45 seconds for timed sets)
    const setDuration = this.context!.currentSet.targetTime || 45;
    this.setTimer = setTimeout(() => {
      this.completeSet();
    }, setDuration * 1000);

    this.sendSystemUpdate('set-started', {
      setNumber: this.context!.setIndex + 1,
      targetReps: this.context!.targetReps,
      duration: setDuration
    });

    // Play start beep
    if (this.onBeepRequested) {
      this.onBeepRequested('start').catch(error => 
        console.warn('🔇 [State Machine] Failed to play start beep:', error)
      );
    }

    // Send periodic user activity during set to prevent AI timeout
    this.startUserActivityPing();

    return true;
  }

  public completeSet(actualReps?: number): boolean {
    if (this.state !== 'exercising') {
      console.warn('Cannot complete set from state:', this.state);
      return false;
    }

    this.clearSetTimer();
    this.stopUserActivityPing();

    // If currently paused, account for pause time up to now
    let finalTotalPauseTime = this.totalPauseTime;
    if (this.isPaused && this.pauseStartTime > 0) {
      const currentPauseDuration = Date.now() - this.pauseStartTime;
      finalTotalPauseTime += currentPauseDuration;
      console.log('🔄 [State Machine] Completing set while paused, adding current pause time:', Math.round(currentPauseDuration / 1000), 's');
    }

    // Update set data
    this.context!.currentSet.actualReps = actualReps || this.context!.targetReps;
    this.context!.currentSet.isCompleted = true;

    // Reset pause state
    this.isPaused = false;
    this.pauseStartTime = 0;

    this.transitionTo('set-complete');
    // Calculate actual working duration (excluding pause time)
    const totalElapsed = Date.now() - this.setStartTime;
    const actualDuration = Math.round((totalElapsed - finalTotalPauseTime) / 1000);
    
    this.sendSystemUpdate('set-completed', {
      setNumber: this.context!.setIndex + 1,
      actualReps: this.context!.currentSet.actualReps,
      targetReps: this.context!.targetReps,
      duration: actualDuration,
      totalElapsed: Math.round(totalElapsed / 1000),
      pauseTime: Math.round(finalTotalPauseTime / 1000)
    });

    // Play end beep
    if (this.onBeepRequested) {
      this.onBeepRequested('end').catch(error => 
        console.warn('🔇 [State Machine] Failed to play end beep:', error)
      );
    }

    // Automatically transition to rest
    setTimeout(() => this.startRest(), 500);

    return true;
  }

  public startRest(): boolean {
    if (this.state !== 'set-complete') {
      console.warn('Cannot start rest from state:', this.state);
      return false;
    }

    this.transitionTo('resting');
    this.restStartTime = Date.now();
    this.totalRestPauseTime = 0; // Reset rest pause tracking for new rest
    this.restPauseStartTime = 0;
    this.isPaused = false;
    
    const restDuration = this.context!.currentSet.restTimeAfter || 60;
    this.context!.timeRemaining = restDuration;

    // Check if this is the last set of the exercise
    const currentSetIndex = this.context!.setIndex;
    const totalSets = this.context!.currentExercise.sets.length;
    const isLastSet = currentSetIndex >= totalSets - 1;
    
    console.log('🔍 [Rest Timer] Set:', currentSetIndex + 1, 'of', totalSets, 'isLastSet:', isLastSet);

    if (isLastSet) {
      // For the last set, skip the 10s warning and go directly to exercise completion
      console.log('⏰ [Rest Timer] Setting timer to complete exercise after', restDuration, 'seconds');
      this.restTimer = setTimeout(() => {
        // Double-check we're still in the same exercise and resting state before auto-completing
        if (this.state === 'resting' && this.context && this.context.setIndex === currentSetIndex) {
          console.log('⏰ [Rest Timer] Auto-completing exercise (last set)');
          this.completeExercise();
        } else {
          console.log('⏰ [Rest Timer] Skipping auto-complete - state changed or exercise advanced manually');
        }
      }, restDuration * 1000);
    } else {
      // For non-last sets, use the normal 10s warning
      console.log('⏰ [Rest Timer] Setting timer to trigger rest ending after', restDuration - 10, 'seconds');
      this.restTimer = setTimeout(() => {
        // Double-check we're still in the same set and resting state before triggering rest ending
        if (this.state === 'resting' && this.context && this.context.setIndex === currentSetIndex) {
          console.log('⏰ [Rest Timer] Auto-triggering rest ending (not last set)');
          this.triggerRestEnding();
        } else {
          console.log('⏰ [Rest Timer] Skipping rest ending - state changed or set advanced manually');
        }
      }, (restDuration - 10) * 1000);
    }

    this.sendSystemUpdate('rest-started', {
      duration: restDuration,
      setJustCompleted: this.context!.setIndex + 1,
      isLastSet: isLastSet,
      currentSetIndex: currentSetIndex,
      totalSets: totalSets
    });

    return true;
  }

  public triggerRestEnding(): boolean {
    if (this.state !== 'resting') {
      console.warn('Cannot trigger rest ending from state:', this.state);
      return false;
    }

    this.transitionTo('rest-ending');
    this.sendSystemUpdate('rest-ending', {
      timeRemaining: 10,
      nextSetNumber: this.context!.setIndex + 2
    });

    // Stay in rest-ending state and wait for user to indicate readiness
    // User can call confirmReadyAndStartSet() when ready
    // No automatic advancement - user must confirm readiness

    return true;
  }

  public advanceToNextSet(): boolean {
    if (this.state !== 'rest-ending') {
      console.warn('Cannot advance to next set from state:', this.state);
      return false;
    }

    this.clearRestTimer();

    // Check if exercise is complete
    if (this.context!.setIndex >= this.context!.currentExercise.sets.length - 1) {
      return this.completeExercise();
    }

    // Move to next set
    this.context!.setIndex++;
    this.context!.currentSet = this.context!.currentExercise.sets[this.context!.setIndex];
    this.context!.targetReps = this.context!.currentSet.targetReps;
    this.context!.targetWeight = this.context!.currentSet.targetWeight;

    return this.startExercisePreparation();
  }

  private advanceToNextSetData(): void {
    // Check if exercise is complete
    if (this.context!.setIndex >= this.context!.currentExercise.sets.length - 1) {
      // Don't advance if this is the last set (will be handled by completeExercise)
      return;
    }

    // Move to next set data only
    this.context!.setIndex++;
    this.context!.currentSet = this.context!.currentExercise.sets[this.context!.setIndex];
    this.context!.targetReps = this.context!.currentSet.targetReps;
    this.context!.targetWeight = this.context!.currentSet.targetWeight;
  }

  public completeExercise(): boolean {
    // CRITICAL: Clear all timers before transitioning to prevent auto-advancement
    this.clearAllTimers();
    
    // Check if workout is complete
    if (this.context!.exerciseIndex >= this.session!.exercises.length - 1) {
      return this.completeWorkout();
    }

    // Move to next exercise
    this.context!.exerciseIndex++;
    this.context!.setIndex = 0;
    this.context!.currentExercise = this.session!.exercises[this.context!.exerciseIndex];
    this.context!.currentSet = this.context!.currentExercise.sets[0];
    this.context!.targetReps = this.context!.currentSet.targetReps;
    this.context!.targetWeight = this.context!.currentSet.targetWeight;

    // Transition to exercise-transition state (no time limit, wait for user)
    this.transitionTo('exercise-transition');

    console.log('🏋️ [State Machine] Completed exercise, moved to:', this.context!.currentExercise.name, 'All timers cleared');

    this.sendSystemUpdate('exercise-changed', {
      newExercise: this.context!.currentExercise.name,
      exerciseIndex: this.context!.exerciseIndex + 1,
      totalExercises: this.session!.exercises.length,
      description: this.context!.currentExercise.description,
      sets: this.context!.currentExercise.sets.length,
      targetReps: this.context!.targetReps,
      targetWeight: this.context!.targetWeight
    });

    return true;
  }

  public completeWorkout(): boolean {
    this.clearAllTimers();
    
    this.sendSystemUpdate('workout-completed', {
      sessionName: this.session!.name,
      totalTime: Date.now() - this.setStartTime // approximate
    });

    this.transitionTo('inactive');
    this.session = null;
    this.context = null;

    return true;
  }

  // Agent tool interface
  public pauseSet(reason: string): string {
    if (this.state !== 'exercising') {
      return 'No active set to pause';
    }

    this.isPaused = true;
    this.pauseStartTime = Date.now();
    this.clearSetTimer();
    this.stopUserActivityPing();

    // Calculate current working time for context
    const currentWorkingTime = Math.round((Date.now() - this.setStartTime - this.totalPauseTime) / 1000);

    this.sendSystemUpdate('set-paused', { 
      reason,
      workingTimeBeforePause: currentWorkingTime
    });
    return `Set paused: ${reason}`;
  }

  public resumeSet(): string {
    if (this.state !== 'exercising' || !this.isPaused) {
      return 'No paused set to resume';
    }

    // Calculate and accumulate pause time
    const pauseDuration = Date.now() - this.pauseStartTime;
    this.totalPauseTime += pauseDuration;
    
    this.isPaused = false;
    this.pauseStartTime = 0;
    
    // Restart set timer with remaining time (excluding pause time)
    const elapsed = (Date.now() - this.setStartTime - this.totalPauseTime) / 1000;
    const setDuration = this.context!.currentSet.targetTime || 45;
    const remaining = Math.max(5, setDuration - elapsed);

    this.setTimer = setTimeout(() => {
      this.completeSet();
    }, remaining * 1000);

    this.startUserActivityPing();
    this.sendSystemUpdate('set-resumed', {});
    return 'Set resumed';
  }

  public restartSet(): string {
    if (this.state !== 'exercising') {
      return 'No active set to restart';
    }

    this.clearSetTimer();
    this.stopUserActivityPing();
    
    // Reset to preparation phase
    this.transitionTo('preparing');
    this.sendSystemUpdate('set-restarted', {});
    return 'Set restarted - confirm when ready to begin again';
  }

  public jumpToSet(targetSetNumber: number): string {
    if (!this.context) {
      return 'No active workout to jump sets in';
    }

    const currentExercise = this.context.currentExercise;
    const totalSets = currentExercise.sets.length;
    
    // Validate set number (1-based input, convert to 0-based)
    const targetSetIndex = targetSetNumber - 1;
    if (targetSetIndex < 0 || targetSetIndex >= totalSets) {
      return `Invalid set number. This exercise has ${totalSets} sets (1-${totalSets})`;
    }

    // Clear any active timers
    this.clearAllTimers();
    this.stopUserActivityPing();

    // Update context to target set
    this.context.setIndex = targetSetIndex;
    this.context.currentSet = currentExercise.sets[targetSetIndex];
    this.context.targetReps = this.context.currentSet.targetReps;
    this.context.targetWeight = this.context.currentSet.targetWeight;

    // Transition to preparing state
    this.transitionTo('preparing');
    
    this.sendSystemUpdate('set-jumped', {
      targetSetNumber,
      exercise: currentExercise.name,
      targetReps: this.context.targetReps,
      targetWeight: this.context.targetWeight
    });

    return `Jumped to set ${targetSetNumber} of ${currentExercise.name}. Tell me when you ready`;
  }

  public adjustWeight(newWeight: number, reason: string): string {
    if (!this.context) {
      return 'No active workout to adjust';
    }

    const oldWeight = this.context.targetWeight || 0;
    this.context.targetWeight = newWeight;
    this.context.currentSet.targetWeight = newWeight;

    this.sendSystemUpdate('weight-adjusted', {
      from: oldWeight,
      to: newWeight,
      reason
    });

    return `Weight adjusted from ${oldWeight}kg to ${newWeight}kg`;
  }

  public adjustReps(newReps: number, reason: string): string {
    if (!this.context) {
      return 'No active workout to adjust';
    }

    const oldReps = this.context.targetReps;
    this.context.targetReps = newReps;
    this.context.currentSet.targetReps = newReps;

    this.sendSystemUpdate('reps-adjusted', {
      from: oldReps,
      to: newReps,
      reason
    });

    return `Reps adjusted from ${oldReps} to ${newReps}`;
  }

  public adjustRestTime(newRestTime: number, reason: string): string {
    if (!this.context) {
      return 'No active workout to adjust';
    }

    const oldRestTime = this.context.currentSet.restTimeAfter || 60;
    this.context.currentSet.restTimeAfter = newRestTime;

    // If currently resting, adjust the timer
    if (this.state === 'resting' || this.state === 'rest-ending') {
      this.clearRestTimer();
      const elapsed = (Date.now() - this.restStartTime) / 1000;
      const remaining = Math.max(10, newRestTime - elapsed);

      if (remaining > 10) {
        this.transitionTo('resting');
        this.restTimer = setTimeout(() => {
          this.triggerRestEnding();
        }, (remaining - 10) * 1000);
      } else {
        this.transitionTo('rest-ending');
        this.restTimer = setTimeout(() => {
          this.advanceToNextSet();
        }, remaining * 1000);
      }
    }

    this.sendSystemUpdate('rest-time-adjusted', {
      from: oldRestTime,
      to: newRestTime,
      reason
    });

    return `Rest time adjusted from ${oldRestTime}s to ${newRestTime}s`;
  }

  public extendRest(additionalSeconds: number): string {
    if (this.state !== 'rest-ending') {
      return 'Can only extend rest during rest-ending phase';
    }

    this.clearRestTimer();
    this.transitionTo('resting');

    // Set new timer for additional time + 10s warning
    this.restTimer = setTimeout(() => {
      this.triggerRestEnding();
    }, (additionalSeconds + 10) * 1000);

    this.sendSystemUpdate('rest-extended', {
      additionalSeconds: additionalSeconds + 10
    });

    return `Rest extended by ${additionalSeconds} seconds`;
  }

  public pauseRest(reason: string): string {
    if (this.state !== 'resting') {
      return 'No active rest to pause';
    }

    this.isPaused = true;
    this.restPauseStartTime = Date.now();
    this.clearRestTimer();

    this.sendSystemUpdate('rest-paused', { reason });
    return `Rest paused: ${reason}`;
  }

  public resumeRest(): string {
    if (this.state !== 'resting' || !this.isPaused) {
      return 'No paused rest to resume';
    }

    // Calculate and accumulate rest pause time
    const pauseDuration = Date.now() - this.restPauseStartTime;
    this.totalRestPauseTime += pauseDuration;
    
    this.isPaused = false;
    this.restPauseStartTime = 0;
    
    // Restart rest timer with remaining time (excluding pause time)
    const elapsed = (Date.now() - this.restStartTime - this.totalRestPauseTime) / 1000;
    const restDuration = this.context!.currentSet.restTimeAfter || 60;
    const remaining = Math.max(10, restDuration - elapsed);

    // Check if this is the last set of the exercise
    const isLastSet = this.context!.setIndex >= this.context!.currentExercise.sets.length - 1;

    if (isLastSet) {
      // For the last set, skip the 10s warning and go directly to exercise completion
      this.restTimer = setTimeout(() => {
        this.completeExercise();
      }, remaining * 1000);
    } else {
      // For non-last sets, use the normal 10s warning
      if (remaining > 10) {
        this.restTimer = setTimeout(() => {
          this.triggerRestEnding();
        }, (remaining - 10) * 1000);
      } else {
        this.transitionTo('rest-ending');
        this.restTimer = setTimeout(() => {
          this.advanceToNextSet();
        }, remaining * 1000);
      }
    }

    this.sendSystemUpdate('rest-resumed', {});
    return 'Rest resumed';
  }

  public getElapsedTime(): number {
    const now = Date.now();
    
    if (this.state === 'exercising' && this.setStartTime > 0) {
      if (this.isPaused) {
        // When paused, return elapsed time up to pause point
        return Math.floor((this.pauseStartTime - this.setStartTime - this.totalPauseTime) / 1000);
      } else {
        // When active, return total elapsed time minus pause time
        return Math.floor((now - this.setStartTime - this.totalPauseTime) / 1000);
      }
    } else if (this.state === 'resting' && this.restStartTime > 0) {
      if (this.isPaused) {
        // When rest is paused, return elapsed time up to pause point
        return Math.floor((this.restPauseStartTime - this.restStartTime - this.totalRestPauseTime) / 1000);
      } else {
        // When rest is active, return total elapsed time minus pause time
        return Math.floor((now - this.restStartTime - this.totalRestPauseTime) / 1000);
      }
    }
    
    return 0;
  }

  public getWorkoutStatus(): string {
    if (!this.context) {
      return 'No active workout';
    }

    const exercise = this.context.currentExercise;
    const setNum = this.context.setIndex + 1;
    const totalSets = exercise.sets.length;
    const exerciseNum = this.context.exerciseIndex + 1;
    const totalExercises = this.session!.exercises.length;

    return `Workout: ${this.session!.name} | Exercise ${exerciseNum}/${totalExercises}: ${exercise.name} | Set ${setNum}/${totalSets} | State: ${this.state}`;
  }

  // Helper methods
  private transitionTo(newState: WorkoutState): void {
    console.log(`🔄 [State Machine] ${this.state} → ${newState} (Instance: ${this.instanceId})`);
    this.state = newState;
  }

  private sendSystemUpdate(event: string, data: any): void {
    if (this.onContextUpdate) {
      const update: SystemUpdate = {
        type: 'SYSTEM',
        event,
        data,
        timestamp: Date.now()
      };
      
      console.log(`📤 [System Update] ${event}:`, data);
      this.onContextUpdate(update);
    }
  }

  private startUserActivityPing(): void {
    // Send user activity every 30 seconds during exercise to prevent AI timeout
    const ping = () => {
      if (this.state === 'exercising' && !this.isPaused && this.onUserActivityNeeded) {
        this.onUserActivityNeeded();
        setTimeout(ping, 30000);
      }
    };
    setTimeout(ping, 30000);
  }

  private stopUserActivityPing(): void {
    // Handled by state check in ping function
  }

  private clearSetTimer(): void {
    if (this.setTimer) {
      clearTimeout(this.setTimer);
      this.setTimer = null;
    }
  }

  private clearRestTimer(): void {
    if (this.restTimer) {
      clearTimeout(this.restTimer);
      this.restTimer = null;
    }
  }

  private clearAllTimers(): void {
    this.clearSetTimer();
    this.clearRestTimer();
  }

  // Cleanup
  public cleanup(): void {
    console.log('⚠️ [State Machine] CLEANUP CALLED - Current state:', this.state);
    console.trace('⚠️ [State Machine] CLEANUP STACK TRACE');
    this.clearAllTimers();
    this.transitionTo('inactive');
    this.session = null;
    this.context = null;
    this.onContextUpdate = null;
    this.onUserActivityNeeded = null;
    this.onBeepRequested = null;
  }
}

export const workoutStateMachine = WorkoutStateMachine.getInstance(); 