-- Database function to atomically swap exercise with alternative
-- This handles moving the current exercise to alternatives and promoting an alternative to main

CREATE OR REPLACE FUNCTION public.swap_exercise_with_alternative(
  p_workout_entry_id UUID,
  p_new_exercise_id UUID,
  p_adjustment_reason TEXT
)
RETURNS TABLE(
  entry_id UUID,
  old_exercise_id UUID,
  new_exercise_id UUID,
  affected_rows INTEGER
)
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_exercise_id UUID;
  v_old_exercise_name TEXT;
  v_alternative_record RECORD;
  v_max_position INTEGER;
  v_rows_affected INTEGER := 0;
BEGIN
  -- Get current exercise info
  SELECT exercise_id, e.name
  INTO v_old_exercise_id, v_old_exercise_name
  FROM workout_entries we
  JOIN exercises e ON e.id = we.exercise_id
  WHERE we.id = p_workout_entry_id;

  IF v_old_exercise_id IS NULL THEN
    RAISE EXCEPTION 'Workout entry not found: %', p_workout_entry_id;
  END IF;

  -- Check if new exercise is in the alternatives list
  SELECT *
  INTO v_alternative_record
  FROM workout_entry_alternatives
  WHERE workout_entry_id = p_workout_entry_id
    AND alternative_exercise_id = p_new_exercise_id;

  IF v_alternative_record.id IS NULL THEN
    RAISE EXCEPTION 'Alternative exercise % not found for workout entry %', 
      p_new_exercise_id, p_workout_entry_id;
  END IF;

  -- Start transaction operations
  
  -- 1. Remove the selected alternative from the junction table
  DELETE FROM workout_entry_alternatives
  WHERE id = v_alternative_record.id;
  v_rows_affected := v_rows_affected + 1;

  -- 2. Get the next position for the old exercise (now becoming an alternative)
  SELECT COALESCE(MAX(position), 0) + 1
  INTO v_max_position
  FROM workout_entry_alternatives
  WHERE workout_entry_id = p_workout_entry_id;

  -- 3. Add the old exercise as an alternative with note
  INSERT INTO workout_entry_alternatives (
    workout_entry_id,
    alternative_exercise_id,
    note,
    position
  ) VALUES (
    p_workout_entry_id,
    v_old_exercise_id,
    'Original exercise: ' || v_old_exercise_name,
    v_max_position
  );
  v_rows_affected := v_rows_affected + 1;

  -- 4. Update the workout entry with the new exercise
  UPDATE workout_entries
  SET 
    exercise_id = p_new_exercise_id,
    is_adjusted = TRUE,
    adjustment_reason = p_adjustment_reason
  WHERE id = p_workout_entry_id;
  v_rows_affected := v_rows_affected + 1;

  -- Return results
  RETURN QUERY
  SELECT 
    p_workout_entry_id,
    v_old_exercise_id,
    p_new_exercise_id,
    v_rows_affected;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION swap_exercise_with_alternative(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION swap_exercise_with_alternative(UUID, UUID, TEXT) TO service_role;

-- Add comment
COMMENT ON FUNCTION swap_exercise_with_alternative IS 
'Atomically swaps the main exercise with one of its alternatives. Removes the selected alternative from the list and adds the old main exercise as a new alternative with an "Original exercise" note.';
