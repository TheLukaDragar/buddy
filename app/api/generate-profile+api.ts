import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  try {
    const { userAnswers, conversationHistory }: { 
      userAnswers: string[], 
      conversationHistory?: { role: string, content: string }[] 
    } = await req.json();

    if (!userAnswers || !Array.isArray(userAnswers)) {
      return Response.json(
        { error: 'Invalid request: userAnswers array is required' },
        { status: 400 }
      );
    }

    // Complete list of all 18 onboarding questions in order
    const ONBOARDING_QUESTIONS = [
      "What are your main fitness goals?",
      "How often would you like to work out each week?",
      "Which days of the week work best for you?",
      "What's your experience level with fitness?",
      "How long would you like each workout to be?",
      "Is there a specific muscle group you'd like to focus more on?",
      "What are your favorite exercises?",
      "When was the last time you moved your body?",
      "Do you currently do any sports - casually or professionally?",
      "What's your age group?",
      "How much do you weigh (rough estimate)?",
      "How tall are you?",
      "Have you had any injuries in the past?",
      "Is there any movement or exercise that you can't do or causes discomfort?",
      "Anything else you'd like me to know about you?",
      "Where will you be doing your workouts?",
      "What equipment do you have at home?",
      "Please describe exactly what equipment you have"
    ];

    // Create comprehensive Q&A pairs for better context
    const qaPairs = ONBOARDING_QUESTIONS.map((question, index) => {
      const answer = userAnswers[index] || "No answer provided";
      return `Q${index + 1}: ${question}\nA: ${answer}`;
    }).join('\n\n');

    // Include conversation history if available for additional context
    const conversationContext = conversationHistory ? 
      `\n\nCONVERSATION HISTORY:\n${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}` : '';

    const prompt = `You are an AI fitness coach creating a comprehensive user profile. Based on the following onboarding responses and conversation history, write a detailed summary of everything the user shared.

USER ONBOARDING RESPONSES:
${qaPairs}${conversationContext}

Write a comprehensive profile summary that includes:

1. **Goals & Motivation**: What they want to achieve and why
2. **Schedule & Availability**: Training frequency, preferred days, time constraints  
3. **Experience & Background**: Fitness history, sports participation, current activity
4. **Physical Profile**: Age, weight, height, any physical limitations
5. **Equipment & Environment**: What they have access to, where they'll train
6. **Health & Safety**: Injuries, limitations, medical considerations
7. **Preferences**: Favorite exercises, workout style preferences
8. **Additional Context**: Any other relevant information they shared

Write this in natural, conversational language that captures all the specific details they provided. Be thorough and include every important piece of information they shared during the onboarding process. Format it as a clear, readable text profile that can be easily referenced by the AI coach.`;

    const result = streamText({
      model: openai('gpt-4o'),
      prompt,
      temperature: 0.3,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error generating user profile:', error);
    
    // Return a more specific error response
    if (error instanceof Error) {
      return Response.json(
        { error: `Failed to generate profile: ${error.message}` },
        { status: 500 }
      );
    }
    
    return Response.json(
      { error: 'Failed to generate user profile' },
      { status: 500 }
    );
  }
} 