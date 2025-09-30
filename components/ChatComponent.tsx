import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Image } from "expo-image";
import { fetch as expoFetch } from 'expo/fetch';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Avatar } from 'react-native-paper';
import ReanimatedAnimated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { nucleus } from '../Buddy_variables';
import { RootState } from '../store';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addMessage, clearMessages, setError, setInputCollapsed, setLoading, type ChatMessage } from '../store/slices/chatSlice';
import { generateAPIUrl } from '../utils';

// Import ElevenLabs types
import type {
  ConversationEvent,
  ConversationStatus,
  Mode,
  Role
} from '@elevenlabs/react-native';

// Define specific event types locally based on the ConversationEvent union
type UserTranscriptionEvent = Extract<ConversationEvent, { type: "user_transcript" }>;
type AgentResponseEvent = Extract<ConversationEvent, { type: "agent_response" }>;
type AgentResponseCorrectionEvent = Extract<ConversationEvent, { type: "agent_response_correction" }>;
type ClientToolCallEvent = Extract<ConversationEvent, { type: "client_tool_call" }>;
type InterruptionEvent = Extract<ConversationEvent, { type: "interruption" }>;
type InternalTentativeAgentResponseEvent = Extract<ConversationEvent, { type: "internal_tentative_agent_response" }>;

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

// Lookup table for tool call names to human-readable messages
const getToolCallMessage = (toolName: string, parameters?: any) => {
  switch (toolName) {
    // Music tools (14)
    case 'start_music':
      if (parameters?.intensity) {
        return `Starting ${parameters.intensity} intensity music`;
      }
      return 'Starting music';
      
    case 'pause_music':
      return 'Pausing music';
      
    case 'resume_music':
      return 'Resuming music';
      
    case 'stop_music':
      return 'Stopping music';
      
    case 'set_volume':
      if (parameters?.volume !== undefined) {
        return `Setting volume to ${parameters.volume}%`;
      }
      return 'Adjusting volume';
      
    case 'skip_next':
      return 'Skipping to next song';
      
    case 'skip_previous':
      return 'Going to previous song';
      
    case 'get_music_status':
      return 'Checking music status';
      
    case 'play_playlist':
      if (parameters?.playlist) {
        return `Playing playlist "${parameters.playlist}"`;
      }
      if (parameters?.name) {
        return `Playing playlist "${parameters.name}"`;
      }
      return 'Playing playlist';
      
    case 'play_song':
      if (parameters?.song) {
        return `Playing "${parameters.song}"`;
      }
      if (parameters?.title) {
        return `Playing "${parameters.title}"`;
      }
      return 'Playing song';
      
    case 'play_track':
      if (parameters?.trackName) {
        return `Playing "${parameters.trackName}"`;
      }
      if (parameters?.trackIndex !== undefined) {
        return `Playing track ${parameters.trackIndex + 1}`;
      }
      return 'Playing track';
      
    case 'get_tracks':
      return 'Getting playlist tracks';
      
    case 'select_playlist':
      if (parameters?.playlist) {
        return `Selecting playlist "${parameters.playlist}"`;
      }
      if (parameters?.name) {
        return `Selecting playlist "${parameters.name}"`;
      }
      if (parameters?.playlistName) {
        return `Selecting playlist "${parameters.playlistName}"`;
      }
      return 'Selecting playlist';
      
    case 'get_playlists':
      return 'Getting available playlists';
    
    // Workout tools (13)
    case 'start_set':
      return 'Starting the set';
      
    case 'complete_set':
      return 'Set completed';
      
    case 'pause_set':
      if (parameters?.reason) {
        return `Pausing set (${parameters.reason})`;
      }
      return 'Pausing the set';
      
    case 'resume_set':
      return 'Resuming the set';
      
    case 'restart_set':
      return 'Restarting the set';
      
    case 'extend_rest':
      if (parameters?.seconds !== undefined) {
        return `Extending rest by ${parameters.seconds}s`;
      }
      if (parameters?.duration !== undefined) {
        return `Extending rest by ${parameters.duration}s`;
      }
      return 'Extending rest time';
      
    case 'jump_to_set':
      if (parameters?.setNumber !== undefined) {
        return `Jumping to set ${parameters.setNumber}`;
      }
      if (parameters?.set !== undefined) {
        return `Jumping to set ${parameters.set}`;
      }
      return 'Jumping to set';
      
    case 'adjust_weight':
      if (parameters?.weight !== undefined) {
        const unit = parameters?.unit || 'kg';
        return `Adjusting weight to ${parameters.weight}${unit}`;
      }
      if (parameters?.newWeight !== undefined) {
        const unit = parameters?.unit || 'kg';
        return `Adjusting weight to ${parameters.newWeight}${unit}`;
      }
      return 'Adjusting weight';
      
    case 'adjust_reps':
      if (parameters?.reps !== undefined) {
        return `Adjusting to ${parameters.reps} reps`;
      }
      if (parameters?.newReps !== undefined) {
        return `Adjusting to ${parameters.newReps} reps`;
      }
      return 'Adjusting reps';
      
    case 'adjust_rest_time':
      if (parameters?.seconds !== undefined) {
        return `Setting rest time to ${parameters.seconds}s`;
      }
      if (parameters?.time !== undefined) {
        return `Setting rest time to ${parameters.time}s`;
      }
      if (parameters?.newTime !== undefined) {
        return `Setting rest time to ${parameters.newTime}s`;
      }
      return 'Adjusting rest time';
      
    case 'get_workout_status':
      return 'Getting workout status';
      
    case 'get_exercise_instructions':
      if (parameters?.exercise) {
        return `Getting instructions for ${parameters.exercise}`;
      }
      return 'Getting exercise instructions';
      
    case 'pause_for_issue':
      if (parameters?.issue) {
        return `Pausing workout (${parameters.issue})`;
      }
      if (parameters?.reason) {
        return `Pausing workout (${parameters.reason})`;
      }
      return 'Pausing for issue';
      
    case 'show_ad':
      return 'Showing product recommendation';
    
    default:
      return `Performing ${toolName}`;
  }
};

  // Helper function to check if we need a date delimiter
