# Supabase GraphQL + RTK Query Setup Guide

This guide walks you through setting up Supabase with GraphQL and Redux Toolkit Query for your Buddy React Native app, including **real-time capabilities** and **type-safe code generation**.

## 🚀 Quick Start

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (it may take a few minutes)
3. Go to Settings > API in your Supabase dashboard
4. Copy your `Project URL` and `anon public` API key

### 2. Environment Setup

Create a `.env.local` file in your project root and add:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Existing OpenAI Configuration (if applicable)
OPENAI_API_KEY=your_openai_api_key
```

### 3. Enable GraphQL in Supabase

1. In your Supabase dashboard, go to the SQL Editor
2. Run the following to enable the GraphQL extension:

```sql
CREATE EXTENSION IF NOT EXISTS pg_graphql;
```

### 4. Enable Real-time in Supabase

1. Go to Database → Replication in your Supabase dashboard
2. Ensure "Realtime is enabled" is turned ON
3. Add your `todos` table to the publication:

```sql
-- Add the todos table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE todos;
```

### 5. Create Demo Database Schema

In the SQL Editor, run the complete SQL script from `supabase/demo-setup.sql`:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = TIMEZONE('utc'::text, NOW());
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_todos_updated_at 
  BEFORE UPDATE ON todos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow anonymous access to todos" ON todos
  FOR ALL USING (true);

-- Add todos table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE todos;

-- Insert some demo data
INSERT INTO todos (title, description, completed) VALUES
  ('Setup Supabase', 'Configure Supabase for GraphQL integration', true),
  ('Learn React Native', 'Master React Native development with Expo', false),
  ('Implement RTK Query', 'Add Redux Toolkit Query for state management', false);
```

### 6. Generate GraphQL Types and Hooks

Once your Supabase project is set up with the environment variables:

```bash
# Install dependencies (if not already installed)
npm install

# Generate GraphQL types and RTK Query hooks
npm run codegen
```

This will create:
- `graphql/generated.ts` - TypeScript types and RTK Query hooks
- `graphql/introspection.json` - GraphQL schema introspection

### 7. Verify Setup

Navigate to the "GraphQL Demo" tab in your app. You should see:

1. ✅ **Real-time connection established**
2. ✅ **Demo todos loaded from database**
3. ✅ **Create/Update/Delete functionality working**
4. ✅ **Live updates across multiple tabs/devices**

## 📁 Enhanced Project Structure

```
├── store/api/
│   ├── baseApi.ts               # Minimal RTK Query base API
│   └── enhancedApi.ts          # Enhanced API with real-time capabilities
├── lib/
│   ├── supabase.ts             # Supabase client configuration
│   └── realtimeClient.ts       # Real-time subscription manager
├── graphql/
│   ├── queries/todos.graphql   # GraphQL query definitions
│   └── generated.ts            # Generated types & hooks (from codegen)
├── supabase/
│   └── demo-setup.sql         # Database schema setup
├── app/(tabs)/
│   └── graphql-demo.tsx       # Real-time demo component
├── codegen.ts                 # GraphQL codegen configuration
└── .env.local                 # Environment variables
```

## 🔧 Available Scripts

```bash
# Generate GraphQL types and hooks
npm run codegen

# Watch for GraphQL changes and regenerate
npm run codegen:watch

# Start the app
npm start
```

## 🎯 Production Features

The enhanced GraphQL implementation includes:

### ✅ **Type-safe Operations**
- **Generated hooks** for all GraphQL operations
- **Full TypeScript support** throughout the data flow
- **Automatic type checking** for queries and mutations

### ✅ **Real-time Capabilities**
- **Live data synchronization** across all connected devices
- **Instant updates** for CREATE, UPDATE, DELETE operations
- **Smart cache management** with automatic invalidation
- **Connection management** with cleanup on unmount

### ✅ **Production Architecture**
- **Single API slice** following RTK Query best practices
- **Enhanced endpoints** for adding real-time to generated queries
- **Proper separation of concerns** (base → generated → enhanced)
- **Error handling** and comprehensive logging

### ✅ **Performance Optimization**
- **Efficient updates** - only changed data transmitted
- **No polling** - pure push-based real-time updates
- **Smart caching** - deduplicated requests and intelligent cache management
- **Minimal re-renders** - components only update when their data changes

## 🔍 Testing the Integration

### Method 1: Single Device Testing
1. Navigate to the "GraphQL Demo" tab
2. Create a new todo using the form
3. Toggle todo completion status
4. Delete a todo
5. Watch real-time updates in the debug log

### Method 2: Multi-tab Testing
1. Open your app in multiple browser tabs
2. Create/update/delete todos in one tab
3. Watch instant synchronization across all tabs

