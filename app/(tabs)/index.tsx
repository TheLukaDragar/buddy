import { router } from "expo-router";
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { nucleus } from '../../Buddy_variables.js';
import Statistics from '../../components/Statistics';
import WorkoutItem, { WorkoutItemData } from '../../components/WorkoutItem';
import { useBuddyTheme } from '../../constants/BuddyTheme';
import { useAuth } from '../../contexts/AuthContext';
import type { RootState } from '../../store';
import { useAppSelector } from '../../store/hooks';
import { useIntro } from '../_layout';

export default function ExploreScreen() {
  const theme = useBuddyTheme();
  const { setShowIntro } = useIntro();
  const { user } = useAuth();
  
  // Get user profile data from Redux store
  const userProfile = useAppSelector((state: RootState) => (state as any).user?.extractedProfile);
  const onboardingCompleted = useAppSelector((state: RootState) => (state as any).user?.onboardingCompleted);
  
  // Function to generate personalized morning message
  const getPersonalizedGreeting = () => {
    const now = new Date();
    const hour = now.getHours();
    
    // Fallback for non-authenticated users
    if (!user) {
      return {
        greeting: 'Welcome,',
        message: 'Ready to start your fitness journey? 💪'
      };
    }
    
    // Get user's first name from email or metadata
    const userName = user?.user_metadata?.full_name?.split(' ')[0] || 
                    user?.email?.split('@')[0] || 
                    'there';
    
    // Time-based greeting
    let timeGreeting;
    if (hour < 5) {
      timeGreeting = 'Early start';
    } else if (hour < 12) {
      timeGreeting = 'Good morning';
    } else if (hour < 17) {
      timeGreeting = 'Good afternoon';
    } else if (hour < 21) {
      timeGreeting = 'Good evening';
    } else {
      timeGreeting = 'Good evening';
    }
    
    return {
      greeting: `${timeGreeting} ${userName},`,
      message: getMotivationalMessage(hour, userProfile)
    };
  };
  
  // Function to generate motivational message based on time and user profile
  const getMotivationalMessage = (hour: number, profile: string | null) => {
    const messages = {
      earlyMorning: [
        "Early bird gets the gains! 🌅",
        "Starting strong today! 💪",
        "Your dedication is inspiring! ✨"
      ],
      morning: [
        "Ready to crush your workout? 💪",
        "Your strength session awaits! 🔥",
        "Time to unlock your potential! ⚡",
        "Let's make today amazing! 🌟"
      ],
      afternoon: [
        "Perfect time for an energy boost! ⚡",
        "Afternoon power session? 💪",
        "Recharge with some movement! 🔋",
        "Your body will thank you! 🙌"
      ],
      evening: [
        "End the day strong! 🌟",
        "Perfect time to unwind with movement! 🧘",
        "Your evening routine awaits! ✨",
        "Release the day's stress! 💆"
      ]
    };
    
    let messageArray;
    if (hour < 6) {
      messageArray = messages.earlyMorning;
    } else if (hour < 12) {
      messageArray = messages.morning;
    } else if (hour < 17) {
      messageArray = messages.afternoon;
    } else {
      messageArray = messages.evening;
    }
    
    // If user has profile data, try to personalize further
    if (profile && onboardingCompleted) {
      // Simple keyword matching for personalization
      if (profile.toLowerCase().includes('strength') || profile.toLowerCase().includes('muscle')) {
        return hour < 12 ? "Time to build that strength! 💪" : "Perfect time for strength training! 🏋️";
      } else if (profile.toLowerCase().includes('cardio') || profile.toLowerCase().includes('running')) {
        return hour < 12 ? "Ready to get your heart pumping? ❤️" : "Cardio session calling your name! 🏃";
      } else if (profile.toLowerCase().includes('yoga') || profile.toLowerCase().includes('flexibility')) {
        return hour < 12 ? "Flow into your day with movement! 🧘" : "Time to stretch and unwind! 🤸";
      }
    }
    
    // Return random message from time-appropriate array
    return messageArray[Math.floor(Math.random() * messageArray.length)];
  };
  
  // Memoize the greeting so it doesn't change on re-renders (like week selection)
  const { greeting, message } = useMemo(() => {
    return getPersonalizedGreeting();
  }, [user?.email, user?.user_metadata?.full_name, userProfile, onboardingCompleted]);
  
  // Animation values
  const greetingOpacity = useSharedValue(0);
  const calendarOpacity = useSharedValue(0);
  const agendaOpacity = useSharedValue(0);
  const workoutOpacity = useSharedValue(0);
  const statsOpacity = useSharedValue(0);
  
  // Show the intro popup when the screen loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(true);
    }, 1000); // Show after 1 second delay

    return () => clearTimeout(timer);
  }, [setShowIntro]);

  // Start entrance animations
  useEffect(() => {
    const startAnimations = () => {
      // Staggered entrance animations
      greetingOpacity.value = withTiming(1, { duration: 600 });
      
      setTimeout(() => {
        calendarOpacity.value = withTiming(1, { duration: 600 });
      }, 200);
      
      setTimeout(() => {
        agendaOpacity.value = withTiming(1, { duration: 600 });
      }, 400);
      
      setTimeout(() => {
        workoutOpacity.value = withTiming(1, { duration: 600 });
      }, 600);
      
      setTimeout(() => {
        statsOpacity.value = withTiming(1, { duration: 600 });
      }, 800);
    };

    startAnimations();
  }, []);

  // Week calendar data
  const weeks = [1, 2, 3, 4, 5, 6, 7, 8];
  const completedWeeks = [1, 2]; // Completed weeks (exclude current week)

  // Helper function to format date as YYYY-MM-DD
  const formatDateForAPI = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Helper function to get date with offset
  const getDateWithOffset = (daysOffset: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return formatDateForAPI(date);
  };

  // Helper function to get week start date (Monday)
  const getWeekStartDate = (weekOffset: number): Date => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysToMonday = currentDay === 0 ? 6 : currentDay - 1; // Days to previous Monday
    
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysToMonday + (weekOffset * 7));
    return monday;
  };

  // Helper function to calculate current week based on today's date
  const getCurrentWeekNumber = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysToMonday = currentDay === 0 ? 6 : currentDay - 1; // Days to previous Monday
    
    // Get current week's Monday
    const currentWeekMonday = new Date(today);
    currentWeekMonday.setDate(today.getDate() - daysToMonday);
    
    // Check which week this Monday corresponds to in our 8-week plan
    for (let week = 0; week < 8; week++) {
      const weekStart = getWeekStartDate(week);
      if (weekStart.toDateString() === currentWeekMonday.toDateString()) {
        return week + 1; // Return 1-based week number
      }
    }
    
    // Default to week 1 if no match found
    return 1;
  };

  // Active week state
  const [activeWeek, setActiveWeek] = useState(getCurrentWeekNumber()); // Current week based on today's date

  // Generate 8-week workout plan
  const generateWorkoutPlan = () => {
    const workoutTypes = [
      { name: 'Abs & Core', duration: 45, exercises: 8, reps: 12 },
      { name: 'Legs & Glutes', duration: 50, exercises: 10, reps: 15 },
      { name: 'Upper Body', duration: 40, exercises: 8, reps: 12 },
      { name: 'Full Body', duration: 55, exercises: 12, reps: 10 },
      { name: 'Cardio HIIT', duration: 30, exercises: 6, reps: 20 },
      { name: 'Strength Training', duration: 60, exercises: 8, reps: 8 },
      { name: 'Yoga Flow', duration: 45, exercises: 15, reps: 5 },
      { name: 'Pilates', duration: 40, exercises: 10, reps: 10 }
    ];

    const allWorkouts: WorkoutItemData[] = [];
    let workoutId = 1;
    
    // Pick one random workout from first week to be completed (deterministic)
    const completedFirstWeekWorkout = 2; // Always mark the 3rd workout (Friday) as completed

    // Generate workouts for 8 weeks
    for (let week = 0; week < 8; week++) {
      const weekStart = getWeekStartDate(week);
      
      // Generate 3-4 workouts per week (Monday, Wednesday, Friday, Sunday)
      const workoutDays = [0, 2, 4, 6]; // Monday, Wednesday, Friday, Sunday
      
      workoutDays.forEach((dayOffset, dayIndex) => {
        const workoutDate = new Date(weekStart);
        workoutDate.setDate(weekStart.getDate() + dayOffset);
        
        // Show all workouts for all weeks (no filtering by future date)
        // This allows users to see their complete 8-week plan

        const workoutType = workoutTypes[(week * 4 + dayIndex) % workoutTypes.length];
        const today = new Date();
        const isToday = workoutDate.toDateString() === today.toDateString();
        const isPastWorkout = workoutDate < today && !isToday;
        
        // Only show progress for past workouts (not today or future)
        let progress = 0;
        let isCompleted = false;
        
        if (isPastWorkout) {
          // Past workouts are completed with 100% progress
          isCompleted = true;
          progress = 100;
        } else if (week === 0 && dayIndex === completedFirstWeekWorkout && !isToday) {
          // Mark one specific workout from first week as completed (Friday workout)
          isCompleted = true;
          progress = 100;
        }
        
        allWorkouts.push({
          id: workoutId.toString(),
          title: `${workoutType.name}`,
          date: formatDateForAPI(workoutDate),
          time: `${8 + (dayIndex * 2)}:00`, // 8:00, 10:00, 12:00, 14:00
          duration: workoutType.duration,
          exercises: workoutType.exercises,
          reps: workoutType.reps,
          isCompleted: isCompleted,
          progress: progress,
          weekNumber: week + 1,
          dayOfWeek: dayOffset
        });
        
        workoutId++;
      });
    }

    // Custom sort: Today's workout first, then chronological order
    return allWorkouts.sort((a, b) => {
      const today = new Date();
      const todayString = formatDateForAPI(today);
      
      const aIsToday = a.date === todayString;
      const bIsToday = b.date === todayString;
      
      // If one is today and the other isn't, today comes first
      if (aIsToday && !bIsToday) return -1;
      if (!aIsToday && bIsToday) return 1;
      
      // Otherwise, sort chronologically
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  };

  // Get workouts for current week
  const getCurrentWeekWorkouts = (weekNumber: number) => {
    const allWorkouts = generateWorkoutPlan();
    return allWorkouts.filter(workout => workout.weekNumber === weekNumber);
  };

  // Workout data for current week
  const workoutData = getCurrentWeekWorkouts(activeWeek);

  // Sample statistics data
  const statisticsData = {
    allTime: {
      completedWorkouts: 33,
      averageWorkoutTime: "1:02:21",
      totalLiftedWeight: 12204,
      burnedCalories: 5249
    },
    thisWeek: {
      completedWorkouts: 3,
      averageWorkoutTime: "0:45:12",
      totalLiftedWeight: 385,
      burnedCalories: 1247
    }
  };

  // Animated styles
  const greetingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: greetingOpacity.value,
    transform: [{ translateY: (1 - greetingOpacity.value) * 20 }]
  }));

  const calendarAnimatedStyle = useAnimatedStyle(() => ({
    opacity: calendarOpacity.value,
    transform: [{ translateY: (1 - calendarOpacity.value) * 30 }]
  }));

  const agendaAnimatedStyle = useAnimatedStyle(() => ({
    opacity: agendaOpacity.value,
    transform: [{ translateY: (1 - agendaOpacity.value) * 40 }]
  }));

  const workoutAnimatedStyle = useAnimatedStyle(() => ({
    opacity: workoutOpacity.value,
    transform: [{ translateY: (1 - workoutOpacity.value) * 50 }]
  }));

  const statsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
    transform: [{ translateY: (1 - statsOpacity.value) * 60 }]
  }));

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: nucleus.light.semantic.bg.subtle }]}>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting Section */}
        <Animated.View style={[styles.greetingContainer, greetingAnimatedStyle]}>
          <View style={styles.greetingContent}>
            <View style={styles.morningRow}>
              <Text onPress={() => router.push('/active_workout')} style={styles.morningText}>
                {greeting}
              </Text>
            </View>
            <View style={styles.messageRow}>
              <Text style={styles.messageText}>
                {message}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Week Calendar Section */}
        <Animated.View style={[styles.calendarContainer, calendarAnimatedStyle]}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.calendarScrollContent}
          >
            {weeks.map((week, index) => (
              <TouchableOpacity 
                key={index} 
                style={[
                  styles.weekContainer,
                  week === activeWeek ? styles.activeWeekContainer : 
                  completedWeeks.includes(week) ? styles.completedWeekContainer : null
                ]}
                onPress={() => {
                  setActiveWeek(week);
                  // Add haptic feedback or spring animation here if needed
                }}
              >
                <Text style={[
                  styles.calendarWeekLabel,
                  week === activeWeek ? styles.activeWeekLabel :
                  completedWeeks.includes(week) ? styles.completedWeekLabel :
                  styles.disabledWeekLabel
                ]}>
                  Week
                </Text>
                <Text style={[
                  styles.weekNumber,
                  week === activeWeek ? styles.activeWeekNumber :
                  completedWeeks.includes(week) ? styles.completedWeekNumber :
                  styles.disabledWeekNumber
                ]}>
                  {week}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Agenda Section */}
        <Animated.View style={[styles.agendaContainer, agendaAnimatedStyle]}>
          {/* Agenda Title */}
          <View style={styles.agendaTitleContainer}>
            <Text style={styles.agendaLabel}>Agenda</Text>
            <Text style={styles.agendaSeparator}>/</Text>
            <Text style={styles.agendaWeek}>Week {activeWeek}</Text>
          </View>

          {/* Workout Items */}
          <View style={styles.workoutItemsContainer}>
            {workoutData.map((workout, index) => {
              // Calculate workout number based on sorted position (chronological order)
              const chronologicalIndex = index;
              return (
                <WorkoutItem
                  key={workout.id}
                  workout={workout}
                  index={chronologicalIndex}
                  onPress={() => router.push('/workout')}
                />
              );
            })}
          </View>
        </Animated.View>

        {/* Activities Section */}
        {/* <View style={styles.sectionContainer}>
          <View style={styles.activitiesCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>Activities</Text>
            </View>
            <View style={styles.activitiesContent}>
              <View style={styles.chartContainer}>
                <View style={styles.circularChart}>
                  <View style={styles.outerRing}>
                    <View style={[styles.progressRing, styles.blueProgress]} />
                  </View>
                  <View style={styles.innerRing}>
                    <View style={[styles.progressRing, styles.yellowProgress]} />
                  </View>
                </View>
              </View>
              
              <View style={styles.statsContainer}>
                <View style={styles.statGroup}>
                  <Text style={styles.statLabel}>Current week fitness goal</Text>
                  <Text style={[styles.statValue, styles.yellowStat]}>1/3</Text>
                </View>
                <View style={styles.statGroup}>
                  <Text style={styles.statLabel}>Week fitness goal</Text>
                  <Text style={[styles.statValue, styles.blueStat]}>4/5</Text>
                </View>
              </View>
            </View>
          </View>
        </View>  */}

        {/* Today's Workout Section */}
        {/* <Animated.View style={[styles.sectionContainer, workoutAnimatedStyle]}>
          <Text style={styles.sectionHeading}>Today's workout</Text>
          <Pressable style={styles.workoutCard} onPress={() => router.push('/workout')}> */}
            {/* Workout Header */}
            {/* <View style={styles.workoutHeader}>
              <View style={styles.progressCircleContainer}>
                <View style={styles.progressCircle}>
                  <View style={styles.progressCircleInner} />
                </View>
                <Text style={styles.progressText}>0%</Text>
              </View>
              <View style={styles.workoutInfo}>
                <Text style={styles.weekLabel}>Week 2</Text>
                <Text style={styles.workoutTitle}>Tuesday's leg workout</Text>
                <View style={styles.workoutMeta}>
                  <Text style={styles.metaText}>45 min</Text>
                  <View style={styles.dot} />
                  <Text style={styles.metaText}>8 ex.</Text>
                  <View style={styles.dot} />
                  <Text style={styles.metaText}>8 rep</Text>
                </View>
              </View>
            </View> */}
            
            {/* Recommended Workout */}
            {/* <View style={styles.recommendedSection}>
              <View style={styles.recommendedCard}>
                <View style={styles.workoutThumbnail}>
                  <Image
                    source={require('../../assets/images/focused_flow.png')}
                    style={styles.thumbnailImage}
                    contentFit="cover"
                  />
                </View>
                <View style={styles.recommendedContent}>
                  <Text style={styles.recommendedTitle}>45 min focus flow</Text>
                  <Text style={styles.recommendedDescription}>
                    Based on your last workout Buddy recommends this over that so it will go easy on your knees and shoulders. ....
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        </Animated.View> */}

        {/* Badges Section */}
        {/* <View style={[styles.sectionContainer, { paddingTop: 200 }]}>
          <Text style={styles.sectionHeading}>Badges</Text>
          <View style={styles.badgesCard}>
            <View style={styles.badgeItem}>
              <View style={styles.badgeIcon}>
                <Image
                  source={require('../../assets/icons/home.svg')}
                  style={styles.badgeIconImage}
                  contentFit="contain"
                />
              </View>
              <Text style={styles.badgeLabel}>Consistency</Text>
            </View>
            <View style={styles.badgeItem}>
              <View style={[styles.badgeIcon, styles.activeBadgeIcon]}>
                <Text style={styles.badgeNumber}>💪</Text>
              </View>
              <Text style={styles.badgeLabel}>Strength</Text>
            </View>
            <View style={styles.badgeItem}>
              <View style={styles.badgeIcon}>
                <Image
                  source={require('../../assets/icons/user.svg')}
                  style={styles.badgeIconImage}
                  contentFit="contain"
                />
              </View>
              <Text style={styles.badgeLabel}>Personal</Text>
            </View>
          </View>
        </View> */}

        {/* Statistics Section */}
        <Animated.View style={[styles.sectionContainer, statsAnimatedStyle]}>
          <Statistics data={statisticsData} />
        </Animated.View>

        {/* Bottom padding for tab bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Extra space for custom tab bar
  },
  
  // Greeting Section
  greetingContainer: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 32,
  },
  greetingContent: {
    gap: 8,
  },
  morningRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  morningText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 19.2,
    letterSpacing: 0,
    color: nucleus.light.semantic.fg.muted,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28.8,
    letterSpacing: -1,
    color: nucleus.light.semantic.fg.base,
    width: 249,
  },
  emoji: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '700',
  },

  // Week Calendar Section
  calendarContainer: {
    marginBottom: 24,
  },
  calendarScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  weekContainer: {
    width: 63,
    height: 40,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: nucleus.light.global.white,
    paddingVertical: 7,
    paddingHorizontal: 0,
    gap: 2,
  },
  activeWeekContainer: {
    backgroundColor: nucleus.light.global.blue["50"],
  },
  completedWeekContainer: {
    backgroundColor: nucleus.light.global.brand["40"],
  },
  calendarWeekLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 12,
    color: nucleus.light.global.blue["30"],
    textAlign: 'center',
  },
  activeWeekLabel: {
    color: nucleus.light.global.white,
  },
  completedWeekLabel: {
    color: nucleus.light.global.green["60"],
  },
  disabledWeekLabel: {
    color: nucleus.light.global.blue["30"],
  },
  weekNumber: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 14,
    color: nucleus.light.global.blue["40"],
    textAlign: 'center',
  },
  activeWeekNumber: {
    color: nucleus.light.global.white,
  },
  completedWeekNumber: {
    color: nucleus.light.global.green["60"],
  },
  disabledWeekNumber: {
    color: nucleus.light.global.blue["40"],
  },

  // Agenda Section
  agendaContainer: {
    paddingHorizontal: 16,
    marginBottom: 32,
    gap: 16,
  },
  agendaTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  agendaLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 21.6,
    color: nucleus.light.semantic.fg.subtle,
  },
  agendaSeparator: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 21.6,
    color: nucleus.light.semantic.fg.subtle,
  },
  agendaWeek: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 21.6,
    color: nucleus.light.semantic.fg.base,
  },
  workoutItemsContainer: {
    gap: 16,
  },


  // Section Containers
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sectionHeading: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 21.6,
    color: nucleus.light.semantic.fg.base,
    marginBottom: 16,
  },

  // Activities Section
  activitiesCard: {
    backgroundColor: nucleus.light.semantic.bg.canvas,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 19.2,
    color: nucleus.light.semantic.fg.base,
  },
  activitiesContent: {
    flexDirection: 'row',
    paddingHorizontal: 28,
    paddingBottom: 16,
    alignItems: 'center',
    gap: 20,
  },
  chartContainer: {
    position: 'relative',
    width: 111,
    height: 111,
  },
  circularChart: {
    width: 111,
    height: 111,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: 111,
    height: 111,
    borderRadius: 55.5,
    borderWidth: 8,
    borderColor: '#E6E9EB',
  },
  innerRing: {
    position: 'absolute',
    width: 75,
    height: 75,
    borderRadius: 37.5,
    borderWidth: 6,
    borderColor: '#E6E9EB',
  },
  progressRing: {
    position: 'absolute',
    borderRadius: 50,
  },
  blueProgress: {
    width: 111,
    height: 111,
    borderWidth: 8,
    borderColor: 'transparent',
    borderTopColor: nucleus.light.global.blue["40"],
    borderRightColor: nucleus.light.global.blue["40"],
    borderBottomColor: nucleus.light.global.blue["40"],
    borderLeftColor: 'transparent',
    transform: [{ rotate: '-45deg' }],
  },
  yellowProgress: {
    width: 75,
    height: 75,
    borderWidth: 6,
    borderColor: 'transparent',
    borderTopColor: nucleus.light.semantic.accent.moderate,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    transform: [{ rotate: '0deg' }],
  },
  statsContainer: {
    flex: 1,
    paddingLeft: 20,
    gap: 16,
  },
  statGroup: {
    gap: 8,
  },
  statLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    color: nucleus.light.semantic.fg.base,
  },
  statValue: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28.8,
    letterSpacing: -1,
    textAlign: 'right',
  },
  yellowStat: {
    color: nucleus.light.global.brand["70"],
  },
  blueStat: {
    color: nucleus.light.global.blue["40"],
  },

  // Workout Section
  workoutCard: {
    backgroundColor: nucleus.light.semantic.bg.canvas,
    borderRadius: 16,
    overflow: 'hidden',
  },
  workoutHeader: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'flex-start',
    gap: 16,
  },
  progressCircleContainer: {
    position: 'relative',
    width: 40,
    height: 40,
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: nucleus.light.semantic.accent.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircleInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: nucleus.light.semantic.bg.canvas,
  },
  progressText: {
    position: 'absolute',
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    fontWeight: '700',
    color: nucleus.light.semantic.fg.base,
    textAlign: 'center',
    top: 14,
    left: 0,
    right: 0,
  },
  workoutInfo: {
    flex: 1,
    gap: 8,
  },
  weekLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14.4,
    color: nucleus.light.semantic.fg.disabled,
  },
  workoutTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 21.6,
    color: nucleus.light.semantic.fg.base,
  },
  agendaWorkoutTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 21.6,
    color: nucleus.light.semantic.fg.base,
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16.8,
    color: nucleus.light.global.green["80"],
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: nucleus.light.global.green["80"],
  },
  recommendedSection: {
    backgroundColor: nucleus.light.global.brand["50"],
    padding: 12,
  },
  recommendedCard: {
    backgroundColor: nucleus.light.semantic.bg.canvas,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
  },
  workoutThumbnail: {
    width: 85,
    height: 85,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  recommendedContent: {
    flex: 1,
    gap: 4,
  },
  recommendedTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16.8,
    color: nucleus.light.semantic.fg.base,
  },
  recommendedDescription: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    color: nucleus.light.semantic.fg.disabled,
  },

  // Badges Section
  badgesCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: nucleus.light.semantic.bg.canvas,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  badgeItem: {
    alignItems: 'center',
    gap: 8,
  },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: nucleus.light.global.grey["40"],
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBadgeIcon: {
    backgroundColor: nucleus.light.global.blue["40"],
  },
  badgeIconImage: {
    width: 24,
    height: 24,
  },
  badgeNumber: {
    fontSize: 24,
  },
  badgeLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    fontWeight: '400',
    color: nucleus.light.semantic.fg.base,
    textAlign: 'center',
  },

  // Bottom padding
  bottomPadding: {
    height: 40,
  },
});