const shouldShowDateDelimiter = (currentMessage: ChatMessage, previousMessage?: ChatMessage) => {
  if (!previousMessage) return true;
  
  const currentDate = new Date(currentMessage.timestamp).toDateString();
  const previousDate = new Date(previousMessage.timestamp).toDateString();
  
  return currentDate !== previousDate;
};

// Helper function to process conversation events into displayable messages
const processConversationEvent = (event: ConversationEvent, source: Role): ExtendedChatMessage | null => {
  // Ignore ping events and interruption events
  if (event.type === 'ping' || event.type === 'interruption' || event.type === 'conversation_initiation_metadata') {
    return null;
  }
  
  const baseMessage: Partial<ExtendedChatMessage> = {
    id: `event-${Date.now()}-${Math.random()}`,
    timestamp: Date.now(),
    conversationEvent: event,
    eventSource: source,
  };

  switch (event.type) {
    case 'user_transcript':
      const userEvent = event as UserTranscriptionEvent;
      return {
        ...baseMessage,
        role: 'user',
        content: userEvent.user_transcription_event.user_transcript.trim(),
        eventType: 'voice',
      } as ExtendedChatMessage;

    case 'agent_response':
      const agentEvent = event as AgentResponseEvent;
      return {
        ...baseMessage,
        role: 'assistant',
        content: agentEvent.agent_response_event.agent_response.trim(),
        eventType: 'voice',
      } as ExtendedChatMessage;

    case 'agent_response_correction':
      // Don't create a new message for corrections - they'll be handled by replacing the original
      return null;

    case 'client_tool_call':
      const toolEvent = event as ClientToolCallEvent;
      return {
        ...baseMessage,
        role: 'assistant',
        content: getToolCallMessage(toolEvent.client_tool_call.tool_name, toolEvent.client_tool_call.parameters),
        eventType: 'tool_call',
      } as ExtendedChatMessage;

    // Interruption events are filtered out above, so this case won't be reached

    case 'internal_tentative_agent_response':
      const tentativeEvent = event as InternalTentativeAgentResponseEvent;
      return {
        ...baseMessage,
        role: 'assistant',
        content: `💭 ${tentativeEvent.tentative_agent_response_internal_event.tentative_agent_response}`.trim(),
        eventType: 'voice',
      } as ExtendedChatMessage;

    default:
      // For other events, create a generic status message
      return {
        ...baseMessage,
        role: 'assistant',
        content: `📡 ${event.type} event received`.trim(),
        eventType: 'status',
      } as ExtendedChatMessage;
  }
};

