-- Create a table to persist notes for exercises that become main
-- This allows notes to be restored when exercises come back as alternatives
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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_workout_entry_exercise_notes_lookup 
ON public.workout_entry_exercise_notes(workout_entry_id, exercise_id);

-- Add comment
COMMENT ON TABLE public.workout_entry_exercise_notes IS 
'Persistent storage for exercise notes. Notes are preserved here even when exercises become main and are removed from alternatives, allowing them to be restored later.';

