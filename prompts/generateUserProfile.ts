import { z } from 'zod';

// Define the Zod schema for comprehensive user profile in full text format
export const userProfileSchema = z.object({
  // Main profile summary in natural language
  profileSummary: z.string().describe("A comprehensive 3-4 paragraph summary of the user's complete fitness profile, written in natural, conversational language. Include all their goals, experience, preferences, limitations, and personal circumstances."),
  
  // Detailed notes section with all information organized by category
  detailedNotes: z.string().describe("Comprehensive notes organized by category: Goals & Motivation, Schedule & Availability, Experience & Background, Physical Profile, Equipment & Environment, Health & Safety, Preferences, and Additional Context. Write in full sentences with all specific details they shared."),
  
  // Coaching insights for the AI
  coachingInsights: z.string().describe("Specific guidance for the AI coach on how to approach this user, including communication style, motivation strategies, potential challenges, and personalized recommendations."),
  
  // Key facts in simple text format
  keyFacts: z.string().describe("A bullet-point style list of the most important facts about this user, written in simple, clear language that captures their unique situation."),
  
  // Personal context and circumstances
  personalContext: z.string().describe("Any personal circumstances, work schedule, family situation, or other context that affects their training, written in natural language."),
  
  // Equipment and environment details
  equipmentDetails: z.string().describe("Complete list of equipment they have access to, including specific weights, types, and where they'll be training, written in full text."),
  
  // Health and safety considerations
  healthSafety: z.string().describe("All injuries, limitations, medical considerations, and safety concerns they mentioned, written in clear, actionable language for the coach."),
  
  // Training preferences and style
  trainingPreferences: z.string().describe("Their preferred training style, favorite exercises, workout duration preferences, and any specific training approaches they mentioned."),
  
  // Motivation and readiness level
  motivationLevel: z.string().describe("Assessment of their motivation level, readiness to start, potential obstacles, and what drives them, written in encouraging but realistic language.")
});

// Export the TypeScript type from the schema
export type ExtractedUserProfile = z.infer<typeof userProfileSchema>;

// Function to convert the extracted profile into a context prompt for the chatbot
export function createChatbotContextPrompt(profile: ExtractedUserProfile): string {
  const contextPrompt = `USER PROFILE CONTEXT:
The user you're chatting with has the following comprehensive fitness profile:

📋 PROFILE SUMMARY:
${profile.profileSummary}

📝 DETAILED NOTES:
${profile.detailedNotes}

🎯 COACHING INSIGHTS:
${profile.coachingInsights}

🔑 KEY FACTS:
${profile.keyFacts}

👤 PERSONAL CONTEXT:
${profile.personalContext}

🏋️ EQUIPMENT & ENVIRONMENT:
${profile.equipmentDetails}

🏥 HEALTH & SAFETY:
${profile.healthSafety}

💪 TRAINING PREFERENCES:
${profile.trainingPreferences}

🔥 MOTIVATION & READINESS:
${profile.motivationLevel}

COACHING INSTRUCTIONS:
- Use this comprehensive profile to provide perfectly personalized guidance
- Reference specific details from their profile in your responses
- Consider their personal circumstances and limitations
- Match their communication style and motivation level
- Provide recommendations that work with their equipment and environment
- Be mindful of their health and safety considerations
- Tailor your encouragement to their specific situation and goals

Always personalize your advice based on this detailed profile while maintaining your encouraging and knowledgeable Buddy personality.`;

  return contextPrompt;
}

// Utility to get a brief, user-friendly summary
export function getProfileSummary(profile: ExtractedUserProfile): string {
  return profile.profileSummary;
} 