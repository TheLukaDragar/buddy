import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { BackHandler, Dimensions, Modal, StyleSheet, View } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Button, Text } from 'react-native-paper';
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
import { useDispatch, useSelector } from 'react-redux';
import { nucleus } from '../Buddy_variables.js';
import ChatComponent from '../components/ChatComponent';
import { useBuddyTheme } from '../constants/BuddyTheme';
import { sampleWorkoutSession } from '../data/sampleWorkouts';
import {
  adjustReps,
  adjustWeight,
  completeSet,
  confirmReadyAndStartSet,
  finishWorkoutEarly,
  jumpToSet,
  pauseSet,
  resumeSet,
  selectActiveWorkout,
  selectCurrentExercise,
  selectCurrentSet,
  selectTimers,
  selectWorkout,
  selectWorkoutStatus,
  startRest
} from '../store/slices/workoutSlice';

interface ProgressSegment {
  type: 'set' | 'rest';
  duration: number; // in seconds
  isActive?: boolean;
  isCompleted?: boolean;
  progress?: number; // 0-100 for current segment
}

interface WorkoutProgressProps {
  segments: ProgressSegment[];
}

const WorkoutProgress: React.FC<WorkoutProgressProps> = ({
  segments
}) => {
  // Get workout state from Redux
  const activeWorkout = useSelector(selectActiveWorkout);
  const currentSet = useSelector(selectCurrentSet);
  const timers = useSelector(selectTimers);
  const status = useSelector(selectWorkoutStatus);
  
  // Calculate current values from Redux state
  const currentWeight = currentSet?.targetWeight ? `${currentSet.targetWeight} kg` : 'Body';
  const currentReps = currentSet?.targetReps || 0;
  const elapsedTime = activeWorkout?.elapsedTime ? Math.floor(activeWorkout.elapsedTime / 1000) : 0;
  const isRunning = status === 'exercising' && !activeWorkout?.isPaused;
  const theme = useBuddyTheme();

  // Calculate total duration for proportional widths
  const totalDuration = segments.reduce((sum, segment) => sum + segment.duration, 0);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const totalSeconds = Math.floor(seconds);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Find which segment is currently active based on workout state
  const getCurrentSegmentInfo = () => {
    if (!activeWorkout || !currentSet) {
      return {
        activeIndex: 0,
        progress: 0,
        remainingTime: segments[0]?.duration || 45,
        segmentType: 'set' as const
      };
    }

    // Calculate which segment we're in based on current set and phase
    const currentSetIndex = activeWorkout.currentSetIndex;
    let segmentIndex = currentSetIndex * 2; // Each set has a set segment and rest segment
    
    // Adjust for current phase with more precise state handling
    if (status === 'resting' || status === 'rest-ending') {
      segmentIndex += 1; // We're in the rest segment
    } else if (status === 'set-complete') {
      // Just completed a set, show 100% progress for that set
      segmentIndex = currentSetIndex * 2; // Stay on the set segment
    }
    
    // Ensure we don't go beyond available segments
    segmentIndex = Math.min(segmentIndex, segments.length - 1);
    
    // Calculate progress within current segment
    let progress = 0;
    let remainingTime = segments[segmentIndex]?.duration || 45;
    
    if (status === 'exercising') {
      // For sets, use elapsed time
      const targetDuration = currentSet.targetTime || 45;
      const elapsed = elapsedTime;
      progress = Math.min((elapsed / targetDuration) * 100, 100);
      remainingTime = Math.max(0, targetDuration - elapsed);
    } else if (status === 'set-complete') {
      // Show completed set
      progress = 100;
      remainingTime = 0;
    } else if (status === 'resting' || status === 'rest-ending') {
      // For rest, use the displayed time from activeWorkout
      const restDuration = currentSet.restTimeAfter || 60;
      
      if (activeWorkout?.timeRemaining !== undefined) {
        // timeRemaining is already in seconds from Redux store
        const remainingSec = Math.max(0, activeWorkout.timeRemaining);
        const elapsedSec = Math.max(0, restDuration - remainingSec);
        
        // Calculate progress based on elapsed time vs total duration
        progress = Math.min((elapsedSec / restDuration) * 100, 100);
        remainingTime = Math.floor(remainingSec);
      } else {
        // No timer active, show 0 progress
        progress = 0;
        remainingTime = restDuration;
      }
    } else if (status === 'preparing') {
      // Preparing for set, show 0 progress
      progress = 0;
      remainingTime = segments[segmentIndex]?.duration || 45;
    }
    
    return {
      activeIndex: segmentIndex,
      progress: Math.max(0, Math.min(100, progress)), // Clamp between 0-100
      remainingTime: Math.max(0, remainingTime), // Ensure non-negative
      segmentType: segments[segmentIndex]?.type || 'set'
    };
  };

  const currentInfo = getCurrentSegmentInfo();

  const getSegmentColor = (segment: ProgressSegment, index: number) => {
    // Completed segments
    if (index < currentInfo.activeIndex) {
      return segment.type === 'set' 
        ? nucleus.light.global.brand["70"] // #D0DD17 for completed sets
        : nucleus.light.global.blue["40"]; // #89BAD5 for completed rest
    }
    
    // Active segment
    if (index === currentInfo.activeIndex && currentInfo.progress > 0) {
      return segment.type === 'set' 
        ? nucleus.light.global.brand["70"] // #D0DD17 for active sets
        : nucleus.light.global.blue["40"]; // #89BAD5 for active rest
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

// Workout Controls Component
interface WorkoutControlsProps {
  onShowFinishAlert: () => void;
}

const WorkoutControls: React.FC<WorkoutControlsProps> = ({ onShowFinishAlert }) => {
  const dispatch = useDispatch();
  const status = useSelector(selectWorkoutStatus);
  const activeWorkout = useSelector(selectActiveWorkout);
  const currentExercise = useSelector(selectCurrentExercise);
  const currentSet = useSelector(selectCurrentSet);
  
  // State for adjustment inputs
  const [showAdjustments, setShowAdjustments] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newReps, setNewReps] = useState('');

  // 3-Button Control Logic - Left/Right for workflow progression
  const getLeftButtonText = () => {
    if (status === 'inactive') return '←';
    return '←'; // Always show left button
  };

  const getCenterButtonText = () => {
    if (status === 'exercising' || status === 'resting' || status === 'rest-ending') {
      return activeWorkout?.isPaused ? 'RESUME' : 'PAUSE';
    }
    return 'PAUSE'; // No icons, just text
  };

  const getRightButtonText = () => {
    if (status === 'inactive') return '→';
    return '→'; // Always show right button
  };

  const handleLeftButton = () => {
    // Left button goes back ONE STATE in workflow and clears progress
    switch (status) {
      case 'inactive':
        // Can't go back from inactive
        break;
      case 'preparing':
        // Can't go back from preparing (it's the start of a set)
        break;
      case 'exercising':
        // Go back to preparing (restart preparation)
        // Clear any set progress and go back to preparing
        dispatch(jumpToSet({ targetSetNumber: (activeWorkout?.currentSetIndex || 0) + 1, reason: 'User went back' }));
        break;
      case 'set-complete':
        // Go back to exercising (restart the set)
        dispatch(confirmReadyAndStartSet());
        break;
      case 'resting':
        // Go back to set-complete (undo rest start)
        // Need to implement: go back to set-complete state
        console.log('TODO: Go back from resting to set-complete');
        break;
      case 'rest-ending':
        // Go back to resting (undo 10s warning)
        // Need to implement: restart rest timer
        console.log('TODO: Go back from rest-ending to resting');
        break;
      case 'exercise-transition':
        // Go back to preparing the last set of previous exercise
        console.log('TODO: Go back from exercise-transition');
        break;
    }
  };

  const handleCenterButton = () => {
    // Center button handles pause/resume for exercising and rest states
    if (status === 'exercising' || status === 'resting' || status === 'rest-ending') {
      if (activeWorkout?.isPaused) {
        dispatch(resumeSet());
      } else {
        dispatch(pauseSet({ reason: 'User requested pause' }));
      }
    }
    // Do nothing for other states
  };

  const handleRightButton = () => {
    // Right button goes FORWARD in workflow
    switch (status) {
      case 'inactive':
        dispatch(selectWorkout(sampleWorkoutSession));
        break;
      case 'preparing':
      case 'rest-ending':
      case 'exercise-transition':
        dispatch(confirmReadyAndStartSet());
        break;
      case 'exercising':
        dispatch(completeSet());
        break;
      case 'set-complete':
        dispatch(startRest());
        break;
      case 'resting':
        dispatch(confirmReadyAndStartSet()); // Skip rest
        break;
    }
  };

  const handleAdjustWeight = () => {
    if (newWeight && currentSet) {
      dispatch(adjustWeight({ 
        newWeight: parseFloat(newWeight), 
        reason: 'User adjustment' 
      }));
      setNewWeight('');
      setShowAdjustments(false);
    }
  };

  const handleAdjustReps = () => {
    if (newReps && currentSet) {
      dispatch(adjustReps({ 
        newReps: parseInt(newReps), 
        reason: 'User adjustment' 
      }));
      setNewReps('');
      setShowAdjustments(false);
    }
  };

  // Simple 3-Button Layout
  return (
    <View style={workoutControlsStyles.container}>
      {/* Current Exercise Info */}
      {currentExercise && (
        <View style={workoutControlsStyles.exerciseInfo}>
          <Text style={[workoutControlsStyles.exerciseTitle, { color: nucleus.light.global.grey["90"] }]}>
            {currentExercise.name}
          </Text>
          <Text style={[workoutControlsStyles.exerciseDetails, { color: nucleus.light.global.grey["70"] }]}>
            Set {(activeWorkout?.currentSetIndex || 0) + 1} of {currentExercise.sets.length} • 
            Exercise {(activeWorkout?.currentExerciseIndex || 0) + 1} of {activeWorkout?.totalExercises || 0}
          </Text>
        </View>
      )}

      {/* Status Indicator */}
      <View style={workoutControlsStyles.statusContainer}>
        <Text style={[workoutControlsStyles.statusText, { color: nucleus.light.global.blue["60"] }]}>
          {status.toUpperCase().replace('-', ' ')}
          {activeWorkout?.isPaused && ' (PAUSED)'}
        </Text>
      </View>

      {/* 3-Button Controls */}
      <View style={workoutControlsStyles.threeButtonContainer}>
        {/* Left Button */}
        <Button
          mode="outlined"
          style={workoutControlsStyles.sideButton}
          labelStyle={[workoutControlsStyles.sideButtonLabel, { color: nucleus.light.global.blue["60"] }]}
          contentStyle={workoutControlsStyles.sideButtonContent}
          compact={false}
          onPress={handleLeftButton}
        >
          {getLeftButtonText()}
        </Button>

        {/* Center Button */}
        <Button
          mode="contained"
          style={[workoutControlsStyles.centerButton, { backgroundColor: nucleus.light.global.blue["70"] }]}
          labelStyle={[workoutControlsStyles.centerButtonLabel, { color: nucleus.light.global.white }]}
          contentStyle={workoutControlsStyles.centerButtonContent}
          compact={false}
          onPress={handleCenterButton}
        >
          {getCenterButtonText()}
        </Button>

        {/* Right Button */}
        <Button
          mode="outlined"
          style={workoutControlsStyles.sideButton}
          labelStyle={[workoutControlsStyles.sideButtonLabel, { color: nucleus.light.global.blue["60"] }]}
          contentStyle={workoutControlsStyles.sideButtonContent}
          compact={false}
          onPress={handleRightButton}
        >
          {getRightButtonText()}
        </Button>
      </View>

      
    </View>
  );
};

const workoutControlsStyles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  exerciseInfo: {
    alignItems: 'center',
    gap: 4,
  },
  exerciseTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
    includeFontPadding: false,
  },
  exerciseDetails: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    lineHeight: 16.8,
    textAlign: 'center',
    includeFontPadding: false,
  },
  statusContainer: {
    alignItems: 'center',
    backgroundColor: nucleus.light.global.blue["10"],
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
  },
  statusText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    lineHeight: 14.4,
    letterSpacing: 1,
    includeFontPadding: false,
  },
  buttonsContainer: {
    gap: 12,
  },
  mainButton: {
    borderRadius: 48,
    minHeight: 56,
  },
  secondaryButton: {
    borderRadius: 48,
    minHeight: 48,
    borderWidth: 2,
  },
  buttonContent: {
    minHeight: 48,
    paddingHorizontal: 24,
    paddingVertical: 0,
  },
  
  // 3-Button Layout Styles
  threeButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  sideButton: {
    borderRadius: 32,
    minHeight: 56,
    minWidth: 80,
    borderColor: nucleus.light.global.blue["60"],
    borderWidth: 2,
  },
  sideButtonLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 20,
    lineHeight: 24,
    marginVertical: 0,
    includeFontPadding: false,
  },
  sideButtonContent: {
    minHeight: 56,
    paddingHorizontal: 20,
    paddingVertical: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    borderRadius: 48,
    minHeight: 72,
    minWidth: 120,
    shadowColor: nucleus.light.global.blue["70"],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  centerButtonLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    lineHeight: 20,
    marginVertical: 0,
    includeFontPadding: false,
  },
  centerButtonContent: {
    minHeight: 72,
    paddingHorizontal: 24,
    paddingVertical: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    lineHeight: 20,
    marginVertical: 0,
    includeFontPadding: false,
  },
  navigationContainer: {
    gap: 8,
  },
  navigationTitle: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    lineHeight: 16.8,
    textAlign: 'center',
    includeFontPadding: false,
  },
  navigationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navigationButton: {
    flex: 1,
    borderRadius: 24,
    minHeight: 40,
    borderColor: nucleus.light.global.blue["60"],
  },
  navigationButtonDisabled: {
    borderColor: nucleus.light.global.grey["30"],
    backgroundColor: nucleus.light.global.grey["10"],
  },
  navigationButtonLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    lineHeight: 14.4,
    color: nucleus.light.global.blue["60"],
    marginVertical: 0,
    includeFontPadding: false,
  },
  setIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: nucleus.light.global.blue["10"],
    borderRadius: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  setIndicatorText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    lineHeight: 14.4,
    includeFontPadding: false,
  },
  adjustmentsContainer: {
    gap: 8,
  },
  adjustmentsTitle: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    lineHeight: 16.8,
    textAlign: 'center',
    includeFontPadding: false,
  },
  adjustmentButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  adjustmentButton: {
    flex: 1,
    borderRadius: 24,
    minHeight: 40,
    borderColor: nucleus.light.global.grey["40"],
  },
  adjustmentButtonLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    lineHeight: 14.4,
    color: nucleus.light.global.grey["70"],
    marginVertical: 0,
    includeFontPadding: false,
  },
  finishButton: {
    alignSelf: 'center',
  },
  finishButtonLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    lineHeight: 16.8,
    includeFontPadding: false,
  },
});

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface BottomModalProps {
  visible: boolean;
  onShowFinishAlert: () => void;
}

