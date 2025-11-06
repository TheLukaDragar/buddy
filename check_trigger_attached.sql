-- Check if trigger is attached to workout_entries table
SELECT 
    tgname as trigger_name,
    tgenabled as enabled,
    CASE tgtype::integer & 1
        WHEN 1 THEN 'ROW'
        ELSE 'STATEMENT'
    END as trigger_type,
    CASE tgtype::integer & 66
        WHEN 2 THEN 'BEFORE'
        WHEN 64 THEN 'INSTEAD OF'
        ELSE 'AFTER'
    END as trigger_timing
FROM pg_trigger
WHERE tgrelid = 'workout_entries'::regclass
    AND tgname NOT LIKE 'pg_%'
ORDER BY tgname;
