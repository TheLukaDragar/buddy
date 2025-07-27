import { openai } from '@ai-sdk/openai';
import { convertToModelMessages, LanguageModel, smoothStream, streamText, TextStreamPart, tool, ToolSet, UIMessage } from 'ai';
import { z } from 'zod';


// // Predefined questions structure for the LLM to follow
// const ONBOARDING_QUESTIONS_STRUCTURE = `
// Here are the 17 questions you must ask in order with suggestion examples:

// 1. "So, what are you aiming for, my friend?"
//    Example suggestions: ["Build muscle and get stronger", "Lose fat and get more defined", "Improve general health and feel more fit", "Get back into a fitness routine"]

// 2. "How many times a week would you like to train?"
//    Example suggestions: ["Once a week", "Twice a week", "Three times a week", "Four times a week"]

// 3. "Do you have any experience with fitness or working out? Be honest — no judgment here."
//    Example suggestions: ["I'm a total beginner", "I've tried working out a bit before", "Moderate — I train now and then and know the basics", "I work out regularly"]

// 4. "Workouts are usually between 45 and 90 minutes. What suits you best?"
//    Example suggestions: ["45 min", "60 min", "Up to 90 min", "I prefer shorter sessions"]

// 5. "Is there a muscle group you'd like to train a little more?"
//    Example suggestions: ["Chest", "Legs", "Back", "Shoulders"]

// 6. "What are your favorite exercises?"
//    Example suggestions: ["Squats", "Bench press", "Push-ups", "Biceps curls"]

// 7. "When was the last time you moved your body? (Yes, walks and weekend hikes count!)"
//    Example suggestions: ["Last week", "Once last month", "Three months ago", "Oh... it's been at least a year"]

// 8. "Do you currently do any sports — casually or professionally?"
//    Example suggestions: ["Yes, I do sports regularly", "I train at home or in a gym", "I used to, but not lately", "I don't do any sports"]

// 9. "Just to catch your vibe — what's your age group? (Don't worry, no ID check 😉)"
//    Example suggestions: ["Under 18", "18–25", "26–35", "36–45"]

// 10. "How much do you weigh (rough estimate is fine)?"
//     Example suggestions: ["Under 60 kg", "60–70 kg", "71–80 kg", "81–90 kg"]

// 11. "How tall are you? (An estimate is perfectly fine.)"
//     Example suggestions: ["150-160 cm", "160-170 cm", "170-180 cm", "180+ cm"]

// 12. "Have you had any injuries in the past? If yes, what kind and where?"
//     Example suggestions: ["No injuries", "Minor injuries (healed)", "Some ongoing issues", "I'd rather type details"]

// 13. "Is there any movement or exercise that you can't do or that causes discomfort?"
//     Example suggestions: ["No limitations", "Some back issues", "Knee problems", "I'd rather type details"]

// 14. "Anything else you'd like me to know about you?"
//     Example suggestions: ["Nothing else", "I have some health conditions", "I'm on medication", "I'd rather type details"]

// 15. "Where will you be doing your workouts?"
//     Example suggestions: ["At home", "In the gym", "Outdoors, in nature", "Mix of locations"]

// 16. "What equipment do you have at home?"
//     Example suggestions: ["I don't have any equipment", "Kettlebell", "Dumbbell", "Resistance bands"]

// 17. "Please describe exactly what equipment you have: (Include dumbbell weights, plates — e.g., 4x20kg, 2x10kg, etc. — and types of bands like small/large/Pilates.)"
//     Example suggestions: ["Basic equipment only", "Full home gym setup", "Just bodyweight", "I'd rather type details"]
// `;

