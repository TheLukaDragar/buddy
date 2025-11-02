-- Production-Ready SQL Database Schema for 8-Week Workout Plan
-- This schema includes proper constraints, triggers, indexes, and security features

-- Enable UUID extension for better security
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with enhanced security
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- For authentication
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP, -- Soft delete support
    
    -- Data validation constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_username CHECK (username ~* '^[a-zA-Z0-9_]{3,50}$')
);

-- Workout plans table with enhanced constraints
CREATE TABLE workout_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Business logic constraints
    CONSTRAINT valid_date_range CHECK (end_date > start_date),
    CONSTRAINT valid_plan_duration CHECK (end_date - start_date <= INTERVAL '12 weeks')
);

-- Workout types table with enhanced validation
CREATE TABLE workout_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    exercises_count INTEGER NOT NULL,
    reps_count INTEGER NOT NULL,
    category VARCHAR(50) NOT NULL,
    difficulty_level INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Data validation constraints
    CONSTRAINT valid_duration CHECK (duration_minutes BETWEEN 5 AND 180),
    CONSTRAINT valid_exercises_count CHECK (exercises_count BETWEEN 1 AND 50),
    CONSTRAINT valid_reps_count CHECK (reps_count BETWEEN 1 AND 100),
    CONSTRAINT valid_category CHECK (category IN ('strength', 'cardio', 'flexibility', 'balance', 'endurance')),
    CONSTRAINT valid_difficulty CHECK (difficulty_level BETWEEN 1 AND 5)
);

-- Individual workouts table with comprehensive tracking
CREATE TABLE workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
    workout_type_id UUID NOT NULL REFERENCES workout_types(id) ON DELETE RESTRICT,
    week_number INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    actual_duration_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Data validation constraints
    CONSTRAINT valid_week_number CHECK (week_number BETWEEN 1 AND 12),
    CONSTRAINT valid_day_of_week CHECK (day_of_week BETWEEN 0 AND 6),
    CONSTRAINT valid_actual_duration CHECK (actual_duration_minutes IS NULL OR actual_duration_minutes BETWEEN 1 AND 300),
    CONSTRAINT valid_completion CHECK (
        (is_completed = false AND completed_at IS NULL) OR 
        (is_completed = true AND completed_at IS NOT NULL)
    )
);

-- Workout progress tracking with enhanced metrics
CREATE TABLE workout_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_name VARCHAR(100) NOT NULL,
    sets_completed INTEGER DEFAULT 0,
    reps_completed INTEGER DEFAULT 0,
    weight_used DECIMAL(6,2), -- Increased precision for kg
    duration_seconds INTEGER,
    distance_meters DECIMAL(8,2), -- For cardio exercises
    calories_burned INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Data validation constraints
    CONSTRAINT valid_sets CHECK (sets_completed >= 0),
    CONSTRAINT valid_reps CHECK (reps_completed >= 0),
    CONSTRAINT valid_weight CHECK (weight_used IS NULL OR weight_used BETWEEN 0 AND 999.99),
    CONSTRAINT valid_duration CHECK (duration_seconds IS NULL OR duration_seconds BETWEEN 1 AND 7200),
    CONSTRAINT valid_distance CHECK (distance_meters IS NULL OR distance_meters >= 0),
    CONSTRAINT valid_calories CHECK (calories_burned IS NULL OR calories_burned >= 0)
);

-- User preferences and settings
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    measurement_unit VARCHAR(10) DEFAULT 'metric', -- 'metric' or 'imperial'
    notification_enabled BOOLEAN DEFAULT true,
    reminder_time TIME DEFAULT '08:00:00',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_measurement_unit CHECK (measurement_unit IN ('metric', 'imperial'))
);

-- Sample data insertion with UUIDs
INSERT INTO workout_types (id, name, description, duration_minutes, exercises_count, reps_count, category, difficulty_level) VALUES
(uuid_generate_v4(), 'Abs & Core', 'Core strengthening and abdominal workout', 45, 8, 12, 'strength', 2),
(uuid_generate_v4(), 'Legs & Glutes', 'Lower body strength and toning', 50, 10, 15, 'strength', 3),
(uuid_generate_v4(), 'Upper Body', 'Chest, back, arms and shoulders', 40, 8, 12, 'strength', 3),
(uuid_generate_v4(), 'Full Body', 'Complete body workout', 55, 12, 10, 'strength', 4),
(uuid_generate_v4(), 'Cardio HIIT', 'High intensity interval training', 30, 6, 20, 'cardio', 4),
(uuid_generate_v4(), 'Strength Training', 'Heavy lifting and strength building', 60, 8, 8, 'strength', 5),
(uuid_generate_v4(), 'Yoga Flow', 'Flexibility and mindfulness', 45, 15, 5, 'flexibility', 2),
(uuid_generate_v4(), 'Pilates', 'Core control and body awareness', 40, 10, 10, 'flexibility', 2);

-- Comprehensive indexing strategy
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_username ON users(username) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_active ON users(is_active) WHERE deleted_at IS NULL;

