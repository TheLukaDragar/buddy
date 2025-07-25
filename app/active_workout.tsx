import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Text } from 'react-native-paper';
import ReanimatedAnimated, {
    Easing,
    FadeIn,
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { nucleus } from '../Buddy_variables.js';
import ChatComponent from '../components/ChatComponent';
import { useBuddyTheme } from '../constants/BuddyTheme';

interface ProgressSegment {
  type: 'set' | 'rest';
  duration: number; // in seconds
  isActive?: boolean;
  isCompleted?: boolean;
  progress?: number; // 0-100 for current segment
}

interface WorkoutProgressProps {
  segments: ProgressSegment[];
  currentWeight?: string;
  currentReps?: number;
  elapsedTime: number; // Current elapsed time in seconds
  isRunning: boolean; // Whether timer is running
}

const WorkoutProgress: React.FC<WorkoutProgressProps> = ({
  segments,
  currentWeight = "40 kg",
  currentReps = 8,
  elapsedTime,
  isRunning
}) => {
  const theme = useBuddyTheme();

  // Calculate total duration for proportional widths
  const totalDuration = segments.reduce((sum, segment) => sum + segment.duration, 0);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Find which segment is currently active based on elapsed time
  const getCurrentSegmentInfo = () => {
    let cumulativeTime = 0;
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const segmentEnd = cumulativeTime + segment.duration;
      
      if (elapsedTime >= cumulativeTime && elapsedTime < segmentEnd) {
        const segmentElapsed = elapsedTime - cumulativeTime;
        const progress = (segmentElapsed / segment.duration) * 100;
        
        return {
          activeIndex: i,
          progress: Math.min(progress, 100),
          remainingTime: segment.duration - segmentElapsed,
          segmentType: segment.type
        };
      }
      
      cumulativeTime = segmentEnd;
    }
    
    // If we're past all segments
    return {
      activeIndex: segments.length - 1,
      progress: 100,
      remainingTime: 0,
      segmentType: segments[segments.length - 1]?.type || 'set'
    };
  };

  const currentInfo = getCurrentSegmentInfo();

  const getSegmentColor = (segment: ProgressSegment, index: number) => {
    // Completed segments
    if (index < currentInfo.activeIndex) {
      return segment.type === 'set' 
        ? nucleus.light.global.blue["40"] // #89BAD5 for completed sets
        : nucleus.light.global.brand["70"]; // #D0DD17 for completed rest
    }
    
    // Active segment
    if (index === currentInfo.activeIndex && currentInfo.progress > 0) {
      return segment.type === 'set' 
        ? nucleus.light.global.blue["40"] // #89BAD5 for active sets
        : nucleus.light.global.brand["70"]; // #D0DD17 for active rest
    }

    return nucleus.light.global.white; // #FFF for future segments
  };

  const getSegmentWidth = (segment: ProgressSegment) => {
    return (segment.duration / totalDuration) * 100;
  };

  const getSegmentProgress = (index: number) => {
    if (index < currentInfo.activeIndex) return 100; // Completed
    if (index === currentInfo.activeIndex) return currentInfo.progress; // Active
    return 0; // Future
  };

  return (
    <View style={styles.progressContainer}>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        {segments.map((segment, index) => {
          const segmentWidth = getSegmentWidth(segment);
          const segmentColor = getSegmentColor(segment, index);
          const progress = getSegmentProgress(index);
          
          return (
            <View 
              key={index}
              style={[
                styles.progressSegment,
                { 
                  width: `${segmentWidth}%`,
                  backgroundColor: nucleus.light.global.white, // Base color
                }
              ]}
            >
              {/* Fill for completed or active segments */}
              {progress > 0 && (
                <View 
                  style={[
                    styles.segmentFill,
                    { 
                      width: `${progress}%`,
                      backgroundColor: segmentColor
                    }
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>

      {/* Info Row */}
      <View style={styles.infoContainer}>
        {/* Weight - Centered in Left Section */}
        <View style={styles.infoItemLeft}>
          <Text style={[styles.infoValue, { color: nucleus.light.global.blue["60"] }]}>
            {currentWeight}
          </Text>
          <Text style={[styles.infoLabel, { color: nucleus.light.global.grey["90"] }]}>
            WEIGHT
          </Text>
        </View>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Timer - Centered in Middle Section */}
        <View style={styles.timerContainer}>
          <Text style={[styles.timerValue, { color: nucleus.light.global.grey["70"] }]}>
            {formatTime(Math.floor(currentInfo.remainingTime))}
          </Text>
        </View>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Reps - Centered in Right Section */}
        <View style={styles.infoItemRight}>
          <Text style={[styles.infoValue, { color: nucleus.light.global.blue["60"] }]}>
            {currentReps}
          </Text>
          <Text style={[styles.infoLabel, { color: nucleus.light.global.grey["90"] }]}>
            REPS
          </Text>
        </View>
      </View>
    </View>
  );
};

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface BottomModalProps {
  visible: boolean;
}

const BottomModal: React.FC<BottomModalProps> = ({ visible }) => {
  const insets = useSafeAreaInsets();
  // Use a fixed middle height reference for consistent behavior across devices
  const COLLAPSED_HEIGHT = SCREEN_HEIGHT * 0.45; // 40% of screen height
  const EXPANDED_HEIGHT = SCREEN_HEIGHT * 1 ; // Height of modal when expanded
  
  // Calculate positions from bottom of screen
  const COLLAPSED_POSITION = SCREEN_HEIGHT - COLLAPSED_HEIGHT; // Near bottom
  const EXPANDED_POSITION = SCREEN_HEIGHT - EXPANDED_HEIGHT;   // Much higher up
  
  const modalTranslateY = useSharedValue(COLLAPSED_POSITION);
  
  // State to track visible modal height
  const [visibleModalHeight, setVisibleModalHeight] = useState(COLLAPSED_HEIGHT);
  
  // State to track if modal is collapsed or expanded
  const [isModalCollapsed, setIsModalCollapsed] = useState(true);
  
  // Shared value to track last updated height to prevent unnecessary updates
  const lastUpdatedHeight = useSharedValue(COLLAPSED_HEIGHT);
  
  // Track if we're in the middle of an animation to reduce updates
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Keyboard state tracking
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  // Scroll trigger for ChatComponent
  const [scrollTrigger, setScrollTrigger] = useState(0);
  
  // Modal header height (handle + title + padding + border)
  const MODAL_HEADER_HEIGHT = 8 + 5 + 8 + 16 + 21.6 + 16 + 1; // handle margin + handle height + gap + padding + title + padding + border

  // Throttled height update function
  const updateVisibleHeight = (newHeight: number) => {
    try {
      // Add safety check to ensure valid height
      if (newHeight > 0 && newHeight <= SCREEN_HEIGHT && !isNaN(newHeight)) {
        setVisibleModalHeight(newHeight);
      }
    } catch (error) {
      console.error('Error updating visible height:', error);
    }
  };
  
  // Animation start/end handlers
  const startAnimation = () => {
    try {
      setIsAnimating(true);
    } catch (error) {
      console.error('Error starting animation:', error);
    }
  };
  
  const endAnimation = () => {
    try {
      setIsAnimating(false);
    } catch (error) {
      console.error('Error ending animation:', error);
    }
  };

  // Handle keyboard state changes from ChatComponent
  const handleKeyboardToggle = (isVisible: boolean, height: number) => {
    console.log('Keyboard toggle:', isVisible, height);
    setIsKeyboardVisible(isVisible);
    setKeyboardHeight(height);
    
    if (isVisible) {
      // Keyboard is showing - automatically expand the modal
      // First set the target height immediately to prevent jumping
      const expandedHeight = SCREEN_HEIGHT - EXPANDED_POSITION;
      setVisibleModalHeight(expandedHeight);
      lastUpdatedHeight.value = expandedHeight;
      
      // Then animate the modal
      modalTranslateY.value = withTiming(EXPANDED_POSITION, {
        duration: 250, // Slightly faster to match keyboard timing
        easing: Easing.out(Easing.quad),
      }, (finished) => {
        if (finished) {
          // Update collapsed state and trigger scroll
          runOnJS(setIsModalCollapsed)(false);
          runOnJS(setScrollTrigger)(Date.now()); // Use timestamp to ensure unique value
        }
      });
      
      console.log('Modal expanded for keyboard. Screen height:', SCREEN_HEIGHT, 'Keyboard height:', height);
    }
    // Note: We don't auto-collapse when keyboard hides to let user decide
  };

  useEffect(() => {
    if (visible) {
      modalTranslateY.value = withSpring(COLLAPSED_POSITION, { 
        damping: 25, 
        stiffness: 150, 
        mass: 0.8 
      });
      setIsModalCollapsed(true); // Ensure state matches initial position
      // Debug the calculations on startup
      console.log('INITIAL CALCULATIONS:');
      console.log('Screen height:', SCREEN_HEIGHT);
      console.log('Collapsed height:', COLLAPSED_HEIGHT);
      console.log('Collapsed position:', COLLAPSED_POSITION);
    }
    
    // Cleanup function to reset animation state
    return () => {
      try {
        setIsAnimating(false);
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
        setScrollTrigger(0);
        setIsModalCollapsed(true);
      } catch (error) {
        console.error('Error in cleanup:', error);
      }
    };
  }, [visible, COLLAPSED_POSITION]);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: { startY: number }) => {
      context.startY = modalTranslateY.value;
      runOnJS(startAnimation)();
    },
    onActive: (event, context: { startY: number }) => {
      const newTranslateY = context.startY + event.translationY;
      // Constrain between collapsed and expanded positions
      modalTranslateY.value = Math.min(Math.max(newTranslateY, EXPANDED_POSITION), COLLAPSED_POSITION);
      
      // Calculate visible height based on current position
      const currentVisibleHeight = SCREEN_HEIGHT - modalTranslateY.value;
      
      // During active dragging, update less frequently (every 25px) to reduce jumpiness
      if (Math.abs(currentVisibleHeight - lastUpdatedHeight.value) > 25) {
        lastUpdatedHeight.value = currentVisibleHeight;
        runOnJS(updateVisibleHeight)(currentVisibleHeight);
      }
    },
    onEnd: (event) => {
      const currentPosition = modalTranslateY.value;
      const midPoint = (COLLAPSED_POSITION + EXPANDED_POSITION) / 2;
      
      // Determine if we should expand or collapse based on position and velocity
      const shouldExpand = currentPosition < midPoint || event.velocityY < -800;
      
      if (shouldExpand) {
        modalTranslateY.value = withTiming(EXPANDED_POSITION, {
          duration: 300,
          easing: Easing.out(Easing.quad),
        }, (finished) => {
          if (finished) {
            // Update visible height for expanded state after animation completes
            const expandedHeight = SCREEN_HEIGHT - EXPANDED_POSITION;
            lastUpdatedHeight.value = expandedHeight;
            runOnJS(updateVisibleHeight)(expandedHeight);
            runOnJS(setIsModalCollapsed)(false);
            runOnJS(endAnimation)();
            // Trigger scroll after manual expansion - simplified
            runOnJS(setScrollTrigger)(Date.now());
          }
        });
        
        console.log('CALCULATIONS:');
        console.log('Screen height:', SCREEN_HEIGHT);
        console.log('Collapsed height:', COLLAPSED_HEIGHT);
        console.log('Collapsed position:', COLLAPSED_POSITION);
        console.log('Expanded position:', EXPANDED_POSITION);
      } else {
        modalTranslateY.value = withTiming(COLLAPSED_POSITION, {
          duration: 300,
          easing: Easing.out(Easing.quad),
        }, (finished) => {
          if (finished) {
            // Update visible height for collapsed state after animation completes
            lastUpdatedHeight.value = COLLAPSED_HEIGHT;
            runOnJS(updateVisibleHeight)(COLLAPSED_HEIGHT);
            runOnJS(setIsModalCollapsed)(true);
            runOnJS(endAnimation)();
            // Trigger scroll after collapse - simplified
            runOnJS(setScrollTrigger)(Date.now());
          }
        });
      }
    },
  });

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: modalTranslateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => {
    // Remove backdrop/shadow completely - just return transparent
    return { opacity: 0 };
  });
  
  // Calculate available height for chat content (visible height minus header)
  const baseContentHeight = Math.max(50, Math.min(visibleModalHeight - MODAL_HEADER_HEIGHT, SCREEN_HEIGHT - 100));
  
  // Adjust content height when keyboard is visible to move input above keyboard
  // Reduce padding to 8px to bring input closer to keyboard
  const chatContentHeight = isKeyboardVisible 
    ? Math.max(100, baseContentHeight - keyboardHeight - 8) 
    : baseContentHeight;
    
  // Debug logging for height calculations
  if (isKeyboardVisible) {
    console.log('Height calculations:', {
      visibleModalHeight,
      baseContentHeight,
      keyboardHeight,
      finalChatContentHeight: chatContentHeight
    });
  }

  // Callback to trigger scroll after modal expansion
  const handleModalExpansionComplete = () => {
    // This will be passed to ChatComponent to trigger scroll
    console.log('Modal expansion complete, should scroll to bottom');
  };

  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <ReanimatedAnimated.View style={[styles.modalBackdrop, animatedBackdropStyle]} />
      
      <ReanimatedAnimated.View style={[styles.modalSheet, animatedSheetStyle]}>
        {/* Header with drag handle and shadow - wrapped in gesture handler */}
        <PanGestureHandler
          onGestureEvent={gestureHandler}
          activeOffsetY={[-10, 10]}
          failOffsetX={[-10, 10]}
        >
          <ReanimatedAnimated.View style={styles.modalHeader}>
            <View style={styles.modalHandle} />
            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalTitle}>Chat transcript</Text>
            </View>
          </ReanimatedAnimated.View>
        </PanGestureHandler>
        
        {/* Chat Component - replaces simple modal content */}
        <View style={[styles.modalContent, { height: chatContentHeight }]}>
          <ChatComponent 
            showHeader={false}
            headerTitle="Chat with Buddy during your workout"
            headerSubtitle="Ask questions, get motivation, or log your progress!"
            showNewChatButton={false}
            containerStyle={[styles.chatContainer, { height: chatContentHeight}]}
            contentStyle={[styles.chatContent, { height: chatContentHeight, paddingBottom: isModalCollapsed ? insets.bottom - 20 : 0 }]}
            maxHeight={chatContentHeight}
            onKeyboardToggle={handleKeyboardToggle}
            disableKeyboardAvoidance={true}
            scrollToBottomTrigger={scrollTrigger}
          />
        </View>
      </ReanimatedAnimated.View>
    </View>
  );
};

