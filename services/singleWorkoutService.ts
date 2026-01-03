import { supabase } from '../lib/supabase'

export interface SingleWorkoutGenerationRequest {
  muscleGroups: string[]
  duration: number
  equipment: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  clientDate?: string // ISO string of client's current date/time to handle timezones
}

export interface SingleWorkoutGenerationResponse {
  request_id: string
  status: 'processing'
  message: string
}

/**
 * Calls the background single workout generation function
 * Returns immediately with a request_id for tracking
 */
export async function generateSingleWorkout(
  request: SingleWorkoutGenerationRequest
): Promise<SingleWorkoutGenerationResponse> {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('User must be authenticated to generate workout')
  }

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    throw new Error('Supabase URL not configured')
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/trigger-single-workout`, {
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
 * Log single workout completion (no UI alerts)
 */
export function showSingleWorkoutCompletedNotification() {
  console.log('✅ Single workout generation completed!')
}

/**
 * Log single workout generation failure (no UI alerts)
 */
export function showSingleWorkoutFailedNotification(errorMessage?: string) {
  console.error('❌ Single workout generation failed:', errorMessage)
}
