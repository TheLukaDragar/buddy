import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import { Avatar, IconButton, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { nucleus } from '../Buddy_variables';

export default function OnboardingScreen() {
  const firstMessageOpacity = useRef(new Animated.Value(0)).current;
  const firstMessageTranslateY = useRef(new Animated.Value(20)).current;
  const secondMessageOpacity = useRef(new Animated.Value(0)).current;
  const secondMessageTranslateY = useRef(new Animated.Value(20)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const buttonsTranslateY = useRef(new Animated.Value(30)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const buddyTextOpacity = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  
  // Simple questions system
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [userAnswers, setUserAnswers] = React.useState<string[]>([]);
  const [headerVisible, setHeaderVisible] = React.useState(true);
  const [questionsStarted, setQuestionsStarted] = React.useState(false);
  const [showCurrentBuddy, setShowCurrentBuddy] = React.useState(false);
  const [showTextInput, setShowTextInput] = React.useState(false);
  const [customAnswer, setCustomAnswer] = React.useState('');
  const [showCompletion, setShowCompletion] = React.useState(false);
  
  const questionMessageOpacity = useRef(new Animated.Value(0)).current;
  const questionMessageTranslateY = useRef(new Animated.Value(20)).current;
  const userMessageOpacity = useRef(new Animated.Value(0)).current;
  const buddyAvatarOpacity = useRef(new Animated.Value(0)).current;
  const buddyAvatarTranslateY = useRef(new Animated.Value(20)).current;
  const completionOpacity = useRef(new Animated.Value(0)).current;
  
  const firstMessage = "I'll ask a few quick things so your plan fits *you*. Cool? 😎";
  const secondMessage = "Let's start with your first question!";
  
  const questions = [
    {
      text: "**What's your fitness goal, my friend?** 🏋️‍♂️\nPick one — or type your own dream below!",
      answers: [
        "Gain muscle and strength",
        "Lose weight and get leaner", 
        "Get generally fitter and healthier",
        "Boost stamina and endurance",
        "Bounce back after a break",
        "Train for a sport or event",
        "🖊️ Other"
      ]
    },
    {
      text: "**How would you describe your fitness experience?**\nBe honest — I won't judge. 🤞",
      answers: [
        "Total beginner – new to this",
        "Dabbled a bit – I've tried before",
        "Intermediate – I know my way around",
        "Advanced – I lift like a pro",
        "🖊️ Other"
      ]
    },
    {
      text: "**When was the last time you moved that body?** 😊\nEven a walk or weekend hike counts!",
      answers: [
        "Within the last week",
        "Sometime last month",
        "Over 3 months ago",
        "It's been a year or more",
        "🖊️ Other"
      ]
    },
    {
      text: "**Do you do any kind of sport or physical activity every week?**",
      answers: [
        "Yes, I play sports",
        "I train at home or in the gym",
        "I move sometimes, but not regularly",
        "Not right now",
        "🖊️ Other"
      ]
    },
    {
      text: "**Just so I can match your vibe — which age range are you in?** 🎂\n(No ID check required 😊)",
      answers: [
        "Under 18",
        "18 - 25",
        "26 - 35",
        "36 - 45",
        "46 - 55",
        "56 +",
        "🙈 Prefer to skip"
      ]
    },
    {
      text: "**Nice — we'll train smart, no matter the number.**\n\n**And how much power are we working with?** 💪\nTotally fine to estimate — no scales involved.",
      answers: [
        "Under 60 kg",
        "60 - 70 kg",
        "71 - 80 kg",
        "81 - 90 kg",
        "91 - 100 kg",
        "Over 100 kg",
        "⚡ Prefer to skip"
      ]
    },
    {
      text: "**Got it. Want to tell me a bit more? I'll work around it.**",
      answers: [
        "🖊️ Write your message"
      ],
      autoTextInput: true
    },
    {
      text: "**How many days a week would you like to train with me?**",
      answers: [
        "Once a week",
        "Twice",
        "Three times",
        "Four times",
        "Five or more"
      ]
    },
    {
      text: "**How long should your average workout be?**\nYou set the tempo — I'll bring the plan. 💪",
      answers: [
        "30 min",
        "45 min",
        "1 hour",
        "Up to 90 min"
      ]
    }
  ];

  const currentQuestion = questions[currentQuestionIndex];
  
  const handleAnswerSelect = (answer: string) => {
    // Check if user clicked an "Other" option
    if (answer.includes('🖊️ Other') || answer.includes('🙈 Prefer to skip') || answer.includes('⚡ Prefer to skip')) {
      // Show text input for custom answer
      setShowTextInput(true);
      return;
    }

    // Process regular answer
    processAnswer(answer);
  };
  const processAnswer = (answer: string) => {
    // Store the answer
    const newAnswers = [...userAnswers, answer];
    setUserAnswers(newAnswers);
    
    // Reset text input state
    setShowTextInput(false);
    setCustomAnswer('');
    
    // Stage 1: Show user response bubble
    userMessageOpacity.setValue(0);
    Animated.timing(userMessageOpacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Stage 2: Scroll after user message appears
      setTimeout(() => {
        // Force scroll to bottom using measured content height
        if (scrollViewRef.current && contentHeight > scrollViewHeight) {
          scrollViewRef.current.scrollTo({ 
            y: contentHeight - scrollViewHeight + 100,
            animated: true 
          });
        }
        
        // Stage 3: Proceed after scroll
        setTimeout(() => {
          if (currentQuestionIndex < questions.length - 1) {
            // Hide current buttons FIRST
            Animated.timing(buttonsOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              // ONLY NOW change the question index (after buttons are hidden)
              setCurrentQuestionIndex(currentQuestionIndex + 1);
              
              // Reset question animation values
              questionMessageOpacity.setValue(0);
              questionMessageTranslateY.setValue(20);
              
              // Animate the new question message
              Animated.parallel([
                Animated.timing(questionMessageOpacity, {
                  toValue: 1,
                  duration: 250,
                  useNativeDriver: true,
                }),
                Animated.timing(questionMessageTranslateY, {
                  toValue: 0,
                  duration: 250,
                  useNativeDriver: true,
                }),
              ]).start(() => {
                // Show new buttons with new text
                setTimeout(() => {
                  buttonsOpacity.setValue(0);
                  buttonsTranslateY.setValue(20);
                  
                  // Check if current question should auto-show text input
                  if (questions[currentQuestionIndex + 1]?.autoTextInput) {
                    setShowTextInput(true);
                  } else {
                    Animated.parallel([
                      Animated.timing(buttonsOpacity, {
                        toValue: 1,
                        duration: 250,
                        useNativeDriver: true,
                      }),
                      Animated.timing(buttonsTranslateY, {
                        toValue: 0,
                        duration: 250,
                        useNativeDriver: true,
                      }),
                    ]).start();
                  }
                }, 50);
              });
            });
          } else {
            // All questions completed - show completion screen
            setTimeout(() => {
              console.log('All answers:', newAnswers);
              Animated.timing(buttonsOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }).start(() => {
                setQuestionsStarted(false);
                setShowCompletion(true);
                
                // Animate completion screen
                Animated.timing(completionOpacity, {
                  toValue: 1,
                  duration: 400,
                  useNativeDriver: true,
                }).start();
              });
            }, 200);
          }
        }, 200);
      }, 100);
    });
  };

  const handleCustomAnswerSubmit = () => {
    if (customAnswer.trim()) {
      processAnswer(customAnswer.trim());
    }
  };

  useEffect(() => {
    // Animate first message with smoother timing
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

    // Animate second message after shorter delay
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

      // Show buttons, hide header, and show buddy text with smoother timing
      setTimeout(() => {
        Animated.parallel([
          // Hide header smoothly
          Animated.timing(headerOpacity, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(headerTranslateY, {
            toValue: -30,
            duration: 800,
            useNativeDriver: true,
          }),
          // Show buttons smoothly
          Animated.timing(buttonsOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(buttonsTranslateY, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
          // Show buddy text smoothly
          Animated.timing(buddyTextOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Only remove header after animation completes
          setHeaderVisible(false);
          // Auto scroll to show buttons
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 200);
        });
      }, 600);
    }, 1200); // Shorter delay between messages

    // Start first question animation with smoother timing
    setTimeout(() => {
      setQuestionsStarted(true);
      setShowCurrentBuddy(true); // Show Buddy for first question
      // Set initial Buddy avatar values for first question
      buddyAvatarOpacity.setValue(1); // Start visible for first question
      buddyAvatarTranslateY.setValue(0);
      
      Animated.parallel([
        Animated.timing(questionMessageOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(questionMessageTranslateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Check if first question should auto-show text input
        if (questions[0]?.autoTextInput) {
          setShowTextInput(true);
        }
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 200);
      });
    }, 2200); // Adjusted timing
  }, []);

  // Auto scroll when content changes
  useEffect(() => {
    if (questionsStarted && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [userAnswers, currentQuestionIndex, questionsStarted]);

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
    <View style={[styles.fullScreen, { backgroundColor: nucleus.light.semantic.bg.subtle }]}>
      <SystemBars style="dark" />
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.topNav}>
          <IconButton
            icon={require('../assets/back.png')}
            size={32}
            onPress={() => router.back()}
            style={styles.backButton}
          />
          <Animated.View style={{ opacity: buddyTextOpacity }}>
            <Text style={styles.buddyText}>Buddy</Text>
          </Animated.View>
          <Animated.View style={{ opacity: buddyTextOpacity }}>
            <Text style={styles.skipText}>Skip</Text>
          </Animated.View>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.content}>
            {headerVisible && (
              <Animated.View style={[styles.header, { 
                opacity: headerOpacity,
                transform: [{ translateY: headerTranslateY }]
              }]}>
                <Text style={styles.title}>Hey Otto, we're so happy you're here!</Text>
                <Text style={styles.subtitle}>
                  This is the start of something strong — literally.{'\n'}I'm your new AI workout buddy, built to fit you. Let's get personal 💬
                </Text>
              </Animated.View>
            )}

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
                  <Avatar.Image size={40} source={require('../assets/avatar.png')} style={styles.avatar} />
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

                {/* Show all questions and answers for scrolling */}
                {questionsStarted && questions.map((question, index) => {
                  // Only show if this question has been asked (index <= currentQuestionIndex)
                  if (index > currentQuestionIndex) return null;
                  
                  const hasAnswer = userAnswers[index];
                  const isCurrentQuestion = index === currentQuestionIndex;
                  
                  return (
                    <React.Fragment key={index}>
                      {/* Buddy message for this question */}
                      {isCurrentQuestion && !hasAnswer && showCurrentBuddy ? (
                        // Only show animated version for current question without answer
                        <Animated.View 
                          style={[
                            styles.buddyMessage, 
                            { 
                              marginTop: 16,
                              opacity: buddyAvatarOpacity,
                              transform: [{ translateY: buddyAvatarTranslateY }],
                            }
                          ]}
                        >
                          <Avatar.Image size={40} source={require('../assets/avatar.png')} style={styles.avatar} />
                          <Text style={styles.buddyName}>Buddy</Text>
                        </Animated.View>
                      ) : hasAnswer ? (
                        // Static version for answered questions
                        <View style={[styles.buddyMessage, { marginTop: 16 }]}>
                          <Avatar.Image size={40} source={require('../assets/avatar.png')} style={styles.avatar} />
                          <Text style={styles.buddyName}>Buddy</Text>
                        </View>
                      ) : null}
                      
                      {isCurrentQuestion && !hasAnswer && showCurrentBuddy ? (
                        // Only show animated version for current question without answer
                        <Animated.View 
                          style={[
                            styles.messageBubble,
                            {
                              opacity: questionMessageOpacity,
                              transform: [{ translateY: questionMessageTranslateY }],
                            }
                          ]}
                        >
                          <Text style={styles.messageText}>
                            {renderMessageText(question.text)}
                          </Text>
                        </Animated.View>
                      ) : hasAnswer ? (
                        // Static version for answered questions
                        <View style={styles.messageBubble}>
                          <Text style={styles.messageText}>
                            {renderMessageText(question.text)}
                          </Text>
                        </View>
                      ) : null}

                      {/* User response - only show if answered */}
                      {hasAnswer && (
                        <Animated.View 
                          style={[
                            styles.userMessageBubble,
                            {
                              opacity: index === currentQuestionIndex ? userMessageOpacity : 1,
                            }
                          ]}
                        >
                          <Text style={styles.userMessageText}>
                            {hasAnswer}
                          </Text>
                        </Animated.View>
                      )}
                    </React.Fragment>
                  );
                })}
                
                {/* Completion Screen */}
                {showCompletion && (
                  <Animated.View style={[styles.completionContainer, { opacity: completionOpacity }]}>
                    <View style={styles.buddyMessage}>
                      <Avatar.Image size={40} source={require('../assets/avatar.png')} style={styles.avatar} />
                      <Text style={styles.buddyName}>Buddy</Text>
                    </View>
                    
                    <View style={styles.messageBubble}>
                      <Text style={styles.messageText}>
                        <Text style={styles.customText}>That's all I need for now — you crushed it!</Text>{'\n'}
                        Your first plan is loading… but don't worry, nothing is set in stone.
                      </Text>
                    </View>
                    
                    <View style={styles.messageBubble}>
                      <Text style={styles.messageText}>
                        You'll be able to tweak each workout based on your mood, time, or where you are.
                      </Text>
                    </View>
                    
                    <View style={styles.messageBubble}>
                      <Text style={styles.messageText}>
                        <Text style={styles.customText}>This is your journey — I'm just here to guide and hype you. Let's do this!</Text> 🚀
                      </Text>
                    </View>
                  </Animated.View>
                )}
                
              </Animated.View>
            </ScrollView>
          </View>

          {/* Buttons container - positioned at bottom but within layout */}
          <View style={styles.buttonsArea}>
            {questionsStarted && currentQuestionIndex < questions.length && !showTextInput && (
              <Animated.View 
                style={[
                  styles.buttonsContainer,
                  {
                    opacity: buttonsOpacity,
                    transform: [{ translateY: buttonsTranslateY }],
                  }
                ]}
              >
                {currentQuestion.answers.map((answer, answerIndex) => (
                <View style={styles.goalButtonContainer} key={answerIndex}>  
                  <Pressable
                    key={answerIndex}
                    onPress={() => handleAnswerSelect(answer)}
                    style={({ pressed }: { pressed: boolean }) => [
                      styles.goalButton,
                      { backgroundColor: pressed ? nucleus.light.global.blue["10"] : 'transparent' }
                    ]}
                  >
                    <Text style={[
                      styles.goalButtonLabel,
                      { color: nucleus.light.global.blue["70"] }
                    ]}>
                      {answer}
                    </Text>
                  </Pressable>
                  </View>
                ))}
              </Animated.View>
            )}
            
            {/* Text Input for "Other" responses */}
            {showTextInput && (
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Write your message"
                  placeholderTextColor={nucleus.light.semantic.fg.muted}
                  value={customAnswer}
                  onChangeText={setCustomAnswer}
                  multiline
                  autoFocus
                  onSubmitEditing={handleCustomAnswerSubmit}
                />
                <Pressable
                  style={[
                    styles.submitButton,
                    { 
                      backgroundColor: customAnswer.trim() 
                        ? nucleus.light.global.blue["70"] 
                        : nucleus.light.semantic.bg.muted 
                    }
                  ]}
                  onPress={handleCustomAnswerSubmit}
                  disabled={!customAnswer.trim()}
                >
                  <Text style={[
                    styles.submitButtonText,
                    { 
                      color: customAnswer.trim() 
                        ? nucleus.light.global.blue["10"] 
                        : nucleus.light.semantic.fg.muted 
                    }
                  ]}>
                    Send
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Let's Begin Button */}
            {showCompletion && (
              <Animated.View style={[styles.letsBeginContainer, { opacity: completionOpacity }]}>
                <Pressable
                  style={styles.letsBeginButton}
                  onPress={() => {
                    // Navigate to main app or next screen
                    console.log('Starting app with answers:', userAnswers);
                    router.push('/(tabs)')
                  }}
                >
                  <Text style={styles.letsBeginText}>Let's begin</Text>
                </Pressable>
              </Animated.View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
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
    display: 'flex',
    height: 64,
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    alignItems: 'center',
    flexDirection: 'row',
  },
  backButton: {
    margin: 0,
    height: 32,
    width: 32,
  },
  menuButton: {
    margin: 0,
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'stretch', // Change from 'flex-start' to 'stretch'
    gap: 8,
    width: '100%', // Add this

  },
  content: {
    display: 'flex',
    paddingHorizontal: 16,
    paddingVertical: 0,
    flexDirection: 'column',
    alignItems: 'stretch', // Change from 'flex-start' to 'stretch'

    gap: 8,
    flex: 1,
    maxHeight: '50%', // Limit chat to max 50% of screen
  },
  header: {
    marginTop: 16,
    gap: 8,
  },
  title: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24,
    width: 286,
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
     paddingHorizontal: 0,
    paddingBottom: 20, // Minimal padding for visual spacing
    width: '100%', // Make sure it takes full width
    
  },
  chatWrapper: {
    flex: 1,
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
    alignSelf: 'flex-start', // Add this to keep them left-aligned
    borderRadius: 16,
    borderWidth: 1,
    borderColor: nucleus.light.semantic.border.muted,
    backgroundColor: nucleus.light.global.blue[80],

  },
  messageText: {
    width: 326,
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
  skipText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 18,
    color: '#131214',
    textAlign: 'right',
  },
    messageBubbleTyping: {
        display: 'flex',
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: nucleus.light.semantic.border.muted,
        backgroundColor: nucleus.light.global.blue[80],
       
    },
    messageTextTyping: {
    color: nucleus.light.global.blue["10"],
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: 16.8, // 120% of 14px
    letterSpacing: 0,
    },
    goalButtonContainer: {
        display: 'flex',
        padding: 16,
        height: 50,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap: 16,
        alignSelf: 'stretch',
    },
    buttonsContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    goalButton: {
        width: '100%',
        height: 50,
        flexShrink: 0,
        borderRadius: 48,
        borderWidth: 1,
        borderColor: nucleus.light.global.blue["70"], // #3c81a7
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    goalButtonLabel: {
      fontFamily: 'PlusJakartaSans',
      fontSize: 16,
      fontWeight: '700',
      lineHeight: 16, // 100% of 16px
      letterSpacing: 0,
      color: nucleus.light.global.blue["70"], // #3C81A7
      textAlign: 'center',
    },
    goalButtonContent: {
      minHeight: 50,
      paddingVertical: 0,
      paddingHorizontal: 24,
      justifyContent: 'center',
    },
    buddyText: {
      color: nucleus.light.semantic.fg.base, // #131214
      textAlign: 'center',
      fontFamily: 'PlusJakartaSans-Bold',
      fontSize: 18,
      fontStyle: 'normal',
      fontWeight: '700',
      lineHeight: 18, // 100% of 18px
      letterSpacing: 0, // var(--typography-letter-spacing-none, 0px)
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
    buttonsArea: {
      width: '100%',
      paddingHorizontal: 16,
      paddingBottom: 16,
      minHeight: '50%', // Take up at least half the screen
      justifyContent: 'flex-start', // Position buttons at top of their area
      display: 'flex',
    },
    textInputContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      width: '100%',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: nucleus.light.semantic.border.muted,
      backgroundColor: nucleus.light.semantic.bg.canvas, // #ffffff
    },
    textInput: {
      fontFamily: 'PlusJakartaSans-Regular',
      fontSize: 16,
      color: nucleus.light.semantic.fg.base, // #131214
      paddingVertical: 0,
      paddingHorizontal: 0,
      minHeight: 50,
      textAlignVertical: 'top',
    },
    submitButton: {
      width: '100%',
      height: 50,
      borderRadius: 48,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    submitButtonText: {
      fontFamily: 'PlusJakartaSans',
      fontSize: 16,
      fontWeight: '700',
      lineHeight: 16, // 100% of 16px
      letterSpacing: 0,
    },
    completionContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
      paddingVertical: 48,
      paddingHorizontal: 16,
    },
    letsBeginContainer: {
      width: '100%',
      alignItems: 'flex-end',
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    letsBeginButton: {
      width: '100%',
      height: 50,
      borderRadius: 48,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: nucleus.light.global.blue["70"],
    },
    letsBeginText: {
      fontFamily: 'PlusJakartaSans',
      fontSize: 16,
      fontWeight: '700',
      lineHeight: 16, // 100% of 16px
      letterSpacing: 0,
      color: nucleus.light.global.blue["10"],
    },
}); 