// Extended chat message type to include conversation events
export interface ExtendedChatMessage extends ChatMessage {
  conversationEvent?: ConversationEvent;
  eventSource?: Role;
  eventType?: 'text' | 'voice' | 'status' | 'tool_call' | 'interruption' | 'correction';
}

// Conversation event handler props
export interface ConversationEventHandlers {
  conversationEvents?: ConversationEvent[];
  conversationMode?: Mode;
  conversationStatus?: ConversationStatus;
  canSendFeedback?: boolean;
  onEventReceived?: (event: ConversationEvent, source: Role) => void;
  onSendTextMessage?: (message: string) => void;
}

interface ChatComponentProps extends ConversationEventHandlers {
  showHeader?: boolean;
  headerTitle?: string;
  headerSubtitle?: string;
  showNewChatButton?: boolean;
  onBack?: () => void;
  onNewChat?: () => void;
  containerStyle?: any;
  contentStyle?: any;
  keyboardAvoidingBehavior?: 'height' | 'padding' | 'position';
  keyboardVerticalOffset?: number;
  maxHeight?: number; // Maximum height constraint for the component
  onKeyboardToggle?: (isVisible: boolean, keyboardHeight: number) => void; // Callback for keyboard state changes
  disableKeyboardAvoidance?: boolean; // Disable KeyboardAvoidingView when parent handles it
  scrollToBottomTrigger?: number; // Increment this to trigger scroll to bottom
}