const BottomModal: React.FC<BottomModalProps> = ({ visible, onShowFinishAlert }) => {
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
      // console.log('INITIAL CALCULATIONS:');
      // console.log('Screen height:', SCREEN_HEIGHT);
      // console.log('Collapsed height:', COLLAPSED_HEIGHT);
      // console.log('Collapsed position:', COLLAPSED_POSITION);
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
    // console.log('Height calculations:', {
    //   visibleModalHeight,
    //   baseContentHeight,
    //   keyboardHeight,
    //   finalChatContentHeight: chatContentHeight
    // });
  }

  // Callback to trigger scroll after modal expansion
  const handleModalExpansionComplete = () => {
    // This will be passed to ChatComponent to trigger scroll
    console.log('Modal expansion complete, should scroll to bottom');
  };

  useEffect(() => {
    const backAction = () => {
      if (!isModalCollapsed) {
        // Modal is expanded, collapse it (no alert)
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
            // Trigger scroll after collapse
            runOnJS(setScrollTrigger)(Date.now());
          }
        });
        return true; // Prevent default back action
      } else {
        // Modal is collapsed, show custom finish alert
        onShowFinishAlert();
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [isModalCollapsed, modalTranslateY, COLLAPSED_POSITION, COLLAPSED_HEIGHT, lastUpdatedHeight, updateVisibleHeight, endAnimation, setScrollTrigger, onShowFinishAlert]);

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

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onContinue: () => void;
  onFinish: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  onContinue,
  onFinish
}) => {
  const theme = useBuddyTheme();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View style={customAlertStyles.overlay}>
        <ReanimatedAnimated.View 
          entering={FadeIn.duration(100)}
          style={[customAlertStyles.container, { backgroundColor: nucleus.light.semantic.bg.canvas, borderWidth: 1, borderColor: nucleus.light.global.grey["40"] }]}
        >
          {/* Title */}
          <Text style={[customAlertStyles.title, { color: nucleus.light.global.grey["90"] }]}>
            {title}
          </Text>
          
          {/* Message */}
          <Text style={[customAlertStyles.message, { color: nucleus.light.global.grey["70"] }]}>
            {message}
          </Text>
          
          {/* Buttons */}
          <View style={customAlertStyles.buttonContainer}>
            <Button
              mode="outlined"
              style={[customAlertStyles.button, customAlertStyles.continueButton, { 
                borderColor: nucleus.light.global.grey["40"],
                backgroundColor: nucleus.light.semantic.bg.canvas
              }]}
              labelStyle={[customAlertStyles.buttonLabel, { color: nucleus.light.global.grey["70"] }]}
              contentStyle={customAlertStyles.buttonContent}
              compact={false}
              onPress={onContinue}
            >
              No
            </Button>
            
            <Button
              mode="contained"
              style={[customAlertStyles.button, customAlertStyles.finishButton, { 
                backgroundColor: nucleus.light.global.blue["70"]
              }]}
              labelStyle={[customAlertStyles.buttonLabel, { color: nucleus.light.global.white }]}
              contentStyle={customAlertStyles.buttonContent}
              compact={false}
              onPress={onFinish}
            >
              Finish
            </Button>
          </View>
        </ReanimatedAnimated.View>
      </View>
    </Modal>
  );
};

const customAlertStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  container: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  title: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 8,
    includeFontPadding: false,
  },
  message: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
    includeFontPadding: false,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    borderRadius: 12,
    minHeight: 48,
  },
  continueButton: {
    borderWidth: 1.5,
  },
  finishButton: {
    // Additional styles if needed
  },
  buttonContent: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  buttonLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    
    lineHeight: 20,
    marginVertical: 0,
    includeFontPadding: false,
  },
});

export default function ActiveWorkoutScreen() {
  const theme = useBuddyTheme();
  const insets = useSafeAreaInsets();
  const [showFinishAlert, setShowFinishAlert] = useState(false);
  
  // Redux state
  const activeWorkout = useSelector(selectActiveWorkout);
  const currentExercise = useSelector(selectCurrentExercise);
  const status = useSelector(selectWorkoutStatus);

  // Generate progress segments from current exercise
  const generateProgressSegments = (): ProgressSegment[] => {
    if (!currentExercise) {
      // Default segments for demo
      return [
        { type: 'set', duration: 45 },
        { type: 'rest', duration: 60 },
        { type: 'set', duration: 45 },
        { type: 'rest', duration: 60 },
        { type: 'set', duration: 45 },
        { type: 'rest', duration: 60 },
      ];
    }
    
    const segments: ProgressSegment[] = [];
    currentExercise.sets.forEach((set, index) => {
      // Add set segment
      segments.push({
        type: 'set',
        duration: set.targetTime || 45,
      });
      
      // Add rest segment if the set has restTimeAfter defined
      // This includes rest after the last set if it has a rest period
      if (set.restTimeAfter && set.restTimeAfter > 0) {
        segments.push({
          type: 'rest',
          duration: set.restTimeAfter,
        });
      }
    });
    
    return segments;
  };

  const progressSegments = generateProgressSegments();

  const dispatch = useDispatch();

  const handleFinishWorkout = () => {
    // Dispatch finish workout early action
    dispatch(finishWorkoutEarly());
    setShowFinishAlert(false);
    
    // Show completion message
    setTimeout(() => {
      router.back();
    }, 1000);
  };

  const handleContinueWorkout = () => {
    setShowFinishAlert(false);
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
            {/* Workout Controls */}
            <WorkoutControls onShowFinishAlert={() => setShowFinishAlert(true)} />
          </View>
          
          <View style={styles.workoutStatusContainer}>
            <WorkoutProgress segments={progressSegments} />
          </View>
        </ReanimatedAnimated.View>
      </SafeAreaView>
      
      {/* Bottom Modal */}
      <BottomModal visible={true} onShowFinishAlert={() => setShowFinishAlert(true)} />

      <View style={[styles.buddyAiButton, { bottom: insets.bottom }]}>
        <Image source={require('../assets/icons/AI.svg')} style={styles.buddyAiIcon} />
      </View>

      {/* Custom Alert */}
      <CustomAlert
        visible={showFinishAlert}
        title="Finish workout?"
        message={
          activeWorkout 
            ? `You've completed ${activeWorkout.completedSets} of ${activeWorkout.totalSets} sets across ${activeWorkout.completedExercises} exercises. Are you sure you want to finish early?`
            : "Are you sure you want to finish your workout?"
        }
        onContinue={handleContinueWorkout}
        onFinish={handleFinishWorkout}
      />
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
  buddyAiButton: {
    position: 'absolute',
    zIndex: 1000,
    right: 11,
    bottom: 21,
    height: 64,
    width: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buddyAiIcon: {
    width: 64,
    height: 64,
  },
}); 