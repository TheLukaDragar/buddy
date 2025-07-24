import { realtimeClient } from '../../lib/realtimeClient'
import { api as generatedApi } from '../../graphql/generated'

// Enhanced API with real-time capabilities
export const enhancedApi = generatedApi.enhanceEndpoints({
  endpoints: {
    // Enhance the GetTodos query with real-time subscriptions
    GetTodos: {
      providesTags: (result) => [
        'Todo',
        ...(result?.todosCollection?.edges?.map(({ node }: any) => ({ 
          type: 'Todo' as const, 
          id: node.id 
        })) || [])
      ],
      // Add real-time streaming updates using onCacheEntryAdded
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        try {
          // Wait for the initial query to resolve before setting up the subscription
          await cacheDataLoaded

          console.log('🚀 Setting up real-time subscription for todos')

          // Set up real-time subscription for todos
          const { unsubscribe } = realtimeClient.subscribe({
            endpoint: 'todos',
            onUpdate: (payload) => {
              console.log('📡 Real-time update received:', payload)
              
              updateCachedData((draft) => {
                if (!draft?.todosCollection?.edges) {
                  console.warn('No todos collection in cache')
                  return
                }

                // Supabase Realtime payload structure: { eventType, new, old, ... }
                const { eventType, new: newRecord, old: oldRecord } = payload
                
                switch (eventType) {
                  case 'INSERT':
                    // Add new todo to the cache (check for duplicates first)
                    if (newRecord) {
                      const existingIndex = draft.todosCollection.edges.findIndex(
                        (edge: any) => edge.node.id === newRecord.id
                      )
                      
                      if (existingIndex === -1) {
                        // Only add if it doesn't already exist
                        const newTodo = {
                          node: newRecord
                        }
                        draft.todosCollection.edges.unshift(newTodo)
                        console.log('✅ Added new todo to cache:', newRecord.title)
                      } else {
                        console.log('⚠️ Todo already exists in cache, skipping:', newRecord.title)
                      }
                    }
                    break
                    
                  case 'UPDATE':
                    // Update existing todo in the cache
                    if (newRecord) {
                      const todoIndex = draft.todosCollection.edges.findIndex(
                        (edge: any) => edge.node.id === newRecord.id
                      )
                      if (todoIndex !== -1) {
                        draft.todosCollection.edges[todoIndex].node = newRecord
                        console.log('📝 Updated todo in cache:', newRecord.title)
                      }
                    }
                    break
                    
                  case 'DELETE':
                    // Remove todo from the cache
                    if (oldRecord) {
                      const todoIndex = draft.todosCollection.edges.findIndex(
                        (edge: any) => edge.node.id === oldRecord.id
                      )
                      if (todoIndex !== -1) {
                        draft.todosCollection.edges.splice(todoIndex, 1)
                        console.log('🗑️ Removed todo from cache:', oldRecord.title)
                      }
                    }
                    break
                    
                  default:
                    console.log('Unknown event type:', eventType)
                }
              })
            },
            onError: (error) => {
              console.error('❌ Real-time subscription error:', error)
            }
          })

          // Wait until subscription is no longer active
          await cacheEntryRemoved
          
          // Clean up the subscription
          unsubscribe()
          console.log('🔌 Real-time subscription cleaned up')
          
        } catch (error) {
          console.error('❌ Error in onCacheEntryAdded:', error)
        }
      },
    },
    
    // Enhance mutations to invalidate cache tags for automatic refetching
    CreateTodo: {
      invalidatesTags: [], // Don't invalidate since real-time handles it
    },
    
    UpdateTodo: {
      invalidatesTags: [], // Don't invalidate since real-time handles it
    },
    
    DeleteTodo: {
      invalidatesTags: [], // Don't invalidate since real-time handles it
    },
  },
})

// Export the enhanced hooks
export const {
  useGetTodosQuery,
  useLazyGetTodosQuery,
  useGetTodoByIdQuery,
  useLazyGetTodoByIdQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
} = enhancedApi

// Export the enhanced API as default
export default enhancedApi 