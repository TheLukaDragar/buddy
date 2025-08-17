import { createAsyncThunk } from '@reduxjs/toolkit'
import { WorkoutSession } from '../../types/workout'
import type { RootState } from '../index'
import {
  adjustReps as adjustRepsReducer,
  adjustRestTime as adjustRestTimeReducer,
  adjustWeight as adjustWeightReducer,
  completeExercise as completeExerciseReducer,
  completeSet as completeSetReducer,
  completeWorkout as completeWorkoutReducer,
  confirmReadyAndStartSet as confirmReadyAndStartSetReducer,
  finishWorkoutEarly as finishWorkoutEarlyReducer,
  jumpToSet as jumpToSetReducer,
  nextSet as nextSetReducer,
  pauseSet as pauseSetReducer,
  previousSet as previousSetReducer,
  resumeSet as resumeSetReducer,
  selectWorkout as selectWorkoutReducer,
  startExercisePreparation as startExercisePreparationReducer,
  startRest as startRestReducer,
  triggerRestEnding as triggerRestEndingReducer
} from '../slices/workoutSlice'

// =============================================================================
// PAUSE SET ACTION - Moving logic from reducer to thunk
// =============================================================================

export const pauseSet = createAsyncThunk(
  'workout/pauseSet',
  async ({ reason }: { reason: string }, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState
    
    // Business logic (moved from reducer)
    const pauseableStates = ['exercising', 'resting', 'rest-ending']
    if (!pauseableStates.includes(state.workout.status)) {
      return rejectWithValue(`Cannot pause from state: ${state.workout.status}`)
    }
    
    if (!state.workout.activeWorkout) {
      return rejectWithValue('No active workout to pause')
    }

    // Call existing reducer
    dispatch(pauseSetReducer({ reason }))

    return { 
      success: true,
      message: `Set paused: ${reason}`,
      state: state.workout.status 
    }
  }
)

// =============================================================================
// RESUME SET ACTION
// =============================================================================

export const resumeSet = createAsyncThunk(
  'workout/resumeSet',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState
    
    // Business logic (moved from reducer)
    const resumeableStates = ['exercising', 'resting', 'rest-ending']
    if (!resumeableStates.includes(state.workout.status)) {
      return rejectWithValue(`Cannot resume from state: ${state.workout.status}`)
    }
    
    if (!state.workout.activeWorkout?.isPaused) {
      return rejectWithValue('Workout is not currently paused')
    }

    // Call existing reducer
    dispatch(resumeSetReducer())

    return { 
      success: true,
      message: 'Set resumed successfully',
      state: state.workout.status 
    }
  }
)

// =============================================================================
// CORE WORKOUT LIFECYCLE ACTIONS
// =============================================================================

export const selectWorkout = createAsyncThunk(
  'workout/selectWorkout',
  async (session: WorkoutSession, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState
    
    if (state.workout.status !== 'inactive') {
      return rejectWithValue('Cannot select workout - already active')
    }

    dispatch(selectWorkoutReducer(session))

    return { 
      success: true,
      message: `Selected workout: ${session.name}`,
      workoutName: session.name 
    }
  }
)

export const startExercisePreparation = createAsyncThunk(
  'workout/startExercisePreparation',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState
    
    if (!['selected', 'rest-ending', 'exercise-transition'].includes(state.workout.status)) {
      return rejectWithValue(`Cannot start preparation from state: ${state.workout.status}`)
    }

    dispatch(startExercisePreparationReducer())

    return { 
      success: true,
      message: 'Exercise preparation started',
      exerciseName: state.workout.activeWorkout?.currentExercise?.name
    }
  }
)

export const confirmReadyAndStartSet = createAsyncThunk(
  'workout/confirmReadyAndStartSet',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState
    
    if (!state.workout.activeWorkout || !state.workout.session) {
      return rejectWithValue('No active workout')
    }

    // Let reducer handle all the complex state logic
    dispatch(confirmReadyAndStartSetReducer())


    return { 
      success: true,
      message: 'Set started successfully'
    }
  }
)

export const completeSet = createAsyncThunk(
  'workout/completeSet',
  async ({ actualReps }: { actualReps?: number }, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState
    
    if (state.workout.status !== 'exercising' || !state.workout.activeWorkout) {
      return rejectWithValue(`Cannot complete set from state: ${state.workout.status}`)
    }

    dispatch(completeSetReducer(actualReps))

    return { 
      success: true,
      message: 'Set completed successfully',
      setNumber: state.workout.activeWorkout.currentSetIndex + 1
    }
  }
)

