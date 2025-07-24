-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a simple todos table for demo
CREATE TABLE IF NOT EXISTS todos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create a trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON todos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create policies for todos
CREATE POLICY "Users can insert their own todos" ON todos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own todos" ON todos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos" ON todos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos" ON todos
    FOR DELETE USING (auth.uid() = user_id);

-- Insert some sample data (will be visible to the authenticated user)
INSERT INTO todos (title, description, completed, user_id) 
VALUES 
  ('Learn React Native', 'Master React Native development with Expo', false, auth.uid()),
  ('Setup Supabase', 'Configure Supabase for GraphQL integration', true, auth.uid()),
  ('Implement RTK Query', 'Add Redux Toolkit Query for state management', false, auth.uid())
ON CONFLICT DO NOTHING; 