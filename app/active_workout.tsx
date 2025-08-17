import { unwrapResult } from '@reduxjs/toolkit';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect, useState } from 'react';
import { BackHandler, Dimensions, Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
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
import { useSelector } from 'react-redux';
import { nucleus } from '../Buddy_variables.js';
import ChatComponent from '../components/ChatComponent';
import { useBuddyTheme } from '../constants/BuddyTheme';
import { mihasWorkout } from '../data/sampleWorkouts';
import { contextBridgeService } from '../services/contextBridgeService';
import { store } from '../store';
import {
  adjustReps,
  adjustRestTime,
  adjustWeight,
  completeExercise,
  completeSet,
  confirmReadyAndStartSet,
  finishWorkoutEarly,
  getExerciseInstructions,
  getWorkoutStatus,
  jumpToSet,
  pauseSet,
  resumeSet,
  selectWorkout,
  startExercisePreparation,
  startRest
} from '../store/actions/workoutActions';
import { useAppDispatch } from '../store/hooks';
import {
  selectActiveWorkout,
  selectCurrentExercise,
  selectCurrentSet,
  selectTimers,
  selectWorkoutStatus,
  setVoiceAgentStatus
} from '../store/slices/workoutSlice';

import type { ConversationEvent, ConversationStatus, Mode, Role } from '@elevenlabs/react-native';
import { useConversation } from '@elevenlabs/react-native';
import { AnimatedAIButton } from '../components/AnimatedAIButton';
import { useAuth } from '../contexts/AuthContext';
import { useMicrophonePermission } from '../hooks/useMicrophonePermission';


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

// Exercise Video Component
interface ExerciseVideoProps {
  videoUrl?: string;
  exerciseName: string;
  isPaused?: boolean;
}

const ExerciseVideo: React.FC<ExerciseVideoProps> = ({ videoUrl, exerciseName, isPaused = false }) => {
  // Map video URLs to required assets
  const getVideoAsset = (url?: string) => {
    if (!url) return null;
    
    try {
      if (url.includes('squats.mp4')) {
        return require('../assets/videos/squats.mp4');
      } else if (url.includes('bench_dumbles.mp4')) {
        return require('../assets/videos/bench_dumbles.mp4');
      } else if (url.includes('literal_shoulder.mp4')) {
        return require('../assets/videos/literal_shoulder.mp4');
      } else if (url.includes('seatued_pulling.mp4')) {
        return require('../assets/videos/seatued_pulling.mp4');
      }
    } catch (error) {
      console.warn('Video asset not found:', url);
      return null;
    }
    
    return null;
  };

  const videoAsset = getVideoAsset(videoUrl);
  
  const player = useVideoPlayer(videoAsset, (player) => {
    player.loop = true;
    player.muted = true;
    if (videoAsset) {
      player.play();
    }
  });

  // Handle pause/resume based on workout state
  useEffect(() => {
    if (player && videoAsset) {
      if (isPaused) {
        player.pause();
      } else {
        player.play();
      }
    }
  }, [isPaused, player, videoAsset]);

  if (!videoAsset) {
    return (
      <View style={exerciseVideoStyles.container}>
        <View style={exerciseVideoStyles.placeholderContainer}>
          <Text style={exerciseVideoStyles.placeholderText}>
            {exerciseName}
          </Text>
          <Text style={exerciseVideoStyles.placeholderSubtext}>
            Exercise demonstration
          </Text>
        </View>
      </View>
    );
  }

  return (
    <VideoView
      style={exerciseVideoStyles.video}
      player={player}
      allowsFullscreen={false}
      allowsPictureInPicture={false}
      contentFit="cover"
      nativeControls={false}
    />
  );
};

const exerciseVideoStyles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: nucleus.light.global.grey["20"],
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: nucleus.light.global.grey["10"],
    borderRadius: 16,
  },
  placeholderText: {
    color: nucleus.light.global.grey["70"],
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 4,
    includeFontPadding: false,
  },
  placeholderSubtext: {
    color: nucleus.light.global.grey["50"],
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    lineHeight: 16.8,
    textAlign: 'center',
    includeFontPadding: false,
  },
});

// Video Container with Auto-fade Controls
interface VideoContainerProps {
  currentExercise?: any;
  status: string;
  activeWorkout?: any;
  onShowFinishAlert: () => void;
  onHideControls?: () => void;
}

