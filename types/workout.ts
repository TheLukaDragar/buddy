// Basic workout types for WorkoutDisplay component

export interface WorkoutAIContext {
  currentPhase: 'exercising' | 'resting' | 'paused' | 'transitioning' | 'preparing';
  exerciseName: string;
  setNumber: number;
  totalSets: number;
  targetReps: number;
  targetWeight?: number;
  restTimeRemaining?: number;
  userFeedback?: 'easy' | 'medium' | 'hard' | 'impossible';
  progressPercentage: number;
  timeElapsed: number;
  estimatedTimeRemaining: number;
  exactSeconds: number;
  exerciseConfirmed: boolean;
  recentAdjustments: string[];
  motivationalContext: {
    isStruggling: boolean;
    needsEncouragement: boolean;
    isAheadOfSchedule: boolean;
    energyLevel: 'low' | 'medium' | 'high';
  };
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  targetReps: number;
  targetWeight?: number;
  targetTime?: number;
  restTimeAfter: number;
  isCompleted: boolean;
  actualReps?: number;
  actualWeight?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'impossible';
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  type: 'strength' | 'cardio' | 'flexibility';
  muscleGroups: string[];
  sets: WorkoutSet[];
  videoUrl?: string;
  equipment?: string[];
  instructions?: string[];
  tips?: string[];
  estimatedDuration: number;
}

export interface ActiveWorkoutState {
  sessionId: string;
  currentExerciseIndex: number;
  currentSetIndex: number;
  phase: 'exercising' | 'resting' | 'paused' | 'transitioning' | 'preparing';
  startTime: Date;
  currentPhaseStartTime: Date;
  elapsedTime: number;
  isPaused: boolean;
  totalPauseTime: number;
  pauseStartTime?: Date;
  completedExercises: number;
  completedSets: number;
  totalExercises: number;
  totalSets: number;
  currentExercise?: Exercise;
  currentSet?: WorkoutSet;
  timeRemaining?: number;
  lastLoggedProgress?: number;
  warningTriggered?: boolean;
  exerciseConfirmed?: boolean;
  exactSeconds?: number;
  setsCompleted: Array<{
    exerciseId: string;
    setId: string;
    performance: {
      actualReps?: number;
      actualWeight?: number;
      difficulty?: 'easy' | 'medium' | 'hard' | 'impossible';
    };
  }>;
  adjustmentsMade: Array<{
    type: 'weight' | 'reps' | 'rest';
    from: number;
    to: number;
    reason: string;
    timestamp: Date;
  }>;
  lastFeedback?: {
    difficulty: 'easy' | 'medium' | 'hard' | 'impossible';
    timestamp: Date;
  };
}

export interface WorkoutSession {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  totalEstimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  createdAt: Date;
}

export interface WorkoutEvent {
  type: 'start' | 'pause' | 'resume' | 'complete-set' | 'complete-workout' | 'adjust-weight' | 'adjust-reps' | 'adjust-rest' | 'start-rest' | 'end-rest' | 'complete-exercise' | 'exercise-confirmed' | 'auto-pause';
  timestamp: Date;
  data?: any;
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalTime: number;
  totalSets: number;
  averageWorkoutDuration: number;
  favoriteExercises: string[];
  progressTrend: 'improving' | 'maintaining' | 'declining';
}

export interface WorkoutPreferences {
  weightUnit: 'kg' | 'lbs';
  restTimerSound: boolean;
  autoAdvance: boolean;
  defaultRestTime: number;
  feedbackFrequency: 'every-set' | 'every-exercise' | 'never';
  aiGuidanceLevel: 'minimal' | 'moderate' | 'maximum';
} 