# Workout Adjustment Refactoring Plan

## 🎯 Objective
Refactor ExerciseAdjustModal to use GraphQL mutations and real-time updates instead of manual data passing. This enables proper persistence, real-time synchronization across UI, and proper data normalization.

---

## 📊 Current Architecture Analysis

### Current Data Flow (❌ Problems)
```
workout.tsx
  └─> Manually extracts data from workoutEntry.node
      └─> Creates custom workoutEntryData object: { sets, reps, weight, notes }
          └─> Passes to ExerciseAdjustModal as prop
              └─> Modal uses local useState for adjustments
                  └─> Changes never persist to database ❌
                  └─> No real-time sync ❌
                  └─> Data duplicated across components ❌
```

### Current Props Structure (Problematic)
```typescript
// workout.tsx (lines ~604-612)
workoutEntryData: {
  sets: workoutEntry.node.sets,       // Manually extracted
  reps: workoutEntry.node.reps,       // Manually extracted
  weight: workoutEntry.node.weight,   // Manually extracted
  notes: workoutEntry.node.notes      // Manually extracted
}

// ExerciseAdjustModal.tsx (lines ~153-161)
workoutEntry?: {
  sets: number;
  reps?: string;
  time?: string;
  weight?: string;
  notes?: string;
}
```

**Problems:**
1. ❌ Data manually flattened - loses GraphQL node structure
2. ❌ No workout_entry ID passed - can't persist changes
3. ❌ Local state only - no database sync
4. ❌ No RTK Query cache updates - stale data
5. ❌ Can't handle alternative exercise swapping

---

## 🎨 Target Architecture (✅ Solution)

### New Data Flow
```
workout.tsx
  └─> Passes full workout entry node with ID
      └─> ExerciseAdjustModal receives node
          └─> Modal uses RTK Query mutation hook
              └─> useUpdateWorkoutEntryMutation()
                  ├─> Optimistic UI updates (instant feedback)
                  ├─> Persists to Supabase via GraphQL
                  └─> RTK Query auto-invalidates cache
                      └─> All components re-render with fresh data ✅
```

### Real-time Flow
```
User adjusts sets/reps/weight
  └─> Mutation called with workout_entry_id
      └─> Supabase updates database
          └─> RTK Query cache invalidated
              └─> useGetWorkoutDayQuery refetches
                  └─> workout.tsx re-renders
                      └─> Modal shows updated data
                          └─> Other screens also update ✅
```

---

## 🛠 Implementation Steps

### Step 1: Add GraphQL Mutation Schema

**File:** `graphql/queries/workout-plans.graphql`

```graphql
# Mutation to update workout entry parameters
mutation UpdateWorkoutEntry(
  $id: UUID!
  $sets: Int
  $reps: String
  $weight: String
  $time: String
  $notes: String
  $isAdjusted: Boolean
  $adjustmentReason: String
) {
  updateworkout_entriesCollection(
    filter: { id: { eq: $id } }
    set: {
      sets: $sets
      reps: $reps
      weight: $weight
      time: $time
      notes: $notes
      is_adjusted: $isAdjusted
      adjustment_reason: $adjustmentReason
    }
  ) {
    records {
      id
      week_number
      day_name
      day
      date
      exercise_id
      sets
      reps
      weight
      time
      notes
      is_adjusted
      adjustment_reason
      exercises {
        id
        name
        slug
        equipment_groups
      }
      workout_entry_alternativesCollection(orderBy: [{ position: AscNullsLast }]) {
        edges {
          node {
            id
            alternative_exercise_id
            note
            position
            exercises {
              id
              name
              slug
              equipment_groups
            }
          }
        }
      }
    }
    affectedCount
  }
}

# Mutation to swap exercise with alternative
mutation SwapExerciseWithAlternative(
  $workoutEntryId: UUID!
  $newExerciseId: UUID!
  $adjustmentReason: String!
) {
  updateworkout_entriesCollection(
    filter: { id: { eq: $workoutEntryId } }
    set: {
      exercise_id: $newExerciseId
      is_adjusted: true
      adjustment_reason: $adjustmentReason
    }
  ) {
    records {
      id
      exercise_id
      is_adjusted
      adjustment_reason
      exercises {
        id
        name
        slug
        equipment_groups
      }
    }
    affectedCount
  }
}
```

