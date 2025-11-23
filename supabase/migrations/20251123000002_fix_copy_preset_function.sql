-- ============================================================================
-- Migration: Fix copy_preset_to_plan function
-- ============================================================================
-- Use exercise_id as default streak_exercise_id when not set in preset
-- ============================================================================

CREATE OR REPLACE FUNCTION public.copy_preset_to_plan(
  p_preset_id UUID,
  p_workout_plan_id UUID,
  p_date DATE,
  p_week_number INTEGER,
  p_day public.weekday
)
RETURNS SETOF public.workout_entries AS $$
DECLARE
  v_preset_entry RECORD;
  v_new_entry_id UUID;
  v_preset RECORD;
BEGIN
  -- Get preset details
  SELECT * INTO v_preset FROM public.workout_presets WHERE id = p_preset_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Preset not found: %', p_preset_id;
  END IF;

  -- Copy each preset entry to workout_entries
  FOR v_preset_entry IN
    SELECT * FROM public.workout_preset_entries
    WHERE preset_id = p_preset_id
    ORDER BY position
  LOOP
    -- Insert the workout entry
    -- Use exercise_id as streak_exercise_id if not set in preset
    INSERT INTO public.workout_entries (
      workout_plan_id,
      week_number,
      day_name,
      day,
      date,
      exercise_id,
      sets,
      reps,
      weight,
      time,
      notes,
      streak_exercise_id,
      streak_exercise_notes,
      preset_id
    ) VALUES (
      p_workout_plan_id,
      p_week_number,
      v_preset.day_name,
      p_day,
      p_date,
      v_preset_entry.exercise_id,
      v_preset_entry.sets,
      v_preset_entry.reps,
      v_preset_entry.weight,
      v_preset_entry.time,
      v_preset_entry.notes,
      COALESCE(v_preset_entry.streak_exercise_id, v_preset_entry.exercise_id),
      v_preset_entry.streak_exercise_notes,
      p_preset_id
    )
    RETURNING id INTO v_new_entry_id;

    -- Copy alternatives for this entry
    INSERT INTO public.workout_entry_alternatives (
      workout_entry_id,
      alternative_exercise_id,
      note,
      position
    )
    SELECT
      v_new_entry_id,
      alternative_exercise_id,
      note,
      position
    FROM public.workout_preset_entry_alternatives
    WHERE preset_entry_id = v_preset_entry.id;

    -- Return the created entry
    RETURN QUERY SELECT * FROM public.workout_entries WHERE id = v_new_entry_id;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
