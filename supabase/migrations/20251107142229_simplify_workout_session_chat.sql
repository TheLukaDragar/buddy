-- ============================================================================
-- Simplify workout_session_chat table to only track ElevenLabs conversations
-- ============================================================================
-- Since ElevenLabs already stores all chat messages, we only need to track
-- which conversations were started during each workout session.
-- ============================================================================

-- Drop the old table and recreate with simplified structure
DROP TABLE IF EXISTS public.workout_session_chat CASCADE;

CREATE TABLE IF NOT EXISTS public.workout_session_chat (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  
  -- ElevenLabs Conversation ID (required - this is what we're tracking)
  conversation_id TEXT NOT NULL,
  
  -- Event type: 'connected' or 'disconnected'
  event_type TEXT NOT NULL CHECK (event_type IN ('connected', 'disconnected')),
  
  -- Optional details about the connection/disconnection
  details TEXT, -- e.g., disconnect reason
  
  -- Timing
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Critical indexes
CREATE INDEX IF NOT EXISTS idx_chat_session_id_timestamp 
  ON public.workout_session_chat(session_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_chat_conversation_id 
  ON public.workout_session_chat(conversation_id);

CREATE INDEX IF NOT EXISTS idx_chat_event_type 
  ON public.workout_session_chat(event_type);

COMMENT ON TABLE public.workout_session_chat IS 
'Stores ElevenLabs conversation IDs for workout sessions. Only tracks when conversations are connected/disconnected, not individual messages (ElevenLabs stores those).';

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE public.workout_session_chat ENABLE ROW LEVEL SECURITY;

-- Users can only see chat records for their own workout sessions
CREATE POLICY "Users can view their own workout session conversations"
  ON public.workout_session_chat FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      WHERE ws.id = workout_session_chat.session_id
        AND ws.user_id = auth.uid()
    )
  );

-- Users can only insert chat records for their own workout sessions
CREATE POLICY "Users can insert their own workout session conversations"
  ON public.workout_session_chat FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      WHERE ws.id = workout_session_chat.session_id
        AND ws.user_id = auth.uid()
    )
  );

