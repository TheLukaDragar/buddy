import { userProfileSchema } from '@/prompts/generateUserProfile';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';

export async function POST(req: Request) {
  try {
    const { userAnswers }: { userAnswers: string[] } = await req.json();

    if (!userAnswers || !Array.isArray(userAnswers)) {
      return Response.json(
        { error: 'Invalid request: userAnswers array is required' },
        { status: 400 }
      );
    }

    // The onboarding questions in order for context
    const ONBOARDING_QUESTIONS = [
      "What's your fitness goal?",
      "How would you describe your fitness experience?", 
      "When was the last time you moved that body?",
      "Do you do any kind of sport or physical activity every week?",
      "Which age range are you in?",
      "Weight range?",
      "Want to tell me a bit more? (Additional info)",
      "How many days a week would you like to train?",
      "How long should your average workout be?"
    ];

    // Create Q&A pairs for better context
    const qaPairs = ONBOARDING_QUESTIONS.map((question, index) => {
      const answer = userAnswers[index] || "No answer provided";
      return `Q: ${question}\nA: ${answer}`;
    }).join('\n\n');

    const prompt = `You are an AI fitness coach analyzer. Based on the following onboarding responses, extract and summarize key information about this user to create a personalized fitness profile that THEY can read and understand.

USER ONBOARDING RESPONSES:
${qaPairs}

Create a profile that captures their personality, goals, and preferences in natural, readable language. This profile will be shown to the user, so make it:
- Personal and relatable (use "you" language in the summary)
- Natural and conversational (avoid clinical categorizations)
- Encouraging and positive
- Specific to their actual responses (don't generalize)

For the profileSummary, write 2-3 sentences that the user would recognize as describing themselves, like: "You're ready to build muscle and get stronger, and as someone new to fitness, you're looking for guidance to start safely. You're active with sports but want to add structured training 3 times per week with 45-minute sessions."

Keep all fields natural and human-readable while still being structured enough for the AI coach to understand.`;

    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: userProfileSchema,
      prompt,
      temperature: 0.5, // Slightly higher for more natural language
    });

    return Response.json(result.object);
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