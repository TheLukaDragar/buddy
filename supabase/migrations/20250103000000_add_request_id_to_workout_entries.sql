-- Migration: Add workout_instance_id to workout_entries
-- This groups entries by generation to support multiple workouts per day and workout regeneration
-- Solves the problem of: multiple "Train Now" workouts, regenerating plans, etc.

-- Add workout_instance_id column to group entries from the same generation
-- Default generates a new UUID for existing entries (each becomes its own instance)
ALTER TABLE public.workout_entries 
ADD COLUMN IF NOT EXISTS workout_instance_id UUID DEFAULT uuid_generate_v4() NOT NULL;

-- Create index for efficient querying by instance
CREATE INDEX IF NOT EXISTS idx_workout_entries_instance_id
  ON public.workout_entries(workout_instance_id);

-- Create composite index for finding most recent workout instance
-- This enables queries like: "Get most recent Monday Week 1 'Chest Day' workout"
CREATE INDEX IF NOT EXISTS idx_workout_entries_most_recent_instance
  ON public.workout_entries(workout_plan_id, week_number, day, day_name, created_at DESC);

-- Add comment explaining the purpose
COMMENT ON COLUMN public.workout_entries.workout_instance_id IS 
'Groups entries from the same workout generation. All exercises created together share the same instance ID.
This allows:
- Multiple workouts per day (different day_name, different instance_id)
- Regenerating workouts (new instance_id for same day/week)
- Querying most recent workout by getting latest instance_id for a given day/week/day_name combo';
