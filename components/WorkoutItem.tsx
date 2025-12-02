import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Svg, { Circle } from "react-native-svg";
import { nucleus } from '../Buddy_variables.js';
import { useGetWorkoutSessionByDateQuery, useGetWorkoutEntriesPresetIdQuery } from '../store/api/enhancedApi';
import { getDayNameImage } from '../utils';

export interface WorkoutItemData {
  id: string;
  title: string;
  date: string; // Format: "YYYY-MM-DD"
  time: string; // Format: "HH:MM"
  duration: number; // in minutes
  exercises: number;
  reps: number;
  isCompleted: boolean;
  progress?: number; // Progress percentage (0-100)
  workoutNumber?: string; // Optional: will be auto-generated if not provided
  weekNumber?: number; // Week number (1-8)
  dayOfWeek?: number; // Day of week (0=Monday, 1=Tuesday, etc.)
  image?: string; // Optional: image filename for the workout
}

interface WorkoutItemProps {
  workout: WorkoutItemData;
  index?: number; // Optional index for auto-generating workout number
  onPress?: () => void;
  planId?: string; // Optional plan ID for fetching session completion data
}

// Function to get the appropriate image source based on day name
const getWorkoutImageSource = (workoutTitle: string, fallbackImage?: string) => {
  // First try to use the dayname image based on workout title
  const dayNameImage = getDayNameImage(workoutTitle);
  
  // Map dayname images to require statements
  const dayNameImageMap: { [key: string]: any } = {
    'arms.png': require('../assets/dayname/arms.png'),
    'back.png': require('../assets/dayname/back.png'),
    'chest.png': require('../assets/dayname/chest.png'),
    'core.png': require('../assets/dayname/core.png'),
    'full-body.png': require('../assets/dayname/full-body.png'),
    'hypertrophy.png': require('../assets/dayname/hypertrophy.png'),
    'legs.png': require('../assets/dayname/legs.png'),
    'lower.png': require('../assets/dayname/lower.png'),
    'pull.png': require('../assets/dayname/pull.png'),
    'push.png': require('../assets/dayname/push.png'),
    'recovery.png': require('../assets/dayname/recovery.png'),
    'shoulders.png': require('../assets/dayname/shoulders.png'),
    'uper.png': require('../assets/dayname/uper.png'),
  };

  // Return the mapped dayname image
  if (dayNameImageMap[dayNameImage]) {
    return dayNameImageMap[dayNameImage];
  }

  // Fallback to old image logic if dayname image not found
  if (fallbackImage === 'abs.png') return require('../assets/images/abs.png');
  if (fallbackImage === 'legs.png') return require('../assets/images/legs.png');
  if (fallbackImage === 'fullbody.png') return require('../assets/images/fullbody.png');
  
  // Final fallback
  return require('../assets/dayname/full-body.png');
};

