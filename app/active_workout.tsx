import { supabase } from '@/lib/supabase';
import { enhancedApi } from '@/store/api/enhancedApi';
import { unwrapResult } from '@reduxjs/toolkit';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, BackHandler, Dimensions, Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
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
import MusicModal from '../components/MusicModal';
import { useBuddyTheme } from '../constants/BuddyTheme';
import { contextBridgeService } from '../services/contextBridgeService';
import type { RootState } from '../store';
import { store } from '../store';
import {
  getMusicStatus,
  getPlaylists,
  getTracks,
  pauseMusic,
  playTrack,
  resumeMusic,
  selectPlaylist,
  setVolume,
  skipNext,
  skipPrevious,
  syncPlaylistToSpotify
} from '../store/actions/musicActions';
import {
  adjustReps,
  adjustRestTime,
  adjustWeight,
  completeExercise,
  completeSet,
  completeWorkout,
  confirmReadyAndStartSet,
  finishWorkoutEarly,
  getExerciseInstructions,
  getWorkoutStatus,
  jumpToExercise,
  jumpToSet,
  pauseSet,
  resumeSet,
  resumeWorkoutFromSession,
  showAd,
  startExercisePreparation,
  startRest
} from '../store/actions/workoutActions';
import { useAppDispatch } from '../store/hooks';
import { hideMiniPlayer, selectMiniPlayerVisible, showMiniPlayer } from '../store/slices/musicSlice';
import {
  extendRest,
  selectActiveWorkout,
  selectCurrentExercise,
  selectCurrentSet,
  selectSessionId,
  selectTimers,
  selectVoiceAgentStatus,
  selectWorkoutSession,
  selectWorkoutStatus,
  setVoiceAgentStatus,
  trackConversation
} from '../store/slices/workoutSlice';

import type { ConversationEvent, ConversationStatus, Mode, Role } from '@elevenlabs/react-native';
import { useConversation } from '@elevenlabs/react-native';
import { AnimatedAIButton } from '../components/AnimatedAIButton';
import ExerciseAdjustModal from '../components/ExerciseAdjustModal';
import MusicPlayerMini from '../components/MusicPlayerMini';
import PartynetAudioPlayer from '../components/PartynetAudioPlayer';
import SwitchExerciseModal from '../components/SwitchExerciseModal';
import { useAuth } from '../contexts/AuthContext';
import { useMicrophonePermission } from '../hooks/useMicrophonePermission';
import { loadUserProfileFromDatabase } from '../services/userProfileService';


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

// Warmup Placeholder Component
const WarmupPlaceholder: React.FC = () => {
  return (
    <View style={warmupPlaceholderStyles.container}>
      <Image
        source={require('../assets/placeholder/placeholder.png')}
        style={warmupPlaceholderStyles.image}
        contentFit="cover"
      />
    </View>
  );
};

const warmupPlaceholderStyles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: nucleus.light.global.grey["20"],
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
    transform: [{ rotate: '90deg' }, { scale: 1.78 }], // Rotate 90deg and scale to fit 16:9 (9:16 rotated becomes 16:9, scale by 16/9)
  },
});

// Exercise Video Component
interface ExerciseVideoProps {
  videoUrl?: string;
  exerciseName: string;
  isPaused?: boolean;
  status?: string;
}

// Workout Summary Component with animated exercise list
interface WorkoutSummaryProps {
  activeWorkout: any;
  session: any;
}

