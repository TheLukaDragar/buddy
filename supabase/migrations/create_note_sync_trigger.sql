-- Trigger function to sync notes to persistent storage when workout_entry_alternatives notes are updated
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

-- Create trigger to sync notes on insert/update
DROP TRIGGER IF EXISTS sync_alternative_note_trigger ON public.workout_entry_alternatives;

CREATE TRIGGER sync_alternative_note_trigger
    AFTER INSERT OR UPDATE OF note ON public.workout_entry_alternatives
    FOR EACH ROW
    WHEN (NEW.note IS NOT NULL)
    EXECUTE FUNCTION public.sync_alternative_note_to_storage();

COMMENT ON FUNCTION public.sync_alternative_note_to_storage() IS 
'Syncs notes from workout_entry_alternatives to persistent storage whenever notes are inserted or updated.';

