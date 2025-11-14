-- ============================================================================
-- Migration: Workout Sessions and Chat Tracking
-- ============================================================================
-- This migration creates tables to track:
-- 1. Active and completed workout sessions
-- 2. Set completions with performance data
-- 3. Workout adjustments made during sessions
-- 4. Chat messages/conversation events (single table for all messages)
-- ============================================================================

-- ============================================================================
-- 1. WORKOUT SESSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Workout Plan Reference
  workout_plan_id UUID NOT NULL REFERENCES public.workout_plans(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  day public.weekday NOT NULL,
  day_name TEXT NOT NULL,
  date DATE NOT NULL, -- Actual date workout was performed
  
  -- Session Status & Timing
  status TEXT NOT NULL CHECK (status IN ('selected', 'preparing', 'exercising', 'paused', 'completed', 'finished_early', 'abandoned')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  paused_at TIMESTAMP WITH TIME ZONE,
  resumed_at TIMESTAMP WITH TIME ZONE,
  
  -- Progress Tracking
  current_exercise_index INTEGER DEFAULT 0,
  current_set_index INTEGER DEFAULT 0,
  completed_exercises INTEGER DEFAULT 0,
  completed_sets INTEGER DEFAULT 0,
  total_exercises INTEGER NOT NULL,
  total_sets INTEGER NOT NULL,
  
  -- Time Tracking (calculated fields, updated by triggers/functions)
  total_time_ms BIGINT DEFAULT 0,
  total_pause_time_ms BIGINT DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Completion Status
  is_fully_completed BOOLEAN DEFAULT FALSE,
  finished_early BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Partial unique index (works on all PostgreSQL versions)
-- Ensures only ONE active session per user at a time
CREATE UNIQUE INDEX idx_workout_sessions_unique_active_per_user 
  ON public.workout_sessions(user_id) 
  WHERE status IN ('selected', 'preparing', 'exercising', 'paused');

-- Critical indexes for common queries
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date 
  ON public.workout_sessions(user_id, date DESC);
  
CREATE INDEX IF NOT EXISTS idx_workout_sessions_plan_week_day 
  ON public.workout_sessions(workout_plan_id, week_number, day);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_status 
  ON public.workout_sessions(status) 
  WHERE status IN ('selected', 'preparing', 'exercising', 'paused');

CREATE INDEX IF NOT EXISTS idx_workout_sessions_started_at 
  ON public.workout_sessions(started_at DESC);

-- Updated_at trigger
CREATE TRIGGER update_workout_sessions_updated_at
  BEFORE UPDATE ON public.workout_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.workout_sessions IS 
'Tracks active and completed workout sessions. One active session per user at a time.';

COMMENT ON COLUMN public.workout_sessions.date IS 
'Actual date the workout was performed. Allows multiple sessions per day for different workouts.';

COMMENT ON COLUMN public.workout_sessions.status IS 
'Session status: selected (warmup), preparing, exercising, paused, completed, finished_early, abandoned';

-- ============================================================================
-- 2. WORKOUT SESSION SETS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.workout_session_sets (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  
  -- Exercise & Set Reference
  workout_entry_id UUID NOT NULL REFERENCES public.workout_entries(id) ON DELETE RESTRICT, -- Prevent accidental deletion
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
  set_number INTEGER NOT NULL,
  
  -- Performance Data
  target_reps INTEGER,
  target_weight DECIMAL(5,2),
  target_time INTEGER, -- seconds
  actual_reps INTEGER,
  actual_weight DECIMAL(5,2),
  actual_time INTEGER, -- seconds
  
  -- User Feedback
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'impossible')),
  user_notes TEXT,
  
  -- Timing
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Status
  is_completed BOOLEAN DEFAULT TRUE,
  skipped BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one set completion per session/exercise/set_number
  CONSTRAINT unique_set_completion UNIQUE (session_id, workout_entry_id, set_number)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_session_sets_session_id 
  ON public.workout_session_sets(session_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_session_sets_exercise_id 
  ON public.workout_session_sets(exercise_id);

CREATE INDEX IF NOT EXISTS idx_session_sets_workout_entry_id 
  ON public.workout_session_sets(workout_entry_id);

COMMENT ON TABLE public.workout_session_sets IS 
'Tracks individual set completions with performance data. Links to workout_sessions and workout_entries.';

-- ============================================================================
-- 3. WORKOUT SESSION ADJUSTMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.workout_session_adjustments (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  
  -- Adjustment Details
  type TEXT NOT NULL CHECK (type IN ('reps', 'weight', 'rest', 'exercise_swap', 'sets')),
  workout_entry_id UUID REFERENCES public.workout_entries(id) ON DELETE SET NULL,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE SET NULL,
  
  -- Change Details
  from_value TEXT NOT NULL, -- Can be number or exercise name
  to_value TEXT NOT NULL,
  reason TEXT NOT NULL, -- e.g., "User adjustment", "Too easy", "Equipment unavailable"
  
  -- Affected Sets
  affected_set_numbers INTEGER[], -- Array of set numbers affected
  affects_future_sets BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Metadata for complex adjustments
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_adjustments_session_id 
  ON public.workout_session_adjustments(session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_adjustments_workout_entry_id 
  ON public.workout_session_adjustments(workout_entry_id);

CREATE INDEX IF NOT EXISTS idx_adjustments_type 
  ON public.workout_session_adjustments(type);

COMMENT ON TABLE public.workout_session_adjustments IS 
'Tracks all adjustments made during workout sessions. Includes reps, weight, rest time, and exercise swaps.';

-- ============================================================================
-- 4. WORKOUT SESSION CHAT TABLE (Single table for all messages)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.workout_session_chat (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  
  -- Message Details (normalized for queries)
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  event_type TEXT NOT NULL, -- 'user_transcript', 'agent_response', 'tool_call', 'context_message', etc.
  content TEXT NOT NULL,
  
  -- ElevenLabs Integration
  conversation_id TEXT,
  event_id TEXT,
  
  -- Event Source
  source TEXT CHECK (source IN ('voice', 'text', 'system', 'tool')),
  
  -- Full Event Data (only for debugging/replay - can be large)
  event_data JSONB,
  
  -- Timing
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Metadata (for tool calls, corrections, etc.)
  metadata JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Critical indexes
CREATE INDEX IF NOT EXISTS idx_chat_session_id_timestamp 
  ON public.workout_session_chat(session_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_chat_conversation_id 
  ON public.workout_session_chat(conversation_id) 
  WHERE conversation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_chat_role 
  ON public.workout_session_chat(role, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_chat_event_type 
  ON public.workout_session_chat(event_type);

COMMENT ON TABLE public.workout_session_chat IS 
'Stores all chat messages and conversation events for workout sessions. Includes user transcripts, agent responses, tool calls, and system context messages.';

-- ============================================================================
-- 5. DATABASE FUNCTIONS
-- ============================================================================

-- Function to increment completed sets count
CREATE OR REPLACE FUNCTION public.increment_completed_sets(session_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.workout_sessions
  SET 
    completed_sets = completed_sets + 1,
    last_activity_at = NOW(),
    updated_at = NOW()
  WHERE id = session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate total workout time from set completions
CREATE OR REPLACE FUNCTION public.calculate_total_time_ms(session_id UUID)
RETURNS BIGINT AS $$
DECLARE
  total_ms BIGINT;
BEGIN
  SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (completed_at - started_at)) * 1000)::BIGINT, 0)
  INTO total_ms
  FROM public.workout_session_sets
  WHERE session_id = calculate_total_time_ms.session_id
    AND started_at IS NOT NULL
    AND completed_at IS NOT NULL;
  
  RETURN total_ms;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's active session
CREATE OR REPLACE FUNCTION public.get_active_session(user_id UUID)
RETURNS TABLE (
  id UUID,
  workout_plan_id UUID,
  week_number INTEGER,
  day public.weekday,
  day_name TEXT,
  date DATE,
  status TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  current_exercise_index INTEGER,
  current_set_index INTEGER,
  completed_exercises INTEGER,
  completed_sets INTEGER,
  total_exercises INTEGER,
  total_sets INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ws.id,
    ws.workout_plan_id,
    ws.week_number,
    ws.day,
    ws.day_name,
    ws.date,
    ws.status,
    ws.started_at,
    ws.current_exercise_index,
    ws.current_set_index,
    ws.completed_exercises,
    ws.completed_sets,
    ws.total_exercises,
    ws.total_sets
  FROM public.workout_sessions ws
  WHERE ws.user_id = get_active_session.user_id
    AND ws.status IN ('selected', 'preparing', 'exercising', 'paused')
  ORDER BY ws.started_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_session_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_session_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_session_chat ENABLE ROW LEVEL SECURITY;

-- Workout Sessions Policies
CREATE POLICY "Users can view own workout sessions"
  ON public.workout_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout sessions"
  ON public.workout_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout sessions"
  ON public.workout_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout sessions"
  ON public.workout_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Workout Session Sets Policies
CREATE POLICY "Users can view own session sets"
  ON public.workout_session_sets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      WHERE ws.id = workout_session_sets.session_id
      AND ws.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own session sets"
  ON public.workout_session_sets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      WHERE ws.id = workout_session_sets.session_id
      AND ws.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own session sets"
  ON public.workout_session_sets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      WHERE ws.id = workout_session_sets.session_id
      AND ws.user_id = auth.uid()
    )
  );

-- Workout Session Adjustments Policies
CREATE POLICY "Users can view own session adjustments"
  ON public.workout_session_adjustments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      WHERE ws.id = workout_session_adjustments.session_id
      AND ws.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own session adjustments"
  ON public.workout_session_adjustments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      WHERE ws.id = workout_session_adjustments.session_id
      AND ws.user_id = auth.uid()
    )
  );

-- Workout Session Chat Policies
CREATE POLICY "Users can view own session chat"
  ON public.workout_session_chat FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      WHERE ws.id = workout_session_chat.session_id
      AND ws.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own session chat"
  ON public.workout_session_chat FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      WHERE ws.id = workout_session_chat.session_id
      AND ws.user_id = auth.uid()
    )
  );







