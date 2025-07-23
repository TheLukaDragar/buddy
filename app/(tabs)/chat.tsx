import { Image } from "expo-image";
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import { Avatar } from 'react-native-paper';
import ReanimatedAnimated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { nucleus } from '../../Buddy_variables';

export default function ChatScreen() {
  const translateY = useSharedValue(800); // Start much further off-screen at the bottom
  const opacity = useSharedValue(0);
  
  // Message animation values
  const firstMessageOpacity = useRef(new Animated.Value(0)).current;
  const firstMessageTranslateY = useRef(new Animated.Value(20)).current;
  const secondMessageOpacity = useRef(new Animated.Value(0)).current;
  const secondMessageTranslateY = useRef(new Animated.Value(20)).current;
  
  // ScrollView refs and state
  const scrollViewRef = useRef<ScrollView>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  
  // Sample messages - you can make this dynamic later
  const firstMessage = "Hey! I'm here whenever you need me. How can I help you today? 😊";
  const secondMessage = "Feel free to ask me anything about your workouts, nutrition, or just chat!";
  
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
            ]).start();
          }, 1200);
        }, 400);
      });
      
      return () => {
        // Clear timers on cleanup
        cancelAnimationFrame(animationTimer);
      };
    }, [])
  );
  
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

  return (
    <ReanimatedAnimated.View 
      style={[styles.fullScreen, { backgroundColor: nucleus.light.semantic.bg.subtle }, animatedStyle]}
    >
      <SystemBars style="dark" />
      <SafeAreaView style={[styles.container, { backgroundColor: nucleus.light.semantic.bg.subtle }]} edges={['top']}>
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

        <View style={styles.content}>
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

              {/* First message group */}
              <Animated.View 
                style={[
                  styles.buddyMessage,
                  {
                    opacity: firstMessageOpacity,
                    transform: [{ translateY: firstMessageTranslateY }],
                  }
                ]}
              >
                <Avatar.Image size={40} source={require('../../assets/avatar.png')} style={styles.avatar} />
                <Text style={styles.buddyName}>Buddy</Text>
              </Animated.View>

              <Animated.View 
                style={[
                  styles.messageBubble,
                  {
                    opacity: firstMessageOpacity,
                    transform: [{ translateY: firstMessageTranslateY }],
                  }
                ]}
              >
                <Text style={styles.messageText}>
                  {renderMessageText(firstMessage)}
                </Text>
              </Animated.View>

              <Animated.View 
                style={[
                  styles.messageBubble,
                  {
                    opacity: secondMessageOpacity,
                    transform: [{ translateY: secondMessageTranslateY }],
                  }
                ]}
              >
                <Text style={styles.messageText}>
                  {renderMessageText(secondMessage)}
                </Text>
              </Animated.View>

              {/* Example user message */}
              <Animated.View 
                style={[
                  styles.userMessageBubble,
                  {
                    opacity: secondMessageOpacity,
                    transform: [{ translateY: secondMessageTranslateY }],
                  }
                ]}
              >
                <Text style={styles.userMessageText}>
                  Hi Buddy! I'm really excited to start my fitness journey with you. Can you help me plan a good workout for today?
                </Text>
              </Animated.View>

              {/* You can add more messages here */}
              
            </Animated.View>
          </ScrollView>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 0,
    gap: 8,
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 0,
    paddingBottom: 20,
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
}); 