const VideoContainer: React.FC<VideoContainerProps> = ({ 
  currentExercise, 
  status, 
  activeWorkout, 
  onShowFinishAlert,
  onHideControls 
}) => {
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsOpacity = useSharedValue(1);

  // Auto-show controls when paused/preparing
  useEffect(() => {
    if (status === 'paused' || activeWorkout?.isPaused || status === 'preparing') {
      setControlsVisible(true);
      controlsOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [status, activeWorkout?.isPaused]);

  // Auto-hide controls after 5 seconds when not paused
  useEffect(() => {
    if (controlsVisible && status !== 'paused' && !activeWorkout?.isPaused && status !== 'preparing') {
      const timeout = setTimeout(() => {
        setControlsVisible(false);
        controlsOpacity.value = withTiming(0, { duration: 300 });
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [controlsVisible, status, activeWorkout?.isPaused]);

  const showControls = () => {
    setControlsVisible(true);
    controlsOpacity.value = withTiming(1, { duration: 300 });
  };

  const hideControls = () => {
    if (status !== 'paused' && !activeWorkout?.isPaused && status !== 'preparing') {
      setControlsVisible(false);
      controlsOpacity.value = withTiming(0, { duration: 300 });
    }
  };

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
  }));

  return (
    <View style={styles.videoContainer}>
      <ExerciseVideo 
        videoUrl={currentExercise?.videoUrl} 
        exerciseName={currentExercise?.name || 'Exercise'} 
        isPaused={activeWorkout?.isPaused}
      />
      
      {/* Tap area to show controls */}
      <TouchableWithoutFeedback onPress={showControls}>
        <View style={styles.videoTouchArea} />
      </TouchableWithoutFeedback>
      
      {/* Always visible exercise info */}
      <View style={styles.bottomLayout}>
        {currentExercise && (
          <View style={styles.exerciseNameContainer}>
            <Text style={styles.exerciseName}>
              {currentExercise.name}
            </Text>
          </View>
        )}
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusInfo}>
            {status.toUpperCase().replace('-', ' ')}
            {activeWorkout?.isPaused && ' (PAUSED)'}
          </Text>
        </View>
      </View>
      
      {/* Simple controls overlay */}
      <ReanimatedAnimated.View 
        style={[styles.controlsOverlay, animatedOverlayStyle]} 
        pointerEvents={controlsVisible ? 'auto' : 'none'}
      >
        <TouchableWithoutFeedback onPress={hideControls}>
          <View style={styles.overlayBackground} />
        </TouchableWithoutFeedback>
        
        <View style={styles.centeredControls}>
          <WorkoutControls onShowFinishAlert={onShowFinishAlert} />
        </View>
      </ReanimatedAnimated.View>
    </View>
  );
};

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
      // For sets, use actual timer remaining time from Redux
      const targetDuration = currentSet.targetTime || 45;
      
      // Use actual remaining time from timer state (in milliseconds, convert to seconds)
      if (timers.setTimer && timers.setTimer.remaining) {
        const remainingSeconds = Math.max(0, Math.floor(timers.setTimer.remaining / 1000));
        remainingTime = remainingSeconds;
        // Calculate progress based on how much time has passed from original duration
        const elapsedFromOriginal = targetDuration - remainingSeconds;
        progress = Math.min((elapsedFromOriginal / targetDuration) * 100, 100);
      } else {
        // Fallback to elapsed time calculation
        const elapsed = elapsedTime;
        progress = Math.min((elapsed / targetDuration) * 100, 100);
        remainingTime = Math.max(0, targetDuration - elapsed);
      }
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
  const dispatch = useAppDispatch();
  const status = useSelector(selectWorkoutStatus);
  const activeWorkout = useSelector(selectActiveWorkout);
  const currentExercise = useSelector(selectCurrentExercise);
  const currentSet = useSelector(selectCurrentSet);
  const timers = useSelector(selectTimers);
  
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
    switch (status) {
      case 'preparing':
      case 'rest-ending':
      case 'exercise-transition':
        return 'START';
      case 'exercising':
        return activeWorkout?.isPaused ? 'RESUME' : 'PAUSE';
      case 'resting':
        return activeWorkout?.isPaused ? 'RESUME' : 'PAUSE';
      case 'set-complete':
        return 'REST';
      case 'selected':
        return 'BEGIN';
      case 'inactive':
      default:
        return 'START';
    }
  };

  const getRightButtonText = () => {
    if (status === 'inactive') return '→';
    return '→'; // Always show right button
  };

  const handleLeftButton = async () => {
    // Left button goes back ONE STATE in workflow and clears progress
    try {
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
          const jumpResult = await dispatch(jumpToSet({ targetSetNumber: (activeWorkout?.currentSetIndex || 0) + 1, reason: 'User went back' }));
          const jumpData = unwrapResult(jumpResult);
          console.log('Jump to set result:', jumpData);
          break;
        case 'set-complete':
          // Go back to exercising (restart the set)
          const startResult = await dispatch(confirmReadyAndStartSet());
          const startData = unwrapResult(startResult);
          console.log('Confirm ready and start set result:', startData);
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
    } catch (error) {
      console.error('Left button action failed:', error);
    }
  };

  const handleCenterButton = async () => {
    try {
      switch (status) {
        case 'inactive':
          // START - Select workout to begin
          const selectResult = await dispatch(selectWorkout(mihasWorkout));
          const selectData = unwrapResult(selectResult);
          console.log('Select workout result:', selectData);
          break;
        case 'selected':
          // BEGIN - Start exercise preparation
          const prepResult = await dispatch(startExercisePreparation());
          const prepData = unwrapResult(prepResult);
          console.log('Start exercise preparation result:', prepData);
          break;
        case 'preparing':
        case 'rest-ending':
        case 'exercise-transition':
          // START - Begin the set
          const confirmResult = await dispatch(confirmReadyAndStartSet());
          const confirmData = unwrapResult(confirmResult);
          console.log('Confirm ready and start set result:', confirmData);
          break;
        case 'exercising':
          // PAUSE/RESUME
          if (activeWorkout?.isPaused) {
            const resumeResult = await dispatch(resumeSet());
            const resumeData = unwrapResult(resumeResult);
            console.log('Resume set result:', resumeData);
          } else {
            const pauseResult = await dispatch(pauseSet({ reason: 'User requested pause' }));
            const pauseData = unwrapResult(pauseResult);
            console.log('Pause set result:', pauseData);
          }
          break;
        case 'resting':
          // PAUSE/RESUME
          if (activeWorkout?.isPaused) {
            const resumeResult = await dispatch(resumeSet());
            const resumeData = unwrapResult(resumeResult);
            console.log('Resume set result:', resumeData);
          } else {
            const pauseResult = await dispatch(pauseSet({ reason: 'User requested pause' }));
            const pauseData = unwrapResult(pauseResult);
            console.log('Pause set result:', pauseData);
          }
          break;
        case 'set-complete':
          // REST - Start rest period
          const restResult = await dispatch(startRest());
          const restData = unwrapResult(restResult);
          console.log('Start rest result:', restData);
          break;
      }
    } catch (error) {
      console.error('Center button action failed:', error);
    }
  };

  const handleRightButton = async () => {
    // Right button goes FORWARD in workflow
    try {
      switch (status) {
        case 'inactive':
          const selectResult = await dispatch(selectWorkout(mihasWorkout));
          const selectData = unwrapResult(selectResult);
          console.log('Select workout result:', selectData);
          break;
        case 'preparing':
        case 'rest-ending':
        case 'exercise-transition':
          const confirmResult = await dispatch(confirmReadyAndStartSet());
          const confirmData = unwrapResult(confirmResult);
          console.log('Confirm ready and start set result:', confirmData);
          break;
        case 'exercising':
          const completeResult = await dispatch(completeSet({}));
          const completeData = unwrapResult(completeResult);
          console.log('Complete set result:', completeData);
          break;
        case 'set-complete':
          const restResult = await dispatch(startRest());
          const restData = unwrapResult(restResult);
          console.log('Start rest result:', restData);
          break;
        case 'resting':
          // Check if this is the last set - if so, complete exercise instead of starting new set
          if (timers.restTimer?.isLastSet) {
            const completeExerciseResult = await dispatch(completeExercise());
            const completeExerciseData = unwrapResult(completeExerciseResult);
            console.log('Complete exercise result:', completeExerciseData);
          } else {
            const skipRestResult = await dispatch(confirmReadyAndStartSet()); // Skip rest
            const skipRestData = unwrapResult(skipRestResult);
            console.log('Skip rest result:', skipRestData);
          }
          break;
      }
    } catch (error) {
      console.error('Right button action failed:', error);
    }
  };

  const handleAdjustWeight = async () => {
    if (newWeight && currentSet) {
      try {
        const adjustResult = await dispatch(adjustWeight({ 
          newWeight: parseFloat(newWeight), 
          reason: 'User adjustment' 
        }));
        const adjustData = unwrapResult(adjustResult);
        console.log('Adjust weight result:', adjustData);
        setNewWeight('');
        setShowAdjustments(false);
      } catch (error) {
        console.error('Adjust weight failed:', error);
      }
    }
  };

  const handleAdjustReps = async () => {
    if (newReps && currentSet) {
      try {
        const adjustResult = await dispatch(adjustReps({ 
          newReps: parseInt(newReps), 
          reason: 'User adjustment' 
        }));
        const adjustData = unwrapResult(adjustResult);
        console.log('Adjust reps result:', adjustData);
        setNewReps('');
        setShowAdjustments(false);
      } catch (error) {
        console.error('Adjust reps failed:', error);
      }
    }
  };

  // Simple 3-Button Layout
  return (
    <View style={workoutControlsStyles.container}>
      {/* Compact 3-Button Controls */}
      <View style={workoutControlsStyles.compactButtonContainer}>
        {/* Left Button - Tour */}
        <TouchableOpacity
          style={workoutControlsStyles.tourButton}
          onPress={handleLeftButton}
        >
          <Image
            source={require('../assets/icons/back.svg')}
            style={workoutControlsStyles.tourIcon}
            contentFit="contain"
          />
        </TouchableOpacity>

        {/* Center Button */}
        <Button
          mode="outlined"
          style={workoutControlsStyles.compactCenterButton}
          labelStyle={workoutControlsStyles.compactCenterButtonLabel}
          contentStyle={workoutControlsStyles.compactCenterButtonContent}
          compact={false}
          onPress={handleCenterButton}
        >
          {getCenterButtonText()}
        </Button>

        {/* Right Button - Tour */}
        <TouchableOpacity
          style={workoutControlsStyles.tourButton}
          onPress={handleRightButton}
        >
          <Image
            source={require('../assets/icons/back.svg')}
            style={workoutControlsStyles.tourIconFlipped}
            contentFit="contain"
          />
        </TouchableOpacity>
      </View>

     

      
    </View>
  );
};

const workoutControlsStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tourButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: nucleus.light.global.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(185, 230, 255, 0.40)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 25,
    elevation: 25,
  },
  tourIcon: {
    width: 20,
    height: 20,
    tintColor: nucleus.light.global.white,
  },
  tourIconFlipped: {
    width: 20,
    height: 20,
    tintColor: nucleus.light.global.white,
    transform: [{ scaleX: -1 }],
  },

  
  compactButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
 
  
  compactCenterButton: {
    borderRadius: 32,
    minHeight: 56,
    minWidth: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: nucleus.light.global.white,
    shadowColor: 'rgba(185, 230, 255, 0.40)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 25,
    elevation: 25,
  },
  compactCenterButtonLabel: {
    color: nucleus.light.global.white,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    lineHeight: 18,
    marginVertical: 0,
    includeFontPadding: false,
  },
  compactCenterButtonContent: {
    minHeight: 56,
    paddingHorizontal: 0,
    paddingVertical: 0,
    justifyContent: 'center',
    alignItems: 'center',
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
  // Conversation event props
  conversationEvents?: ConversationEvent[];
  conversationMode?: Mode;
  conversationStatus?: ConversationStatus;
  canSendFeedback?: boolean;
  onEventReceived?: (event: ConversationEvent, source: Role) => void;
  // ElevenLabs conversation instance
  conversation?: any; // Type from useConversation hook
  onAddConversationEvent?: (event: ConversationEvent) => void;
}

