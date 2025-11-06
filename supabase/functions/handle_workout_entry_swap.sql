-- Function to automatically handle workout entry alternatives when exercise is swapped
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
        -- (check if workout_entry_exercise_notes table is empty for this workout_entry_id)
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

-- Create the trigger
DROP TRIGGER IF EXISTS workout_entry_swap_trigger ON public.workout_entries;

CREATE TRIGGER workout_entry_swap_trigger
    AFTER UPDATE OF exercise_id ON public.workout_entries
    FOR EACH ROW
    WHEN (OLD.exercise_id IS DISTINCT FROM NEW.exercise_id)
    EXECUTE FUNCTION public.handle_workout_entry_swap();