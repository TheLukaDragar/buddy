-- Cleanup: Remove unused/duplicate trigger functions
-- We have multiple similar functions, keeping only the ones we actively use

-- Drop the old migration function and trigger (replaced by handle_workout_entry_swap)
-- This old function sets notes automatically, which we don't want
DROP TRIGGER IF EXISTS trg_workout_entry_exercise_swap ON public.workout_entries;
DROP FUNCTION IF EXISTS public.handle_workout_entry_exercise_swap() CASCADE;

-- Active triggers after cleanup should be:
-- 1. workout_entry_swap_trigger -> handle_workout_entry_swap() (preserves notes)
-- 2. trigger_auto_swap_alternatives -> auto_swap_workout_alternatives() (preserves notes)

-- Both active triggers preserve notes and don't overwrite them


