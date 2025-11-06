-- ============================================================================
-- Complete Migration: Persistent Note Storage for Workout Entry Alternatives
-- ============================================================================
-- This migration:
-- 1. Makes note column nullable (optional)
-- 2. Creates persistent note storage table
-- 3. Creates sync trigger for notes
-- 4. Updates swap trigger functions to preserve notes
-- 5. Cleans up old unused triggers
-- ============================================================================

-- Step 1: Make note column nullable (allows empty notes)
ALTER TABLE public.workout_entry_alternatives 
ALTER COLUMN note DROP NOT NULL;

COMMENT ON COLUMN public.workout_entry_alternatives.note IS 
'Optional brief explanation of when to use this alternative exercise (e.g., "Use if bench is occupied"). Can be NULL.';

-- Step 2: Create persistent note storage table
CREATE TABLE IF NOT EXISTS public.workout_entry_exercise_notes (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    workout_entry_id UUID NOT NULL REFERENCES public.workout_entries(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    note TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one note per exercise per workout entry
    CONSTRAINT workout_entry_exercise_notes_unique UNIQUE (workout_entry_id, exercise_id)
);

CREATE INDEX IF NOT EXISTS idx_workout_entry_exercise_notes_lookup 
ON public.workout_entry_exercise_notes(workout_entry_id, exercise_id);

COMMENT ON TABLE public.workout_entry_exercise_notes IS 
'Persistent storage for exercise notes. Notes are preserved here even when exercises become main and are removed from alternatives, allowing them to be restored later.';

-- Step 3: Create sync trigger function
CREATE OR REPLACE FUNCTION public.sync_alternative_note_to_storage()
RETURNS TRIGGER AS $$
BEGIN
    -- Sync the note to persistent storage whenever it's inserted or updated
    INSERT INTO public.workout_entry_exercise_notes (
        workout_entry_id,
        exercise_id,
        note
    ) VALUES (
        NEW.workout_entry_id,
        NEW.alternative_exercise_id,
        COALESCE(NEW.note, '')
    )
    ON CONFLICT (workout_entry_id, exercise_id) 
    DO UPDATE SET
        note = EXCLUDED.note,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_alternative_note_trigger ON public.workout_entry_alternatives;

CREATE TRIGGER sync_alternative_note_trigger
    AFTER INSERT OR UPDATE OF note ON public.workout_entry_alternatives
    FOR EACH ROW
    WHEN (NEW.note IS NOT NULL)
    EXECUTE FUNCTION public.sync_alternative_note_to_storage();

COMMENT ON FUNCTION public.sync_alternative_note_to_storage() IS 
'Syncs notes from workout_entry_alternatives to persistent storage whenever notes are inserted or updated.';

-- Step 4: Update handle_workout_entry_swap function
CREATE OR REPLACE FUNCTION public.handle_workout_entry_swap()
RETURNS TRIGGER AS $$
DECLARE
    existing_alternative_id UUID;
    deleted_exercise_note TEXT;
    restored_note TEXT;
    is_first_swap BOOLEAN;
BEGIN
    -- Only proceed if the exercise_id actually changed
    IF OLD.exercise_id IS DISTINCT FROM NEW.exercise_id THEN
        -- Check if this is the first swap BEFORE saving any notes
        SELECT NOT EXISTS (
            SELECT 1 FROM public.workout_entry_exercise_notes 
            WHERE workout_entry_id = NEW.id
        ) INTO is_first_swap;
        -- Save the note from the NEW exercise (being swapped to) BEFORE deleting it
        -- Store it in the persistent notes table so it can be restored later
        SELECT note INTO deleted_exercise_note
        FROM public.workout_entry_alternatives
        WHERE workout_entry_id = NEW.id 
        AND alternative_exercise_id = NEW.exercise_id
        LIMIT 1;
        
        -- Save the note to persistent storage before deleting
        IF deleted_exercise_note IS NOT NULL AND deleted_exercise_note != '' THEN
            INSERT INTO public.workout_entry_exercise_notes (
                workout_entry_id,
                exercise_id,
                note
            ) VALUES (
                NEW.id,
                NEW.exercise_id,
                deleted_exercise_note
            )
            ON CONFLICT (workout_entry_id, exercise_id) 
            DO UPDATE SET
                note = EXCLUDED.note,
                updated_at = NOW();
        END IF;
        
        -- Check if the OLD exercise (being swapped from) already exists in alternatives
        SELECT id INTO existing_alternative_id
        FROM public.workout_entry_alternatives
        WHERE workout_entry_id = NEW.id 
        AND alternative_exercise_id = OLD.exercise_id
        LIMIT 1;
        
        -- REMOVE the new exercise from alternatives (since it's now the main exercise)
        -- Its note is saved in workout_entry_exercise_notes above
        DELETE FROM public.workout_entry_alternatives
        WHERE workout_entry_id = NEW.id 
        AND alternative_exercise_id = NEW.exercise_id;
        
        -- Add the OLD exercise to alternatives (since it's no longer the main exercise)
        IF existing_alternative_id IS NULL THEN
            -- Old exercise doesn't exist in alternatives yet
            -- Try to restore its note from persistent storage
            SELECT note INTO restored_note
            FROM public.workout_entry_exercise_notes
            WHERE workout_entry_id = NEW.id 
            AND exercise_id = OLD.exercise_id
            LIMIT 1;
            
            -- If no note found and this is the first swap, mark as original planned exercise
            IF (restored_note IS NULL OR restored_note = '') AND is_first_swap THEN
                restored_note := 'Original planned exercise';
            END IF;
            
            -- Insert with restored note (if found), otherwise empty string
            INSERT INTO public.workout_entry_alternatives (
                workout_entry_id,
                alternative_exercise_id,
                note,
                position
            ) VALUES (
                NEW.id,
                OLD.exercise_id,
                COALESCE(NULLIF(restored_note, ''), ''),  -- Restore note from history, or "Original planned exercise", or empty if none
                1  -- Position at the top since it's the most recent swap
            );
        ELSE
            -- Old exercise already exists in alternatives - keep its existing note
            -- Also update the persistent storage to match
            UPDATE public.workout_entry_exercise_notes
            SET note = (
                SELECT note FROM public.workout_entry_alternatives 
                WHERE id = existing_alternative_id
            ),
            updated_at = NOW()
            WHERE workout_entry_id = NEW.id 
            AND exercise_id = OLD.exercise_id;
            
            -- Update position only - preserve original note
            UPDATE public.workout_entry_alternatives
            SET position = 1  -- Ensure it's at the top
            WHERE id = existing_alternative_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Update auto_swap_workout_alternatives function
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

-- Step 6: Cleanup old unused triggers
DROP TRIGGER IF EXISTS trg_workout_entry_exercise_swap ON public.workout_entries;
DROP FUNCTION IF EXISTS public.handle_workout_entry_exercise_swap() CASCADE;

-- Step 7: Ensure triggers are created
DROP TRIGGER IF EXISTS workout_entry_swap_trigger ON public.workout_entries;
CREATE TRIGGER workout_entry_swap_trigger
    AFTER UPDATE OF exercise_id ON public.workout_entries
    FOR EACH ROW
    WHEN (OLD.exercise_id IS DISTINCT FROM NEW.exercise_id)
    EXECUTE FUNCTION public.handle_workout_entry_swap();

DROP TRIGGER IF EXISTS trigger_auto_swap_alternatives ON workout_entries;
CREATE TRIGGER trigger_auto_swap_alternatives
  AFTER UPDATE OF exercise_id ON workout_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_swap_workout_alternatives();

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.auto_swap_workout_alternatives() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auto_swap_workout_alternatives() TO anon;

COMMENT ON FUNCTION public.auto_swap_workout_alternatives() IS 
'Automatically manages workout_entry_alternatives when exercise_id changes. If the new exercise was in the alternatives list, removes it and adds the old exercise as an alternative. Notes are preserved through persistent storage.';

COMMENT ON FUNCTION public.handle_workout_entry_swap() IS 
'Handles workout entry exercise swaps and preserves notes through persistent storage. Notes are never lost when exercises cycle between main and alternative.';

