-- Fix workout_instance_id for existing entries
-- Problem: Default uuid_generate_v4() gave each entry a unique ID
-- Solution: Group entries that belong together (same plan+week+day+day_name)

-- Create a temporary function to assign shared instance IDs
CREATE OR REPLACE FUNCTION fix_workout_instance_ids()
RETURNS void AS $$
DECLARE
  workout_group RECORD;
  new_instance_id UUID;
BEGIN
  -- For each unique workout group (plan + week + day + day_name)
  FOR workout_group IN
    SELECT DISTINCT
      workout_plan_id,
      week_number,
      day,
      day_name
    FROM workout_entries
    WHERE workout_plan_id IS NOT NULL
  LOOP
    -- Generate a new shared instance ID for this group
    new_instance_id := uuid_generate_v4();

    -- Update all entries in this group to share the same instance ID
    UPDATE workout_entries
    SET workout_instance_id = new_instance_id
    WHERE workout_plan_id = workout_group.workout_plan_id
      AND week_number = workout_group.week_number
      AND day = workout_group.day
      AND day_name = workout_group.day_name;

    RAISE NOTICE 'Fixed instance ID for: plan=%, week=%, day=%, name=%',
      workout_group.workout_plan_id,
      workout_group.week_number,
      workout_group.day,
      workout_group.day_name;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the fix
SELECT fix_workout_instance_ids();

-- Drop the temporary function
DROP FUNCTION fix_workout_instance_ids();

-- Verification: Count how many entries share each instance ID (should be > 1 for workout days)
-- Uncomment to verify:
-- SELECT workout_instance_id, count(*) as exercise_count
-- FROM workout_entries
-- GROUP BY workout_instance_id
-- ORDER BY exercise_count DESC
-- LIMIT 20;
