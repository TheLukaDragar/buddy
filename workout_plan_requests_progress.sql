-- Add progress tracking fields to workout_plan_requests table

ALTER TABLE workout_plan_requests ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 1;
ALTER TABLE workout_plan_requests ADD COLUMN IF NOT EXISTS total_steps INTEGER DEFAULT 3;
ALTER TABLE workout_plan_requests ADD COLUMN IF NOT EXISTS step_description TEXT DEFAULT 'Generating workout plan...';
ALTER TABLE workout_plan_requests ADD COLUMN IF NOT EXISTS exercises_total INTEGER DEFAULT 0;
ALTER TABLE workout_plan_requests ADD COLUMN IF NOT EXISTS exercises_completed INTEGER DEFAULT 0;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_workout_plan_requests_progress ON workout_plan_requests(current_step, exercises_completed);

-- Add constraints (drop first if they exist to avoid conflicts)
DO $$ 
BEGIN
    -- Add step range constraint
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_step_range') THEN
        ALTER TABLE workout_plan_requests ADD CONSTRAINT valid_step_range CHECK (current_step >= 1 AND current_step <= total_steps);
    END IF;
    
    -- Add exercise progress constraint
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_exercise_progress') THEN
        ALTER TABLE workout_plan_requests ADD CONSTRAINT valid_exercise_progress CHECK (exercises_completed >= 0 AND exercises_completed <= exercises_total);
    END IF;
END $$;
