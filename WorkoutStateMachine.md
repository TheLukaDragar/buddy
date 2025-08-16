# WorkoutStateMachine Technical Definition

## System Overview

The WorkoutStateMachine is a singleton-based state management system that orchestrates the complete lifecycle of fitness workout sessions. It implements a finite state machine pattern with intelligent timer management, real-time parameter adjustments, pause/resume capabilities, and seamless voice agent integration.

## Core Architecture

### Component Structure
```
┌─────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│ WorkoutStateMachine │◄──►│ WorkoutContextManager │◄──►│ ConvAiDOMComponent  │
│                 │    │                      │    │                     │
│ • State Logic   │    │ • Message Routing    │    │ • Voice Integration │
│ • Timer Control │    │ • Context Updates    │    │ • Tool Bridge       │
│ • Data Management│    │ • Agent Communication│    │ • Audio Management  │
└─────────────────┘    └──────────────────────┘    └─────────────────────┘
```

### Singleton Implementation
- **Pattern**: Thread-safe singleton with instance tracking
- **Instance ID**: Each instance has unique identifier for debugging
- **Global Access**: `workoutStateMachine = WorkoutStateMachine.getInstance()`
- **Lifecycle**: Persistent across app sessions until explicit cleanup

## Finite State Machine Definition

### State Enumeration
```typescript
type WorkoutState = 
  | 'inactive'           // State 0: No workout session active
  | 'selected'           // State 1: Workout chosen, awaiting introduction
  | 'preparing'          // State 2: Exercise explanation phase, user confirmation pending
  | 'exercising'         // State 3: Active set timer, user performing exercise
  | 'set-complete'       // State 4: Set finished, transitioning to rest phase
  | 'resting'            // State 5: Rest timer active, feedback collection phase
  | 'rest-ending'        // State 6: 10-second warning, preparing for next set
  | 'exercise-transition'; // State 7: Inter-exercise transition, new exercise introduction
```

### State Transition Graph
```
inactive(0) ──selectWorkout()──► selected(1) ──auto(1s)──► preparing(2)
                                                               │
                     ┌─────────────────────────────────────────┘
                     │
                     ▼
exercise-transition(7) ◄──completeExercise()──┐
     │                                        │
     │startExercisePreparation()              │
     ▼                                        │
preparing(2) ──confirmReadyAndStartSet()──► exercising(3)
                                               │
                     ┌─────────────────────────┘
                     │completeSet()
                     ▼
set-complete(4) ──auto(500ms)──► resting(5)
                                    │
                     ┌──────────────┴──────────────┐
                     │                             │
            triggerRestEnding()              completeExercise()
                     │                        (if last set)
                     ▼                             │
                rest-ending(6)                     │
                     │                             │
              confirmReadyAndStartSet()            │
                     │                             │
                     └────► preparing(2) ◄─────────┘
```

### State Transition Rules

#### Valid Transitions Matrix
| From State | To States | Trigger Method | Conditions |
|------------|-----------|----------------|------------|
| `inactive` | `selected` | `selectWorkout()` | Session provided |
| `selected` | `preparing` | Auto (1s delay) | Always |
| `preparing` | `exercising` | `confirmReadyAndStartSet()` | User ready |
| `exercising` | `set-complete` | `completeSet()` | Timer expires or manual |
| `set-complete` | `resting` | Auto (500ms) | Always |
| `resting` | `rest-ending` | Auto timer | Not last set |
| `resting` | `exercise-transition` | Auto timer | Last set of exercise |
| `rest-ending` | `preparing` | `confirmReadyAndStartSet()` | User ready |
| `exercise-transition` | `preparing` | `startExercisePreparation()` | User ready |

#### Pause State Overlay
Any active state can enter pause mode while maintaining base state:
- `exercising + paused`: Set timer paused, working time preserved
- `resting + paused`: Rest timer paused, rest time preserved
- Resume operations restore exact remaining time

## Technical Implementation

### Timer Management System

#### Set Timer Architecture
```typescript
class SetTimerManager {
  private setTimer: NodeJS.Timeout | null = null;
  private setStartTime: number = 0;
  private totalPauseTime: number = 0;
  private pauseStartTime: number = 0;
  private isPaused: boolean = false;
  
  // Precision timing calculations
  getElapsedTime(): number {
    const now = Date.now();
    if (this.isPaused) {
      return Math.floor((this.pauseStartTime - this.setStartTime - this.totalPauseTime) / 1000);
    }
    return Math.floor((now - this.setStartTime - this.totalPauseTime) / 1000);
  }
}
```

**Features:**
- **Millisecond Precision**: Uses `Date.now()` for accurate timing
- **Pause Accumulation**: Tracks total pause time across multiple pause/resume cycles
- **Default Duration**: 45 seconds (configurable via `WorkoutSet.targetTime`)
- **Auto-completion**: Timer expires → `completeSet()` called automatically
- **Manual Override**: `completeSet()` can be called early