export const startRest = createAsyncThunk(
  'workout/startRest',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState
    
    if (state.workout.status !== 'set-complete' || !state.workout.activeWorkout) {
      return rejectWithValue(`Cannot start rest from state: ${state.workout.status}`)
    }

    dispatch(startRestReducer())

    return { 
      success: true,
      message: 'Rest started'
    }
  }
)

export const triggerRestEnding = createAsyncThunk(
  'workout/triggerRestEnding',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState
    
    if (state.workout.status !== 'resting') {
      return rejectWithValue(`Cannot trigger rest ending from state: ${state.workout.status}`)
    }

    dispatch(triggerRestEndingReducer())

    return { 
      success: true,
      message: 'Rest ending triggered'
    }
  }
)

export const completeExercise = createAsyncThunk(
  'workout/completeExercise',
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState

    dispatch(completeExerciseReducer())

    return { 
      success: true,
      message: 'Exercise completed'
    }
  }
)

export const completeWorkout = createAsyncThunk(
  'workout/completeWorkout',
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState

    dispatch(completeWorkoutReducer())

    return { 
      success: true,
      message: 'Workout completed successfully'
    }
  }
)

export const finishWorkoutEarly = createAsyncThunk(
  'workout/finishWorkoutEarly',
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState

    dispatch(finishWorkoutEarlyReducer())

    return { 
      success: true,
      message: 'Workout finished early'
    }
  }
)

// =============================================================================
// ADJUSTMENT ACTIONS
// =============================================================================

export const adjustWeight = createAsyncThunk(
  'workout/adjustWeight',
  async ({ newWeight, reason }: { newWeight: number; reason: string }, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState
    
    if (!state.workout.activeWorkout?.currentSet) {
      return rejectWithValue('No current set to adjust')
    }

    const oldWeight = state.workout.activeWorkout.currentSet.targetWeight || 0
    dispatch(adjustWeightReducer({ newWeight, reason }))

    return { 
      success: true,
      message: `Weight adjusted from ${oldWeight}kg to ${newWeight}kg`,
      from: oldWeight,
      to: newWeight 
    }
  }
)

export const adjustReps = createAsyncThunk(
  'workout/adjustReps',
  async ({ newReps, reason }: { newReps: number; reason: string }, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState
    
    if (!state.workout.activeWorkout?.currentSet) {
      return rejectWithValue('No current set to adjust')
    }

    const oldReps = state.workout.activeWorkout.currentSet.targetReps
    dispatch(adjustRepsReducer({ newReps, reason }))

    return { 
      success: true,
      message: `Reps adjusted from ${oldReps} to ${newReps}`,
      from: oldReps,
      to: newReps 
    }
  }
)

export const adjustRestTime = createAsyncThunk(
  'workout/adjustRestTime',
  async ({ newRestTime, reason }: { newRestTime: number; reason: string }, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState
    
    if (!state.workout.activeWorkout?.currentSet) {
      return rejectWithValue('No current set to adjust')
    }

    const oldRestTime = state.workout.activeWorkout.currentSet.restTimeAfter || 60
    dispatch(adjustRestTimeReducer({ newRestTime, reason }))

    return { 
      success: true,
      message: `Rest time adjusted from ${oldRestTime}s to ${newRestTime}s`,
      from: oldRestTime,
      to: newRestTime 
    }
  }
)

export const jumpToSet = createAsyncThunk(
  'workout/jumpToSet',
  async ({ targetSetNumber, reason }: { targetSetNumber: number; reason: string }, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState
    
    if (!state.workout.activeWorkout?.currentExercise) {
      return rejectWithValue('No active exercise')
    }

    const currentExercise = state.workout.activeWorkout.currentExercise
    const totalSets = currentExercise.sets.length
    
    if (targetSetNumber < 1 || targetSetNumber > totalSets) {
      return rejectWithValue(`Invalid set number. Exercise has ${totalSets} sets (1-${totalSets})`)
    }

    dispatch(jumpToSetReducer({ targetSetNumber, reason }))

    return { 
      success: true,
      message: `Jumped to set ${targetSetNumber} of ${currentExercise.name}. Tell me when ready`,
      targetSetNumber,
      exerciseName: currentExercise.name
    }
  }
)