export default function WorkoutItem({ workout, index, onPress, planId }: WorkoutItemProps) {
  // Fetch session data for this workout if planId is provided
  const { data: sessionData } = useGetWorkoutSessionByDateQuery(
    { workoutPlanId: planId || '', date: workout.date },
    {
      skip: !planId,
      refetchOnMountOrArgChange: true // Always fetch fresh data
    }
  );

  // Check if this workout is from a Train Now preset
  const { data: presetData } = useGetWorkoutEntriesPresetIdQuery(
    { workoutPlanId: planId || '', date: workout.date },
    {
      skip: !planId,
      refetchOnMountOrArgChange: true
    }
  );

  // Determine if this is a Train Now workout
  const isTrainNow = useMemo(() => {
    const presetId = presetData?.workout_entriesCollection?.edges?.[0]?.node?.preset_id;
    return !!presetId;
  }, [presetData]);

  // Calculate completion status from session data
  const { isCompleted, isFullyCompleted, progress, hasSession } = useMemo(() => {
    const session = sessionData?.workout_sessionsCollection?.edges?.[0]?.node;

    console.log('[WorkoutItem] Session query for date:', workout.date, 'planId:', planId);
    console.log('[WorkoutItem] Session data:', session ? {
      id: session.id,
      status: session.status,
      completed_sets: session.completed_sets,
      total_sets: session.total_sets,
      is_fully_completed: session.is_fully_completed,
      finished_early: session.finished_early
    } : 'no session');

    if (!session) {
      // No session data - use original workout values
      console.log('[WorkoutItem] No session - using workout defaults:', {
        isCompleted: workout.isCompleted,
        progress: workout.progress || 0
      });
      return {
        isCompleted: workout.isCompleted,
        isFullyCompleted: workout.isCompleted,
        progress: workout.progress || 0,
        hasSession: false
      };
    }

    // Session exists - use session data
    // Calculate progress from completed sets / total sets
    let sessionProgress = 0;
    if (session.total_sets && session.total_sets > 0) {
      sessionProgress = Math.round((session.completed_sets || 0) / session.total_sets * 100);
      console.log('[WorkoutItem] Progress calc:', session.completed_sets, '/', session.total_sets, '=', sessionProgress, '%');
    }

    // Show checkmark only for fully completed OR finished early with >= 80%
    const showCheckmark = session.is_fully_completed || (session.finished_early && sessionProgress >= 80);

    // Only show "Completed" status if fully completed OR progress >= 80%
    const sessionIsCompleted = session.is_fully_completed || sessionProgress >= 80;

    // If session is in progress but not completed, ensure we show some progress
    if (!showCheckmark && session.status && ['exercising', 'preparing', 'resting', 'paused'].includes(session.status)) {
      sessionProgress = Math.max(sessionProgress, 1); // At least 1% if started
    }

    const result = {
      isCompleted: sessionIsCompleted,
      isFullyCompleted: showCheckmark,
      progress: session.is_fully_completed ? 100 : sessionProgress,
      hasSession: true
    };

    console.log('[WorkoutItem] Final result for', workout.date, ':', result);

    return result;
  }, [sessionData, workout.isCompleted, workout.progress, workout.date, planId]);

  // Get sessionId for navigation
  const sessionId = sessionData?.workout_sessionsCollection?.edges?.[0]?.node?.id;

  // Handle press - navigate to completed screen if workout is done
  const handlePress = () => {
    // Navigate to completed screen if workout has session and is completed (>= 80% or fully done)
    if (hasSession && (isCompleted || isFullyCompleted) && sessionId) {
      // Navigate to workout completed summary
      console.log('[WorkoutItem] Navigating to workout-completed with sessionId:', sessionId);
      router.push({
        pathname: '/workout-completed',
        params: { sessionId }
      });
    } else if (onPress) {
      // Navigate to workout screen
      onPress();
    }
  };

  const getStatusInfo = () => {
    if (isCompleted) {
      const workoutDate = new Date(workout.date);
      const today = new Date();

      // Reset time to compare only dates
      const workoutDateOnly = new Date(workoutDate.getFullYear(), workoutDate.getMonth(), workoutDate.getDate());
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      if (workoutDateOnly.getTime() === todayOnly.getTime()) {
        return {
          text: "Well done today! 🔥",
          backgroundColor: nucleus.light.semantic.accent.moderate,
          textColor: nucleus.light.global.green["80"],
          icon: "check"
        };
      } else {
        return {
          text: "Completed ✅",
          backgroundColor: nucleus.light.semantic.accent.moderate,
          textColor: nucleus.light.global.green["80"],
          icon: "check"
        };
      }
    }

    const workoutDate = new Date(workout.date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Reset time to compare only dates
    const workoutDateOnly = new Date(workoutDate.getFullYear(), workoutDate.getMonth(), workoutDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    // If there's session data, show encouraging message instead of missed
    if (hasSession && workoutDateOnly.getTime() < todayOnly.getTime()) {
      // Encouraging message based on progress
      let text = "Started";
      if (progress >= 50) {
        text = "Almost there!";
      } else if (progress >= 25) {
        text = "Good effort!";
      } else if (progress > 0) {
        text = "Good start!";
      }

      return {
        text,
        backgroundColor: nucleus.light.global.blue["20"],
        textColor: nucleus.light.global.blue["80"],
        icon: "partial"
      };
    }

    if (workoutDateOnly.getTime() === yesterdayOnly.getTime()) {
      return {
        text: "Yesterday",
        backgroundColor: nucleus.light.global.orange["30"],
        textColor: nucleus.light.global.orange["90"],
        icon: "warning"
      };
    }

    if (workoutDateOnly.getTime() < todayOnly.getTime()) {
      return {
        text: "Missed",
        backgroundColor: nucleus.light.global.orange["30"],
        textColor: nucleus.light.global.orange["90"],
        icon: "warning"
      };
    }

    if (workoutDateOnly.getTime() === todayOnly.getTime()) {
      return {
        text: "Today 💪",
        backgroundColor: nucleus.light.global.brand["40"],
        textColor: nucleus.light.global.brand["90"],
        icon: "today"
      };
    }

    // Calculate days difference for upcoming workouts
    const daysDiff = Math.ceil((workoutDateOnly.getTime() - todayOnly.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      return {
        text: "Tomorrow",
        backgroundColor: nucleus.light.global.blue["20"],
        textColor: nucleus.light.global.blue["80"],
        icon: "upcoming"
      };
    }

    // If more than 7 days, show in weeks format
    if (daysDiff > 7) {
      const weeksDiff = Math.ceil(daysDiff / 7);
      return {
        text: `In ${weeksDiff} week${weeksDiff > 1 ? 's' : ''}`,
        backgroundColor: nucleus.light.global.blue["20"],
        textColor: nucleus.light.global.blue["80"],
        icon: "upcoming"
      };
    }

    return {
      text: `In ${daysDiff} Days`,
      backgroundColor: nucleus.light.global.blue["20"],
      textColor: nucleus.light.global.blue["80"],
      icon: "upcoming"
    };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'short' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getOrdinalNumber = (num: number): string => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  };

  const getWorkoutNumberAndDate = () => {
    const workoutNumber = workout.workoutNumber || (index !== undefined ? getOrdinalNumber(index + 1) : '1st');
    return `${workoutNumber} workout  /  ${formatDate(workout.date)}`;
  };

  const statusInfo = getStatusInfo();

  const getBorderStyle = () => {
    if (isCompleted) return null;

    const workoutDate = new Date(workout.date);
    const today = new Date();

    // Reset time to compare only dates
    const workoutDateOnly = new Date(workoutDate.getFullYear(), workoutDate.getMonth(), workoutDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Show brand border if workout is today
    if (workoutDateOnly.getTime() === todayOnly.getTime()) {
      return 'brand';
    }

    // // Show orange border if workout date is in the past (missed workout)
    // if (workoutDateOnly.getTime() < todayOnly.getTime()) {
    //   return 'orange';
    // }

    // No border for future workouts
    return null;
  };

  return (
    <Animated.View entering={FadeInUp.delay((index || 0) * 100).duration(600).springify()}>
      <TouchableOpacity
        style={[
          styles.workoutCard,
          // getBorderStyle() === 'orange' && styles.missedWorkoutBorder,
          getBorderStyle() === 'brand' && styles.todayWorkoutBorder
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
      <View style={styles.workoutContent}>
        <View style={styles.workoutInfo}>
          <View style={styles.badgesRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.backgroundColor }]}>
              <Text style={[styles.statusText, { color: statusInfo.textColor }]}>
                {statusInfo.text}
              </Text>
            </View>
            {isTrainNow && (
              <View style={[styles.trainNowBadge, { backgroundColor: nucleus.light.global.brand["40"] }]}>
                <Text style={[styles.trainNowText, { color: nucleus.light.global.brand["90"] }]}>
                  Train Now
                </Text>
              </View>
            )}
          </View>
          <View style={styles.workoutDetails}>
            <View style={styles.titleSection}>
              <Text style={styles.workoutSubtitle}>
                <Text style={styles.workoutNumberText}>{workout.workoutNumber || (index !== undefined ? getOrdinalNumber(index + 1) : '1st')} workout  </Text>
                <Text style={styles.workoutDateText}>/  {formatDate(workout.date)}</Text>
              </Text>
              <Text style={styles.workoutTitle}>{workout.title}</Text>
              <View style={styles.metadataRow}>
                <Text style={styles.metadataText}>{workout.duration} min</Text>
                <View style={styles.dotSeparator} />
                <Text style={styles.metadataText}>{workout.exercises} ex.</Text>
                <View style={styles.dotSeparator} />
                <Text style={styles.metadataText}>{workout.reps} rep</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Workout Image - positioned absolutely in bottom right */}
        <View style={styles.workoutImageContainer}>
          <Image
            source={getWorkoutImageSource(workout.title, workout.image)}
            style={[styles.workoutImage, styles.monochromeFilter]}
            contentFit="contain"
          />
        </View>
        
        {/* Progress Circle back to original position */}
        <View style={[
          styles.progressCircle,
          { backgroundColor: isFullyCompleted ? nucleus.light.semantic.accent.moderate : "#F1F3E8" }
        ]}>
          {/* HeroUI-style Circular Progress Ring */}
          {/* Progress ring for in-progress or partially completed workouts */}
          {!isFullyCompleted && progress > 0 && (
            <View style={styles.progressRingContainer}>
              <Svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={styles.progressSvg}>
                {/* Background track circle */}
                <Circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke={nucleus.light.global.white}
                  strokeWidth="6"
                  fill="transparent"
                  opacity="0.2"
                  strokeDasharray={`${2 * Math.PI * 20} ${2 * Math.PI * 20}`}
                  strokeDashoffset="0"
                  transform="rotate(-90 24 24)"
                  strokeLinecap="round"
                />
                {/* Progress indicator circle */}
                <Circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke={nucleus.light.global.blue["60"]}
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 20} ${2 * Math.PI * 20}`}
                  strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 100)}`}
                  transform="rotate(-90 24 24)"
                  strokeLinecap="round"
                />
              </Svg>
            </View>
          )}

          {/* Completion ring for fully completed workouts */}
          {isFullyCompleted && (
            <View style={styles.progressRingContainer}>
              <Svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={styles.progressSvg}>
                <Circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke={nucleus.light.global.brand["60"]}
                  strokeWidth="6"
                  fill="transparent"
                  strokeLinecap="round"
                />
              </Svg>
            </View>
          )}
          <View style={styles.progressCircleInner}>
            {isFullyCompleted ? (
              <Image
                source={require('../assets/icons/check.svg')}
                style={styles.checkIcon}
                contentFit="contain"
              />
            ) : (
              <Text style={[
                styles.progressText,
                { color: nucleus.light.global.blue["80"] }
              ]}>
                {progress}%
              </Text>
            )}
          </View>
        </View>
      </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = {
  workoutCard: {
    backgroundColor: nucleus.light.semantic.bg.canvas,
    borderRadius: 16,
    overflow: 'hidden' as const,
  },
  missedWorkoutBorder: {
    borderWidth: 1,
    borderColor: nucleus.light.global.orange["40"],
    shadowColor: nucleus.light.global.orange["40"],
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.16,
    shadowRadius: 40,
    elevation: 12,
  },
  todayWorkoutBorder: {
    borderWidth: 1,
    borderColor: nucleus.light.global.brand["70"],
    shadowColor: nucleus.light.global.brand["70"],
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.16,
    shadowRadius: 40,
    elevation: 12,
  },
  workoutContent: {
    position: 'relative' as const,
    flexDirection: 'row' as const,
    padding: 16,
    paddingBottom: 56, // Changed from 64 to 56 to match new design
    gap: 16,
    alignItems: 'flex-start' as const,
  },
  workoutInfo: {
    flex: 1,
    gap: 16, // Changed from 24 to 16 to match new design
  },
  badgesRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    flexWrap: 'wrap' as const,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 32,
    alignSelf: 'flex-start' as const,
  },
  trainNowBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 32,
    alignSelf: 'flex-start' as const,
  },
  trainNowText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    fontWeight: '700' as const,
    lineHeight: 14,
  },
  statusText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    fontWeight: '700' as const,
    lineHeight: 14,
  },
  workoutDetails: {
    gap: 16,
  },
  titleSection: {
    gap: 8,
  },
  workoutSubtitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    fontWeight: '700' as const,
    lineHeight: 14,
  },
  workoutNumberText: {
    color: nucleus.light.semantic.fg.subtle,
  },
  workoutDateText: {
    color: nucleus.light.semantic.fg.base,

  },
  workoutTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    fontWeight: '700' as const,
    lineHeight: 19.2,
    color: nucleus.light.semantic.fg.base,
  },
  metadataRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  metadataText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    fontWeight: '700' as const,
    lineHeight: 12,
    color: nucleus.light.global.grey["60"],
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: nucleus.light.global.grey["60"],
  },
  progressCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 8,
  },
  progressCircleInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: nucleus.light.global.white,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  checkIcon: {
    width: 16,
    height: 16,
  },
  progressText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
  },
  progressRingContainer: {
    position: 'absolute' as const,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  progressSvg: {
    position: 'absolute' as const,
  },
  workoutImageContainer: {
    position: 'absolute' as const,
    bottom: 0,
    right: 0,
    width: 200,
    height: 120,
    overflow: 'hidden' as const,
    zIndex: -1,
  },
  workoutImage: {
    width: 200,
    height: 120,
  },
  monochromeFilter: {
    // Option 1: Grayscale filter (works on both iOS and Android)
    //opacity: 0.4,
    //tintColor: nucleus.light.global.blue["60"],
    //tintColor: nucleus.light.semantic.accent.dim, // Green tint
  },
}; 