export default function ChatComponent({
  showHeader = true,
  headerTitle = "Welcome to your personal chat with Buddy!",
  headerSubtitle = "I'm here to help you with workouts, answer questions, and keep you motivated. Let's chat! 💬",
  showNewChatButton = true,
  onBack,
  onNewChat,
  containerStyle,
  contentStyle,
  keyboardAvoidingBehavior = 'padding',
  keyboardVerticalOffset = 0,
  maxHeight,
  onKeyboardToggle,
  disableKeyboardAvoidance = false,
  scrollToBottomTrigger = 0,
  // Conversation event props
  conversationEvents = [],
  conversationMode,
  conversationStatus,
  canSendFeedback,
  onEventReceived,
  onSendTextMessage
}: ChatComponentProps) {
  // Input collapse animation values
  const keyboardButtonScale = useSharedValue(1);
  const inputWrapperWidth = useSharedValue(-1); // -1 means not set yet
  const initialWrapperWidth = useSharedValue(0); // Store the initial width
  const inputOpacity = useSharedValue(1);
  const sendButtonOpacity = useSharedValue(1);
  const inputScale = useSharedValue(1);
  const sendButtonScale = useSharedValue(1);
  const [isInputCollapsed, setIsInputCollapsed] = useState(false);
  
  // Animated height for smooth transitions
  const animatedHeight = useSharedValue(maxHeight || 400); // Start with reasonable default
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Update animated height when maxHeight prop changes
  useEffect(() => {
    if (maxHeight && maxHeight > 0 && !isNaN(maxHeight)) {
      if (hasInitialized) {
        // Only animate after initial render
        animatedHeight.value = withTiming(maxHeight, {
          duration: 200,
          easing: Easing.out(Easing.quad),
        });
      } else {
        // Set immediately on first render to prevent jump
        animatedHeight.value = maxHeight;
        setHasInitialized(true);
      }
    }
  }, [maxHeight, hasInitialized]);
  
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
  
  // Conversation events state
  const [processedEvents, setProcessedEvents] = useState<ExtendedChatMessage[]>([]);
  const [lastProcessedCount, setLastProcessedCount] = useState(0);

  // Function to handle message corrections by replacing the original message
  const handleMessageCorrection = (correctionEvent: AgentResponseCorrectionEvent) => {
    const originalText = correctionEvent.agent_response_correction_event.original_agent_response.trim();
    const correctedText = correctionEvent.agent_response_correction_event.corrected_agent_response.trim();
    
    setProcessedEvents(prev => {
      return prev.map(event => {
        // Find the message with the original text and replace it
        if (event.role === 'assistant' && event.content.trim() === originalText) {
          return {
            ...event,
            content: correctedText,
            eventType: 'correction' as const,
          };
        }
        return event;
      });
    });
    
    // Auto scroll to bottom after correction to ensure user sees the updated message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  // AI SDK Chat Hook - now integrated with Redux
  const { sendMessage } = useChat({
    transport: new DefaultChatTransport({
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
      // Add AI response to Redux store
      const buddyMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: message.message.parts?.map((part: any) => part.type === 'text' ? part.text : '').join('') || '',
        timestamp: Date.now(),
        parts: message.message.parts as { type: string; text: string }[],
      };
      dispatch(addMessage(buddyMessage));
      dispatch(setLoading(false));
    },
  });

  // Process only NEW conversation events when they change
  useEffect(() => {
    if (conversationEvents && conversationEvents.length > lastProcessedCount) {
      const newProcessedEvents: ExtendedChatMessage[] = [];
      
      // Only process events from the last processed count onwards
      const newEvents = conversationEvents.slice(lastProcessedCount);
      
      newEvents.forEach(event => {
        // Handle corrections specially by replacing the original message
        if (event.type === 'agent_response_correction') {
          handleMessageCorrection(event as AgentResponseCorrectionEvent);
          // Still notify parent about the correction event
          if (onEventReceived) {
            onEventReceived(event, 'ai');
          }
          return;
        }

        // Determine the source role based on event type
        let source: Role = 'ai';
        if (event.type === 'user_transcript') {
          source = 'user';
        }
        
        const processedEvent = processConversationEvent(event, source);
        if (processedEvent) {
          newProcessedEvents.push(processedEvent);
        }
        
        // Notify parent about event processing
        if (onEventReceived) {
          onEventReceived(event, source);
        }
      });
      
      // Only update state if we have new events
      if (newProcessedEvents.length > 0) {
        setProcessedEvents(prev => [...prev, ...newProcessedEvents]);
        
        // Auto scroll to bottom when new conversation events are added
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
      
      // Update the count of processed events
      setLastProcessedCount(conversationEvents.length);
    }
  }, [conversationEvents, onEventReceived, lastProcessedCount]);

  // Auto-scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Auto-scroll when conversation events change
  useEffect(() => {
    if (processedEvents.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [processedEvents]);

  // Scroll to bottom when external trigger changes (from modal transitions)
  useEffect(() => {
    if (scrollToBottomTrigger > 0) {
      // Delay scroll to ensure layout has settled after height changes
      const timeoutId = setTimeout(() => {
        try {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        } catch (error) {
          console.error('Error scrolling to bottom:', error);
        }
      }, 300); // Wait for animation to complete
      
      // Cleanup timeout if component unmounts or trigger changes rapidly
      return () => clearTimeout(timeoutId);
    }
  }, [scrollToBottomTrigger]);

  // Trigger animation only on first mount
  useEffect(() => {
    // Collapse input after 100ms (default state)
    setTimeout(() => {
      handleCollapseInput();
    }, 500);

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
        onKeyboardToggle?.(true, event.endCoordinates.height);
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
        onKeyboardToggle?.(false, 0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [onKeyboardToggle]);

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

  // Combine and sort all messages (Redux messages + conversation events)
  const getAllMessages = (): (ChatMessage | ExtendedChatMessage)[] => {
    const allMessages = [...messages, ...processedEvents];
    
    // Separate ads from other messages
    const adMessages: (ChatMessage | ExtendedChatMessage)[] = [];
    const otherMessages: (ChatMessage | ExtendedChatMessage)[] = [];
    
    allMessages.forEach(message => {
      const isExtendedMessage = 'eventType' in message;
      if (isExtendedMessage) {
        const extendedMessage = message as ExtendedChatMessage;
        if (extendedMessage.eventType === 'tool_call' && 
            extendedMessage.conversationEvent && 
            (extendedMessage.conversationEvent as ClientToolCallEvent).client_tool_call?.tool_name === 'show_ad') {
          adMessages.push(message);
        } else {
          otherMessages.push(message);
        }
      } else {
        otherMessages.push(message);
      }
    });
    
    // Sort other messages by timestamp, then append all ads at the end
    otherMessages.sort((a, b) => a.timestamp - b.timestamp);
    adMessages.sort((a, b) => a.timestamp - b.timestamp); // Sort ads by timestamp too
    
    return [...otherMessages, ...adMessages];
  };

  // Render event indicator for conversation events
  const renderEventIndicator = (eventType?: string) => {
    if (!eventType || eventType === 'text' || eventType === 'voice') return null; // No indicator for voice events
    
    const getIndicatorStyle = () => {
      switch (eventType) {
        case 'correction':
          return { backgroundColor: nucleus.light.global.orange["50"], icon: '✏️' };
        case 'tool_call':
          return { backgroundColor: nucleus.light.global.blue["50"], icon: '🔧' };
        case 'status':
          return { backgroundColor: nucleus.light.global.grey["50"], icon: '📡' };
        default:
          return { backgroundColor: nucleus.light.global.grey["30"], icon: '•' };
      }
    };
    
    const { backgroundColor, icon } = getIndicatorStyle();
    
    return (
      <View style={[styles.eventIndicator, { backgroundColor }]}>
        <Text style={styles.eventIndicatorText}>{icon}</Text>
      </View>
    );
  };

  // Render messages with delimiters
  const renderMessages = () => {
    const renderedItems: React.ReactElement[] = [];
    const allMessages = getAllMessages();
    
    allMessages.forEach((message: ChatMessage | ExtendedChatMessage, index: number) => {
      const previousMessage = allMessages[index - 1];
      const isUser = message.role === 'user';
      const isExtendedMessage = 'eventType' in message;
      const extendedMessage = message as ExtendedChatMessage;
      
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
          <View key={message.id} style={styles.userMessageContainer}>
            <Animated.View 
              style={[
                styles.userMessageBubble,
                index < 3 ? {
                  opacity: secondMessageOpacity,
                  transform: [{ translateY: secondMessageTranslateY }],
                } : {}
              ]}
            >
              {isExtendedMessage && renderEventIndicator(extendedMessage.eventType)}
              <Text style={styles.userMessageText}>
                {renderMessageText(message.content)}
              </Text>
            </Animated.View>
          </View>
        );
      } else if (isExtendedMessage && extendedMessage.eventType === 'tool_call') {
        // Check if this is a show_ad tool call
        const toolEvent = extendedMessage.conversationEvent as ClientToolCallEvent;
        if (toolEvent.client_tool_call.tool_name === 'show_ad') {
          // Extract ad data from parameters
          const adData = toolEvent.client_tool_call.parameters;
          const productName = adData?.productName || 'Battery Complete Whey 1800g';
          const description = adData?.description || 'Perfect for post-workout recovery';
          const productUrl = adData?.productUrl || 'https://www.proteini.si/sl/beljakovine/sirotka/battery-complete-whey-1800g';
          
          // Special ad message with image and link
          renderedItems.push(
            <View key={message.id} style={styles.adContainer}>
              <View style={styles.adBubble}>
                <View style={styles.adContent}>
                  <Image
                    source={require('../assets/ad.webp')}
                    style={styles.adImage}
                    contentFit="cover"
                  />
                  <View style={styles.adTextContent}>
                    <Text style={styles.adProductName}>{productName}</Text>
                    <Text style={styles.adDescription}>{description}</Text>
                    <TouchableOpacity 
                      style={styles.adLinkButton}
                      onPress={() => {
                        Linking.openURL(productUrl).catch(err => console.error('Failed to open URL:', err));
                      }}
                    >
                      <Text style={styles.adLinkText}>Order here</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        } else {
          // Regular tool call - render as subtle text
          renderedItems.push(
            <View key={message.id} style={styles.toolCallContainer}>
              <Text style={styles.toolCallText}>
                {message.content}
              </Text>
            </View>
          );
        }
      } else {
        // Buddy message
        const isFirstBuddyMessage = index === 0 || allMessages[index - 1]?.role === 'user';
        
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
              <Avatar.Image size={40} source={require('../assets/avatar.png')} style={styles.avatar} />
              <Text style={styles.buddyName}>Buddy</Text>
            </Animated.View>
          );
        }

        // Add message bubble
        renderedItems.push(
          <View key={message.id} style={styles.assistantMessageContainer}>
            <Animated.View 
              style={[
                styles.messageBubble,
                index < 3 ? {
                  opacity: index === 0 ? firstMessageOpacity : secondMessageOpacity,
                  transform: [{ translateY: index === 0 ? firstMessageTranslateY : secondMessageTranslateY }],
                } : {}
              ]}
            >
              {isExtendedMessage && renderEventIndicator(extendedMessage.eventType)}
              <Text style={styles.messageText}>
                {renderMessageText(message.content)}
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
      // Send to ElevenLabs conversation if callback is provided
      if (onSendTextMessage) {
        onSendTextMessage(inputText.trim());
      } else {
        // Fallback to AI chat API if no ElevenLabs callback
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
      }
      
      setInputText('');
      
      // Auto scroll to bottom after sending
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleClearChat = () => {
    dispatch(clearMessages());
    // Also clear conversation events
    setProcessedEvents([]);
    setLastProcessedCount(0);
    if (onNewChat) {
      onNewChat();
    }
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
    maxHeight: 56, // Keep input wrapper at fixed height
    overflow: 'hidden', // Clip any overflowing content
    justifyContent: 'center',
    alignItems: 'center',
  }));

  // Animated container style
  const animatedContainerStyle = useAnimatedStyle(() => ({
    height: maxHeight ? animatedHeight.value : undefined,
    maxHeight: maxHeight ? animatedHeight.value : undefined,
  }));

  // Animated content style
  const animatedContentStyle = useAnimatedStyle(() => ({
    height: maxHeight ? Math.max(0, animatedHeight.value - (showHeader ? 64 : 0)) : undefined,
    maxHeight: maxHeight ? Math.max(0, animatedHeight.value - (showHeader ? 64 : 0)) : undefined,
  }));

  // Show error if API call fails
  if (error) {
    console.error('Chat error:', error);
  }

  return (
    <ReanimatedAnimated.View style={[
      styles.container, 
      containerStyle,
      animatedContainerStyle
    ]}>
      {/* Top Navigation - Optional */}
      {showHeader && (
        <View style={styles.topNav}>
          {onBack && (
            <TouchableOpacity
              onPress={onBack}
              style={styles.backButton}
            >
              <Image
                source={require('../assets/icons/cross.svg')}
                style={styles.crossIcon}
                contentFit="contain"
              />
            </TouchableOpacity>
          )}
          
          <Text style={styles.buddyText}>Chat</Text>
          
          {showNewChatButton && (
            <TouchableOpacity
              onPress={handleClearChat}
              style={styles.newChatButton}
            >
              <Text style={styles.newChatText}>New Chat</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <ReanimatedAnimated.View style={animatedContentStyle}>
        {disableKeyboardAvoidance ? (
          // Direct content without KeyboardAvoidingView
          <View style={[styles.mainContent, contentStyle]}>
            <ScrollView 
              ref={scrollViewRef}
              style={styles.scrollContainer}
              contentContainerStyle={[styles.scrollContent, { paddingBottom: isKeyboardVisible ? 20 : 0 }]}
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
                  <Text style={styles.title}>{headerTitle}</Text>
                  <Text style={styles.subtitle}>
                    {headerSubtitle}
                  </Text>
                </View>

                {/* Render messages with delimiters */}
                {renderMessages()}
                
                {/* Show loading indicator when AI is responding */}
                {isLoading && (
                  <View style={styles.loadingContainer}>
                    {/* Show buddy header (avatar + name) */}
                    <View style={styles.buddyMessage}>
                      <Avatar.Image size={40} source={require('../assets/avatar.png')} style={styles.avatar} />
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
                      source={require('../assets/icons/keyboard.svg')}
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
          </View>
        ) : (
          // With KeyboardAvoidingView
          <KeyboardAvoidingView 
            style={[styles.mainContent, contentStyle]}
            behavior={Platform.OS === 'ios' ? keyboardAvoidingBehavior : 'height'}
            keyboardVerticalOffset={keyboardVerticalOffset}
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
                  <Text style={styles.title}>{headerTitle}</Text>
                  <Text style={styles.subtitle}>
                    {headerSubtitle}
                  </Text>
                </View>

                {/* Render messages with delimiters */}
                {renderMessages()}
                
                {/* Show loading indicator when AI is responding */}
                {isLoading && (
                  <View style={styles.loadingContainer}>
                    {/* Show buddy header (avatar + name) */}
                    <View style={styles.buddyMessage}>
                      <Avatar.Image size={40} source={require('../assets/avatar.png')} style={styles.avatar} />
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
                      source={require('../assets/icons/keyboard.svg')}
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
        )}
      </ReanimatedAnimated.View>
    </ReanimatedAnimated.View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  },
  chatContainer: {
    display: 'flex',
    paddingTop: 24,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 8,
    alignSelf: 'stretch',
  },
  headerInScroll: {
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
    marginRight: 64,
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
  
  // Event indicator styles
  eventIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    borderWidth: 2,
    borderColor: nucleus.light.semantic.bg.canvas,
  },
  eventIndicatorText: {
    fontSize: 10,
    lineHeight: 12,
  },
  
  // Message container styles for event indicators
  userMessageContainer: {
    alignSelf: 'flex-end',
    position: 'relative',
    marginTop: 8,
    maxWidth: '80%',
  },
  assistantMessageContainer: {
    alignSelf: 'flex-start',
    position: 'relative',
    maxWidth: '80%',
  },
  
  // Tool call styles
  toolCallContainer: {
    alignSelf: 'center',
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  toolCallText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: '400',
    lineHeight: 21,
    letterSpacing: 0,
    color: nucleus.light.global.grey['70'],
    textAlign: 'center',
    opacity: 0.8,
  },
  
  // Ad message styles
  adContainer: {
    alignSelf: 'center',
    marginVertical: 8,
    paddingHorizontal: 16,
    width: '100%',
  },
  adBubble: {
    backgroundColor: nucleus.light.global.orange['10'],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: nucleus.light.global.orange['30'],
    padding: 8,
    shadowColor: 'rgba(255, 150, 50, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  adTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    color: nucleus.light.global.orange['90'],
    marginBottom: 12,
    textAlign: 'center',
  },
  adContent: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
    minHeight: 60,
  },
  adImage: {
    width: 60,
    flex: 1,
    borderRadius: 6,
    backgroundColor: nucleus.light.global.grey['20'],
  },
  adTextContent: {
    flex: 2,
    gap: 2,
    justifyContent: 'center',
  },
  adProductName: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    color: nucleus.light.semantic.fg.base,
  },
  adDescription: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: nucleus.light.global.grey['70'],
    marginBottom: 4,
  },
  adLinkButton: {
    backgroundColor: nucleus.light.global.orange['60'],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'stretch',
  },
  adLinkText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    fontWeight: '700',
    color: nucleus.light.global.orange['10'],
    textAlign: 'center',
  },
}); 