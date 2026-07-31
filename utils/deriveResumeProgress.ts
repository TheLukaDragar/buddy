/**
 * Derive workout resume position from completed set rows.
 * Session row indices can lag behind set writes / RTK Query cache.
 *
 * Important: within an exercise, park on the *last completed* set (not the next
 * incomplete one) so resume can treat it as set-complete → rest. Jumping to the
 * next incomplete set skips rest and feels like the workout "skipped ahead".
 */

export type CompletedSetRef = {
  workoutEntryId: string;
  setNumber: number;
};

export type ResumeProgress = {
  currentExerciseIndex: number;
  currentSetIndex: number;
  completedExercises: number;
  completedSets: number;
};

/**
 * Walk entries:
 * - All sets done → advance to next exercise
 * - Some sets done → park on last completed set (0-based)
 * - None done → set 0
 */
export function deriveResumeProgressFromSets(
  workoutEntries: Array<{ id: string; sets: number }>,
  completedSetsData: CompletedSetRef[]
): ResumeProgress | null {
  if (!workoutEntries.length) return null;

  let completedExercises = 0;

  for (let i = 0; i < workoutEntries.length; i++) {
    const entry = workoutEntries[i];
    const doneNumbers = completedSetsData
      .filter((cs) => cs.workoutEntryId === entry.id)
      .map((cs) => cs.setNumber);
    const done = new Set(doneNumbers);

    let completedOnEntry = 0;
    for (let s = 1; s <= entry.sets; s++) {
      if (done.has(s)) completedOnEntry++;
    }

    if (completedOnEntry >= entry.sets) {
      completedExercises++;
      continue;
    }

    if (completedOnEntry === 0) {
      return {
        currentExerciseIndex: i,
        currentSetIndex: 0,
        completedExercises,
        completedSets: completedSetsData.length,
      };
    }

    // Park on last completed set so resume → set-complete → rest
    const lastCompleted = Math.max(...doneNumbers.filter((n) => n >= 1 && n <= entry.sets));
    return {
      currentExerciseIndex: i,
      currentSetIndex: Math.max(0, lastCompleted - 1),
      completedExercises,
      completedSets: completedSetsData.length,
    };
  }

  // All exercises fully complete — park on last set of last exercise
  const lastIdx = workoutEntries.length - 1;
  const lastSets = workoutEntries[lastIdx]?.sets ?? 1;
  return {
    currentExerciseIndex: lastIdx,
    currentSetIndex: Math.max(0, lastSets - 1),
    completedExercises: workoutEntries.length,
    completedSets: completedSetsData.length,
  };
}

/**
 * Merge session row + derived-from-sets.
 * - Prefer derived when it advances to a later *exercise* (session lag after finishing an exercise)
 * - Within the same exercise, prefer the higher set index that still refers to a completed set
 *   (don't jump past rest onto the next incomplete set)
 */
export function resolveResumeProgress(
  session: ResumeProgress,
  derived: ResumeProgress | null
): ResumeProgress {
  if (!derived) return session;

  if (derived.currentExerciseIndex > session.currentExerciseIndex) {
    return derived;
  }

  if (derived.currentExerciseIndex < session.currentExerciseIndex) {
    // Session claims a later exercise — trust derived (sets are source of truth)
    return derived;
  }

  // Same exercise: take the further of the two (both should be on a completed set when mid-rest)
  return {
    currentExerciseIndex: session.currentExerciseIndex,
    currentSetIndex: Math.max(session.currentSetIndex, derived.currentSetIndex),
    completedExercises: Math.max(session.completedExercises, derived.completedExercises),
    completedSets: Math.max(session.completedSets, derived.completedSets),
  };
}
