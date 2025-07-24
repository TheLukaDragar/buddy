import { openai } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, UIMessage } from 'ai';
import { createChatbotContextPrompt } from '../../prompts/generateUserProfile';

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
    const { messages, userProfile }: {
      messages: UIMessage[];
      userProfile?: any;
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

    // Base system prompt
    let systemPrompt = `You are Buddy, a friendly and enthusiastic personal fitness coach and wellness companion. Your personality is:

- Encouraging and motivational, but not overly pushy
- Knowledgeable about fitness, nutrition, and wellness
- Supportive and understanding of different fitness levels
- Fun and engaging, using emojis appropriately
- Focused on sustainable, healthy lifestyle changes
- Always prioritizing safety and proper form

Your expertise includes:
- Workout routines and exercise techniques
- Nutrition advice and meal planning
- Motivation and goal setting
- Recovery and rest
- Injury prevention
- Mental wellness related to fitness

Keep responses conversational, helpful, and within 2-3 sentences unless more detail is specifically requested. Always encourage users and remind them that consistency matters more than perfection.`;

    // Add user profile context if available using the proper context function
    if (userProfile) {
      systemPrompt += '\n\n' + createChatbotContextPrompt(userProfile);
    }

    const result = streamText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      messages: convertToModelMessages(messages),
    });

    console.log('System prompt:', systemPrompt);
    // Log messages (be careful in production to not log sensitive data)
    console.log('Messages:', JSON.stringify(messages, null, 2));

    return result.toUIMessageStreamResponse({
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'none',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
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