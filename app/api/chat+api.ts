import { createChatbotContextPrompt } from '@/prompts/generateUserProfile';
import { openai } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, UIMessage } from 'ai';

export async function POST(req: Request) {
  const { messages, userProfile }: {
    messages: UIMessage[];
    userProfile?: any;
  } = await req.json();

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
  //log messages
  console.log('Messages JSON:', JSON.stringify(convertToModelMessages(messages)));

  return result.toUIMessageStreamResponse({
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'none',
    },
  });
} 