**Why this works:**
- ✅ Uses workout entry ID for precise updates
- ✅ Returns full updated record for cache sync
- ✅ Includes `is_adjusted` flag for tracking changes
- ✅ Supports both parameter adjustments and exercise swapping

---

### Step 2: Generate TypeScript Types

**Command:**
```bash
npm run codegen
```

**Generated hooks (in `graphql/generated.ts`):**
- `useUpdateWorkoutEntryMutation()`
- `useSwapExerciseWithAlternativeMutation()`

**Generated types:**
- `UpdateWorkoutEntryMutation`
- `UpdateWorkoutEntryMutationVariables`
- `SwapExerciseWithAlternativeMutation`
- `SwapExerciseWithAlternativeMutationVariables`

---

### Step 3: Refactor ExerciseAdjustModal Props

**File:** `components/ExerciseAdjustModal.tsx`

**Current interface (lines ~133-175):**
```typescript
interface ExerciseInfoModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectAlternative?: (alternativeExercise: any) => void;
  exercise?: { ... };
  workoutEntry?: {          // ❌ Flattened object
    sets: number;
    reps?: string;
    time?: string;
    weight?: string;
    notes?: string;
  };
  alternatives?: Array<...>;
}
```

**New interface:**
```typescript
interface ExerciseAdjustModalProps {
  visible: boolean;
  onClose: () => void;
  onAdjustmentComplete?: () => void;  // Callback after mutation
  
  // Pass the FULL workout entry node from GraphQL
  workoutEntryNode: {
    id: string;                       // ✅ Essential for mutations
    week_number: number;
    day_name: string;
    day: string;
    date: string;
    exercise_id: string;
    sets: number;
    reps?: string;
    weight?: string;
    time?: string;
    notes?: string;
    is_adjusted: boolean;
    adjustment_reason?: string;
    exercises: {
      id: string;
      name: string;
      slug?: string;
      instructions?: string;
      equipment_groups?: any;
    };
    workout_entry_alternativesCollection?: {
      edges: Array<{
        node: {
          id: string;
          alternative_exercise_id: string;
          note: string;
          position: number;
          exercises: {
            id: string;
            name: string;
            slug?: string;
            equipment_groups?: any;
          };
        };
      }>;
    };
  };
}
```

**Why this is better:**
- ✅ Contains workout entry ID for mutations
- ✅ Matches GraphQL query structure exactly
- ✅ Includes nested alternatives automatically
- ✅ Includes exercises data (no separate prop needed)
- ✅ Type-safe from codegen

---

### Step 4: Implement Mutation Hooks in Modal

**File:** `components/ExerciseAdjustModal.tsx`

**Add imports:**
```typescript
import { useUpdateWorkoutEntryMutation, useSwapExerciseWithAlternativeMutation } from '../graphql/generated';
```

