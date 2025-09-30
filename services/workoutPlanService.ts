import { supabase } from '../lib/supabase'

export interface WorkoutPlanGenerationRequest {
  userProfile: string // The user's fitness profile/preferences
}

export interface WorkoutPlanGenerationResponse {
  request_id: string
  status: 'processing'
  message: string
}

/**
 * Calls the background workout plan generation function
 * Returns immediately with a request_id for tracking
 */
export async function generateWorkoutPlan(
  request: WorkoutPlanGenerationRequest
): Promise<WorkoutPlanGenerationResponse> {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('User must be authenticated to generate workout plan')
  }

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    throw new Error('Supabase URL not configured')
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/trigger-workout-plan`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request)
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
  }

  return await response.json()
}

/**
 * Log workout plan completion (no UI alerts)
 */
export function showWorkoutPlanCompletedNotification() {
  console.log('✅ Workout plan generation completed!')
}

/**
 * Log workout plan generation failure (no UI alerts)
 */
export function showWorkoutPlanFailedNotification(errorMessage?: string) {
  console.error('❌ Workout plan generation failed:', errorMessage)
}

/**
 * Deactivates all active workout plans for the current user
 * This sets the status to 'paused' to hide them from the UI
 * Note: This function now needs to be called from a component with dispatch access
 */
export async function deactivateCurrentWorkoutPlans(dispatch: any): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user?.id) {
    throw new Error('User must be authenticated to deactivate workout plans')
  }

  try {
    // Use Supabase client directly instead of GraphQL to avoid record limit
    const { data, error } = await supabase
      .from('workout_plans')
      .update({ status: 'paused' })
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .select()

    if (error) {
      throw error
    }

    console.log(`✅ Deactivated ${data?.length || 0} workout plan(s)`)

    // Import enhancedApi dynamically to invalidate cache
    const { enhancedApi } = await import('../store/api/enhancedApi')

    // Invalidate cached workout plan queries to refresh UI
    dispatch(enhancedApi.util.invalidateTags(['WorkoutPlan']))

    // Return void as expected
  } catch (error) {
    console.error('❌ Failed to deactivate workout plans:', error)
    throw new Error('Failed to deactivate current workout plans')
  }
}

/**
 * Regenerates workout plan by deactivating current plans and starting new generation
 */
export async function regenerateWorkoutPlan(userProfile: string, dispatch: any): Promise<void> {
  try {
    // Step 1: Deactivate current workout plans
    await deactivateCurrentWorkoutPlans(dispatch)

    // Step 2: Start new workout plan generation
    const response = await generateWorkoutPlan({ userProfile })

    console.log(`🚀 Started workout plan regeneration with request ID: ${response.request_id}`)

    // Return void as expected
  } catch (error) {
    console.error('❌ Failed to regenerate workout plan:', error)
    throw error
  }
}
