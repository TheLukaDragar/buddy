import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { enhancedApi } from '../store/api/enhancedApi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectSessionId } from '../store/slices/workoutSlice';

/**
 * Syncs workout completion to the database when the app goes to background.
 * Safety net for when the user closes the app before the normal completion sync finishes.
 */
export function useWorkoutSyncOnBackground() {
  const dispatch = useAppDispatch();
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const sessionId = useAppSelector(selectSessionId);
  const status = useAppSelector((s) => s.workout.status);
  const activeWorkout = useAppSelector((s) => s.workout.activeWorkout);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const prevState = appStateRef.current;
      appStateRef.current = nextState;

      if (prevState === 'active' && nextState === 'background') {
        if (
          status === 'workout-completed' &&
          sessionId &&
          !sessionId.startsWith('temp-') &&
          activeWorkout
        ) {
          const totalElapsedMs = Date.now() - activeWorkout.startTime.getTime();
          const totalTimeMs = Math.max(
            0,
            totalElapsedMs - (activeWorkout.totalPauseTime || 0)
          );
          const totalPauseTimeMs = activeWorkout.totalPauseTime || 0;

          dispatch(
            enhancedApi.endpoints.CompleteWorkoutSession.initiate({
              id: sessionId,
              status: 'completed',
              completedAt: new Date().toISOString(),
              isFullyCompleted:
                activeWorkout.completedExercises === activeWorkout.totalExercises,
              finishedEarly: false,
              completedExercises: activeWorkout.completedExercises,
              completedSets: activeWorkout.completedSets,
              totalTimeMs: totalTimeMs.toString(),
              totalPauseTimeMs: totalPauseTimeMs.toString(),
            })
          ).catch((err) => {
            console.error('[useWorkoutSyncOnBackground] Sync failed:', err);
          });
        }
      }
    });

    return () => subscription.remove();
  }, [dispatch, sessionId, status, activeWorkout]);
}
