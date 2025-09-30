import { createClient } from "@supabase/supabase-js";
import { task, tasks } from "@trigger.dev/sdk";
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import type { generateExerciseProfileTask } from './exercise-profile-generation';

const systemPrompt = `
✅ FINAL SYSTEM PROMPT – FULL WORKOUT PROGRAMMING GUIDE (v5.1)

🧱 1. GENERAL WORKOUT GUIDELINES

Gym training follows classic progression principles.

Use full gym equipment when applicable.

Respect client goals and muscle-group preferences.

❌ Do not mix upper and lower body in a single exercise.

🚫 2. EXECUTION RULES

❌ No supersets or circuit training.

❌ Warm-up is never part of the workout plan.

❌ Cardio equipment is never included.

✅ Rest between sets = 90 seconds.

✅ Set duration = ~60 seconds of “work”.

Push-Ups:

✅ Only use flat-hand or feet-elevated push-up variations.

❌ Never use the term “incline push-ups.”

Substitutions:

Bench Press → Push-Ups (Regular or Feet-Elevated)

Incline Bench → Feet-Elevated Push-Ups

Range of Motion:

Increase only if appropriate.

❌ Never increase ROM for shoulder-based exercises.

Isolation:

❌ No isolation exercises without external load, unless used during warm-up (note: warm-up is not part of the plan).

⚠️ Unilateral Exercise Rule:

Unilateral movements (e.g., Side-Lying Leg Raise [Right] + [Left]) count as one exercise, not two.

❌ Never separate sides into two entries.

🧗‍♂️ 3. ADAPTATION PHASE (FOR BEGINNERS)
Use if:

Client is new → 6 weeks

Client is returning → 4 weeks

Programming:

Use the same exercises as the standard plan.

Reps: 10–15

Intensity: Low to moderate

Avoid explosive or high-complexity movements.

🧩 4. FALLBACK RULE – DEADLIFT/SQUAT SPACING

✅ Use machine-based leg alternatives if spacing is an issue (e.g., Leg Press, Leg Curl, Leg Extension).

❌ No high-impact, CNS-fatiguing substitutions as a workaround.

💪 5. ADVANCED USERS

Include unilateral and complex compound movements.

Add tempo/intensity variations.

Use progressive overload unless client feedback indicates otherwise.

🏋️ 6. PROGRESSION GUIDELINES

Type	Reps
Compound Movements	6–8
Free Weights	8–12
Isolation Work	10–15

➡️ Increase weight once max reps are achieved for a given range.

🧩 7. PROGRAM STRUCTURE

Duration	Exercises per Session
45 min	4
60 min	6
90 min	9

Week 1 = Unique workouts

Weeks 2–8 = Repeat Week 1

📅 8. DAY SORTING RULE

✅ Always sort training days chronologically (e.g., Monday → Wednesday → Friday).

❌ Never use Friday → Monday → Wednesday.

⏱ 9. TIME STRUCTURE

Each exercise = 4 sets

Each set ≈ 60 seconds

Each exercise ≈ 10 minutes

📌 10. PROGRAMMING RULES

Reps = filled for Week 1 only.

Reps = blank for Weeks 2–8.

Weight = always blank.

Time = used only for isometric core exercises.

✅ Allowed Isometric Core Exercises

Exercise	Time	Reps	Notes
Plank	30 sec	—	Keep core tight
Side Plank	30 sec	—	Keep core tight
Bird Dog Hold	30 sec	—	Keep core tight
Plank Shoulder Taps	30 sec	—	Keep core tight

📄 11. JSON OUTPUT FORMAT
Add a "Day Name" column before "Day". Populate it with the session type based on the split (e.g., Push, Pull, Legs, Full-Body, Upper, Lower, Chest, Back, Shoulders, Arms, Core, Hypertrophy, Recovery). This column is required for every entry.
\`\`\`json
{
  "dayName": "Push",
  "day": "Monday", 
  "exercise": "Bench Press",
  "sets": 4,
  "reps": "8–12",
  "weight": "",
  "time": "30 sec",
  "equipment": "Barbell, Bench",
  "notes": "Tempo 3-1-1, full ROM",
  "streakExercise": "Push-Ups (Feet-Elevated)",
  "streakExerciseEquipment": "Elevated Surface", 
  "streakExerciseNotes": "Tempo 2-1-1"
}

\`\`\`

🧗‍♂️ 12. STREAK DAYS (HOME SUBSTITUTIONS)

Max 3 per 8-week plan.

Must match: number of exercises, biomechanics, and target muscles.

Use only home-available equipment.

✅ Streak Exercise fields must always be filled.

❌ Never duplicate streak exercises within a single day.

✅ NEW RULE – Streak Equipment Check

❗ Streak Exercise Equipment must never include gear the client did not explicitly list in their home questionnaire.

✅ If the client has no home equipment, all streak exercises must use bodyweight only.

❌ Do not assume access to bands, dumbbells, kettlebells, benches, or chairs.

✅ Always validate streak substitutions against the client’s declared equipment.

📆 13. TRAINING DAY RULES

Frequency	Rule / Example
1×/week	Any day
2×/week	At least 1 rest day between sessions
3×/week	Prefer 1 rest day between (e.g., Mon–Wed–Fri)
4×/week	2 on → 1 rest → 2 on
5×/week	Rest days only on Wednesday and Sunday
6×/week	3 on → 1 rest → 3 on
7×/week	No rest days

➡️ Legs = min 2 days apart.

➡️ Deadlift/Squat = follow spacing rules.

➡️ Once set, training days stay fixed unless requested.

🔄 14. SPECIAL CASE RULES

✅ SPLIT PROTOCOL BY FREQUENCY

Frequency	Rule
1–2×/week	Full-Body only
3×/week	Push / Pull / Legs (default)
✅ Exception: Full-Body allowed only if client requests
4×/week	Push / Pull / Legs / Full-Body
5×/week	Upper / Lower / Full-Body / Hypertrophy / Recovery
6×/week	Push / Pull / Legs / Push / Pull / Legs
7×/week	Chest / Back / Shoulders / Legs / Arms / Core / Full-Body

🎯 50% FOCUS RULE (Full-Body Days Only)

May apply to only one full-body day per week.

All other full-body days must be well-balanced.

🔁 Full-Body Day Rule
Each full-body session must include:
✅ One Push • ✅ One Pull • ✅ One Leg • ✅ One Core
→ All movements should be compound, unless limited by injury.

✅ VALIDATION RULE

Each full-body session must be programmatically checked: Push, Pull, Leg, Core present.

⚠️ If any category is missing, the plan is invalid and must be restructured.

✅ VALIDATION CHECKPOINTS (MUST BE ENFORCED)

❗ Deadlift ↔ Squat = 1+ full rest day in between.

❗ Deadlift → Deadlift = 2+ days apart.

❗ Squat → Squat = 2+ days apart.
Fallback if spacing not possible:

✅ Use machine-based leg exercise instead of deadlift/squat.

❌ Never schedule back-to-back CNS compound lifts.

❌ Never ignore spacing in favor of split or volume.

✅ LEG TRAINING

Always include leg work unless client opts out.

Respect DOMS spacing and fallback rules.

✅ DEADLIFT RULE

All barbell deadlifts = Leg/Glute, not Back.

✅ LEG CURL RULE

Treat Leg Curl (Lying) as isotonic.

Fill Reps, leave Time blank.

✅ STREAK EXERCISE UNIQUENESS

Streak exercises must be unique per session.

❌ Never repeat within the same workout.

✅ NO WEEKLY REPEATS

No exercise should appear more than once per week.

✅ BACK-DAY LOGIC

Back = pulldowns, pull-ups, rows, cable pulls.

❌ Back Extensions = glute/hamstring, not back.

✅ BACK FOCUS (4×/week plans)

Exactly 12 back-focused exercises, spread across 3 of the 4 training days.

✅ LOW-SORENESS CLIENTS

Emphasize: machines, core, posterior chain, control.

Avoid eccentric overload early in the week.

🏋️ EXERCISE POOL – APPROVED LIST

This section contains the complete allowed list of exercises to choose from when generating the gym training plan. Below it is the list of streak exercises.

<EXERCISE POOL>
Seated Dumbbell Shoulder Abduction		
		
Seated Dumbbell Shoulder Flexion		
		
Seated unilateral Dumbbell Biceps Curls		
		
Seated unilateral Dumbbell Hammer Curls		
		
Shoulder Press Machine Unilateral		
		
Shoulder Press Machine		
		
Side Plank (Timed)		
		
Side-Lying Clamshells		
		
Side-Lying Hip Abduction (Banded)		
		
Side-Lying Hip Abduction		
		
Sit-Ups		
		
Skull Crusher (Barbell)		
		
Skull Crusher (EZ Bar)		
		
Smith Machine Bench Press		
		
Smith Machine Decline Bench Press		
		
Smith Machine Incline Bench Press		
		
Smith Machine Split Squat		
		
Smith Machine Squat		
		
Split Squat with Impulse (Dumbbell)		
		
Split Stance RDL (Dumbbell)		
		
Standing Dumbbell Arnold Press		
		
Standing Cable Torso Rotations		
		
Standing Calf Raise Machine		
		
Standing Clamshells		
		
Standing Dumbbell Overhead Press Neutral Grip		
		
Standing Dumbbell Overhead Press		
		
Standing Dumbbell Shoulder Abduction		
		
Standing Dumbbell Shoulder Flexion		
		
Standing Hip Extension Cable		
		
Standing Shoulder Abduction Machine		
		
Stiff-Leg Deadlift (Barbell)		
		
Superman		
		
Swiss Ball Crunches		
		
Trap Bar Deadlift		
		
TRX Rows		
		
Unilateral Dumbbell Shoulder Abduction		
		
Unilateral Dumbbell Shoulder Flexion		
		
Unilateral Dumbbell Upright Row		
		
Upright Row (Barbell)		
		
Walking Lunges with Impulse (Dumbbell)		
		
Wall Sits (Timed)		
		
Wide Grip T-Bar Cable Row		
		
Zercher Squat		
		
Alternating Dumbbell Shoulder Flexion		
		
Alternating Superman		
		
Assisted Chin-Ups		
		
Assisted Dips		
		
Assisted Pull-Ups		
		
Back Extension		
		
Band Shoulder Abduction Alternating		
		
Band Shoulder Abduction Unilateral		
		
Band Shoulder Abduction		
		
Band Shoulder Flexion Alternating		
		
Band Shoulder Flexion Unilateral		
		
Band Shoulder Flexion		
		
Banded Horizontal Abduction		
		
Banded Squats		
		
Barbell Bench Press		
		
Barbell Deadlift		
		
Barbell Front Squat		
		
Barbell Split Squat		
		
Barbell Squat		
		
Behind-the-Head Cable Triceps Extensions Unilateral		
		
Behind-the-Head Cable Triceps Extensions		
		
Bent-Over Row (Barbell)		
		
Biceps Curls (Barbell)		
		
Biceps Curls (EZ Bar)		
		
Cable Biceps Curls Unilateral		
		
Cable Biceps Curls		
		
Cable Chest Fly Unilateral		
		
Cable Chest Fly		
		
Cable Crunches		
		
Cable Face Pull Down		
		
Cable Hammer Curls Unilateral		
		
Cable Hammer Curls		
		
Cable Lat Pulldown Neutral Grip		
		
		
		
Cable Lat Pulldown Underhand		
		
Cable Lat Pulldown Unilateral		
		
Cable Lat Pulldown		
		
Cable Pullover		
		
Cable Row Neutral		
		
Cable Row Unilateral		
		
Cable Row		
		
Cable Shoulder Abduction Unilateral		
		
Cable Shoulder Abduction		
		
Cable Shoulder Flexion Unilateral		
		
Cable Shoulder Flexion		
		
Cable Triceps Extensions Unilateral		
		
Cable Triceps Extensions		
		
Chin-Ups		
		
Copenhagen Plank (Timed)		
		
Crunches		
		
Decline Bench Press (Barbell)		
		
Dumbbell Alternating Overhead Press		
		
Dumbbell Bench Press		
		
Dumbbell Bent-Over Reverse Fly		
		
Dumbbell Chest Fly		
		
Face Pull (Cable)		
		
Fly Machine		
		
Glute Bridge Isometric Hold (Timed)		
		
Glute Bridge March		
		
Glute Bridge Unilateral		
		
Glute Bridge		
		
Goblet Squat with Impulse		
		
Gorilla Row (Kettlebell or Dumbbell)		
		
Hack Squat Machine		
		
Hamstring Bridge Isometric Hold (Timed)		
		
Hamstring Bridge Unilateral		
		
Hamstring Bridge		
		
Hanging Leg Raises		
		
Hip Abduction (Cable)		
		
Hip Adduction (Cable)		
		
Incline Bench Press (Barbell)		
		
Incline Chest Press Machine		
		
Isometric Hold (Timed)		
		
Knee Extension Machine		
		
Knee Extension Unilateral		
		
Knee Flexion Machine		
		
Knee Flexion Unilateral		
		
Kneeling Cable Torso Rotations		
		
Kneeling One-Leg Cable Torso Rotations		
		
Landmine Anti-Rotations		
		
Landmine Oblique Twist		
		
Leg Press		
		
Leg Raises		
		
Overhand Biceps Curl (EZ Bar)		
		
Overhand Biceps Curls (Barbell)		
		
Overhand Cable Biceps Curls		
		
Overhead Press (Barbell)		
		
Pendlay Row (Barbell)		
		
Plank (Timed)		
		
Prisoner Squats		
		
Prone Angels		
		
Psoas March		
		
Pull-Ups		
		
Push-Ups		
		
Quadruped Kickback Cable		
		
Romanian Deadlift (Barbell)		
		
Russian Twist		
		
Seated Alternating Dumbbell Biceps Curls		
		
Seated Alternating Dumbbell Hammer Curls		
		
Seated Calf Raise Machine		
		
Seated Dumbbell Arnold Press		
		
Seated Dumbbell Biceps Curls		
		
Seated Dumbbell Hammer Curls		
		
Seated Dumbbell Overhead Press		
		
Seated Dumbbell Overhead Press Neutral Grip		
		
Seated Dumbbell Shoulder Abduction		
		
Dumbbell Bent-Over Row		
		
Dumbbell Box Step-Down		
		
Dumbbel Box Step-Up		
		
Dumbbell Bulgarian Split Squat		
		
Dumbbell Decline Bench Press		
		
Dumbbell Goblet Squat		
		
Dumbbell Hip Thrust		
		
Dumbbell Incline Benchh Press		
		
Dumbbell Neutral Grip Bench Press		
		
Dumbbell Overhand Biceps Curls		
		
Dumbbell Prone Reverse Fly		
		
Dumbbell Prone Row Alternating		
		
Dumbbell Prone Row		
		
Dumbbell Shoulder Abduction		
		
Dumbbell Skull Crusher Unilateral		
		
Dumbbell Skull Crusher		
		
Dumbbell Split Squat		
		
Dumbbell Unilateral Row		
		
Dumbbell Walking Lunges		
</EXERCISE POOL>
`

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Create Supabase client with service role key for admin access
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Define the workout entry schema based on the CSV format
const WorkoutEntry = z.object({
    dayName: z.string(), // Required: Push, Pull, Legs, Full-Body, etc.
    day: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]), // Required: Monday, Tuesday, etc.
    exercise: z.string(), // Required: Exercise name
    sets: z.number(), // Required: Always 4 per prompt rules
    reps: z.string(), // Required: Always filled with ranges like "8-12"
    weight: z.string(), // Always empty string per prompt rules - make it required but empty
    time: z.string(), // Only filled for isometric core exercises - make it required but can be empty
    equipment: z.string(), // Required: Equipment needed
    notes: z.string(), // Optional additional notes - make it required but can be empty
    streakExercise: z.string(), // Required: Always filled per prompt rules
    streakExerciseEquipment: z.string(), // Required: Home equipment only
    streakExerciseNotes: z.string(), // Optional streak notes - make it required but can be empty
  });

