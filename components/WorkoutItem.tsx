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
        backgroundColor: nucleus.light.global.blue["60"],
        textColor: nucleus.light.global.blue["10"],
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

  const getWorkoutSubtitle = () => {
    const workoutNumber = workout.workoutNumber || (index !== undefined ? getOrdinalNumber(index + 1) : '1st');
    return `${workoutNumber} workout of the week`;
  };

  const statusInfo = getStatusInfo();

  return (
    <Animated.View entering={FadeInUp.delay((index || 0) * 100).duration(600).springify()}>
      <TouchableOpacity 
        style={styles.workoutCard}
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
              <Text style={styles.workoutTitle}>{workout.title}</Text>
              <Text style={styles.workoutSubtitle}>{getWorkoutSubtitle()}</Text>
            </View>
            <View style={styles.metadataSection}>
              <View style={styles.metadataItem}>
                <Image
                  source={require('../assets/icons/clock.svg')}
                  style={styles.metadataIcon}
                  contentFit="contain"
                />
                <Text style={styles.metadataText}>{formatDate(workout.date)}</Text>
              </View>
              <View style={styles.metadataItem}>
                <Image
                  source={require('../assets/icons/clock.svg')}
                  style={styles.metadataIcon}
                  contentFit="contain"
                />
                <Text style={styles.metadataText}>{workout.duration} min</Text>
              </View>
              <View style={styles.metadataItem}>
                <Image
                  source={require('../assets/icons/equipment.svg')}
                  style={styles.metadataIcon}
                  contentFit="contain"
                />
                <Text style={styles.metadataText}>{workout.exercises} exercises</Text>
              </View>
            </View>
          </View>
        </View>
                <View style={[
          styles.progressCircle, 
          { backgroundColor: workout.isCompleted ? nucleus.light.semantic.accent.moderate : nucleus.light.global.blue["20"] }
        ]}>
          {/* HeroUI-style Circular Progress Ring */}
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
    gap: 4,
  },
  workoutTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    fontWeight: '700' as const,
    lineHeight: 21.6,
    color: nucleus.light.semantic.fg.base,
  },
  workoutSubtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 12,
    color: nucleus.light.semantic.fg.subtle,
  },
  metadataSection: {
    gap: 4,
  },
  metadataItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  metadataIcon: {
    width: 16,
    height: 16,
  },
  metadataText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    fontWeight: '700' as const,
    lineHeight: 12,
    color: nucleus.light.global.grey["70"],
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