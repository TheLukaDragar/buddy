-- Check if workout_entry_alternatives table has any data
SELECT COUNT(*) as total_alternatives FROM workout_entry_alternatives;

-- Check workout entries and their alternatives
SELECT 
  we.id as workout_entry_id,
  we.day_name,
  e.name as exercise_name,
  COUNT(wea.id) as alternatives_count
FROM workout_entries we
LEFT JOIN exercises e ON we.exercise_id = e.id
LEFT JOIN workout_entry_alternatives wea ON wea.workout_entry_id = we.id
GROUP BY we.id, we.day_name, e.name
ORDER BY we.day_name, e.name
LIMIT 20;

-- See if there are any alternatives at all
SELECT 
  wea.*,
  e.name as alternative_exercise_name
FROM workout_entry_alternatives wea
JOIN exercises e ON wea.alternative_exercise_id = e.id
LIMIT 10;
