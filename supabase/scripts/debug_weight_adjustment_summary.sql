-- =============================================================================
-- Debug: Weight adjustment summary bug (decreased 90kg shows as increased)
-- Uses the LATEST completed Train Now session automatically
-- =============================================================================

-- 1) Show which session we're debugging (latest completed Train Now)
SELECT
  ws.id AS session_id,
  ws.day_name,
  ws.date,
  ws.status,
  ws.completed_at,
  ws.total_exercises,
  ws.completed_sets,
  ws.total_sets
FROM workout_sessions ws
WHERE ws.day_name = 'Train Now'
  AND ws.completed_at IS NOT NULL
ORDER BY ws.completed_at DESC
LIMIT 1;


-- 2) ALL adjustments saved to DB (weight, reps, rest, exercise_swap, etc.)
SELECT
  wsa.id,
  wsa.type,
  e.name AS exercise_name,
  wsa.from_value,
  wsa.to_value,
  wsa.reason,
  wsa.affected_set_numbers,
  wsa.affects_future_sets,
  wsa.is_applied,
  wsa.created_at
FROM workout_session_adjustments wsa
LEFT JOIN exercises e ON e.id = wsa.exercise_id
WHERE wsa.session_id = (SELECT id FROM workout_sessions WHERE day_name = 'Train Now' AND completed_at IS NOT NULL ORDER BY completed_at DESC LIMIT 1)
ORDER BY wsa.created_at ASC;


-- 3) Weight adjustments only (subset of above)
--    Check: from_value should be OLD weight, to_value should be NEW weight
--    For a decrease: from_value > to_value
SELECT
  id,
  type,
  exercise_id,
  from_value,
  to_value,
  (from_value::numeric - to_value::numeric) AS delta_kg,
  reason,
  affected_set_numbers,
  created_at,
  is_applied
FROM workout_session_adjustments
WHERE session_id = (SELECT id FROM workout_sessions WHERE day_name = 'Train Now' AND completed_at IS NOT NULL ORDER BY completed_at DESC LIMIT 1)
  AND type = 'weight'
ORDER BY created_at ASC;


-- 4) Raw weight rows - verify from_value/to_value are stored correctly
--    If user decreased 90kg: expect from_value > to_value (e.g. 180 vs 90)
SELECT
  id,
  type,
  from_value,
  to_value,
  created_at,
  reason
FROM workout_session_adjustments
WHERE session_id = (SELECT id FROM workout_sessions WHERE day_name = 'Train Now' AND completed_at IS NOT NULL ORDER BY completed_at DESC LIMIT 1)
  AND type = 'weight'
ORDER BY created_at ASC;


-- 5) Cross-check: workout_entry weight after adjustments
--    workout_entries.weight should match the LAST to_value for that entry
SELECT
  we.id AS workout_entry_id,
  we.weight AS entry_weight,
  e.name AS exercise_name,
  wsa.from_value,
  wsa.to_value,
  wsa.created_at
FROM workout_entries we
JOIN workout_session_sets wss ON wss.workout_entry_id = we.id
JOIN workout_session_adjustments wsa ON wsa.workout_entry_id = we.id AND wsa.type = 'weight'
JOIN exercises e ON e.id = we.exercise_id
WHERE wss.session_id = (SELECT id FROM workout_sessions WHERE day_name = 'Train Now' AND completed_at IS NOT NULL ORDER BY completed_at DESC LIMIT 1)
ORDER BY we.id, wsa.created_at;


-- 6) Simulate getNetChange logic (sort by from - BUG: wrong for decreases)
--    This mimics what the app does. If this produces wrong from/to, the bug is in app logic.
WITH weight_adjs AS (
  SELECT
    id,
    exercise_id,
    (from_value::numeric) AS from_num,
    (to_value::numeric) AS to_num,
    created_at
  FROM workout_session_adjustments
  WHERE session_id = (SELECT id FROM workout_sessions WHERE day_name = 'Train Now' AND completed_at IS NOT NULL ORDER BY completed_at DESC LIMIT 1)
    AND type = 'weight'
),
sorted_by_from AS (
  SELECT *, ROW_NUMBER() OVER (ORDER BY from_num ASC) AS rn
  FROM weight_adjs
),
first_last AS (
  SELECT
    MIN(from_num) AS first_from,
    MAX(to_num) AS last_to
  FROM (
    SELECT from_num, to_num
    FROM sorted_by_from
    WHERE rn = 1
    UNION ALL
    SELECT from_num, to_num
    FROM sorted_by_from
    WHERE rn = (SELECT MAX(rn) FROM sorted_by_from)
  ) t
)
SELECT
  first_from AS "from (buggy sort by from)",
  last_to AS "to (buggy sort by from)",
  (last_to - first_from) AS "delta (buggy)"
