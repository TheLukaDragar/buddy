-- ============================================================================
-- Migration: Add Timer Tracking to Workout Session Sets
-- ============================================================================
-- Adds fields to track:
-- 1. Set start time (started_at already exists, but ensure it's used)
-- 2. Actual set duration (actual_time already exists, but ensure it's used)
-- 3. Rest duration tracking (new fields)
-- ============================================================================

-- Add rest tracking fields to workout_session_sets
ALTER TABLE public.workout_session_sets 
  ADD COLUMN IF NOT EXISTS rest_started_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS rest_completed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS rest_duration_seconds INTEGER,
  ADD COLUMN IF NOT EXISTS rest_extended BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS pause_time_ms BIGINT DEFAULT 0;

-- Add comments for clarity
COMMENT ON COLUMN public.workout_session_sets.started_at IS 
'Timestamp when the set actually started (when user confirmed ready and began exercising).';

COMMENT ON COLUMN public.workout_session_sets.actual_time IS 
'Actual duration of the set in seconds, excluding pause time. Calculated as (completed_at - started_at) - pause_time_ms.';

COMMENT ON COLUMN public.workout_session_sets.rest_started_at IS 
'Timestamp when rest period started after this set was completed.';

COMMENT ON COLUMN public.workout_session_sets.rest_completed_at IS 
'Timestamp when rest period ended (when user started next set or rest expired).';

COMMENT ON COLUMN public.workout_session_sets.rest_duration_seconds IS 
'Actual rest duration in seconds. Accounts for rest extensions via extend_rest tool.';

COMMENT ON COLUMN public.workout_session_sets.rest_extended IS 
'Whether the rest period was extended beyond the original target duration.';

COMMENT ON COLUMN public.workout_session_sets.pause_time_ms IS 
'Total time in milliseconds that the set was paused (sum of all pause durations).';

-- Create index for rest duration queries
CREATE INDEX IF NOT EXISTS idx_session_sets_rest_duration 
  ON public.workout_session_sets(session_id, rest_duration_seconds)
  WHERE rest_duration_seconds IS NOT NULL;

-- Create index for pause time analysis
CREATE INDEX IF NOT EXISTS idx_session_sets_pause_time 
  ON public.workout_session_sets(session_id, pause_time_ms)
  WHERE pause_time_ms > 0;







