# Supabase Database Setup Instructions

## Step 1: Enable GraphQL Extension

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** in the sidebar
4. Run this command to enable GraphQL:

```sql
CREATE EXTENSION IF NOT EXISTS pg_graphql;
```

## Step 2: Create the Todos Table

Copy and paste this SQL into the SQL Editor and run it:

```sql
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
```

## Step 3: Add Some Sample Data (Optional)

If you want to test without authentication first, you can temporarily add some public data:

```sql
-- Temporarily disable RLS for testing (you can re-enable it later)
ALTER TABLE todos DISABLE ROW LEVEL SECURITY;

-- Insert some sample data
INSERT INTO todos (title, description, completed) 
VALUES 
  ('Learn React Native', 'Master React Native development with Expo', false),
  ('Setup Supabase', 'Configure Supabase for GraphQL integration', true),
  ('Implement RTK Query', 'Add Redux Toolkit Query for state management', false)
ON CONFLICT DO NOTHING;
```

## Step 4: Verify GraphQL Schema

After creating the table, wait a minute for Supabase to refresh the GraphQL schema, then run:

```bash
npm run codegen
```

You should now see `todosCollection` available in your GraphQL schema!

## Step 5: Re-enable RLS (Important for Production)

If you disabled RLS for testing, make sure to re-enable it:

```sql
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
```

## Troubleshooting

- **Table not appearing in GraphQL**: Wait a few minutes after creating the table
- **Permission errors**: Make sure RLS policies are set up correctly
- **Still no `todosCollection`**: Try refreshing your Supabase project or check the table was created successfully 