import { Exercise, WorkoutSession, WorkoutSet } from '../types/workout';

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