#### Rest Timer Architecture
```typescript
class RestTimerManager {
  private restTimer: NodeJS.Timeout | null = null;
  private restStartTime: number = 0;
  private totalRestPauseTime: number = 0;
  private restPauseStartTime: number = 0;
  
  // Smart timer logic for different scenarios
  startRestTimer(isLastSet: boolean, restDuration: number) {
    if (isLastSet) {
      // Skip 10s warning, auto-complete exercise
      this.restTimer = setTimeout(() => this.completeExercise(), restDuration * 1000);
    } else {
      // Standard flow: trigger warning 10s before end
      this.restTimer = setTimeout(() => this.triggerRestEnding(), (restDuration - 10) * 1000);
    }
  }
}
```

**Features:**
- **Conditional Logic**: Different behavior for last set vs regular sets
- **Warning System**: 10-second countdown for preparation
- **Default Duration**: 60 seconds (configurable via `WorkoutSet.restTimeAfter`)
- **Extension Support**: Can add time during `rest-ending` state

### Pause/Resume System

#### Implementation Details
```typescript
// Exercise pause implementation
pauseSet(reason: string): string {
  if (this.state !== 'exercising') return 'No active set to pause';
  
  this.isPaused = true;
  this.pauseStartTime = Date.now();
  this.clearSetTimer(); // Stop current timer
  this.stopUserActivityPing(); // Halt activity tracking
  
  const currentWorkingTime = Math.round((Date.now() - this.setStartTime - this.totalPauseTime) / 1000);
  this.sendSystemUpdate('set-paused', { reason, workingTimeBeforePause: currentWorkingTime });
  return `Set paused: ${reason}`;
}

// Exercise resume implementation  
resumeSet(): string {
  if (this.state !== 'exercising' || !this.isPaused) return 'No paused set to resume';
  
  // Accumulate pause time
  const pauseDuration = Date.now() - this.pauseStartTime;
  this.totalPauseTime += pauseDuration;
  
  this.isPaused = false;
  this.pauseStartTime = 0;
  
  // Restart timer with exact remaining time
  const elapsed = (Date.now() - this.setStartTime - this.totalPauseTime) / 1000;
  const setDuration = this.context!.currentSet.targetTime || 45;
  const remaining = Math.max(5, setDuration - elapsed); // Minimum 5s
  
  this.setTimer = setTimeout(() => this.completeSet(), remaining * 1000);
  this.startUserActivityPing();
  
  return 'Set resumed';
}
```

**Key Features:**
- **State Validation**: Only allows pause/resume in valid states
- **Time Preservation**: Exact remaining time calculated on resume
- **Minimum Duration**: Ensures at least 5 seconds remaining time
- **Activity Tracking**: Manages user activity monitoring during pause

### Dynamic Parameter Adjustment System

#### Real-time Modification Capabilities
```typescript
// Weight adjustment with immediate context update
adjustWeight(newWeight: number, reason: string): string {
  if (!this.context) return 'No active workout to adjust';
  
  const oldWeight = this.context.targetWeight || 0;
  
  // Update both context and set data
  this.context.targetWeight = newWeight;
  this.context.currentSet.targetWeight = newWeight;
  
  // Broadcast change for voice agent awareness
  this.sendSystemUpdate('weight-adjusted', { from: oldWeight, to: newWeight, reason });
  
  return `Weight adjusted from ${oldWeight}kg to ${newWeight}kg`;
}

// Rest time adjustment with active timer management
adjustRestTime(newRestTime: number, reason: string): string {
  if (!this.context) return 'No active workout to adjust';
  
  const oldRestTime = this.context.currentSet.restTimeAfter || 60;
  this.context.currentSet.restTimeAfter = newRestTime;
  
  // Handle active rest timer adjustment
  if (this.state === 'resting' || this.state === 'rest-ending') {
    this.clearRestTimer();
    const elapsed = (Date.now() - this.restStartTime) / 1000;
    const remaining = Math.max(10, newRestTime - elapsed);
    
    if (remaining > 10) {
      this.transitionTo('resting');
      this.restTimer = setTimeout(() => this.triggerRestEnding(), (remaining - 10) * 1000);
    } else {
      this.transitionTo('rest-ending');
      this.restTimer = setTimeout(() => this.advanceToNextSet(), remaining * 1000);
    }
  }
  
  this.sendSystemUpdate('rest-time-adjusted', { from: oldRestTime, to: newRestTime, reason });
  return `Rest time adjusted from ${oldRestTime}s to ${newRestTime}s`;
}
```

**Adjustment Features:**
- **Immediate Effect**: Changes apply instantly to current context
- **Timer Recalculation**: Active timers automatically adjust to new parameters
- **Persistence**: Adjustments carry forward to subsequent sets
- **Audit Trail**: All changes logged with reasons for voice agent context

### Navigation Control System

