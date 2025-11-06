-- Migration to create a robust function for handling workout entry exercise swaps
-- This function will automatically manage the workout_entry_alternatives table

-- First, drop existing function and trigger if they exist
DROP TRIGGER IF EXISTS trg_workout_entry_exercise_swap ON public.workout_entries;
DROP FUNCTION IF EXISTS public.handle_workout_entry_exercise_swap();

-- Create the new robust function
CREATE OR REPLACE FUNCTION public.handle_workout_entry_exercise_swap()
RETURNS TRIGGER AS $$
DECLARE
    existing_count INTEGER;
    old_exercise_name TEXT;
    new_exercise_name TEXT;
    alt_record RECORD;
    new_position INTEGER := 1;
BEGIN
    -- Only proceed if the exercise_id actually changed
    IF OLD.exercise_id IS DISTINCT FROM NEW.exercise_id THEN
        -- Get exercise names for better logging/notes
        SELECT COALESCE(name, 'Unknown') INTO old_exercise_name 
        FROM public.exercises 
        WHERE id = OLD.exercise_id;
        
        SELECT COALESCE(name, 'Unknown') INTO new_exercise_name 
        FROM public.exercises 
        WHERE id = NEW.exercise_id;
        
        -- Handle the new exercise (the one we're swapping to)
        -- Check if this alternative already exists
        SELECT COUNT(*) INTO existing_count
        FROM public.workout_entry_alternatives
        WHERE workout_entry_id = NEW.id 
        AND alternative_exercise_id = NEW.exercise_id;
        
        IF existing_count = 0 THEN
            -- Insert the new alternative relationship
            INSERT INTO public.workout_entry_alternatives (
                workout_entry_id,
                alternative_exercise_id,
                note,
                position
            ) VALUES (
                NEW.id,
                NEW.exercise_id,
                'Swapped to ' || new_exercise_name || ' from ' || old_exercise_name || ' on ' || NOW()::date,
                1
            );
        ELSE
            -- Update existing alternative with new note and position
            UPDATE public.workout_entry_alternatives
            SET note = 'Swapped to ' || new_exercise_name || ' from ' || old_exercise_name || ' on ' || NOW()::date,
                position = 1
            WHERE workout_entry_id = NEW.id 
            AND alternative_exercise_id = NEW.exercise_id;
        END IF;
        
        -- Also ensure the original exercise is in the alternatives list
        -- Check if original exercise alternative exists
        SELECT COUNT(*) INTO existing_count
        FROM public.workout_entry_alternatives
        WHERE workout_entry_id = NEW.id 
        AND alternative_exercise_id = OLD.exercise_id;
        
        IF existing_count = 0 THEN
            -- Add original exercise as an alternative with position 2
            INSERT INTO public.workout_entry_alternatives (
                workout_entry_id,
                alternative_exercise_id,
                note,
                position
            ) VALUES (
                NEW.id,
                OLD.exercise_id,
                'Original exercise: ' || old_exercise_name || ' (before swap on ' || NOW()::date || ')',
                2
            );
        ELSE
            -- Update existing original exercise alternative with position 2
            UPDATE public.workout_entry_alternatives
            SET note = 'Original exercise: ' || old_exercise_name || ' (before swap on ' || NOW()::date || ')',
                position = 2
            WHERE workout_entry_id = NEW.id 
            AND alternative_exercise_id = OLD.exercise_id;
        END IF;
        
        -- Reorganize all other alternatives to ensure sequential positions
        -- Start from position 3 and go up
        new_position := 3;
        FOR alt_record IN 
            SELECT id, alternative_exercise_id
            FROM public.workout_entry_alternatives
            WHERE workout_entry_id = NEW.id 
            AND alternative_exercise_id != NEW.exercise_id
            AND alternative_exercise_id != OLD.exercise_id
            ORDER BY position
        LOOP
            UPDATE public.workout_entry_alternatives
            SET position = new_position
            WHERE id = alt_record.id;
            
            new_position := new_position + 1;
        END LOOP;
        
        -- Log the operation
        RAISE LOG 'Workout entry % exercise swapped from % to %', NEW.id, old_exercise_name, new_exercise_name;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER trg_workout_entry_exercise_swap
    AFTER UPDATE OF exercise_id ON public.workout_entries
    FOR EACH ROW
    WHEN (OLD.exercise_id IS DISTINCT FROM NEW.exercise_id)
    EXECUTE FUNCTION public.handle_workout_entry_exercise_swap();