const BottomModal: React.FC<BottomModalProps> = ({ 
  visible, 
  onShowFinishAlert,
  conversationEvents,
  conversationMode,
  conversationStatus,
  canSendFeedback,
  onEventReceived,
  conversation,
  onAddConversationEvent
}) => {
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
            // Conversation event props
            conversationEvents={conversationEvents}
            conversationMode={conversationMode}
            conversationStatus={conversationStatus}
            canSendFeedback={canSendFeedback}
            onEventReceived={(event, source) => {
              console.log('Event processed by ChatComponent:', event.type, 'from:', source);
            }}
            onSendTextMessage={(message) => {
              // Add the user message to conversation events manually since ElevenLabs doesn't always emit user_transcript for text
              const userMessageEvent: ConversationEvent = {
                type: 'user_transcript',
                user_transcription_event: {
                  user_transcript: message
                }
              } as any;
              
              // Add to our events array immediately so it shows in chat
              if (onAddConversationEvent) {
                onAddConversationEvent(userMessageEvent);
              }
              
              // Send typed message to ElevenLabs conversation
              if (conversation?.status === 'connected') {
                conversation.sendUserMessage(message);
                console.log('Sent text message to ElevenLabs:', message);
              } else {
                console.warn('Cannot send text message - ElevenLabs conversation not connected');
              }
            }}
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
  
  // Auth context
  const { user } = useAuth();
  
  // Microphone permissions
  const { requestMicrophonePermission } = useMicrophonePermission();
  
  // Redux state
  const activeWorkout = useSelector(selectActiveWorkout);
  const currentExercise = useSelector(selectCurrentExercise);
  const status = useSelector(selectWorkoutStatus);
  const dispatch = useAppDispatch();

  // Auto-select workout when status is inactive
  useEffect(() => {
    if (status === 'inactive') {
      console.log('🏋️ Auto-selecting Miha\'s workout...');
      dispatch(selectWorkout(mihasWorkout));
    }
  }, [status, dispatch]);

  // ElevenLabs Conversation state
  const [conversationToken, setConversationToken] = useState<string | null>(null);
  const [conversationEvents, setConversationEvents] = useState<ConversationEvent[]>([]);
  const [conversationMode, setConversationMode] = useState<Mode | undefined>();
  const [conversationStatus, setConversationStatus] = useState<ConversationStatus>('disconnected');
  const [canSendFeedback, setCanSendFeedback] = useState<boolean>(false);
  const agentId = 'agent_7501k2pbpjmqe2et3qh3634a66rv';
  
  // Initialize conversation with handlers and client tools
  const conversation = useConversation({
    clientTools: {
      // Workout Tools (13)
      start_set: async (params: unknown) => {
        try {
          const result = await dispatch(confirmReadyAndStartSet());
          const data = unwrapResult(result);
          console.log('🎯 [Client Tool] start_set result:', data);
          return JSON.stringify(data);
        } catch (error) {
          console.error('❌ [Client Tool] start_set failed:', error);
          return JSON.stringify({ success: false, message: `Failed to start set: ${error}` });
        }
      },
      
      complete_set: async (params: unknown) => {
        try {
          const typedParams = params as { actualReps?: number };
          const result = await dispatch(completeSet({ actualReps: typedParams?.actualReps }));
          const data = unwrapResult(result);
          console.log('🎯 [Client Tool] complete_set result:', data);
          return JSON.stringify(data);
        } catch (error) {
          console.error('❌ [Client Tool] complete_set failed:', error);
          return JSON.stringify({ success: false, message: `Failed to complete set: ${error}` });
        }
      },
      
      pause_set: async (params: unknown) => {
        try {
          const typedParams = params as { reason: string };
          const result = await dispatch(pauseSet({ reason: typedParams.reason }));
          const data = unwrapResult(result);
          console.log('🎯 [Client Tool] pause_set result:', data);
          return JSON.stringify(data);
        } catch (error) {
          console.error('❌ [Client Tool] pause_set failed:', error);
          return JSON.stringify({ success: false, message: `Failed to pause set: ${error}` });
        }
      },
      
      resume_set: async (params: unknown) => {
        try {
          const result = await dispatch(resumeSet());
          const data = unwrapResult(result);
          console.log('🎯 [Client Tool] resume_set result:', data);
          return JSON.stringify(data);
        } catch (error) {
          console.error('❌ [Client Tool] resume_set failed:', error);
          return JSON.stringify({ success: false, message: `Failed to resume set: ${error}` });
        }
      },
      
      restart_set: async (params: unknown) => {
        try {
          const typedParams = params as { reason: string };
          const state = store.getState();
          const currentSetNumber = (state.workout.activeWorkout?.currentSetIndex || 0) + 1;
          const result = await dispatch(jumpToSet({ targetSetNumber: currentSetNumber, reason: typedParams.reason }));
          const data = unwrapResult(result);
          console.log('🎯 [Client Tool] restart_set result:', data);
          return JSON.stringify(data);
        } catch (error) {
          console.error('❌ [Client Tool] restart_set failed:', error);
          return JSON.stringify({ success: false, message: `Failed to restart set: ${error}` });
        }
      },
      
      extend_rest: async (params: unknown) => {
        try {
          const typedParams = params as { additionalSeconds: number; reason?: string };
          
          if (!typedParams.additionalSeconds || typedParams.additionalSeconds <= 0) {
            throw new Error('additionalSeconds must be a positive number');
          }
          
          const state = store.getState();
          const workoutState = state.workout;
          const reason = typedParams.reason || 'Agent extended rest period';
          
          if (!workoutState.activeWorkout) {
            throw new Error('No active workout to extend rest for');
          }
          
          // Handle different workout states
          if (workoutState.status === 'resting') {
            // User is currently resting - extend the active rest timer and restart countdown
            if (!workoutState.timers.restTimer) {
              throw new Error('No active rest timer to extend');
            }
            
            const currentRemaining = Math.floor(workoutState.timers.restTimer.remaining / 1000);
            const newRestTime = currentRemaining + typedParams.additionalSeconds;
            
            // Dispatch the rest time adjustment (this will restart the timer via middleware)
            const result = await dispatch(adjustRestTime({ newRestTime, reason }));
            const data = unwrapResult(result);
            
            return JSON.stringify({
              ...data,
              action: 'extended_active_rest',
              message: `Extended current rest by ${typedParams.additionalSeconds}s. Timer restarted with ${newRestTime}s total.`,
              wasActivelyResting: true,
              wasPaused: workoutState.activeWorkout.isPaused
            });
            
          } else if (workoutState.status === 'exercising' || workoutState.status === 'preparing') {
            // User is exercising or preparing - set rest time for next rest period
            if (!workoutState.activeWorkout.currentSet) {
              throw new Error('No current set to adjust rest time for');
            }
            
            const currentRestTime = workoutState.activeWorkout.currentSet.restTimeAfter;
            if (typeof currentRestTime !== 'number') {
              throw new Error('Current set has no defined rest time to extend');
            }
            
            const newRestTime = currentRestTime + typedParams.additionalSeconds;
            const result = await dispatch(adjustRestTime({ newRestTime, reason }));
            const data = unwrapResult(result);
            
            return JSON.stringify({
              ...data,
              action: 'extended_next_rest',
              message: `Extended rest time for next rest period by ${typedParams.additionalSeconds}s (will be ${newRestTime}s total).`,
              wasActivelyResting: false,
              currentState: workoutState.status
            });
            
          } else {
            // Invalid state for rest extension
            throw new Error(`Cannot extend rest during ${workoutState.status} state. Only during exercising, preparing, or resting.`);
          }
          
        } catch (error) {
          console.error('❌ [Client Tool] extend_rest failed:', error);
          return JSON.stringify({ 
            success: false, 
            message: `Failed to extend rest: ${error instanceof Error ? error.message : error}` 
          });
        }
      },
      
      jump_to_set: async (params: unknown) => {
        try {
          const typedParams = params as { setNumber: number; targetSetNumber?: number; reason?: string };
          // Handle both parameter names for compatibility 
          const targetSetNumber = typedParams.setNumber || typedParams.targetSetNumber;
          const reason = typedParams.reason || 'Agent navigation';
          
          if (!targetSetNumber) {
            throw new Error('Missing setNumber parameter');
          }
          
          const result = await dispatch(jumpToSet({ targetSetNumber, reason }));
          const data = unwrapResult(result);
          console.log('🎯 [Client Tool] jump_to_set result:', data);
          return JSON.stringify(data);
        } catch (error) {
          console.error('❌ [Client Tool] jump_to_set failed:', error);
          return JSON.stringify({ success: false, message: `Failed to jump to set: ${error}` });
        }
      },
      
      adjust_weight: async (params: unknown) => {
        try {
          const typedParams = params as { newWeight: number; reason: string };
          const result = await dispatch(adjustWeight({ newWeight: typedParams.newWeight, reason: typedParams.reason }));
          const data = unwrapResult(result);
          console.log('🎯 [Client Tool] adjust_weight result:', data);
          return JSON.stringify(data);
        } catch (error) {
          console.error('❌ [Client Tool] adjust_weight failed:', error);
          return JSON.stringify({ success: false, message: `Failed to adjust weight: ${error}` });
        }
      },
      
      adjust_reps: async (params: unknown) => {
        try {
          const typedParams = params as { newReps: number; reason: string };
          const result = await dispatch(adjustReps({ newReps: typedParams.newReps, reason: typedParams.reason }));
          const data = unwrapResult(result);
          console.log('🎯 [Client Tool] adjust_reps result:', data);
          return JSON.stringify(data);
        } catch (error) {
          console.error('❌ [Client Tool] adjust_reps failed:', error);
          return JSON.stringify({ success: false, message: `Failed to adjust reps: ${error}` });
        }
      },
      
      adjust_rest_time: async (params: unknown) => {
        try {
          const typedParams = params as { newRestTime: number; reason: string };
          const result = await dispatch(adjustRestTime({ newRestTime: typedParams.newRestTime, reason: typedParams.reason }));
          const data = unwrapResult(result);
          console.log('🎯 [Client Tool] adjust_rest_time result:', data);
          return JSON.stringify(data);
        } catch (error) {
          console.error('❌ [Client Tool] adjust_rest_time failed:', error);
          return JSON.stringify({ success: false, message: `Failed to adjust rest time: ${error}` });
        }
      },
      
      get_workout_status: async (params: unknown) => {
        try {
          const result = await dispatch(getWorkoutStatus());
          const data = unwrapResult(result);
          console.log('🎯 [Client Tool] get_workout_status result:', data);
          return JSON.stringify(data);
        } catch (error) {
          console.error('❌ [Client Tool] get_workout_status failed:', error);
          return JSON.stringify({ success: false, message: `Failed to get workout status: ${error}` });
        }
      },
      
      get_exercise_instructions: async (params: unknown) => {
        try {
          const result = await dispatch(getExerciseInstructions());
          const data = unwrapResult(result);
          console.log('🎯 [Client Tool] get_exercise_instructions result:', data);
          return JSON.stringify(data);
        } catch (error) {
          console.error('❌ [Client Tool] get_exercise_instructions failed:', error);
          return JSON.stringify({ success: false, message: `Failed to get exercise instructions: ${error}` });
        }
      },
      
      pause_for_issue: async (params: unknown) => {
        try {
          const typedParams = params as { reason: string };
          const result = await dispatch(pauseSet({ reason: typedParams.reason }));
          const data = unwrapResult(result);
          console.log('🎯 [Client Tool] pause_for_issue result:', data);
          return JSON.stringify(data);
        } catch (error) {
          console.error('❌ [Client Tool] pause_for_issue failed:', error);
          return JSON.stringify({ success: false, message: `Failed to pause for issue: ${error}` });
        }
      },
      
      // Music Tools (10) - Placeholder implementations
      start_music: async (params: unknown) => {
        const typedParams = params as { intensity: string };
        console.log('🎵 [Client Tool] start_music called with intensity:', typedParams?.intensity);
        return JSON.stringify({ success: true, message: `Music started with ${typedParams?.intensity || 'medium'} intensity` });
      },
      
      pause_music: async (params: unknown) => {
        console.log('🎵 [Client Tool] pause_music called');
        return JSON.stringify({ success: true, message: 'Music paused' });
      },
      
      resume_music: async (params: unknown) => {
        console.log('🎵 [Client Tool] resume_music called');
        return JSON.stringify({ success: true, message: 'Music resumed' });
      },
      
      stop_music: async (params: unknown) => {
        console.log('🎵 [Client Tool] stop_music called');
        return JSON.stringify({ success: true, message: 'Music stopped' });
      },
      
      set_volume: async (params: unknown) => {
        const typedParams = params as { level: number };
        console.log('🎵 [Client Tool] set_volume called with level:', typedParams?.level);
        return JSON.stringify({ success: true, message: `Volume set to ${typedParams?.level || 50}%` });
      },
      
      skip_next: async (params: unknown) => {
        console.log('🎵 [Client Tool] skip_next called');
        return JSON.stringify({ success: true, message: 'Skipped to next song' });
      },
      
      skip_previous: async (params: unknown) => {
        console.log('🎵 [Client Tool] skip_previous called');
        return JSON.stringify({ success: true, message: 'Skipped to previous song' });
      },
      
      get_music_status: async (params: unknown) => {
        console.log('🎵 [Client Tool] get_music_status called');
        return JSON.stringify({ success: true, message: 'Music is playing', data: { isPlaying: true, volume: 75, currentSong: 'Workout Mix' } });
      },
      
      play_playlist: async (params: unknown) => {
        const typedParams = params as { playlistName: string };
        console.log('🎵 [Client Tool] play_playlist called with:', typedParams?.playlistName);
        return JSON.stringify({ success: true, message: `Playing playlist: ${typedParams?.playlistName || 'Default'}` });
      },
      
      play_song: async (params: unknown) => {
        const typedParams = params as { songName: string };
        console.log('🎵 [Client Tool] play_song called with:', typedParams?.songName);
        return JSON.stringify({ success: true, message: `Playing song: ${typedParams?.songName || 'Unknown'}` });
      }
    },
    
    onConnect: ({ conversationId }: { conversationId: string }) => {
      console.log('Connected to ElevenLabs conversation', conversationId);
      setConversationStatus('connected');
    },
    onDisconnect: (details: string) => {
      console.log('Disconnected from ElevenLabs conversation', details);
      setConversationStatus('disconnected');
      
      // Unregister voice message callbacks when disconnected
      contextBridgeService.unregisterCallbacks();
    },
    onMessage: ({ message, source }: { message: ConversationEvent; source: Role }) => {
      console.log('ElevenLabs message received:', message, 'from:', source);
      
      // Ignore ping events to prevent chat from filling up with duplicates
      if (message.type === 'ping') {
        return;
      }
      
      // Add the new event to our events array
      setConversationEvents(prev => [...prev, message]);
    },
    onError: (error) => {
      console.error('ElevenLabs conversation error:', error);
    },
    onModeChange: ({ mode }: { mode: Mode }) => {
      console.log('ElevenLabs conversation mode changed:', mode);
      setConversationMode(mode);
      
      // Update the context bridge service with the current mode
      contextBridgeService.setConversationMode(mode);
    },
    onStatusChange: ({ status }: { status: ConversationStatus }) => {
      console.log('ElevenLabs conversation status changed:', status);


      //bug never in state connected! upon change to state connecting wait 3 seonds then dispach 
      if (status === 'connecting') {
        setTimeout(() => {
          dispatch(setVoiceAgentStatus(true));
        }, 3000);
      }




      setConversationStatus(status);
    },
    onCanSendFeedbackChange: ({ canSendFeedback: canSend }: { canSendFeedback: boolean }) => {
      console.log('ElevenLabs can send feedback changed:', canSend);
      setCanSendFeedback(canSend);
    },
    onUnhandledClientToolCall: (params) => {
      console.log('ElevenLabs unhandled client tool call:', params);
    },
  });

  // Function to fetch conversation token
  const fetchConversationToken = async () => {
    try {
      const response = await fetch('/api/elevenlabs-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agentId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Token API error:', errorData);
        throw new Error(errorData.error || 'Failed to get conversation token');
      }
      
      const { token } = await response.json();
      setConversationToken(token);
      return token;
    } catch (error) {
      console.error('Error fetching conversation token:', error);
      return null;
    }
  };

  // Function to start conversation
  const startConversation = async () => {
    if (conversation.status === 'connecting' || conversation.status === 'connected') return;
    
    try {
      // Request microphone permission first
      const permissionGranted = await requestMicrophonePermission();
      if (!permissionGranted) {
        console.error('Microphone permission denied');
        return;
      }

      let token = conversationToken;
      
      if (!token) {
        token = await fetchConversationToken();
        if (!token) {
          console.error('Could not get conversation token');
          return;
        }
      }

      await conversation.startSession({
        agentId: agentId,
        conversationToken: token,
        dynamicVariables: {
          user_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User",
          user_activity: "starting_workout_session",
          app_context: "fitness_workout_assistant",
        }
      });
    } catch (error) {
      console.error('Failed to start ElevenLabs conversation:', error);
    }
  };

  // Function to end conversation
  const endConversation = async () => {
    try {
      await conversation.endSession();
    } catch (error) {
      console.error('Failed to end ElevenLabs conversation:', error);
    }
  };



  // Function to send feedback
  const sendFeedback = async (liked: boolean) => {
    try {
      await conversation.sendFeedback(liked);
    } catch (error) {
      console.error('Failed to send feedback:', error);
    }
  };

  // Function to signal user activity
  const signalUserActivity = async () => {
    try {
      await conversation.sendUserActivity();
    } catch (error) {
      console.error('Failed to signal user activity:', error);
    }
  };

  // Register conversation object directly when connected
  useEffect(() => {
    if (conversation) {
      console.log('🎙️ Registering voice callbacks - conversation fully connected');
      contextBridgeService.registerCallbacks({
        sendMessage: conversation.sendUserMessage,
        sendContext: conversation.sendContextualUpdate,
      });
    }
  }, [conversationStatus, conversation]);

  // Cleanup callbacks on component unmount (backup)
  useEffect(() => {
    return () => {
      contextBridgeService.unregisterCallbacks();
    };
  }, []);

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

  const handleFinishWorkout = async () => {
    try {
      // Dispatch finish workout early action
      const finishResult = await dispatch(finishWorkoutEarly());
      const finishData = unwrapResult(finishResult);
      console.log('Finish workout early result:', finishData);
      setShowFinishAlert(false);
      
      // Show completion message
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (error) {
      console.error('Finish workout failed:', error);
      setShowFinishAlert(false);
    }
  };

  const handleContinueWorkout = () => {
    setShowFinishAlert(false);
  };

  // Handle buddy AI button press
  const handleBuddyAIPress = async () => {
    if (conversation.status === 'connected') {
      await endConversation();
    } else if (conversation.status === 'disconnected') {
      await startConversation();
    }
    // If connecting, do nothing to prevent multiple calls
  };

  return (
    <ReanimatedAnimated.View 
      entering={FadeIn.duration(300).delay(100)}
      style={[styles.fullScreen, { backgroundColor: nucleus.light.semantic.bg.subtle }]}
    >
      <SystemBars style="dark" />
      <SafeAreaView style={[styles.container, { backgroundColor: nucleus.light.semantic.bg.subtle }]} edges={['bottom']}>
        <ReanimatedAnimated.View 
          entering={FadeIn.duration(500).delay(200)}
          style={styles.mainContent}
        >
          <View style={styles.topContainer}>
            {/* Exercise Video - Full width */}
            <VideoContainer 
              currentExercise={currentExercise}
              status={status}
              activeWorkout={activeWorkout}
              onShowFinishAlert={() => setShowFinishAlert(true)}
            />
          </View>
          
          <View style={styles.workoutStatusContainer}>
            <WorkoutProgress segments={progressSegments} />
          </View>
        </ReanimatedAnimated.View>
      </SafeAreaView>
      
      {/* Bottom Modal */}
      <BottomModal 
        visible={true} 
        onShowFinishAlert={() => setShowFinishAlert(true)}
        conversationEvents={conversationEvents}
        conversationMode={conversationMode}
        conversationStatus={conversationStatus}
        canSendFeedback={canSendFeedback}
        conversation={conversation}
        onEventReceived={(event, source) => {
          console.log('Event processed by ChatComponent:', event.type, 'from:', source);
        }}
        onAddConversationEvent={(event) => {
          setConversationEvents(prev => [...prev, event]);
        }}
      />

      <AnimatedAIButton
        style={[styles.buddyAiButton, { bottom: insets.bottom }]}
        isActive={conversation.status === 'connected'}
        onPress={handleBuddyAIPress}
        disabled={conversation.status === 'connecting'}
        conversationStatus={conversation.status}
      />

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
    alignItems: 'stretch',
    alignSelf: 'stretch',
  },
  videoContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  videoTouchArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  centeredControls: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  bottomLayout: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
  },
  exerciseNameContainer: {
    flex: 1,
    alignItems: 'flex-start',
    zIndex: 15,
  },
  exerciseName: {
    color: nucleus.light.global.white,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    lineHeight: 22,
    includeFontPadding: false,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  statusContainer: {
    flex: 1,
    alignItems: 'flex-end',
    zIndex: 15,
  },
  statusInfo: {
    color: nucleus.light.global.blue["30"],
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 0.5,
    includeFontPadding: false,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  hiddenTouchArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 15,
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