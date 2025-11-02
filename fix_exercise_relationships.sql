-- Fix multiple foreign key relationship issue
-- Add comment directive to disambiguate streak_exercise_id relationship
COMMENT ON CONSTRAINT workout_entries_streak_exercise_id_fkey
  ON "workout_entries"
  IS E'@graphql({"foreign_name": "streakExercises", "local_name": "workout_entries_by_streak_exercise"})';