**Replace local state management:**
```typescript
const ExerciseAdjustModal = React.memo<ExerciseAdjustModalProps>(
  function ExerciseAdjustModal({ visible, onClose, onAdjustmentComplete, workoutEntryNode }) {
    
    // RTK Query mutation hooks
    const [updateWorkoutEntry, { isLoading: isUpdating }] = useUpdateWorkoutEntryMutation();
    const [swapExercise, { isLoading: isSwapping }] = useSwapExerciseWithAlternativeMutation();
    
    // Local state for UI adjustments (before save)
    const [adjustedSets, setAdjustedSets] = useState(workoutEntryNode.sets);
    const [adjustedReps, setAdjustedReps] = useState(workoutEntryNode.reps || '8-12');
    const [adjustedWeight, setAdjustedWeight] = useState(workoutEntryNode.weight || 'Body');
    const [adjustedTime, setAdjustedTime] = useState(workoutEntryNode.time || '');
    
    // Track if any adjustments were made
    const [hasChanges, setHasChanges] = useState(false);
    
    // Sync local state when node changes
    useEffect(() => {
      setAdjustedSets(workoutEntryNode.sets);
      setAdjustedReps(workoutEntryNode.reps || '8-12');
      setAdjustedWeight(workoutEntryNode.weight || 'Body');
      setAdjustedTime(workoutEntryNode.time || '');
      setHasChanges(false);
    }, [workoutEntryNode.id]); // Only reset when entry changes
    
    // Save adjustments to database
    const handleSaveAdjustments = async () => {
      if (!hasChanges) {
        onClose();
        return;
      }
      
      try {
        await updateWorkoutEntry({
          id: workoutEntryNode.id,
          sets: adjustedSets,
          reps: adjustedReps !== workoutEntryNode.reps ? adjustedReps : undefined,
          weight: adjustedWeight !== workoutEntryNode.weight ? adjustedWeight : undefined,
          time: adjustedTime !== workoutEntryNode.time ? adjustedTime : undefined,
          isAdjusted: true,
          adjustmentReason: 'User adjusted parameters'
        }).unwrap();
        
        console.log('✅ Workout entry updated successfully');
        setHasChanges(false);
        onAdjustmentComplete?.();
        onClose();
      } catch (error) {
        console.error('❌ Failed to update workout entry:', error);
        // TODO: Show error toast/message
      }
    };
    
    // Handle alternative exercise selection
    const handleSelectAlternative = async (alternativeExercise: any) => {
      try {
        await swapExercise({
          workoutEntryId: workoutEntryNode.id,
          newExerciseId: alternativeExercise.id,
          adjustmentReason: `Swapped to ${alternativeExercise.name}`
        }).unwrap();
        
        console.log('✅ Exercise swapped successfully');
        onAdjustmentComplete?.();
        onClose();
      } catch (error) {
        console.error('❌ Failed to swap exercise:', error);
        // TODO: Show error toast/message
      }
    };
    
    // Update adjustment functions to mark as changed
    const adjustWeightValue = (delta: number) => {
      setAdjustedWeight((prevWeight) => {
        const parsed = parseWeight(prevWeight);
        if (parsed) {
          const newValue = Math.max(0, parsed.value + delta);
          setHasChanges(true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          return `${newValue}${parsed.unit}`;
        }
        return prevWeight;
      });
    };
    
    const adjustSetsValue = (delta: number) => {
      setAdjustedSets((prevSets) => {
        const newSets = Math.max(1, prevSets + delta);
        setHasChanges(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return newSets;
      });
    };
    
    const adjustRepsValue = (delta: number) => {
      setAdjustedReps((prevReps) => {
        const parsed = parseReps(prevReps);
        const newMin = Math.max(1, parsed.min + delta);
        setHasChanges(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (parsed.max) {
          const newMax = Math.max(newMin + 1, parsed.max + delta);
          return `${newMin}-${newMax}`;
        } else {
          return `${newMin}`;
        }
      });
    };
    
    // ... rest of component
  }
);
```

**Add Save/Cancel buttons:**
```typescript
{/* Action Buttons - Show when changes exist */}
{hasChanges && (
  <View style={styles.actionButtonsContainer}>
    <TouchableOpacity
      style={[styles.actionButton, styles.cancelButton]}
      onPress={onClose}
      activeOpacity={0.7}
    >
      <Text style={styles.cancelButtonText}>Cancel</Text>
    </TouchableOpacity>
    
    <TouchableOpacity
      style={[styles.actionButton, styles.saveButton]}
      onPress={handleSaveAdjustments}
      disabled={isUpdating}
      activeOpacity={0.7}
    >
      {isUpdating ? (
        <ActivityIndicator color={nucleus.light.global.blue[10]} />
      ) : (
        <Text style={styles.saveButtonText}>Save Changes</Text>
      )}
    </TouchableOpacity>
  </View>
)}
```

---

### Step 5: Update workout.tsx to Pass Full Node

**File:** `app/workout.tsx`

**Current code (lines ~600-616):**
```typescript
// ❌ OLD - Manually constructing data
if (workoutEntry) {
  setSelectedExerciseForAdjustment({
    ...exercise,
    workoutEntryData: {
      sets: workoutEntry.node.sets,
      reps: workoutEntry.node.reps,
      weight: workoutEntry.node.weight,
      notes: workoutEntry.node.notes
    },
    alternatives: workoutEntry.node.workout_entry_alternativesCollection?.edges || []
  });
  setShowAlternativesModal(true);
}
```