const WorkoutSummary: React.FC<WorkoutSummaryProps> = ({ activeWorkout, session }) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(-20)).current;
  
  // Get completed exercises summary
  const exercisesSummary = useMemo(() => {
    if (!session?.exercises || !activeWorkout?.setsCompleted) return [];
    
    // Count sets per exercise
    const exerciseSetCounts: { [key: string]: { name: string; count: number } } = {};
    
    activeWorkout.setsCompleted.forEach((set: any) => {
      const exercise = session.exercises.find((ex: any) => ex.id === set.exerciseId);
      if (exercise) {
        if (!exerciseSetCounts[set.exerciseId]) {
          exerciseSetCounts[set.exerciseId] = { name: exercise.name, count: 0 };
        }
        exerciseSetCounts[set.exerciseId].count++;
      }
    });
    
    return Object.values(exerciseSetCounts);
  }, [session, activeWorkout]);
  
  // Start initial animation and cycling
  useEffect(() => {
    if (exercisesSummary.length === 0) return;
    
    // Initial animation (same as chat.tsx pattern)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleTranslateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }, 400); // Start after 400ms like chat animation
    
    // Cycle through exercises if more than one
    if (exercisesSummary.length > 1) {
      const cycleInterval = setInterval(() => {
        // Fade out and move up
        Animated.parallel([
          Animated.timing(subtitleOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(subtitleTranslateY, {
            toValue: -20,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Change text
          setCurrentExerciseIndex((prev) => (prev + 1) % exercisesSummary.length);
          
          // Fade in and slide down from top
          Animated.parallel([
            Animated.timing(subtitleOpacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(subtitleTranslateY, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
        });
      }, 2000); // Change every 2 seconds
      
      return () => clearInterval(cycleInterval);
    }
  }, [exercisesSummary.length, subtitleOpacity, subtitleTranslateY]);
  
  if (exercisesSummary.length === 0) return null;
  
  const currentExercise = exercisesSummary[currentExerciseIndex];
  
  return (
    <Animated.Text 
      style={[
        styles.workoutCompletedSubtitle,
        {
          opacity: subtitleOpacity,
          transform: [{ translateY: subtitleTranslateY }],
        }
      ]}
    >
      {currentExercise.name} {currentExercise.count} sets
    </Animated.Text>
  );
};

const ExerciseVideo: React.FC<ExerciseVideoProps> = ({ videoUrl, exerciseName, isPaused = false, status }) => {
  // Get session data from Redux for WorkoutSummary component
  const session = useSelector(selectWorkoutSession);
  // Map video URLs to required assets or return remote URLs
  const getVideoAsset = (url?: string) => {
    if (!url) return null;
    
    // Handle remote Supabase URLs
    if (url.startsWith('https://') || url.startsWith('http://')) {
      return { uri: url };
    }
    
    try {
      // Handle local asset paths
      if (url.includes('squats.mp4')) {
        return require('../assets/videos/squats.mp4');
      } else if (url.includes('bench_dumbles.mp4')) {
        return require('../assets/videos/bench_dumbles.mp4');
      } else if (url.includes('literal_shoulder.mp4')) {
        return require('../assets/videos/literal_shoulder.mp4');
      } else if (url.includes('seatued_pulling.mp4')) {
        return require('../assets/videos/seatued_pulling.mp4');
      } else if (url.includes('wefwefwef_compatible.mp4')) {
        return require('../assets/videos/wefwefwef_compatible.mp4');
      } else if (url.includes('alternating-dumbbell-shoulder-flexion')) {
        // Test video from Supabase
        return { uri: 'https://kmtddcpdqkeqipyetwjs.supabase.co/storage/v1/object/public/workouts/processed/alternating-dumbbell-shoulder-flexion/alternating-dumbbell-shoulder-flexion_cropped_video.mp4' };
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
      // Preload video but don't play when status is 'selected'
      // Video will be ready when transitioning from warmup
      if (status !== 'selected') {
        player.play();
      }
    }
  });

  // Handle pause/resume based on workout state
  // Preload video when status is 'selected' but keep it paused
  useEffect(() => {
    if (player && videoAsset) {
      if (status === 'selected') {
        // Preload video in background but keep it paused
        player.pause();
      } else if (!isPaused) {
        // Play video when not in selected state and not paused
        player.play();
      } else {
        player.pause();
      }
    }
  }, [isPaused, player, videoAsset, status]);

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
  onShowAdjustModal: () => void;
  onShowSwitchModal?: () => void;
  onHideControls?: () => void;
  dispatch: any;
  onEndConversation?: () => Promise<void>;
}

const VideoContainer: React.FC<VideoContainerProps> = ({ 
  currentExercise, 
  status, 
  activeWorkout, 
  onShowFinishAlert,
  onShowAdjustModal,
  onShowSwitchModal,
  onHideControls,
  dispatch,
  onEndConversation
}) => {
  // Get session data from Redux for WorkoutSummary component
  const session = useSelector(selectWorkoutSession);
  const miniPlayerVisible = useSelector(selectMiniPlayerVisible);
  const musicProvider = useSelector((state: any) => state.music?.selectedMusicOption);
  const isSpotifyAuth = useSelector((state: any) => state.spotifyAuth?.accessToken && state.spotifyAuth?.user);
  
  // Check if there's actually a music player available (not just visible)
  // MusicPlayerMini returns null for 'app' music, so we only have a player for 'spotify' (with auth) or 'partynet'
  const hasMusicPlayer = (musicProvider === 'spotify' && isSpotifyAuth) || musicProvider === 'partynet';
  const shouldAdjustForPlayer = hasMusicPlayer && miniPlayerVisible;
  
  const insets = useSafeAreaInsets();
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsOpacity = useSharedValue(1);
  
  // Animation for top-right button position based on music player visibility
  const topRightButtonTop = useSharedValue(insets.top + 16);
  
  // Update button position when music player visibility changes
  // Only adjust if there's actually a player available
  // When no player: position below safe area with 16px padding
  // When player visible: position below player (insets.top + 70)
  useEffect(() => {
    const targetTop = insets.top + (shouldAdjustForPlayer ? 70 : 16);
    topRightButtonTop.value = withTiming(targetTop, { duration: 300 });
  }, [shouldAdjustForPlayer, insets.top]);
  
  const animatedTopRightStyle = useAnimatedStyle(() => ({
    top: topRightButtonTop.value,
  }));
  
  // Fade animations for warmup/video transition
  const warmupOpacity = useSharedValue(status === 'selected' ? 1 : 0);
  const videoOpacity = useSharedValue(status === 'selected' ? 0 : 1);

  // Auto-show controls when paused/preparing/selected, hide when exercising
  useEffect(() => {
    if (status === 'paused' || activeWorkout?.isPaused || status === 'preparing' || status === 'selected') {
      setControlsVisible(true);
      controlsOpacity.value = withTiming(1, { duration: 300 });
      dispatch(showMiniPlayer()); // Show mini player when START button appears
    } else if (status === 'exercising') {
      // Hide controls immediately when exercising starts
      setControlsVisible(false);
      controlsOpacity.value = withTiming(0, { duration: 300 });
      dispatch(hideMiniPlayer());
    }
  }, [status, activeWorkout?.isPaused]);

  // Auto-hide controls after 5 seconds when not paused
  // BUT keep controls visible when status is 'selected' (no auto-hide)
  useEffect(() => {
    if (controlsVisible && status !== 'paused' && !activeWorkout?.isPaused && status !== 'preparing' && status !== 'selected') {
      const timeout = setTimeout(() => {
        setControlsVisible(false);
        controlsOpacity.value = withTiming(0, { duration: 300 });
        dispatch(hideMiniPlayer());
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [controlsVisible, status, activeWorkout?.isPaused]);

  const showControls = () => {
    setControlsVisible(true);
    controlsOpacity.value = withTiming(1, { duration: 300 });
    dispatch(showMiniPlayer());
  };

  const hideControls = () => {
    // Don't hide controls when status is 'selected' or 'preparing' or paused
    if (status !== 'paused' && !activeWorkout?.isPaused && status !== 'preparing' && status !== 'selected') {
      setControlsVisible(false);
      controlsOpacity.value = withTiming(0, { duration: 300 });
      dispatch(hideMiniPlayer());
    }
  };

  // Animate warmup/video transition when status changes
  useEffect(() => {
    if (status === 'selected') {
      warmupOpacity.value = withTiming(1, { duration: 300 });
      videoOpacity.value = withTiming(0, { duration: 300 });
    } else if (status !== 'workout-completed') {
      warmupOpacity.value = withTiming(0, { duration: 300 });
      videoOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [status]);

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
  }));

  const animatedWarmupStyle = useAnimatedStyle(() => ({
    opacity: warmupOpacity.value,
  }));

  const animatedVideoStyle = useAnimatedStyle(() => ({
    opacity: videoOpacity.value,
  }));

  return (
    <View style={styles.videoContainer}>
      {status === 'workout-completed' ? (
        /* Workout Completed View */
        <View style={styles.workoutCompletedContainer}>
          {/* Upper spacer to center the grouped content */}
          <View style={styles.workoutCompletedUpperSpacer} />
          
          {/* Grouped title and subtitle at centerline */}
          <View style={styles.workoutCompletedContent}>
            <ReanimatedAnimated.Text 
              entering={FadeIn.duration(800).delay(200)}
              style={styles.workoutCompletedTitle}
            >
              Workout Complete!
            </ReanimatedAnimated.Text>
            
            {/* Animated Workout Summary */}
            <WorkoutSummary 
              activeWorkout={activeWorkout} 
              session={session} 
            />
          </View>
          
          {/* Lower spacer */}
          <View style={styles.workoutCompletedLowerSpacer} />
          
          {/* Finish Button */}
          <ReanimatedAnimated.View
            entering={FadeIn.duration(600).delay(600)}
            style={styles.finishButtonContainer}
          >
            <TouchableOpacity 
              style={styles.finishButtonInner}
              onPress={async () => {
                // Disconnect voice agent before navigation (with small delay to allow final messages)
                if (onEndConversation) {
                  setTimeout(() => {
                    onEndConversation().catch((err: any) => console.error('Error disconnecting on done:', err));
                  }, 300);
                }
                // Capture sessionId before completeWorkout clears Redux state
                const currentSessionId = selectSessionId(store.getState());
                dispatch(completeWorkout());
                router.replace({
                  pathname: '/workout-completed',
                  params: { sessionId: currentSessionId || '' }
                });
              }}
            >
              <Text style={styles.finishButtonText}>DONE</Text>
            </TouchableOpacity>
          </ReanimatedAnimated.View>
        </View>
      ) : (
        <>
          {/* Warmup Placeholder - fade in/out */}
          <ReanimatedAnimated.View style={[animatedWarmupStyle, StyleSheet.absoluteFill]}>
            <WarmupPlaceholder />
          </ReanimatedAnimated.View>
          
          {/* Exercise Video - preload in background, fade in/out */}
          <ReanimatedAnimated.View style={[animatedVideoStyle, StyleSheet.absoluteFill]}>
            <ExerciseVideo 
              videoUrl={currentExercise?.videoUrl} 
              exerciseName={currentExercise?.name || 'Exercise'} 
              isPaused={activeWorkout?.isPaused}
              status={status}
            />
          </ReanimatedAnimated.View>
          
          {/* Tap area to show controls - only when not in 'selected' state */}
          {status !== 'selected' && (
            <TouchableWithoutFeedback onPress={showControls}>
              <View style={styles.videoTouchArea} />
            </TouchableWithoutFeedback>
          )}
          
          {/* Top Right Overlay - Always visible over video when exercise is active */}
          {currentExercise && status !== 'inactive' && status !== 'workout-completed' && status !== 'selected' && (
            <ReanimatedAnimated.View style={[styles.topRightOverlay, animatedTopRightStyle, { 
              paddingRight: shouldAdjustForPlayer ? 16 : insets.right + 16,
            }]}>
              <View style={styles.topRightButtonsContainer}>
                {/* Adjust Button */}
                <TouchableOpacity 
                  style={styles.topRightButton}
                  onPress={onShowAdjustModal}
                  activeOpacity={0.7}
                >
                  <Image
                    source={require('../assets/icons/topright.svg')}
                    style={styles.topRightIcon}
                    contentFit="contain"
                  />
                </TouchableOpacity>
                {/* Switch Exercise Button */}
                {onShowSwitchModal && (
                  <TouchableOpacity 
                    style={styles.topRightButton}
                    onPress={onShowSwitchModal}
                    activeOpacity={0.7}
                  >
                    <View style={styles.swapIconContainer}>
                      <Image
                        source={require('../assets/icons/back.svg')}
                        style={[styles.swapIconArrow, { transform: [{ rotate: '90deg' }] }]}
                        contentFit="contain"
                      />
                      <Image
                        source={require('../assets/icons/back.svg')}
                        style={[styles.swapIconArrow, { transform: [{ rotate: '-90deg' }] }]}
                        contentFit="contain"
                      />
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </ReanimatedAnimated.View>
          )}
        </>
      )}
      
      {/* Always visible exercise info - hide when workout completed */}
      {status !== 'workout-completed' && (
        <View style={styles.bottomLayout}>
          <View style={styles.exerciseNameContainer}>
            <Text style={styles.exerciseName}>
              {status === 'selected' ? 'Warmup' : (currentExercise?.name || 'Exercise')}
            </Text>
          </View>
          
          <View style={styles.statusContainer}>
            <Text style={styles.statusInfo}>
              {status.toUpperCase().replace('-', ' ')}
              {activeWorkout?.isPaused && ' (PAUSED)'}
            </Text>
          </View>
        </View>
      )}
      
      {/* Simple controls overlay - hide when workout completed */}
      {status !== 'workout-completed' && (
        <ReanimatedAnimated.View 
          style={[styles.controlsOverlay, animatedOverlayStyle]} 
          pointerEvents={controlsVisible ? 'auto' : 'none'}
        >


        <TouchableWithoutFeedback onPress={hideControls}>
          <View style={styles.overlayBackground} />
        </TouchableWithoutFeedback>

        {/* Spotify Player Mini removed from here - now rendered as global overlay */}
        
        <View style={styles.centeredControls}>
          <WorkoutControls 
            onShowFinishAlert={onShowFinishAlert}
            onEndConversation={onEndConversation}
          />
        </View>
      </ReanimatedAnimated.View>
      )}
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
  const dispatch = useAppDispatch();
  
  // Calculate current values from Redux state
  const currentWeight = currentSet?.targetWeight ? `${currentSet.targetWeight} kg` : 'Body';
  const currentReps = currentSet?.targetReps || 0;
  const elapsedTime = activeWorkout?.elapsedTime ? Math.floor(activeWorkout.elapsedTime / 1000) : 0;
  const isRunning = status === 'exercising' && !activeWorkout?.isPaused;
  const theme = useBuddyTheme();

  // Hold-to-increment refs
  const weightHoldIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const repsHoldIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const weightHoldTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repsHoldTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Refs to track current values to avoid stale closures
  const currentWeightRef = useRef(currentWeight);
  const currentRepsRef = useRef(currentReps);
  const currentSetRef = useRef(currentSet);
  
  // Update refs when values change
  useEffect(() => {
    currentWeightRef.current = currentWeight;
    currentRepsRef.current = currentReps;
    currentSetRef.current = currentSet;
  }, [currentWeight, currentReps, currentSet]);

  // Parse weight to check if it's numeric
  const parseWeight = (weight: string): { value: number; unit: string } | null => {
    if (!weight || weight.toLowerCase() === 'body') return null;
    const match = weight.match(/^([\d.]+)\s*(kg|lbs?|lb)?$/i);
    if (match) {
      return { value: parseFloat(match[1]), unit: match[2] || 'kg' };
    }
    return null;
  };

  // Adjust weight value - using refs to get latest values
  const adjustWeightValue = useCallback((delta: number) => {
    const latestWeight = currentWeightRef.current;
    const latestSet = currentSetRef.current;
    const parsed = parseWeight(latestWeight);
    
    if (!latestSet) return;
    
    // Special case: if weight is "Body" and incrementing, set to 1kg
    if (!parsed && delta > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      dispatch(adjustWeight({ 
        newWeight: 1, 
        reason: 'User adjustment' 
      }));
      return;
    }
    
    // Special case: if weight is "Body" and decrementing, do nothing
    if (!parsed && delta < 0) {
      return;
    }
    
    // Special case: if weight is 1kg and decrementing, set to "Body" (0)
    if (parsed && parsed.value === 1 && delta < 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      dispatch(adjustWeight({ 
        newWeight: 0, 
        reason: 'User adjustment' 
      }));
      return;
    }
    
    // Normal case: increment/decrement numeric weight
    if (!parsed) return; // Safety check
    
    const newValue = Math.max(1, parsed.value + delta); // Minimum 1kg (not 0)
    
    // Only dispatch if value actually changed
    if (newValue === parsed.value) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    dispatch(adjustWeight({ 
      newWeight: newValue, 
      reason: 'User adjustment' 
    }));
  }, [dispatch]);

  // Adjust reps value - using refs to get latest values
  const adjustRepsValue = useCallback((delta: number) => {
    const latestReps = currentRepsRef.current;
    const latestSet = currentSetRef.current;
    
    if (!latestSet) return;
    
    const newReps = Math.max(1, latestReps + delta);
    
    // Only dispatch if value actually changed
    if (newReps === latestReps) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    dispatch(adjustReps({ 
      newReps: newReps, 
      reason: 'User adjustment' 
    }));
  }, [dispatch]);

  // Hold-to-increment handlers
  const startHoldIncrement = useCallback((
    adjustFunction: () => void, 
    intervalRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>,
    timeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>
  ) => {
    // Clear any existing interval and timeout
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Call once immediately for instant feedback
    adjustFunction();
    
    // Start auto-incrementing after 500ms, then every 150ms (slower to reduce glitches)
    timeoutRef.current = setTimeout(() => {
      // Haptic feedback when hold starts
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      intervalRef.current = setInterval(() => {
        adjustFunction();
      }, 150); // Increased from 100ms to 150ms to reduce rapid updates
    }, 500); // Increased from 300ms to 500ms delay before auto-increment starts
  }, []);

  const stopHoldIncrement = useCallback((
    intervalRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>,
    timeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>
  ) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (weightHoldIntervalRef.current) {
        clearInterval(weightHoldIntervalRef.current);
      }
      if (repsHoldIntervalRef.current) {
        clearInterval(repsHoldIntervalRef.current);
      }
      if (weightHoldTimeoutRef.current) {
        clearTimeout(weightHoldTimeoutRef.current);
      }
      if (repsHoldTimeoutRef.current) {
        clearTimeout(repsHoldTimeoutRef.current);
      }
    };
  }, []);

  // Memoize total duration calculation to prevent recalculation on every render
  const totalDuration = useMemo(() => 
    segments.reduce((sum, segment) => sum + segment.duration, 0), 
    [segments]
  );

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const totalSeconds = Math.floor(seconds);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Memoize expensive getCurrentSegmentInfo calculation
  const getCurrentSegmentInfo = useMemo(() => {
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
      // For rest, use the actual rest timer duration from Redux state
      if (timers.restTimer) {
        // Use actual timer duration (which may have been extended)
        const actualRestDuration = Math.floor(timers.restTimer.duration / 1000);
        const remainingSec = Math.max(0, Math.floor(timers.restTimer.remaining / 1000));
        const elapsedSec = Math.max(0, actualRestDuration - remainingSec);
        
        // Calculate progress based on elapsed time vs actual timer duration
        progress = Math.min((elapsedSec / actualRestDuration) * 100, 100);
        remainingTime = remainingSec;
      } else if (activeWorkout?.timeRemaining !== undefined) {
        // Fallback to activeWorkout timeRemaining if no timer
        const fallbackDuration = currentSet.restTimeAfter || 60;
        const remainingSec = Math.max(0, activeWorkout.timeRemaining);
        const elapsedSec = Math.max(0, fallbackDuration - remainingSec);
        
        progress = Math.min((elapsedSec / fallbackDuration) * 100, 100);
        remainingTime = Math.floor(remainingSec);
      } else {
        // No timer active, show 0 progress with original duration
        const originalDuration = currentSet.restTimeAfter || 60;
        progress = 0;
        remainingTime = originalDuration;
      }
    } else if (status === 'preparing') {
      // Preparing for set, show 0 progress
      progress = 0;
      remainingTime = segments[segmentIndex]?.duration || 45;
    } else if (status === 'workout-completed') {
      // Workout is complete - show all segments as finished
      segmentIndex = segments.length - 1; // Last segment
      progress = 100;
      remainingTime = 0;
    }
    
    return {
      activeIndex: segmentIndex,
      progress: Math.max(0, Math.min(100, progress)), // Clamp between 0-100
      remainingTime: Math.max(0, remainingTime), // Ensure non-negative
      segmentType: segments[segmentIndex]?.type || 'set'
    };
  }, [activeWorkout, currentSet, segments, status, timers, elapsedTime]);

  const currentInfo = getCurrentSegmentInfo;

  const getSegmentColor = useCallback((segment: ProgressSegment, index: number) => {
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
  }, [currentInfo]);

  const getSegmentWidth = useCallback((segment: ProgressSegment) => {
    return (segment.duration / totalDuration) * 100;
  }, [totalDuration]);

  const getSegmentProgress = useCallback((index: number) => {
    if (index < currentInfo.activeIndex) return 100; // Completed
    if (index === currentInfo.activeIndex) return currentInfo.progress; // Active
    return 0; // Future
  }, [currentInfo]);

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
        {/* Weight - Centered in Left Section with Adjusters */}
        <View style={styles.infoItemLeft}>
          {/* Always show up arrow */}
          <TouchableOpacity 
            style={styles.adjusterButton}
            onPressIn={() => startHoldIncrement(() => adjustWeightValue(1), weightHoldIntervalRef, weightHoldTimeoutRef)}
            onPressOut={() => stopHoldIncrement(weightHoldIntervalRef, weightHoldTimeoutRef)}
            activeOpacity={0.5}
          >
            <Image
              source={require('../assets/icons/back.svg')}
              style={[styles.adjusterIcon, { transform: [{ rotate: '90deg' }] }]}
              contentFit="contain"
            />
          </TouchableOpacity>
          <Text style={[styles.infoValue, { color: nucleus.light.global.blue["60"] }]}>
            {parseWeight(currentWeight) ? `${parseWeight(currentWeight)?.value}kg` : currentWeight}
          </Text>
          <Text style={[styles.infoLabel, { color: nucleus.light.global.grey["90"] }]}>
            WEIGHT
          </Text>
          {/* Always show down arrow */}
          <TouchableOpacity 
            style={styles.adjusterButton}
            onPressIn={() => startHoldIncrement(() => adjustWeightValue(-1), weightHoldIntervalRef, weightHoldTimeoutRef)}
            onPressOut={() => stopHoldIncrement(weightHoldIntervalRef, weightHoldTimeoutRef)}
            activeOpacity={0.5}
          >
            <Image
              source={require('../assets/icons/back.svg')}
              style={[styles.adjusterIcon, { transform: [{ rotate: '-90deg' }] }]}
              contentFit="contain"
            />
          </TouchableOpacity>
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

        {/* Reps - Centered in Right Section with Adjusters */}
        <View style={styles.infoItemRight}>
          <TouchableOpacity 
            style={styles.adjusterButton}
            onPressIn={() => startHoldIncrement(() => adjustRepsValue(1), repsHoldIntervalRef, repsHoldTimeoutRef)}
            onPressOut={() => stopHoldIncrement(repsHoldIntervalRef, repsHoldTimeoutRef)}
            activeOpacity={0.5}
          >
            <Image
              source={require('../assets/icons/back.svg')}
              style={[styles.adjusterIcon, { transform: [{ rotate: '90deg' }] }]}
              contentFit="contain"
            />
          </TouchableOpacity>
          <Text style={[styles.infoValue, { color: nucleus.light.global.blue["60"] }]}>
            {currentReps}
          </Text>
          <Text style={[styles.infoLabel, { color: nucleus.light.global.grey["90"] }]}>
            REPS
          </Text>
          <TouchableOpacity 
            style={styles.adjusterButton}
            onPressIn={() => startHoldIncrement(() => adjustRepsValue(-1), repsHoldIntervalRef, repsHoldTimeoutRef)}
            onPressOut={() => stopHoldIncrement(repsHoldIntervalRef, repsHoldTimeoutRef)}
            activeOpacity={0.5}
          >
            <Image
              source={require('../assets/icons/back.svg')}
              style={[styles.adjusterIcon, { transform: [{ rotate: '-90deg' }] }]}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Workout Controls Component
interface WorkoutControlsProps {
  onShowFinishAlert: () => void;
  onEndConversation?: () => Promise<void>;
}

const WorkoutControls: React.FC<WorkoutControlsProps> = ({ onShowFinishAlert, onEndConversation }) => {
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
        return 'START SET';
      case 'exercising':
        return activeWorkout?.isPaused ? 'RESUME' : 'PAUSE';
      case 'resting':
        return activeWorkout?.isPaused ? 'RESUME' : 'PAUSE';
      case 'set-complete':
        return 'REST';
      case 'selected':
        return "I'm ready!";
      case 'workout-completed':
        return 'FINISH';
      case 'inactive':
      default:
        return 'START SET';
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
          // START - Check if workout is in Redux but status hasn't updated yet
          // If we have workoutEntries, try to select workout
          const currentState = store.getState() as any;
          if (currentState.workout.workoutEntries && currentState.workout.workoutEntries.length > 0 && currentState.workout.planId) {
            console.log('Workout entries found, but status is inactive. Workout should already be selected.');
            // Status might be transitioning - just wait and show message
            console.log('Please wait for workout to be selected, or try again.');
          } else {
            console.log('No workout selected. Please start workout from workout screen.');
          }
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
        case 'workout-completed':
          // FINISH - Complete workout properly and navigate to summary screen
          console.log('Workout completed! Finalizing workout and navigating to summary.');
          // Disconnect voice agent before navigation (with small delay to allow final messages)
          if (onEndConversation) {
            setTimeout(() => {
              onEndConversation().catch((err: any) => console.error('Error disconnecting on center button:', err));
            }, 300);
          }
          // Capture sessionId before completeWorkout clears Redux state
          const currentSessionId = selectSessionId(store.getState());
          const finishResult = await dispatch(completeWorkout());
          const finishData = unwrapResult(finishResult);
          console.log('Complete workout result:', finishData);
          router.replace({
            pathname: '/workout-completed',
            params: { sessionId: currentSessionId || '' }
          });
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
          // Workout should already be selected from workout.tsx
          console.log('Workout should already be selected. Current status:', status);
          
          // Sync playlist to Spotify after workout selection
          const state = store.getState();
          const musicState = state.music;
          const spotifyAuth = state.spotifyAuth;
          
          if (spotifyAuth.accessToken && spotifyAuth.user && musicState.selectedPlaylist) {
            console.log('🎵 [Right Button] Syncing selected playlist to Spotify...');
            try {
              const syncResult = await dispatch(syncPlaylistToSpotify());
              const syncData = unwrapResult(syncResult);
              if (syncData?.synced) {
                console.log(`🎵 [Right Button] Playlist "${syncData.playlist}" synced to Spotify`);
              }
            } catch (error) {
              console.log('🎵 [Right Button] Failed to sync playlist:', error);
            }
          }
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
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        {/* Left Button - Hide when status is 'selected' */}
        {status !== 'selected' && (
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
        )}

        {/* Center Button */}
        <Button
          mode="outlined"
          style={[
            workoutControlsStyles.compactCenterButton,
            status === 'selected' && workoutControlsStyles.compactCenterButtonLarge
          ]}
          labelStyle={[
            workoutControlsStyles.compactCenterButtonLabel,
            status === 'selected' && workoutControlsStyles.compactCenterButtonLabelLarge
          ]}
          contentStyle={[
            workoutControlsStyles.compactCenterButtonContent,
            status === 'selected' && workoutControlsStyles.compactCenterButtonContentLarge
          ]}
          compact={false}
          onPress={handleCenterButton}
        >
          {getCenterButtonText()}
        </Button>

        {/* Right Button - Hide when status is 'selected' */}
        {status !== 'selected' && (
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
        )}
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
  compactCenterButtonLarge: {
    borderRadius: 40,
    minHeight: 72,
    minWidth: 200,
  },
  compactCenterButtonLabel: {
    color: nucleus.light.global.white,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    lineHeight: 18,
    marginVertical: 0,
    includeFontPadding: false,
  },
  compactCenterButtonLabelLarge: {
    fontSize: 18,
    lineHeight: 22,
  },
  compactCenterButtonContent: {
    minHeight: 56,
    paddingHorizontal: 0,
    paddingVertical: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactCenterButtonContentLarge: {
    minHeight: 72,
    paddingHorizontal: 32,
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

// Move dimensions outside component to prevent recalculation on every render
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
  // Memoize height calculations to prevent recalculation on every render
  const modalDimensions = useMemo(() => {
    const COLLAPSED_HEIGHT = SCREEN_HEIGHT * 0.45; // 40% of screen height
    const EXPANDED_HEIGHT = SCREEN_HEIGHT * 1 ; // Height of modal when expanded
    
    // Calculate positions from bottom of screen
    const COLLAPSED_POSITION = SCREEN_HEIGHT - COLLAPSED_HEIGHT; // Near bottom
    const EXPANDED_POSITION = SCREEN_HEIGHT - EXPANDED_HEIGHT;   // Much higher up
    
    return {
      COLLAPSED_HEIGHT,
      EXPANDED_HEIGHT,
      COLLAPSED_POSITION,
      EXPANDED_POSITION
    };
  }, []);
  
  const { COLLAPSED_HEIGHT, EXPANDED_HEIGHT, COLLAPSED_POSITION, EXPANDED_POSITION } = modalDimensions;
  
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
  
  // Memoize modal header height calculation
  const MODAL_HEADER_HEIGHT = useMemo(() => 
    8 + 5 + 8 + 16 + 21.6 + 16 + 1, // handle margin + handle height + gap + padding + title + padding + border
    []
  );

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
      
      // During active dragging, update less frequently (every 50px) to reduce lag
      if (Math.abs(currentVisibleHeight - lastUpdatedHeight.value) > 50) {
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
  
  // Memoize content height calculations to prevent excessive recalculation
  const chatContentHeight = useMemo(() => {
    const baseContentHeight = Math.max(50, Math.min(visibleModalHeight - MODAL_HEADER_HEIGHT, SCREEN_HEIGHT - 100));
    
    // Adjust content height when keyboard is visible to move input above keyboard
    // Reduce padding to 8px to bring input closer to keyboard
    return isKeyboardVisible 
      ? Math.max(100, baseContentHeight - keyboardHeight - 8) 
      : baseContentHeight;
  }, [visibleModalHeight, MODAL_HEADER_HEIGHT, isKeyboardVisible, keyboardHeight]);
    
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
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(false);
  
  // Auth context
  const { user } = useAuth();
  
  // Microphone permissions
  const { requestMicrophonePermission } = useMicrophonePermission();
  
  // Redux state
  const activeWorkout = useSelector(selectActiveWorkout);
  const currentExercise = useSelector(selectCurrentExercise);
  const status = useSelector(selectWorkoutStatus);
  const session = useSelector(selectWorkoutSession);
  const sessionId = useSelector(selectSessionId);
  const timers = useSelector(selectTimers);
  const voiceAgent = useSelector(selectVoiceAgentStatus);
  const workoutEntries = useSelector((state: any) => state.workout.workoutEntries);
  const dispatch = useAppDispatch();
  
  // Get current workout entry ID - use the entry at current index (this is the source of truth)
  // After jumping exercises, workoutEntries is reordered, so currentExerciseIndex points to the correct entry
  const currentWorkoutEntryId = useMemo(() => {
    if (!workoutEntries || !activeWorkout) return null;
    const currentIndex = activeWorkout.currentExerciseIndex;
    const entry = workoutEntries[currentIndex];
    
    if (!entry) {
      console.warn('⚠️ No workout entry found at current index:', {
        currentIndex,
        workoutEntriesLength: workoutEntries.length,
        currentExerciseName: currentExercise?.name,
      });
      return null;
    }
    
    // Log for debugging adjust modal issues
    // NOTE: entry.exercises may be stale from nested cache - currentExercise uses fresh data
    console.log('🔧 [ActiveWorkout] Current workout entry ID:', {
      entryId: entry.id,
      entryExerciseId: entry.exercise_id, // Always fresh - this is the source of truth
      entryExerciseSlug: entry.exercises?.slug, // May be stale from nested cache
      entryExerciseName: entry.exercises?.name, // May be stale from nested cache
      currentExerciseId: currentExercise?.id,
      currentExerciseSlug: (currentExercise as any)?.slug, // Type assertion - slug exists at runtime
      currentExerciseName: currentExercise?.name,
      currentIndex,
    });
    
    // Verify the entry matches the current exercise (by exercise_id - most reliable)
    if (currentExercise?.id && entry.exercise_id !== currentExercise.id) {
      console.warn('⚠️ Workout entry exercise mismatch:', {
        index: currentIndex,
        entryId: entry.id,
        entryExerciseId: entry.exercise_id,
        currentExerciseId: currentExercise.id,
      });
    }
    
    // Only warn if entry exists but exercises object is missing (data integrity issue)
    if (entry && !entry.exercises && currentExercise) {
      console.warn('⚠️ Workout entry missing exercises data:', {
        index: currentIndex,
        entryId: entry.id,
        entryExerciseId: entry.exercise_id,
        currentExerciseId: currentExercise?.id,
      });
    }
    
    return entry.id;
  }, [workoutEntries, activeWorkout, currentExercise]);

  // Track if ad has been shown to prevent multiple triggers
  const adShownRef = useRef(false);
  
  // Track if welcome message has been shown
  const welcomeMessageShownRef = useRef(false);
  
  // Track if we're currently disconnecting to prevent multiple simultaneous calls
  const isDisconnectingRef = useRef(false);
  
  // Track when we connected to prevent immediate disconnection on remount
  const connectionTimeRef = useRef<number | null>(null);

  // Resume active workout session on mount (if exists)
  useEffect(() => {
    const resumeActiveSession = async () => {
      // Only check if status is inactive (no active workout)
      if (status !== 'inactive') {
        return;
      }

      setIsRestoringSession(true);

      try {
        // Get user ID from auth session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) {
          return; // User not authenticated
        }
        const userId = session.user.id;

        // Check for active workout session in database
        // Note: This will work once codegen is run and GetActiveWorkoutSession query is available
        try {
          const result = await dispatch(
            enhancedApi.endpoints.GetActiveWorkoutSession.initiate({ userId })
          ).unwrap();

          const activeSession = result?.workout_sessionsCollection?.edges?.[0]?.node;
          if (!activeSession) {
            setIsRestoringSession(false);
            return; // No active session found
          }

          console.log('🔄 Found active workout session, resuming...', activeSession);

          // Load workout entries for this session
          const workoutData = await dispatch(
            enhancedApi.endpoints.GetWorkoutDay.initiate({
              planId: activeSession.workout_plan_id,
              weekNumber: activeSession.week_number,
              day: activeSession.day,
            })
          ).unwrap();

          const entries = workoutData?.workout_plansCollection?.edges?.[0]?.node?.workout_entriesCollection?.edges || [];
          if (entries.length === 0) {
            console.warn('⚠️ No workout entries found for active session');
            setIsRestoringSession(false);
            return;
          }

          // Extract workout entries
          const workoutEntries = entries.map((edge: any) => edge.node);

          // Fetch fresh exercise data separately to avoid stale nested cache (same pattern as selectWorkoutFromEntries)
          const uniqueExerciseIds = [...new Set(workoutEntries.map((entry: any) => entry.exercise_id))];
          const exerciseDataMap = new Map<string, any>();
          
          // Fetch all exercises in parallel - NO FALLBACKS to nested cache
          const exercisePromises = uniqueExerciseIds.map(async (exerciseId: string) => {
            const result = await dispatch(
              enhancedApi.endpoints.GetExerciseById.initiate({ id: exerciseId })
            ).unwrap();
            const exercise = result?.exercisesCollection?.edges?.[0]?.node;
            if (!exercise) {
              throw new Error(`Failed to fetch exercise ${exerciseId} for resume`);
            }
            exerciseDataMap.set(exerciseId, exercise);
          });
          
          await Promise.all(exercisePromises);
          
          // Enrich workout entries with fresh exercise data - NO FALLBACKS
          const enrichedEntries = workoutEntries.map((entry: any) => {
            const freshExercise = exerciseDataMap.get(entry.exercise_id);
            if (!freshExercise) {
              throw new Error(`Missing fresh exercise data for ${entry.exercise_id}`);
            }
            return {
              ...entry,
              exercises: freshExercise
            };
          });
          
          // Replace workoutEntries with enriched version
          workoutEntries.length = 0;
          workoutEntries.push(...enrichedEntries);

          // Fetch completed sets for this session
          let completedSetsData: Array<{
            workoutEntryId: string;
            exerciseId: string;
            setNumber: number;
            targetReps?: number | null;
            targetWeight?: number | null;
            targetTime?: number | null;
            actualReps?: number | null;
            actualWeight?: number | null;
            actualTime?: number | null;
            difficulty?: string | null;
            restStartedAt?: string | null;
            restCompletedAt?: string | null;
          }> = [];

          try {
            const setsResult = await dispatch(
              enhancedApi.endpoints.GetWorkoutSessionSets.initiate({ sessionId: activeSession.id })
            ).unwrap();

            completedSetsData = setsResult?.workout_session_setsCollection?.edges?.map((edge: any) => ({
              workoutEntryId: edge.node.workout_entry_id,
              exerciseId: edge.node.exercise_id,
              setNumber: edge.node.set_number,
              targetReps: edge.node.target_reps,
              targetWeight: edge.node.target_weight,
              targetTime: edge.node.target_time,
              actualReps: edge.node.actual_reps,
              actualWeight: edge.node.actual_weight,
              actualTime: edge.node.actual_time,
              difficulty: edge.node.difficulty,
              restStartedAt: edge.node.rest_started_at || null,
              restCompletedAt: edge.node.rest_completed_at || null,
            })) || [];

            console.log(`📊 Loaded ${completedSetsData.length} completed sets`);
          } catch (error: any) {
            console.warn('⚠️ Failed to load completed sets:', error);
            // Continue with empty sets - workout can still resume
          }

          // Fetch adjustments for this session
          let adjustmentsData: Array<{
            type: string;
            workoutEntryId?: string | null;
            exerciseId?: string | null;
            fromValue: string;
            toValue: string;
            reason: string;
            timestamp: string;
          }> = [];

          try {
            const adjustmentsResult = await dispatch(
              enhancedApi.endpoints.GetWorkoutSessionAdjustments.initiate({ sessionId: activeSession.id })
            ).unwrap();

            adjustmentsData = adjustmentsResult?.workout_session_adjustmentsCollection?.edges?.map((edge: any) => ({
              type: edge.node.type,
              workoutEntryId: edge.node.workout_entry_id,
              exerciseId: edge.node.exercise_id,
              fromValue: edge.node.from_value,
              toValue: edge.node.to_value,
              reason: edge.node.reason,
              timestamp: edge.node.created_at,
            })) || [];

            console.log(`🔧 Loaded ${adjustmentsData.length} adjustments`);
          } catch (error: any) {
            console.warn('⚠️ Failed to load adjustments:', error);
            // Continue with empty adjustments - workout can still resume
          }

          // Resume workout with full state restoration
          // Note: resumeWorkoutFromSession is a synchronous reducer action, not an async thunk
          dispatch(
            resumeWorkoutFromSession({
              sessionId: activeSession.id,
              workoutEntries,
              planId: activeSession.workout_plan_id,
              dayName: activeSession.day_name,
              currentExerciseIndex: activeSession.current_exercise_index || 0,
              currentSetIndex: activeSession.current_set_index || 0,
              completedExercises: activeSession.completed_exercises || 0,
              completedSets: activeSession.completed_sets || 0,
              totalExercises: activeSession.total_exercises,
              totalSets: activeSession.total_sets,
              status: activeSession.status || 'selected',
              startedAt: activeSession.started_at,
              totalTimeMs: activeSession.total_time_ms ? Number(activeSession.total_time_ms) : 0,
              totalPauseTimeMs: activeSession.total_pause_time_ms ? Number(activeSession.total_pause_time_ms) : 0,
              completedSetsData,
              adjustmentsData,
            })
          );

          // Immediately check state and pause if needed to stop any timers
          const currentState = store.getState() as any;
          if (currentState.workout.status === 'exercising' && currentState.workout.activeWorkout?.isPaused) {
            // Resume paused at start of set segment - ensure timers are stopped immediately
            console.log('⏸️ [Resume] Ensuring timers are stopped for paused workout');
            dispatch(pauseSet({ reason: 'Resumed workout - paused at start of set segment' }));
          } else if (currentState.workout.status === 'resting' && currentState.workout.activeWorkout?.isPaused) {
            // Resume paused at start of rest segment - ensure timers are stopped immediately
            console.log('⏸️ [Resume] Ensuring timers are stopped for paused rest');
            dispatch(pauseSet({ reason: 'Resumed workout - paused at start of rest segment' }));
          }

          // Session restoration complete - hide loading indicator
          setIsRestoringSession(false);

          // Check if we resumed to set-complete state and auto-start rest (like normal flow)
          // Then pause at start of rest segment for natural resume experience
          setTimeout(() => {
            const updatedState = store.getState() as any;
            if (updatedState.workout.status === 'set-complete') {
              console.log('⏰ [Resume] Auto-starting rest after resuming to set-complete state');
              dispatch(startRest());
              
              // After rest starts, pause at the start of rest segment
              setTimeout(() => {
                const finalState = store.getState() as any;
                if (finalState.workout.status === 'resting' && finalState.workout.activeWorkout) {
                  console.log('⏸️ [Resume] Pausing at start of rest segment for natural resume');
                  dispatch(pauseSet({ reason: 'Resumed workout - paused at start of rest segment' }));
                }
              }, 100);
            }
          }, 500);

          console.log('✅ Workout session resumed successfully with full state restoration');
        } catch (error: any) {
          // If query doesn't exist yet (codegen not run), silently fail
          if (error?.message?.includes('endpoint') || error?.message?.includes('not found')) {
            console.log('ℹ️ Resume functionality will be available after codegen is run');
          } else {
            console.error('Failed to resume workout session:', error);
          }
        }
      } catch (error: any) {
        console.error('Error checking for active session:', error);
      } finally {
        // Always hide loading indicator, even on error
        setIsRestoringSession(false);
      }
    };

    resumeActiveSession();
  }, []); // Run once on mount

  // Note: Auto-selection removed to prevent loops when finishing workout early
  // Users should start workouts from the workout selection screen instead

  // Add welcome message when status becomes 'selected' with streaming effect
  useEffect(() => {
    if (status === 'selected' && !welcomeMessageShownRef.current) {
      const currentState = store.getState() as any;
      const workoutState = currentState.workout;
      
      // Get exercise count from activeWorkout or workoutEntries
      const exerciseCount = activeWorkout?.totalExercises || 
                           workoutState.workoutEntries?.length || 
                           0;
      
      // Full welcome message text
      const fullMessage = `Welcome! We have ${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''} today. When you are warmed up, let me know when you're ready for the first exercise!`;
      
      // Mark as shown immediately to prevent duplicate messages
      welcomeMessageShownRef.current = true;
      
      // Store timeout ID for cleanup (using setTimeout for word-by-word streaming)
      let streamInterval: ReturnType<typeof setTimeout> | null = null;
      
      // Small delay before starting stream for more natural feel
      const startDelay = setTimeout(() => {
        // Create initial empty message
        const initialMessage: ConversationEvent = {
          type: 'agent_response',
          agent_response_event: {
            agent_response: ''
          }
        } as any;
        
        // Add empty message first
        setConversationEvents(prev => [...prev, initialMessage]);
        
        // Stream the message word by word for smoother effect
        const words = fullMessage.split(' ');
        let currentWordIndex = 0;
        let accumulatedText = '';
        
        const streamNextWord = () => {
          if (currentWordIndex < words.length) {
            // Add next word with space (except for first word)
            if (currentWordIndex > 0) {
              accumulatedText += ' ';
            }
            accumulatedText += words[currentWordIndex];
            currentWordIndex++;
            
            // Update the last message (the welcome message) with streaming content
            setConversationEvents(prev => {
              const updated = [...prev];
              const lastIndex = updated.length - 1;
              
              if (lastIndex >= 0 && updated[lastIndex].type === 'agent_response') {
                // Create a new object to ensure React detects the change
                updated[lastIndex] = {
                  type: 'agent_response',
                  agent_response_event: {
                    agent_response: accumulatedText
                  }
                } as any;
              }
              
              return updated;
            });
            
            // Schedule next word (vary timing slightly for natural feel)
            const baseDelay = 80; // Base delay in ms
            const randomVariation = Math.random() * 40 - 20; // ±20ms variation
            const delay = Math.max(50, baseDelay + randomVariation);
            
            streamInterval = setTimeout(streamNextWord, delay) as any;
          } else {
            // Streaming complete - ensure full message is set
            setConversationEvents(prev => {
              const updated = [...prev];
              const lastIndex = updated.length - 1;
              
              if (lastIndex >= 0 && updated[lastIndex].type === 'agent_response') {
                updated[lastIndex] = {
                  type: 'agent_response',
                  agent_response_event: {
                    agent_response: fullMessage
                  }
                } as any;
              }
              
              return updated;
            });
            
            streamInterval = null;
            console.log('👋 Welcome message streamed completely');
          }
        };
        
        // Start streaming
        streamNextWord();
      }, 500); // Start streaming after 500ms delay
      
      // Cleanup timeout and interval on unmount or status change
      return () => {
        clearTimeout(startDelay);
        if (streamInterval) {
          clearTimeout(streamInterval);
        }
      };
    }
    
    // Reset welcome message flag when workout is completed or finished early
    if (status === 'workout-completed' || status === 'inactive') {
      welcomeMessageShownRef.current = false;
    }
  }, [status, activeWorkout, session]);

  // Check if workoutEntries exist but status is still inactive (race condition fix)
  useEffect(() => {
    const currentState = store.getState() as any;
    if (
      status === 'inactive' && 
      currentState.workout.workoutEntries && 
      currentState.workout.workoutEntries.length > 0 && 
      currentState.workout.planId &&
      !currentState.workout.activeWorkout
    ) {
      console.log('🔄 Workout entries found but status is inactive - workout might be loading, waiting...');
      // Give it a moment, then check again - this handles race condition
      const timer = setTimeout(() => {
        const updatedState = store.getState() as any;
        if (updatedState.workout.status === 'selected' || updatedState.workout.activeWorkout) {
          console.log('✅ Workout selection completed');
        } else {
          console.log('⚠️ Workout still not selected - manual selection may be needed');
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // PROTEIN AD COMMENTED OUT
  // Trigger ad when workout is completed and agent is not connected
  // useEffect(() => {
  //   if (status === 'workout-completed' && !voiceAgent.connected && !adShownRef.current) {
  //     console.log('🎯 Workout completed and agent disconnected - triggering ad');
  //     adShownRef.current = true;
  //     
  //     // Trigger show_ad tool
  //     dispatch(showAd())
  //       .then((result) => {
  //         const data = unwrapResult(result);
  //         console.log('🎯 Ad shown successfully:', data);
  //         
  //         // Add conversation event after successful ad display
  //         const adEvent: ConversationEvent = {
  //           type: 'client_tool_call',
  //           client_tool_call: {
  //             tool_name: 'show_ad',
  //             tool_call_id: `ad_${Date.now()}`,
  //             parameters: data,
  //             expects_response: false
  //           }
  //         };
  //         setConversationEvents(prev => [...prev, adEvent]);
  //       })
  //       .catch((error) => {
  //         console.error('❌ Failed to show ad:', error);
  //         adShownRef.current = false; // Reset flag on error so it can retry
  //       });
  //   }
  //   
  //   // Reset flag when workout starts again
  //   if (status === 'selected' || status === 'preparing') {
  //     adShownRef.current = false;
  //   }
  // }, [status, voiceAgent.connected, dispatch]);

  // Handle back press - will be set up after endConversation is defined

  // // Sync selected playlist to Spotify when screen is first shown
  // useFocusEffect(
  //   useCallback(() => {
  //     const state = store.getState();
  //     const musicState = state.music;
  //     const spotifyAuth = state.spotifyAuth;
      
  //     if (spotifyAuth.accessToken && spotifyAuth.user && musicState.selectedPlaylist) {
  //       console.log('🎵 [Active Workout] Screen focused - syncing selected playlist to Spotify...');
        
  //       dispatch(syncPlaylistToSpotify()).then((result: any) => {
  //         if (result.payload?.synced) {
  //           console.log(`🎵 [Active Workout] Playlist "${result.payload.playlist}" synced to Spotify`);
  //         }
  //       }).catch((error: any) => {
  //         console.log('🎵 [Active Workout] Failed to sync playlist:', error);
  //       });
  //     }
  //   }, [dispatch])
  // );

  // ElevenLabs Conversation state
  const [conversationToken, setConversationToken] = useState<string | null>(null);
  const [conversationEvents, setConversationEvents] = useState<ConversationEvent[]>([]);
  const [conversationMode, setConversationMode] = useState<Mode | undefined>();
  const [conversationStatus, setConversationStatus] = useState<ConversationStatus>('disconnected');
  const [canSendFeedback, setCanSendFeedback] = useState<boolean>(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null); // Track conversation ID for disconnect
  const agentId = process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID || 'none';
  
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
          console.log('🎯 [Client Tool] complete_set called with params:', params);
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
          console.log('🎯 [Client Tool] extend_rest called with params:', params);
          const typedParams = params as { additionalSeconds: number; reason?: string };
          
          if (!typedParams.additionalSeconds || typedParams.additionalSeconds <= 0) {
            throw new Error('additionalSeconds must be a positive number');
          }
          
          const state = store.getState();
          const workoutState = state.workout;
          const reason = typedParams.reason || 'Agent extended rest period';
          
          console.log('🎯 [Client Tool] extend_rest - current workout status:', workoutState.status);
          console.log('🎯 [Client Tool] extend_rest - has rest timer:', !!workoutState.timers.restTimer);
          
          if (!workoutState.activeWorkout) {
            throw new Error('No active workout to extend rest for');
          }
          
          // Always use extendRest action to avoid affecting future sets
          console.log('🎯 [Client Tool] extend_rest - dispatching extendRest with', typedParams.additionalSeconds, 'seconds');
          
          // Dispatch the rest extension (this will extend/create the timer via middleware)
          const result = await dispatch(extendRest({ additionalSeconds: typedParams.additionalSeconds }));
          const data = unwrapResult(result);
          
          console.log('🎯 [Client Tool] extend_rest result:', data);
          
          return JSON.stringify({
            ...data,
            action: 'extended_rest',
            message: `Extended rest by ${typedParams.additionalSeconds}s`,
            currentState: workoutState.status,
            wasActivelyResting: workoutState.status === 'resting'
          });
          
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
      
      jump_to_exercise: async (params: unknown) => {
        try {
          const typedParams = params as { exerciseSlug: string; reason?: string };
          if (!typedParams.exerciseSlug) {
            throw new Error('Missing exerciseSlug parameter');
          }
          
          const reason = typedParams.reason || 'Agent navigation';
          const result = await dispatch(jumpToExercise({ 
            exerciseSlug: typedParams.exerciseSlug,
            reason 
          }));
          const data = unwrapResult(result);
          console.log('🎯 [Client Tool] jump_to_exercise result:', data);
          return JSON.stringify(data);
        } catch (error) {
          console.error('❌ [Client Tool] jump_to_exercise failed:', error);
          return JSON.stringify({ success: false, message: `Failed to jump to exercise: ${error}` });
        }
      },
      
      swap_exercise: async (params: unknown) => {
        try {
          const typedParams = params as { 
            exerciseSlug: string; // Slug of alternative exercise to swap to
            reason?: string;
          };
          
          if (!typedParams.exerciseSlug) {
            throw new Error('Missing exerciseSlug parameter');
          }
          
          const state = store.getState() as RootState;
          const workoutState = state.workout;
          
          if (!workoutState.activeWorkout || !workoutState.workoutEntries) {
            throw new Error('No active workout');
          }
          
          const currentExerciseIndex = workoutState.activeWorkout.currentExerciseIndex;
          const currentEntry = workoutState.workoutEntries[currentExerciseIndex];
          
          if (!currentEntry) {
            throw new Error('Current workout entry not found');
          }
          
          // Fetch fresh exercise data for all alternatives to match by slug (NO FALLBACKS to nested cache)
          const alternativeEdges = currentEntry.workout_entry_alternativesCollection?.edges || [];
          const alternativeExerciseIds = alternativeEdges.map(edge => edge.node.alternative_exercise_id);
          
          // Fetch all alternative exercises in parallel
          const alternativeExerciseMap = new Map<string, any>();
          const alternativePromises = alternativeExerciseIds.map(async (exerciseId: string) => {
            const result = await dispatch(
              enhancedApi.endpoints.GetExerciseById.initiate({ id: exerciseId })
            ).unwrap();
            const exercise = result?.exercisesCollection?.edges?.[0]?.node;
            if (!exercise) {
              throw new Error(`Failed to fetch alternative exercise ${exerciseId}`);
            }
            alternativeExerciseMap.set(exercise.slug, { id: exerciseId, exercise });
          });
          
          await Promise.all(alternativePromises);
          
          // Find the alternative by slug using fresh exercise data
          const matchingSlug = alternativeExerciseMap.get(typedParams.exerciseSlug);
          if (!matchingSlug) {
            // List available alternatives for better error message using fresh data
            const availableAlternatives = Array.from(alternativeExerciseMap.entries())
              .map(([slug, data]) => `${data.exercise.name} (${slug})`)
              .join(', ') || 'none';
            
            throw new Error(
              `Exercise "${typedParams.exerciseSlug}" is not a valid alternative. ` +
              `Available alternatives: ${availableAlternatives}`
            );
          }
          
          const newExerciseId = matchingSlug.id;
          const newExerciseName = matchingSlug.exercise.name;
          const reason = typedParams.reason || `Swapped to alternative: ${newExerciseName}`;
          
          // Call the swap mutation
          const result = await dispatch(
            enhancedApi.endpoints.SwapExerciseWithAlternative.initiate({
              workoutEntryId: currentEntry.id,
              newExerciseId: newExerciseId,
              alternativeNote: reason,
              planId: workoutState.planId || undefined,
              weekNumber: currentEntry.week_number || undefined,
              day: currentEntry.day || undefined
            })
          ).unwrap();
          
          console.log('🎯 [Client Tool] swap_exercise result:', result);
          
          return JSON.stringify({
            success: true,
            message: `Swapped to ${newExerciseName}`,
            oldExerciseName: currentEntry.exercises?.name,
            newExerciseName: newExerciseName,
            newExerciseSlug: typedParams.exerciseSlug,
            workoutEntryId: currentEntry.id
          });
          
        } catch (error) {
          console.error('❌ [Client Tool] swap_exercise failed:', error);
          return JSON.stringify({ 
            success: false, 
            message: `Failed to swap exercise: ${error instanceof Error ? error.message : error}` 
          });
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
      
      // Ad Tool (1)
      show_ad: async (params: unknown) => {
        try {
          const result = await dispatch(showAd());
          const data = unwrapResult(result);
          console.log('🎯 [Client Tool] show_ad result:', data);
          return JSON.stringify(data);
        } catch (error) {
          console.error('❌ [Client Tool] show_ad failed:', error);
          return JSON.stringify({ success: false, message: `Failed to show ad: ${error}` });
        }
      },
      
      // Music Tools (10) - Real implementations using musicActions
      get_playlists: async (params: unknown) => {
        try {
          const result = await dispatch(getPlaylists());
          const data = unwrapResult(result);
          console.log('🎵 [Client Tool] get_playlists result:', data);
          return JSON.stringify(data);
        } catch (error) {
          console.error('❌ [Client Tool] get_playlists failed:', error);
          return JSON.stringify({ success: false, message: `Failed to get playlists: ${error}` });
        }
      },
      
      select_playlist: async (params: unknown) => {
        try {
          const typedParams = params as { playlistId: string };
          if (!typedParams.playlistId) {
            throw new Error('Missing playlistId parameter');
          }
          const result = await dispatch(selectPlaylist({ playlistId: typedParams.playlistId }));
          const data = unwrapResult(result);
          console.log('🎵 [Client Tool] select_playlist result:', data);
          return JSON.stringify(data);
        } catch (error) {
          console.error('❌ [Client Tool] select_playlist failed:', error);
          return JSON.stringify({ success: false, message: `Failed to select playlist: ${error}` });
        }
      },
      
      get_tracks: async (params: unknown) => {
        try {
          const result = await dispatch(getTracks());
          const data = unwrapResult(result);
          console.log('🎵 [Client Tool] get_tracks result:', data);
          return JSON.stringify(data);
        } catch (error) {
          console.error('❌ [Client Tool] get_tracks failed:', error);
          return JSON.stringify({ success: false, message: `Failed to get tracks: ${error}` });
        }
      },
      
      play_track: async (params: unknown) => {
        try {
          const typedParams = params as { trackUri?: string; trackIndex?: number; trackName?: string };
          const result = await dispatch(playTrack({ 
            trackUri: typedParams?.trackUri, 
            trackIndex: typedParams?.trackIndex,
            trackName: typedParams?.trackName
          }));
          const data = unwrapResult(result);
          console.log('🎵 [Client Tool] play_track result:', data);
          
          // Show mini player on successful music tool call
          dispatch(showMiniPlayer());
          // Auto-hide after 4 seconds
          setTimeout(() => {
            dispatch(hideMiniPlayer());
          }, 4000);
          
          return JSON.stringify(data);
        } catch (error) {
          console.error('❌ [Client Tool] play_track failed:', error);
          return JSON.stringify({ success: false, message: `Failed to play track: ${error}` });
        }
      },
      
      skip_next: async (params: unknown) => {
        try {
          const result = await dispatch(skipNext());
          const data = unwrapResult(result);
          console.log('🎵 [Client Tool] skip_next result:', data);
          
          // Show mini player on successful music tool call
          dispatch(showMiniPlayer());
          setTimeout(() => {
            dispatch(hideMiniPlayer());
          }, 4000);
          
          return JSON.stringify(data);
        } catch (error) {
          console.error('❌ [Client Tool] skip_next failed:', error);
          return JSON.stringify({ success: false, message: `Failed to skip to next track: ${error}` });
        }
      },
      
      skip_previous: async (params: unknown) => {
        try {
          const result = await dispatch(skipPrevious());
          const data = unwrapResult(result);
          console.log('🎵 [Client Tool] skip_previous result:', data);
          
          // Show mini player on successful music tool call
          dispatch(showMiniPlayer());
          setTimeout(() => {
            dispatch(hideMiniPlayer());
          }, 4000);
          
          return JSON.stringify(data);
        } catch (error) {
          console.error('❌ [Client Tool] skip_previous failed:', error);
          return JSON.stringify({ success: false, message: `Failed to skip to previous track: ${error}` });
        }
      },
      
      pause_music: async (params: unknown) => {
        try {
          const result = await dispatch(pauseMusic());
          const data = unwrapResult(result);
          console.log('🎵 [Client Tool] pause_music result:', data);
          
          // Show mini player on successful music tool call
          dispatch(showMiniPlayer());
          setTimeout(() => {
            dispatch(hideMiniPlayer());
          }, 4000);
          
          return JSON.stringify(data);
        } catch (error) {
          console.error('❌ [Client Tool] pause_music failed:', error);
          return JSON.stringify({ success: false, message: `Failed to pause music: ${error}` });
        }
      },
      
      resume_music: async (params: unknown) => {
        try {
          const result = await dispatch(resumeMusic());
          const data = unwrapResult(result);
          console.log('🎵 [Client Tool] resume_music result:', data);
          
          // Show mini player on successful music tool call
          dispatch(showMiniPlayer());
          setTimeout(() => {
            dispatch(hideMiniPlayer());
          }, 4000);
          
          return JSON.stringify(data);
        } catch (error) {
          console.error('❌ [Client Tool] resume_music failed:', error);
          return JSON.stringify({ success: false, message: `Failed to resume music: ${error}` });
        }
      },
      
      set_volume: async (params: unknown) => {
        try {
          const typedParams = params as { volume: number };
          if (typedParams.volume === undefined || typedParams.volume === null) {
            throw new Error('Missing volume parameter');
          }
          const result = await dispatch(setVolume({ volume: typedParams.volume }));
          const data = unwrapResult(result);
          console.log('🎵 [Client Tool] set_volume result:', data);
          return JSON.stringify(data);
        } catch (error) {
          console.error('❌ [Client Tool] set_volume failed:', error);
          return JSON.stringify({ success: false, message: `Failed to set volume: ${error}` });
        }
      },
      
      get_music_status: async (params: unknown) => {
        try {
          const result = await dispatch(getMusicStatus());
          const data = unwrapResult(result);
          console.log('🎵 [Client Tool] get_music_status result:', data);
          return JSON.stringify(data);
        } catch (error) {
          console.error('❌ [Client Tool] get_music_status failed:', error);
          return JSON.stringify({ success: false, message: `Failed to get music status: ${error}` });
        }
      }
    },
    
    onConnect: ({ conversationId }: { conversationId: string }) => {
      console.log('Connected to ElevenLabs conversation', conversationId);
      setConversationStatus('connected');
      setCurrentConversationId(conversationId);
      
      // Track conversation connection in database
      dispatch(trackConversation({
        conversationId,
        eventType: 'connected',
      }));
    },
    onDisconnect: (details: string) => {
      console.log('Disconnected from ElevenLabs conversation', details);
      setConversationStatus('disconnected');
      
      // Track conversation disconnection in database
      if (currentConversationId) {
        dispatch(trackConversation({
          conversationId: currentConversationId,
          eventType: 'disconnected',
          details,
        }));
        setCurrentConversationId(null);
      }
      
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

      // Get current state for dynamic variables - ALWAYS get fresh data
      const currentState = store.getState();
      const musicState = currentState.music;
      const workoutState = currentState.workout;

      // Load fresh user profile from database
      const userProfile = await loadUserProfileFromDatabase(store.dispatch);

      // Get fresh current exercise data from workout state
      const currentExercise = workoutState.activeWorkout?.currentExercise;
      const exerciseProgressionRules = currentExercise ? {
        rep_limitations_progression_rules: currentExercise.repLimitationsProgressionRules || '',
        progression_by_client_feedback: currentExercise.progressionByClientFeedback || '',
        pain_injury_protocol: currentExercise.painInjuryProtocol || '',
        trainer_notes: currentExercise.trainerNotes || '',
      } : {
        rep_limitations_progression_rules: '',
        progression_by_client_feedback: '',
        pain_injury_protocol: '',
        trainer_notes: '',
      };

      await conversation.startSession({
        agentId: agentId,
        conversationToken: token,
        dynamicVariables: {
          user_name: user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || "User",
          user_activity: "starting_workout_session",
          app_context: "fitness_workout_assistant",
          selected_playlist: musicState.selectedPlaylist?.name || "No playlist selected",
          user_profile: userProfile?.profileText || '',
          rep_limitations_progression_rules: exerciseProgressionRules.rep_limitations_progression_rules,
          progression_by_client_feedback: exerciseProgressionRules.progression_by_client_feedback,
          pain_injury_protocol: exerciseProgressionRules.pain_injury_protocol,
          trainer_notes: exerciseProgressionRules.trainer_notes,
        }
      });
    } catch (error) {
      console.error('Failed to start ElevenLabs conversation:', error);
    }
  };

  // Function to safely end conversation with proper error handling
  // Wrapped in useCallback to use in effects and callbacks
  const endConversation = useCallback(async () => {
    // Prevent multiple simultaneous disconnection calls
    if (isDisconnectingRef.current) {
      console.log('Disconnection already in progress, skipping...');
      return;
    }

    try {
      // Only end if actually connected or connecting
      if (conversation.status === 'connected' || conversation.status === 'connecting') {
        isDisconnectingRef.current = true;
        console.log('Disconnecting voice agent...');
        await conversation.endSession();
        console.log('Voice agent disconnected successfully');
      } else {
        console.log('Voice agent already disconnected, status:', conversation.status);
      }
    } catch (error) {
      console.error('Failed to end ElevenLabs conversation:', error);
      // Even if endSession fails, unregister callbacks to prevent further communication
      contextBridgeService.unregisterCallbacks();
    } finally {
      // Reset flag after a delay to allow for cleanup
      setTimeout(() => {
        isDisconnectingRef.current = false;
      }, 1000);
    }
  }, [conversation]);



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
      console.log('Registering voice callbacks - conversation fully connected');
      contextBridgeService.registerCallbacks({
        sendMessage: conversation.sendUserMessage,
        sendContext: conversation.sendContextualUpdate,
      });
    }
  }, [conversationStatus, conversation]);

  // Don't disconnect immediately when workout completes - let user see completion screen
  // Disconnection will happen when navigating away (in navigation handlers)
  
  // REMOVED: Component unmount cleanup - it was causing premature disconnection
  // Navigation handlers handle all disconnections properly
  // If component unmounts without navigation, the connection will naturally timeout

  // Handle back press - must be after endConversation is defined
  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        if (status === 'workout-completed') {
          // Auto complete workout and navigate to summary screen, no alert
          // Disconnect voice agent before navigation (with small delay)
          setTimeout(() => {
            endConversation().catch(err => console.error('Error disconnecting on back press:', err));
          }, 300);
          // Capture sessionId before completeWorkout clears Redux state
          const currentSessionId = sessionId;
          dispatch(completeWorkout());
          router.replace({
            pathname: '/workout-completed',
            params: { sessionId: currentSessionId || '' }
          });
          return true;
        } else {
          // Show finish early alert for other states
          setShowFinishAlert(true);
          return true;
        }
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => backHandler.remove();
    }, [status, dispatch, sessionId, endConversation])
  );

  // Generate progress segments from current exercise (reactive to current timer state)
  const generateProgressSegments = (currentTimers: any): ProgressSegment[] => {
    if (!currentExercise || !activeWorkout) {
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
    const currentSetIndex = activeWorkout.currentSetIndex;
    
    currentExercise.sets.forEach((set, index) => {
      // Add set segment
      segments.push({
        type: 'set',
        duration: set.targetTime || 45,
      });
      
      // Add rest segment if the set has restTimeAfter defined
      if (set.restTimeAfter && set.restTimeAfter > 0) {
        let restDuration = set.restTimeAfter;
        
        // If this is the current rest segment and we have an active rest timer, use the timer's duration
        const currentRestSegmentIndex = (currentSetIndex * 2) + 1; // Each set + rest = 2 segments per set
        const thisRestSegmentIndex = (index * 2) + 1;
        
        if (thisRestSegmentIndex === currentRestSegmentIndex && 
            (status === 'resting' || status === 'rest-ending') && 
            currentTimers.restTimer) {
          // Use the actual timer duration (includes extensions)
          restDuration = Math.floor(currentTimers.restTimer.duration / 1000);
        }
        
        segments.push({
          type: 'rest',
          duration: restDuration,
        });
      }
    });
    
    return segments;
  };

  const progressSegments = generateProgressSegments(timers);

  const handleFinishWorkout = async () => {
    try {
      // Disconnect voice agent before navigation (with small delay to allow final messages)
      setTimeout(() => {
        endConversation().catch(err => console.error('Error disconnecting on finish:', err));
      }, 300);
      
      // Capture sessionId before finishWorkoutEarly clears Redux state
      const currentSessionId = selectSessionId(store.getState());
      
      // Dispatch finish workout early action
      const finishResult = await dispatch(finishWorkoutEarly());
      const finishData = unwrapResult(finishResult);
      console.log('Finish workout early result:', finishData);
      setShowFinishAlert(false);
      
      // Navigate to workout-completed screen (same as normal completion)
      router.replace({
        pathname: '/workout-completed',
        params: { sessionId: currentSessionId || '' }
      });
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

  // Show loading indicator while restoring session
  if (isRestoringSession) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: nucleus.light.semantic.bg.subtle, justifyContent: 'center', alignItems: 'center' }]}>
        <SystemBars style="dark" />
        <SafeAreaView style={[styles.container, { backgroundColor: nucleus.light.semantic.bg.subtle, justifyContent: 'center', alignItems: 'center' }]} edges={['bottom']}>
          <ActivityIndicator size="large" color={nucleus.light.global.blue["70"]} />
          <Text 
            variant="bodyLarge" 
            style={{ 
              marginTop: 16, 
              color: nucleus.light.global.blue["70"],
              fontFamily: 'PlusJakartaSans-Medium'
            }}
          >
            Restoring workout session...
          </Text>
        </SafeAreaView>
      </View>
    );
  }

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
              onShowAdjustModal={() => setShowAdjustModal(true)}
              onShowSwitchModal={() => setShowSwitchModal(true)}
              dispatch={dispatch}
              onEndConversation={endConversation}
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

      {/* Partynet Audio Player - Background audio playback */}
      <PartynetAudioPlayer />

      {/* Music Player Mini - Global Overlay (Spotify or Partynet) */}
      {status !== 'workout-completed' && (
        <MusicPlayerMini
          onPress={() => setShowMusicModal(true)}
        />
      )}

      {/* Music Modal */}
      <MusicModal
        visible={showMusicModal}
        onClose={() => setShowMusicModal(false)}
      />
      
      {/* Exercise Adjust Modal */}
      {currentWorkoutEntryId && (
        <ExerciseAdjustModal
          visible={showAdjustModal}
          onClose={() => setShowAdjustModal(false)}
          onAdjustmentComplete={() => {
            console.log('✅ Exercise adjusted successfully');
            // Optionally refresh the workout state here if needed
          }}
          workoutEntryId={currentWorkoutEntryId}
          currentExerciseId={currentExercise?.id}
        />
      )}

      {/* Switch Exercise Modal */}
      {currentExercise && workoutEntries && activeWorkout && (
        <SwitchExerciseModal
          visible={showSwitchModal}
          onClose={() => setShowSwitchModal(false)}
          currentExercise={{
            id: currentExercise.id,
            name: currentExercise.name,
            slug: (currentExercise as any).slug, // Type assertion - slug exists at runtime
          }}
          workoutEntries={workoutEntries}
          currentExerciseIndex={activeWorkout.currentExerciseIndex}
          setsCompleted={activeWorkout.setsCompleted}
        />
      )}
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
  workoutCompletedContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: nucleus.light.semantic.bg.canvas,
  },
  workoutCompletedContent: {
    alignItems: 'center',
    flexShrink: 0,
    gap: 16,
  },
  workoutCompletedUpperSpacer: {
    flex: 1,
    minHeight: 20,
  },
  workoutCompletedLowerSpacer: {
    flex: 1,
    minHeight: 20,
  },
  workoutCompletedTitle: {
    color: nucleus.light.global.grey["90"],
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 32,
    lineHeight: 38,
    textAlign: 'center',
    marginBottom: 8,
    includeFontPadding: false,
  },
  workoutCompletedSubtitle: {
    color: nucleus.light.global.grey["70"],
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
    includeFontPadding: false,
  },
  finishButtonContainer: {
    alignSelf: 'center',
    flexShrink: 0,
  },
  finishButtonInner: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: nucleus.light.global.blue["60"],
    minWidth: 120,
  },
  finishButtonText: {
    color: nucleus.light.global.blue["60"],
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    lineHeight: 22,
    textAlign: 'center',
    includeFontPadding: false,
  },
  workoutSummaryContainer: {
    marginTop: 32,
    paddingHorizontal: 16,
    width: '100%',
  },
  summaryTitle: {
    color: nucleus.light.global.grey["90"],
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
    includeFontPadding: false,
  },
  summaryExerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: nucleus.light.global.grey["20"],
  },
  summaryExerciseName: {
    color: nucleus.light.global.grey["90"],
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    lineHeight: 20,
    includeFontPadding: false,
    flex: 1,
  },
  summarySetsCount: {
    color: nucleus.light.global.blue["70"],
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    lineHeight: 18,
    includeFontPadding: false,
  },
  videoTouchArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  topRightOverlay: {
    position: 'absolute',
    right: 0,
    zIndex: 20,
    pointerEvents: 'box-none',
  },
  topRightButtonsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
  },
  topRightButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRightButtonMargin: {
    marginRight: 0,
  },
  topRightIcon: {
    width: 24,
    height: 24,
    tintColor: nucleus.light.global.white,
  },
  swapIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  swapIconArrow: {
    width: 12,
    height: 12,
    tintColor: nucleus.light.global.white,
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
    gap: 0,
  },
  infoItemRight: {
    display: 'flex',
    width: 72,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 0,
  },
  adjusterButton: {
    paddingVertical: 2,
    paddingHorizontal: 20,
    marginTop: -4,
    marginBottom: -4,
  },
  adjusterIcon: {
    width: 24,
    height: 24,
    tintColor: nucleus.light.global.grey["50"],
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
    zIndex: 2000, // Higher than MusicPlayerMini (1000)
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
    zIndex: 3000, // Higher than modal (2000) to appear above it
    right: 11,
    bottom: 21,
    pointerEvents: 'auto', // Ensure it only captures its own touches
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