#### Set-Level Navigation
```typescript
jumpToSet(targetSetNumber: number): string {
  if (!this.context) return 'No active workout to jump sets in';
  
  const currentExercise = this.context.currentExercise;
  const totalSets = currentExercise.sets.length;
  
  // Validate set number (1-based input, convert to 0-based)
  const targetSetIndex = targetSetNumber - 1;
  if (targetSetIndex < 0 || targetSetIndex >= totalSets) {
    return `Invalid set number. This exercise has ${totalSets} sets (1-${totalSets})`;
  }
  
  // Clear all active timers to prevent state conflicts
  this.clearAllTimers();
  this.stopUserActivityPing();
  
  // Update context to target set
  this.context.setIndex = targetSetIndex;
  this.context.currentSet = currentExercise.sets[targetSetIndex];
  this.context.targetReps = this.context.currentSet.targetReps;
  this.context.targetWeight = this.context.currentSet.targetWeight;
  
  // Reset to preparation state
  this.transitionTo('preparing');
  
  this.sendSystemUpdate('set-jumped', {
    targetSetNumber,
    exercise: currentExercise.name,
    targetReps: this.context.targetReps,
    targetWeight: this.context.targetWeight
  });
  
  return `Jumped to set ${targetSetNumber} of ${currentExercise.name}. Tell me when you ready`;
}
```

#### Exercise-Level Flow Control
```typescript
completeExercise(): boolean {
  // CRITICAL: Clear all timers before transitioning to prevent auto-advancement
  this.clearAllTimers();
  
  // Check if workout is complete
  if (this.context!.exerciseIndex >= this.session!.exercises.length - 1) {
    return this.completeWorkout();
  }
  
  // Advance to next exercise
  this.context!.exerciseIndex++;
  this.context!.setIndex = 0;
  this.context!.currentExercise = this.session!.exercises[this.context!.exerciseIndex];
  this.context!.currentSet = this.context!.currentExercise.sets[0];
  this.context!.targetReps = this.context!.currentSet.targetReps;
  this.context!.targetWeight = this.context!.currentSet.targetWeight;
  
  // Transition to exercise-transition state (no auto-advancement)
  this.transitionTo('exercise-transition');
  
  return true;
}
```

**Navigation Features:**
- **Boundary Validation**: Prevents jumping to non-existent sets/exercises
- **Timer Safety**: All timers cleared before navigation to prevent conflicts
- **State Consistency**: Context always updated to match new position
- **User Control**: Navigation requires explicit user confirmation to proceed

## Voice Agent Integration Architecture

### Connection Lifecycle Management
```typescript
setVoiceAgentStatus(connected: boolean): void {
  const wasConnected = this.voiceAgentConnected;
  this.voiceAgentConnected = connected;
  
  console.log(`🎙️ [State Machine] Voice agent ${connected ? 'connected' : 'disconnected'}`);
  
  // When agent connects, send current context
  if (connected && !wasConnected && this.context) {
    this.sendContextSync();
  }
}

// Context synchronization on connection
private sendContextSync(): void {
  if (!this.context || !this.session) return;
  
  const currentExercise = this.context.currentExercise;
  const currentSet = this.context.currentSet;
  const setProgress = `${this.context.setIndex + 1}/${currentExercise.sets.length}`;
  const exerciseProgress = `${this.context.exerciseIndex + 1}/${this.session.exercises.length}`;
  
  let contextMessage = `CONTEXT SYNC: Currently in "${this.session.name}" workout. `;
  contextMessage += `Exercise ${exerciseProgress}: "${currentExercise.name}". `;
  contextMessage += `Set ${setProgress} (${this.context.targetReps} reps`;
  
  if (this.context.targetWeight) {
    contextMessage += ` at ${this.context.targetWeight}kg`;
  }
  
  contextMessage += `). State: ${this.state}`;
  
  // Add timing information based on current state
  if (this.state === 'exercising') {
    const elapsed = this.getElapsedTime();
    contextMessage += `. Set timer: ${elapsed}s elapsed`;
    if (this.isPaused) contextMessage += ' (PAUSED)';
  } else if (this.state === 'resting') {
    const elapsed = this.getElapsedTime();
    const restTime = currentSet.restTimeAfter || 60;
    const remaining = Math.max(0, restTime - elapsed);
    contextMessage += `. Rest timer: ${remaining}s remaining`;
    if (this.isPaused) contextMessage += ' (PAUSED)';
  }
  
  contextMessage += '. User just connected to voice assistant.';
  
  this.sendSystemUpdate('voice-agent-connected', {
    contextMessage,
    workout: this.session.name,
    exercise: currentExercise.name,
    exerciseIndex: this.context.exerciseIndex + 1,
    totalExercises: this.session.exercises.length,
    setIndex: this.context.setIndex + 1,
    totalSets: currentExercise.sets.length,
    state: this.state,
    targetReps: this.context.targetReps,
    targetWeight: this.context.targetWeight,
    isSetCompleted: currentSet.isCompleted,
    isPaused: this.isPaused
  });
}
```

### WorkoutContextManager Message Routing System

