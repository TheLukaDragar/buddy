import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Text, TextInput } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useBuddyTheme } from '@/constants/BuddyTheme';
import { nucleus } from '../../Buddy_variables.js';

// Import the enhanced real-time GraphQL hooks
import { realtimeClient } from '../../lib/realtimeClient';
import { 
  useGetTodosQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation 
} from '../../store/api/enhancedApi';

export default function GraphQLDemoScreen() {
  const theme = useBuddyTheme();
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoDescription, setNewTodoDescription] = useState('');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // Use the enhanced real-time GraphQL hooks
  const { data, isLoading, error, refetch } = useGetTodosQuery();
  const [createTodo, { isLoading: isCreating }] = useCreateTodoMutation();
  const [updateTodo] = useUpdateTodoMutation();
  const [deleteTodo] = useDeleteTodoMutation();

  // Add debugging effect
  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString();
    if (isLoading) {
      setDebugInfo(prev => [...prev.slice(-4), `${timestamp}: Loading todos...`]);
    } else if (error) {
      setDebugInfo(prev => [...prev.slice(-4), `${timestamp}: Error loading todos`]);
      console.error('GraphQL Error:', error);
    } else if (data) {
      const todoCount = data?.todosCollection?.edges?.length || 0;
      setDebugInfo(prev => [...prev.slice(-4), `${timestamp}: Loaded ${todoCount} todos`]);
      console.log('GraphQL Data:', data);
    }
  }, [data, isLoading, error]);

  const handleCreateTodo = async () => {
    if (!newTodoTitle.trim()) {
      Alert.alert('Error', 'Please enter a todo title');
      return;
    }
    
    try {
      await createTodo({
        title: newTodoTitle,
        description: newTodoDescription || null,
        completed: false,
      }).unwrap();
      
      setNewTodoTitle('');
      setNewTodoDescription('');
      Alert.alert('Success', 'Todo created successfully!');
    } catch (err) {
      console.error('Create todo error:', err);
      Alert.alert('Error', 'Failed to create todo');
    }
  };

  const handleToggleTodo = async (todoId: string, currentCompleted: boolean) => {
    try {
      await updateTodo({
        id: todoId,
        completed: !currentCompleted,
      }).unwrap();
    } catch (err) {
      console.error('Update todo error:', err);
      Alert.alert('Error', 'Failed to update todo');
    }
  };

  const handleDeleteTodo = async (todoId: string, todoTitle: string) => {
    Alert.alert(
      'Delete Todo',
      `Are you sure you want to delete "${todoTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTodo({ id: todoId }).unwrap();
              Alert.alert('Success', 'Todo deleted successfully!');
            } catch (err) {
              console.error('Delete todo error:', err);
              Alert.alert('Error', 'Failed to delete todo');
            }
          }
        }
      ]
    );
  };

  const handleTestConnection = () => {
    console.log('🧪 Testing real-time connection manually...');
    realtimeClient.testConnection();
    Alert.alert('Connection Test', 'Check the console for detailed connection info');
  };

  const todos = data?.todosCollection?.edges?.map((edge: any) => edge.node) || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: nucleus.light.global.blue["20"] }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>🚀 Real-time GraphQL Demo</Text>
          <Text style={styles.subtitle}>Live updates with Supabase + RTK Query</Text>
        </View>

        {/* Debug Info */}
        <Card style={[styles.card, styles.debugCard]}>
          <Card.Content>
            <Text style={styles.debugTitle}>🐛 Debug Log</Text>
            {debugInfo.map((info, index) => (
              <Text key={index} style={styles.debugText}>{info}</Text>
            ))}
            {debugInfo.length === 0 && (
              <Text style={styles.debugText}>No debug info yet...</Text>
            )}
          </Card.Content>
        </Card>

        {/* Real-time Status Indicator */}
        <Card style={[styles.card, styles.statusCard]}>
          <Card.Content>
            <View style={styles.statusHeader}>
              <Text style={styles.statusTitle}>📡 Real-time Status</Text>
              <View style={[
                styles.statusIndicator,
                isLoading ? styles.loadingIndicator : error ? styles.errorIndicator : styles.connectedIndicator
              ]}>
                <Text style={styles.statusText}>
                  {isLoading ? 'Loading' : error ? 'Error' : 'Connected'}
                </Text>
              </View>
            </View>
            <Text style={styles.statusDescription}>
              {isLoading 
                ? 'Setting up real-time connection...' 
                : error 
                ? 'Connection failed. Check console for details.' 
                : 'Your todos will update automatically when changes occur in the database.'
              }
            </Text>
            <Button 
              onPress={handleTestConnection} 
              style={styles.testButton} 
              labelStyle={styles.testButtonLabel}
            >
              🧪 Test Real-time Connection
            </Button>
          </Card.Content>
        </Card>

        {/* Create Todo Form */}
        <Card style={[styles.card, styles.formCard]}>
          <Card.Content>
            <Text style={styles.formTitle}>✨ Create New Todo</Text>
            <TextInput
              label="Todo Title"
              value={newTodoTitle}
              onChangeText={setNewTodoTitle}
              style={styles.input}
              mode="outlined"
              placeholder="Enter todo title..."
            />
            <TextInput
              label="Description (Optional)"
              value={newTodoDescription}
              onChangeText={setNewTodoDescription}
              style={styles.input}
              mode="outlined"
              placeholder="Enter description..."
              multiline
              numberOfLines={3}
            />
            <Button 
              mode="contained" 
              onPress={handleCreateTodo}
              style={styles.createButton}
              labelStyle={styles.createButtonLabel}
              loading={isCreating}
              disabled={isCreating || !newTodoTitle.trim()}
              compact={false}
            >
              {isCreating ? 'Creating...' : 'Create Todo'}
            </Button>
          </Card.Content>
        </Card>

        {/* Todos List */}
        <Text style={styles.sectionTitle}>Your Real-time Todos ({todos.length})</Text>
        {isLoading ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.loadingText}>Loading todos...</Text>
            </Card.Content>
          </Card>
        ) : error ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.errorText}>Error loading todos: {error.toString()}</Text>
              <Button onPress={() => refetch()} style={styles.retryButton}>
                Retry
              </Button>
            </Card.Content>
          </Card>
        ) : todos.length === 0 ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.emptyText}>
                No todos found. Create your first todo above!
              </Text>
            </Card.Content>
          </Card>
        ) : (
          todos.map((todo: any) => (
            <Card key={todo.id} style={[styles.card, styles.todoCard]}>
              <Card.Content>
                <View style={styles.todoHeader}>
                  <Text style={[
                    styles.todoTitle,
                    todo.completed && styles.completedTodo
                  ]}>
                    {todo.completed ? '✅' : '⭕'} {todo.title}
                  </Text>
                  <View style={styles.todoActions}>
                    <Button 
                      onPress={() => handleToggleTodo(todo.id, todo.completed)}
                      style={styles.actionButton}
                    >
                      {todo.completed ? 'Undo' : 'Done'}
                    </Button>
                    <Button 
                      onPress={() => handleDeleteTodo(todo.id, todo.title)}
                      style={[styles.actionButton, styles.deleteButton]}
                      textColor="#e74c3c"
                    >
                      Delete
                    </Button>
                  </View>
                </View>
                {todo.description && (
                  <Text style={styles.todoDescription}>{todo.description}</Text>
                )}
                <Text style={styles.todoDate}>
                  Created: {new Date(todo.created_at).toLocaleDateString()}
                  {todo.updated_at !== todo.created_at && (
                    <Text style={styles.updatedText}>
                      {' • Updated: ' + new Date(todo.updated_at).toLocaleDateString()}
                    </Text>
                  )}
                </Text>
                <Text style={styles.todoId}>ID: {todo.id}</Text>
              </Card.Content>
            </Card>
          ))
        )}

        {/* Manual Refresh Button */}
        <Button 
          mode="outlined" 
          onPress={() => refetch()} 
          style={styles.refreshButton}
          labelStyle={styles.refreshButtonLabel}
          compact={false}
        >
          Manual Refresh
        </Button>

        {/* Setup Instructions */}
        <Card style={[styles.card, styles.instructionsCard]}>
          <Card.Content>
            <Text style={styles.instructionsTitle}>🛠️ Troubleshooting Real-time</Text>
            <Text style={styles.instructionsText}>
              If real-time updates aren't working:{'\n'}
              1. Check if Realtime is enabled in Supabase Dashboard → Database → Replication{'\n'}
              2. Ensure your todos table is added to the publication{'\n'}
              3. Check RLS policies allow real-time access{'\n'}
              4. Use the "Test Connection" button above{'\n'}
              5. Try manually adding/deleting a row in Supabase dashboard
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 28,
    lineHeight: 36,
    color: '#2c5282',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#4a5568',
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  debugCard: {
    backgroundColor: '#f7fafc',
  },
  debugTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: '#2d3748',
    marginBottom: 8,
  },
  debugText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#4a5568',
    lineHeight: 16,
  },
  statusCard: {
    backgroundColor: '#e6fffa',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: '#2d3748',
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  connectedIndicator: {
    backgroundColor: '#38a169',
  },
  loadingIndicator: {
    backgroundColor: '#ed8936',
  },
  errorIndicator: {
    backgroundColor: '#e53e3e',
  },
  statusText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: '#ffffff',
  },
  statusDescription: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
    marginBottom: 12,
  },
  testButton: {
    marginTop: 8,
  },
  testButtonLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
  },
  formCard: {
    backgroundColor: '#fff5f5',
  },
  formTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 18,
    color: '#2d3748',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  createButton: {
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: '#3182ce',
  },
  createButtonLabel: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 20,
    color: '#2d3748',
    marginBottom: 16,
    marginTop: 8,
  },
  loadingText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: '#e53e3e',
    marginBottom: 12,
  },
  retryButton: {
    borderRadius: 8,
  },
  emptyText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  todoCard: {
    backgroundColor: '#f0fff4',
  },
  todoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  todoTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: '#2d3748',
    flex: 1,
    marginRight: 12,
  },
  completedTodo: {
    textDecorationLine: 'line-through',
    color: '#718096',
  },
  todoActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    borderRadius: 6,
    minHeight: 32,
  },
  deleteButton: {
    backgroundColor: '#fed7d7',
  },
  todoDescription: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
    marginBottom: 8,
  },
  todoDate: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
  },
  updatedText: {
    color: '#e53e3e',
  },
  todoId: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 10,
    color: '#a0aec0',
  },
  refreshButton: {
    marginVertical: 16,
    borderRadius: 8,
    borderColor: '#3182ce',
  },
  refreshButtonLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    color: '#3182ce',
  },
  instructionsCard: {
    backgroundColor: '#fffaf0',
  },
  instructionsTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: '#2d3748',
    marginBottom: 12,
  },
  instructionsText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
  },
}); 