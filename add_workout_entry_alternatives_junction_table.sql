-- Migration: Create junction table for workout entry alternative exercises
-- This allows proper GraphQL relationships and foreign key constraints

-- First, drop the old array columns if they exist (we're replacing with junction table)
ALTER TABLE workout_entries DROP COLUMN IF EXISTS similar_alternative_exercise_ids;
ALTER TABLE workout_entries DROP COLUMN IF EXISTS similar_alternative_exercises_notes;
DROP INDEX IF EXISTS idx_workout_entries_alternative_exercise_ids;

-- Create the junction table
CREATE TABLE IF NOT EXISTS workout_entry_alternatives (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  workout_entry_id UUID NOT NULL REFERENCES workout_entries(id) ON DELETE CASCADE,
  alternative_exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
  note TEXT NOT NULL,
  position INTEGER NOT NULL, -- Order of alternatives (1, 2, 3)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique combination
  CONSTRAINT workout_entry_alternatives_unique UNIQUE (workout_entry_id, alternative_exercise_id),
  
  -- Ensure position is valid
  CONSTRAINT workout_entry_alternatives_position_check CHECK (position > 0)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_workout_entry_alternatives_workout_entry_id 
ON workout_entry_alternatives(workout_entry_id);

CREATE INDEX IF NOT EXISTS idx_workout_entry_alternatives_alternative_exercise_id 
ON workout_entry_alternatives(alternative_exercise_id);

-- Add comment
COMMENT ON TABLE workout_entry_alternatives IS 
'Junction table linking workout entries to their alternative exercises with notes. Allows proper GraphQL relationships and FK constraints.';

COMMENT ON COLUMN workout_entry_alternatives.position IS 
'Order position of the alternative (1 = first alternative, 2 = second, etc.)';

COMMENT ON COLUMN workout_entry_alternatives.note IS 
'Brief explanation of when to use this alternative exercise (e.g., "Use if bench is occupied")';

