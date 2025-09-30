import { createClient } from "@supabase/supabase-js";
import { task } from "@trigger.dev/sdk";
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Create Supabase client with service role key for admin access
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Exercise profile schema - matches your Supabase function structure
const ExerciseProfileSchema = z.object({
  exercise_name: z.string(),
  exercise_icon_description: z.string(),
  exercise_instructions: z.string(),
  exercise_video_description: z.string(),
  required_equipment: z.string(),
  workout_location: z.string(),
  rep_limitations_progression_rules: z.string(),
  progression_by_client_feedback: z.string(),
  pain_injury_protocol: z.string(),
  special_rules_by_location: z.string(),
  trainer_notes: z.string(),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export const generateExerciseProfileTask = task({
  id: "generate-exercise-profile",
  queue: {
    concurrencyLimit: 2, // Process up to 2 exercise profiles at a time
  },
  run: async (payload: { exerciseName: string }) => {
    const exerciseId = slugify(payload.exerciseName);

    try {
      // First check if exercise already exists using slug
      const { data: existingExercise, error: checkError } = await supabase
        .from('exercises')
        .select('id, name')
        .eq('slug', exerciseId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingExercise) {
        console.log(`Exercise ${payload.exerciseName} already exists with ID: ${exerciseId}`);
        return { exercise_id: existingExercise.id, created: false };
      }

      console.log(`Generating profile for new exercise: ${payload.exerciseName}`);

      // Generate exercise profile with OpenAI using your system prompt


      const systemPrompt = `✅ SYSTEM PROMPT FOR GENERATING AN EXERCISE PROFILE (GYM & HOME) – EXTENDED VERSION 🔧 INSTRUCTION FOR THE EXERCISE GENERATOR:

      Based on the exercise name and the workout location (gym, home, or both), generate a complete exercise profile that includes the points below and fully follows these rules.
      
      Exercise Name
      
      Write the official name of the exercise + the standard rep range.
      
      Rep Range Rules:
      
      Barbell exercises: 6–10 reps
      
      Exception: core barbell exercises (e.g., barbell oblique twists, barbell roll-outs) → 8–15 reps
      
      Dumbbell exercises & TRX (suspension trainers): 8–12 reps
      
      Machine, cable-based exercises & core bodyweight exercises: 10–15 reps
      
      Bodyweight compound exercises (difficult ones like pull-ups, chin-ups, pike push-ups): 6–10 reps
      
      Rule: Always stay within the given rep range.
      
      Example: Barbell Squat (6–10 reps) – perform only 6, 7, 8, 9, or 10 reps.
      
      Exercise Icon
      
      Short description of the icon shown in the before workout screen.
      
      Must clearly indicate the exercise movement.
      
      Example: Silhouette of a person holding a barbell across the shoulders in the bottom position of a squat.
      
      Exercise Screenshot
      
      Short description of a single frame taken from the exercise video.
      
      Must show a key execution moment.
      
      Example: User at the lowest position of a squat, barbell on shoulders, thighs parallel to the floor.
      
      Exercise Instructions
      
      Use the same structure below, but tailor the instructions to the specific exercise (e.g., squat, barbell row, deadlift) so the client fully understands.
      
      Rule: Mark each sentence with ordinal numbers in ascending order (1st, 2nd, 3rd, ...).
      
      Format for exercise_instructions field: Start directly with the numbered sentences (1st, 2nd, 3rd, …), followed by the "✅ Key Form Tips:" line(s). Do not include any heading or preface.
      
      Examples:
      
      A) Barbell Squat (6–10 reps)
      
      (1st) Set bar slightly below shoulder height, grasp just outside shoulder width, place across upper back, unrack, step back to hip‑width stance with slight toe‑out. (2nd) Brace: big breath, ribs over pelvis, light glute squeeze, chest proud without over‑arching. (3rd) Initiate by pushing hips back slightly while bending knees to track over toes; keep whole foot rooted. (4th) Descend under control to at least parallel (or deepest position with neutral spine/heels down). (5th) Drive up through midfoot/heel, extend knees/hips together, exhale near top, re‑brace between reps.
      
      ✅ Key Form Tips: Knees over toes; breathe‑brace each rep; avoid heel lift, excessive lean, losing brace, bouncing.
      
      B) Incline Dumbbell Press (8–12 reps)
      
      (1st) Set bench ~30–45°, bring DBs to thighs, lie back and kick into start above upper chest. (2nd) Feet planted; gently retract/depress shoulder blades; ribs stacked (moderate—not exaggerated—arch). (3rd) Inhale and lower DBs toward upper chest on a controlled path, forearms vertical, elbows ~30–60°. (4th) Pause lightly just above chest; wrists neutral; maintain scapular set. (5th) Exhale and press up on a slight inward arc to near‑lockout without slamming; re‑brace. (6th) Finish safely by returning DBs to thighs; avoid dropping.
      
      C) Bent-Over Row (DB or KB) — Underhand Grip, Unilateral (8–12 reps per side)
      
      (1st) Set up one knee/hand on bench (or split stance with hand brace), hinge torso ~30–45° from horizontal, spine neutral. (2nd) Hold DB/KB with underhand grip (palm up) in working hand; arm hangs under shoulder. (3rd) Inhale and brace (ribs over pelvis); shoulders away from ears; stable base. (4th) Pull by depressing/retracting shoulder, then drive elbow toward hip; forearm near vertical; load close to side. (5th) Brief pause near lower ribs/upper abdomen without twisting/shrugging; exhale and lower under control to straight arm. (6th) Maintain torso angle and neutral spine; complete all reps on one side, then switch.
      
      Required Equipment
      
      List all required equipment.
      
      For barbell: Adding weight means +X kg per side of the bar.
      
      For dumbbell: Adding weight means +X kg per side (that means X kg heavier dumbbells on each side).
      
      For cable and machine-based exercises: Adding weight means +X kg per weight stack.
      
      Example: Bodyweight (home) / Barbell with weights (gym).
      
      Workout Location
      
      State one of the following:
      
      Gym only (due to machines or heavy equipment)
      
      Home only (no gym required)
      
      Both gym and home
      
      Rep Limitations & Progression Rules
      
      Always stay within rep range.
      
      Adaptation phase (beginner): use 12–15 reps.
      
      Progression:
      
      Increase reps → max range.
      
      Add weight (per barbell side, dumbbell side, or machine stack).
      
      If no weight available: use slower tempo, pulses, deeper range.
      
      Progression by Client Feedback (Easy / Medium / Hard)
      
      EASY: Increase reps; if at max, add weight.
      
      MEDIUM: Same as Easy, but smaller weight jumps.
      
      HARD: Reduce reps (not below minimum); reduce weight if needed.
      
      Pain / Injury Protocol
      
      When discomfort or pain occurs during an exercise, follow this step-by-step correction sequence:
      
      Global Note
      
      For sharp pain, numbness, or instability, stop immediately.
      
      A) Standing Leg Exercises (Squats, Split Squats, Lunges, Bulgarian Split Squats)
      
      (Excludes machines/cables, posterior-chain–dominant lifts, and moving variations like alternating/walking lunges for the heel-elevation cue.) Joints: knee, lumbar spine, ankle
      
      Technical adjustments
      
      Knee pain: • Bilateral → elevate both heels (small plates). • Unilateral → elevate front heel (e.g., lunge, Bulgarian split squat).
      
      Lumbar spine: brace core, control tempo, reduce ROM, avoid excessive lumbar extension.
      
      Ankle: check mobility, reduce ROM, slightly elevate heels (plate/towel).
      
      If pain persists
      
      Knees: further reduce ROM.
      
      Lumbar: reduce depth and tempo.
      
      Ankles: tweak stance width or limit forward knee travel.
      
      Substitute (isometric/isolation/machine)
      
      Knee → wall sits, leg press.
      
      Lumbar → knee extension (machine).
      
      Ankle → hip thrust or glute bridge.
      
      If pain continues End the exercise and exclude it from the session.
      
      B) Horizontal Pushing (Bench Press, DB Press, Push-Ups)
      
      Joints: shoulder, elbow, wrist, lumbar spine
      
      Technical adjustments
      
      Shoulder: scapula set (bench: retract/depress; push-ups: allow natural protraction at top); elbows ~30–60°; avoid excessive bottom stretch; bar to mid–lower chest; forearms vertical; slight external rotation.
      
      Elbow: vertical wrist-elbow line; avoid aggressive lockout; controlled tempo; if medial pain → slightly wider grip + slower eccentric.
      
      Wrist: neutral wrists (bar in palm), use neutral-grip DB/football bar/handles.
      
      Lumbar: ribs down; moderate, not exaggerated, arch; feet planted but reduce leg drive if provocative; plank-solid push-ups (no hip sag).
      
      If pain persists
      
      Shoulder: reduce ROM (blocks/floor press), lighter load, slower tempo, try DB or slight decline.
      
      Elbow: shorter ROM (no hard lockout), neutral grip, lighten load/frequency.
      
      Wrist: neutral-grip implements, elevate hands (push-ups), lighten load.
      
      Lumbar: minimize arch/leg drive; feet on bench or elevated push-ups.
      
      Substitute
      
      Shoulder → neutral-grip machine chest press, floor press, cable chest press (scapular plane), isometric push-up hold.
      
      Elbow → pec deck, cable fly (soft elbows), isometric chest squeeze.
      
      Wrist → DB neutral-grip floor press, cable fly with D-handles, pec deck, push-up handles.
      
      Lumbar → machine chest press (back support), wall/elevated push-ups, floor press.
      
      Stop if symptoms persist.
      
      C) Standing & Sitting Push (Overhead Press Variants)
      
      Joints: shoulder, elbow, wrist, lumbar spine
      
      Technical adjustments
      
      Shoulder: press in scapular plane; bar path slightly in front of face → head “through” at top; allow natural upward rotation; forearms vertical at bottom; moderate grip width.
      
      Elbow: wrists stacked over elbows; elbows slightly in front; avoid hyperextension; neutral-grip if irritated.
      
      Wrist: neutral (bar in heel of palm); consider DB/neutral handles or light wraps.
      
      Lumbar: brace/glutes on; avoid rib flare/excessive arch; standing: hip-width or split stance; seated: upright back support; strict (no leg drive).
      
      If pain persists
      
      Shoulder: reduce ROM (stop at ear level/pins), lighter load, slower tempo, try DB or slight incline.
      
      Elbow: shorten ROM, neutral grip, reduce volume.
      
      Wrist: neutral-grip, lighten load; handles/parallettes.
      
      Lumbar: back-supported seated press, half-kneeling landmine, reduce load/tempo.
      
      Substitute
      
      Shoulder → landmine press, machine shoulder press (neutral handles), DB press in scapular plane, mid-range iso hold.
      
      Elbow → machine press, slight-incline cable press (neutral grip), isometric press against pins.
      
      Wrist → neutral-grip DB/landmine/machine.
      
      Lumbar → seated back-supported press, half-kneeling landmine, high-incline press or DB floor press.
      
      Stop if symptoms persist.
      
      D) Hip Hinge (Deadlift, RDL, Trap-Bar, Good Morning, Pull-Through)
      
      Joints: lumbar spine, knee, ankle
      
      Technical adjustments
      
      Lumbar: brace first; neutral spine (no flexion or hyperextension at lockout); hinge from hips; lats on; bar close over midfoot; firm, flat shoes.
      
      Knee: soft knees without squatting the hinge; shins near vertical; stance hip-width, slight toe-out; track knees over toes.
      
      Ankle: tripod foot, midfoot pressure; minimize dorsiflexion (send hips back); adjust toe-out/stance for pinch.
      
      If pain persists
      
      Lumbar: reduce ROM (blocks/rack pulls, high-handle trap-bar), lighter load, slower tempo/pauses; consider sumo/trap-bar.
      
      Knee: shift to more hip-dominant (RDL), keep shins vertical, reduce depth/load.
      
      Ankle: tweak stance/toe angle, ensure heels down, limit forward knee travel, shorten ROM.
      
      Substitute
      
      Lumbar → hip thrust, glute bridge, neutral-spine back extension, cable pull-through, light mid-range iso RDL.
      
      Knee → hip thrust/glute bridge, back extension, hamstring curl, DB RDL to blocks.
      
      Ankle → hip thrust/glute bridge, back extension, hamstring curl, pull-through.
      
      Stop if symptoms persist.
      
      E) Static Hinge Rows (BB/DB Bent-Over Row, Pendlay, Chest-Supported Variants)
      
      Joints: lumbar spine, knee, ankle
      
      Technical adjustments
      
      Lumbar: brace, neutral spine; set sustainable torso angle (~30–45°; Pendlay: more parallel); hinge hips back; lats on; load close; move at shoulder, not torso.
      
      Knee: unlock 10–20°; shins near vertical; knees track over toes; hip-width stance.
      
      Ankle: tripod foot, midfoot-to-heel pressure; firm, flat shoes; tweak toe-out/stance for comfort.
      
      Path/tempo: pull to lower ribs/upper abdomen (lats) or mid-chest (upper back) without shrug; elbows ~20–45°; 2–3 s eccentric; no bounce.
      
      If pain persists
      
      Lumbar: reduce load; slightly more upright torso; shorten ROM; slow tempo; straps to maintain form; use bench/chest support or 1-arm supported row.
      
      Knee: add a bit more knee flexion; widen stance; elevate load (blocks/pins).
      
      Ankle: narrow stance; micro-adjust toe angle; ensure heels planted; reduce hinge depth; split-stance supported DB row.
      
      Substitute
      
      Lumbar → chest-supported incline DB row, seal row, machine row (chest pad), seated cable row, half-kneeling single-arm cable row.
      
      Knee → seated cable row, machine row (chest support), prone seal row, 1-arm bench-supported DB row.
      
      Ankle → seated cable row, machine row (chest pad), inverted row with comfortable knee bend.
      
      Stop if symptoms persist.
      
      F) Leg Press & Variations (45° Sled, Horizontal/Seated, Vertical, Single-Leg)
      
      Joints: lumbar spine, knee, ankle
      
      Technical adjustments
      
      Lumbar: back flat to pad; avoid posterior pelvic tilt (“butt wink”); limit depth; place feet higher to reduce hip flexion; brace lightly.
      
      Knee: track over toes; no valgus/varus; no hard lockout; stance hip- to shoulder-width with slight toe-out; controlled bottom.
      
      Ankle: heels planted; push midfoot/heel; if pinch → feet higher, slight toe-out or wider stance; avoid toe-pushing.
      
      If pain persists
      
      Lumbar: lighten load; limit ROM; slower eccentric + brief pause; increase backrest angle; feet higher.
      
      Knee: reduce ROM (keep >~90° if needed); slightly wider stance/toe-out; single-leg presses; light band above knees for abduction cue.
      
      Ankle: feet higher; adjust toe angle; keep heels down; narrow stance if outer ankle stressed; reduce depth.
      
      Substitute
      
      Lumbar → belt squat, wall sit, hack/pendulum with shallow ROM/back support, knee extension machine.
      
      Knee → wall sit, knee extension (short-arc), partial-ROM sled press, Spanish squat.
      
      Ankle → knee extension, belt squat, wall sit, high-feet leg press (re-trial) with reduced depth.
      
      Stop if symptoms persist.
      
      G) Core — Prone & Supine (Isotonic & Isometric)
      
      Joints: lumbar spine, cervical spine, hip
      
      Technical adjustments
      
      Lumbar: brace; ribs over pelvis; anti-extension drills → posterior pelvic tilt (PPT); supine → low back lightly pressed; flexion drills → move from thoracic, keep lumbar near neutral; shorten lever (bend knees); slow tempo/shallow ROM.
      
      Cervical: neutral neck + light chin tuck; supine → don’t pull on head, gaze up; prone/planks → gaze slightly ahead of hands; pad under head if needed.
      
      Hip: for leg raises/lowerings → start 90/90, knees bent, maintain PPT; if pinch → reduce hip flexion, add slight ER/abduction, limit depth; in planks → light glute squeeze to avoid hip sag.
      
      If pain persists
      
      Lumbar: further reduce ROM; one-heel down for leg lowers; incline plank; slow tempo with micro-pauses.
      
      Cervical: switch to McGill curl-up; gentle head support; reduce reps/tempo.
      
      Hip: shorten lever (tuck), alternate limbs (dead bug), avoid long-lever hollows/leg raises.
      
      Substitute
      
      Lumbar → dead bug (heel taps), hook-lying PPT holds, incline forearm plank, hollow tuck hold.
      
      Cervical → McGill curl-up (isometric), supine 90/90 breathing with chin tuck, dead bug with head supported, PPT holds.
      
      Hip → bridge/glute bridge iso, wall-supported 90/90 dead bug, bent-knee leg-lower partials, bench-height prone plank.
      
      Stop if symptoms persist.
      
      H) Core — Standing / Tall-Kneeling / Half-Kneeling (Isotonic & Isometric: Pallof, Chops, Lifts, Press-Outs, Carries)
      
      Joints: lumbar spine, cervical spine, knees
      
      Technical adjustments
      
      Lumbar: brace; ribs over pelvis; prefer chest-height anti-rotation before high/low chops; shorten lever (closer to anchor, shorter press-out); stance cues— • Standing: shoulder-width or slight split; glutes lightly on. • Tall-kneeling: hips over knees; neutral pelvis. • Half-kneeling: 90/90; down-knee glute on; square hips. Avoid lumbar extension/side-bend/rotation.
      
      Cervical: neutral neck, chin tuck, eyes forward; don’t chase the handle with your head; set anchor near sternum if high anchor provokes extension.
      
      Knees: • Standing: soft knees, track over toes. • Tall-kneeling: thick pad; shins vertical; even weight. • Half-kneeling: front knee over midfoot; rear knee padded; stance wide enough for balance; avoid hard lockout.
      
      If pain persists
      
      Lumbar: smaller arc, slower tempo, switch to isometric anti-rotation hold at chest height; widen base; step closer to anchor.
      
      Cervical: deeper chin tuck; fix gaze; anchor to chest height; use anti-rotation press/hold; lighten load.
      
      Knees: more padding; shorter sets; bring front foot in (less flexion); switch to standing split stance if kneeling is provocative; reduce knee bend depth.
      
      Substitute
      
      Lumbar → chest-height anti-rotation hold (standing split/half-kneeling), wall press iso, short-lever press-out, light suitcase carry (ribs/pelvis stacked).
      
      Cervical → tall-kneeling anti-rotation hold with eyes forward, standing press-out at chest height (minimal arm travel), light front-rack carry with neutral gaze.
      
      Knees → standing anti-rotation hold/press, half-kneeling with extra pad & shorter sets, tall-kneeling on soft bench pad; if kneeling intolerable → stay standing.
      
      Stop if symptoms persist.
      
      
      Special Rules by Location
      
      Home: higher reps, progression via tempo, pulses, deeper range.
      
      Gym: progression via reps → weight → difficulty.
      
      Barbell/Dumbbell/Cable: follow weight addition rules from Section 6.
      
      Trainer Notes
      
      Progress order: reps → weight → difficulty.
      
      Always follow injury protocol when pain occurs.
      
      
      📄 JSON OUTPUT FORMAT
      
      Generate the exercise profile in JSON format using the structure below. All fields must be filled as strings.
      
      \`\`\`json
      {
        "exercise_name": "",
        "exercise_icon_description": "",
        "exercise_instructions": "",
        "exercise_video_description": "",
        "required_equipment": "",
        "workout_location": "",
        "rep_limitations_progression_rules": "",
        "progression_by_client_feedback": "",
        "pain_injury_protocol": "",
        "special_rules_by_location": "",
        "trainer_notes": ""
      }
      \`\`\`
      `
      
      const response = await openai.responses.parse({
        model: 'gpt-5',
        input: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: payload.exerciseName
          }
        ],
        reasoning: {
          effort: "medium"
        },
        text: {
          format: zodTextFormat(ExerciseProfileSchema, 'exercise_profile'),
        },
      });

      const profile = response.output_parsed;
      if (!profile) {
        throw new Error('Failed to parse exercise profile');
      }

      // Insert the exercise profile into database
      const { data: newExercise, error: insertError } = await supabase
        .from('exercises')
        .insert({
          name: profile.exercise_name,
          slug: exerciseId,
          icon_description: profile.exercise_icon_description,
          instructions: profile.exercise_instructions,
          video_description: profile.exercise_video_description,
          required_equipment: profile.required_equipment,
          workout_location: profile.workout_location,
          rep_limitations_progression_rules: profile.rep_limitations_progression_rules,
          progression_by_client_feedback: profile.progression_by_client_feedback,
          pain_injury_protocol: profile.pain_injury_protocol,
          special_rules_by_location: profile.special_rules_by_location,
          trainer_notes: profile.trainer_notes,
        })
        .select()
        .single();

      if (insertError) {
        // If it's a duplicate name error, the exercise already exists - fetch the UUID
        if (insertError.code === '23505' && insertError.message.includes('exercises_name_key')) {
          console.log(`Exercise with similar name already exists, fetching UUID for slug: ${exerciseId}`);
          const { data: existingExercise, error: fetchError } = await supabase
            .from('exercises')
            .select('id')
            .eq('slug', exerciseId)
            .single();

          if (fetchError || !existingExercise) {
            throw new Error(`Failed to fetch existing exercise with slug ${exerciseId}: ${fetchError?.message}`);
          }

          return { exercise_id: existingExercise.id, created: false };
        }

        console.error('Database insertion error:', insertError);
        throw new Error(`Failed to insert exercise profile: ${insertError.message}`);
      }

      console.log(`Successfully created exercise profile: ${payload.exerciseName} (${exerciseId})`);

      return { exercise_id: newExercise.id, created: true };

    } catch (error) {
      console.error(`Error generating exercise profile for ${payload.exerciseName}:`, error);
      throw error;
    }
  },
});