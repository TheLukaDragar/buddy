import { useState } from 'react'
import { generateWorkoutPlan } from '../services/workoutPlanService'
import { useGetWorkoutPlanRequestsQuery } from '../store/api/enhancedApi'

export function useWorkoutPlanGeneration(userId: string) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null)

  // Monitor workout plan requests with real-time updates
  const { data: requestsData, isLoading } = useGetWorkoutPlanRequestsQuery({ userId })

  const requests = requestsData?.workout_plan_requestsCollection?.edges?.map(edge => edge.node) || []
  const latestRequest = requests[0]
  const currentRequest = currentRequestId ? requests.find(r => r.request_id === currentRequestId) : latestRequest

  const startGeneration = async (userProfile: string) => {
    try {
      setIsGenerating(true)

      const response = await generateWorkoutPlan({ userProfile })
      setCurrentRequestId(response.request_id)

      console.log('🚀 Workout plan generation started:', response.request_id)
      return response

    } catch (error) {
      console.error('❌ Failed to start workout plan generation:', error)
      setIsGenerating(false)
      throw error
    }
  }

  // Update isGenerating based on current request status
  if (currentRequest && isGenerating) {
    if (currentRequest.status === 'completed' || currentRequest.status === 'failed') {
      setIsGenerating(false)
    }
  }

  return {
    // State
    isGenerating,
    currentRequest,
    allRequests: requests,
    isLoading,

    // Actions
    startGeneration,

    // Computed
    isCompleted: currentRequest?.status === 'completed',
    isFailed: currentRequest?.status === 'failed',
    workoutPlanId: currentRequest?.workout_plan_id,
    errorMessage: currentRequest?.error_message,
  }
}
