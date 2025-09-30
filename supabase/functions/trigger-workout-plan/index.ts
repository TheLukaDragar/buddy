// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';
import { tasks } from "npm:@trigger.dev/sdk@4.0.4";
import type { generateWorkoutPlanTask } from "../../../trigger/workout-plan-generation.ts";

Deno.serve(async (req: Request) => {
  try {
    const { userProfile } = await req.json();

    if (!userProfile) {
      return new Response(
        JSON.stringify({ error: 'Missing userProfile' }),
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

    // Generate unique request ID
    const requestId = crypto.randomUUID();

    // Insert request record for tracking (using service role)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: requestError } = await supabaseAdmin
      .from('workout_plan_requests')
      .insert({
        request_id: requestId,
        user_id: user.id,
        status: 'processing',
        user_profile: userProfile,
        created_at: new Date().toISOString()
      });

    if (requestError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create request' }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Trigger the long-running Trigger.dev task
    console.log('Triggering workout plan generation task for request:', requestId);
    await tasks.trigger<typeof generateWorkoutPlanTask>("generate-workout-plan", {
      userProfile,
      userId: user.id,
      requestId,
    });

    console.log('Trigger.dev task started successfully');

    // Return immediately with request ID
    return new Response(
      JSON.stringify({
        request_id: requestId,
        status: 'processing',
        message: 'Workout plan generation started. You will be notified when complete.'
      }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error in workout plan generation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});