import { Exercise, WorkoutSession, WorkoutSet } from '../types/workout';

// Helper functions for creating workout data
export const createWorkoutSet = (
  setNumber: number,
  targetReps: number,
  targetWeight: number,
  restTimeAfter: number,
  targetTime?: number
): WorkoutSet => ({
  id: `set-${setNumber}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  setNumber,
  targetReps,
  targetWeight: targetWeight > 0 ? targetWeight : undefined,
  targetTime,
  restTimeAfter,
  isCompleted: false,
});

export const createExercise = (
  name: string,
  description: string,
  type: 'strength' | 'cardio' | 'flexibility',
  muscleGroups: string[],
  sets: WorkoutSet[],
  videoUrl?: string,
  equipment?: string[],
  instructions?: string[],
  tips?: string[]
): Exercise => {
  const estimatedDuration = sets.reduce((total, set, index) => {
    const setTime = set.targetTime || 30; // Estimate 30 seconds per set if not specified
    const restTime = index < sets.length - 1 ? set.restTimeAfter : 0; // No rest after last set
    return total + setTime + restTime;
  }, 0);

  return {
    id: `exercise-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    type,
    muscleGroups,
    sets,
    videoUrl,
    equipment: equipment || [],
    instructions: instructions || [],
    tips: tips || [],
    estimatedDuration,
  };
};