```typescript
export class WorkoutContextManager {
  private static instance: WorkoutContextManager;
  private conversationCallback: ConversationCallback | null = null;
  private systemMessageCallback: SystemMessageCallback | null = null;

  public processSystemUpdate(update: SystemUpdate): void {
    const { event, data } = update;

    // Determine routing strategy based on event type
    const shouldTriggerResponse = this.shouldTriggerAgentResponse(event);

    if (shouldTriggerResponse) {
      // Events that require immediate agent response
      const systemMessage = this.convertToSystemMessage(event, data);
      if (this.systemMessageCallback && systemMessage) {
        console.log(`📤 [Context Manager] Sending SYSTEM MESSAGE (triggers response): ${systemMessage}`);
        this.systemMessageCallback(systemMessage);
      }
    } else {
      // Events that update context silently
      const contextMessage = this.convertToContextUpdate(event, data);
      if (this.conversationCallback && contextMessage) {
        console.log(`📤 [Context Manager] Sending CONTEXT UPDATE (silent): ${contextMessage}`);
        this.conversationCallback(contextMessage);
      }
    }
  }

  private shouldTriggerAgentResponse(event: string): boolean {
    // Response-triggering events
    return [
      'workout-selected',      // Agent should explain first exercise
      'set-completed',        // Agent should ask "How did that feel?"
      'rest-ending',          // Agent should say "10 seconds! Get ready!"
      'exercise-changed',     // Agent should explain new exercise
      'workout-completed',    // Agent should celebrate completion
      'voice-agent-connected' // Agent should acknowledge context and current state
    ].includes(event);
  }
}
```

#### Message Classification

**Response-Triggering Events** (require agent speech):
- `workout-selected` → "Welcome to Push Day! Let's start with push-ups..."
- `set-completed` → "Great set! How did that feel? Easy, medium, or hard?"
- `rest-ending` → "10 seconds left! Get ready for your next set!"
- `exercise-changed` → "Moving on to bench press. Here's how to do it..."
- `workout-completed` → "Amazing workout! You completed all exercises!"
- `voice-agent-connected` → Agent acknowledges current state and offers guidance

**Silent Context Updates** (background awareness only):
- `set-started` → Updates timing context without interrupting
- `set-paused/resumed` → Maintains state awareness
- `weight-adjusted/reps-adjusted` → Parameter change awareness
- `rest-started` → Rest period context for timing calculations

## Complete API Reference

### Lifecycle Management
```typescript
// Core workout lifecycle
selectWorkout(session: WorkoutSession): boolean
  // Initializes workout session and transitions to 'selected' state
  // Automatically progresses to 'preparing' after 1s delay
  // Returns: true if successful, false if already active

completeWorkout(): boolean
  // Ends workout session and transitions to 'inactive'
  // Clears all timers and resets context
  // Broadcasts 'workout-completed' event

cleanup(): void
  // Emergency cleanup - clears all timers and resets state
  // Should be called on app termination or error conditions
```

### Set Control Operations
```typescript
confirmReadyAndStartSet(): boolean
  // Multi-state transition handler:
  // - From 'preparing': Start new set timer
  // - From 'resting': Complete rest and advance to next set
  // - From 'rest-ending': Advance to next set immediately
  // - From 'exercise-transition': Begin new exercise
  // Returns: true if transition successful

completeSet(actualReps?: number): boolean
  // Completes current set and transitions to rest
  // actualReps: Optional override for achieved repetitions
  // Automatically calculates working time excluding pause duration
  // Triggers 'set-completed' event for voice agent feedback

restartSet(): string
  // Resets current set to 'preparing' state
  // Clears active timers and user activity monitoring
  // Returns: Confirmation message
```

### Timer Management
```typescript
pauseSet(reason: string): string
  // Pauses active set timer while preserving elapsed time
  // reason: Context for voice agent (e.g., "Form check needed")
  // Stops user activity monitoring
  // Returns: Status message

resumeSet(): string
  // Resumes paused set with exact remaining time
  // Accumulates pause duration for accurate timing
  // Restarts user activity monitoring
  // Ensures minimum 5 seconds remaining time

pauseRest(reason: string): string
  // Pauses active rest timer
  // Only available during 'resting' state

resumeRest(): string
  // Resumes rest timer with remaining time
  // Handles both regular sets and last-set scenarios
```

### Real-time Adjustments
```typescript
adjustWeight(newWeight: number, reason: string): string
  // Updates weight for current and future sets
  // Broadcasts change for voice agent context
  // reason: Explanation for adjustment

adjustReps(newReps: number, reason: string): string
  // Updates target reps for current set
  // Does not affect completed sets

adjustRestTime(newRestTime: number, reason: string): string
  // Updates rest duration and recalculates active timers
  // Handles timer transitions for ongoing rest periods
  // Maintains 10-second warning system for non-final sets

extendRest(additionalSeconds: number): string
  // Adds time during 'rest-ending' state
  // Transitions back to 'resting' with extended duration
  // additionalSeconds: Extra time to add (plus 10s warning buffer)
```

