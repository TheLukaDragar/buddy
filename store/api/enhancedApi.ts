import { api as generatedApi } from '../../graphql/generated'
import { realtimeClient } from '../../lib/realtimeClient'
import { showWorkoutPlanCompletedNotification, showWorkoutPlanFailedNotification } from '../../services/workoutPlanService'
import type { RootState } from '../index'

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
    },

    // Enhance GetWorkoutDay query with cache tags
    GetWorkoutDay: {
      providesTags: (result, error, arg) => {
        const tags = [
          { type: 'WorkoutDay' as const, id: `${arg.planId}-${arg.weekNumber}-${arg.day}` },
          { type: 'WorkoutDay' as const } // Add generic tag as well
        ];
        console.log('GetWorkoutDay providesTags:', tags);
        return tags;
      },
    },

    // Add cache tags for individual workout entries
    GetWorkoutEntry: {
      providesTags: (result, error, arg) => {
        const tags = [
          { type: 'WorkoutEntry' as const, id: arg.id }
        ];
        console.log('GetWorkoutEntry providesTags:', tags);
        return tags;
      },
    },

    // Add cache tags for GetWorkoutEntryBasic (no nested exercises)
    GetWorkoutEntryBasic: {
      providesTags: (result, error, arg) => {
        const tags = [
          { type: 'WorkoutEntry' as const, id: arg.id }
        ];
        return tags;
      },
    },

    // Enhance GetExerciseById query with cache tags
    GetExerciseById: {
      providesTags: (result, error, arg) => {
        const tags: any[] = [
          { type: 'Exercise' as const, id: arg.id }
        ];
        return tags;
      },
    },

    // Enhance GetAllExercises query with cache tags
    GetAllExercises: {
      providesTags: (result) => {
        const tags: any[] = [
          { type: 'Exercise' as const, id: 'LIST' }
        ];
        if (result?.exercisesCollection?.edges) {
          result.exercisesCollection.edges.forEach((edge: any) => {
            tags.push({ type: 'Exercise' as const, id: edge.node.id });
          });
        }
        return tags;
      },
    },

    // Enhance UpdateWorkoutEntry mutation with optimistic updates and proper cache invalidation
    UpdateWorkoutEntry: {
      invalidatesTags: (result, error, arg) => {
        const tags = [
          { type: 'WorkoutDay' as const, id: 'LIST' },
          { type: 'WorkoutEntry' as const, id: arg.id },
          { type: 'WorkoutDay' as const } // Invalidate all WorkoutDay entries
        ];
        console.log('UpdateWorkoutEntry invalidatesTags:', tags);
        return tags;
      },
      async onQueryStarted({ id, sets, reps, weight, time, notes, isAdjusted, adjustmentReason }, { dispatch, queryFulfilled, getState }) {
        console.log('UpdateWorkoutEntry onQueryStarted:', { id, sets, reps, weight, time, notes, isAdjusted, adjustmentReason });
        
        const state = getState() as RootState;
        const workoutState = state.workout;
        
        // Get planId, weekNumber, day from Redux state if workout is active
        let planId: string | undefined;
        let weekNumber: number | undefined;
        let day: any; // Weekday enum type
        
        if (workoutState.workoutEntries && workoutState.workoutEntries.length > 0) {
          const entry = workoutState.workoutEntries.find(e => e.id === id);
          if (entry) {
            // Get planId from state (stored when workout is selected)
            planId = workoutState.planId || undefined;
            weekNumber = entry.week_number;
            day = entry.day; // day is Weekday enum
          }
        }
        
        // Create patches for optimistic updates
        const patches: any[] = [];
        
        // Patch GetWorkoutEntry cache
        if (enhancedApi.endpoints.GetWorkoutEntry) {
          const patchResult = dispatch(
            enhancedApi.util.updateQueryData('GetWorkoutEntry', { id }, (draft) => {
              if (draft?.workout_entriesCollection?.edges?.[0]?.node) {
                const entry = draft.workout_entriesCollection.edges[0].node;
                if (sets !== undefined) entry.sets = sets as number;
                if (reps !== undefined) entry.reps = reps as string;
                if (weight !== undefined) entry.weight = weight as string;
                if (time !== undefined) entry.time = time as string;
                if (notes !== undefined) entry.notes = notes as string;
                if (isAdjusted !== undefined) entry.is_adjusted = isAdjusted as boolean;
                if (adjustmentReason !== undefined) entry.adjustment_reason = adjustmentReason as string;
                console.log('Optimistic update applied to GetWorkoutEntry cache');
              }
            })
          );
          patches.push(patchResult);
        }
        
        // Patch GetWorkoutDay cache if we have the required params
        if (planId && weekNumber !== undefined && day && enhancedApi.endpoints.GetWorkoutDay) {
          const patchResult = dispatch(
            enhancedApi.util.updateQueryData('GetWorkoutDay', { planId, weekNumber, day }, (draft) => {
              const entries = draft?.workout_plansCollection?.edges?.[0]?.node?.workout_entriesCollection?.edges;
              if (entries) {
                const entryEdge = entries.find((e: any) => e.node.id === id);
                if (entryEdge?.node) {
                  const entry = entryEdge.node;
                  if (sets !== undefined) entry.sets = sets as number;
                  if (reps !== undefined) entry.reps = reps as string;
                  if (weight !== undefined) entry.weight = weight as string;
                  if (time !== undefined) entry.time = time as string;
                  if (notes !== undefined) entry.notes = notes as string;
                  if (isAdjusted !== undefined) entry.is_adjusted = isAdjusted as boolean;
                  if (adjustmentReason !== undefined) entry.adjustment_reason = adjustmentReason as string;
                  console.log('Optimistic update applied to GetWorkoutDay cache');
                }
              }
            })
          );
          patches.push(patchResult);
        }

        try {
          // Wait for the mutation to complete
          await queryFulfilled;
          console.log('✅ Workout entry updated successfully');
        } catch (err) {
          // If the mutation fails, undo all optimistic updates
          patches.forEach(patch => patch.undo());
          console.error('❌ Failed to update workout entry, reverted changes:', err);
        }
      }
    },

    // Enhance DeleteWorkoutEntry mutation with cache invalidation
    DeleteWorkoutEntry: {
      invalidatesTags: (result, error, arg) => {
        const tags: any[] = [
          { type: 'WorkoutDay' as const, id: 'LIST' },
          { type: 'WorkoutDay' as const }, // Invalidate all WorkoutDay entries
          { type: 'WorkoutEntry' as const, id: arg.id },
          { type: 'WorkoutEntry' as const } // Invalidate all WorkoutEntry entries
        ];
        
        console.log('DeleteWorkoutEntry invalidatesTags:', tags);
        return tags;
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        console.log('DeleteWorkoutEntry onQueryStarted:', arg);
        
        try {
          await queryFulfilled;
          console.log('✅ Workout entry deleted successfully');
        } catch (err) {
          console.error('❌ Failed to delete workout entry:', err);
        }
      }
    },

    // Enhance AddWorkoutEntry mutation with cache invalidation
    AddWorkoutEntry: {
      invalidatesTags: (result, error, arg) => {
        const tags: any[] = [
          { type: 'WorkoutDay' as const, id: 'LIST' },
          { type: 'WorkoutDay' as const }, // Invalidate all WorkoutDay entries
          { type: 'WorkoutEntry' as const } // Invalidate all WorkoutEntry entries
        ];
        
        // Invalidate the specific WorkoutDay cache tag
        if (arg.workoutPlanId && arg.weekNumber !== undefined && arg.day) {
          tags.push({ type: 'WorkoutDay' as const, id: `${arg.workoutPlanId}-${arg.weekNumber}-${arg.day}` });
          console.log('Invalidating specific WorkoutDay cache tag:', `${arg.workoutPlanId}-${arg.weekNumber}-${arg.day}`);
        }
        
        console.log('AddWorkoutEntry invalidatesTags:', tags);
        return tags;
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        console.log('AddWorkoutEntry onQueryStarted:', arg);
        
        try {
          // Wait for the mutation to complete
          await queryFulfilled;
          console.log('✅ Workout entry added successfully');
          
          // Force refetch GetWorkoutDay to ensure fresh data
          if (arg.workoutPlanId && arg.weekNumber !== undefined && arg.day) {
            dispatch(
              enhancedApi.endpoints.GetWorkoutDay.initiate(
                {
                  planId: arg.workoutPlanId,
                  weekNumber: arg.weekNumber,
                  day: arg.day as any,
                },
                { forceRefetch: true }
              )
            );
          }
        } catch (err) {
          console.error('❌ Failed to add workout entry:', err);
        }
      }
    },

    // Enhance GetWorkoutPresets query with cache tags
    GetWorkoutPresets: {
      providesTags: (result) =>
        result?.workout_presetsCollection?.edges
          ? [
              ...result.workout_presetsCollection.edges.map((edge: any) => ({
                type: 'WorkoutPreset' as const,
                id: edge.node.id
              })),
              { type: 'WorkoutPreset' as const, id: 'LIST' },
            ]
          : [{ type: 'WorkoutPreset' as const, id: 'LIST' }],
    },

    // Enhance GetWorkoutPresetsWithCounts query with cache tags
    GetWorkoutPresetsWithCounts: {
      providesTags: (result) =>
        result?.workout_presetsCollection?.edges
          ? [
              ...result.workout_presetsCollection.edges.map((edge: any) => ({
                type: 'WorkoutPreset' as const,
                id: edge.node.id
              })),
              { type: 'WorkoutPreset' as const, id: 'LIST' },
            ]
          : [{ type: 'WorkoutPreset' as const, id: 'LIST' }],
    },

    // Enhance GetWorkoutPreset query with cache tags
    GetWorkoutPreset: {
      providesTags: (result, error, arg) => [
        { type: 'WorkoutPreset' as const, id: arg.id }
      ],
    },

    // Enhance SwapExerciseWithAlternative mutation with optimistic updates
    SwapExerciseWithAlternative: {
      invalidatesTags: (result, error, arg) => {
        const tags: any[] = [
          { type: 'WorkoutDay' as const, id: 'LIST' },
          { type: 'WorkoutEntry' as const, id: arg.workoutEntryId },
          { type: 'WorkoutDay' as const }, // Invalidate all WorkoutDay entries
          { type: 'WorkoutEntry' as const } // Invalidate all WorkoutEntry entries
        ];
        
        // If we have the planId, weekNumber, and day, invalidate the specific WorkoutDay cache tag
        if (arg.planId && arg.weekNumber !== undefined && arg.day) {
          tags.push({ type: 'WorkoutDay' as const, id: `${arg.planId}-${arg.weekNumber}-${arg.day}` });
          console.log('Invalidating specific WorkoutDay cache tag:', `${arg.planId}-${arg.weekNumber}-${arg.day}`);
        } else {
          console.log('Missing plan information, not invalidating specific WorkoutDay cache tag');
        }
        
        console.log('SwapExerciseWithAlternative invalidatesTags:', tags);
        return tags;
      },
      async onQueryStarted({ workoutEntryId, newExerciseId, alternativeNote, planId, weekNumber, day }, { dispatch, queryFulfilled, getState }) {
        console.log('SwapExerciseWithAlternative onQueryStarted:', { workoutEntryId, newExerciseId, planId, weekNumber, day });
        
        // Create patch for optimistic update on individual workout entry
        const patchResult = dispatch(
          enhancedApi.util.updateQueryData('GetWorkoutEntry', { id: workoutEntryId }, (draft) => {
            if (draft?.workout_entriesCollection?.edges?.[0]?.node) {
              const entry = draft.workout_entriesCollection.edges[0].node;
              // Update the exercise_id optimistically
              entry.exercise_id = newExerciseId;
              entry.is_adjusted = true;
              entry.adjustment_reason = "Swapped to alternative exercise";
              
              console.log('Optimistic update applied to GetWorkoutEntry cache');
            }
          })
        );

        // Also update the GetWorkoutDay cache if we have plan information
        let patchResultDay: any = null;
        if (planId && weekNumber !== undefined && day) {
          patchResultDay = dispatch(
            enhancedApi.util.updateQueryData('GetWorkoutDay', { 
              planId, 
              weekNumber: weekNumber as number, 
              day: day as any 
            }, (draft) => {
              if (draft?.workout_plansCollection?.edges?.[0]?.node?.workout_entriesCollection?.edges) {
                const entries = draft.workout_plansCollection.edges[0].node.workout_entriesCollection.edges;
                const entryIndex = entries.findIndex((edge: any) => edge.node.id === workoutEntryId);
                
                if (entryIndex !== -1) {
                  // Update the exercise_id optimistically
                  entries[entryIndex].node.exercise_id = newExerciseId;
                  entries[entryIndex].node.is_adjusted = true;
                  entries[entryIndex].node.adjustment_reason = "Swapped to alternative exercise";
                  
                  console.log('Optimistic update applied to GetWorkoutDay cache');
                }
              }
            })
          );
        }

        try {
          // Wait for the mutation to complete
          const { data } = await queryFulfilled;
          console.log('✅ Exercise swapped successfully', data);
          
          // If we have the full exercise data from the mutation result, update the caches with it
          if (data?.updateworkout_entriesCollection?.records?.[0]) {
            const updatedRecord = data.updateworkout_entriesCollection.records[0];
            
            // Update the GetWorkoutEntry cache with the full data
            dispatch(
              enhancedApi.util.updateQueryData('GetWorkoutEntry', { id: workoutEntryId }, (draft) => {
                if (draft?.workout_entriesCollection?.edges?.[0]?.node) {
                  const entry = draft.workout_entriesCollection.edges[0].node;
                  // Update all fields with the new data
                  entry.exercise_id = updatedRecord.exercise_id;
                  entry.is_adjusted = updatedRecord.is_adjusted;
                  entry.adjustment_reason = updatedRecord.adjustment_reason;
                  // Update the nested exercises object if available
                  if (updatedRecord.exercises) {
                    entry.exercises = updatedRecord.exercises;
                  }
                  console.log('Updated GetWorkoutEntry cache with full data');
                }
              })
            );
            
            // Also update the GetWorkoutDay cache with the full data if we have plan information
            if (planId && weekNumber !== undefined && day && updatedRecord.exercises) {
              dispatch(
                enhancedApi.util.updateQueryData('GetWorkoutDay', { 
                  planId, 
                  weekNumber: weekNumber as number, 
                  day: day as any 
                }, (draft) => {
                  if (draft?.workout_plansCollection?.edges?.[0]?.node?.workout_entriesCollection?.edges) {
                    const entries = draft.workout_plansCollection.edges[0].node.workout_entriesCollection.edges;
                    const entryIndex = entries.findIndex((edge: any) => edge.node.id === workoutEntryId);
                    
                    if (entryIndex !== -1) {
                      // Update all fields with the new data
                      const entry = entries[entryIndex].node;
                      entry.exercise_id = updatedRecord.exercise_id;
                      entry.is_adjusted = updatedRecord.is_adjusted;
                      entry.adjustment_reason = updatedRecord.adjustment_reason;
                      // Update the nested exercises object
                      entry.exercises = updatedRecord.exercises;
                      
                      console.log('Updated GetWorkoutDay cache with full data');
                    }
                  }
                })
              );
            }
          }
        } catch (err) {
          // If the mutation fails, undo the optimistic updates
          patchResult.undo();
          if (patchResultDay) {
            patchResultDay.undo();
          }
          console.error('❌ Failed to swap exercise, reverted changes:', err);
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
  useGetWorkoutEntryQuery,
  useLazyGetWorkoutEntryQuery,
  useGetWorkoutEntryBasicQuery,
  useLazyGetWorkoutEntryBasicQuery,
  useGetWorkoutDayQuery,
  useLazyGetWorkoutDayQuery,
  useGetExerciseByIdQuery,
  useLazyGetExerciseByIdQuery,
  useGetAllExercisesQuery,
  useLazyGetAllExercisesQuery,
  useUpdateWorkoutEntryMutation,
  useSwapExerciseWithAlternativeMutation,
  useAddWorkoutEntryMutation,
  useDeleteWorkoutEntryMutation,
  // Preset hooks (will be available after codegen)
  useGetWorkoutPresetsQuery,
  useLazyGetWorkoutPresetsQuery,
  useGetWorkoutPresetsWithCountsQuery,
  useLazyGetWorkoutPresetsWithCountsQuery,
  useGetWorkoutPresetQuery,
  useLazyGetWorkoutPresetQuery,
  // Session hooks for completion tracking
  useGetWorkoutSessionByDateQuery,
  useLazyGetWorkoutSessionByDateQuery,
  useGetWorkoutEntriesPresetIdQuery,
  useLazyGetWorkoutEntriesPresetIdQuery,
  // Statistics hooks
  useGetUserWorkoutStatisticsQuery,
  useLazyGetUserWorkoutStatisticsQuery,
} = enhancedApi

// Export the enhanced API as default
export default enhancedApi 