export const createWorkoutSession = (
  name: string,
  description: string,
  exercises: Exercise[],
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  tags: string[]
): WorkoutSession => {
  const totalEstimatedDuration = exercises.reduce((total, exercise) => total + exercise.estimatedDuration, 0);

  return {
    id: `workout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    exercises,
    totalEstimatedDuration,
    difficulty,
    tags,
    createdAt: new Date(),
  };
};

// Sample workout data for demo
export const createSampleWorkoutSets = (): WorkoutSet[] => [
  {
    id: 'set-1',
    setNumber: 1,
    targetReps: 8,
    targetWeight: 40,
    targetTime: 10,
    restTimeAfter: 15,
    isCompleted: false,
  },
  {
    id: 'set-2',
    setNumber: 2,
    targetReps: 8,
    targetWeight: 40,
    targetTime: 10,
    restTimeAfter: 15,
    isCompleted: false,
  },
  {
    id: 'set-3',
    setNumber: 3,
    targetReps: 8,
    targetWeight: 40,
    targetTime: 10,
    restTimeAfter: 15,
    isCompleted: false,
  },
];

export const sampleExercises: Exercise[] = [
  {
    id: 'exercise-1',
    name: 'Squats',
    description: 'Stand with feet shoulder-width apart, lower your body by bending your knees and hips.',
    type: 'strength',
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
    sets: createSampleWorkoutSets(),
    equipment: ['bodyweight'],
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower your body by bending knees and hips',
      'Keep your chest up and core engaged',
      'Push through heels to return to starting position'
    ],
    tips: [
      'Keep your knees in line with your toes',
      'Don\'t let your knees cave inward',
      'Breathe in on the way down, out on the way up'
    ],
    estimatedDuration: 285, // 3 sets × 10s + 2 rest periods × 12s = 255s
  },
  {
    id: 'exercise-2',
    name: 'Push-ups',
    description: 'Start in plank position, lower your chest to the ground, then push back up.',
    type: 'strength',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    sets: createSampleWorkoutSets().map(set => ({
      ...set,
      id: `pushup-${set.id}`,
      targetWeight: undefined, // Bodyweight exercise
    })),
    equipment: ['bodyweight'],
    instructions: [
      'Start in plank position with hands under shoulders',
      'Lower your chest to the ground',
      'Keep your body in a straight line',
      'Push back up to starting position'
    ],
    tips: [
      'Keep your core tight throughout the movement',
      'Don\'t let your hips sag or pike up',
      'Modify on knees if needed'
    ],
    estimatedDuration: 285,
  },
  {
    id: 'exercise-3',
    name: 'Lunges',
    description: 'Step forward with one leg, lower your body until both knees are bent at 90 degrees.',
    type: 'strength',
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
    sets: createSampleWorkoutSets().map(set => ({
      ...set,
      id: `lunge-${set.id}`,
      targetReps: 8, // 8 per leg = 16 total
      targetWeight: undefined, // Bodyweight exercise
    })),
    equipment: ['bodyweight'],
    instructions: [
      'Stand with feet hip-width apart',
      'Step forward with one leg',
      'Lower until both knees are at 90 degrees',
      'Push back to starting position and repeat on other leg'
    ],
    tips: [
      'Keep your front knee over your ankle',
      'Don\'t let your front knee go past your toes',
      'Keep your torso upright'
    ],
    estimatedDuration: 285,
  },
];

export const sampleWorkoutSession: WorkoutSession = {
  id: 'demo-workout-1',
  name: 'Beginner Strength',
  description: 'A basic strength workout perfect for beginners. Focuses on fundamental movement patterns.',
  exercises: sampleExercises,
  totalEstimatedDuration: 855, // 3 exercises × 285s = 855s (about 14 minutes)
  difficulty: 'beginner',
  tags: ['strength', 'bodyweight', 'beginner', 'full-body'],
  createdAt: new Date(),
};

// Miha's Workout - Progressive strength training
export const mihasWorkout: WorkoutSession = createWorkoutSession(
  "Leg Workout",
  "Complete strength workout with progressive loading",
  [
    createExercise(
      "Squat",
      "Classic barbell squat movement for lower body strength",
      "strength",
      ["quads", "glutes", "hamstrings", "core"],
      [
        createWorkoutSet(1, 8, 20, 90, 60), // First set with just bar weight (20kg)
        createWorkoutSet(2, 8, 40, 90, 60), // Progressive loading
        createWorkoutSet(3, 6, 50, 90, 60),
        createWorkoutSet(4, 6, 55, 120, 60)
      ],
      "./assets/videos/squats.mp4",
      ["barbell", "squat-rack"],
      [
        "Position barbell on upper back/traps",
        "Stand with feet shoulder-width apart",
        "Descend by pushing hips back and bending knees",
        "Keep chest up and knees tracking over toes",
        "Drive through heels to return to starting position"
      ],
      [
        "First set starts with bar weight only (20kg)",
        "Keep core tight throughout movement",
        "Full depth - thighs parallel to floor",
        "Don't let knees cave inward"
      ]
    ),
    createExercise(
      "Dumbbell Bench Press",
      "Dumbbell bench press for chest, shoulders and triceps",
      "strength",
      ["chest", "shoulders", "triceps"],
      [
        createWorkoutSet(1, 10, 10, 90, 45), // First set with light weight (bar equivalent)
        createWorkoutSet(2, 10, 15, 90, 45), // Progressive loading
       
      ],
      "./assets/videos/bench_dumbles.mp4",
      ["dumbbells", "bench"],
      [
        "Lie on bench with dumbbells at chest level",
        "Press weights up until arms are extended",
        "Lower with control back to starting position",
        "Keep feet flat on floor and back against bench"
      ],
      [
        "First set starts with light weights",
        "Control the descent - don't drop weights",
        "Keep elbows at 45-degree angle to body",
        "Full range of motion for best results"
      ]
    ),
    // createExercise(
    //   "Lateral Shoulder Raise",
    //   "Isolation exercise for shoulder deltoids",
    //   "strength",
    //   ["shoulders"],
    //   [
    //     createWorkoutSet(1, 12, 0, 60, 30), // First set without weights
    //     createWorkoutSet(2, 12, 5, 60, 30), // Progressive loading
    //     createWorkoutSet(3, 10, 7.5, 60, 30),
    //     createWorkoutSet(4, 10, 10, 90, 30)
    //   ],
    //   "./assets/videos/literal_shoulder.mp4",
    //   ["dumbbells"],
    //   [
    //     "Stand with feet hip-width apart",
    //     "Hold dumbbells at sides with slight bend in elbows",
    //     "Raise arms out to sides until parallel with floor",
    //     "Lower with control back to starting position"
    //   ],
    //   [
    //     "First set without weights - arms only",
    //     "Don't swing or use momentum",
    //     "Slight forward lean of torso is okay",
    //     "Focus on feeling the shoulder muscles working"
    //   ]
    // ),
    // createExercise(
    //   "Seated Cable Row",
    //   "Seated rowing for back strength and posture",
    //   "strength",
    //   ["lats", "rhomboids", "rear-delts", "biceps"],
    //   [
    //     createWorkoutSet(1, 12, 0, 60, 40), // First set without weight (just form)
    //     createWorkoutSet(2, 12, 30, 60, 40), // Progressive loading
    //     createWorkoutSet(3, 10, 40, 60, 40),
    //     createWorkoutSet(4, 10, 45, 90, 40)
    //   ],
    //   "./assets/videos/seatued_pulling.mp4",
    //   ["cable-machine", "seated-row-attachment"],
    //   [
    //     "Sit on bench with feet on footplates",
    //     "Grab handle with both hands, arms extended",
    //     "Pull handle to lower chest/upper abdomen",
    //     "Squeeze shoulder blades together at end of movement",
    //     "Slowly return to starting position"
    //   ],
    //   [
    //     "First set without weights - technique only",
    //     "Keep chest up and shoulders back",
    //     "Don't use back momentum to pull",
    //     "Focus on squeezing shoulder blades together"
    //   ]
    // )
  ],
  "intermediate",
  ["strength", "progressive-loading", "full-body", "miha"]
);

// Export all sample workouts
export const allSampleWorkouts: WorkoutSession[] = [
  sampleWorkoutSession,
  mihasWorkout
];
