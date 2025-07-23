interface BuddyResponse {
  text: string;
  isTyping?: boolean;
}

// Simple fitness-focused responses for Buddy
const fitnessResponses = {
  greetings: [
    "Hey there! I'm Buddy, your personal fitness coach! How can I help you today? 💪",
    "Hello! Ready to crush your fitness goals? What's on your mind?",
    "Hi! I'm here to help you with your fitness journey. What would you like to know?",
  ],
  
  workout: [
    "Great question about workouts! For beginners, I recommend starting with 3 workouts per week: strength training, cardio, and flexibility work.",
    "A good workout plan includes compound exercises like squats, deadlifts, and push-ups. These work multiple muscle groups efficiently!",
    "For strength training, aim for 3-4 sets of 8-12 reps. For cardio, try 20-30 minutes of moderate intensity exercise.",
    "Remember: consistency beats perfection! Even 15-20 minutes of exercise daily can make a huge difference.",
  ],

  nutrition: [
    "Nutrition is key! Focus on whole foods: lean proteins, complex carbs, healthy fats, and plenty of vegetables.",
    "A good rule of thumb: fill half your plate with vegetables, a quarter with lean protein, and a quarter with complex carbs.",
    "Hydration is crucial too! Aim for at least 8 glasses of water per day, more if you're active.",
    "Meal prep can be a game-changer. Try preparing healthy meals on Sundays for the week ahead!",
  ],

  motivation: [
    "You've got this! Every small step counts towards your bigger goals. I believe in you! 🌟",
    "Remember why you started. Your future self will thank you for the effort you put in today!",
    "Progress isn't always linear. Some days will be harder than others, and that's completely normal.",
    "Celebrate your wins, no matter how small. You're already doing amazing by being here!",
  ],

  rest: [
    "Rest and recovery are just as important as your workouts! Your muscles grow during rest periods.",
    "Aim for 7-9 hours of quality sleep each night. Sleep is when your body repairs and rebuilds.",
    "Don't forget to take rest days! They prevent burnout and reduce injury risk.",
    "Light activities like walking or gentle stretching can be great on rest days.",
  ],

  default: [
    "That's a great question! As your fitness buddy, I'm here to help with workouts, nutrition, motivation, and wellness tips. What specific area interests you most?",
    "I'd love to help you with that! Can you tell me more about your fitness goals or what you're trying to achieve?",
    "Interesting! While I focus mainly on fitness and wellness, I'm always happy to chat. What's your biggest fitness challenge right now?",
    "Thanks for sharing! I'm passionate about helping people reach their fitness goals. What aspect of health and fitness would you like to explore?",
  ]
};

// Keywords to categorize user messages
const keywords = {
  greetings: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'sup', 'what\'s up'],
  workout: ['workout', 'exercise', 'training', 'gym', 'fitness', 'strength', 'cardio', 'run', 'lift', 'weights', 'muscle', 'abs', 'legs', 'arms'],
  nutrition: ['food', 'eat', 'nutrition', 'diet', 'meal', 'protein', 'carbs', 'calories', 'weight loss', 'weight gain', 'healthy eating'],
  motivation: ['motivation', 'inspire', 'encourage', 'goal', 'challenge', 'difficult', 'hard', 'give up', 'tired', 'lazy'],
  rest: ['rest', 'sleep', 'recovery', 'tired', 'exhausted', 'rest day', 'break', 'sore'],
};

function categorizeMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(keyword => lowerMessage.includes(keyword))) {
      return category;
    }
  }
  
  return 'default';
}

function getRandomResponse(responses: string[]): string {
  return responses[Math.floor(Math.random() * responses.length)];
}

export class BuddyChatbotService {
  private isThinking = false;

  async getBuddyResponse(userMessage: string): Promise<BuddyResponse> {
    // Simulate thinking time for more natural feel
    if (this.isThinking) {
      return { text: "Let me think about that... 🤔", isTyping: true };
    }

    this.isThinking = true;
    
    // Add a small delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
    
    const category = categorizeMessage(userMessage);
    const responses = fitnessResponses[category as keyof typeof fitnessResponses] || fitnessResponses.default;
    const response = getRandomResponse(responses);
    
    this.isThinking = false;
    
    return {
      text: response,
      isTyping: false
    };
  }

  // Get contextual follow-up suggestions
  getFollowUpSuggestions(category: string): string[] {
    const suggestions = {
      workout: [
        "What's a good beginner workout?",
        "How often should I exercise?",
        "Best exercises for strength?"
      ],
      nutrition: [
        "What should I eat before workout?",
        "How much protein do I need?",
        "Healthy meal prep ideas?"
      ],
      motivation: [
        "How to stay consistent?",
        "Setting realistic goals?",
        "Overcoming plateaus?"
      ],
      rest: [
        "How much sleep do I need?",
        "What to do on rest days?",
        "Recovery after intense workout?"
      ]
    };

    return suggestions[category as keyof typeof suggestions] || [
      "Tell me about workout plans",
      "Nutrition tips please",
      "I need motivation!"
    ];
  }
}

export default new BuddyChatbotService(); 