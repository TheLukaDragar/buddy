-- ============================================================================
-- Migration: Atomic Workout Session Start Function
-- ============================================================================
-- Creates a database function that atomically completes any existing active
-- sessions and creates a new one, eliminating race conditions.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.start_workout_session(
  p_user_id UUID,
  p_workout_plan_id UUID,
  p_week_number INTEGER,
  p_day weekday,
  p_day_name TEXT,
  p_date DATE,
  p_total_exercises INTEGER,
  p_total_sets INTEGER
)
RETURNS SETOF public.workout_sessions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_session_id UUID;
  v_abandoned_status TEXT := 'abandoned';
  v_active_statuses TEXT[] := ARRAY['selected', 'preparing', 'exercising', 'paused'];
BEGIN
  -- Lock and complete any existing active sessions for this user
  -- This ensures atomicity - no race conditions possible
  UPDATE public.workout_sessions
  SET 
    status = v_abandoned_status,
    completed_at = NOW(),
    is_fully_completed = FALSE,
    finished_early = TRUE,
    updated_at = NOW()
  WHERE user_id = p_user_id
    AND status = ANY(v_active_statuses);
  
  -- Create the new session
  INSERT INTO public.workout_sessions (
    user_id,
    workout_plan_id,
    week_number,
    day,
    day_name,
    date,
    status,
    total_exercises,
    total_sets,
    started_at,
    current_exercise_index,
    current_set_index,
    completed_exercises,
    completed_sets
  )
  VALUES (
    p_user_id,
    p_workout_plan_id,
    p_week_number,
    p_day,
    p_day_name,
    p_date,
    'selected',
    p_total_exercises,
    p_total_sets,
    NOW(),
    0,
    0,
    0,
    0
  )
  RETURNING id INTO v_new_session_id;
  
  -- Return the new session - SETOF avoids OUT parameter conflicts
  RETURN QUERY
  SELECT ws.*
  FROM public.workout_sessions ws
  WHERE ws.id = v_new_session_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.start_workout_session TO authenticated;
GRANT EXECUTE ON FUNCTION public.start_workout_session TO anon;

COMMENT ON FUNCTION public.start_workout_session IS 
'Atomically completes any existing active sessions for a user and creates a new workout session. 
Eliminates race conditions by performing all operations in a single transaction.';

