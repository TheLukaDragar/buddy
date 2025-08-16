import { Image } from "expo-image";
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Svg, { Circle } from "react-native-svg";
import { nucleus } from '../Buddy_variables.js';

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
}

interface WorkoutItemProps {
  workout: WorkoutItemData;
  index?: number; // Optional index for auto-generating workout number
  onPress?: () => void;
}

export default function WorkoutItem({ workout, index, onPress }: WorkoutItemProps) {


  const getStatusInfo = () => {
    if (workout.isCompleted) {
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

    if (workoutDateOnly.getTime() === yesterdayOnly.getTime()) {
      return {
        text: "Yesterday 😱",
        backgroundColor: nucleus.light.global.orange["30"],
        textColor: nucleus.light.global.orange["90"],
        icon: "warning"
      };
    }

    if (workoutDateOnly.getTime() < todayOnly.getTime()) {
      return {
        text: "Missed 😱",
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
    if (workout.isCompleted) return null;
    
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
          getBorderStyle() === 'orange' && styles.missedWorkoutBorder,
          getBorderStyle() === 'brand' && styles.todayWorkoutBorder
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
      <View style={styles.workoutContent}>
        <View style={styles.workoutInfo}>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.backgroundColor }]}>
            <Text style={[styles.statusText, { color: statusInfo.textColor }]}>
              {statusInfo.text}
            </Text>
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
                <View style={[
          styles.progressCircle, 
          { backgroundColor: workout.isCompleted ? nucleus.light.semantic.accent.moderate : "#F1F3E8" }
        ]}>
          {/* HeroUI-style Circular Progress Ring */}
          {/* Progress ring for in-progress workouts */}
          {!workout.isCompleted && (workout.progress || 0) > 0 && (
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
                  strokeDashoffset={`${2 * Math.PI * 20 * (1 - (workout.progress || 0) / 100)}`}
                  transform="rotate(-90 24 24)"
                  strokeLinecap="round"
                />
              </Svg>
            </View>
          )}
          
          {/* Completion ring for completed workouts */}
          {workout.isCompleted && (
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
            {workout.isCompleted ? (
              <Image
                source={require('../assets/icons/check.svg')}
                style={styles.checkIcon}
                contentFit="contain"
              />
            ) : (
              <Text style={[
                styles.progressText,
                { color: workout.isCompleted ? nucleus.light.global.white : nucleus.light.global.blue["80"] }
              ]}>
                {workout.progress || 0}%
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 32,
    alignSelf: 'flex-start' as const,
  },
  statusText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    fontWeight: '700' as const,
    lineHeight: 12,
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
    lineHeight: 12,
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
}; 