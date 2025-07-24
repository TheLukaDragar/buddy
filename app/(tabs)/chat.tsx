import { RootState } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addMessage, clearMessages, setError, setInputCollapsed, setLoading, type ChatMessage } from '@/store/slices/chatSlice';
import { generateAPIUrl } from '@/utils';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Image } from "expo-image";
import { router } from 'expo-router';
import { fetch as expoFetch } from 'expo/fetch';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import { Avatar } from 'react-native-paper';
import ReanimatedAnimated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { nucleus } from '../../Buddy_variables';

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

  // AI SDK Chat Hook - now integrated with Redux
  const { sendMessage } = useChat({
    transport: new DefaultChatTransport({
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: generateAPIUrl('/api/chat'),
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
      // Add AI response to Redux store
      const buddyMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: message.message.parts?.map((part: any) => part.type === 'text' ? part.text : '').join('') || '',
        timestamp: Date.now(),
        parts: message.message.parts as Array<{ type: string; text: string }>,
      };
      dispatch(addMessage(buddyMessage));
      dispatch(setLoading(false));
    },
  });

  // Auto-scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

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

  // Render messages with delimiters
  const renderMessages = () => {
    const renderedItems: React.ReactElement[] = [];
    
    messages.forEach((message: ChatMessage, index: number) => {
      const previousMessage = messages[index - 1];
      const isUser = message.role === 'user';
      
      // Add date delimiter if needed
      if (shouldShowDateDelimiter(message, previousMessage)) {
        renderedItems.push(
          <DateDelimiter 
            key={`delimiter-${message.id}`}
            date={formatDateForDelimiter(new Date(message.timestamp))}
          />
        );
      }
      
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
              {renderMessageText(message.content)}
            </Text>
          </Animated.View>
        );
      } else {
        // Buddy message
        const isFirstBuddyMessage = index === 0 || messages[index - 1]?.role === 'user';
        
        // Add buddy avatar/name only for first message in a group
        if (isFirstBuddyMessage) {
          renderedItems.push(
            <Animated.View 
              key={`buddy-header-${message.id}`}
              style={[
                styles.buddyMessage,
                index < 3 ? {
                  opacity: firstMessageOpacity,
                  transform: [{ translateY: firstMessageTranslateY }],
                } : {}
              ]}
            >
              <Avatar.Image size={40} source={require('../../assets/avatar.png')} style={styles.avatar} />
              <Text style={styles.buddyName}>Buddy</Text>
            </Animated.View>
          );
        }

        // Add message bubble
        renderedItems.push(
          <Animated.View 
            key={message.id}
            style={[
              styles.messageBubble,
              index < 3 ? {
                opacity: index === 0 ? firstMessageOpacity : secondMessageOpacity,
                transform: [{ translateY: index === 0 ? firstMessageTranslateY : secondMessageTranslateY }],
              } : {}
            ]}
          >
            <Text style={styles.messageText}>
              {renderMessageText(message.content)}
            </Text>
          </Animated.View>
        );
      }
    });
    
    return renderedItems;
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      // Add user message to Redux store immediately
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: inputText.trim(),
        timestamp: Date.now(),
      };
      
      dispatch(addMessage(userMessage));
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      // Send to AI
      sendMessage({ text: inputText.trim() });
      setInputText('');
      
      // Auto scroll to bottom after sending
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleClearChat = () => {
    dispatch(clearMessages());
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
              <View style={styles.headerInScroll}>
                <Text style={styles.title}>Welcome to your personal chat with Buddy!</Text>
                <Text style={styles.subtitle}>
                  I'm here to help you with workouts, answer questions, and keep you motivated. Let's chat! 💬
                </Text>
              </View>

              {/* Render messages with delimiters */}
              {renderMessages()}
              
              {/* Show loading indicator when AI is responding */}
              {isLoading && (
                <View style={styles.loadingContainer}>
                  {/* Show buddy header (avatar + name) */}
                  <View style={styles.buddyMessage}>
                    <Avatar.Image size={40} source={require('../../assets/avatar.png')} style={styles.avatar} />
                    <Text style={styles.buddyName}>Buddy</Text>
                  </View>
                  
                  {/* Show thinking bubble below */}
                  <View style={styles.loadingBubble}>
                    <Text style={styles.loadingText}>...</Text>
                  </View>
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
    borderBottomWidth: 1,
    borderBottomColor: nucleus.light.global.grey["30"],
    shadowColor: 'rgba(20, 20, 20, 0.12)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 1,

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