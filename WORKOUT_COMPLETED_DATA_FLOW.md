# Workout Completed Screen - Data Flow Plan

## Overview
This document outlines the step-by-step data flow for connecting the `workout-completed.tsx` screen to real data from Redux and the database.

## Current State
- ✅ Screen UI is complete with dummy data
- ✅ Navigation wired (DONE button → `/workout-completed`)
- ❌ Data is still dummy/hardcoded
- ❌ No connection to Redux or database

## Data Flow Architecture

### Step 1: Capture Session ID Before Navigation
**Location**: `app/active_workout.tsx`

**Problem**: When `completeWorkout()` is dispatched, Redux state is cleared (`sessionId: null`). We need to capture the `sessionId` before navigation.

**Solution**: Read `sessionId` from Redux BEFORE calling `completeWorkout()`, and pass it as a route parameter.

**Implementation**:
```typescript
// In active_workout.tsx, before calling completeWorkout()
const sessionId = useSelector(selectSessionId);

// When navigating:
router.push({
  pathname: '/workout-completed',
  params: { sessionId: sessionId || '' }
});
```

**Files to modify**:
- `app/active_workout.tsx` (3 locations: DONE button, center button, back press handler)

---

### Step 2: Receive Session ID in Workout Completed Screen
**Location**: `app/workout-completed.tsx`

**Implementation**:
```typescript
import { useLocalSearchParams } from 'expo-router';

export default function WorkoutCompletedScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  
  // Validate sessionId exists
  if (!sessionId) {
    // Handle error - maybe redirect back or show error state
  }
}
```

---

### Step 3: Query Workout Session Data
**Location**: `app/workout-completed.tsx`

**Query**: `GetWorkoutSession` (already exists in GraphQL)

**Data needed from session**:
- `day_name` → Display as title (e.g., "Legs")
- `total_time_ms` → Calculate and display workout duration
- `completed_exercises` / `total_exercises` → Progress bar for exercises
- `completed_sets` / `total_sets` → Progress bar for sets
- `is_fully_completed` → For future use
- `finished_early` → For future use

**Implementation**:
```typescript
import { useGetWorkoutSessionQuery } from '@/store/api/enhancedApi';

const { data: sessionData, isLoading: isLoadingSession } = useGetWorkoutSessionQuery(
  { id: sessionId },
  { skip: !sessionId }
);

const session = sessionData?.workout_sessionsCollection?.edges?.[0]?.node;
```

---

### Step 4: Query Workout Entries (Completed Exercises)
**Location**: `app/workout-completed.tsx`

**Problem**: We need to show completed exercises using `ExerciseCard`. The `ExerciseCard` expects `workoutEntry` objects with:
- `id` (workout_entry.id)
- `exercise_id` (workout_entry.exercise_id)
- `sets` (number)
- `reps`, `weight`, `time`, `notes` (optional)

**Query**: Need to query `workout_entriesCollection` filtered by `session_id` (or `workout_plan_id` + `week_number` + `day`).

**Note**: Looking at the schema, `workout_entries` don't have a direct `session_id` field. They're linked via `workout_plan_id`, `week_number`, and `day`.

**Alternative Approach**: Query `workout_session_sets` to get completed sets, then group by `workout_entry_id` to reconstruct exercises.

**Better Approach**: Query workout entries filtered by the plan/day/week from the session, then filter to only show entries that have completed sets.

**Implementation**:
```typescript
// Option 1: Query workout entries (if we can filter by session)
// This might require a new GraphQL query or using the existing GetWorkoutPlan query

// Option 2: Query workout session sets and reconstruct exercises
import { useGetWorkoutSessionSetsQuery } from '@/store/api/enhancedApi';

const { data: setsData } = useGetWorkoutSessionSetsQuery(
  { sessionId },
  { skip: !sessionId }
);

const sets = setsData?.workout_session_setsCollection?.edges?.map(e => e.node) || [];

// Group sets by workout_entry_id to reconstruct exercises
const exercisesByEntry = sets.reduce((acc, set) => {
  const entryId = set.workout_entry_id;
  if (!acc[entryId]) {
    acc[entryId] = {
      id: entryId,
      exercise_id: set.exercise_id,
      sets: [],
    };
  }
  acc[entryId].sets.push(set);
  return acc;
}, {} as Record<string, any>);

// Convert to array format for ExerciseCard
const completedExercises = Object.values(exercisesByEntry).map((entry: any) => ({
  id: entry.id,
  exercise_id: entry.exercise_id,
  sets: entry.sets.length,
  reps: entry.sets[0]?.actual_reps || entry.sets[0]?.target_reps || null,
  weight: entry.sets[0]?.actual_weight || entry.sets[0]?.target_weight || null,
  time: entry.sets[0]?.actual_time || entry.sets[0]?.target_time || null,
  notes: null, // Notes might be stored elsewhere
}));
```

---

### Step 5: Query Workout Adjustments
**Location**: `app/workout-completed.tsx`

