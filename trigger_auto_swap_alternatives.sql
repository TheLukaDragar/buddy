-- Trigger function to automatically swap alternatives when exercise_id changes
-- This runs whenever a workout_entry's exercise_id is updated
-- If the new exercise_id was in the alternatives list, it swaps them automatically

CREATE OR REPLACE FUNCTION public.auto_swap_workout_alternatives()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_alternative_record RECORD;
  v_max_position INTEGER;
  v_saved_note TEXT;
  v_restored_note TEXT;
  v_existing_alt_id UUID;
  v_is_first_swap BOOLEAN;
BEGIN
  -- Only proceed if exercise_id actually changed
  IF OLD.exercise_id = NEW.exercise_id THEN
    RETURN NEW;
  END IF;

  -- Check if the new exercise_id exists in the alternatives for this workout entry
  SELECT * INTO v_alternative_record
  FROM workout_entry_alternatives
  WHERE workout_entry_id = NEW.id
    AND alternative_exercise_id = NEW.exercise_id;

  -- If the new exercise was an alternative (swap scenario)
  IF FOUND THEN
    -- Check if this is the first swap BEFORE saving any notes
    SELECT NOT EXISTS (
      SELECT 1 FROM public.workout_entry_exercise_notes 
      WHERE workout_entry_id = NEW.id
    ) INTO v_is_first_swap;
    
    -- Save the note before deleting (to preserve notes that were set before swaps)
    v_saved_note := v_alternative_record.note;
    
    -- Save note to persistent storage before deleting
    IF v_saved_note IS NOT NULL AND v_saved_note != '' THEN
      INSERT INTO public.workout_entry_exercise_notes (
        workout_entry_id,
        exercise_id,
        note
      ) VALUES (
        NEW.id,
        NEW.exercise_id,
        v_saved_note
      )
      ON CONFLICT (workout_entry_id, exercise_id) 
      DO UPDATE SET
        note = EXCLUDED.note,
        updated_at = NOW();
    END IF;
    
    -- Delete the selected alternative from the junction table
    DELETE FROM workout_entry_alternatives
    WHERE id = v_alternative_record.id;

    -- Get the next position for the new alternative
    SELECT COALESCE(MAX(position), 0) + 1 INTO v_max_position
    FROM workout_entry_alternatives
    WHERE workout_entry_id = NEW.id;

    -- Check if old exercise already exists in alternatives
    SELECT id INTO v_existing_alt_id
    FROM workout_entry_alternatives
    WHERE workout_entry_id = NEW.id
      AND alternative_exercise_id = OLD.exercise_id
    LIMIT 1;

    IF v_existing_alt_id IS NULL THEN
      -- Old exercise doesn't exist - try to restore its note from persistent storage
      SELECT note INTO v_restored_note
      FROM public.workout_entry_exercise_notes
      WHERE workout_entry_id = NEW.id 
      AND exercise_id = OLD.exercise_id
      LIMIT 1;
      
      -- If no note found and this is the first swap, mark as original planned exercise
      IF (v_restored_note IS NULL OR v_restored_note = '') AND v_is_first_swap THEN
        v_restored_note := 'Original planned exercise';
      END IF;
    END IF;

    -- Add the old exercise as a new alternative
    INSERT INTO workout_entry_alternatives (
      workout_entry_id,
      alternative_exercise_id,
      note,
      position
    )
    VALUES (
      NEW.id,
      OLD.exercise_id,
      COALESCE(NULLIF(v_restored_note, ''), ''),  -- Restore note from history, or "Original planned exercise", or empty if none
      v_max_position
    )
    ON CONFLICT (workout_entry_id, alternative_exercise_id) 
    DO UPDATE SET
      position = EXCLUDED.position;
      -- Note is NOT updated - keep existing note as-is (preserve original note)
    
    -- Sync the note to persistent storage
    IF v_existing_alt_id IS NOT NULL THEN
      UPDATE public.workout_entry_exercise_notes
      SET note = (
        SELECT note FROM workout_entry_alternatives 
        WHERE id = v_existing_alt_id
      ),
      updated_at = NOW()
      WHERE workout_entry_id = NEW.id 
      AND exercise_id = OLD.exercise_id;
    END IF;

    RAISE NOTICE 'Swapped exercise % with alternative %. Old exercise added to alternatives.', OLD.exercise_id, NEW.exercise_id;
  ELSE
    -- New exercise was not an alternative (direct exercise change)
    -- No action needed - just a regular exercise change
    RAISE NOTICE 'Exercise changed from % to % (not a swap with alternative)', OLD.exercise_id, NEW.exercise_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS trigger_auto_swap_alternatives ON workout_entries;

-- Create the trigger
CREATE TRIGGER trigger_auto_swap_alternatives
  AFTER UPDATE OF exercise_id ON workout_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_swap_workout_alternatives();

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.auto_swap_workout_alternatives() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auto_swap_workout_alternatives() TO anon;

COMMENT ON FUNCTION public.auto_swap_workout_alternatives() IS 
'Automatically manages workout_entry_alternatives when exercise_id changes. If the new exercise was in the alternatives list, removes it and adds the old exercise as an alternative. Notes are preserved and never modified.';

COMMENT ON TRIGGER trigger_auto_swap_alternatives ON workout_entries IS
'Automatically swaps alternatives when exercise_id changes on a workout_entry';