### Navigation Controls
```typescript
jumpToSet(targetSetNumber: number): string
  // Navigates to specific set within current exercise
  // targetSetNumber: 1-based set number (converted to 0-based internally)
  // Validates boundaries and clears all timers
  // Transitions to 'preparing' state

// Exercise progression handled automatically:
// - completeExercise(): Internal method triggered by last set completion
// - Advances to next exercise or completes workout
// - Transitions to 'exercise-transition' for user confirmation
```

### State Information
```typescript
getState(): WorkoutState
  // Returns current finite state machine state

getContext(): WorkoutContext | null
  // Returns complete workout context or null if inactive
  // Includes current exercise, set, targets, and timing

isActive(): boolean
  // Returns true if any workout is in progress

isPausedState(): boolean
  // Returns true if set or rest is currently paused

getElapsedTime(): number
  // Returns seconds elapsed in current phase
  // Excludes pause time for accurate measurements

getWorkoutStatus(): string
  // Returns human-readable status summary
  // Format: "Workout: [name] | Exercise [x/y]: [name] | Set [x/y] | State: [state]"
```

### Voice Agent Integration
```typescript
setVoiceAgentStatus(connected: boolean): void
  // Updates voice agent connection status
  // Triggers context sync when agent connects
  // Manages voice agent aware state transitions

isVoiceAgentConnected(): boolean
  // Returns current voice agent connection status

// Callback Registration
setContextUpdateCallback(callback: ContextUpdateCallback | null): void
setUserActivityCallback(callback: (() => void) | null): void
setBeepCallback(callback: BeepCallback | null): void
```

## Data Structure Definitions

### Core Workout Types
```typescript
interface WorkoutSession {
  id: string;                    // Unique session identifier
  name: string;                  // Display name (e.g., "Push Day")
  description: string;           // Workout description
  exercises: Exercise[];         // Ordered exercise sequence
  totalEstimatedDuration: number;// Total workout time estimate (minutes)
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];               // Workout category tags
  createdAt: Date;              // Session creation timestamp
}

interface Exercise {
  id: string;                   // Unique exercise identifier  
  name: string;                 // Exercise name (e.g., "Push-ups")
  description: string;          // Exercise explanation
  type: 'strength' | 'cardio' | 'flexibility';
  muscleGroups: string[];       // Target muscle groups
  sets: WorkoutSet[];           // Ordered set sequence
  videoUrl?: string;            // Demonstration video path
  equipment?: string[];         // Required equipment list
  instructions?: string[];      // Step-by-step instructions
  tips?: string[];              // Form and safety tips
  estimatedDuration: number;    // Exercise duration estimate (minutes)
}

interface WorkoutSet {
  id: string;                   // Unique set identifier
  setNumber: number;            // Set position in exercise (1-based)
  targetReps: number;           // Target repetition count
  targetWeight?: number;        // Target weight (kg, optional)
  targetTime?: number;          // Set duration (seconds, default: 45)
  restTimeAfter: number;        // Rest duration after set (seconds, default: 60)
  isCompleted: boolean;         // Completion status
  actualReps?: number;          // Achieved repetitions (populated on completion)
  actualWeight?: number;        // Actual weight used
  difficulty?: 'easy' | 'medium' | 'hard' | 'impossible'; // User feedback
}
```

### Runtime Context
```typescript
interface WorkoutContext {
  sessionId: string;            // Reference to WorkoutSession.id
  exerciseIndex: number;        // Current exercise position (0-based)
  setIndex: number;             // Current set position (0-based)
  targetReps: number;           // Current set target reps (cached)
  targetWeight?: number;        // Current set target weight (cached)
  timeRemaining?: number;       // Timer remaining time (seconds)
  currentExercise: Exercise;    // Current exercise reference
  currentSet: WorkoutSet;       // Current set reference
}
```

### System Event Structure
```typescript
interface SystemUpdate {
  type: 'SYSTEM';               // Fixed event type identifier
  event: string;                // Event name (e.g., 'set-completed')
  data: any;                    // Event-specific payload
  timestamp: number;            // Event occurrence time (Date.now())
}

// Event-specific data structures
interface SetCompletedData {
  setNumber: number;
  actualReps: number;
  targetReps: number;
  duration: number;             // Working time (excluding pauses)
  totalElapsed: number;         // Total time including pauses
  pauseTime: number;            // Total pause duration
}

interface ExerciseChangedData {
  newExercise: string;
  exerciseIndex: number;
  totalExercises: number;
  description: string;
  sets: number;
  targetReps: number;
  targetWeight?: number;
}

interface WeightAdjustedData {
  from: number;
  to: number;
  reason: string;
}
```

### Callback Type Definitions
```typescript
type ContextUpdateCallback = (update: SystemUpdate) => void;
type BeepCallback = (type: 'start' | 'end') => Promise<boolean>;
type ConversationCallback = (message: string) => void;
type SystemMessageCallback = (message: string) => void;
```

