-- Explicit prescription: rep-based vs timed holds (see plan: explicit prescription type)

ALTER TABLE public.workout_entries
  ADD COLUMN IF NOT EXISTS prescription_type text NOT NULL DEFAULT 'reps';

ALTER TABLE public.workout_entries
  ADD CONSTRAINT workout_entries_prescription_type_check
  CHECK (prescription_type = ANY (ARRAY['reps'::text, 'time'::text]));

COMMENT ON COLUMN public.workout_entries.prescription_type IS
  'reps = rep-range prescription; time = hold/timed prescription (use time field for duration)';

-- Backfill: timed rows — non-empty time and no digit in reps, or exercise slug indicates timed
UPDATE public.workout_entries we
SET prescription_type = 'time'
FROM public.exercises e
WHERE we.exercise_id = e.id
  AND we.prescription_type = 'reps'
  AND (
    (NULLIF(trim(COALESCE(we.time, '')), '') IS NOT NULL AND NOT (we.reps ~ '[0-9]'))
    OR e.slug ILIKE '%-timed'
    OR e.slug ILIKE '%-timed-%'
  );

-- workout_preset_entries mirror (same prescription shape as plan rows)
ALTER TABLE public.workout_preset_entries
  ADD COLUMN IF NOT EXISTS prescription_type text NOT NULL DEFAULT 'reps';

ALTER TABLE public.workout_preset_entries
  ADD CONSTRAINT workout_preset_entries_prescription_type_check
  CHECK (prescription_type = ANY (ARRAY['reps'::text, 'time'::text]));

UPDATE public.workout_preset_entries wpe
SET prescription_type = 'time'
FROM public.exercises e
WHERE wpe.exercise_id = e.id
  AND wpe.prescription_type = 'reps'
  AND (
    (NULLIF(trim(COALESCE(wpe.time, '')), '') IS NOT NULL AND NOT (wpe.reps ~ '[0-9]'))
    OR e.slug ILIKE '%-timed'
    OR e.slug ILIKE '%-timed-%'
  );