**Query**: `GetWorkoutSessionAdjustments` (already exists)

**Data needed**:
- `type` → 'weight', 'reps', 'rest', etc.
- `from_value` → Convert to number
- `to_value` → Convert to number
- `reason` → Display reason
- `affected_set_numbers` → For future use
- `affects_future_sets` → For future use

**Implementation**:
```typescript
import { useGetWorkoutSessionAdjustmentsQuery } from '@/store/api/enhancedApi';

const { data: adjustmentsData } = useGetWorkoutSessionAdjustmentsQuery(
  { sessionId },
  { skip: !sessionId }
);

const adjustments = adjustmentsData?.workout_session_adjustmentsCollection?.edges?.map(e => e.node) || [];

// Transform to match component props
const formattedAdjustments = adjustments
  .filter(adj => ['weight', 'reps', 'rest'].includes(adj.type))
  .map(adj => ({
    type: adj.type as 'weight' | 'reps' | 'rest',
    from: parseFloat(adj.from_value) || 0,
    to: parseFloat(adj.to_value) || 0,
    reason: adj.reason,
  }));
```

---

### Step 6: Calculate Time Display
**Location**: `app/workout-completed.tsx`

**Data**: `session.total_time_ms` (from Step 3)

**Implementation**:
```typescript
const formatTime = (ms: number | null | undefined) => {
  if (!ms) return '0 min';
  
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
  
  if (minutes > 0) {
    return `${minutes} min`; // Already rounds to whole number
  }
  
  return `${seconds}s`;
};

const displayTime = formatTime(session?.total_time_ms);
```

---

### Step 7: Replace Dummy Data with Real Data
**Location**: `app/workout-completed.tsx`

**Replace**:
- `dummyData.workoutName` → `session?.day_name || 'Workout'`
- `dummyData.totalTime` → `session?.total_time_ms || 0`
- `dummyData.completedExercises` → `session?.completed_exercises || 0`
- `dummyData.totalExercises` → `session?.total_exercises || 0`
- `dummyData.completedSets` → `session?.completed_sets || 0`
- `dummyData.totalSets` → `session?.total_sets || 0`
- `dummyData.exercises` → `completedExercises` (from Step 4)
- `dummyData.adjustments` → `formattedAdjustments` (from Step 5)

---

### Step 8: Handle Loading States
**Location**: `app/workout-completed.tsx`

**Implementation**:
```typescript
const isLoading = isLoadingSession || isLoadingSets || isLoadingAdjustments;

if (isLoading) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Show loading skeleton or spinner */}
    </SafeAreaView>
  );
}

if (!session) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Show error state */}
      <Text>Workout session not found</Text>
    </SafeAreaView>
  );
}
```

---

### Step 9: Handle Edge Cases
**Location**: `app/workout-completed.tsx`

**Edge cases to handle**:
1. **No sessionId in route params**: Redirect back or show error
2. **Session not found**: Show error message
3. **No completed exercises**: Show empty state
4. **No adjustments**: Hide adjustments card (already handled in component)
5. **Missing exercise data**: `ExerciseCard` handles loading states internally

---

## Implementation Order

1. ✅ **Step 1**: Capture and pass `sessionId` in navigation (3 locations in `active_workout.tsx`)
2. ✅ **Step 2**: Receive `sessionId` in `workout-completed.tsx`
3. ✅ **Step 3**: Query workout session data
4. ✅ **Step 4**: Query workout entries/sets and reconstruct exercises
5. ✅ **Step 5**: Query adjustments
6. ✅ **Step 6**: Calculate time display
7. ✅ **Step 7**: Replace dummy data with real data
8. ✅ **Step 8**: Add loading states
9. ✅ **Step 9**: Handle edge cases

---

## Data Dependencies

```
sessionId (route param)
    ↓
    ├─→ GetWorkoutSession → session data (day_name, time, progress)
    ├─→ GetWorkoutSessionSets → sets data → reconstruct exercises
    └─→ GetWorkoutSessionAdjustments → adjustments data
```

---

## Testing Checklist

- [ ] Navigate to workout-completed screen after completing workout
- [ ] Verify sessionId is passed correctly
- [ ] Verify session data loads and displays correctly
- [ ] Verify exercises are displayed using ExerciseCard
- [ ] Verify progress bars show correct completion
- [ ] Verify adjustments are displayed correctly
- [ ] Verify time formatting (whole numbers for minutes)
- [ ] Verify loading states work
- [ ] Verify error states work (no sessionId, session not found)
- [ ] Verify back button navigation works

---

## Notes

- **ExerciseCard**: Already handles fetching exercise data via `useGetExerciseByIdQuery`, so we just need to pass `exercise_id`
- **Adjustments**: Currently stored in Redux `activeWorkout.adjustmentsMade`, but also synced to database `workout_session_adjustments` table
- **Time calculation**: `total_time_ms` is stored in database, calculated from `started_at` and `completed_at` minus pause time
- **Future**: AI summary will be added later (currently placeholder)