CREATE INDEX idx_workout_plans_user ON workout_plans(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_workout_plans_active ON workout_plans(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_workout_plans_date_range ON workout_plans(start_date, end_date) WHERE deleted_at IS NULL;

CREATE INDEX idx_workout_types_category ON workout_types(category) WHERE is_active = true;
CREATE INDEX idx_workout_types_difficulty ON workout_types(difficulty_level) WHERE is_active = true;
CREATE INDEX idx_workout_types_active ON workout_types(is_active);

CREATE INDEX idx_workouts_plan_date ON workouts(workout_plan_id, scheduled_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_workouts_week_day ON workouts(workout_plan_id, week_number, day_of_week) WHERE deleted_at IS NULL;
CREATE INDEX idx_workouts_completed ON workouts(is_completed, scheduled_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_workouts_type ON workouts(workout_type_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_workouts_scheduled ON workouts(scheduled_date, scheduled_time) WHERE deleted_at IS NULL;

CREATE INDEX idx_workout_progress_workout ON workout_progress(workout_id);
CREATE INDEX idx_workout_progress_exercise ON workout_progress(exercise_name);
CREATE INDEX idx_workout_progress_created ON workout_progress(created_at);

-- Triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workout_plans_updated_at BEFORE UPDATE ON workout_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workout_types_updated_at BEFORE UPDATE ON workout_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON workouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workout_progress_updated_at BEFORE UPDATE ON workout_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) for multi-tenant security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies (example - adjust based on your auth system)
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own workout plans" ON workout_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout plans" ON workout_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workout plans" ON workout_plans FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own workouts" ON workouts FOR SELECT USING (
    EXISTS (SELECT 1 FROM workout_plans WHERE id = workout_plan_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own workouts" ON workouts FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM workout_plans WHERE id = workout_plan_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update own workouts" ON workouts FOR UPDATE USING (
    EXISTS (SELECT 1 FROM workout_plans WHERE id = workout_plan_id AND user_id = auth.uid())
);

-- Views for common queries
CREATE VIEW active_workout_plans AS
SELECT wp.*, u.username, u.email
FROM workout_plans wp
JOIN users u ON wp.user_id = u.id
WHERE wp.is_active = true AND wp.deleted_at IS NULL AND u.deleted_at IS NULL;

CREATE VIEW upcoming_workouts AS
SELECT 
    w.*,
    wt.name as workout_type_name,
    wt.duration_minutes,
    wt.category,
    wt.difficulty_level,
    wp.name as plan_name,
    u.username
FROM workouts w
JOIN workout_types wt ON w.workout_type_id = wt.id
JOIN workout_plans wp ON w.workout_plan_id = wp.id
JOIN users u ON wp.user_id = u.id
WHERE w.scheduled_date >= CURRENT_DATE 
  AND w.is_completed = false 
  AND w.deleted_at IS NULL
  AND wp.deleted_at IS NULL
  AND u.deleted_at IS NULL
ORDER BY w.scheduled_date, w.scheduled_time;

-- Function to get workout statistics
CREATE OR REPLACE FUNCTION get_workout_stats(user_uuid UUID)
RETURNS TABLE (
    total_workouts BIGINT,
    completed_workouts BIGINT,
    completion_rate DECIMAL(5,2),
    total_duration_minutes BIGINT,
    favorite_category TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_workouts,
        COUNT(CASE WHEN w.is_completed THEN 1 END) as completed_workouts,
        ROUND(COUNT(CASE WHEN w.is_completed THEN 1 END) * 100.0 / COUNT(*), 2) as completion_rate,
        COALESCE(SUM(w.actual_duration_minutes), 0) as total_duration_minutes,
        (SELECT wt.category 
         FROM workout_progress wp
         JOIN workouts w2 ON wp.workout_id = w2.id
         JOIN workout_types wt ON w2.workout_type_id = wt.id
         JOIN workout_plans wp2 ON w2.workout_plan_id = wp2.id
         WHERE wp2.user_id = user_uuid
         GROUP BY wt.category
         ORDER BY COUNT(*) DESC
         LIMIT 1) as favorite_category
    FROM workouts w
    JOIN workout_plans wp ON w.workout_plan_id = wp.id
    WHERE wp.user_id = user_uuid 
      AND w.deleted_at IS NULL 
      AND wp.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Example production queries:

-- Get all workouts for a specific week with proper joins
-- SELECT w.*, wt.name as workout_type_name, wt.duration_minutes, wt.exercises_count, wt.reps_count
-- FROM workouts w
-- JOIN workout_types wt ON w.workout_type_id = wt.id
-- JOIN workout_plans wp ON w.workout_plan_id = wp.id
-- WHERE wp.user_id = $1 AND w.week_number = $2 AND w.deleted_at IS NULL
-- ORDER BY w.scheduled_date;

-- Get workout completion statistics with proper filtering
-- SELECT 
--     week_number,
--     COUNT(*) as total_workouts,
--     COUNT(CASE WHEN is_completed THEN 1 END) as completed_workouts,
--     ROUND(COUNT(CASE WHEN is_completed THEN 1 END) * 100.0 / COUNT(*), 2) as completion_rate
-- FROM workouts w
-- JOIN workout_plans wp ON w.workout_plan_id = wp.id
-- WHERE wp.user_id = $1 AND w.deleted_at IS NULL
-- GROUP BY week_number 
-- ORDER BY week_number;

-- Get upcoming workouts using the view
-- SELECT * FROM upcoming_workouts WHERE user_id = $1 LIMIT 10; 