const WorkoutResponse = z.object({
  summary: z.string(),
  entries: z.array(WorkoutEntry),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Helper function to ensure exercise exists in database
async function ensureExerciseExists(exerciseName: string): Promise<string> {
  try {
    console.log('Processing exercise:', exerciseName);

    // Trigger the exercise profile generation task
    const result = await tasks.triggerAndWait<typeof generateExerciseProfileTask>(
      "generate-exercise-profile",
      { exerciseName }
    );

    if (!result.ok) {
      throw new Error(`Exercise profile generation failed: ${result.error}`);
    }

    return result.output.exercise_id;
  } catch (error) {
    console.error('Error ensuring exercise exists:', error);
    throw error;
  }
}

function addData(workoutPlan: z.infer<typeof WorkoutResponse>) {
  const today = new Date();
  const nextMonday = new Date(today);

  // Find next Monday
  const daysUntilMonday = (8 - today.getDay()) % 7;
  nextMonday.setDate(today.getDate() + daysUntilMonday);

  // Set start date to next Monday
  const startDate = nextMonday;

  // Add dates to each entry based on the day of week
  const entriesWithDates = workoutPlan.entries.map((entry) => {
    const dayIndex = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].indexOf(entry.day);
    const workoutDate = new Date(startDate);
    workoutDate.setDate(startDate.getDate() + dayIndex);

    return {
      ...entry,
      date: workoutDate.toISOString().split('T')[0], // YYYY-MM-DD format for PostgreSQL
      exercise_id: slugify(entry.exercise),
      streakExercise_id: slugify(entry.streakExercise)
    };
  });

  return {
    summary: workoutPlan.summary,
    entries: entriesWithDates
  };
}

// Helper function to update progress in database
async function updateProgress(requestId: string, currentStep: number, totalSteps: number, stepDescription: string, exercisesTotal: number = 0, exercisesCompleted: number = 0) {
  try {
    await supabase
      .from('workout_plan_requests')
      .update({
        current_step: currentStep,
        total_steps: totalSteps,
        step_description: stepDescription,
        exercises_total: exercisesTotal,
        exercises_completed: exercisesCompleted
      })
      .eq('request_id', requestId);
    
    console.log(`Progress updated: Step ${currentStep}/${totalSteps} - ${stepDescription} (Exercises: ${exercisesCompleted}/${exercisesTotal})`);
  } catch (error) {
    console.error('Failed to update progress:', error);
  }
}

export const generateWorkoutPlanTask = task({
  id: "generate-workout-plan",
  run: async (payload: { userProfile: string, userId: string, requestId: string }) => {
    try {
      console.log('Starting background workout plan generation for request:', payload.requestId);

      // Update progress: Step 1 - Generating workout plan
      await updateProgress(payload.requestId, 1, 3, 'Generating your personalized workout plan...');

      // Step 1: Generate workout plan
      const response = await openai.responses.parse({
        model: 'gpt-5',
        input: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: payload.userProfile
          }
        ],
        reasoning: {
          effort: "medium"
        },
        text: {
          format: zodTextFormat(WorkoutResponse, 'workout_plan'),
        },
      });

      const workoutPlan = response.output_parsed;
      if (!workoutPlan) {
        throw new Error('Failed to parse workout plan');
      }

      const workoutPlanWithData = addData(workoutPlan);
      console.log('Workout plan generated, now ensuring exercises exist...');

      // Update progress: Step 2 - Creating workout structure
      await updateProgress(payload.requestId, 2, 3, 'Creating your workout structure...');

      // Step 2: Extract unique exercises by SLUG and ensure they exist in database
      const uniqueExerciseSlugs = new Set<string>();
      const exerciseNameToSlug: Record<string, string> = {};

      for (const entry of workoutPlanWithData.entries) {
        const exerciseSlug = slugify(entry.exercise);
        const streakSlug = slugify(entry.streakExercise);

        uniqueExerciseSlugs.add(exerciseSlug);
        uniqueExerciseSlugs.add(streakSlug);

        exerciseNameToSlug[entry.exercise] = exerciseSlug;
        exerciseNameToSlug[entry.streakExercise] = streakSlug;
      }

      console.log('Found', uniqueExerciseSlugs.size, 'unique exercise slugs');
      
      // Update progress: Step 3 - Starting exercise profile generation
      await updateProgress(payload.requestId, 3, 3, 'Generating detailed exercise profiles...', uniqueExerciseSlugs.size, 0);

      // Step 3: Ensure all exercises exist (process sequentially but with concurrency at task level)
      const exerciseIds: Record<string, string> = {};
      console.log('Ensuring all exercises exist...');

      // Process exercises sequentially (Trigger.dev handles concurrency at task level)
      let exercisesCompleted = 0;
      for (const slug of uniqueExerciseSlugs) {
        // Find any exercise name that maps to this slug
        const exerciseName = Object.keys(exerciseNameToSlug).find(name =>
          exerciseNameToSlug[name] === slug
        )!;

        console.log('Processing exercise slug:', slug, 'with name:', exerciseName);
        const exerciseId = await ensureExerciseExists(exerciseName);
        exerciseIds[slug] = exerciseId; // Store by slug, not exercise name
        
        // Update progress after each exercise is processed
        exercisesCompleted++;
        await updateProgress(
          payload.requestId, 
          3, 
          3, 
          `Generating exercise profiles... (${exercisesCompleted}/${uniqueExerciseSlugs.size})`, 
          uniqueExerciseSlugs.size, 
          exercisesCompleted
        );
      }

      console.log('All exercises ensured, now inserting workout plan...');

      // Step 4: Insert workout plan
      const { data: planData, error: planError } = await supabase
        .from('workout_plans')
        .insert({
          user_id: payload.userId,
          summary: workoutPlanWithData.summary,
          start_date: new Date().toISOString().split('T')[0], // Today
          status: 'active'
        })
        .select()
        .single();

      if (planError) throw planError;

      // Step 5: Insert workout entries for all 8 weeks
      const allEntries = [];
      
      // Calculate start date for the workout plan (next Monday from today)
      const today = new Date();
      const nextMonday = new Date(today);
      const daysUntilMonday = (8 - today.getDay()) % 7;
      nextMonday.setDate(today.getDate() + daysUntilMonday);
      
      for (let week = 1; week <= 8; week++) {
        for (const entry of workoutPlanWithData.entries) {
          // Calculate the proper date for this week and day
          const dayIndex = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].indexOf(entry.day);
          const weekStartDate = new Date(nextMonday);
          weekStartDate.setDate(nextMonday.getDate() + ((week - 1) * 7)); // Add weeks
          weekStartDate.setDate(weekStartDate.getDate() + dayIndex); // Add days within week
          
          const workoutDate = weekStartDate.toISOString().split('T')[0]; // YYYY-MM-DD format
          
          allEntries.push({
            workout_plan_id: planData.id,
            week_number: week,
            day_name: entry.dayName,
            day: entry.day.toLowerCase(),
            date: workoutDate, // Use calculated date for this specific week
            exercise_id: exerciseIds[slugify(entry.exercise)],
            sets: entry.sets,
            reps: entry.reps,
            weight: entry.weight,
            time: entry.time,
            equipment: entry.equipment,
            notes: entry.notes,
            streak_exercise_id: exerciseIds[slugify(entry.streakExercise)],
            streak_exercise_equipment: entry.streakExerciseEquipment,
            streak_exercise_notes: entry.streakExerciseNotes,
            is_adjusted: false
          });
        }
      }

      const { error: entriesError } = await supabase
        .from('workout_entries')
        .insert(allEntries);

      if (entriesError) throw entriesError;

      // Step 6: Update status to completed - this will trigger real-time notification
      await supabase
        .from('workout_plan_requests')
        .update({
          status: 'completed',
          workout_plan_id: planData.id,
          completed_at: new Date().toISOString(),
          current_step: 3,
          total_steps: 3,
          step_description: 'Your personalized workout plan is ready!',
          exercises_total: uniqueExerciseSlugs.size,
          exercises_completed: uniqueExerciseSlugs.size
        })
        .eq('request_id', payload.requestId);

      console.log('Workout plan generation completed successfully for request:', payload.requestId);

      return {
        success: true,
        workoutPlanId: planData.id,
        requestId: payload.requestId
      };

    } catch (error) {
      console.error('Error in background processing:', error);

      // Update status to failed with progress info
      await supabase
        .from('workout_plan_requests')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : String(error),
          completed_at: new Date().toISOString(),
          step_description: 'Generation failed. Please try again.'
        })
        .eq('request_id', payload.requestId);

      throw error; // Re-throw to trigger the outer catch
    }
  },
});