### Method 3: Database Direct Testing
1. Go to Supabase Dashboard → Table Editor → todos
2. Manually add/edit/delete a row
3. Watch changes appear instantly in your app

### Method 4: Multi-device Testing
1. Open your app on different devices/browsers
2. Make changes on one device
3. See instant synchronization across all devices

## 🛠 Troubleshooting

### Real-time not working
- **Check Realtime is enabled** in Supabase Dashboard → Database → Replication
- **Verify todos table is in publication**: Run `SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';`
- **Check RLS policies** allow real-time access
- **Test connection** using the "Test Real-time Connection" button in the demo

### GraphQL endpoint not working
- **Enable pg_graphql extension**: `CREATE EXTENSION IF NOT EXISTS pg_graphql;`
- **Verify environment variables** are correct in `.env.local`
- **Check Supabase project** is fully initialized (green status)

### Codegen fails
- **Check environment variables** are set correctly
- **Verify internet connection** for schema introspection
- **Run codegen again**: `npm run codegen`
- **Check Supabase GraphQL endpoint** is accessible

### Authentication issues
- **RLS policies** are configured for anonymous access in demo
- **For production**: Add proper authentication and user-specific RLS policies
- **Test with auth**: Consider adding Supabase Auth for full production flow

### TypeScript errors
- **Regenerate types**: `npm run codegen`
- **Check imports** are using enhanced API hooks
- **Verify file structure** matches the documented layout

## 🚀 Usage Examples

### Basic Component with Real-time

```typescript
import { 
  useGetTodosQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation 
} from '../../store/api/enhancedApi'

export default function TodoList() {
  // Real-time updates happen automatically!
  const { data, isLoading, error } = useGetTodosQuery()
  const [createTodo, { isLoading: isCreating }] = useCreateTodoMutation()

  const todos = data?.todosCollection?.edges?.map(edge => edge.node) || []

  const handleCreate = async () => {
    await createTodo({
      title: 'New Todo',
      description: 'Created from app',
      completed: false
    })
    // Real-time update will automatically add to cache
  }

  if (isLoading) return <Text>Loading...</Text>
  if (error) return <Text>Error: {error.toString()}</Text>

  return (
    <View>
      {todos.map(todo => (
        <Text key={todo.id}>{todo.title}</Text>
      ))}
      <Button onPress={handleCreate} loading={isCreating}>
        Add Todo
      </Button>
    </View>
  )
}
```

### Advanced Usage with Error Handling

```typescript
const { data, isLoading, error, refetch } = useGetTodosQuery(undefined, {
  // Refetch when app gains focus
  refetchOnFocus: true,
  // Refetch when reconnected
  refetchOnReconnect: true,
  // Keep data in cache for 5 minutes
  keepUnusedDataFor: 300,
})

const [updateTodo] = useUpdateTodoMutation({
  // Handle optimistic updates or errors here
  onQueryStarted: async (arg, { queryFulfilled }) => {
    try {
      await queryFulfilled
      console.log('Todo updated successfully')
    } catch (error) {
      console.error('Failed to update todo:', error)
    }
  }
})
```

## 📚 Learn More

- [Enhanced Real-time GraphQL Guide](./REALTIME_GRAPHQL_GUIDE.md) - Detailed implementation guide
- [Supabase GraphQL docs](https://supabase.com/docs/guides/api/graphql)
- [Supabase Realtime docs](https://supabase.com/docs/guides/realtime)
- [RTK Query docs](https://redux-toolkit.js.org/rtk-query/overview)
- [RTK Query Enhanced Endpoints](https://redux-toolkit.js.org/rtk-query/api/created-api/code-splitting#enhanceendpoints)
- [GraphQL Code Generator docs](https://the-guild.dev/graphql/codegen)

## 🎉 Next Steps

Once you have the enhanced setup working, you can:

### Immediate Enhancements
1. **Add user authentication** with Supabase Auth
2. **Implement user-specific RLS policies** for data security
3. **Add optimistic updates** for instant user feedback
4. **Create more complex GraphQL queries** and relationships

### Advanced Features
1. **Add offline support** with background sync
2. **Implement file uploads** with Supabase Storage
3. **Add push notifications** for real-time alerts
4. **Scale to other data types** (users, posts, comments, etc.)

### Production Deployment
1. **Configure proper RLS policies** for multi-tenant data
2. **Add monitoring and error tracking** for real-time connections
3. **Implement connection retry logic** for mobile networks
4. **Add performance monitoring** for GraphQL queries

---

🎉 **Congratulations!** You now have a **production-ready, type-safe, real-time GraphQL implementation** that follows industry best practices and delivers enterprise-grade performance! 