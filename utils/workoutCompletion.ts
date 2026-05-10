/**
 * Full completion for DB + UI: every planned set logged counts as a fully completed workout.
 * Falls back to exercise counts when total_sets is zero (edge / legacy sessions).
 */
export function isWorkoutFullyCompletedByCounts(params: {
  completedSets: number;
  totalSets: number;
  completedExercises: number;
  totalExercises: number;
}): boolean {
  const { completedSets, totalSets, completedExercises, totalExercises } = params;
  if (totalSets > 0) {
    return completedSets >= totalSets;
  }
  return totalExercises > 0 && completedExercises >= totalExercises;
}