export default function ActiveWorkoutScreen() {
  const theme = useBuddyTheme();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  // Example segments data
  const sampleSegments: ProgressSegment[] = [
    { type: 'set', duration: 45 },
    { type: 'rest', duration: 60 },
    { type: 'set', duration: 45 },
    { type: 'rest', duration: 60 },
    { type: 'set', duration: 45 },
    { type: 'rest', duration: 60 },
  ];

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setElapsedTime(0);
    setIsRunning(false);
  };

  return (
    <ReanimatedAnimated.View 
      entering={FadeIn.duration(300).delay(100)}
      style={[styles.fullScreen, { backgroundColor: nucleus.light.semantic.bg.subtle }]}
    >
      <SystemBars style="dark" />
      <SafeAreaView style={[styles.container, { backgroundColor: nucleus.light.semantic.bg.subtle }]} edges={['top','bottom']}>
        <ReanimatedAnimated.View 
          entering={FadeIn.duration(500).delay(200)}
          style={styles.mainContent}
        >
          <View style={styles.topContainer}>
            <Text>Active Workout</Text>
          </View>
          
          <View style={styles.workoutStatusContainer}>
            <WorkoutProgress 
              segments={sampleSegments}
              currentWeight="40 kg"
              currentReps={8}
              elapsedTime={elapsedTime}
              isRunning={isRunning}
            />

          </View>
        </ReanimatedAnimated.View>
      </SafeAreaView>
      
      {/* Bottom Modal */}
      <BottomModal visible={true} />
    </ReanimatedAnimated.View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  mainContent: {
    flex: 1,
  },
  topContainer: {
    width: '100%',
    aspectRatio: 1.2,
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  workoutStatusContainer: {
    display: 'flex',
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 20,
    
  },
  progressContainer: {
    width: '100%',
    gap: 20,
    paddingHorizontal: 0,
  },
  progressBarContainer: {
    height: 32,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    gap: 2,
    
  },
  progressSegment: {
    height: '100%',
    position: 'relative',
    borderRadius: 4,
  },
  segmentFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  infoItem: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    flex: 1,
  },
  infoItemLeft: {
    display: 'flex',
    width: 72,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  infoItemRight: {
    display: 'flex',
    width: 72,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  infoValue: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    lineHeight: 21.6, // 1.2 * 18
    includeFontPadding: false,
  },
  infoLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    lineHeight: 14,
    includeFontPadding: false,
  },
  timerContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  timerValue: {
    color: nucleus.light.global.grey["70"],
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: 0,
  },
  separator: {
    width: 1,
    height: 32,
    backgroundColor: '#D9D9D9',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  controlButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: nucleus.light.global.blue["60"],
    color: nucleus.light.global.white,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    textAlign: 'center',
  },
  // Bottom Modal Styles
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    pointerEvents: 'box-none', // Allow touches to pass through to backdrop
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#000000',
    pointerEvents: 'none', // Allow touches to pass through
  },
  modalSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    backgroundColor: nucleus.light.semantic.bg.canvas,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden', // This ensures content respects the rounded corners
  },
  modalHeader: {
    flexDirection: 'column',
    gap: 8,
    paddingBottom: 16,
    flexShrink: 0,
    borderBottomWidth: 1,
    borderBottomColor: nucleus.light.global.grey["30"], // #daddde
    backgroundColor: nucleus.light.semantic.bg.canvas,
    // Remove all shadow properties from header too
  },
  modalHandle: {
    width: 48,
    height: 5,
    flexShrink: 0,
    backgroundColor: nucleus.light.global.grey["30"], // #daddde
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 8,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  modalTitle: {
    color: nucleus.light.global.grey["70"], // #53575a
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    lineHeight: 21.6, // 1.2 * 18
    includeFontPadding: false,
    textAlign: 'left',
  },
  modalContent: {
    flex: 1,
    backgroundColor: nucleus.light.semantic.bg.canvas, // White background
  },
  modalSubtitle: {
    color: nucleus.light.global.grey["70"],
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    lineHeight: 16.8,
    includeFontPadding: false,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: nucleus.light.semantic.bg.canvas, // White background
  },
  chatContent: {
    flex: 1,
    backgroundColor: nucleus.light.semantic.bg.canvas, // White background
  },
}); 