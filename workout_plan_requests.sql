-- Workout plan requests tracking table (for background processing)
CREATE TABLE IF NOT EXISTS workout_plan_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    workout_plan_id UUID REFERENCES workout_plans(id),
    user_profile TEXT NOT NULL,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workout_plan_requests_user_id ON workout_plan_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_plan_requests_status ON workout_plan_requests(status);
CREATE INDEX IF NOT EXISTS idx_workout_plan_requests_request_id ON workout_plan_requests(request_id);

-- Enable RLS
ALTER TABLE workout_plan_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own requests" ON workout_plan_requests;
DROP POLICY IF EXISTS "Users can create own requests" ON workout_plan_requests;
DROP POLICY IF EXISTS "Service role can update requests" ON workout_plan_requests;

-- Users can only see their own requests
CREATE POLICY "Users can view own requests" ON workout_plan_requests
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own requests (though this will be done by the function)
CREATE POLICY "Users can create own requests" ON workout_plan_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role can update requests (for background processing)
CREATE POLICY "Service role can update requests" ON workout_plan_requests
    FOR UPDATE USING (true);