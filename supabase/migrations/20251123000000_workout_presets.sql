-- ============================================================================
-- Migration: Workout Presets (Train Now Feature)
-- ============================================================================
-- This migration creates tables for preset workouts that users can quickly
-- start without generating a full plan. Presets mirror the structure of
-- workout_plans and workout_entries for consistency.
-- ============================================================================

-- ============================================================================
-- 1. WORKOUT PRESETS TABLE (mirrors workout_plans)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.workout_presets (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

  -- Preset Details
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  day_name TEXT NOT NULL, -- "Push", "Pull", "Legs", "Full Body"

  -- Display Properties
  image_key TEXT, -- For card image
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  estimated_duration INTEGER NOT NULL, -- minutes

  -- Ordering & Status
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workout_presets_active
  ON public.workout_presets(is_active, sort_order);

CREATE INDEX IF NOT EXISTS idx_workout_presets_day_name
  ON public.workout_presets(day_name);

-- Updated_at trigger
CREATE TRIGGER update_workout_presets_updated_at
  BEFORE UPDATE ON public.workout_presets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.workout_presets IS
'Preset workout templates for the Train Now feature. Mirrors workout_plans structure.';

-- ============================================================================
-- 2. WORKOUT PRESET ENTRIES TABLE (mirrors workout_entries)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.workout_preset_entries (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  preset_id UUID NOT NULL REFERENCES public.workout_presets(id) ON DELETE CASCADE,

  -- Exercise Reference
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,

  -- Exercise Details (same as workout_entries)
  position INTEGER NOT NULL CHECK (position > 0),
  sets INTEGER NOT NULL CHECK (sets > 0),
  reps TEXT NOT NULL,
  weight TEXT,
  time TEXT,
  notes TEXT,

  -- Streak exercise (same as workout_entries)
  streak_exercise_id UUID REFERENCES public.exercises(id),
  streak_exercise_notes TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workout_preset_entries_preset_id
  ON public.workout_preset_entries(preset_id, position);

CREATE INDEX IF NOT EXISTS idx_workout_preset_entries_exercise_id
  ON public.workout_preset_entries(exercise_id);

-- Updated_at trigger
CREATE TRIGGER update_workout_preset_entries_updated_at
  BEFORE UPDATE ON public.workout_preset_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.workout_preset_entries IS
'Exercises within a workout preset. Mirrors workout_entries structure.';

-- ============================================================================
-- 3. WORKOUT PRESET ENTRY ALTERNATIVES TABLE (mirrors workout_entry_alternatives)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.workout_preset_entry_alternatives (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  preset_entry_id UUID NOT NULL REFERENCES public.workout_preset_entries(id) ON DELETE CASCADE,

  -- Alternative Exercise
  alternative_exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
  note TEXT,
  position INTEGER NOT NULL CHECK (position > 0),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workout_preset_entry_alternatives_entry_id
  ON public.workout_preset_entry_alternatives(preset_entry_id, position);

COMMENT ON TABLE public.workout_preset_entry_alternatives IS
'Alternative exercises for preset entries. Mirrors workout_entry_alternatives structure.';

-- ============================================================================
-- 4. ADD PRESET REFERENCE TO WORKOUT_ENTRIES
-- ============================================================================
ALTER TABLE public.workout_entries
ADD COLUMN IF NOT EXISTS preset_id UUID REFERENCES public.workout_presets(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_workout_entries_preset_id
  ON public.workout_entries(preset_id)
  WHERE preset_id IS NOT NULL;

COMMENT ON COLUMN public.workout_entries.preset_id IS
'Reference to the preset this entry was created from (for Train Now feature).';

-- ============================================================================
-- 5. FUNCTION TO COPY PRESET TO USER PLAN
-- ============================================================================
CREATE OR REPLACE FUNCTION public.copy_preset_to_plan(
  p_preset_id UUID,
  p_workout_plan_id UUID,
  p_date DATE,
  p_week_number INTEGER,
  p_day public.weekday
)
RETURNS SETOF public.workout_entries AS $$
DECLARE
  v_preset_entry RECORD;
  v_new_entry_id UUID;
  v_preset RECORD;
BEGIN
  -- Get preset details
  SELECT * INTO v_preset FROM public.workout_presets WHERE id = p_preset_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Preset not found: %', p_preset_id;
  END IF;

  -- Copy each preset entry to workout_entries
  FOR v_preset_entry IN
    SELECT * FROM public.workout_preset_entries
    WHERE preset_id = p_preset_id
    ORDER BY position
  LOOP
    -- Insert the workout entry
    -- Use exercise_id as streak_exercise_id if not set in preset
    INSERT INTO public.workout_entries (
      workout_plan_id,
      week_number,
      day_name,
      day,
      date,
      exercise_id,
      sets,
      reps,
      weight,
      time,
      notes,
      streak_exercise_id,
      streak_exercise_notes,
      preset_id
    ) VALUES (
      p_workout_plan_id,
      p_week_number,
      v_preset.day_name,
      p_day,
      p_date,
      v_preset_entry.exercise_id,
      v_preset_entry.sets,
      v_preset_entry.reps,
      v_preset_entry.weight,
      v_preset_entry.time,
      v_preset_entry.notes,
      COALESCE(v_preset_entry.streak_exercise_id, v_preset_entry.exercise_id),
      v_preset_entry.streak_exercise_notes,
      p_preset_id
    )
    RETURNING id INTO v_new_entry_id;

    -- Copy alternatives for this entry
    INSERT INTO public.workout_entry_alternatives (
      workout_entry_id,
      alternative_exercise_id,
      note,
      position
    )
    SELECT
      v_new_entry_id,
      alternative_exercise_id,
      note,
      position
    FROM public.workout_preset_entry_alternatives
    WHERE preset_entry_id = v_preset_entry.id;

    -- Return the created entry
    RETURN QUERY SELECT * FROM public.workout_entries WHERE id = v_new_entry_id;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.copy_preset_to_plan IS
'Copies all entries from a preset to a user workout plan for a specific date.';

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on preset tables
ALTER TABLE public.workout_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_preset_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_preset_entry_alternatives ENABLE ROW LEVEL SECURITY;

-- Presets are readable by all authenticated users (they're public templates)
CREATE POLICY "Anyone can view active presets"
  ON public.workout_presets FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view preset entries"
  ON public.workout_preset_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_presets wp
      WHERE wp.id = workout_preset_entries.preset_id
      AND wp.is_active = true
    )
  );

CREATE POLICY "Anyone can view preset entry alternatives"
  ON public.workout_preset_entry_alternatives FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_preset_entries wpe
      JOIN public.workout_presets wp ON wp.id = wpe.preset_id
      WHERE wpe.id = workout_preset_entry_alternatives.preset_entry_id
      AND wp.is_active = true
    )
  );

-- Only admins can modify presets (no insert/update/delete policies for regular users)
-- Admin operations would be done via service role key
