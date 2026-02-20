import { createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'
import { WorkoutSession } from '../../types/workout'
import { enhancedApi } from '../api/enhancedApi'
import type { RootState } from '../index'
import {
    adjustReps as adjustRepsReducer,
    adjustRestTime as adjustRestTimeReducer,
    adjustWeight as adjustWeightReducer,
    completeExercise as completeExerciseReducer,
    completeSet as completeSetReducer,
    completeWarmup as completeWarmupReducer,
    completeWorkout as completeWorkoutReducer,
    confirmReadyAndStartSet as confirmReadyAndStartSetReducer,
    extendRest as extendRestReducer,
    finishWorkoutEarly as finishWorkoutEarlyReducer,
    leaveWorkoutForLater as leaveWorkoutForLaterReducer,
    jumpToExerciseAndQueueCurrent as jumpToExerciseAndQueueCurrentReducer,
    jumpToExercise as jumpToExerciseReducer,
    jumpToSet as jumpToSetReducer,
    nextSet as nextSetReducer,
    pauseSet as pauseSetReducer,
    previousSet as previousSetReducer,
    resumeSet as resumeSetReducer,
    resumeWorkoutFromSession as resumeWorkoutFromSessionReducer,
    selectWorkoutFromEntries as selectWorkoutFromEntriesReducer,
    selectWorkout as selectWorkoutReducer,
    skipWarmup as skipWarmupReducer,
    startExercisePreparation as startExercisePreparationReducer,
    startRest as startRestReducer,
    // Warmup reducers
    startWarmup as startWarmupReducer,
    triggerRestEnding as triggerRestEndingReducer,
    type WorkoutEntryNode,
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

// New action to select workout from database entries
export const selectWorkoutFromEntries = createAsyncThunk(
  'workout/selectWorkoutFromEntries',
  async (
    { workoutEntries, planId, dayName }: { workoutEntries: WorkoutEntryNode[]; planId: string; dayName: string },
    { getState, dispatch, rejectWithValue }
  ) => {
    const state = getState() as RootState
    
    if (state.workout.status !== 'inactive') {
      return rejectWithValue('Cannot select workout - already active')
    }

    if (workoutEntries.length === 0) {
      return rejectWithValue('No workout entries provided')
    }

    // Get user ID from auth session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.id) {
      return rejectWithValue('User not authenticated')
    }
    const userId = session.user.id

    // Extract workout metadata from first entry
    const firstEntry = workoutEntries[0]
    const weekNumber = firstEntry.week_number
    const day = firstEntry.day
    const date = firstEntry.date || new Date().toISOString().split('T')[0] // Use today's date if not set
    
    // Calculate total sets across all entries
    const totalSets = workoutEntries.reduce((sum, entry) => sum + entry.sets, 0)
    const totalExercises = workoutEntries.length

    // Fetch exercise data separately for each unique exercise_id to avoid stale nested relationship data
    // This ensures we always use fresh exercise data, not cached nested data from GetWorkoutDay query
    // NO FALLBACKS - must fetch fresh data or fail
    const uniqueExerciseIds = [...new Set(workoutEntries.map(entry => entry.exercise_id))]
    const exerciseDataMap = new Map<string, any>()
    
    // Fetch all exercises in parallel - NO FALLBACKS
    const exercisePromises = uniqueExerciseIds.map(async (exerciseId) => {
      const result = await dispatch(
        enhancedApi.endpoints.GetExerciseById.initiate({ id: exerciseId })
      ).unwrap()
      const exercise = result?.exercisesCollection?.edges?.[0]?.node
      if (!exercise) {
        throw new Error(`Failed to fetch exercise ${exerciseId}`)
      }
      exerciseDataMap.set(exerciseId, exercise)
    })
    
    await Promise.all(exercisePromises)
    
    // Enrich workout entries with fresh exercise data - NO FALLBACKS
    const enrichedEntries = workoutEntries.map(entry => {
      const freshExercise = exerciseDataMap.get(entry.exercise_id)
      if (!freshExercise) {
        throw new Error(`Missing fresh exercise data for ${entry.exercise_id}`)
      }
      return {
        ...entry,
        exercises: freshExercise
      }
    })
    
    // Replace workoutEntries with enriched version
    workoutEntries = enrichedEntries as WorkoutEntryNode[]

    // Use atomic database function to start workout session
    // This function atomically completes any existing active sessions and creates a new one
    // Eliminates race conditions entirely
    let sessionId: string
    try {
      const { data: sessionData, error: rpcError } = await supabase.rpc('start_workout_session', {
        p_user_id: userId,
        p_workout_plan_id: planId,
        p_week_number: weekNumber,
        p_day: day,
        p_day_name: dayName,
        p_date: date,
        p_total_exercises: totalExercises,
        p_total_sets: totalSets,
      })

      if (rpcError) {
        throw rpcError
      }

      if (!sessionData || !sessionData[0]?.id) {
        return rejectWithValue('Failed to create workout session - no session ID returned from function')
      }

      sessionId = sessionData[0].id
      console.log('✅ Created workout session atomically:', sessionId)
    } catch (error: any) {
      console.error('Failed to start workout session:', error)
      return rejectWithValue(`Failed to start workout session: ${error?.message || String(error)}`)
    }

    // Dispatch reducer with sessionId
    dispatch(selectWorkoutFromEntriesReducer(workoutEntries, planId, dayName, sessionId))

    return { 
      success: true,
      message: `Selected workout: ${dayName}`,
      workoutName: dayName,
      planId,
      sessionId,
      entryCount: workoutEntries.length
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
    
    // Check for active workout - either session (legacy) or workoutEntries (new structure)
    const hasWorkout = state.workout.activeWorkout && (
      state.workout.session !== null || 
      (state.workout.workoutEntries !== null && state.workout.workoutEntries.length > 0)
    );
    
    if (!hasWorkout) {
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
    
    // Allow completion if: (1) exercising, OR (2) selected status with active warmup (treating warmup as a set)
    const isWarmupCompletion = state.workout.status === 'selected' && state.workout.warmup.phase === 'active';
    const isValidState = state.workout.status === 'exercising' || isWarmupCompletion;
    
    if (!isValidState || !state.workout.activeWorkout) {
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

/** Save progress to DB as paused and clear Redux. Session stays resumable (GetActiveWorkoutSession will find it). */
export const saveWorkoutForLater = createAsyncThunk(
  'workout/saveWorkoutForLater',
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState
    const sessionId = state.workout.sessionId
    const activeWorkout = state.workout.activeWorkout

    if (!sessionId || sessionId.startsWith('temp-') || !activeWorkout) {
      dispatch(leaveWorkoutForLaterReducer())
      return { success: true }
    }

    const totalElapsedMs = Date.now() - activeWorkout.startTime.getTime()
    const totalTimeMs = Math.max(0, totalElapsedMs - (activeWorkout.totalPauseTime || 0))
    const totalPauseTimeMs = activeWorkout.totalPauseTime || 0
    const lastActivityAt = new Date().toISOString()

    try {
      await dispatch(
        enhancedApi.endpoints.UpdateWorkoutSessionProgress.initiate({
          id: sessionId,
          currentExerciseIndex: activeWorkout.currentExerciseIndex,
          currentSetIndex: activeWorkout.currentSetIndex,
          completedExercises: activeWorkout.completedExercises,
          completedSets: activeWorkout.completedSets,
          totalTimeMs: String(totalTimeMs),
          totalPauseTimeMs: String(totalPauseTimeMs),
          lastActivityAt,
        })
      ).unwrap()
      await dispatch(
        enhancedApi.endpoints.UpdateWorkoutSessionStatus.initiate({
          id: sessionId,
          status: 'paused',
          lastActivityAt,
        })
      ).unwrap()
    } catch (e) {
      console.error('Save for later: failed to sync progress to DB', e)
    }

    dispatch(leaveWorkoutForLaterReducer())
    return { success: true }
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

export const extendRest = createAsyncThunk(
  'workout/extendRest',
  async ({ additionalSeconds }: { additionalSeconds: number }, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState
    
    if (!['resting', 'rest-ending'].includes(state.workout.status)) {
      return rejectWithValue(`Can only extend rest during rest period, currently: ${state.workout.status}`)
    }

    if (!state.workout.activeWorkout?.currentSet) {
      return rejectWithValue('No active workout to extend rest for')
    }

    dispatch(extendRestReducer({ additionalSeconds }))
    
    return { 
      success: true,
      message: `Extended current rest by ${additionalSeconds} seconds`,
      additionalSeconds 
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

export const jumpToExerciseAndQueueCurrent = createAsyncThunk(
  'workout/jumpToExerciseAndQueueCurrent',
  async ({ targetExerciseSlug, reason }: { targetExerciseSlug: string; reason: string }, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState;
    
    if (!state.workout.workoutEntries || !state.workout.activeWorkout || !state.workout.planId || !state.workout.dayName) {
      return rejectWithValue('No active workout or missing workout data');
    }
    
    const currentIndex = state.workout.activeWorkout.currentExerciseIndex;
    const currentEntry = state.workout.workoutEntries[currentIndex];
    
    if (!currentEntry) {
      return rejectWithValue('Current exercise entry not found');
    }
    
    // Find target exercise by fetching fresh exercise data for all entries (NO FALLBACKS to nested cache)
    // This ensures we match by fresh slug, not stale nested cache
    const workoutEntries = state.workout.workoutEntries || [];
    const uniqueExerciseIds = [...new Set(workoutEntries.map(entry => entry.exercise_id))];
    const exerciseSlugMap = new Map<string, string>();
    
    // Fetch all exercises in parallel to get fresh slugs
    const exercisePromises = uniqueExerciseIds.map(async (exerciseId) => {
      const result = await dispatch(
        enhancedApi.endpoints.GetExerciseById.initiate({ id: exerciseId })
      ).unwrap();
      const exercise = result?.exercisesCollection?.edges?.[0]?.node;
      if (!exercise?.slug) {
        throw new Error(`Exercise ${exerciseId} missing slug`);
      }
      exerciseSlugMap.set(exerciseId, exercise.slug);
    });
    
    await Promise.all(exercisePromises);
    
    // Find target exercise by matching fresh slug
    const targetIndex = workoutEntries.findIndex(
      entry => exerciseSlugMap.get(entry.exercise_id) === targetExerciseSlug
    );
    
    if (targetIndex === -1) {
      const availableSlugs = Array.from(exerciseSlugMap.values()).join(', ');
      return rejectWithValue(`Exercise not found: ${targetExerciseSlug}. Available: ${availableSlugs}`);
    }
    
    if (targetIndex === currentIndex) {
      return rejectWithValue('Cannot queue current exercise to itself');
    }
    
    // Get week number from current entry
    const weekNumber = currentEntry.week_number || 1;
    
    // Call reducer to update Redux state (reorders array)
    dispatch(jumpToExerciseAndQueueCurrentReducer({ targetExerciseSlug, reason }));
    
    // Get updated state after reducer
    const updatedState = getState() as RootState;
    const reorderedEntries = updatedState.workout.workoutEntries;
    const updatedActiveWorkout = updatedState.workout.activeWorkout;
    
    if (!reorderedEntries || !updatedActiveWorkout) {
      return rejectWithValue('Failed to reorder exercises');
    }
    
    // Sync positions to database
    try {
      // Update each entry's position in the database
      const positionUpdates = reorderedEntries.map((entry, index) => ({
        entryId: entry.id,
        newPosition: index + 1,
      }));
      
      // Update positions individually via Supabase client
      const updatePromises = positionUpdates.map(({ entryId, newPosition }) =>
        supabase
          .from('workout_entries')
          .update({ position: newPosition })
          .eq('id', entryId)
      );
      
      const results = await Promise.all(updatePromises);
      const errors = results.filter(r => r.error);
      
      if (errors.length > 0) {
        console.warn('⚠️ Some position updates failed:', errors);
      }
      
      // Fetch fresh exercise names for logging (NO FALLBACKS)
      const currentExerciseResult = await dispatch(
        enhancedApi.endpoints.GetExerciseById.initiate({ id: currentEntry.exercise_id })
      ).unwrap();
      const currentExerciseName = currentExerciseResult?.exercisesCollection?.edges?.[0]?.node?.name || 'Unknown';
      
      const targetEntry = reorderedEntries[updatedActiveWorkout.currentExerciseIndex];
      const targetExerciseResult = await dispatch(
        enhancedApi.endpoints.GetExerciseById.initiate({ id: targetEntry.exercise_id })
      ).unwrap();
      const targetExerciseName = targetExerciseResult?.exercisesCollection?.edges?.[0]?.node?.name || 'Unknown';
      
      console.log('✅ Synced exercise reorder to database:', {
        movedExercise: currentExerciseName,
        targetExercise: targetExerciseName,
        newOrder: positionUpdates.map(p => p.newPosition),
      });
      
      return {
        success: true,
        message: `Jumped to ${targetExerciseSlug} and queued current exercise`,
        data: {
          currentExerciseIndex: updatedActiveWorkout.currentExerciseIndex,
          reorderedCount: reorderedEntries.length,
        },
      };
    } catch (error: any) {
      console.error('❌ Failed to sync exercise reorder to database:', error);
      // Don't reject - state is already updated, just log the error
      return {
        success: true,
        message: `Jumped to ${targetExerciseSlug} (DB sync failed, but state updated)`,
        warning: 'Database sync failed',
      };
    }
  }
);

export const jumpToExercise = createAsyncThunk(
  'workout/jumpToExercise',
  async ({ exerciseSlug, reason }: { exerciseSlug: string; reason: string }, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState
    
    if (!state.workout.activeWorkout) {
      return rejectWithValue('No active workout')
    }
    
    if (!state.workout.workoutEntries || state.workout.workoutEntries.length === 0) {
      return rejectWithValue('No workout entries available')
    }
    
    // Find exercise by slug using fresh exercise data (NO FALLBACKS to nested cache)
    const workoutEntries = state.workout.workoutEntries || [];
    const uniqueExerciseIds = [...new Set(workoutEntries.map(entry => entry.exercise_id))];
    const exerciseSlugMap = new Map<string, { id: string; name: string }>();
    
    // Fetch all exercises in parallel to get fresh slugs and names
    const exercisePromises = uniqueExerciseIds.map(async (exerciseId) => {
      const result = await dispatch(
        enhancedApi.endpoints.GetExerciseById.initiate({ id: exerciseId })
      ).unwrap();
      const exercise = result?.exercisesCollection?.edges?.[0]?.node;
      if (!exercise?.slug) {
        throw new Error(`Exercise ${exerciseId} missing slug`);
      }
      exerciseSlugMap.set(exercise.slug, { id: exerciseId, name: exercise.name });
    });
    
    await Promise.all(exercisePromises);
    
    // Find exercise by matching fresh slug
    const exerciseData = exerciseSlugMap.get(exerciseSlug);
    if (!exerciseData) {
      const availableSlugs = Array.from(exerciseSlugMap.keys()).join(', ');
      return rejectWithValue(`Exercise with slug "${exerciseSlug}" not found. Available exercises: ${availableSlugs}`)
    }
    
    const exerciseIndex = workoutEntries.findIndex(
      entry => entry.exercise_id === exerciseData.id
    );
    
    if (exerciseIndex === -1) {
      return rejectWithValue(`Exercise entry not found for slug "${exerciseSlug}"`)
    }
    
    const targetEntry = workoutEntries[exerciseIndex]
    const exerciseName = exerciseData.name
    
    dispatch(jumpToExerciseReducer({ exerciseSlug, reason }))
    
    return { 
      success: true,
      message: `Jumped to exercise: ${exerciseName}. Tell me when ready`,
      exerciseSlug,
      exerciseName,
      exercisePosition: exerciseIndex + 1,
      totalExercises: state.workout.workoutEntries.length
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
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState
    
    if (!state.workout.activeWorkout) {
      return { 
        success: true,
        message: 'No active workout',
        hasActiveWorkout: false
      }
    }
    
    // Check warmup phase first - if warmup is active or ready, user is NOT in exercises yet
    const warmupPhase = state.workout.warmup.phase
    const workoutName = state.workout.session?.name || state.workout.dayName || 'Workout'
    
    // If warmup is ready or active, return warmup status instead of exercise status
    if (warmupPhase === 'ready' || warmupPhase === 'active') {
      const warmupRemaining = Math.floor(state.workout.warmup.remaining)
      const warmupMinutes = Math.floor(warmupRemaining / 60)
      const warmupSeconds = warmupRemaining % 60
      const warmupTimeStr = warmupPhase === 'active' 
        ? `${warmupMinutes}:${warmupSeconds.toString().padStart(2, '0')} remaining`
        : 'ready to start'
      
      return {
        success: true,
        message: `Workout: ${workoutName} | Warmup Phase: ${warmupPhase} (${warmupTimeStr}) | State: ${state.workout.status}`,
        hasActiveWorkout: true,
        isWarmup: true,
        data: {
          workoutName: workoutName,
          isWarmup: true,
          warmupPhase: warmupPhase,
          warmupRemaining: warmupRemaining,
          status: state.workout.status,
          exerciseName: null,
          exerciseProgress: null,
          setProgress: null,
          isPaused: false,
          allExercises: [],
          currentExerciseIndex: -1,
          currentExerciseSlug: null,
          currentExerciseAlternatives: [],
          currentWorkoutEntryId: null
        }
      }
    }
    
    const exercise = state.workout.activeWorkout.currentExercise
    const setNum = state.workout.activeWorkout.currentSetIndex + 1
    const totalSets = exercise?.sets.length || 0
    const exerciseNum = state.workout.activeWorkout.currentExerciseIndex + 1
    // Get total exercises from activeWorkout (set during selectWorkoutFromEntries) or workoutEntries or session
    const totalExercises = state.workout.activeWorkout?.totalExercises 
      || state.workout.workoutEntries?.length 
      || 0
    
    const statusMessage = `Workout: ${workoutName} | Exercise ${exerciseNum}/${totalExercises}: ${exercise?.name} | Set ${setNum}/${totalSets} | State: ${state.workout.status}`
    
    const currentExerciseIndex = state.workout.activeWorkout.currentExerciseIndex
    const currentEntry = state.workout.workoutEntries?.[currentExerciseIndex]
    
    // Build list of all exercises; use setsCompleted (by entry id) for completion so reordering doesn't break status
    const setsCompleted = state.workout.activeWorkout?.setsCompleted ?? [];
    const allExercises = state.workout.workoutEntries?.map((entry, index) => {
      const completedSetsForEntry = setsCompleted.filter((sc) => sc.setId.startsWith(`${entry.id}-set-`));
      const isCurrent = index === currentExerciseIndex;
      const isCompleted = completedSetsForEntry.length >= entry.sets && entry.sets > 0;
      const isUpcoming = !isCurrent && !isCompleted;
      
      return {
        position: index + 1,
        name: entry.exercises?.name || 'Unknown Exercise',
        slug: entry.exercises?.slug || '',
        status: isCurrent ? 'current' : isCompleted ? 'completed' : isUpcoming ? 'upcoming' : 'pending',
        sets: entry.sets,
        reps: entry.reps,
        weight: entry.weight,
        isCurrent,
        isCompleted,
        isUpcoming
      }
    }) || []
    
    // Get alternatives ONLY for current exercise (nested alternatives may be stale, but we fetch fresh in ExerciseAdjustModal)
    const currentExerciseAlternatives = currentEntry?.workout_entry_alternativesCollection?.edges?.map(edge => ({
      id: edge.node.exercises?.id,
      name: edge.node.exercises?.name || 'Unknown',
      slug: edge.node.exercises?.slug || '',
      note: edge.node.note || ''
    })) || []
    
    return { 
      success: true,
      message: statusMessage,
      hasActiveWorkout: true,
      isWarmup: false,
      data: {
        workoutName: workoutName,
        exerciseName: exercise?.name,
        exerciseProgress: `${exerciseNum}/${totalExercises}`,
        setProgress: `${setNum}/${totalSets}`,
        status: state.workout.status,
        isPaused: state.workout.activeWorkout.isPaused,
        // All exercises with names and slugs
        allExercises: allExercises,
        currentExerciseIndex: currentExerciseIndex,
        currentExerciseSlug: currentEntry?.exercises?.slug || '',
        // Alternatives ONLY for current exercise
        currentExerciseAlternatives: currentExerciseAlternatives,
        currentWorkoutEntryId: currentEntry?.id || null,
        isWarmup: false
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
    
    // Build comprehensive exercise data for AI agent
    const exerciseData: Record<string, any> = {
      exerciseName: exercise.name,
      description: exercise.description,
      targetReps: currentSet?.targetReps,
      targetWeight: currentSet?.targetWeight,
      instructions: exercise.instructions,
      tips: exercise.tips,
      muscleGroups: exercise.muscleGroups,
      equipmentText: exercise.equipmentText,
      videoUrl: exercise.videoUrl,
    };

    // Add progression and safety data if available
    if (exercise.repLimitationsProgressionRules) {
      exerciseData.repLimitationsProgressionRules = exercise.repLimitationsProgressionRules;
    }
    if (exercise.progressionByClientFeedback) {
      exerciseData.progressionByClientFeedback = exercise.progressionByClientFeedback;
    }
    if (exercise.painInjuryProtocol) {
      exerciseData.painInjuryProtocol = exercise.painInjuryProtocol;
    }
    if (exercise.trainerNotes) {
      exerciseData.trainerNotes = exercise.trainerNotes;
    }
    
    return { 
      success: true,
      message: detailedInstructions,
      data: exerciseData
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
export const extend_rest = extendRest // extend current rest only
export const jump_to_set = jumpToSet
export const adjust_weight = adjustWeight
export const adjust_reps = adjustReps
export const adjust_rest_time = adjustRestTime
export const get_workout_status = getWorkoutStatus
export const get_exercise_instructions = getExerciseInstructions
export const pause_for_issue = pauseSet // same as pause but with issue context

// =============================================================================
// AD DISPLAY ACTION
// =============================================================================

export const showAd = createAsyncThunk(
  'workout/showAd',
  async () => {
    return { 
      success: true,
      message: 'Showing product recommendation',
      productName: 'Battery Complete Whey 1800g',
      productLink: 'https://www.proteini.si/sl/beljakovine/sirotka/battery-complete-whey-1800g',
      imageName: 'ad.webp'
    }
  }
)

export const show_ad = showAd

// =============================================================================
// WARMUP ACTIONS
// =============================================================================

export const startWarmup = createAsyncThunk(
  'workout/startWarmup',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState
    
    if (state.workout.status !== 'selected') {
      return rejectWithValue(`Cannot start warmup from state: ${state.workout.status}`)
    }
    
    if (state.workout.warmup.phase !== 'ready') {
      return rejectWithValue(`Warmup phase is ${state.workout.warmup.phase}, expected 'ready'`)
    }

    dispatch(startWarmupReducer())

    return { 
      success: true,
      message: 'Warmup started - 10 minute timer active',
      duration: 600
    }
  }
)

export const completeWarmup = createAsyncThunk(
  'workout/completeWarmup',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState
    
    if (state.workout.warmup.phase !== 'active') {
      return rejectWithValue(`Cannot complete warmup from phase: ${state.workout.warmup.phase}`)
    }

    dispatch(completeWarmupReducer())
    
    // Auto-transition to preparing for first exercise
    dispatch(startExercisePreparationReducer())

    return { 
      success: true,
      message: 'Warmup completed - starting first exercise'
    }
  }
)

export const skipWarmup = createAsyncThunk(
  'workout/skipWarmup',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState
    
    if (state.workout.warmup.phase !== 'ready' && state.workout.warmup.phase !== 'active') {
      return rejectWithValue(`Cannot skip warmup from phase: ${state.workout.warmup.phase}`)
    }

    dispatch(skipWarmupReducer())
    
    // Auto-transition to preparing for first exercise
    dispatch(startExercisePreparationReducer())

    return { 
      success: true,
      message: 'Warmup skipped - starting first exercise'
    }
  }
)

// Tool aliases for warmup
export const start_warmup = startWarmup
export const complete_warmup = completeWarmup
export const skip_warmup = skipWarmup

// =============================================================================
// RESUME WORKOUT FROM SESSION (direct reducer action, no async logic needed)
// =============================================================================

export const resumeWorkoutFromSession = resumeWorkoutFromSessionReducer