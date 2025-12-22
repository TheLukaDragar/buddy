import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { generateSingleWorkout, type SingleWorkoutGenerationRequest } from '../services/singleWorkoutService'

export interface SingleWorkoutRequest {
  id: string
  request_id: string
  user_id: string
  status: 'processing' | 'completed' | 'failed' | 'cancelled'
  muscle_groups: string[]
  duration: number
  equipment: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  error_message?: string
  current_step: number
  total_steps: number
  step_description: string
  created_at: string
  completed_at?: string
}

export function useSingleWorkoutGeneration(userId: string) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null)
  const [currentRequest, setCurrentRequest] = useState<SingleWorkoutRequest | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Poll for the current request status
  useEffect(() => {
    if (!currentRequestId) return

    const pollRequest = async () => {
      try {
        const { data, error } = await supabase
          .from('single_workout_requests')
          .select('*')
          .eq('request_id', currentRequestId)
          .single()

        if (error) {
          console.error('Error fetching single workout request:', error)
          return
        }

        if (data) {
          setCurrentRequest(data as SingleWorkoutRequest)

          // Stop generating if completed or failed
          if (data.status === 'completed' || data.status === 'failed') {
            setIsGenerating(false)
          }
        }
      } catch (err) {
        console.error('Error polling single workout request:', err)
      }
    }

    // Poll every 2 seconds while generating
    if (isGenerating) {
      pollRequest()
      const interval = setInterval(pollRequest, 2000)
      return () => clearInterval(interval)
    } else {
      // Poll once more when stopping
      pollRequest()
    }
  }, [currentRequestId, isGenerating])

  const startGeneration = async (params: SingleWorkoutGenerationRequest) => {
    try {
      setIsGenerating(true)
      setIsLoading(true)

      const response = await generateSingleWorkout(params)
      setCurrentRequestId(response.request_id)

      console.log('🚀 Single workout generation started:', response.request_id)
      setIsLoading(false)
      return response

    } catch (error) {
      console.error('❌ Failed to start single workout generation:', error)
      setIsGenerating(false)
      setIsLoading(false)
      throw error
    }
  }

  const clearGeneration = () => {
    setIsGenerating(false)
    setCurrentRequestId(null)
    setCurrentRequest(null)
    setIsLoading(false)
  }

  return {
    // State
    isGenerating,
    currentRequest,
    isLoading,

    // Actions
    startGeneration,
    clearGeneration,

    // Computed
    isCompleted: currentRequest?.status === 'completed',
    isFailed: currentRequest?.status === 'failed',
    errorMessage: currentRequest?.error_message,
  }
}