## Event System Architecture

### Event Flow Diagram
```
WorkoutStateMachine ──[SystemUpdate]──► WorkoutContextManager ──┐
                                                                 │
                           ┌─────────────────────────────────────┘
                           │
                           ├──[Response Events]──► systemMessageCallback() ──► Voice Agent (Speech)
                           │
                           └──[Context Events]───► conversationCallback() ───► Voice Agent (Silent)
```

### Complete Event Catalog

#### Lifecycle Events
```typescript
'workout-selected' → {
  workoutName: string;
  exercises: string[];
  currentExercise: string;
}
// Response: Agent introduces workout and first exercise

'workout-completed' → {
  sessionName: string;
  totalTime: number;
}
// Response: Agent celebrates completion and provides summary
```

#### Exercise Management Events
```typescript
'exercise-preparation' → {
  exerciseName: string;
  setNumber: number;
  targetReps: number;
  targetWeight?: number;
}
// Silent: Updates agent context for exercise readiness

'exercise-changed' → {
  newExercise: string;
  exerciseIndex: number;
  totalExercises: number;
  description: string;
  sets: number;
  targetReps: number;
  targetWeight?: number;
}
// Response: Agent explains new exercise and demonstrates form
```

#### Set Lifecycle Events
```typescript
'set-started' → {
  setNumber: number;
  targetReps: number;
  duration: number;
}
// Silent: Timer active, user exercising

'set-completed' → {
  setNumber: number;
  actualReps: number;
  targetReps: number;
  duration: number;      // Working time only
  totalElapsed: number;  // Including pauses
  pauseTime: number;     // Total pause duration
}
// Response: Agent requests feedback ("How did that feel?")

'set-paused' → {
  reason: string;
  workingTimeBeforePause: number;
}
// Silent: Maintains pause awareness

'set-resumed' → {}
// Silent: Timing context updated

'set-restarted' → {}
// Silent: Reset to preparation phase
```

#### Rest Period Events
```typescript
'rest-started' → {
  duration: number;
  setJustCompleted: number;
  isLastSet: boolean;
  currentSetIndex: number;
  totalSets: number;
}
// Silent: Rest timer active, feedback collection period

'rest-ending' → {
  timeRemaining: number;    // Always 10
  nextSetNumber: number;
}
// Response: Agent gives 10-second warning and preparation cues

'rest-extended' → {
  additionalSeconds: number;
}
// Silent: Rest duration increased
```

#### Parameter Adjustment Events
```typescript
'weight-adjusted' → {
  from: number;
  to: number;
  reason: string;
}
// Silent: Agent awareness of difficulty adjustment

'reps-adjusted' → {
  from: number;
  to: number;
  reason: string;
}
// Silent: Agent awareness of target modification

'rest-time-adjusted' → {
  from: number;
  to: number;
  reason: string;
}
// Silent: Agent awareness of recovery time changes
```

#### Voice Agent Events
```typescript
'voice-agent-connected' → {
  contextMessage: string;   // Complete context summary
  workout: string;
  exercise: string;
  exerciseIndex: number;
  totalExercises: number;
  setIndex: number;
  totalSets: number;
  state: WorkoutState;
  targetReps: number;
  targetWeight?: number;
  isSetCompleted: boolean;
  isPaused: boolean;
}
// Response: Agent acknowledges context and offers guidance
```

## Implementation Guide

