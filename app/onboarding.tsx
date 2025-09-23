import { useChat } from '@ai-sdk/react';
import { defaultChatStore } from 'ai';
import { router } from 'expo-router';
import { fetch as expoFetch } from 'expo/fetch';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import { Avatar, IconButton, Text } from 'react-native-paper';
import ReanimatedAnimated, { Easing, FadeIn, Layout, SlideInRight, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { nucleus } from '../Buddy_variables';
import { useAppDispatch } from '../store/hooks';
import { generateProfileFromAnswers, setOnboardingAnswers, setOnboardingCompleted } from '../store/slices/userSlice';
import { generateAPIUrl } from '../utils';

// Animated thinking dot component
const ThinkingDot = ({ delay }: { delay: number }) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    // Start the animation with the delay
    const timer = setTimeout(() => {
      opacity.value = withRepeat(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <ReanimatedAnimated.View 
      style={[styles.thinkingDot, animatedStyle]}
      entering={FadeIn.delay(delay)}
    />
  );
};

// Pagination component for question progress (max 5 dots)
const Pagination = ({ activeIndex, count }: { activeIndex: number, count: number }) => {
  const maxDots = 5;
  const dotsToShow = Math.min(count, maxDots);
  
  // Calculate which dots to show based on current position
  let startIndex = 0;
  if (count > maxDots) {
    if (activeIndex <= 2) {
      startIndex = 0;
    } else if (activeIndex >= count - 3) {
      startIndex = count - maxDots;
    } else {
      startIndex = activeIndex - 2;
    }
  }
  
  return (
    <ReanimatedAnimated.View layout={Layout.duration(250).easing(Easing.out(Easing.cubic))} style={styles.pagination}>
      {Array.from({ length: dotsToShow }).map((_, index) => {
        const actualIndex = startIndex + index;
        const isActive = actualIndex === activeIndex;
        
        return (
          <ReanimatedAnimated.View 
            key={actualIndex} 
            layout={Layout.duration(200).delay(index * 30).easing(Easing.out(Easing.cubic))}
            style={[
              styles.dot, 
              isActive ? styles.activeDot : styles.inactiveDot
            ]} 
          />
        );
      })}
    </ReanimatedAnimated.View>
  );
};

export default function OnboardingScreen() {
  const dispatch = useAppDispatch();
  
  // Animation values
  const fadeOpacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(20)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  
  // State
  const [inputText, setInputText] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [showCompletion, setShowCompletion] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  

  
  // Question tracking for pagination - use a simple counter instead
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(18);
  
  // AI SDK Chat Hook for onboarding with proper streaming
  const { messages, append, status } = useChat({
    chatStore: defaultChatStore({
      api: generateAPIUrl('/api/onboarding-chat'),
      fetch: expoFetch as unknown as typeof globalThis.fetch,
    }),
    onError: (error) => {
      console.error('Onboarding chat error:', error);
    },

  
    onFinish: (message) => {
      console.log('AI message finished streaming:', message);
      
      // Parse the completed message for tools and suggestions
      let suggestions: string[] = [];
      let isComplete = false;
      let multipleSelection = false;
      
      if (message.message.parts) {
        for (const part of message.message.parts) {
          console.log('Processing finished part:', part);
          
          if (part.type === 'tool-invocation') {
            // Tool invocation from the AI SDK
            const toolInvocation = part.toolInvocation;
            
            // Check if this is a tool result (state === 'result')
            if (toolInvocation.state === 'result') {
              // Type the tool result properly
              const toolResult = toolInvocation as {
                state: 'result';
                step?: number;
                toolCallId: string;
                toolName: string;
                args: unknown;
                result: unknown;
              };
              
              // Check for follow_up_suggestions tool
              if (toolResult.toolName === 'follow_up_suggestions') {
                // The suggestions are in the args, not the result
                const args = toolResult.args as {
                  suggestions?: string[];
                  allowMultiple?: boolean;
                };
                const toolSuggestions = args?.suggestions;
                const toolAllowMultiple = args?.allowMultiple || false;
                
                console.log('Found follow_up_suggestions tool result:', toolResult);
                console.log('LLM generated suggestions:', toolSuggestions);
                console.log('Allow multiple selection:', toolAllowMultiple);
                
                // Use LLM-generated suggestions
                if (Array.isArray(toolSuggestions)) {
                  suggestions = toolSuggestions;
                  multipleSelection = toolAllowMultiple;
                  console.log('Setting LLM suggestions:', suggestions);
                  console.log('Setting multiple selection:', multipleSelection);
                  
                  // Increment question counter for pagination
                  setCurrentQuestionIndex(prev => Math.min(prev + 1, totalQuestions - 1));
                }
              }
              
              // Check for user_answers_complete tool
              if (toolResult.toolName === 'user_answers_complete') {
                isComplete = true;
                console.log('Onboarding complete!');
              }
            }
          }
        }
      }
      
      // Update suggestions and completion state only after streaming finishes
              setCurrentSuggestions(suggestions);
        setSelectedSuggestions([]); // Reset selections for new question

      
      if (isComplete) {
        setShowCompletion(true);
        // Extract all user messages as answers for profile generation
        const userAnswers = messages
          .filter(msg => msg.role === 'user')
          .map(msg => {
            // Extract text from message parts
            return msg.parts
              .filter(part => part.type === 'text')
              .map(part => (part as { type: 'text'; text: string }).text)
              .join('');
          });
        
        dispatch(setOnboardingAnswers(userAnswers));
      }
      
      // Auto scroll to bottom after streaming completes
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
  });

  // Initialize conversation
  useEffect(() => {
    if (!hasStarted) {
      setHasStarted(true);
      
      // Send initial message to start the conversation
      setTimeout(() => {
        append({ role: 'user', parts: [{ type: 'text', text: "User is ready to start the onboarding conversation. Begin with the greeting and first question." }] });
      }, 0);
    }
    
    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [hasStarted, append]);

  // Keyboard listeners
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Auto scroll when messages change
  useEffect(() => {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
  }, [messages]);

  const handleSuggestionTap = (suggestion: string) => {
    const isAlreadySelected = selectedSuggestions.includes(suggestion);
    
    if (isAlreadySelected) {
      // Simple string replacement - remove the suggestion once
      const newText = inputText.replace(', '+suggestion, '').trim();

      //handle case where input doesnet have , becauee it is the first suggestio
     

      setInputText(newText);
      setSelectedSuggestions(prev => prev.filter(s => s !== suggestion));
    } else {
      // Add suggestion to input text with comma separation
      if (inputText.trim()) {
        // If there's already text, add comma and space before new suggestion
        setInputText(prev => `${prev.trim()}, ${suggestion}`);
      } else {
        // If input is empty, just add the suggestion
        setInputText(suggestion);
      }
      
      // Track which suggestions have been clicked (for visual feedback)
      setSelectedSuggestions(prev => [...prev, suggestion]);
    }
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    
    const finalText = text.trim();
    
    setCurrentSuggestions([]); // Clear suggestions when user sends message
    setSelectedSuggestions([]); // Clear selected suggestions
    setInputText('');
    
    // Send to AI
    append({ role: 'user', parts: [{ type: 'text', text: finalText }] });
  };



  const handleCompleteOnboarding = async () => {
    if (isNavigating) return;
    setIsNavigating(true);
    
    try {
      dispatch(setOnboardingCompleted(true));
      
      // Generate user profile from chat conversation - always regenerate
      const userAnswers = messages
        .filter(msg => msg.role === 'user')
        .map(msg => {
          // Extract text from message parts
          return msg.parts
            .filter(part => part.type === 'text')
            .map(part => (part as any).text)
            .join('');
        });
      
      console.log('Generating user profile from conversation:', userAnswers);
      
      // Dispatch thunk in background - don't wait for it
      dispatch(generateProfileFromAnswers(userAnswers));
      
      // Navigate to main app immediately
      router.push('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      router.push('/(tabs)');
    }
  };

  const renderMessageText = (text: string) => {
    // Handle bold text marked with **text**
    const parts = text.split(/(\*\*.*?\*\*)/);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <Text key={index} style={styles.boldText}>{part.slice(2, -2)}</Text>;
      }
      return part;
    });
  };

  const renderMessages = () => {
    // Filter out the first control message that starts the conversation
    const visibleMessages = messages.filter((message, index) => {
      // Hide the first user message which is the control message
      if (index === 0 && message.role === 'user') {
        const textContent = message.parts
          .filter(part => part.type === 'text')
          .map(part => (part as any).text)
          .join('');
        
        // Hide if it's the control message
        if (textContent.includes('User is ready to start the onboarding conversation')) {
          return false;
        }
      }
      return true;
    });

    // Debug: Log all messages to see what we have
    //console.log('All messages:', JSON.stringify(messages, null, 2));
    console.log('Visible messages:', visibleMessages.map(m => ({ role: m.role, content: m.parts?.map(p => p.type === 'text' ? (p as any).text : p.type) })));

    return visibleMessages.map((message, index) => {
      const isUser = message.role === 'user';
      const isLastMessage = index === visibleMessages.length - 1;
      
      // Extract text content from message parts
      let textContent = message.parts
        .filter(part => part.type === 'text')
        .map(part => (part as any).text)
        .join('');
      
      // Check for completion tool call
      const hasCompletionTool = message.parts.some(part => 
        part.type === 'tool-invocation' && 
        (part as any).toolInvocation?.toolName === 'user_answers_complete'
      );
      
      // If no text content, check for completion tool call with text
      if (!textContent.trim()) {
        const completionTool = message.parts.find(part => 
          part.type === 'tool-invocation' && 
          (part as any).toolInvocation?.toolName === 'user_answers_complete' &&
          (part as any).toolInvocation?.args?.text
        );
        
        if (completionTool) {
          textContent = (completionTool as any).toolInvocation.args.text;
        }
      }
      
      // Skip messages with no content to display
      if (!textContent.trim()) {
        return null;
      }
      
      // Debug: Log each message being rendered
      console.log(`Rendering message ${index}: role="${message.role}", isUser=${isUser}, text="${textContent}"`);
      
      // For the last assistant message, check if it should show suggestions
      const shouldShowSuggestions = !isUser && isLastMessage && currentSuggestions.length > 0;
      
      return (
        <View key={message.id} style={{ width: '100%' }}>
          {!isUser && (
            <View style={styles.buddyMessage}>
              <Avatar.Image size={40} source={require('../assets/avatar.png')} style={styles.avatar} />
              <Text style={styles.buddyName}>Buddy</Text>
            </View>
          )}
          
          <Animated.View 
            style={[
              isUser ? styles.userMessageBubble : styles.messageBubble,
              {
                opacity: fadeOpacity,
                transform: [{ translateY: slideY }],
              },
              // Add padding below completion message only
              hasCompletionTool ? { marginBottom: 24 } : {}
            ]}
          >
            <Text style={isUser ? styles.userMessageText : styles.messageText}>
              {renderMessageText(textContent)}
            </Text>
          </Animated.View>
          
          {/* Show suggestions for the last assistant message only after streaming completes */}
          {shouldShowSuggestions && (
            <ScrollView 
              style={isKeyboardVisible ? styles.suggestionsContainerKeyboard : styles.suggestionsContainerNormal}
              contentContainerStyle={styles.suggestionsContent}
              horizontal={isKeyboardVisible}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              nestedScrollEnabled={true}
            >
              {currentSuggestions.map((suggestion: string, suggestionIndex: number) => {
                const isSelected = selectedSuggestions.includes(suggestion);
                return (
                  <Pressable
                    key={suggestionIndex}
                    onPress={() => handleSuggestionTap(suggestion)}
                    style={({ pressed }) => [
                      isKeyboardVisible ? styles.suggestionButtonKeyboard : styles.suggestionButtonNormal,
                      isSelected ? styles.suggestionButtonSelected : null,
                      { opacity: pressed ? 0.7 : 1 }
                    ]}
                  >
                    <Text style={[
                      styles.suggestionText,
                      isSelected ? styles.suggestionTextSelected : null
                    ]}>
                      {suggestion}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>
      );
    });
  };

  return (
    <ReanimatedAnimated.View 
      entering={SlideInRight.duration(300).delay(100)}
      style={[styles.fullScreen, { backgroundColor: nucleus.light.semantic.bg.subtle }]}
    >
      <SystemBars style="dark" />
      <SafeAreaView style={[styles.container, { backgroundColor: nucleus.light.semantic.bg.subtle }] }>
        
        {/* Header */}
        <ReanimatedAnimated.View 
          entering={FadeIn.duration(400).delay(200)}
          style={styles.topNav}
        >
          <IconButton
            icon={require('../assets/back.png')}
            size={32}
            onPress={() => router.back()}
            style={styles.backButton}
          />
          
          {/* Show pagination dots when questions are active */}
          {hasStarted && !showCompletion ? (
            <ReanimatedAnimated.View 
              entering={FadeIn.duration(300).delay(100)}
              style={styles.paginationContainer}
            >
              <Pagination activeIndex={currentQuestionIndex} count={totalQuestions} />
            </ReanimatedAnimated.View>
          ) : (
            <Text style={styles.headerText}>Getting to know you</Text>
          )}
          
          <View style={{ width: 32 }} />
        </ReanimatedAnimated.View>

        <KeyboardAvoidingView 
          style={styles.mainContent}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
          {/* Chat Messages */}
            <ScrollView 
              ref={scrollViewRef}
              style={styles.scrollContainer}
              contentContainerStyle={[styles.scrollContent, { paddingBottom: isKeyboardVisible ? 8 : 0 }]}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={(w, h) => setContentHeight(h)}
              onLayout={(event) => setScrollViewHeight(event.nativeEvent.layout.height)}
              keyboardShouldPersistTaps="always"
            >
            <Animated.View style={styles.chatContainer}>
              {renderMessages()}
              
              {/* Buddy thinking indicator - only show when submitted, not when streaming */}
              {status === 'submitted' && (
                <View style={{ width: '100%' }}>
                  <View style={styles.buddyMessage}>
                    <Avatar.Image size={40} source={require('../assets/avatar.png')} style={styles.avatar} />
                    <Text style={styles.buddyName}>Buddy</Text>
                  </View>
                  
                  <ReanimatedAnimated.View 
                    entering={FadeIn.duration(300)}
                    style={styles.thinkingBubble}
                  >
                    <View style={styles.thinkingDots}>
                      <ThinkingDot delay={0} />
                      <ThinkingDot delay={150} />
                      <ThinkingDot delay={300} />
                    </View>
                  </ReanimatedAnimated.View>
                </View>
              )}
              </Animated.View>
            </ScrollView>

          {/* Input Area */}
          {!showCompletion && (
            <View style={[styles.inputContainer, { paddingBottom: isKeyboardVisible ? 8 : 16 }]}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Type your answer or click suggestions..."
                  placeholderTextColor={nucleus.light.semantic.fg.muted}
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  onSubmitEditing={() => handleSendMessage(inputText)}
                  blurOnSubmit={false}
                  keyboardType="default"
                  returnKeyType="send"
                />
                <Pressable
                  style={[
                    styles.sendButton,
                    { 
                      opacity: inputText.trim() ? 1 : 0.5 
                    }
                  ]}
                  onPress={() => handleSendMessage(inputText)}
                  disabled={!inputText.trim()}
                >
                  <Text style={styles.sendButtonText}>
                    Send
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Completion Button */}
            {showCompletion && (
            <View style={styles.completionContainer}>
                <Pressable
                style={styles.completeButton}
                onPress={handleCompleteOnboarding}
                >
                <Text style={styles.completeButtonText}>Let&apos;s begin my fitness journey!</Text>
                </Pressable>
          </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ReanimatedAnimated.View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  topNav: {
    display: 'flex',
    height: 64,
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: nucleus.light.semantic.bg.subtle,
  },
  backButton: {
    margin: 0,
    height: 32,
    width: 32,
  },
  headerText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    color: nucleus.light.semantic.fg.base,
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    marginBottom: 8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 0,
    width: '100%',
  },
  chatContainer: {
    display: 'flex',
    paddingTop: 24,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 8,
    alignSelf: 'stretch',
    minHeight: 200,
    
  },
  buddyMessage: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
    
  },
  buddyName: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: 16.8, // 120% of 14px
    letterSpacing: 0,
    color: nucleus.light.global.green['90'], // #203627
    textAlign: 'center',
  },
  avatar: {
    backgroundColor: 'transparent',
  },
  messageBubble: {
    display: 'flex',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 10,
    alignSelf: 'flex-start',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: nucleus.light.semantic.border.muted,
    backgroundColor: nucleus.light.global.blue[80],
    maxWidth: '85%',
  },
  messageText: {
    color: nucleus.light.global.blue["10"],
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 21,
    letterSpacing: 0,
  },
  boldText: {
    color: nucleus.light.global.blue["10"],
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: 21,
    letterSpacing: 0,
  },
  userMessageBubble: {
        

    display: 'flex',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 10,
    alignSelf: 'flex-end',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: nucleus.light.semantic.border.muted,
    backgroundColor: nucleus.light.semantic.bg.canvas, // #ffffff
    marginTop: 8,
    
    
  },
  userMessageText: {
    color: nucleus.light.semantic.fg.base, // #131214
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 24, // 150% of 16px
    letterSpacing: 0,
    textAlign: 'left',
  },
  suggestionsContainerNormal: {
    flexDirection: 'column',
    marginTop: 12,
    alignSelf: 'stretch',
    maxHeight: 250,
  },
  suggestionsContainerKeyboard: {
    flexDirection: 'row',
    marginTop: 12,
    alignSelf: 'stretch',
    maxHeight: 120,
  },
  suggestionsContent: {
    gap: 8,
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  suggestionButtonNormal: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: nucleus.light.global.blue["70"],
    backgroundColor: 'transparent',
    alignSelf: 'flex-start',
    width: 'auto',
    minWidth: 120,
  },
  suggestionButtonKeyboard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: nucleus.light.global.blue["70"],
    backgroundColor: 'transparent',
    alignSelf: 'flex-start',
    width: 'auto',
    minWidth: 120,
  },
  suggestionButtonSelected: {
    backgroundColor: nucleus.light.global.blue["70"],
    borderColor: nucleus.light.global.blue["70"],
  },
  suggestionText: {
    color: nucleus.light.global.blue["70"],
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
    textAlign: 'center',
  },
  suggestionTextSelected: {
    color: nucleus.light.global.blue["10"],
  },
  inputContainer: {
    paddingHorizontal: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.50)',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(208, 221, 23, 0.16)',
    minHeight: 56,
    shadowColor: 'rgba(185, 230, 255, 0.40)',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 25,
    elevation: 25,
    shadowOpacity: 1,
  },
  textInput: {
    flex: 1,
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: nucleus.light.semantic.fg.base,
    paddingVertical: 0,
    minHeight: 40,
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: nucleus.light.global.blue["70"],
    borderRadius: 20,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: nucleus.light.global.blue["10"],
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16.8,
    marginVertical: 0,
    includeFontPadding: false,
    textAlign: 'center',
  },
  sendButtonActive: {
    backgroundColor: nucleus.light.global.brand["70"],
  },
  sendButtonTextActive: {
    color: nucleus.light.global.brand["10"],
  },
  selectedSuggestionsContainer: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  selectedSuggestionsLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: nucleus.light.global.grey["70"],
    marginBottom: 8,
  },
  selectedSuggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedSuggestionTag: {
    backgroundColor: nucleus.light.global.blue["20"],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: nucleus.light.global.blue["40"],
  },
  selectedSuggestionText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: nucleus.light.global.blue["70"],
  },
  completionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 0,
  },
  completeButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: nucleus.light.global.blue["70"],
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButtonText: {
    color: nucleus.light.global.blue["10"],
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 8,
  },
  activeDot: {
    backgroundColor: nucleus.light.semantic.accent.bold,
  },
  inactiveDot: {
    backgroundColor: nucleus.light.global.blue[20],
  },
  paginationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thinkingContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  thinkingBubble: {
    display: 'flex',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'flex-start',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: nucleus.light.semantic.border.muted,
    backgroundColor: nucleus.light.global.blue[80],
    minWidth: 60,
    minHeight: 40,
    maxWidth: '85%',
  },
  thinkingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  thinkingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: nucleus.light.global.blue["10"],
  },
}); 