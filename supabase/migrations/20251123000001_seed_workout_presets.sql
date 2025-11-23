-- ============================================================================
-- Migration: Seed Workout Presets
-- ============================================================================
-- This migration seeds the initial preset workouts for the Train Now feature.
-- Presets: Push, Pull, Legs, Full Body
-- ============================================================================

-- ============================================================================
-- 1. INSERT PRESET WORKOUTS
-- ============================================================================

-- Push Day Preset
INSERT INTO public.workout_presets (id, name, description, day_name, image_key, difficulty, estimated_duration, sort_order)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Push Day',
  'Focus on chest, shoulders, and triceps with compound pressing movements and isolation work.',
  'Push',
  'push',
  'medium',
  45,
  1
);

-- Pull Day Preset
INSERT INTO public.workout_presets (id, name, description, day_name, image_key, difficulty, estimated_duration, sort_order)
VALUES (
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'Pull Day',
  'Target your back and biceps with rowing and pulling movements for a stronger posterior chain.',
  'Pull',
  'pull',
  'medium',
  45,
  2
);

-- Legs Day Preset
INSERT INTO public.workout_presets (id, name, description, day_name, image_key, difficulty, estimated_duration, sort_order)
VALUES (
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  'Legs Day',
  'Build lower body strength with squats, lunges, and isolation exercises for quads, hamstrings, and glutes.',
  'Legs',
  'legs',
  'hard',
  50,
  3
);

-- Full Body Preset
INSERT INTO public.workout_presets (id, name, description, day_name, image_key, difficulty, estimated_duration, sort_order)
VALUES (
  'd4e5f6a7-b8c9-0123-defa-234567890123',
  'Full Body',
  'A balanced workout hitting all major muscle groups. Perfect for a complete training session.',
  'Full Body',
  'fullbody',
  'medium',
  55,
  4
);

-- ============================================================================
-- 2. INSERT PRESET ENTRIES (Exercises)
-- ============================================================================

-- Helper function to safely get exercise ID by slug
CREATE OR REPLACE FUNCTION get_exercise_id_by_slug(p_slug TEXT)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  SELECT id INTO v_id FROM public.exercises WHERE slug = p_slug;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PUSH DAY EXERCISES
-- ============================================================================

-- 1. Chest Press / Bench Press variant
INSERT INTO public.workout_preset_entries (preset_id, exercise_id, position, sets, reps, notes)
SELECT
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  id,
  1,
  4,
  '8-10',
  'Focus on controlled movement'
FROM public.exercises
WHERE slug = 'flat-bench-press-bb' OR slug = 'flat-db-bench-press'
LIMIT 1;

-- 2. Incline Press
INSERT INTO public.workout_preset_entries (preset_id, exercise_id, position, sets, reps, notes)
SELECT
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  id,
  2,
  3,
  '10-12',
  NULL
FROM public.exercises
WHERE slug LIKE 'incline%press%' AND slug LIKE '%db%'
LIMIT 1;

-- 3. Overhead Press
INSERT INTO public.workout_preset_entries (preset_id, exercise_id, position, sets, reps, notes)
SELECT
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  id,
  3,
  3,
  '8-10',
  NULL
FROM public.exercises
WHERE slug = 'standing-overhead-press-kb-or-db' OR slug LIKE 'standing%overhead-press%'
LIMIT 1;

-- 4. Lateral Raises
INSERT INTO public.workout_preset_entries (preset_id, exercise_id, position, sets, reps, notes)
SELECT
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  id,
  4,
  3,
  '12-15',
  'Light weight, controlled tempo'
FROM public.exercises
WHERE slug = 'standing-lateral-raise-db-or-kb' OR slug LIKE 'standing-lateral-raise%'
LIMIT 1;

-- 5. Tricep Extension
INSERT INTO public.workout_preset_entries (preset_id, exercise_id, position, sets, reps, notes)
SELECT
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  id,
  5,
  3,
  '10-12',
  NULL
FROM public.exercises
WHERE slug LIKE '%tricep%extension%' OR slug LIKE '%skull%crusher%'
LIMIT 1;

-- ============================================================================
-- PULL DAY EXERCISES
-- ============================================================================

-- 1. Bent Over Row
INSERT INTO public.workout_preset_entries (preset_id, exercise_id, position, sets, reps, notes)
SELECT
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  id,
  1,
  4,
  '8-10',
  'Keep back flat'
FROM public.exercises
WHERE slug LIKE '%bent-over%row%' OR slug LIKE '%rowing%'
LIMIT 1;

-- 2. Pull-ups or Lat Pulldown
INSERT INTO public.workout_preset_entries (preset_id, exercise_id, position, sets, reps, notes)
SELECT
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  id,
  2,
  3,
  '8-12',
  NULL
FROM public.exercises
WHERE slug LIKE '%pull-up%' OR slug LIKE '%pulldown%' OR slug LIKE '%lat%'
LIMIT 1;

-- 3. Single Arm Row
INSERT INTO public.workout_preset_entries (preset_id, exercise_id, position, sets, reps, notes)
SELECT
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  id,
  3,
  3,
  '10-12',
  'Each arm'
FROM public.exercises
WHERE slug LIKE '%unilateral%row%' OR slug LIKE '%single%arm%row%'
LIMIT 1;

