-- Migration: Make note column nullable in workout_entry_alternatives
-- This allows notes to be optional and not set by triggers

ALTER TABLE public.workout_entry_alternatives 
ALTER COLUMN note DROP NOT NULL;

-- Update comment to reflect that notes are optional
COMMENT ON COLUMN public.workout_entry_alternatives.note IS 
'Optional brief explanation of when to use this alternative exercise (e.g., "Use if bench is occupied"). Can be NULL.';

