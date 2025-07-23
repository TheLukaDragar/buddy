import { Image } from "expo-image";
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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

// Message interface
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  sender?: string;
}

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
const shouldShowDateDelimiter = (currentMessage: Message, previousMessage?: Message) => {
  if (!previousMessage) return true;
  
  const currentDate = currentMessage.timestamp.toDateString();
  const previousDate = previousMessage.timestamp.toDateString();
  
  return currentDate !== previousDate;
};

export default function ChatScreen() {
  const translateY = useSharedValue(800); // Start much further off-screen at the bottom
  const opacity = useSharedValue(0);
  const insets = useSafeAreaInsets();
  
  // Message animation values
  const firstMessageOpacity = useRef(new Animated.Value(0)).current;
  const firstMessageTranslateY = useRef(new Animated.Value(20)).current;
  const secondMessageOpacity = useRef(new Animated.Value(0)).current;
  const secondMessageTranslateY = useRef(new Animated.Value(20)).current;
  
  // ScrollView refs and state
  const scrollViewRef = useRef<ScrollView>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  
  // Input state
  const [inputText, setInputText] = useState('');
  
  // Keyboard state
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  
  // Sample messages with timestamps - you can make this dynamic later
  const messages: Message[] = [
    {
      id: '1',
      text: "Hey! I'm here whenever you need me. How can I help you today? 😊",
      isUser: false,
      timestamp: new Date(),
      sender: 'Buddy'
    },
    {
      id: '2',
      text: "Feel free to ask me anything about your workouts, nutrition, or just chat!",
      isUser: false,
      timestamp: new Date(Date.now() + 2000), // 2 seconds later
      sender: 'Buddy'
    },
    {
      id: '3',
      text: "Hi Buddy! I'm really excited to start my fitness journey with you. Can you help me plan a good workout for today?",
      isUser: true,
      timestamp: new Date(Date.now() + 60000), // 1 minute later
    },
    {
      id: '4',
      text: "That's awesome! I love your enthusiasm. Let's create a perfect workout plan tailored just for you. What type of workout are you most interested in?",
      isUser: false,
      timestamp: new Date(Date.now() + 120000), // 2 minutes later
      sender: 'Buddy'
    },
    {
      id: '5',
      text: "I'm thinking maybe something with strength training and cardio mixed together? I want to build muscle but also improve my endurance.",
      isUser: true,
      timestamp: new Date(Date.now() + 180000), // 3 minutes later
    },
    {
      id: '6',
      text: "Perfect choice! A combination of strength and cardio is excellent for overall fitness. I'll design a circuit-style workout that builds muscle while keeping your heart rate up.",
      isUser: false,
      timestamp: new Date(Date.now() + 240000), // 4 minutes later
      sender: 'Buddy'
    },
    {
      id: '7',
      text: "How long should the workout be? I have about 45 minutes today.",
      isUser: true,
      timestamp: new Date(Date.now() + 300000), // 5 minutes later
    },
    {
      id: '8',
      text: "45 minutes is perfect! That gives us enough time for a proper warm-up, main workout, and cool-down. Let me put together something great for you.",
      isUser: false,
      timestamp: new Date(Date.now() + 360000), // 6 minutes later
      sender: 'Buddy'
    }
  ];

  // Trigger animation every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Immediately set to off-screen position (no animation)
      translateY.value = 800;
      opacity.value = 0;
      
      // Reset message animations
      firstMessageOpacity.setValue(0);
      firstMessageTranslateY.setValue(20);
      secondMessageOpacity.setValue(0);
      secondMessageTranslateY.setValue(20);
      
      // Start animation on next frame to ensure reset is complete
      const animationTimer = requestAnimationFrame(() => {
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
      });
      
      return () => {
        // Clear timers on cleanup
        cancelAnimationFrame(animationTimer);
      };
    }, [])
  );
  
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
        }, 100);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
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
    
    messages.forEach((message, index) => {
      const previousMessage = messages[index - 1];
      
      // Add date delimiter if needed
      if (shouldShowDateDelimiter(message, previousMessage)) {
        renderedItems.push(
          <DateDelimiter 
            key={`delimiter-${message.id}`}
            date={formatDateForDelimiter(message.timestamp)}
          />
        );
      }
      
      // Add message
      if (message.isUser) {
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
              {renderMessageText(message.text)}
            </Text>
          </Animated.View>
        );
      } else {
        // Buddy message
        const isFirstBuddyMessage = index === 0 || messages[index - 1]?.isUser;
        
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
              <Text style={styles.buddyName}>{message.sender}</Text>
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
              {renderMessageText(message.text)}
            </Text>
          </Animated.View>
        );
      }
    });
    
    return renderedItems;
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      // Handle sending message logic here
      console.log('Sending message:', inputText);
      setInputText('');
    }
  };

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
          
          <Text style={styles.buddyText}>Buddy</Text>
          
        </View>

        <KeyboardAvoidingView 
          style={styles.mainContent}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
        >
          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
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
              
            </Animated.View>
          </ScrollView>

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TouchableOpacity style={styles.keyboardIconButton}>
                <Image
                  source={require('../../assets/icons/user.svg')} // Using user icon as placeholder for keyboard
                  style={styles.keyboardIcon}
                  contentFit="contain"
                />
              </TouchableOpacity>
              <TextInput
                style={styles.textInputField}
                placeholder="Type a message..."
                placeholderTextColor={nucleus.light.semantic.fg.muted}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity 
                style={[
                  styles.sendButton,
                  { opacity: inputText.trim() ? 1 : 0.5 }
                ]}
                onPress={handleSendMessage}
                disabled={!inputText.trim()}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
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
    elevation: 2,
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
    flex: 1,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    color: nucleus.light.semantic.fg.base,
  },

  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom:80,
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

   inputContainer: {
     paddingHorizontal: 16,
     paddingTop: 16,
     paddingBottom: 16,
   },
   inputWrapper: {
     flexDirection: 'row',
     alignItems: 'center',
     backgroundColor: nucleus.light.semantic.bg.canvas,
     borderRadius: 24,
     paddingHorizontal: 12,
     paddingVertical: 8,
     gap: 8,
     borderWidth: 1,
     borderColor: nucleus.light.semantic.border.muted,
   },
   keyboardIconButton: {
     padding: 8,
   },
   keyboardIcon: {
     width: 24,
     height: 24,
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
     alignItems: 'center',
     justifyContent: 'center',
   },
   sendButtonText: {
     color: nucleus.light.global.blue["10"],
     fontFamily: 'PlusJakartaSans-Bold',
     fontSize: 14,
     fontWeight: '700',
   },
   mainContent: {
     flex: 1,
   },
}); 