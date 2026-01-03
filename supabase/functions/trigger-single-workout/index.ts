// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';
import { tasks } from "npm:@trigger.dev/sdk@4.0.4";
import type { generateSingleWorkoutTask } from "../../../trigger/single-workout-generation.ts";

Deno.serve(async (req: Request) => {
  try {
    const { muscleGroups, duration, equipment, difficulty, clientDate } = await req.json();

    // Validate required fields
    if (!muscleGroups || !duration || !equipment || !difficulty) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: muscleGroups, duration, equipment, difficulty' }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate difficulty
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return new Response(
        JSON.stringify({ error: 'Invalid difficulty. Must be: easy, medium, or hard' }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get user from auth token
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const token = req.headers.get('Authorization')!.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get user profile
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('profile_text')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profileData?.profile_text) {
      return new Response(
        JSON.stringify({ error: 'User profile not found. Please complete onboarding first.' }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate unique request ID
    const requestId = crypto.randomUUID();

    // Insert request record for tracking
    const { error: requestError } = await supabaseAdmin
      .from('single_workout_requests')
      .insert({
        request_id: requestId,
        user_id: user.id,
        status: 'processing',
        muscle_groups: muscleGroups,
        duration: duration,
        equipment: equipment,
        difficulty: difficulty,
        user_profile: profileData.profile_text,
        created_at: new Date().toISOString()
      });

    if (requestError) {
      console.error('Failed to create request:', requestError);
      return new Response(
        JSON.stringify({ error: 'Failed to create request' }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Trigger the long-running Trigger.dev task
    console.log('Triggering single workout generation task for request:', requestId);
    await tasks.trigger<typeof generateSingleWorkoutTask>("generate-single-workout", {
      userId: user.id,
      requestId,
      muscleGroups,
      duration,
      equipment,
      difficulty,
      userProfile: profileData.profile_text,
      clientDate, // Pass client date to handle timezone differences
    });

    console.log('Trigger.dev task started successfully');

    // Return immediately with request ID
    return new Response(
      JSON.stringify({
        request_id: requestId,
        status: 'processing',
        message: 'Single workout generation started. You will be notified when complete.'
      }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error in single workout generation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
