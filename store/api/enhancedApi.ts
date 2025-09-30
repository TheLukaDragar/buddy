import { api as generatedApi } from '../../graphql/generated'
import { realtimeClient } from '../../lib/realtimeClient'
import { showWorkoutPlanCompletedNotification, showWorkoutPlanFailedNotification } from '../../services/workoutPlanService'

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

    // Add real-time monitoring for workout plan requests
    GetWorkoutPlanRequests: {
      providesTags: (result) => 
        result?.workout_plan_requestsCollection?.edges
          ? [
              ...result.workout_plan_requestsCollection.edges.map((edge: any) => ({ 
                type: 'WorkoutPlanRequest' as const, 
                id: edge.node.id 
              })),
              { type: 'WorkoutPlanRequest' as const, id: 'LIST' },
            ]
          : [{ type: 'WorkoutPlanRequest' as const, id: 'LIST' }],
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        try {
          await cacheDataLoaded

          console.log('🚀 Setting up real-time subscription for workout plan requests')

          const { unsubscribe } = realtimeClient.subscribe({
            endpoint: 'workout_plan_requests',
            onUpdate: (payload) => {
              console.log('📡 Workout plan request update:', payload)

              updateCachedData((draft) => {
                if (!draft?.workout_plan_requestsCollection?.edges) {
                  console.warn('No workout plan requests collection in cache')
                  return
                }

                const { eventType, new: newRecord, old: oldRecord } = payload

                switch (eventType) {
                  case 'INSERT':
                    if (newRecord) {
                      const existingIndex = draft.workout_plan_requestsCollection.edges.findIndex(
                        (edge: any) => edge.node.id === newRecord.id
                      )
                      
                      if (existingIndex === -1) {
                        const newRequest = { node: newRecord }
                        draft.workout_plan_requestsCollection.edges.unshift(newRequest)
                        console.log('✅ Added new workout plan request to cache:', newRecord.request_id)
                      }
                    }
                    break

                  case 'UPDATE':
                    if (newRecord) {
                      const requestIndex = draft.workout_plan_requestsCollection.edges.findIndex(
                        (edge: any) => edge.node.id === newRecord.id
                      )
                      if (requestIndex !== -1) {
                        draft.workout_plan_requestsCollection.edges[requestIndex].node = newRecord
                        console.log('📝 Updated workout plan request in cache:', newRecord.request_id, newRecord.status)

                        // Show notification when completed
                        if (newRecord.status === 'completed') {
                          showWorkoutPlanCompletedNotification()
                        } else if (newRecord.status === 'failed') {
                          showWorkoutPlanFailedNotification(newRecord.error_message)
                        }
                      }
                    }
                    break

                  case 'DELETE':
                    if (oldRecord) {
                      const requestIndex = draft.workout_plan_requestsCollection.edges.findIndex(
                        (edge: any) => edge.node.id === oldRecord.id
                      )
                      if (requestIndex !== -1) {
                        draft.workout_plan_requestsCollection.edges.splice(requestIndex, 1)
                        console.log('🗑️ Removed workout plan request from cache:', oldRecord.request_id)
                      }
                    }
                    break

                  default:
                    console.log('Unknown event type:', eventType)
                }
              })
            },
            onError: (error) => {
              console.error('❌ Workout plan request subscription error:', error)
            }
          })

          await cacheEntryRemoved
          unsubscribe()
          console.log('🔌 Workout plan request subscription cleaned up')

        } catch (error) {
          console.error('❌ Error in workout plan request subscription:', error)
        }
      }
    },

    // Enhance GetWorkoutPlan query
    GetWorkoutPlan: {
      providesTags: (result, error, arg) => 
        result?.workout_plansCollection?.edges?.[0]
          ? [{ type: 'WorkoutPlan' as const, id: arg.id }]
          : [{ type: 'WorkoutPlan' as const, id: arg.id }],
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        try {
          await cacheDataLoaded

          console.log('🚀 Setting up real-time subscription for workout plan:', arg.id)

          const { unsubscribe } = realtimeClient.subscribe({
            endpoint: 'workout_plans',
            onUpdate: (payload) => {
              console.log('📡 Workout plan update:', payload)

              updateCachedData((draft) => {
                if (!draft?.workout_plansCollection?.edges) {
                  console.warn('No workout plans collection in cache')
                  return
                }

                const { eventType, new: newRecord, old: oldRecord } = payload

                switch (eventType) {
                  case 'UPDATE':
                    if (newRecord && newRecord.id === arg.id) {
                      const planIndex = draft.workout_plansCollection.edges.findIndex(
                        (edge: any) => edge.node.id === newRecord.id
                      )
                      if (planIndex !== -1) {
                        // Update the plan while preserving workout entries
                        draft.workout_plansCollection.edges[planIndex].node = {
                          ...draft.workout_plansCollection.edges[planIndex].node,
                          ...newRecord
                        }
                        console.log('📝 Updated workout plan in cache:', newRecord.id)
                      }
                    }
                    break

                  default:
                    console.log('Unhandled workout plan event type:', eventType)
                }
              })
            },
            onError: (error) => {
              console.error('❌ Workout plan subscription error:', error)
            }
          })

          await cacheEntryRemoved
          unsubscribe()
          console.log('🔌 Workout plan subscription cleaned up')

        } catch (error) {
          console.error('❌ Error in workout plan subscription:', error)
        }
      }
    },

    // Enhance GetUserWorkoutPlans query  
    GetUserWorkoutPlans: {
      providesTags: (result) => 
        result?.workout_plansCollection?.edges
          ? [
              ...result.workout_plansCollection.edges.map((edge: any) => ({ 
                type: 'WorkoutPlan' as const, 
                id: edge.node.id 
              })),
              { type: 'WorkoutPlan' as const, id: 'LIST' },
            ]
          : [{ type: 'WorkoutPlan' as const, id: 'LIST' }],
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        try {
          await cacheDataLoaded

          console.log('🚀 Setting up real-time subscription for user workout plans:', arg.userId)

          const { unsubscribe } = realtimeClient.subscribe({
            endpoint: 'workout_plans',
            onUpdate: (payload) => {
              console.log('📡 User workout plans update:', payload)

              updateCachedData((draft) => {
                if (!draft?.workout_plansCollection?.edges) {
                  console.warn('No user workout plans collection in cache')
                  return
                }

                const { eventType, new: newRecord, old: oldRecord } = payload

                switch (eventType) {
                  case 'INSERT':
                    if (newRecord && newRecord.user_id === arg.userId) {
                      const existingIndex = draft.workout_plansCollection.edges.findIndex(
                        (edge: any) => edge.node.id === newRecord.id
                      )
                      
                      if (existingIndex === -1) {
                        const newPlan = { node: newRecord }
                        draft.workout_plansCollection.edges.unshift(newPlan)
                        console.log('✅ Added new workout plan to cache:', newRecord.id)
                      }
                    }
                    break

                  case 'UPDATE':
                    if (newRecord && newRecord.user_id === arg.userId) {
                      const planIndex = draft.workout_plansCollection.edges.findIndex(
                        (edge: any) => edge.node.id === newRecord.id
                      )
                      if (planIndex !== -1) {
                        // Update the plan while preserving workout entries
                        draft.workout_plansCollection.edges[planIndex].node = {
                          ...draft.workout_plansCollection.edges[planIndex].node,
                          ...newRecord
                        }
                        console.log('📝 Updated user workout plan in cache:', newRecord.id)
                      }
                    }
                    break

                  case 'DELETE':
                    if (oldRecord && oldRecord.user_id === arg.userId) {
                      const planIndex = draft.workout_plansCollection.edges.findIndex(
                        (edge: any) => edge.node.id === oldRecord.id
                      )
                      if (planIndex !== -1) {
                        draft.workout_plansCollection.edges.splice(planIndex, 1)
                        console.log('🗑️ Removed workout plan from cache:', oldRecord.id)
                      }
                    }
                    break

                  default:
                    console.log('Unknown user workout plans event type:', eventType)
                }
              })
            },
            onError: (error) => {
              console.error('❌ User workout plans subscription error:', error)
            }
          })

          await cacheEntryRemoved
          unsubscribe()
          console.log('🔌 User workout plans subscription cleaned up')

        } catch (error) {
          console.error('❌ Error in user workout plans subscription:', error)
        }
      }
    },

    // Enhance GetWorkoutPlanByWeek query (efficient per-week query)
    GetWorkoutPlanByWeek: {
      providesTags: (result, error, arg) => 
        result?.workout_plansCollection?.edges?.[0]
          ? [{ type: 'WorkoutPlan' as const, id: `${arg.planId}-week-${arg.weekNumber}` }]
          : [{ type: 'WorkoutPlan' as const, id: `${arg.planId}-week-${arg.weekNumber}` }],
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        try {
          await cacheDataLoaded

          console.log(`🚀 Setting up real-time subscription for workout plan week ${arg.weekNumber}:`, arg.planId)

          // Subscribe to both workout_plans (for plan-level changes) and workout_entries (for exercise changes)
          const planSubscription = realtimeClient.subscribe({
            endpoint: 'workout_plans',
            onUpdate: (payload) => {
              console.log(`📡 Week ${arg.weekNumber} plan update:`, payload)

              updateCachedData((draft) => {
                if (!draft?.workout_plansCollection?.edges?.[0]) {
                  console.warn(`No workout plan data in cache for week ${arg.weekNumber}`)
                  return
                }

                const { eventType, new: newRecord } = payload

                if (eventType === 'UPDATE' && newRecord && newRecord.id === arg.planId) {
                  // Update plan-level fields (status, summary, etc.) while preserving workout entries
                  const currentPlan = draft.workout_plansCollection.edges[0].node
                  draft.workout_plansCollection.edges[0].node = {
                    ...currentPlan,
                    ...newRecord,
                    // Preserve the workout_entriesCollection from the current cache
                    workout_entriesCollection: currentPlan.workout_entriesCollection
                  }
                  console.log(`📝 Updated plan data for week ${arg.weekNumber}:`, newRecord.id)
                }
              })
            },
            onError: (error) => {
              console.error(`❌ Week ${arg.weekNumber} plan subscription error:`, error)
            }
          })

          const entriesSubscription = realtimeClient.subscribe({
            endpoint: 'workout_entries',
            onUpdate: (payload) => {
              console.log(`📡 Week ${arg.weekNumber} entries update:`, payload)

              updateCachedData((draft) => {
                if (!draft?.workout_plansCollection?.edges?.[0]?.node?.workout_entriesCollection?.edges) {
                  console.warn(`No workout entries in cache for week ${arg.weekNumber}`)
                  return
                }

                const { eventType, new: newRecord, old: oldRecord } = payload

                // Only update if this entry belongs to the current plan and week
                const belongsToThisWeek = (record: any) => 
                  record?.workout_plan_id === arg.planId && record?.week_number === arg.weekNumber

                switch (eventType) {
                  case 'INSERT':
                    if (newRecord && belongsToThisWeek(newRecord)) {
                      const newEntry = { node: newRecord }
                      draft.workout_plansCollection.edges[0].node.workout_entriesCollection.edges.push(newEntry)
                      console.log(`✅ Added new workout entry to week ${arg.weekNumber}:`, newRecord.id)
                    }
                    break

                  case 'UPDATE':
                    if (newRecord && belongsToThisWeek(newRecord)) {
                      const entryIndex = draft.workout_plansCollection.edges[0].node.workout_entriesCollection.edges.findIndex(
                        (edge: any) => edge.node.id === newRecord.id
                      )
                      if (entryIndex !== -1) {
                        draft.workout_plansCollection.edges[0].node.workout_entriesCollection.edges[entryIndex].node = newRecord
                        console.log(`📝 Updated workout entry in week ${arg.weekNumber}:`, newRecord.id)
                      }
                    }
                    break

                  case 'DELETE':
                    if (oldRecord && belongsToThisWeek(oldRecord)) {
                      const entryIndex = draft.workout_plansCollection.edges[0].node.workout_entriesCollection.edges.findIndex(
                        (edge: any) => edge.node.id === oldRecord.id
                      )
                      if (entryIndex !== -1) {
                        draft.workout_plansCollection.edges[0].node.workout_entriesCollection.edges.splice(entryIndex, 1)
                        console.log(`🗑️ Removed workout entry from week ${arg.weekNumber}:`, oldRecord.id)
                      }
                    }
                    break

                  default:
                    console.log(`Unknown workout entries event type for week ${arg.weekNumber}:`, eventType)
                }
              })
            },
            onError: (error) => {
              console.error(`❌ Week ${arg.weekNumber} entries subscription error:`, error)
            }
          })

          await cacheEntryRemoved
          planSubscription.unsubscribe()
          entriesSubscription.unsubscribe()
          console.log(`🔌 Week ${arg.weekNumber} subscriptions cleaned up`)

        } catch (error) {
          console.error(`❌ Error in week ${arg.weekNumber} subscription:`, error)
        }
      }
    },
  },
})

// Export all hooks automatically from the enhanced API
export const {
  useGetTodosQuery,
  useLazyGetTodosQuery,
  useGetTodoByIdQuery,
  useLazyGetTodoByIdQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
  useGetWorkoutPlanRequestsQuery,
  useLazyGetWorkoutPlanRequestsQuery,
  useGetWorkoutPlanQuery,
  useLazyGetWorkoutPlanQuery,
  useGetUserWorkoutPlansQuery,
  useLazyGetUserWorkoutPlansQuery,
  useGetWorkoutPlanByWeekQuery,
  useLazyGetWorkoutPlanByWeekQuery,
  useGetWorkoutDayQuery,
  useLazyGetWorkoutDayQuery,
} = enhancedApi

// Export the enhanced API as default
export default enhancedApi 