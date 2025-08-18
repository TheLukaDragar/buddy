import { useChat } from '@ai-sdk/react';
import { defaultChatStore } from 'ai';
import { Image } from "expo-image";
import { router } from 'expo-router';
import { fetch as expoFetch } from 'expo/fetch';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import { Avatar } from 'react-native-paper';
import ReanimatedAnimated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { nucleus } from '../../Buddy_variables';
import CategoryPills from '../../components/CategoryPills';
import { RootState } from '../../store';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addMessage, clearMessages, setError, setInputCollapsed, setLoading, type ChatMessage } from '../../store/slices/chatSlice';
import { generateAPIUrl } from '../../utils';

// Animated thinking dot component (same as onboarding)
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

// Date delimiter component
const DateDelimiter = ({ date }: { date: string }) => (
  <View style={styles.dateDelimiter}>
    <View style={styles.delimiterLine} />
    <Text style={styles.delimiterText}>{date}</Text>
    <View style={styles.delimiterLine} />
  </View>
);

// Helper function to format time
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

// Helper function to format date for delimiter
const formatDateForDelimiter = (date: Date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'TODAY';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'YESTERDAY';
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    }).toUpperCase();
  }
};

// Helper function to check if we need a date delimiter
const shouldShowDateDelimiter = (currentMessage: ChatMessage, previousMessage?: ChatMessage) => {
  if (!previousMessage) return true;
  
  const currentDate = new Date(currentMessage.timestamp).toDateString();
  const previousDate = new Date(previousMessage.timestamp).toDateString();
  
  return currentDate !== previousDate;
};