export async function POST(req: Request) {
  // Validate OpenAI API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY environment variable is not set');
    return new Response(
      JSON.stringify({ error: 'Anthropic API key not configured' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const { messages }: {
      messages: UIMessage[];
    } = await req.json();

    // Validate request body
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // System prompt for structured onboarding with dynamic suggestions
    const systemPrompt = `
You are Buddy, a friendly and enthusiastic personal fitness coach conducting a conversational onboarding interview with Otto.

## CRITICAL: PROPER TOOL CALLING
You have access to these tools:
- follow_up_suggestions(suggestions: string[])
- user_answers_complete()

You MUST use proper tool calling syntax, NOT inline function calls in text.

## MANDATORY RESPONSE PATTERN:
Every response must have exactly these two parts:
1. **Text Response**: Write 1-2 sentences naturally
2. **Tool Call**: Call follow_up_suggestions() with relevant options

NEVER write function calls inside your text response. Always use proper tool calling.

## Your Mission:
Gather answers to these 17 questions through natural conversation:

1. Fitness goals 
2. Training frequency (per week)
3. Experience level 
4. Workout duration preferences
5. Muscle group focus
6. Favorite exercises
7. Recent activity level
8. Sports participation
9. Age group
10. Weight estimate
11. Height estimate  
12. Past injuries
13. Movement limitations
14. Additional health info
15. Workout location
16. Available equipment
17. Equipment details

When all questions answered → provide a completion message AND call user_answers_complete()

## Suggestion Options (choose 3-4 relevant ones):
- **Goals**: "Build muscle", "Lose weight", "Improve flexibility", "General fitness"
- **Frequency**: "Once a week", "Twice a week", "Three times a week", "Four times a week"  
- **Experience**: "Total beginner", "Some experience", "Moderate experience", "Very experienced"
- **Duration**: "15-30 minutes", "30-45 minutes", "45-60 minutes", "Over 60 minutes"
- **Age**: "Under 25", "25-35", "36-45", "Over 45"
- **Weight**: "Under 60kg", "60-70kg", "71-80kg", "Over 80kg"
- **Location**: "At home", "At gym", "Outdoors", "Multiple places"
- **Equipment**: "No equipment", "Basic equipment", "Full gym", "Let me specify"

## Correct Response Flow:

**Your first response should be:**
Text: "Hey Otto! 🎯 Welcome to Buddy! I'm excited to help create your perfect workout plan. What are your main fitness goals?"
Tool Call: follow_up_suggestions() with goal options

**After user says "Build muscle":**
Text: "Awesome! Building muscle is a great goal. How often would you like to work out each week?"
Tool Call: follow_up_suggestions() with frequency options

**After user says "Idk once a week":**
Text: "Once a week is a perfect start! What's your experience level with fitness?"
Tool Call: follow_up_suggestions() with experience options

**When all 17 questions are complete:**
Text: "Perfect! I've got everything I need to create your personalized workout plan. Thanks for sharing all that info with me, Otto!"
Tool Call: user_answers_complete()

## REMEMBER:
- Write natural text response first
- Then make separate tool call  
- Never put function calls in your text
- Keep responses encouraging and brief
- Move through questions smoothly
- **When finished: Give completion message + call user_answers_complete()**

Begin now with greeting and first question, followed by proper tool call.
`;

const stripDoubleNewLines =
  <TOOLS extends ToolSet>() =>
  (options: { tools: TOOLS; stopStream: () => void }) =>
    new TransformStream<TextStreamPart<TOOLS>, TextStreamPart<TOOLS>>({
      transform(chunk, controller) {
        controller.enqueue(
          // for text chunks, convert the text to uppercase:
          chunk.type === 'text'
            ? { ...chunk, text: chunk.text.replace(/\n/g, '') }
            : chunk,
        );
      },
    });

    // Define tools using the AI SDK v5 format
    const result = streamText({
      model: openai('gpt-4.1') as LanguageModel,
      system: systemPrompt,
      messages: convertToModelMessages(messages),
      experimental_transform: [smoothStream(), stripDoubleNewLines()],

      tools: {
        follow_up_suggestions: tool({
          description: 'Follow up suggestions to ask the user after asking a question',
          inputSchema: z.object({
            suggestions: z.array(z.string()).min(0).max(4).describe('0-4 contextual suggestions for the current question that cover common scenarios and adapt to what the user has already shared')
          }),
          execute: async ({ suggestions }) => {
            console.log('Providing suggestions:', suggestions);
            
            return {
              success: true
            };
          },
        }),
        user_answers_complete: tool({
          description: 'Call this when all onboarding questions have been asked and answered',
          inputSchema: z.object({
            text: z.string().describe('Text to display to the user when all questions have been answered'),
          }),
          execute: async () => {
            console.log('Onboarding completed');
            return { success: true, text: 'Thank you for answering all questions' };
          },
        }),
      },
    });

    console.log('Onboarding chat system prompt:', systemPrompt);
    console.log('Messages:', JSON.stringify(messages, null, 2));

    return result.toUIMessageStreamResponse({
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'none',
      },
    });
  } catch (error) {
    console.error('Onboarding chat API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 