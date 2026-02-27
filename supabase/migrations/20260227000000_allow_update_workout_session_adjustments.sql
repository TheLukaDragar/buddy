-- Allow users to UPDATE their own session adjustments (e.g. set is_applied = true when saving to future workouts)
-- Previously only SELECT and INSERT were allowed; updates were silently blocked by RLS.

CREATE POLICY "Users can update own session adjustments"
  ON public.workout_session_adjustments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      WHERE ws.id = workout_session_adjustments.session_id
      AND ws.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      WHERE ws.id = workout_session_adjustments.session_id
      AND ws.user_id = auth.uid()
    )
  );
