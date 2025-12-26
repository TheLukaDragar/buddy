-- Migration: Add position field to workout_entries for exercise reordering
-- This allows users to reorder exercises during a workout session

-- Add position column (nullable initially for existing data)
ALTER TABLE public.workout_entries 
ADD COLUMN IF NOT EXISTS position INTEGER;

-- Create index for efficient ordering queries
CREATE INDEX IF NOT EXISTS idx_workout_entries_position 
ON public.workout_entries(workout_plan_id, week_number, day_name, position);

-- Backfill position for existing entries based on created_at order
-- This ensures existing workouts have proper ordering
DO $$
DECLARE
  entry_record RECORD;
  position_counter INTEGER;
BEGIN
  -- Group by workout_plan_id, week_number, and day_name
  FOR entry_record IN 
    SELECT DISTINCT workout_plan_id, week_number, day_name
    FROM public.workout_entries
    WHERE position IS NULL
  LOOP
    position_counter := 1;
    
    -- Update positions based on created_at order
    UPDATE public.workout_entries
    SET position = position_counter
    FROM (
      SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
      FROM public.workout_entries
      WHERE workout_plan_id = entry_record.workout_plan_id
        AND week_number = entry_record.week_number
        AND day_name = entry_record.day_name
        AND position IS NULL
    ) AS ordered
    WHERE workout_entries.id = ordered.id
      AND ordered.rn = position_counter;
    
    -- Update remaining positions
    UPDATE public.workout_entries
    SET position = sub.position
    FROM (
      SELECT 
        id,
        ROW_NUMBER() OVER (
          PARTITION BY workout_plan_id, week_number, day_name 
          ORDER BY COALESCE(position, 999999), created_at ASC
        ) as position
      FROM public.workout_entries
      WHERE workout_plan_id = entry_record.workout_plan_id
        AND week_number = entry_record.week_number
        AND day_name = entry_record.day_name
    ) AS sub
    WHERE workout_entries.id = sub.id
      AND workout_entries.workout_plan_id = entry_record.workout_plan_id
      AND workout_entries.week_number = entry_record.week_number
      AND workout_entries.day_name = entry_record.day_name;
  END LOOP;
END $$;

-- Make position NOT NULL after backfill
ALTER TABLE public.workout_entries 
ALTER COLUMN position SET NOT NULL;

-- Add check constraint to ensure position is positive
ALTER TABLE public.workout_entries 
ADD CONSTRAINT workout_entries_position_check 
CHECK (position > 0);

-- Add comment
COMMENT ON COLUMN public.workout_entries.position IS 
'Order position of exercise within a workout day. Lower numbers come first. Used for exercise reordering during workout sessions.';