**New code:**
```typescript
// ✅ NEW - Pass the complete node
if (workoutEntry) {
  setSelectedWorkoutEntryNode(workoutEntry.node);
  setShowAlternativesModal(true);
}
```

**Update state:**
```typescript
// Replace this:
const [selectedExerciseForAdjustment, setSelectedExerciseForAdjustment] = useState<any>(null);

// With this:
const [selectedWorkoutEntryNode, setSelectedWorkoutEntryNode] = useState<any>(null);
```

**Update modal rendering (lines ~1001-1030):**
```typescript
{/* ❌ OLD Modal */}
{showAlternativesModal && selectedExerciseForAdjustment && (
  <ExerciseAdjustModal
    visible={showAlternativesModal}
    onClose={() => {
      setShowAlternativesModal(false);
      setIsAdjustMode(false);
    }}
    onSelectAlternative={(altExercise) => {
      console.log('Selected alternative:', altExercise);
    }}
    exercise={{
      name: selectedExerciseForAdjustment.name,
      slug: selectedExerciseForAdjustment.slug,
      instructions: [],
      tips: [],
      equipment: [],
      category: "Adjust Exercise",
    }}
    workoutEntry={selectedExerciseForAdjustment.workoutEntryData}
    alternatives={selectedExerciseForAdjustment.alternatives}
  />
)}

{/* ✅ NEW Modal */}
{showAlternativesModal && selectedWorkoutEntryNode && (
  <ExerciseAdjustModal
    visible={showAlternativesModal}
    onClose={() => {
      setShowAlternativesModal(false);
      setIsAdjustMode(false);
      setSelectedWorkoutEntryNode(null);
    }}
    onAdjustmentComplete={() => {
      // Optional: Show success message
      console.log('✅ Workout adjusted successfully');
    }}
    workoutEntryNode={selectedWorkoutEntryNode}
  />
)}
```

---

### Step 6: Configure RTK Query Cache Invalidation

**File:** `store/api/baseApi.ts`

**Update tag types:**
```typescript
export const api = createApi({
  reducerPath: 'api',
  baseQuery: graphqlBaseQuery,
  tagTypes: [
    'Todo', 
    'User', 
    'WorkoutPlan', 
    'WorkoutPlanRequest',
    'WorkoutEntry',        // ✅ Add this
    'WorkoutDay',          // ✅ Add this
  ],
  endpoints: () => ({}),
});
```

**File:** `store/api/enhancedApi.ts` (or wherever mutations are defined)

**Add providesTags to queries:**
```typescript
// In codegen-generated file or manual override
useGetWorkoutDayQuery: build.query({
  providesTags: (result, error, arg) => [
    { type: 'WorkoutDay', id: `${arg.planId}-${arg.weekNumber}-${arg.day}` },
    { type: 'WorkoutEntry', id: 'LIST' }
  ]
})

useUpdateWorkoutEntryMutation: build.mutation({
  invalidatesTags: (result, error, arg) => [
    { type: 'WorkoutDay', id: 'LIST' },  // Invalidate all days
    { type: 'WorkoutEntry', id: arg.id }, // Invalidate specific entry
    { type: 'WorkoutEntry', id: 'LIST' }  // Invalidate entry list
  ]
})
```

---

### Step 7: Add Optimistic Updates (Optional but Recommended)

**File:** `components/ExerciseAdjustModal.tsx`

