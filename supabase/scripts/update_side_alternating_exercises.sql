-- =============================================================================
-- Posebne vaje: Side plank & Copenhagen Plank (alternating sides)
-- Agent must announce which side to use before each set:
--   Set 1 = right, Set 2 = left, Set 3 = right, Set 4 = left
-- =============================================================================

-- 1. SELECT: Find the exercises (run first to verify)
SELECT id, name, slug, trainer_notes
FROM public.exercises
WHERE id IN (
  '54506ac0-b28f-430b-8b76-2d3c103b3e5e',  -- Copenhagen Plank (Timed 20–40 seconds per side)
  '46fb7183-29a7-48aa-a1bf-098d36a751ab',  -- Side Plank (10–15 reps per side)
  '0dd5a414-26f7-41ce-b066-8df49ed1d056'   -- Side Plank (Timed — 10–15 seconds per side)
)
ORDER BY name;

-- 2. UPDATE: Add instruction that agent must announce side before each set
-- Append to existing trainer_notes (idempotent: skips if already present)
UPDATE public.exercises
SET 
  trainer_notes = CASE 
    WHEN trainer_notes IS NULL OR trainer_notes = '' 
    THEN 'IMPORTANT: Before each set, tell the user which side to use. Set 1 = right, Set 2 = left, Set 3 = right, Set 4 = left. Remind them to switch sides between sets.'
    WHEN trainer_notes LIKE '%Before each set, tell the user which side to use%'
    THEN trainer_notes  -- already has it, no change
    ELSE trainer_notes || E'\n\n' || 'IMPORTANT: Before each set, tell the user which side to use. Set 1 = right, Set 2 = left, Set 3 = right, Set 4 = left. Remind them to switch sides between sets.'
  END,
  updated_at = NOW()
WHERE id IN (
  '54506ac0-b28f-430b-8b76-2d3c103b3e5e',
  '46fb7183-29a7-48aa-a1bf-098d36a751ab',
  '0dd5a414-26f7-41ce-b066-8df49ed1d056'
)
AND (trainer_notes IS NULL OR trainer_notes = '' OR trainer_notes NOT LIKE '%Before each set, tell the user which side to use%');

-- 3. Verify after update
SELECT id, name, slug, trainer_notes
FROM public.exercises
WHERE id IN (
  '54506ac0-b28f-430b-8b76-2d3c103b3e5e',
  '46fb7183-29a7-48aa-a1bf-098d36a751ab',
  '0dd5a414-26f7-41ce-b066-8df49ed1d056'
)
ORDER BY name;
