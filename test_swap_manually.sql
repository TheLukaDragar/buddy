-- Test the swap manually to see what happens
-- Replace with your actual workout_entry_id and alternative_exercise_id

-- First, check current state
SELECT 
    we.id as workout_entry_id,
    we.exercise_id as current_exercise_id,
    e.name as current_exercise_name,
    (
        SELECT json_agg(
            json_build_object(
                'id', wea.id,
                'alternative_exercise_id', wea.alternative_exercise_id,
                'alt_name', e2.name,
                'note', wea.note,
                'position', wea.position
            ) ORDER BY wea.position
        )
        FROM workout_entry_alternatives wea
        JOIN exercises e2 ON e2.id = wea.alternative_exercise_id
        WHERE wea.workout_entry_id = we.id
    ) as alternatives
FROM workout_entries we
JOIN exercises e ON e.id = we.exercise_id
WHERE we.id = '07c78820-9db3-4fdb-9e72-238d2965fcad';

-- Now do the swap (pick one of the alternative IDs from your list)
-- This should trigger the auto_swap_workout_alternatives function
UPDATE workout_entries
SET 
    exercise_id = '0dd5a414-26f7-41ce-b066-8df49ed1d056', -- Side Plank
    is_adjusted = true,
    adjustment_reason = 'Test swap to Side Plank'
WHERE id = '07c78820-9db3-4fdb-9e72-238d2965fcad';

-- Check the state after swap
SELECT 
    we.id as workout_entry_id,
    we.exercise_id as current_exercise_id,
    e.name as current_exercise_name,
    (
        SELECT json_agg(
            json_build_object(
                'id', wea.id,
                'alternative_exercise_id', wea.alternative_exercise_id,
                'alt_name', e2.name,
                'note', wea.note,
                'position', wea.position
            ) ORDER BY wea.position
        )
        FROM workout_entry_alternatives wea
        JOIN exercises e2 ON e2.id = wea.alternative_exercise_id
        WHERE wea.workout_entry_id = we.id
    ) as alternatives
FROM workout_entries we
JOIN exercises e ON e.id = we.exercise_id
WHERE we.id = '07c78820-9db3-4fdb-9e72-238d2965fcad';