FROM first_last;


-- 7) Correct getNetChange logic (sort by created_at)
--    This is what the app SHOULD do for chronological order
WITH weight_adjs AS (
  SELECT
    (from_value::numeric) AS from_num,
    (to_value::numeric) AS to_num,
    created_at,
    ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM workout_session_adjustments
  WHERE session_id = (SELECT id FROM workout_sessions WHERE day_name = 'Train Now' AND completed_at IS NOT NULL ORDER BY completed_at DESC LIMIT 1)
    AND type = 'weight'
),
first_last AS (
  SELECT
    MAX(CASE WHEN rn = 1 THEN from_num END) AS first_from,
    MAX(CASE WHEN rn = (SELECT MAX(rn) FROM weight_adjs) THEN to_num END) AS last_to
  FROM weight_adjs
)
SELECT
  first_from AS "from (correct: by created_at)",
  last_to AS "to (correct: by created_at)",
  (last_to - first_from) AS "delta (correct)"
FROM first_last;


-- 8) Per-exercise net change (matches app when grouped by exercise)
--    If app shows -20kg, it may be one exercise's net; this lists each exercise's from/to/delta
WITH ranked AS (
  SELECT
    exercise_id,
    (from_value::numeric) AS from_num,
    (to_value::numeric) AS to_num,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY exercise_id ORDER BY created_at ASC) AS rn,
    COUNT(*) OVER (PARTITION BY exercise_id) AS cnt
  FROM workout_session_adjustments
  WHERE session_id = (SELECT id FROM workout_sessions WHERE day_name = 'Train Now' AND completed_at IS NOT NULL ORDER BY completed_at DESC LIMIT 1)
    AND type = 'weight'
)
SELECT
  r.exercise_id,
  e.name AS exercise_name,
  MAX(CASE WHEN r.rn = 1 THEN r.from_num END) AS first_from,
  MAX(CASE WHEN r.rn = r.cnt THEN r.to_num END) AS last_to,
  (MAX(CASE WHEN r.rn = r.cnt THEN r.to_num END) - MAX(CASE WHEN r.rn = 1 THEN r.from_num END)) AS delta
FROM ranked r
LEFT JOIN exercises e ON e.id = r.exercise_id
GROUP BY r.exercise_id, e.name;


-- 9) Raw per-exercise adjustments (json)
SELECT
  wsa.exercise_id,
  e.name AS exercise_name,
  json_agg(
    json_build_object(
      'from_value', wsa.from_value,
      'to_value', wsa.to_value,
      'created_at', wsa.created_at
    ) ORDER BY wsa.created_at ASC
  ) AS adjustments_chronological
FROM workout_session_adjustments wsa
LEFT JOIN exercises e ON e.id = wsa.exercise_id
WHERE wsa.session_id = (SELECT id FROM workout_sessions WHERE day_name = 'Train Now' AND completed_at IS NOT NULL ORDER BY completed_at DESC LIMIT 1)
  AND wsa.type = 'weight'
GROUP BY wsa.exercise_id, e.name;


-- 10) Quick sanity: any weight rows where from_value < to_value (increase) 
--    when user reported a decrease? Could indicate swapped from/to in middleware
SELECT
  id,
  from_value,
  to_value,
  (to_value::numeric - from_value::numeric) AS stored_delta,
  reason,
  created_at
FROM workout_session_adjustments
WHERE session_id = (SELECT id FROM workout_sessions WHERE day_name = 'Train Now' AND completed_at IS NOT NULL ORDER BY completed_at DESC LIMIT 1)
  AND type = 'weight';