### System Integration Example
```typescript
import { workoutStateMachine } from './WorkoutStateMachine';
import { workoutContextManager } from './WorkoutContextManager';
import { ConvAIRef } from './ConvAI';

// 1. Initialize the state machine with callbacks
export function initializeWorkoutSystem(convAiRef: ConvAIRef) {
  // Route state machine events through context manager
  workoutStateMachine.setContextUpdateCallback((update) => {
    workoutContextManager.processSystemUpdate(update);
  });
  
  // Connect context manager to voice agent
  workoutContextManager.setConversationCallback((message: string) => {
    // Silent context updates - no speech response
    if (convAiRef && convAiRef.sendWorkoutUpdate) {
      convAiRef.sendWorkoutUpdate(message);
    }
  });

  workoutContextManager.setSystemMessageCallback((message: string) => {
    // Response-triggering events - agent will speak
    if (convAiRef && convAiRef.sendMessage) {
      convAiRef.sendMessage(message);
    }
  });

  // User activity tracking for screen lock prevention
  workoutStateMachine.setUserActivityCallback(() => {
    updateUserActivity(); // App-specific activity tracking
    if (convAiRef && convAiRef.notifyUserActivity) {
      convAiRef.notifyUserActivity();
    }
  });

  // Audio feedback for timer events
  workoutStateMachine.setBeepCallback(async (type: 'start' | 'end') => {
    if (convAiRef && convAiRef.playWorkoutBeep) {
      return await convAiRef.playWorkoutBeep(type);
    }
    return false;
  });

  // Voice agent connection tracking
  if (convAiRef) {
    // Monitor conversation status changes
    const originalStatusHandler = convAiRef.onConversationStatusChange;
    convAiRef.onConversationStatusChange = (status: string) => {
      workoutStateMachine.setVoiceAgentStatus(status === "connected");
      originalStatusHandler?.(status);
    };
  }
}

// 2. Create workout session data
const createWorkoutSession = (): WorkoutSession => ({
  id: generateUniqueId(),
  name: 'Push Day Workout',
  description: 'Upper body strength training session',
  exercises: [
    {
      id: 'push-ups',
      name: 'Push-ups',
      description: 'Standard push-up exercise',
      type: 'strength',
      muscleGroups: ['chest', 'triceps', 'shoulders'],
      videoUrl: './assets/videos/pushups.mp4',
      instructions: [
        'Start in plank position',
        'Lower body until chest nearly touches floor',
        'Push back up to starting position'
      ],
      tips: ['Keep core tight', 'Maintain straight line from head to heels'],
      estimatedDuration: 8,
      sets: [
        {
          id: 'set-1',
          setNumber: 1,
          targetReps: 12,
          targetTime: 45,
          restTimeAfter: 60,
          isCompleted: false
        },
        {
          id: 'set-2', 
          setNumber: 2,
          targetReps: 10,
          targetTime: 45,
          restTimeAfter: 60,
          isCompleted: false
        },
        {
          id: 'set-3',
          setNumber: 3,
          targetReps: 8,
          targetTime: 45,
          restTimeAfter: 120,
          isCompleted: false
        }
      ]
    }
  ],
  totalEstimatedDuration: 15,
  difficulty: 'intermediate',
  tags: ['strength', 'upper-body'],
  createdAt: new Date()
});

// 3. Workout execution flow
export async function startWorkout() {
  const session = createWorkoutSession();
  
  // Initialize workout in state machine
  const success = workoutStateMachine.selectWorkout(session);
  if (!success) {
    throw new Error('Failed to initialize workout session');
  }
  
  // State transitions automatically:
  // inactive → selected → preparing (1s delay)
  
  console.log('✅ Workout initialized:', workoutStateMachine.getWorkoutStatus());
}

// 4. Voice agent tool integration
export const workoutTools = {
  start_set: async (): Promise<string> => {
    const success = workoutStateMachine.confirmReadyAndStartSet();
    return success ? 'Set started! Timer is running.' : 'Cannot start set from current state';
  },

  complete_set: async (params?: { actualReps?: number }): Promise<string> => {
    const actualReps = params?.actualReps;
    const success = workoutStateMachine.completeSet(actualReps);
    return success ? `Set completed with ${actualReps || 'target'} reps!` : 'Cannot complete set from current state';
  },

  pause_set: async (params?: { reason?: string }): Promise<string> => {
    const reason = params?.reason || 'Agent requested pause';
    return workoutStateMachine.pauseSet(reason);
  },

  get_workout_status: async (): Promise<string> => {
    return workoutStateMachine.getWorkoutStatus();
  }
};

// 5. Error handling and cleanup
export function cleanupWorkoutSystem() {
  workoutStateMachine.cleanup();
  workoutContextManager.setConversationCallback(null);
  workoutContextManager.setSystemMessageCallback(null);
}
```

### Expected Event Sequence for Typical Workout
```
1. selectWorkout() 
   → 'workout-selected' (Response: "Welcome to Push Day! Let's start with push-ups...")
   
2. Auto-transition to preparing (1s delay)
   → 'exercise-preparation' (Silent: context update)

3. confirmReadyAndStartSet()
   → 'set-started' (Silent: timer begins)
   
4. Timer expires or manual complete
   → 'set-completed' (Response: "Great set! How did that feel?")
   
5. Auto-transition to rest
   → 'rest-started' (Silent: rest timer begins)
   
6. Rest timer expires (except last set)
   → 'rest-ending' (Response: "10 seconds! Get ready for your next set!")
   
7. confirmReadyAndStartSet() during rest-ending
   → Next set begins or exercise completes
   
8. If last set completed:
   → 'exercise-changed' (Response: "Moving on to [next exercise]...")
   
9. Workout completion:
   → 'workout-completed' (Response: "Amazing workout! You completed all exercises!")
```

## Error Handling & Recovery

### Error Categories and Handling
```typescript
// State Validation Errors
if (this.state !== 'exercising') {
  console.warn(`Cannot pause set from state: ${this.state}`);
  return 'No active set to pause';
}

// Context Validation Errors  
if (!this.context) {
  console.error('Operation attempted without active workout context');
  return 'No active workout to adjust';
}

// Boundary Validation Errors
const targetSetIndex = targetSetNumber - 1;
if (targetSetIndex < 0 || targetSetIndex >= totalSets) {
  console.error(`Invalid set jump: ${targetSetNumber} (valid: 1-${totalSets})`);
  return `Invalid set number. This exercise has ${totalSets} sets (1-${totalSets})`;
}

// Timer Cleanup on State Changes
private transitionTo(newState: WorkoutState): void {
  console.log(`🔄 [State Machine] ${this.state} → ${newState}`);
  
  // Critical: Clear timers before state change to prevent race conditions
  if (newState === 'exercise-transition' || newState === 'inactive') {
    this.clearAllTimers();
  }
  
  this.state = newState;
}
```

