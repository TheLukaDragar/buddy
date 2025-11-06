-- Check a specific workout entry and its alternatives
-- Replace the workout_entry_id with one from your workout data
SELECT 
    we.id,
    we.day_name,
    we.exercise_id,
    e.name as exercise_name,
    COUNT(wea.id) as alternatives_count
FROM workout_entries we
JOIN exercises e ON we.exercise_id = e.id
LEFT JOIN workout_entry_alternatives wea ON wea.workout_entry_id = we.id
WHERE we.id = '4a7d846f-0cfd-4ce8-b319-64fe8837c475'  -- The first one from your data
GROUP BY we.id, we.day_name, we.exercise_id, e.name;

-- Get the actual alternatives for this entry
SELECT 
    wea.id,
    wea.workout_entry_id,
    wea.position,
    wea.note,
    e.name as alternative_name,
    e.slug as alternative_slug
FROM workout_entry_alternatives wea
JOIN exercises e ON wea.alternative_exercise_id = e.id
WHERE wea.workout_entry_id = '4a7d846f-0cfd-4ce8-b319-64fe8837c475'
ORDER BY wea.position;
