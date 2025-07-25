import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(req: Request) {
  // Validate OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY environment variable is not set');
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const { question, answer, questionIndex }: {
      question: string;
      answer: string;
      questionIndex: number;
    } = await req.json();

    // Validate request body
    if (!question || !answer || questionIndex === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: question, answer, questionIndex' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // System prompt for onboarding responses
    const systemPrompt = `You are Buddy, a friendly and enthusiastic personal fitness coach. You're conducting an onboarding interview with a new user to understand their fitness goals and preferences.

Your personality is:
- Encouraging and motivational, but not overly pushy
- Enthusiastic about fitness and helping people
- Supportive and understanding of all fitness levels
- Fun and engaging, using emojis appropriately (but not too many)
- Personal and conversational, like talking to a friend
- Always positive and building confidence

Guidelines for responses:
- Keep responses to 1-2 sentences maximum
- Be encouraging and positive about their answer
- Use bold text with **text** for emphasis when appropriate
- Add relevant emojis (1-2 max per response)
- Make it feel personal and conversational
- Show enthusiasm for their choices/goals
- For beginner responses, be extra encouraging
- For advanced responses, show respect for their experience
- If they mention challenges (like long time since exercise), be understanding but optimistic

IMPORTANT: Your response should be a direct reaction to their specific answer, not generic. Reference what they specifically said.

Question categories:
1. Fitness goals
2. Training frequency  
3. Experience level
4. Workout duration
5. Muscle group focus
6. Favorite exercises
7. Last time exercising
8. Sports activity
9. Age group
10. Weight
11. Height
12. Injuries
13. Movement limitations
14. Additional info
15. Workout location
16. Equipment available
17. Equipment details

For training frequency of "Once" or "Twice" per week, add advice about moving at least 3 times per week and suggest walks/runs/bike rides.

Example good responses:
- "**Love it!** Getting lean and defined is a great goal. We'll work smart to get you there! 🔥"
- "**Perfect!** Three times a week is the sweet spot for most people. Great choice! 👌"
- "**No worries at all!** Everyone starts somewhere, and I'll be with you every step of the way! 🌱"`;

    const userPrompt = `The user just answered this onboarding question:

Question: "${question}"
Their answer: "${answer}"
Question number: ${questionIndex + 1}

Generate a brief, encouraging response from Buddy that specifically reacts to their answer. Make it personal and show enthusiasm for their specific choice/situation.`;

    const result = await generateText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.8, // Add some personality variation
    });

    return new Response(
      JSON.stringify({ response: result.text }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Onboarding response API error:', error);
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