```typescript
const [updateWorkoutEntry] = useUpdateWorkoutEntryMutation({
  // Optimistic update - immediately update UI before server responds
  onQueryStarted: async (args, { dispatch, queryFulfilled, getState }) => {
    // Create patch for optimistic update
    const patchResult = dispatch(
      api.util.updateQueryData('getWorkoutDay', 
        { planId: workoutEntryNode.workout_plan_id, weekNumber: workoutEntryNode.week_number, day: workoutEntryNode.day },
        (draft) => {
          // Find and update the entry in cache
          const entries = draft.workout_plansCollection?.edges?.[0]?.node?.workout_entriesCollection?.edges;
          const entryToUpdate = entries?.find(e => e.node.id === args.id);
          if (entryToUpdate) {
            if (args.sets !== undefined) entryToUpdate.node.sets = args.sets;
            if (args.reps !== undefined) entryToUpdate.node.reps = args.reps;
            if (args.weight !== undefined) entryToUpdate.node.weight = args.weight;
            if (args.time !== undefined) entryToUpdate.node.time = args.time;
          }
        }
      )
    );
    
    try {
      await queryFulfilled;
      console.log('✅ Optimistic update confirmed by server');
    } catch {
      // Revert optimistic update on error
      patchResult.undo();
      console.error('❌ Optimistic update failed, reverting');
    }
  }
});
```

---

## 🎯 Benefits of This Refactoring

### 1. **Data Persistence** ✅
- All adjustments save to Supabase database
- Changes survive app restarts
- Audit trail via `is_adjusted` and `adjustment_reason`

### 2. **Real-time Synchronization** ✅
- RTK Query auto-invalidates cache
- All components show latest data
- Multi-device sync via Supabase Realtime

### 3. **Type Safety** ✅
- GraphQL codegen generates types
- Compile-time error checking
- IntelliSense autocomplete

### 4. **Single Source of Truth** ✅
- Database is authoritative
- No duplicate state management
- Eliminates sync bugs

### 5. **Better UX** ✅
- Optimistic updates (instant feedback)
- Loading states during mutations
- Error handling with rollback

### 6. **Scalability** ✅
- Easy to add new adjustment fields
- Can track adjustment history
- Supports undo/redo later

---

## 📝 Testing Checklist

### Before Refactoring
- [ ] Document current behavior
- [ ] Take screenshots of working UI
- [ ] List all adjustment scenarios

### During Refactoring
- [ ] Step 1: Add mutations to GraphQL schema
- [ ] Step 2: Run codegen successfully
- [ ] Step 3: Update modal interface
- [ ] Step 4: Implement mutation hooks
- [ ] Step 5: Update workout.tsx callers
- [ ] Step 6: Configure cache tags
- [ ] Step 7: Add optimistic updates

### After Refactoring
- [ ] Adjust sets - verify saves to DB
- [ ] Adjust reps - verify saves to DB
- [ ] Adjust weight - verify saves to DB
- [ ] Swap alternative exercise - verify saves to DB
- [ ] Check RTK Query cache updates
- [ ] Verify real-time sync across screens
- [ ] Test error handling (network offline)
- [ ] Test optimistic updates (instant UI feedback)
- [ ] Check loading states display correctly
- [ ] Verify workout.tsx reflects changes

---

## 🚨 Migration Notes

### Breaking Changes
1. `workoutEntry` prop removed - use `workoutEntryNode` instead
2. `alternatives` prop removed - nested in `workoutEntryNode`
3. `exercise` prop removed - nested in `workoutEntryNode.exercises`
4. `onSelectAlternative` callback signature changed

### Backward Compatibility
- Keep old ExerciseInfoModal for read-only views
- Only ExerciseAdjustModal needs refactoring
- workout.tsx is only caller that needs updates

### Rollback Plan
1. Keep old implementation in git history
2. Feature flag for new mutation path
3. Can revert to local state if issues arise

---

## 🎉 Success Criteria

- ✅ Adjustments persist to database
- ✅ UI updates immediately (optimistic)
- ✅ Changes visible in workout.tsx after closing modal
- ✅ Alternative exercise swaps work
- ✅ RTK Query cache invalidates properly
- ✅ No TypeScript errors
- ✅ Loading states work
- ✅ Error handling graceful

---

## 📚 References

- RTK Query Mutations: https://redux-toolkit.js.org/rtk-query/usage/mutations
- Optimistic Updates: https://redux-toolkit.js.org/rtk-query/usage/optimistic-updates
- Supabase GraphQL: https://supabase.com/docs/guides/graphql
- GraphQL Codegen: https://the-guild.dev/graphql/codegen
