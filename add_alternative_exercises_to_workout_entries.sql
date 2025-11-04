-- Migration: Add alternative exercises columns to workout_entries table
-- This adds support for storing 2-3 alternative exercises for each main exercise

-- First, drop the old text[] columns if they exist
ALTER TABLE workout_entries DROP COLUMN IF EXISTS similar_alternative_exercises;

-- Add the alternative exercises columns
ALTER TABLE workout_entries 
ADD COLUMN IF NOT EXISTS similar_alternative_exercise_ids UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS similar_alternative_exercises_notes TEXT[] DEFAULT '{}';

-- Add index for better query performance on alternative exercises
CREATE INDEX IF NOT EXISTS idx_workout_entries_alternative_exercise_ids 
ON workout_entries USING GIN (similar_alternative_exercise_ids);

-- Add comment to document the columns
COMMENT ON COLUMN workout_entries.similar_alternative_exercise_ids IS 
'Array of exercise IDs that reference exercises table. These are alternative exercises that can substitute the main exercise. Typically 2-3 alternatives. Note: FK constraint not enforced at DB level for arrays.';

COMMENT ON COLUMN workout_entries.similar_alternative_exercises_notes IS 
'Array of brief notes (1-2 sentences) explaining when to use each alternative exercise. Each note corresponds to the exercise ID at the same index in similar_alternative_exercise_ids.';

