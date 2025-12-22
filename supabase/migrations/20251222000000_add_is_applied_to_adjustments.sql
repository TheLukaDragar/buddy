-- Add is_applied column to track which adjustments were saved by the user
ALTER TABLE public.workout_session_adjustments
ADD COLUMN IF NOT EXISTS is_applied BOOLEAN DEFAULT false;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_adjustments_is_applied
  ON public.workout_session_adjustments(is_applied);

COMMENT ON COLUMN public.workout_session_adjustments.is_applied IS
'Tracks whether the user clicked "Save" to apply this adjustment to future workouts';