export default function ChatScreen() {
  const translateY = useSharedValue(800);
  const opacity = useSharedValue(0);
  const insets = useSafeAreaInsets();
  
  // Input collapse animation values
  const keyboardButtonScale = useSharedValue(1);
  const inputWrapperWidth = useSharedValue(-1); // -1 means not set yet
  const initialWrapperWidth = useSharedValue(0); // Store the initial width
  const inputOpacity = useSharedValue(1);
  const sendButtonOpacity = useSharedValue(1);
  const inputScale = useSharedValue(1);
  const sendButtonScale = useSharedValue(1);
  const [isInputCollapsed, setIsInputCollapsed] = useState(false);
  
  // Chat session management
  const [chatId, setChatId] = useState(() => `chat-${Date.now()}`);
  
  // Redux selectors and actions
  const dispatch = useAppDispatch();
  const { messages, isLoading, error } = useAppSelector((state: RootState) => (state as any).chat);
  const userProfile = useAppSelector((state: RootState) => (state as any).user?.extractedProfile);

  // Message animation values
  const firstMessageOpacity = useRef(new Animated.Value(0)).current;
  const firstMessageTranslateY = useRef(new Animated.Value(20)).current;
  const secondMessageOpacity = useRef(new Animated.Value(0)).current;
  const secondMessageTranslateY = useRef(new Animated.Value(20)).current;
  
  // ScrollView refs and state
  const scrollViewRef = useRef<ScrollView>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  
  // Keyboard state
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  
  // Input state
  const [inputText, setInputText] = useState('');
  
  // Category pills state
  const [selectedCategory, setSelectedCategory] = useState('general');
  
  // Text animation state
  const textOpacity = useSharedValue(1);
  const textTranslateY = useSharedValue(0);
  
  // Category pills animation state
  const pillsHeight = useSharedValue(56); // Initial height for pills container
  const pillsOpacity = useSharedValue(1);
  
  // Mode-specific welcome texts
  const getModeText = (mode: string) => {
    const modeTexts = {
      general: {
        title: 'Welcome to your personal chat with Buddy!',
        subtitle: "I'm here to help you with workouts, answer questions, and keep you motivated. Let's chat! 💬"
      },
      streak: {
        title: 'Keep your streak alive! 🏠',
        subtitle: "Let's talk about maintaining consistency and building lasting workout habits. I'm here to help you stay on track! 🔥"
      },
      illness: {
        title: 'Feeling under the weather? 🤒',
        subtitle: "I'll help you adjust your routine safely while you recover. Your health comes first, and I'm here to guide you! 💙"
      },
      injury: {
        title: 'Injury recovery support 🤕',
        subtitle: "Let's work together on safe modifications and recovery strategies. I'll help you stay active while healing properly! 🩹"
      },
      nutrition: {
        title: 'Fuel your fitness journey! 🥗',
        subtitle: "Ready to optimize your nutrition? I'll help you with meal planning, macros, and healthy eating habits! 🍎"
      },
      motivation: {
        title: 'Let me pump you up! 💪',
        subtitle: "Need some extra motivation? I'm here to boost your confidence and remind you how amazing you are! ⚡"
      },
      form: {
        title: 'Perfect your technique! ✅',
        subtitle: "Let's nail that form! I'll help you with exercise technique, proper alignment, and movement quality! 🎯"
      },
      recovery: {
        title: 'Recovery and rest mode 😴',
        subtitle: "Rest is just as important as training! Let's talk about sleep, recovery, and taking care of your body! 🛌"
      },
      goals: {
        title: 'Crush your fitness goals! 🎯',
        subtitle: "Time to set and smash those goals! I'll help you create a roadmap to success and celebrate your wins! 🏆"
      },
      equipment: {
        title: 'Gear up for success! 🏋️',
        subtitle: "Need equipment advice? I'll help you choose the right gear for your home gym or workout needs! 🔧"
      },
      cardio: {
        title: 'Get your heart pumping! 🏃',
        subtitle: "Ready for some cardio? Let's talk about running, cycling, HIIT, and getting that heart rate up! ❤️"
      },
      strength: {
        title: 'Build serious strength! 💎',
        subtitle: "Time to get strong! I'll help you with strength training, progressive overload, and building muscle! 🏗️"
      }
    };
    return modeTexts[mode as keyof typeof modeTexts] || modeTexts.general;
  };
  
  // Category pills data - fitness chat modes
  const categories = [
    { id: 'general', label: 'General' },
    { id: 'streak', label: 'Streak', emoji: '🏠' },
    { id: 'illness', label: 'Illness', emoji: '🤒' },
    { id: 'injury', label: 'Injury', emoji: '🤕' },
    { id: 'nutrition', label: 'Nutrition', emoji: '🥗' },
    { id: 'motivation', label: 'Motivation', emoji: '💪' },
    { id: 'form', label: 'Form Check', emoji: '✅' },
    { id: 'recovery', label: 'Recovery', emoji: '😴' },
    { id: 'goals', label: 'Goals', emoji: '🎯' },
    { id: 'equipment', label: 'Equipment', emoji: '🏋️' },
    { id: 'cardio', label: 'Cardio', emoji: '🏃' },
    { id: 'strength', label: 'Strength', emoji: '💎' },
  ];

  // AI SDK Chat Hook - now with proper streaming like onboarding
  const { messages: aiMessages, append, status, setMessages: setAiMessages } = useChat({
    id: chatId, // Use the chat session ID
    chatStore: defaultChatStore({
      api: generateAPIUrl('/api/chat'),
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      body: {
        userProfile: userProfile, // Include user profile in requests
      },
    }),
    onError: (error) => {
      console.error('Chat error:', error);
      dispatch(setError(error.message));
      dispatch(setLoading(false));
    },
    onFinish: (message) => {
      console.log('AI message finished streaming:', message);
      
      // Add AI response to Redux store for persistence
      const buddyMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: message.message.parts?.map((part) => part.type === 'text' ? (part as { type: 'text'; text: string }).text : '').join('') || '',
        timestamp: Date.now(),
        parts: message.message.parts as Array<{ type: string; text: string }>,
      };
      dispatch(addMessage(buddyMessage));
      dispatch(setLoading(false));
      
      // Auto scroll to bottom after streaming completes
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
  });

  // Auto-scroll when AI messages change (like onboarding)
  useEffect(() => {
    if (aiMessages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [aiMessages]);

  // Hide category pills when there are messages
  useEffect(() => {
    // Filter out control messages to get actual chat messages
    const visibleMessages = aiMessages.filter((message, index) => {
      if (index === 0 && message.role === 'user') {
        const textContent = message.parts
          ?.filter(part => part.type === 'text')
          .map(part => (part as any).text)
          .join('');
        return !textContent?.includes('User is ready to start');
      }
      return true;
    });

    const hasMessages = visibleMessages.length > 0;
    
    if (hasMessages) {
      // Collapse pills smoothly
      pillsHeight.value = withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      pillsOpacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      // Show pills
      pillsHeight.value = withTiming(56, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      pillsOpacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [aiMessages]);

  // Trigger animation only on first mount
  useEffect(() => {
    // Start animation immediately on mount
    translateY.value = withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.exp),
    });
    opacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.exp),
    });
    
    // Animate messages after main animation completes
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(firstMessageOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(firstMessageTranslateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(secondMessageOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(secondMessageTranslateY, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Auto-scroll to bottom after all animations complete
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 500);
        });
      }, 1200);
    }, 400);
  }, []); // Empty dependency array - runs only once on mount
  
  // Keyboard listeners
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
        setIsKeyboardVisible(true);
        // Auto scroll to bottom when keyboard shows
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 0);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
        // Auto scroll to bottom when keyboard hides
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 0); // Slightly longer delay for keyboard hide animation
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const animatedPillsStyle = useAnimatedStyle(() => ({
    height: pillsHeight.value,
    opacity: pillsOpacity.value,
    overflow: 'hidden',
  }));

  const renderMessageText = (text: string) => {
    // Handle bold text marked with **text** and italic/custom text marked with *text*
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <Text key={index} style={styles.customText}>{part.slice(2, -2)}</Text>;
      }
      // Handle single asterisk text marked with *text*
      if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return <Text key={index} style={styles.customText}>{part.slice(1, -1)}</Text>;
      }
      return part;
    });
  };

  // Render messages with delimiters - use AI SDK messages like onboarding to prevent flickering
  const renderMessages = () => {
    const renderedItems: React.ReactElement[] = [];
    
    // Use AI SDK messages for rendering (like onboarding) to prevent flickering
    // Filter out the first control message if it exists
    const visibleMessages = aiMessages.filter((message, index) => {
      // Hide the first user message if it's a control message
      if (index === 0 && message.role === 'user') {
        const textContent = message.parts
          ?.filter(part => part.type === 'text')
          .map(part => (part as any).text)
          .join('');
        
        // Hide if it's a control message
        if (textContent?.includes('User is ready to start')) {
          return false;
        }
      }
      return true;
    });
    
    visibleMessages.forEach((message, index) => {
      const previousMessage = visibleMessages[index - 1];
      const isUser = message.role === 'user';
      
      // Add date delimiter if needed (only for Redux messages)
      // For now, skip delimiters since we're using AI SDK messages
      
      // Add message
      if (isUser) {
        // User message
        renderedItems.push(
          <Animated.View 
            key={message.id}
            style={[
              styles.userMessageBubble,
              index < 3 ? {
                opacity: secondMessageOpacity,
                transform: [{ translateY: secondMessageTranslateY }],
              } : {}
            ]}
          >
            <Text style={styles.userMessageText}>
              {renderMessageText(message.parts?.map(part => part.type === 'text' ? (part as any).text : '').join('') || '')}
            </Text>
          </Animated.View>
        );
      } else {
        // Buddy message - ALWAYS show avatar and name (like onboarding)
        renderedItems.push(
          <View key={message.id} style={{ width: '100%' }}>
            <View style={styles.buddyMessage}>
              {/* <Avatar.Image size={40} source={require('../../assets/avatar.png')} style={styles.avatar} /> */}
              <Text style={styles.buddyName}>Buddy</Text>
            </View>
            
            <Animated.View 
              style={[
                styles.messageBubble,
                index < 3 ? {
                  opacity: index === 0 ? firstMessageOpacity : secondMessageOpacity,
                  transform: [{ translateY: index === 0 ? firstMessageTranslateY : secondMessageTranslateY }],
                } : {}
              ]}
            >
              <Text style={styles.messageText}>
                {renderMessageText(message.parts?.map(part => part.type === 'text' ? (part as any).text : '').join('') || '')}
              </Text>
            </Animated.View>
          </View>
        );
      }
    });
    
    return renderedItems;
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      // Add user message to Redux store for persistence
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: inputText.trim(),
        timestamp: Date.now(),
      };
      
      dispatch(addMessage(userMessage));
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      // Send to AI (this will add the message to aiMessages automatically)
      append({ role: 'user', parts: [{ type: 'text', text: inputText.trim() }] });
      setInputText('');
      
      // Auto scroll to bottom after sending
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleClearChat = () => {
    // Generate a new chat ID to create a fresh chat session
    setChatId(`chat-${Date.now()}`);
    // Clear Redux store
    dispatch(clearMessages());
    // Clear any loading states
    dispatch(setLoading(false));
    dispatch(setError(null));
    
    // Show pills again when chat is cleared
    pillsHeight.value = withTiming(56, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
    pillsOpacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  };

  const handleCategorySelect = (categoryId: string) => {
    // Animate text out first
    textOpacity.value = withTiming(0, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
    textTranslateY.value = withTiming(-10, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
    
    // Change category and animate text back in
    setTimeout(() => {
      setSelectedCategory(categoryId);
      
      // Reset position and animate back in
      textTranslateY.value = 10;
      textOpacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      textTranslateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    }, 200);
    
    console.log('Selected category:', categoryId);
  };

  const handleCollapseInput = () => {
    const newCollapsedState = !isInputCollapsed;
    setIsInputCollapsed(newCollapsedState);
    
    // Dispatch to Redux store
    dispatch(setInputCollapsed(newCollapsedState));
    
    if (newCollapsedState) {
      // Store initial width if not stored yet
      if (initialWrapperWidth.value === 0 && inputWrapperWidth.value > 0) {
        initialWrapperWidth.value = inputWrapperWidth.value;
      }
      
      // Collapse animation - animate everything at once
      inputWrapperWidth.value = withTiming(56, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      
      // Input field disappears
      inputOpacity.value = withTiming(0, {
        duration: 250,
        easing: Easing.out(Easing.cubic),
      });
      inputScale.value = withTiming(0.8, {
        duration: 250,
        easing: Easing.out(Easing.cubic),
      });
      
      // Send button disappears
      sendButtonOpacity.value = withTiming(0, {
        duration: 250,
        easing: Easing.out(Easing.cubic),
      });
      sendButtonScale.value = withTiming(0.8, {
        duration: 250,
        easing: Easing.out(Easing.cubic),
      });
      
      // Keyboard button scales up slightly
      keyboardButtonScale.value = withTiming(1.0, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      // Expand animation - everything appears at once
      inputWrapperWidth.value = withTiming(initialWrapperWidth.value, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      
      // Input field appears
      inputOpacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      inputScale.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      
      // Send button appears
      sendButtonOpacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      sendButtonScale.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      
      // Keyboard button returns to normal
      keyboardButtonScale.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
    }
  };

  // Animated styles for input collapse
  const animatedInputStyle = useAnimatedStyle(() => ({
    flex: inputOpacity.value > 0.1 ? 1 : 0,
    opacity: inputOpacity.value,
    transform: [{ scale: inputScale.value }],
    position: inputOpacity.value > 0.1 ? 'relative' : 'absolute',
    width: inputOpacity.value > 0.1 ? 'auto' : 0,
    height: inputOpacity.value > 0.1 ? 'auto' : 0,
    overflow: 'hidden',
  }));

  const animatedSendButtonStyle = useAnimatedStyle(() => ({
    opacity: sendButtonOpacity.value,
    transform: [{ scale: sendButtonScale.value }],
    position: sendButtonOpacity.value > 0.1 ? 'relative' : 'absolute',
    width: sendButtonOpacity.value > 0.1 ? 'auto' : 0,
    height: sendButtonOpacity.value > 0.1 ? 'auto' : 0,
    overflow: 'hidden',
  }));

  const animatedKeyboardButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: keyboardButtonScale.value }],
  }));

  const animatedWrapperStyle = useAnimatedStyle(() => ({
    width: inputWrapperWidth.value === -1 ? 'auto' : inputWrapperWidth.value,
    minHeight: 56, // Fixed height to prevent vertical jumping
    maxHeight: 56,
    overflow: 'hidden', // Clip any overflowing content
    justifyContent: 'center',
    alignItems: 'center',
  }));

  // Show error if API call fails
  if (error) {
    console.error('Chat error:', error);
  }

  return (
    <ReanimatedAnimated.View 
      style={[styles.fullScreen, { backgroundColor: nucleus.light.semantic.bg.subtle }, animatedStyle]}
    >
      <SystemBars style="dark" />
      <SafeAreaView style={[styles.container, { backgroundColor: nucleus.light.semantic.bg.subtle }]} edges={['top', 'bottom']}>
        <View style={styles.topNav}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Image
              source={require('../../assets/icons/cross.svg')}
              style={styles.crossIcon}
              contentFit="contain"
            />
          </TouchableOpacity>
          
          <Text style={styles.buddyText}>Chat</Text>
          
          <TouchableOpacity
            onPress={handleClearChat}
            style={styles.newChatButton}
          >
            <Text style={styles.newChatText}>New Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Category Pills - positioned below the top nav */}
        <ReanimatedAnimated.View style={[styles.categoryPillsContainer, animatedPillsStyle]}>
          <CategoryPills
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />
        </ReanimatedAnimated.View>

        <KeyboardAvoidingView 
          style={styles.mainContent}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollContainer}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: isKeyboardVisible ? 20 : 80 }]}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            decelerationRate="normal"
            bounces={true}
            bouncesZoom={false}
            onContentSizeChange={(w, h) => setContentHeight(h)}
            onLayout={(event) => setScrollViewHeight(event.nativeEvent.layout.height)}
          >
            <Animated.View 
              style={[
                styles.chatContainer,
              ]}
            >
              {/* Header inside scroll view */}
              <ReanimatedAnimated.View 
                style={[styles.headerInScroll, animatedTextStyle]}
              >
                <Text style={styles.title}>{getModeText(selectedCategory).title}</Text>
                <Text style={styles.subtitle}>
                  {getModeText(selectedCategory).subtitle}
                </Text>
              </ReanimatedAnimated.View>

              {/* Render messages with delimiters */}
              {renderMessages()}
              
              {/* Buddy thinking indicator - only show when submitted, not when streaming (like onboarding) */}
              {status === 'submitted' && (
                <View style={{ width: '100%' }}>
                  <View style={styles.buddyMessage}>
                    {/* <Avatar.Image size={40} source={require('../../assets/avatar.png')} style={styles.avatar} /> */}
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
          <View style={[styles.inputContainer, { paddingBottom: isKeyboardVisible ? 16 : 0 }]}>
            <ReanimatedAnimated.View 
              style={[styles.inputWrapper, animatedWrapperStyle]}
              onLayout={(e) => {
                if (inputWrapperWidth.value === -1) {
                  const width = e.nativeEvent.layout.width;
                  inputWrapperWidth.value = width;
                  initialWrapperWidth.value = width;
                }
              }}
            >
              <ReanimatedAnimated.View style={animatedKeyboardButtonStyle}>
                <TouchableOpacity 
                  style={styles.keyboardIconButton}
                  onPress={handleCollapseInput}
                >
                  <Image
                    source={require('../../assets/icons/keyboard.svg')}
                    style={styles.keyboardIcon}
                    contentFit="contain"
                  />
                </TouchableOpacity>
              </ReanimatedAnimated.View>
              <ReanimatedAnimated.View style={[animatedInputStyle]}>
                <TextInput
                  style={styles.textInputField}
                  placeholder="Type a message..."
                  placeholderTextColor={nucleus.light.semantic.fg.muted}
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={500}
                />
              </ReanimatedAnimated.View>
              <ReanimatedAnimated.View style={animatedSendButtonStyle}>
                <TouchableOpacity 
                  style={[
                    styles.sendButton,
                    { opacity: inputText.trim() ? 1 : 0.5 }
                  ]}
                  onPress={handleSendMessage}
                  disabled={!inputText.trim() || isLoading}
                >
                  <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
              </ReanimatedAnimated.View>
            </ReanimatedAnimated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ReanimatedAnimated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullScreen: {
    flex: 1,
  },
  topNav: {
    
    height: 64,
    paddingVertical: 16,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    shadowColor: 'rgba(20, 20, 20, 0.12)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 1,
  },
  categoryPillsContainer: {
    paddingTop: 0,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: nucleus.light.global.grey["30"],
  },
  backButton: {
    position: 'absolute',
    left: 8,
    top: 4,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
  },
  crossIcon: {
    width: 32,
    height: 32,
  },
  buddyText: {
    color: nucleus.light.semantic.fg.base,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    letterSpacing: 0,
  },
  newChatButton: {
    position: 'absolute',
    right: 8,
    top: 4,
    height: 56,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newChatText: {
        position: 'absolute',
        right: 16,
        top: 23,
        color: nucleus.light.global.grey[100],
        textAlign: 'right',
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 14,
        fontStyle: 'normal',
        fontWeight: '700',
        lineHeight: 18,
        letterSpacing: 0,
  },

  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 80,
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
  headerInScroll: {
    marginTop: 16,
    marginBottom: 24,
    gap: 8,
  },
  title: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28.8, // 120% of 24px
    letterSpacing: -1,
    color: nucleus.light.semantic.fg.base,
  },
  subtitle: {
    alignSelf: 'stretch',
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 21, // 150% of 14px
    letterSpacing: 0,
    color: '#6E7375',
  },
  buddyMessage: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buddyName: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 17,
    paddingBottom: 8,
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
    maxWidth: '80%',
    flexShrink: 1,
  },
  messageText: {
    color: nucleus.light.global.blue["10"],
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 21, // 150% of 14px
    letterSpacing: 0,
  },
  customText: {
    color: nucleus.light.global.blue["10"],
    fontFamily: 'PlusJakartaSans-Regular',
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
    maxWidth: '80%',
    flexShrink: 1,
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
  messageTimestamp: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 18, // 150% of 12px
    letterSpacing: 0,
    color: '#6E7375',
    alignSelf: 'flex-end',
    marginTop: 4,
  },

  dateDelimiter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    width: '100%',
  },
  delimiterLine: {
    flex: 1,
    height: 1,
    backgroundColor: nucleus.light.global.grey["30"], // #daddde
  },
  delimiterText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: 18, // 150% of 12px
    letterSpacing: 0,
    color: '#6E7375',
    marginHorizontal: 16,
  },

  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 8,
    paddingBottom: 80,
  },
  loadingBubble: {
    display: 'flex',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: nucleus.light.semantic.border.muted,
    backgroundColor: nucleus.light.global.blue[80],
    maxWidth: '80%',
  },
  loadingText: {
    color: nucleus.light.global.blue["10"],
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: '400',
    lineHeight: 21,
    letterSpacing: 0,
  },
  thinkingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: nucleus.light.global.blue["10"],
  },
  thinkingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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

  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 0,
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
    // Shadow similar to floating buttons in workout.tsx
    shadowColor: 'rgba(185, 230, 255, 0.40)',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 25,
    elevation: 25,
    shadowOpacity: 1,
  },
  keyboardIconButton: {
    padding: 8,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 48,
    minHeight: 48,
    width: 48,
    height: 48,
  },
  keyboardIcon: {
    width: 28,
    height: 28,
    tintColor: nucleus.light.semantic.accent.intense,
  },
  textInputField: {
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
    lineHeight: 16.8, // 120% of 14px
    marginVertical: 0,
    includeFontPadding: false,
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
  },
}); 