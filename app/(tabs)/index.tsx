import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { nucleus } from '../../Buddy_variables.js';
import Statistics from '../../components/Statistics';
import { supabase } from '../../lib/supabase';
import TrainNowCard, { PresetData } from '../../components/TrainNowCard';
import WorkoutItem, { WorkoutItemData } from '../../components/WorkoutItem';
import { useBuddyTheme } from '../../constants/BuddyTheme';
import { useAuth } from '../../contexts/AuthContext';
import type { RootState } from '../../store';
import { useGetUserWorkoutPlansQuery, useGetWorkoutPlanByWeekQuery, useGetWorkoutPresetsWithCountsQuery } from '../../store/api/enhancedApi';
import { useAppSelector } from '../../store/hooks';
import { getDayNameImage } from '../../utils';
import { useIntro } from '../_layout';

export default function ExploreScreen() {
  console.log('🏠 [MAIN] ExploreScreen component rendering');
  const theme = useBuddyTheme();
  const { setShowIntro } = useIntro();
  const { user } = useAuth();
  console.log('🏠 [MAIN] User:', user?.id || 'null');

  // Get user profile data from Redux store
  const userProfile = useAppSelector((state: RootState) => (state as any).user?.extractedProfile);
  console.log('🏠 [MAIN] User profile:', userProfile ? 'exists' : 'null');

  // Fetch real workout plans from database
  console.log('🏠 [MAIN] Fetching workout plans for user:', user?.id || 'null');
  const { data: workoutPlansData, isLoading: isLoadingWorkoutPlans, isFetching: isFetchingWorkoutPlans, refetch: refetchWorkoutPlans } = useGetUserWorkoutPlansQuery(
    { userId: user?.id || '' },
    { skip: !user?.id }
  );
  console.log('🏠 [MAIN] Workout plans - isLoading:', isLoadingWorkoutPlans, 'isFetching:', isFetchingWorkoutPlans, 'hasData:', !!workoutPlansData);
  
  const userWorkoutPlans = workoutPlansData?.workout_plansCollection?.edges?.map(edge => edge.node) || [];
  const activeWorkoutPlan = userWorkoutPlans.find(plan => plan.status === 'active');
  console.log('🏠 [MAIN] Active workout plan:', activeWorkoutPlan?.id || 'none');
  
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
    if (profile) {
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
  // Only recalculate when user identity or plan status changes, NOT when loading states change
  const { greeting, message } = useMemo(() => {
    return getPersonalizedGreeting();
  }, [user?.email, user?.user_metadata?.full_name, userProfile, activeWorkoutPlan?.id]);
  
  // Animation values
  const greetingOpacity = useSharedValue(0);
  const calendarOpacity = useSharedValue(0);
  const agendaOpacity = useSharedValue(0);
  const workoutOpacity = useSharedValue(0);
  const statsOpacity = useSharedValue(0);
  
  // Show the intro popup when the screen loads
  useEffect(() => {
    console.log('🏠 [MAIN] Setting up intro popup timer');
    const timer = setTimeout(() => {
      console.log('🏠 [MAIN] Showing intro popup');
      setShowIntro(true);
    }, 1000); // Show after 1 second delay

    return () => {
      console.log('🏠 [MAIN] Cleaning up intro popup timer');
      clearTimeout(timer);
    };
  }, [setShowIntro]);

  // Start entrance animations
  useEffect(() => {
    console.log('🏠 [MAIN] Starting entrance animations');
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

  console.log('🏠 [MAIN] ExploreScreen render complete - rendering UI');
  // Week calendar data
  const weeks = [1, 2, 3, 4, 5, 6, 7, 8];

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

  // Helper function to calculate current week based on workout plan start date
  const getCurrentWeekNumber = () => {
    if (!activeWorkoutPlan?.start_date) {
      return 1; // Default to week 1 if no active plan
    }

    const today = new Date();
    const planStartDate = new Date(activeWorkoutPlan.start_date);

    // Calculate days since plan started
    const daysDiff = Math.floor((today.getTime() - planStartDate.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate week number (1-based, max 8 weeks)
    const weekNumber = Math.min(8, Math.max(1, Math.floor(daysDiff / 7) + 1));

    return weekNumber;
  };

  // Active week state - auto-select current week based on plan start date
  const [activeWeek, setActiveWeek] = useState(getCurrentWeekNumber());

  // Ref for week calendar ScrollView
  const weekScrollViewRef = useRef<ScrollView>(null);

  // Update active week when workout plan changes or component mounts
  useEffect(() => {
    const currentWeek = getCurrentWeekNumber();
    setActiveWeek(currentWeek);
  }, [activeWorkoutPlan?.id, activeWorkoutPlan?.start_date]);

  // Auto-scroll to active week
  useEffect(() => {
    if (weekScrollViewRef.current && activeWeek) {
      // Calculate scroll position
      // Each week container is 63px wide + 8px gap = 71px per week
      const weekWidth = 71;
      const scrollToX = (activeWeek - 1) * weekWidth;

      // Scroll to the active week with a slight delay to ensure layout is complete
      setTimeout(() => {
        weekScrollViewRef.current?.scrollTo({
          x: scrollToX,
          y: 0,
          animated: true
        });
      }, 300);
    }
  }, [activeWeek]);

  // Calculate completed weeks - all weeks before the current week are completed (green)
  const completedWeeks = useMemo(() => {
    const currentWeek = getCurrentWeekNumber();
    const completed: number[] = [];
    for (let i = 1; i < currentWeek; i++) {
      completed.push(i);
    }
    return completed;
  }, [activeWorkoutPlan?.start_date]);

  // Fetch detailed workout plan data for current week only (much more efficient!)
  const { data: workoutPlanData, isLoading: isLoadingWorkoutPlan, isFetching: isFetchingWorkoutPlan, refetch: refetchWorkoutPlan } = useGetWorkoutPlanByWeekQuery(
    {
      planId: activeWorkoutPlan?.id || '',
      weekNumber: activeWeek
    },
    { skip: !activeWorkoutPlan?.id }
  );

  // Convert real workout plan data to WorkoutItemData format (now much more efficient - only current week!)
  const convertRealWorkoutPlan = (workoutPlan: any): WorkoutItemData[] => {
    // Check if we have the workout plan data in the expected structure
    let planData = null;
    let entries = null;

    // Handle both possible data structures
    if (workoutPlan?.workout_plansCollection?.edges?.[0]?.node) {
      // Old structure: wrapped in workout_plansCollection
      planData = workoutPlan.workout_plansCollection.edges[0].node;
      entries = planData.workout_entriesCollection?.edges;
    } else if (workoutPlan?.workout_entriesCollection?.edges) {
      // New structure: direct workout plan object
      planData = workoutPlan;
      entries = workoutPlan.workout_entriesCollection.edges;
    }

    if (!entries || entries.length === 0) {
      console.log('No workout entries found in plan for current week');
      return [];
    }
    
    console.log(`Converting workout plan for week ${activeWeek} with ${entries.length} entries`);

    // Group workout entries by day_name and date (much simpler since we only have 1 week)
    const entriesByDay = new Map<string, any[]>();
    
    entries.forEach((edge: any) => {
      const entry = edge.node;
      // console.log('Processing entry1:', JSON.stringify(edge));
      
      // Simpler grouping key since we only have 1 week
      const dayKey = `${entry.day_name}-${entry.date}`;
      
      if (!entriesByDay.has(dayKey)) {
        entriesByDay.set(dayKey, []);
      }
      entriesByDay.get(dayKey)!.push(entry);
    });

    // Convert grouped entries to WorkoutItemData format
    const workouts: WorkoutItemData[] = [];
    
    entriesByDay.forEach((dayEntries, dayKey) => {
      const firstEntry = dayEntries[0];

      // Use EXACT day_name from database (Push, Pull, Legs)
      const workoutTitle = firstEntry.day_name;
      console.log(`Week ${firstEntry.week_number} - ${workoutTitle} (${firstEntry.day}) with ${dayEntries.length} exercises`);

      // Calculate total sets from all exercises in this day
      const totalSets = dayEntries.reduce((sum, entry) => sum + (entry.sets || 0), 0);
      const estimatedDuration = Math.max(30, Math.min(90, totalSets * 3.5)); // 30-90 min range

      // Map day names to numbers for dayOfWeek
      const dayMapping: { [key: string]: number } = {
        'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 
        'friday': 5, 'saturday': 6, 'sunday': 0
      };

      workouts.push({
        id: `workout-${dayKey}`, // Unique ID for the day's workout
        title: workoutTitle, // EXACT day_name: Push, Pull, Legs
        date: firstEntry.date, // EXACT date from database
        time: firstEntry.time || '08:00',
        duration: Math.round(estimatedDuration),
        exercises: dayEntries.length, // Number of different exercises this day
        reps: totalSets, // Total sets across all exercises
        isCompleted: false, // ✅ FIX: Never assume completion - let WorkoutItem check session data
        progress: 0, // ✅ FIX: Default to 0 - WorkoutItem will calculate from session
        weekNumber: firstEntry.week_number, // EXACT week_number from database
        dayOfWeek: dayMapping[firstEntry.day.toLowerCase()] || 1, // Convert day string to number
        image: getDayNameImage(workoutTitle) // Use appropriate dayname image based on workout title
      });
    });

    console.log(`Created ${workouts.length} workout days for week ${activeWeek}`);
    
    // Simple sorting by date (no need to sort by week since we only have 1 week)
    return workouts.sort((a: WorkoutItemData, b: WorkoutItemData) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  };

  // Generate fallback 8-week workout plan (when no real plan is available)
  const generateFallbackWorkoutPlan = () => {
    const workoutTypes = [
      { name: 'Abs', duration: 45, exercises: 8, reps: 8, image: getDayNameImage('Abs') },
      { name: 'Legs', duration: 45, exercises: 8, reps: 8, image: getDayNameImage('Legs') },
      { name: 'Full Body', duration: 45, exercises: 8, reps: 8, image: getDayNameImage('Full Body') }
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
          dayOfWeek: dayOffset,
          image: workoutType.image
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

  // Get the workout plan data (real or fallback)
  const getWorkoutPlanData = useMemo(() => {
    // Return null during loading to avoid showing empty state
    if (isLoadingWorkoutPlan || isFetchingWorkoutPlan || isLoadingWorkoutPlans || isFetchingWorkoutPlans) {
      return null;
    }

    // Use real workout plan data if available
    if (workoutPlanData?.workout_plansCollection?.edges?.[0]?.node) {
      const realPlan = workoutPlanData.workout_plansCollection.edges[0].node;
      return convertRealWorkoutPlan(realPlan);
    }

    // If we have a workout plan but no data for this week, return empty array
    if (activeWorkoutPlan?.id) {
      return [];
    }

    // No workout plan at all
    return [];
  }, [workoutPlanData, isLoadingWorkoutPlan, isFetchingWorkoutPlan, isLoadingWorkoutPlans, isFetchingWorkoutPlans, activeWorkoutPlan?.id]);

  // Get workouts for current week
  const getCurrentWeekWorkouts = (weekNumber: number) => {
    if (getWorkoutPlanData === null) {
      return null; // Still loading
    }
    return getWorkoutPlanData?.filter(workout => workout.weekNumber === weekNumber) || [];
  };

  // Workout data for current week
  const workoutData = getCurrentWeekWorkouts(activeWeek);

  // Pull to refresh handler
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchWorkoutPlans(),
        refetchWorkoutPlan()
      ]);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchWorkoutPlans, refetchWorkoutPlan]);

  // Fetch workout presets
  const { data: presetsData, isLoading: isLoadingPresets } = useGetWorkoutPresetsWithCountsQuery();

  // Transform preset data to PresetData format
  const presets: PresetData[] = useMemo(() => {
    if (!presetsData?.workout_presetsCollection?.edges) return [];

    return presetsData.workout_presetsCollection.edges.map((edge: any) => {
      const preset = edge.node;
      const entries = preset.workout_preset_entriesCollection?.edges || [];
      const exerciseCount = entries.length;
      const totalSets = entries.reduce((sum: number, e: any) => sum + (e.node.sets || 0), 0);

      return {
        id: preset.id,
        name: preset.name,
        description: preset.description,
        day_name: preset.day_name,
        image_key: preset.image_key,
        difficulty: preset.difficulty as 'easy' | 'medium' | 'hard',
        estimated_duration: preset.estimated_duration,
        exercise_count: exerciseCount,
        total_sets: totalSets
      };
    });
  }, [presetsData]);

  // Handle preset selection
  const handlePresetPress = async (preset: PresetData) => {
    console.log('Selected preset:', preset.name);

    // Check if user has an active workout plan
    if (!activeWorkoutPlan?.id) {
      console.error('No active workout plan found');
      // TODO: Show alert or prompt user to create a plan first
      return;
    }

    try {
      // Get today's date and day info
      const today = new Date();
      const dateString = today.toISOString().split('T')[0];

      // Calculate week number based on plan start date
      const planStartDate = new Date(activeWorkoutPlan.start_date);
      const daysDiff = Math.floor((today.getTime() - planStartDate.getTime()) / (1000 * 60 * 60 * 24));
      const weekNumber = Math.min(8, Math.max(1, Math.floor(daysDiff / 7) + 1));

      // Get day of week as weekday enum
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayOfWeek = dayNames[today.getDay()];

      console.log('Copying preset to plan:', {
        presetId: preset.id,
        planId: activeWorkoutPlan.id,
        date: dateString,
        weekNumber,
        dayOfWeek
      });

      // Call the RPC function to copy preset entries to user's plan
      const { data, error } = await supabase.rpc('copy_preset_to_plan', {
        p_preset_id: preset.id,
        p_workout_plan_id: activeWorkoutPlan.id,
        p_date: dateString,
        p_week_number: weekNumber,
        p_day: dayOfWeek
      });

      if (error) {
        console.error('Error copying preset:', error);
        // TODO: Show error alert
        return;
      }

      console.log('Preset copied successfully:', data);

      // Refetch workout data to show the new entries
      await refetchWorkoutPlan();

      // Navigate to the workout
      router.push({
        pathname: '/workout',
        params: {
          planId: activeWorkoutPlan.id,
          weekNumber: weekNumber.toString(),
          day: dayOfWeek,
          dayName: preset.day_name,
          date: dateString,
        }
      });
    } catch (err) {
      console.error('Failed to copy preset:', err);
      // TODO: Show error alert
    }
  };

  // Handle generate custom workout press
  const handleGeneratePress = () => {
    console.log('Generate custom workout pressed');
    router.push({
      pathname: '/(tabs)/chat',
      params: { mode: 'train_now' }
    });
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

  console.log('🏠 [MAIN] Rendering SafeAreaView');
  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: nucleus.light.semantic.bg.subtle }]}>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={nucleus.light.global.blue["50"]}
            colors={[nucleus.light.global.blue["50"]]}
          />
        }
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
            ref={weekScrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.calendarScrollContent}
          >
            {weeks.map((week, index) => {
              // During loading, assume we will have workout plans (prevent flickering)
              const isStillLoading = workoutData === null || isLoadingWorkoutPlans || isFetchingWorkoutPlans || isLoadingWorkoutPlan || isFetchingWorkoutPlan;
              const hasWorkoutPlans = isStillLoading ? true : (workoutData && Array.isArray(workoutData) && workoutData.length > 0);
              const isDisabled = !hasWorkoutPlans;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.weekContainer,
                    week === activeWeek && hasWorkoutPlans ? styles.activeWeekContainer :
                    completedWeeks.includes(week) && hasWorkoutPlans ? styles.completedWeekContainer :
                    isDisabled ? styles.disabledWeekContainer : null
                  ]}
                  onPress={() => {
                    if (!isDisabled) {
                      setActiveWeek(week);
                      // Add haptic feedback or spring animation here if needed
                    }
                  }}
                  disabled={isDisabled}
                >
                <Text style={[
                  styles.calendarWeekLabel,
                  week === activeWeek && hasWorkoutPlans ? styles.activeWeekLabel :
                  completedWeeks.includes(week) && hasWorkoutPlans ? styles.completedWeekLabel :
                  styles.disabledWeekLabel
                ]}>
                  Week
                </Text>
                <Text style={[
                  styles.weekNumber,
                  week === activeWeek && hasWorkoutPlans ? styles.activeWeekNumber :
                  completedWeeks.includes(week) && hasWorkoutPlans ? styles.completedWeekNumber :
                  styles.disabledWeekNumber
                ]}>
                  {week}
                </Text>
              </TouchableOpacity>
              );
            })}
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
            {/* Show loading state while fetching any data */}
            {(workoutData === null || isLoadingWorkoutPlans || isFetchingWorkoutPlans || isLoadingWorkoutPlan || isFetchingWorkoutPlan) ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={nucleus.light.global.blue["50"]} />
              </View>
            ) : workoutData && Array.isArray(workoutData) && workoutData.length > 0 ? (
              workoutData.map((workout, index) => {
                // Calculate workout number based on sorted position (chronological order)
                const chronologicalIndex = index;
                return (
                  <WorkoutItem
                    key={workout.id}
                    workout={workout}
                    index={chronologicalIndex}
                    planId={activeWorkoutPlan?.id}
                    onPress={() => router.push({
                      pathname: '/workout',
                      params: {
                        planId: activeWorkoutPlan?.id || '',
                        weekNumber: activeWeek.toString(),
                        day: workout.date ? new Date(workout.date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() : 'monday',
                        dayName: workout.title,
                        date: workout.date,
                      }
                    })}
                  />
                );
              })
            ) : (
              // Show message when no plans available
              <View style={styles.emptyStateContainer}>
                <View style={styles.emptyStateContent}>
                  <Text style={styles.emptyStateTitle}>No workout plans yet</Text>
                  <Text style={styles.emptyStateDescription}>
                    Your personalized workout plan will appear here once it's ready.
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Train Now Card - Shows preset workouts */}
          <TrainNowCard
            presets={presets}
            onPresetPress={handlePresetPress}
            onGeneratePress={handleGeneratePress}
            onViewAllPress={() => {
              // TODO: Navigate to full preset list screen
              console.log('View all presets');
            }}
            isLoading={isLoadingPresets}
          />
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
          <Statistics userId={user?.id} />
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
  disabledWeekContainer: {
    backgroundColor: nucleus.light.global.grey["20"],
    opacity: 0.8,
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

  // Workout Plan Status (keeping for reference but unused)
  workoutPlanStatusContainer: {
    marginBottom: 16,
  },
  statusIndicator: {
    backgroundColor: nucleus.light.global.blue["10"],
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: nucleus.light.global.blue["30"],
  },
  statusTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    color: nucleus.light.global.blue["80"],
    marginBottom: 8,
  },
  statusMessage: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: nucleus.light.global.blue["70"],
  },

  // Loading State Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },

  // Empty State Styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyStateContent: {
    alignItems: 'center',
    gap: 16,
    maxWidth: 280,
  },
  emptyStateTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
    color: nucleus.light.semantic.fg.base,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
    color: nucleus.light.semantic.fg.muted,
    textAlign: 'center',
  },

  // Bottom padding
  bottomPadding: {
    height: 40,
  },
});
