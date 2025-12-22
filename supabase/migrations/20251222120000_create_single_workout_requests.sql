-- Create table for tracking single workout generation requests
CREATE TABLE IF NOT EXISTS public.single_workout_requests (
  id uuid DEFAULT uuid_generate_v4() NOT NULL,
  request_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status text DEFAULT 'processing'::text NOT NULL,

  -- Request parameters
  muscle_groups text[] NOT NULL,
  duration integer NOT NULL,
  equipment text[] NOT NULL,
  difficulty text NOT NULL,
  user_profile text NOT NULL,

  -- Results
  generated_preset_id uuid,
  error_message text,

  -- Progress tracking
  current_step integer DEFAULT 1,
  total_steps integer DEFAULT 2,
  step_description text DEFAULT 'Generating your workout...'::text,

  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,

  CONSTRAINT single_workout_requests_pkey PRIMARY KEY (id),
  CONSTRAINT single_workout_requests_request_id_key UNIQUE (request_id),
  CONSTRAINT single_workout_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT single_workout_requests_preset_id_fkey FOREIGN KEY (generated_preset_id) REFERENCES public.workout_presets(id),
  CONSTRAINT single_workout_requests_status_check CHECK (status = ANY (ARRAY['processing'::text, 'completed'::text, 'failed'::text, 'cancelled'::text])),
  CONSTRAINT single_workout_requests_difficulty_check CHECK (difficulty = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text]))
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_single_workout_requests_request_id
  ON public.single_workout_requests USING btree (request_id);

CREATE INDEX IF NOT EXISTS idx_single_workout_requests_user_status
  ON public.single_workout_requests USING btree (user_id, status);

-- Add comment for documentation
COMMENT ON TABLE public.single_workout_requests IS 'Tracks single workout generation requests with progress and results';