// =============================================================================
// NAVIGATION ACTIONS
// =============================================================================

export const previousSet = createAsyncThunk(
  'workout/previousSet',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState
    
    if (!state.workout.activeWorkout?.currentExercise) {
      return rejectWithValue('No active exercise')
    }
    
    const currentSetIndex = state.workout.activeWorkout.currentSetIndex
    if (currentSetIndex === 0) {
      return rejectWithValue('Already at first set')
    }

    dispatch(previousSetReducer())

    return { 
      success: true,
      message: `Moved to previous set: ${currentSetIndex}`,
      setNumber: currentSetIndex
    }
  }
)

export const nextSet = createAsyncThunk(
  'workout/nextSet',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState
    
    if (!state.workout.activeWorkout?.currentExercise) {
      return rejectWithValue('No active exercise')
    }
    
    const currentSetIndex = state.workout.activeWorkout.currentSetIndex
    const totalSets = state.workout.activeWorkout.currentExercise.sets.length
    
    if (currentSetIndex >= totalSets - 1) {
      return rejectWithValue('Already at last set')
    }

    dispatch(nextSetReducer())

    return { 
      success: true,
      message: `Moved to next set: ${currentSetIndex + 2}`,
      setNumber: currentSetIndex + 2
    }
  }
)

// =============================================================================
// STATUS AND INFO ACTIONS
// =============================================================================

export const getWorkoutStatus = createAsyncThunk(
  'workout/getWorkoutStatus',
  async (_, { getState }) => {
    const state = getState() as RootState
    
    if (!state.workout.activeWorkout) {
      return { 
        success: true,
        message: 'No active workout',
        hasActiveWorkout: false
      }
    }
    
    const exercise = state.workout.activeWorkout.currentExercise
    const setNum = state.workout.activeWorkout.currentSetIndex + 1
    const totalSets = exercise?.sets.length || 0
    const exerciseNum = state.workout.activeWorkout.currentExerciseIndex + 1
    const totalExercises = state.workout.session?.exercises.length || 0
    
    const statusMessage = `Workout: ${state.workout.session?.name} | Exercise ${exerciseNum}/${totalExercises}: ${exercise?.name} | Set ${setNum}/${totalSets} | State: ${state.workout.status}`
    
    return { 
      success: true,
      message: statusMessage,
      hasActiveWorkout: true,
      data: {
        workoutName: state.workout.session?.name,
        exerciseName: exercise?.name,
        exerciseProgress: `${exerciseNum}/${totalExercises}`,
        setProgress: `${setNum}/${totalSets}`,
        status: state.workout.status,
        isPaused: state.workout.activeWorkout.isPaused
      }
    }
  }
)

export const getExerciseInstructions = createAsyncThunk(
  'workout/getExerciseInstructions',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    
    if (!state.workout.activeWorkout?.currentExercise) {
      return rejectWithValue('No current exercise')
    }
    
    const exercise = state.workout.activeWorkout.currentExercise
    const currentSet = state.workout.activeWorkout.currentSet
    
    const instructions = exercise.description || `Exercise: ${exercise.name}`
    const detailedInstructions = `${instructions}\n\nCurrent set: ${currentSet?.targetReps} reps${currentSet?.targetWeight ? ` at ${currentSet.targetWeight}kg` : ''}`
    
    return { 
      success: true,
      message: detailedInstructions,
      data: {
        exerciseName: exercise.name,
        description: exercise.description,
        targetReps: currentSet?.targetReps,
        targetWeight: currentSet?.targetWeight
      }
    }
  }
)

// =============================================================================
// TOOL ALIASES (for ElevenLabs client tools)
// =============================================================================

export const start_set = confirmReadyAndStartSet
export const complete_set = completeSet
export const pause_set = pauseSet
export const resume_set = resumeSet
export const restart_set = jumpToSet // restart = jump to same set
export const extend_rest = adjustRestTime // extend by adding time
export const jump_to_set = jumpToSet
export const adjust_weight = adjustWeight
export const adjust_reps = adjustReps
export const adjust_rest_time = adjustRestTime
export const get_workout_status = getWorkoutStatus
export const get_exercise_instructions = getExerciseInstructions
export const pause_for_issue = pauseSet // same as pause but with issue context