-- 4. Face Pulls or Rear Delt
INSERT INTO public.workout_preset_entries (preset_id, exercise_id, position, sets, reps, notes)
SELECT
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  id,
  4,
  3,
  '12-15',
  NULL
FROM public.exercises
WHERE slug LIKE '%face%pull%' OR slug LIKE '%rear%delt%'
LIMIT 1;

-- 5. Bicep Curls
INSERT INTO public.workout_preset_entries (preset_id, exercise_id, position, sets, reps, notes)
SELECT
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  id,
  5,
  3,
  '10-12',
  NULL
FROM public.exercises
WHERE slug LIKE '%bicep%curl%' OR slug LIKE '%curl%db%'
LIMIT 1;

-- ============================================================================
-- LEGS DAY EXERCISES
-- ============================================================================

-- 1. Squats
INSERT INTO public.workout_preset_entries (preset_id, exercise_id, position, sets, reps, notes)
SELECT
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  id,
  1,
  4,
  '8-10',
  'Full depth'
FROM public.exercises
WHERE slug LIKE '%squat%' AND (slug LIKE '%bb%' OR slug LIKE '%goblet%')
LIMIT 1;

-- 2. Romanian Deadlift
INSERT INTO public.workout_preset_entries (preset_id, exercise_id, position, sets, reps, notes)
SELECT
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  id,
  2,
  3,
  '10-12',
  'Feel the hamstring stretch'
FROM public.exercises
WHERE slug LIKE '%romanian%deadlift%' OR slug LIKE '%rdl%'
LIMIT 1;

-- 3. Lunges
INSERT INTO public.workout_preset_entries (preset_id, exercise_id, position, sets, reps, notes)
SELECT
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  id,
  3,
  3,
  '10-12',
  'Each leg'
FROM public.exercises
WHERE slug LIKE '%lunge%'
LIMIT 1;

-- 4. Leg Curl
INSERT INTO public.workout_preset_entries (preset_id, exercise_id, position, sets, reps, notes)
SELECT
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  id,
  4,
  3,
  '12-15',
  NULL
FROM public.exercises
WHERE slug LIKE '%leg%curl%' OR slug LIKE '%hamstring%curl%'
LIMIT 1;

-- 5. Calf Raises
INSERT INTO public.workout_preset_entries (preset_id, exercise_id, position, sets, reps, notes)
SELECT
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  id,
  5,
  3,
  '15-20',
  'Full range of motion'
FROM public.exercises
WHERE slug LIKE '%calf%raise%'
LIMIT 1;

-- ============================================================================
-- FULL BODY EXERCISES
-- ============================================================================

-- 1. Squat variant
INSERT INTO public.workout_preset_entries (preset_id, exercise_id, position, sets, reps, notes)
SELECT
  'd4e5f6a7-b8c9-0123-defa-234567890123',
  id,
  1,
  3,
  '8-10',
  NULL
FROM public.exercises
WHERE slug LIKE '%squat%'
LIMIT 1;

-- 2. Push (Bench/Press)
INSERT INTO public.workout_preset_entries (preset_id, exercise_id, position, sets, reps, notes)
SELECT
  'd4e5f6a7-b8c9-0123-defa-234567890123',
  id,
  2,
  3,
  '8-10',
  NULL
FROM public.exercises
WHERE slug LIKE '%bench%press%' OR slug LIKE '%chest%press%'
LIMIT 1;

-- 3. Pull (Row)
INSERT INTO public.workout_preset_entries (preset_id, exercise_id, position, sets, reps, notes)
SELECT
  'd4e5f6a7-b8c9-0123-defa-234567890123',
  id,
  3,
  3,
  '10-12',
  NULL
FROM public.exercises
WHERE slug LIKE '%row%'
LIMIT 1;

-- 4. Shoulder Press
INSERT INTO public.workout_preset_entries (preset_id, exercise_id, position, sets, reps, notes)
SELECT
  'd4e5f6a7-b8c9-0123-defa-234567890123',
  id,
  4,
  3,
  '10-12',
  NULL
FROM public.exercises
WHERE slug LIKE '%overhead%press%' OR slug LIKE '%shoulder%press%'
LIMIT 1;

-- 5. Lunges or Split Squat
INSERT INTO public.workout_preset_entries (preset_id, exercise_id, position, sets, reps, notes)
SELECT
  'd4e5f6a7-b8c9-0123-defa-234567890123',
  id,
  5,
  3,
  '10-12',
  'Each leg'
FROM public.exercises
WHERE slug LIKE '%lunge%' OR slug LIKE '%split%squat%'
LIMIT 1;

-- 6. Core/Plank
INSERT INTO public.workout_preset_entries (preset_id, exercise_id, position, sets, reps, notes)
SELECT
  'd4e5f6a7-b8c9-0123-defa-234567890123',
  id,
  6,
  3,
  '30-60s',
  'Hold position'
FROM public.exercises
WHERE slug LIKE '%plank%' OR slug LIKE '%core%'
LIMIT 1;

-- ============================================================================
-- 3. CLEANUP
-- ============================================================================

-- Drop the helper function
DROP FUNCTION IF EXISTS get_exercise_id_by_slug(TEXT);
