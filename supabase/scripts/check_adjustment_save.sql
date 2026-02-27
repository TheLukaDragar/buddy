-- =============================================================================
-- Check "Save to future workouts" is persisting correctly
-- Run each query in Supabase SQL Editor. Replace session_id / exercise_id with your values.
-- =============================================================================

-- 1) Check workout_session_adjustments: is_applied should be true after you tap "Save"
--    Rows for this session should show is_applied = true for the exercise/type you saved.
SELECT
  id,
  session_id,
  exercise_id,
  type,
  from_value,
  to_value,
  is_applied,  -- should be true after saving
  created_at
FROM public.workout_session_adjustments
WHERE session_id = '5fb8a7f4-e9f8-4e24-9bf0-7ea3286932fa'
ORDER BY exercise_id, type, created_at;

-- 3) If is_applied is still false above, the Supabase update may be failing (RLS, wrong table, or column).
--    Check that the column exists:
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'workout_session_adjustments'
  AND column_name = 'is_applied';

-- 4) Check future workout_entries that were updated (reps/weight/time + is_adjusted)
--    Replace the exercise_id with the one you saved (e.g. Leg Press).
--    Example exercise_id for Leg Press: e8691efc-bbc0-4e93-bf87-2bd0228daa74
SELECT
  id,
  workout_plan_id,
  exercise_id,
  date,
  reps,
  weight,
  time,
  is_adjusted,       -- should be true for entries we updated
  adjustment_reason  -- should contain "Applied from workout completion..."
FROM public.workout_entries
WHERE exercise_id = 'e8691efc-bbc0-4e93-bf87-2bd0228daa74'
  AND date >= current_date
ORDER BY date;

-- 5) Count how many future entries exist per exercise (to match "Applied to N future workouts")
SELECT
  exercise_id,
  count(*) AS future_entries_count
FROM public.workout_entries we
JOIN public.workout_plans wp ON wp.id = we.workout_plan_id
WHERE we.date >= current_date
  AND wp.user_id = (SELECT user_id FROM public.workout_sessions WHERE id = '5fb8a7f4-e9f8-4e24-9bf0-7ea3286932fa' LIMIT 1)
GROUP BY exercise_id;
