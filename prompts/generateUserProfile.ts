import { z } from 'zod';

// Define the Zod schema for structured output validation - more flexible for user readability
export const userProfileSchema = z.object({
  fitnessGoal: z.string().describe("User's primary fitness goal expressed naturally (e.g., 'Build muscle and get stronger', 'Lose weight and feel confident', 'Stay active and healthy')"),
  experienceLevel: z.string().describe("Fitness experience level in natural language (e.g., 'Complete beginner', 'Some experience with sports', 'Been training for years')"),
  lastActivity: z.string().describe("When they last exercised, expressed naturally (e.g., 'Just worked out this week', 'It's been a few months', 'Haven't exercised in over a year')"),
  currentActivity: z.string().describe("Current activity level in natural language (e.g., 'Play soccer regularly', 'Occasional walks', 'Mostly sedentary lifestyle')"),
  ageRange: z.string().describe("Age range or specific age as provided, or 'Preferred not to say'"),
  weightRange: z.string().describe("Weight range as provided, or 'Preferred not to say'"),
  additionalInfo: z.string().optional().describe("Any special considerations, injuries, preferences, or personal notes they shared"),
  trainingFrequency: z.string().describe("How often they want to train expressed naturally (e.g., '3 times per week', 'Every other day', 'As much as possible')"),
  workoutDuration: z.string().describe("Preferred workout length (e.g., '30-45 minutes', 'Quick 20 minute sessions', 'Hour-long workouts')"),
  personalityTone: z.string().describe("Communication style preference based on their responses (e.g., 'Friendly and encouraging', 'Direct and motivational', 'Patient and understanding')"),
  motivationLevel: z.string().describe("Motivation level expressed naturally (e.g., 'Very motivated and ready to start', 'Cautiously optimistic', 'Looking for gradual changes')"),
  specificNeeds: z.array(z.string()).describe("Array of specific needs, considerations, or focus areas they mentioned"),
  profileSummary: z.string().describe("A friendly 2-3 sentence summary of who they are as a fitness person that they can read and relate to")
});

// Export the TypeScript type from the schema
export type ExtractedUserProfile = z.infer<typeof userProfileSchema>;

// Function to convert the extracted profile into a context prompt for the chatbot
export function createChatbotContextPrompt(profile: ExtractedUserProfile): string {
  const contextPrompt = `USER PROFILE CONTEXT:
The user you're chatting with has the following fitness profile:

🎯 FITNESS GOAL: ${profile.fitnessGoal}
💪 EXPERIENCE LEVEL: ${profile.experienceLevel}
🏃 ACTIVITY STATUS: Last active: ${profile.lastActivity}, Currently: ${profile.currentActivity}
📊 DEMOGRAPHICS: Age ${profile.ageRange}, Weight ${profile.weightRange}
⏰ TRAINING PREFERENCES: ${profile.trainingFrequency}, ${profile.workoutDuration} sessions
🎭 COMMUNICATION STYLE: ${profile.personalityTone}
🔥 MOTIVATION LEVEL: ${profile.motivationLevel}

${profile.additionalInfo ? `📝 ADDITIONAL INFO: ${profile.additionalInfo}` : ''}

${profile.specificNeeds.length > 0 ? `🎯 SPECIFIC NEEDS: ${profile.specificNeeds.join(', ')}` : ''}

💭 PROFILE SUMMARY: ${profile.profileSummary}

COACHING INSTRUCTIONS:
- Tailor your responses to their experience level and goals
- Match their communication style preference
- Consider their motivation level in your encouragement approach
- Reference their training preferences when relevant
- Be mindful of any additional info or specific needs
- Keep the tone consistent with their profile summary

Always personalize your advice based on this profile while maintaining your encouraging and knowledgeable Buddy personality.`;

  return contextPrompt;
}

// Utility to get a brief, user-friendly summary
export function getProfileSummary(profile: ExtractedUserProfile): string {
  return profile.profileSummary;
} 