### Recovery Mechanisms
- **Timer Conflicts**: All timers cleared before major state transitions
- **Connection Loss**: Voice agent disconnection handled gracefully
- **Invalid Operations**: Descriptive error messages returned instead of exceptions
- **State Corruption**: Cleanup method available for emergency reset

## Performance Characteristics

### Memory Management
- **Singleton Pattern**: Single instance prevents memory leaks
- **Timer Cleanup**: Automatic cleanup prevents resource accumulation
- **Callback Management**: Null-safe callback handling
- **Event Debouncing**: System updates throttled to prevent spam

### Timing Precision
- **Millisecond Accuracy**: Uses `Date.now()` for precise timing
- **Pause Accumulation**: Multiple pause cycles accurately tracked
- **Race Condition Prevention**: Timer clearing synchronized with state changes
- **Minimum Duration Enforcement**: Prevents extremely short timer durations

## Architectural Patterns

### Singleton Implementation
```typescript
export class WorkoutStateMachine {
  private static instance: WorkoutStateMachine;
  private instanceId: string = Math.random().toString(36).substr(2, 9);

  public static getInstance(): WorkoutStateMachine {
    if (!WorkoutStateMachine.instance) {
      WorkoutStateMachine.instance = new WorkoutStateMachine();
    }
    return WorkoutStateMachine.instance;
  }
}

export const workoutStateMachine = WorkoutStateMachine.getInstance();
```

### Observer Pattern (Callbacks)
```typescript
// State machine notifies multiple observers
this.sendSystemUpdate('set-completed', data);
  ↓
workoutContextManager.processSystemUpdate(update);
  ↓
[conversationCallback, systemMessageCallback]
  ↓
Voice Agent receives context or speech trigger
```

### Command Pattern (Tool Integration)
```typescript
// Voice agent tools map to state machine commands
const workoutTools = {
  start_set: () => workoutStateMachine.confirmReadyAndStartSet(),
  pause_set: (params) => workoutStateMachine.pauseSet(params.reason),
  adjust_weight: (params) => workoutStateMachine.adjustWeight(params.weight, params.reason)
};
```

## Threading and Concurrency

### JavaScript Event Loop Integration
- **setTimeout Management**: All timers registered with event loop
- **Callback Synchronization**: Ensures callbacks execute in correct order
- **State Consistency**: State changes atomic within event loop ticks
- **Race Condition Prevention**: Critical sections protected by state validation

### Async/Await Compatibility
```typescript
// All tool methods return Promises for voice agent integration
async start_set(): Promise<string> {
  const success = workoutStateMachine.confirmReadyAndStartSet();
  return success ? 'Set started!' : 'Cannot start set';
}
```

## Integration Best Practices

### 1. Initialization Sequence
```typescript
// Correct order prevents callback registration issues
1. Initialize state machine callbacks
2. Initialize context manager callbacks  
3. Initialize voice agent
4. Start workout session
```

### 2. Error Handling Strategy
```typescript
// Always check return values and handle gracefully
const result = workoutStateMachine.pauseSet('Form check');
if (result.includes('Cannot')) {
  // Handle error case
  showUserMessage('Unable to pause set right now');
} else {
  // Handle success case
  showUserMessage(result);
}
```

### 3. Cleanup Protocol
```typescript
// Proper cleanup prevents resource leaks
useEffect(() => {
  return () => {
    workoutStateMachine.cleanup();
    workoutContextManager.setConversationCallback(null);
    workoutContextManager.setSystemMessageCallback(null);
  };
}, []);
```

### 4. Voice Agent Integration
```typescript
// Handle connection state changes
useEffect(() => {
  if (conversationStatus === "connected") {
    workoutStateMachine.setVoiceAgentStatus(true);
  } else {
    workoutStateMachine.setVoiceAgentStatus(false);
  }
}, [conversationStatus]);
```

## Security Considerations

### Input Validation
- Set/exercise indices validated against bounds
- Weight/rep values validated for reasonable ranges
- Timer durations clamped to safe minimums/maximums

### Resource Protection
- Timer cleanup prevents resource exhaustion
- Callback null-checking prevents crashes
- State validation prevents invalid operations

## Testing Strategy

### Unit Test Coverage
- State transition validation
- Timer accuracy verification
- Pause/resume time calculations
- Error condition handling
- Boundary value testing

### Integration Test Scenarios
- Complete workout flow execution
- Voice agent connection/disconnection cycles
- Parameter adjustment during active timers
- Navigation between sets/exercises
- Error recovery from invalid states

This technical specification provides a complete foundation for implementing, maintaining, and extending the WorkoutStateMachine system for sophisticated voice-guided fitness applications.