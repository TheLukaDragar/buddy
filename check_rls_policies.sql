-- Check if RLS is enabled on workout_entry_alternatives
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'workout_entry_alternatives';

-- Check existing policies on workout_entry_alternatives
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'workout_entry_alternatives';

-- Check if anon/authenticated roles have permissions
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'workout_entry_alternatives'
    AND table_schema = 'public';
