import React, { useEffect, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { nucleus } from '../Buddy_variables.js';
import { useGetUserWorkoutStatisticsQuery } from '../store/api/enhancedApi';

export interface StatisticsData {
  completedWorkouts: number;
  averageWorkoutTime: string; // Format: "1:02:21"
  totalLiftedWeight: number; // in kg
  burnedCalories: number; // in kcal
}

export interface StatisticsDataSets {
  allTime: StatisticsData;
  thisWeek: StatisticsData;
}

interface StatisticsProps {
  userId?: string;
}

type TimeRange = 'alltime' | 'thisweek';

export default function Statistics({ userId }: StatisticsProps) {
  // Fetch user workout statistics
  const { data: statsData } = useGetUserWorkoutStatisticsQuery(
    { userId: userId || '' },
    {
      skip: !userId,
      refetchOnMountOrArgChange: true
    }
  );

  // Calculate real statistics from session data
  const data = useMemo(() => {
    const sessions = statsData?.workout_sessionsCollection?.edges?.map(e => e.node) || [];

    // Get start of current week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysToMonday);
    weekStart.setHours(0, 0, 0, 0);

    // Filter sessions for this week
    const thisWeekSessions = sessions.filter(s => {
      if (!s.completed_at) return false;
      const completedAt = new Date(s.completed_at);
      return completedAt >= weekStart;
    });

    // Helper function to calculate stats for a set of sessions
    const calculateStats = (sessionList: typeof sessions): StatisticsData => {
      const completedWorkouts = sessionList.length;

      // Calculate total and average time
      const totalTimeMs = sessionList.reduce((sum, s) => sum + (parseInt(s.total_time_ms || '0') || 0), 0);
      const avgTimeMs = completedWorkouts > 0 ? totalTimeMs / completedWorkouts : 0;

      // Format time as H:MM:SS
      const hours = Math.floor(avgTimeMs / 3600000);
      const minutes = Math.floor((avgTimeMs % 3600000) / 60000);
      const seconds = Math.floor((avgTimeMs % 60000) / 1000);
      const averageWorkoutTime = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      // Calculate total lifted weight from sets
      let totalLiftedWeight = 0;
      sessionList.forEach(s => {
        const sets = s.workout_session_setsCollection?.edges || [];
        sets.forEach(setEdge => {
          const set = setEdge.node;
          if (set.is_completed && set.actual_weight && set.actual_reps) {
            totalLiftedWeight += (parseFloat(set.actual_weight as string) || 0) * (set.actual_reps || 0);
          }
        });
      });

      // Estimate burned calories (rough estimate: ~5 kcal per minute of workout)
      const totalMinutes = totalTimeMs / 60000;
      const burnedCalories = Math.round(totalMinutes * 5);

      return {
        completedWorkouts,
        averageWorkoutTime,
        totalLiftedWeight: Math.round(totalLiftedWeight),
        burnedCalories
      };
    };

    return {
      allTime: calculateStats(sessions),
      thisWeek: calculateStats(thisWeekSessions)
    };
  }, [statsData]);

  const [activeTimeRange, setActiveTimeRange] = useState<TimeRange>('alltime');
  const [currentData, setCurrentData] = useState<StatisticsData>(data.allTime);

  // Update currentData when data changes
  useEffect(() => {
    setCurrentData(activeTimeRange === 'alltime' ? data.allTime : data.thisWeek);
  }, [data, activeTimeRange]);

  // Animation values
  const fadeAnim = useSharedValue(1);
  
  // Get current data based on active time range
  const getActiveData = (timeRange: TimeRange): StatisticsData => {
    return timeRange === 'alltime' ? data.allTime : data.thisWeek;
  };
  
  // Handle toggle change with animation
  const handleToggleChange = (newTimeRange: TimeRange) => {
    if (newTimeRange === activeTimeRange) return;
    
    // Start exit animation (fade only)
    fadeAnim.value = withTiming(0, { duration: 100 });
    
    // Update data and start enter animation after exit completes
    setTimeout(() => {
      setCurrentData(getActiveData(newTimeRange));
      setActiveTimeRange(newTimeRange);
      
      fadeAnim.value = withSpring(1, { 
        damping: 18, 
        stiffness: 200,
        mass: 0.8,
      });
    }, 100);
  };
  
  // Animated styles for the stats content (fade only)
  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  return (
    <View style={styles.container}>
      {/* Header with title and toggle */}
      <View style={styles.header}>
        <Text style={styles.title}>Statistics</Text>
        
        {/* Segmented Control */}
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[
              styles.segment,
              activeTimeRange === 'alltime' && styles.activeSegment
            ]}
            onPress={() => handleToggleChange('alltime')}
          >
            <Text 
              style={[
                styles.segmentText,
                activeTimeRange === 'alltime' ? styles.activeSegmentText : styles.inactiveSegmentText
              ]}
              numberOfLines={1}
            >
              All time
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.segment,
              activeTimeRange === 'thisweek' && styles.activeSegment
            ]}
            onPress={() => handleToggleChange('thisweek')}
          >
            <Text 
              style={[
                styles.segmentText,
                activeTimeRange === 'thisweek' ? styles.activeSegmentText : styles.inactiveSegmentText
              ]}
              numberOfLines={1}
            >
              This week
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Animated Statistics Content */}
      <Animated.View style={[styles.statsContent, animatedContentStyle]}>
        {/* First row */}
        <View style={styles.row}>
          <View style={styles.statItem}>
            <Text style={styles.valueText}>{currentData.completedWorkouts}</Text>
            <Text style={styles.labelText}>Completed workouts</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.valueText}>
              {currentData.averageWorkoutTime.split(':')[0]}:{currentData.averageWorkoutTime.split(':')[1]}
              <Text style={styles.unitText}>:{currentData.averageWorkoutTime.split(':')[2]}</Text>
            </Text>
            <Text style={styles.labelText}>Average workout time</Text>
          </View>
        </View>
        
        {/* Second row */}
        <View style={styles.row}>
          <View style={styles.statItem}>
            <Text style={styles.valueText}>
              {currentData.totalLiftedWeight.toLocaleString()}
              <Text style={styles.unitText}>kg</Text>
            </Text>
            <Text style={styles.labelText}>Total lifted weight</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.valueText}>
              {currentData.burnedCalories.toLocaleString()}
              <Text style={styles.unitText}>kcal</Text>
            </Text>
            <Text style={styles.labelText}>Burned calories</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = {
  container: {
    flexDirection: 'column' as const,
    gap: 16,
    alignItems: 'flex-start' as const,
    justifyContent: 'flex-start' as const,
    width: '100%' as const,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    width: '100%' as const,
  },
  title: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    fontWeight: '700' as const,
    lineHeight: 21.6, // 1.2 * 18
    color: nucleus.light.semantic.fg.base,
    textAlign: 'left' as const,
    includeFontPadding: false, // Added to prevent extra space at the bottom of the text
  },
  segmentedControl: {
    backgroundColor: nucleus.light.global.grey["30"], // #daddde
    borderRadius: nucleus.light.cornerRadius.full, // 9999
    height: 32,
    width: 170, // Increased width to accommodate "This week" in one line
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 2,
  },
  segment: {
    flex: 1,
    height: '100%' as const,
    borderRadius: nucleus.light.cornerRadius.full,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 12,
  },
  activeSegment: {
    backgroundColor: nucleus.light.semantic.bg.surface, // #ffffff
    shadowColor: 'rgba(20,20,20,0.12)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 2, // For Android shadow
  },
  segmentText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    fontWeight: '700' as const,
    lineHeight: 12,
    textAlign: 'center' as const,
    includeFontPadding: false,
    numberOfLines: 1,
    textBreakStrategy: 'simple' as const,
  },
  activeSegmentText: {
    color: nucleus.light.global.brand["80"], // #adb813
  },
  inactiveSegmentText: {
    color: nucleus.light.global.grey["50"], // #898d8f
  },
  statsContent: {
    width: '100%' as const,
    gap: 20, // Increased from 16 for more spacing between rows
  },
  row: {
    flexDirection: 'row' as const,
    gap: 16,
    alignItems: 'flex-start' as const,
    justifyContent: 'flex-start' as const,
    width: '100%' as const,
    paddingVertical: 4, // Add vertical padding to each row
  },
  statItem: {
    flex: 1,
    flexDirection: 'column' as const,
    alignItems: 'flex-start' as const,
    justifyContent: 'flex-start' as const,
    minWidth: 0,
    minHeight: 0,
  },
  valueText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 38.4, // 1.2 * 32
    textAlign: 'center' as const,
    color: nucleus.light.global.blue["70"],
    textAlignVertical: 'center' as const,
  },
  unitText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    fontWeight: '700' as const,
    lineHeight: 19.2, // 1.2 * 16
    color: nucleus.light.global.blue["70"],
    includeFontPadding: false,
  },
  labelText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 18, // 1.5 * 12
    color: nucleus.light.semantic.fg.base,
    textAlign: 'left' as const,
  },
}; 