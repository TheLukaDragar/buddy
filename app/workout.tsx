import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { unwrapResult } from '@reduxjs/toolkit';
import { BlurView } from 'expo-blur';
import { Image } from "expo-image";
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import Animated, { Easing, Extrapolation, FadeIn, FadeOut, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { nucleus } from '../Buddy_variables';
import AddExerciseModal from '../components/AddExerciseModal';
import ExerciseAdjustModal from '../components/ExerciseAdjustModal';
import ExerciseCard from '../components/ExerciseCard';
import ExerciseInfoModal from '../components/ExerciseInfoModal';
import MusicModal from '../components/MusicModal';
import { Weekday } from '../graphql/generated';
import { selectWorkoutFromEntries } from '../store/actions/workoutActions';
import { enhancedApi, useAddWorkoutEntryMutation, useDeleteWorkoutEntryMutation, useGetWorkoutDayQuery } from '../store/api/enhancedApi';
import { useAppDispatch } from '../store/hooks';

const { width: SCREEN_WIDTH } = Dimensions.get('window');


const HEADER_HEIGHT = 250;
const HEADER_MIN_HEIGHT = 120;

// Workout timing constants
const SET_DURATION_SECONDS = 60; // ~60 seconds per set
const REST_DURATION_SECONDS = 90; // 90 seconds rest between sets

export default function WorkoutScreen() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showExerciseInfo, setShowExerciseInfo] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());
  const [isAdjustMode, setIsAdjustMode] = useState(false);
  const [showAdjustHint, setShowAdjustHint] = useState(false);
  const [showAlternativesModal, setShowAlternativesModal] = useState(false);
  const [selectedWorkoutEntryId, setSelectedWorkoutEntryId] = useState<string | null>(null);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [addWorkoutEntry, { isLoading: isAddingExercise }] = useAddWorkoutEntryMutation();
  const [deleteWorkoutEntry] = useDeleteWorkoutEntryMutation();
  const [newlyAddedExerciseId, setNewlyAddedExerciseId] = useState<string | null>(null);
  const [exerciseSlugMap, setExerciseSlugMap] = useState<Map<string, string>>(new Map());
  const [exerciseDataMap, setExerciseDataMap] = useState<Map<string, any>>(new Map());
  const [deletedExercise, setDeletedExercise] = useState<{
    id: string;
    exercise_id: string;
    sets: number;
    reps: string;
    weight: string | null;
    time: string | null;
    notes: string | null;
    streak_exercise_id: string;
    streak_exercise_notes: string | null;
    position: number;
  } | null>(null);
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const exerciseRefs = useRef<{ [key: string]: View | null }>({});
  const scrollY = useSharedValue(0);
  const adjustHintOpacity = useSharedValue(0);
  const adjustHintHeight = useSharedValue(0);
  const carouselRef = useRef<ICarouselInstance>(null);
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  // Get route parameters
  const { planId, weekNumber, day, dayName, date } = useLocalSearchParams<{
    planId: string;
    weekNumber: string;
    day: string;
    dayName: string;
    date: string;
  }>();

  // Fetch workout data - same query for both regular and Train Now workouts
  const { data: workoutData, isLoading, error, isFetching, refetch } = useGetWorkoutDayQuery({
    planId: planId || '',
    weekNumber: parseInt(weekNumber || '1'),
    day: (day as Weekday) || Weekday.Monday,
    dayName: dayName || undefined,
  }, {
    refetchOnMountOrArgChange: true
  });
  
  // Force refetch on component mount to ensure fresh data
  useEffect(() => {
    refetch();
  }, []); // Empty dependency array means this runs only once on mount

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
    };
  }, []);

  // Log when data changes
  useEffect(() => {
    console.log('Workout data updated:', {
      isLoading,
      isFetching,
      hasData: !!workoutData,
      entryCount: workoutData?.workout_plansCollection?.edges?.[0]?.node?.workout_entriesCollection?.edges?.length
    });
    
    // Log workout entry metadata (exercise_id is always fresh)
    // NOTE: entry.node.exercises?.name may be stale from nested cache - ExerciseCard fetches fresh data separately
    if (workoutData?.workout_plansCollection?.edges?.[0]?.node?.workout_entriesCollection?.edges) {
      const entries = workoutData.workout_plansCollection.edges[0].node.workout_entriesCollection.edges;
      console.log('Workout entries details:', entries.map((entry: any) => ({
        id: entry.node.id,
        exercise_id: entry.node.exercise_id, // Always fresh - ExerciseCard uses this to fetch fresh exercise data
        is_adjusted: entry.node.is_adjusted,
        adjustment_reason: entry.node.adjustment_reason,
        position: entry.node.position
      })));
    }
  }, [workoutData, isLoading, isFetching]);

  // Extract workout entries from the query response
  const allWorkoutEntries = workoutData?.workout_plansCollection?.edges?.[0]?.node?.workout_entriesCollection?.edges || [];
  
  // Filter to only show the most recent workout instance
  // This handles cases where multiple workouts exist for the same day (e.g., regenerated "Train Now")
  const workoutEntries = useMemo(() => {
    if (allWorkoutEntries.length === 0) return [];
    
    // Get all unique instance IDs and find the most recent one
    const instanceMap = new Map<string, { created_at: string; entries: typeof allWorkoutEntries }>();
    
    allWorkoutEntries.forEach((entry: any) => {
      const instanceId = entry.node.workout_instance_id;
      const createdAt = entry.node.created_at || new Date().toISOString();
      
      if (!instanceMap.has(instanceId)) {
        instanceMap.set(instanceId, { created_at: createdAt, entries: [] });
      }
      instanceMap.get(instanceId)!.entries.push(entry);
    });
    
    // Find the most recent instance (by created_at)
    let mostRecentInstance: typeof allWorkoutEntries = [];
    let mostRecentDate = '';
    
    instanceMap.forEach((value) => {
      if (value.created_at > mostRecentDate) {
        mostRecentDate = value.created_at;
        mostRecentInstance = value.entries;
      }
    });
    
    return mostRecentInstance;
  }, [allWorkoutEntries]);

  // Memoize exercise IDs to create stable dependency
  const exerciseIds = useMemo(() => {
    return workoutEntries.map(entry => entry.node.exercise_id).join(',');
  }, [workoutEntries]);

  // Fetch fresh exercise data to get correct slugs (avoids stale nested cache)
  useEffect(() => {
    if (workoutEntries.length === 0) {
      setExerciseSlugMap(new Map());
      return;
    }

    // Extract unique exercise IDs from workout entries
    const uniqueExerciseIds = [...new Set(workoutEntries.map(entry => entry.node.exercise_id))];
    
    // Fetch all exercises in parallel to get fresh data (NO FALLBACKS to nested cache)
    const fetchExercises = async () => {
      const slugMap = new Map<string, string>();
      const dataMap = new Map<string, any>();
      
      const exercisePromises = uniqueExerciseIds.map(async (exerciseId) => {
        const result = await dispatch(
          enhancedApi.endpoints.GetExerciseById.initiate({ id: exerciseId })
        ).unwrap();
        
        const exercise = result?.exercisesCollection?.edges?.[0]?.node;
        if (!exercise?.slug) {
          throw new Error(`Exercise ${exerciseId} missing slug`);
        }
        slugMap.set(exerciseId, exercise.slug);
        dataMap.set(exerciseId, exercise); // Store full exercise data
      });
      
      await Promise.all(exercisePromises);
      setExerciseSlugMap(slugMap);
      setExerciseDataMap(dataMap);
    };

    fetchExercises();
  }, [exerciseIds, dispatch]); // Re-fetch when exercise IDs change

  // Scroll to newly added exercise after data refetches
  useEffect(() => {
    if (newlyAddedExerciseId && workoutEntries.length > 0) {
      // Wait for layout to settle, then scroll to the exercise
      setTimeout(() => {
        const exerciseRef = exerciseRefs.current[newlyAddedExerciseId];
        if (exerciseRef && scrollViewRef.current) {
          exerciseRef.measureLayout(
            scrollViewRef.current as any,
            (x, y) => {
              scrollViewRef.current?.scrollTo({
                y: y - 100, // Offset to show some space above
                animated: true,
              });
              setNewlyAddedExerciseId(null); // Reset after scrolling
            },
            () => {
              // Fallback: scroll to end if measureLayout fails
              scrollViewRef.current?.scrollToEnd({ animated: true });
              setNewlyAddedExerciseId(null);
            }
          );
        } else {
          // Fallback: scroll to end if ref not found
          scrollViewRef.current?.scrollToEnd({ animated: true });
          setNewlyAddedExerciseId(null);
        }
      }, 300);
    }
  }, [newlyAddedExerciseId, workoutEntries.length]);

  // // Debug logging
  // console.log('Workout Data Debug:');
  //console.log('Raw workout data:', JSON.stringify(workoutData, null, 2));
   console.log('Workout entries count:', workoutEntries.length);
  console.log('All workout entries:', workoutEntries.map(entry => entry.node));
  // // console.log('First workout entry:', workoutEntries[0]?.node);
  // console.log('Workout entries:', JSON.stringify(workoutEntries, null, 2));

  // Create dynamic workout title: "Tuesday's Leg Workout" format
  const dayOfWeek = day ? day.charAt(0).toUpperCase() + day.slice(1) : 'Tuesday';
  const workoutType = workoutEntries.length > 0 ? workoutEntries[0].node.day_name : 'Workout';
  const dynamicWorkoutTitle = `${dayOfWeek}'s ${workoutType} Workout`;

  console.log('Day of week:', dayOfWeek);
  console.log('Workout type:', workoutType);
  console.log('Dynamic title:', dynamicWorkoutTitle);

  // Calculate total workout duration based on sets
  const totalSets = workoutEntries.reduce((sum, entry) => sum + entry.node.sets, 0);
  const totalWorkoutSeconds = (totalSets * SET_DURATION_SECONDS) + ((totalSets - 1) * REST_DURATION_SECONDS);
  const totalWorkoutMinutes = Math.round(totalWorkoutSeconds / 60);

  console.log('Total sets:', totalSets);
  console.log('Total workout minutes:', totalWorkoutMinutes);

  // Extract unique equipment from all exercises using FRESH exercise data (NO FALLBACKS to nested cache)
  // Keep track of all unique equipment items across all exercises
  const allEquipmentItems = workoutEntries.flatMap(entry => {
    // Use fresh exercise data from map, not nested cache
    const exercise = exerciseDataMap.get(entry.node.exercise_id);
    const equipmentGroups = exercise?.equipment_groups;
    
    // Parse equipment_groups if it's a string (JSON from database)
    let groups = [];
    if (typeof equipmentGroups === 'string') {
      try {
        const parsed = JSON.parse(equipmentGroups);
        groups = parsed.groups || [];
      } catch (e) {
        console.error('Failed to parse equipment_groups:', e);
        groups = [];
      }
    } else if (equipmentGroups && typeof equipmentGroups === 'object') {
      groups = equipmentGroups.groups || [];
    }
    
    // Flatten all equipment from all groups
    return groups.flat();
  });
  console.log('All equipment items:', allEquipmentItems);
  const uniqueEquipment = [...new Set(allEquipmentItems)];
  console.log('Unique equipment:', uniqueEquipment);
  // Convert slugs to readable names (capitalize and replace hyphens with spaces)
  const uniqueEquipmentReadable = uniqueEquipment.map((slug: string) => 
    slug.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  );

  console.log('Equipment groups from fresh data:', workoutEntries.map(e => {
    const exercise = exerciseDataMap.get(e.node.exercise_id);
    return exercise?.equipment_groups;
  }));
  console.log('Unique equipment slugs:', uniqueEquipment);
  console.log('Unique equipment readable:', uniqueEquipmentReadable);

  // Extract exercise slugs and create thumbnail URLs using fresh exercise data (memoized to prevent re-renders)
  const { exerciseSlugs, thumbnailUrls } = useMemo(() => {
    // Use ONLY fresh slugs from exerciseSlugMap - no fallback to nested cache
    const slugs = workoutEntries
      .map(entry => exerciseSlugMap.get(entry.node.exercise_id))
      .filter(Boolean) as string[];

    const urls = slugs.map(slug =>
      `https://kmtddcpdqkeqipyetwjs.supabase.co/storage/v1/object/public/workouts/processed/${slug}/${slug}_cropped_thumbnail_low.jpg`
    );

    return { exerciseSlugs: slugs, thumbnailUrls: urls };
  }, [workoutEntries, exerciseSlugMap]);

  console.log('Exercise slugs:', exerciseSlugs);
  console.log('Thumbnail URLs:', thumbnailUrls);

  // Get valid thumbnail URLs, skipping failed ones (memoized to prevent flickering)
  const validThumbnailUrls = useMemo(() =>
    thumbnailUrls.filter(url => !failedUrls.has(url)),
    [thumbnailUrls, failedUrls]
  );

  // Preload all thumbnail images for faster loading (only once when URLs change)
  useEffect(() => {
    if (thumbnailUrls.length > 0) {
      thumbnailUrls.forEach(url => {
        if (!failedUrls.has(url)) {
          Image.prefetch(url).catch(() => {
            console.log('Failed to prefetch image:', url);
            setFailedUrls(prev => new Set(prev).add(url));
          });
        }
      });
    }
  }, [thumbnailUrls.join(',')]);

  // Auto-play carousel every 3 seconds
  useEffect(() => {
    const validCount = validThumbnailUrls.length;
    if (validCount <= 1) return; // Don't auto-play if only one or no images

    const interval = setInterval(() => {
      carouselRef.current?.next();
    }, 3000);

    return () => clearInterval(interval);
  }, [validThumbnailUrls.length]);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT - HEADER_MIN_HEIGHT],
      [HEADER_HEIGHT, HEADER_MIN_HEIGHT],
      Extrapolation.CLAMP
    );

    return {
      height,
    };
  });

  const carouselAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT - HEADER_MIN_HEIGHT],
      [1, 0],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT - HEADER_MIN_HEIGHT],
      [0, -50],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    const top = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT - HEADER_MIN_HEIGHT],
      [50, 35],
      Extrapolation.CLAMP
    );

    return {
      top,
    };
  });

  // Animate adjust mode hint appearance
  useEffect(() => {
    if (isAdjustMode) {
      adjustHintOpacity.value = withTiming(1, { duration: 200 });
    } else {
      adjustHintOpacity.value = withTiming(0, { duration: 200 });
              // Clear deleted exercise when exiting adjust mode
              if (deletedExercise) {
                if (undoTimeoutRef.current) {
                  clearTimeout(undoTimeoutRef.current);
                  undoTimeoutRef.current = null;
                }
                setDeletedExercise(null);
              }
    }
  }, [isAdjustMode]);

  const adjustHintAnimatedStyle = useAnimatedStyle(() => {
    const opacity = adjustHintOpacity.value;
    const translateY = interpolate(opacity, [0, 1], [5, 0], Extrapolation.CLAMP);
    const scale = interpolate(opacity, [0, 1], [0.98, 1], Extrapolation.CLAMP);
    
    return {
      opacity,
      transform: [{ translateY }, { scale }],
      pointerEvents: opacity > 0.5 ? 'auto' : 'none',
    };
  });

  const moods = [
    { 
      id: 'energetic', 
      icon: require('../assets/icons/flash.svg'),
      iconSelected: require('../assets/icons/flash-energetic.svg'),
      label: 'Energetic',
      backgroundColor: nucleus.light.global.brand[40],
      borderColor: nucleus.light.global.brand[70],
      iconColor: nucleus.light.global.brand[90]
    },
    { 
      id: 'happy', 
      icon: require('../assets/icons/heart.svg'),
      iconSelected: require('../assets/icons/heart-happy.svg'),
      label: 'Happy',
      backgroundColor: nucleus.light.global.blue[20],
      borderColor: nucleus.light.global.blue[40],
      iconColor: nucleus.light.global.blue[90]
    },
    { 
      id: 'calm', 
      icon: require('../assets/icons/face.svg'),
      iconSelected: require('../assets/icons/face-calm.svg'),
      label: 'Calm',
      backgroundColor: nucleus.light.global.green[20],
      borderColor: nucleus.light.global.green[40],
      iconColor: nucleus.light.global.green[90]
    },
    { 
      id: 'tired', 
      icon: require('../assets/icons/tired.svg'),
      iconSelected: require('../assets/icons/tired-blue.svg'),
      label: 'Tired',
      backgroundColor: nucleus.light.global.orange[20],
      borderColor: nucleus.light.global.orange[40],
      iconColor: nucleus.light.global.orange[90]
    },
  ];

  // Helper function to get equipment icon based on slug
  const getEquipmentIcon = (slug: string) => {
    const iconMap: { [key: string]: any } = {
      'back-extension-machine': require('../assets/equipment_icons/back-extension-machine.png'),
      'barbell': require('../assets/equipment_icons/barbell.png'),
      'barbells': require('../assets/equipment_icons/barbell.png'),
      'bench': require('../assets/equipment_icons/bench.png'),
      'body-weight': require('../assets/equipment_icons/body-weight.png'),
      'cable': require('../assets/equipment_icons/cable.png'),
      'cables': require('../assets/equipment_icons/cable.png'),
      'calf-raise-machine': require('../assets/equipment_icons/calf-raise-machine.png'),
      'chair': require('../assets/equipment_icons/chair.png'),
      'chairs': require('../assets/equipment_icons/chair.png'),
      'chest-fly-machine': require('../assets/equipment_icons/chest-fly-machine.png'),
      'decline-bench-press': require('../assets/equipment_icons/decline-bench-press.png'),
      'decline-bench': require('../assets/equipment_icons/decline-bench.png'),
      'dips-machine': require('../assets/equipment_icons/dips-machine.png'),
      'door-frame': require('../assets/equipment_icons/door-frame.png'),
      'dumbbell': require('../assets/equipment_icons/dumbbell.png'),
      'dumbbells': require('../assets/equipment_icons/dumbbell.png'),
      'ez-bar': require('../assets/equipment_icons/ez-bar.png'),
      'ez-bars': require('../assets/equipment_icons/ez-bar.png'),
      'filled-bag': require('../assets/equipment_icons/filled-bag.png'),
      'filled-bags': require('../assets/equipment_icons/filled-bag.png'),
      'hack-squat-machine': require('../assets/equipment_icons/hack-squat-machine.png'),
      'incline-bench-press': require('../assets/equipment_icons/incline-bench-press.png'),
      'incline-bench': require('../assets/equipment_icons/incline-bench.png'),
      'incline-chest-press-machine': require('../assets/equipment_icons/incline-chest-press-machine.png'),
      'kettlebell': require('../assets/equipment_icons/kettlebell.png'),
      'kettlebells': require('../assets/equipment_icons/kettlebell.png'),
      'knee-extension-machine': require('../assets/equipment_icons/knee-extension-machine.png'),
      'knee-flexion-machine': require('../assets/equipment_icons/knee-flexion-machine.png'),
      'leg-press': require('../assets/equipment_icons/leg-press.png'),
      'pull-up-bar': require('../assets/equipment_icons/pull-up-bar.png'),
      'pull-up-bars': require('../assets/equipment_icons/pull-up-bar.png'),
      'pull-up-machine': require('../assets/equipment_icons/pull-up-machine.png'),
      'resistance-band': require('../assets/equipment_icons/resistance-band.png'),
      'resistance-bands': require('../assets/equipment_icons/resistance-band.png'),
      'seated-calf-raise-machine': require('../assets/equipment_icons/seated-calf-raise-machine.png'),
      'shoulder-abduction-machine': require('../assets/equipment_icons/shoulder-abduction-machine.png'),
      'shoulder-press-machine': require('../assets/equipment_icons/shoulder-press-machine.png'),
      'sliders': require('../assets/equipment_icons/sliders.png'),
      'smith-machine': require('../assets/equipment_icons/smith-machine.png'),
      'squat-rack': require('../assets/equipment_icons/squat-rack.png'),
      'squat-racks': require('../assets/equipment_icons/squat-rack.png'),
      'suspension-trainer': require('../assets/equipment_icons/suspension-trainer.png'),
      'suspension-trainers': require('../assets/equipment_icons/suspension-trainer.png'),
      'swiss-ball': require('../assets/equipment_icons/swiss-ball.png'),
      'swiss-balls': require('../assets/equipment_icons/swiss-ball.png'),
      'towel': require('../assets/equipment_icons/towel.png'),
      'towels': require('../assets/equipment_icons/towel.png'),
      'trap-bar': require('../assets/equipment_icons/trap-bar.png'),
      'trap-bars': require('../assets/equipment_icons/trap-bar.png'),
      'weight-plate': require('../assets/equipment_icons/weight-plate.png'),
      'weight-plates': require('../assets/equipment_icons/weight-plate.png'),
    };
    
    // Try exact match first
    if (iconMap[slug]) {
      return iconMap[slug];
    }
    
    // Try with 's' added for plural
    const pluralSlug = slug + 's';
    if (iconMap[pluralSlug]) {
      return iconMap[pluralSlug];
    }
    
    // Try removing 's' for singular (in case slug is already plural)
    const singularSlug = slug.endsWith('s') ? slug.slice(0, -1) : slug;
    if (iconMap[singularSlug]) {
      return iconMap[singularSlug];
    }
    
    // Default fallback
    return require('../assets/equipment_icons/body-weight.png');
  };

  // Create equipment array from dynamic data
  const equipment = uniqueEquipmentReadable.map((equipmentName, index) => ({
    id: index + 1,
    name: equipmentName,
    slug: uniqueEquipment[index], // Keep the slug for reference
    image: getEquipmentIcon(uniqueEquipment[index]), // Match icon based on slug
  }));

  // Create exercises summary from dynamic data with thumbnail URLs and equipment groups
  // Use ONLY fresh exercise data from map (NO FALLBACKS to nested cache)
  const exercises = useMemo(() => {
    // Wait for exercise data to be loaded - return empty array if not ready
    if (workoutEntries.length === 0 || exerciseDataMap.size === 0 || exerciseDataMap.size < workoutEntries.length) {
      return [];
    }
    
    return workoutEntries.map((entry, index) => {
      // Get fresh exercise data from map
      const exercise = exerciseDataMap.get(entry.node.exercise_id);
      if (!exercise) {
        // Don't throw error, just skip this exercise if data isn't ready yet
        console.warn(`Missing fresh exercise data for ${entry.node.exercise_id}, skipping`);
        return null;
      }
    
    // Get fresh slug from map
    const slug = exerciseSlugMap.get(entry.node.exercise_id);
    const thumbnailUrl = slug 
      ? `https://kmtddcpdqkeqipyetwjs.supabase.co/storage/v1/object/public/workouts/processed/${slug}/${slug}_cropped_thumbnail_low.jpg`
      : null;
    
    // Clean up exercise name by removing ALL parentheses and their contents
    const cleanName = exercise.name?.replace(/\s*\([^)]*\)/g, '').trim() || '';

    // Parse equipment groups for this exercise using fresh data
    const equipmentGroups = exercise.equipment_groups;
    let parsedGroups: string[][] = [];
    if (typeof equipmentGroups === 'string') {
      try {
        const parsed = JSON.parse(equipmentGroups);
        parsedGroups = parsed.groups || [];
      } catch (e) {
        console.error('Failed to parse equipment_groups:', e);
      }
    } else if (equipmentGroups && typeof equipmentGroups === 'object') {
      parsedGroups = equipmentGroups.groups || [];
    }

      return {
        id: index + 1,
        name: cleanName,
        sets: `${entry.node.sets} sets`,
        muscles: exercise.muscle_categories?.join(', ') || '', 
        description: exercise.instructions || 'Exercise instructions',
        thumbnailUrl: thumbnailUrl,
        slug: slug,
        equipmentGroups: parsedGroups, // [[item1, item2], [item3]] means (item1 OR item2) AND item3
      };
    }).filter((ex): ex is NonNullable<typeof ex> => ex !== null); // Filter out null entries
  }, [workoutEntries, exerciseDataMap, exerciseSlugMap]);



  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor: nucleus.light.semantic.bg.subtle }]}>
        <SystemBars style="dark" />

        
        {/* Collapsible Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <Animated.View style={[styles.headerImageContainer, carouselAnimatedStyle]}>
            {validThumbnailUrls.length > 0 ? (
              <Carousel
                ref={carouselRef}
                loop
                width={SCREEN_WIDTH}
                height={HEADER_HEIGHT}
                autoPlay={false}
                data={validThumbnailUrls}
                scrollAnimationDuration={600}
                mode="parallax"
                modeConfig={{
                  parallaxScrollingScale: 1,
                  parallaxScrollingOffset: 0,
                }}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item }}
                    style={styles.headerImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    priority="high"
                    onError={() => {
                      console.log('Failed to load thumbnail:', item);
                      setFailedUrls(prev => new Set(prev).add(item));
                    }}
                  />
                )}
              />
            ) : (
              <View style={[styles.headerImage, { backgroundColor: 'transparent' }]} />
            )}
          </Animated.View>
                     <Animated.View style={[styles.headerBackButton, buttonAnimatedStyle]}>
             <TouchableOpacity
               onPress={() => router.back()}
               style={styles.headerButton}
             >
               <Image
                 source={require('../assets/icons/back.svg')}
                 style={styles.headerBackIcon}
                 contentFit="contain"
               />
             </TouchableOpacity>
           </Animated.View>
           
           <Animated.View style={[styles.headerShareButton, buttonAnimatedStyle]}>
             <TouchableOpacity
               onPress={() => console.log('Share pressed')}
               style={styles.headerButton}
             >
               <Image
                 source={require('../assets/icons/share.svg')}
                 style={styles.headerShareIcon}
                 contentFit="contain"
               />
             </TouchableOpacity>
           </Animated.View>
        </Animated.View>

        <Animated.ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={[styles.scrollContent, { paddingTop: 0 }]}
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
         <View style={styles.contentContainer}>
         <View style={styles.summaryContainer}>
          {!isLoading && (
            <Animated.View 
              entering={FadeIn.duration(400).delay(100).easing(Easing.out(Easing.quad))}
              style={{ alignSelf: 'stretch' }}
            >
              <Text style={styles.weekNumber}>Week {weekNumber}</Text>
            </Animated.View>
          )}
          {!isLoading && (
            <Animated.View 
              entering={FadeIn.duration(400).delay(150).easing(Easing.out(Easing.quad))}
              style={{ alignSelf: 'stretch' }}
            >
              <Text style={styles.workoutTitle}>{dynamicWorkoutTitle}</Text>
            </Animated.View>
          )}
          {!isLoading && (
            <Animated.View 
              entering={FadeIn.duration(400).delay(200).easing(Easing.out(Easing.quad))}
              style={{ alignSelf: 'stretch' }}
            >
              <Text style={styles.workoutDescription}>
                Based on your last workout Buddy recommends this over that so it will go easy on your knees and  right ankle. 
              </Text>
            </Animated.View>
          )}

          {!isLoading && (
            <Animated.View 
              entering={FadeIn.duration(400).delay(250).easing(Easing.out(Easing.quad))}
            >
              <View style={styles.elementwith_icon}>
                <Image source={require('../assets/icons/clock.svg')} style={styles.icon} />
                <Text style={styles.elementText}>
                  {totalWorkoutMinutes} min
                </Text>
              </View>
            </Animated.View>
          )}

          {!isLoading && (
            <Animated.View 
              entering={FadeIn.duration(400).delay(300).easing(Easing.out(Easing.quad))}
            >
              <View style={styles.elementwith_icon}>
                <Image source={require('../assets/icons/equipment.svg')} style={styles.icon} />
                <Text style={styles.elementText}>
                  {workoutEntries.length} exercises
                </Text>
              </View>
            </Animated.View>
          )}

          {!isLoading && (
            <Animated.View 
              entering={FadeIn.duration(400).delay(350).easing(Easing.out(Easing.quad))}
            >
              <View style={styles.elementwith_icon}>
                <Image source={require('../assets/icons/music.svg')} style={styles.icon} />
                <Text style={styles.elementText}>
                  Rhythmic
                </Text>
              </View>
            </Animated.View>
          )}
          
         </View>        

         <View style={styles.userMood}>
          {!isLoading && (
            <Animated.View 
              entering={FadeIn.duration(400).delay(400).easing(Easing.out(Easing.quad))}
            >
              <View style={styles.moodContainer}>
                <Text style={styles.moodTitle}>
                  How are you feeling today?
                </Text>
                <Text style={styles.moodSubtitle}>
                  Your mood helps me adjust the workout intensity and coaching style. 
                </Text>
              </View>
            </Animated.View>
          )}
          {!isLoading && (
            <Animated.View 
              entering={FadeIn.duration(400).delay(450).easing(Easing.out(Easing.quad))}
              style={{ alignSelf: 'stretch' }}
            >
              <View style={styles.moodIconsContainer}>
                {moods.map((mood, index) => {
                  const isSelected = selectedMood === mood.id;
                  return (
                    <Animated.View
                      key={mood.id}
                      entering={FadeIn.duration(400).delay(500 + index * 50).easing(Easing.out(Easing.quad))}
                      style={{ flex: 1 }}
                    >
                      <View style={styles.moodIconItem}>
                        <View style={[
                          styles.moodIconWrapper,
                          isSelected && {
                            borderRadius: 40,
                            borderWidth: 2,
                            borderColor: mood.borderColor,
                          }
                        ]}>
                          <TouchableOpacity 
                            style={[
                              styles.moodIconCircle,
                              isSelected && {
                                backgroundColor: mood.backgroundColor,
                              }
                            ]}
                            onPress={() => setSelectedMood(mood.id)}
                          >
                            <Image 
                              source={isSelected ? mood.iconSelected : mood.icon} 
                              contentFit="contain" 
                              style={styles.moodIconDeactive} 
                            />
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.moodIconText}>
                          {mood.label}
                        </Text>
                      </View>
                    </Animated.View>
                  );
                })}
              </View>
            </Animated.View>
          )}
         </View>

        

          {/* Summary Section */}
          <View style={styles.summaryExerciseSection}>

          
            
            <View style={styles.summaryExerciseHeader}>
              {!isLoading && (
                <Animated.View 
                  entering={FadeIn.duration(400).delay(400).easing(Easing.out(Easing.quad))}
                >
                  <Text style={styles.summaryExerciseTitle}>Exercises</Text>
                </Animated.View>
              )}

             
              
              {/* <TouchableOpacity 
                style={styles.summaryChevron}
                onPress={() => {
                  console.log('Summary chevron pressed');
                  router.push('/exercises');
                }}
              > */}
                {/* <Image
                  source={require('../assets/icons/back.svg')}
                  style={styles.chevronIcon}
                  contentFit="contain"
                /> */}
              {/* </TouchableOpacity> */}
            </View>
            
            
            <View style={styles.exerciseList}>
              {workoutEntries.map((entry) => {
                const handleExercisePress = (exerciseData: any) => {
                  // If in adjust mode, show alternatives modal
                  if (isAdjustMode) {
                    setSelectedWorkoutEntryId(entry.node.id);
                    setShowAlternativesModal(true);
                    return;
                  }

                  // Normal info mode - use fresh exercise data from ExerciseCard
                  if (exerciseData) {
                    const cleanName = exerciseData.name.replace(/\s*\([^)]*\)/g, '').trim();
                    
                    // Parse instructions: split by numbered markers and remove them
                    let instructionsParts: string[] = [];
                    if (exerciseData.instructions) {
                      // Split by numbered markers like (1st), (2nd), (3rd), etc.
                      const parts = exerciseData.instructions.split(/(?=\(\d+(?:st|nd|rd|th)\))/).filter(Boolean);
                      instructionsParts = parts.map((s: string) => {
                        // Remove the numbered marker (1st), (2nd), etc. and trim
                        return s.replace(/^\(\d+(?:st|nd|rd|th)\)\s*/i, '').trim();
                      }).filter(Boolean);
                    }
                    
                    const keyFormTipsSection = instructionsParts.find((s: string) => s.includes('Key Form Tips'));
                    const keyFormTips = keyFormTipsSection ?
                      keyFormTipsSection.replace(/.*Key Form Tips:\s*/, '').split(/[;,]/).map((tip: string) => tip.trim()).filter(Boolean) :
                      ["Follow the form shown in the video", "Start with lighter weights if needed", "Focus on controlled movements"];

                    // Parse equipment groups
                    const equipmentGroups = exerciseData.equipment_groups;
                    let parsedGroups: string[][] = [];
                    if (typeof equipmentGroups === 'string') {
                      try {
                        const parsed = JSON.parse(equipmentGroups);
                        parsedGroups = parsed.groups || [];
                      } catch (e) {
                        console.error('Failed to parse equipment_groups for modal:', e);
                      }
                    } else if (equipmentGroups && typeof equipmentGroups === 'object') {
                      parsedGroups = equipmentGroups.groups || [];
                    }

                    const modalExerciseData = {
                      name: cleanName,
                      slug: exerciseData.slug,
                      id: exerciseData.id,
                      instructions: instructionsParts.filter((s: string) => !s.includes('Key Form Tips')),
                      tips: keyFormTips,
                      videoUrl: exerciseData.slug ? `https://kmtddcpdqkeqipyetwjs.supabase.co/storage/v1/object/public/workouts/processed/${exerciseData.slug}/${exerciseData.slug}_cropped_video.mp4` : undefined,
                      equipment: parsedGroups.flat().map((slug: string) => 
                        slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                      ),
                      equipmentGroups: parsedGroups,
                      category: "How to"
                    };
                    setSelectedExercise(modalExerciseData);
                    setShowExerciseInfo(true);
                  }
                };

                return (
                  <Animated.View
                    key={entry.node.id}
                    style={styles.exerciseCardWrapper}
                    entering={FadeIn.duration(300)}
                  >
                    <View
                      ref={(ref) => {
                        if (ref) {
                          exerciseRefs.current[entry.node.id] = ref;
                        }
                      }}
                      style={{ width: '100%' }}
                    >
                      <ExerciseCard
                      workoutEntry={{
                        id: entry.node.id,
                        exercise_id: entry.node.exercise_id,
                        sets: entry.node.sets,
                        reps: entry.node.reps,
                        weight: entry.node.weight,
                        time: entry.node.time,
                        notes: entry.node.notes,
                      }}
                      onPress={handleExercisePress}
                      getEquipmentIcon={getEquipmentIcon}
                      isAdjustMode={isAdjustMode}
                      onRemove={async () => {
                        const entryToDelete = entry.node;
                        
                        // Store exercise data for undo
                        setDeletedExercise({
                          id: entryToDelete.id,
                          exercise_id: entryToDelete.exercise_id,
                          sets: entryToDelete.sets,
                          reps: entryToDelete.reps,
                          weight: entryToDelete.weight ?? null,
                          time: entryToDelete.time ?? null,
                          notes: entryToDelete.notes ?? null,
                          streak_exercise_id: entryToDelete.streak_exercise_id,
                          streak_exercise_notes: entryToDelete.streak_exercise_notes ?? null,
                          position: entryToDelete.position,
                        });
                        
                        try {
                          await deleteWorkoutEntry({ id: entryToDelete.id }).unwrap();
                          console.log('✅ Exercise removed successfully');
                          
                          // Auto-dismiss undo after 5 seconds
                          if (undoTimeoutRef.current) {
                            clearTimeout(undoTimeoutRef.current);
                          }
                          undoTimeoutRef.current = setTimeout(() => {
                            setDeletedExercise(null);
                          }, 5000);
                        } catch (error) {
                          console.error('❌ Failed to remove exercise:', error);
                          setDeletedExercise(null);
                        }
                      }}
                    />
                    </View>
                  </Animated.View>
                );
              })}
            </View>
          </View>

          {/* Equipment Section */}
        {/* <View style={styles.equipmentSection}>
          <View style={styles.equipmentHeader}>
            <Text style={styles.equipmentTitle}>Equipment</Text> */}
            {/* <TouchableOpacity style={styles.equipmentChevron}>
              <Image
                source={require('../assets/icons/back.svg')}
                style={styles.chevronIcon}
                contentFit="contain"
              />
            </TouchableOpacity> */}
          {/* </View>
          
          <View style={styles.equipmentList}>
            {equipment.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.equipmentItem}
                onPress={() => {
                  console.log(`Selected equipment: ${item.name}`);
                }}
              >
                <View style={styles.equipmentImageContainer}>
                  <Image
                    source={item.image}
                    style={styles.equipmentImage}
                    contentFit="contain"
                  />
                </View>
                <Text style={styles.equipmentName}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
            </View>  */}
          </View>
        </Animated.ScrollView>



        {/* Adjust Mode Hint - Animated hint above floating buttons */}
        {isAdjustMode && (
          <Animated.View
            style={[
              styles.adjustHintWrapper,
              { bottom: 84 + insets.bottom }, // 72px button height + 8px bottom + 4px gap
              adjustHintAnimatedStyle
            ]}
          >
            {deletedExercise ? (
              <TouchableOpacity
                onPress={async () => {
                  if (!deletedExercise || !planId || !weekNumber || !day || !dayName || !date) {
                    return;
                  }
                  
                  // Clear timeout
                  if (undoTimeoutRef.current) {
                    clearTimeout(undoTimeoutRef.current);
                    undoTimeoutRef.current = null;
                  }
                  
                  try {
                    // Restore the exercise using AddWorkoutEntry
                    const result = await addWorkoutEntry({
                      workoutPlanId: planId,
                      weekNumber: parseInt(weekNumber),
                      dayName: dayName,
                      day: day as Weekday,
                      date: date,
                      exerciseId: deletedExercise.exercise_id,
                      sets: deletedExercise.sets,
                      reps: deletedExercise.reps,
                      streakExerciseId: deletedExercise.streak_exercise_id,
                      weight: deletedExercise.weight,
                      time: deletedExercise.time,
                      notes: deletedExercise.notes,
                      position: deletedExercise.position,
                    }).unwrap();
                    
                    console.log('✅ Exercise restored successfully');
                    
                    // Get the restored exercise ID from the result
                    const restoredEntryId = result?.insertIntoworkout_entriesCollection?.records?.[0]?.id;
                    if (restoredEntryId) {
                      setNewlyAddedExerciseId(restoredEntryId);
                    }
                    
                    setDeletedExercise(null);
                  } catch (error) {
                    console.error('❌ Failed to restore exercise:', error);
                    setDeletedExercise(null);
                  }
                }}
                style={[styles.adjustHintContainer, styles.undoHintContent]}
                activeOpacity={0.7}
              >
                <MaterialIcons 
                  name="undo" 
                  size={20} 
                  color={nucleus.light.global.brand[90]} 
                />
                <Text style={styles.adjustModeHintText}>Undo</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.adjustHintContainer}>
                <Text style={styles.adjustModeHintText}>
                  Click the exercise you want to adjust
                </Text>
              </View>
            )}
          </Animated.View>
        )}

        {/* Floating Button Container */}
        <View style={[styles.floatingButtonWrapper, { bottom:8+  insets.bottom }]}>
          <BlurView intensity={100} tint="light" style={styles.floatingButtonContainer}>
            <View style={styles.buttonRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.adjustButton,
                  styles.buttonBase,
                  {
                    opacity: pressed ? 0.7 : 1,
                    transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
                  }
                ]}
                onPress={() => setIsAdjustMode(!isAdjustMode)}
              >
                <View style={[
                  styles.adjustButtonBg, 
                  styles.buttonBg,
                  isAdjustMode && { backgroundColor: nucleus.light.global.blue[70] }
                ]} />
                <View style={styles.buttonContent}>
                  <Text style={[
                    styles.adjustButtonLabel, 
                    styles.buttonLabel,
                    isAdjustMode && { color: nucleus.light.global.blue[10] }
                  ]}>
                    {isAdjustMode ? 'Done' : 'Adjust'}
                  </Text>
                </View>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.startButton,
                  styles.buttonBase,
                  {
                    backgroundColor: pressed 
                      ? nucleus.light.global.blue[80]
                      : nucleus.light.global.blue[70],
                    transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
                  }
                ]}
                onPress={async () => {
                  if (isAdjustMode) {
                    setShowAddExerciseModal(true);
                    return;
                  }
                  
                  console.log('Start workout pressed');
                  try {
                    if (!workoutEntries || workoutEntries.length === 0) {
                      console.error('No workout entries available');
                      return;
                    }
                    
                    const planId = workoutData?.workout_plansCollection?.edges?.[0]?.node?.id;
                    if (!planId) {
                      console.error('No plan ID available');
                      return;
                    }

                    // Extract workout entry nodes
                    const entryNodes = workoutEntries.map(edge => edge.node);
                    
                    // Select the workout from database entries and wait for it to complete
                    const result = await dispatch(selectWorkoutFromEntries({
                      workoutEntries: entryNodes,
                      planId: planId as string,
                      dayName: workoutType || 'Workout'
                    }));
                    
                    // Check if selection was successful
                    const resultData = unwrapResult(result);
                    if (resultData.success) {
                      console.log('🏋️ Workout selected from database:', resultData);
                      // Small delay to ensure Redux state is propagated
                      await new Promise(resolve => setTimeout(resolve, 100));
                      // Then navigate to active workout
                      router.replace('/active_workout');
                    } else {
                      console.error('Failed to select workout:', resultData);
                    }
                  } catch (error) {
                    console.error('Failed to select workout:', error);
                  }
                }}
              >
                <View style={styles.startButtonContent}>
                  <Animated.Text 
                    key={isAdjustMode ? 'add-exercise' : 'start-workout'}
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(150)}
                    style={[styles.startButtonLabel, styles.buttonLabel]}
                  >
                    {isAdjustMode ? 'Add Exercise' : 'Start workout'}
                  </Animated.Text>
                </View>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.iconButton,
                  styles.buttonBase,
                  {
                    opacity: pressed ? 0.7 : 1,
                    transform: pressed ? [{ scale: 0.95 }] : [{ scale: 1 }],
                  }
                ]}
                onPress={() => setShowMusicModal(true)}
              >
                <View style={styles.musicIconBackground}>
                  <Image
                    source={require('../assets/icons/music.svg')}
                    style={styles.musicIcon}
                    contentFit="contain"
                  />
                </View>
              </Pressable>
            </View>
          </BlurView>
        </View>
      </SafeAreaView>
      
      <MusicModal 
        visible={showMusicModal} 
        onClose={() => setShowMusicModal(false)} 
      />

      <ExerciseInfoModal
        visible={showExerciseInfo}
        onClose={() => setShowExerciseInfo(false)}
        exercise={selectedExercise}
      />

      {/* Alternatives Modal */}
      {showAlternativesModal && selectedWorkoutEntryId && (
        <ExerciseAdjustModal
          visible={showAlternativesModal}
          onClose={() => {
            setShowAlternativesModal(false);
            setSelectedWorkoutEntryId(null);
            // Keep adjust mode active - don't disable it
          }}
          onAdjustmentComplete={() => {
            console.log('✅ Workout adjusted successfully');
            // Optional: Show success toast
          }}
          workoutEntryId={selectedWorkoutEntryId}
        />
      )}

      {/* Add Exercise Modal */}
      <AddExerciseModal
        visible={showAddExerciseModal}
        onClose={() => setShowAddExerciseModal(false)}
        onSelectExercise={async (exercise: { id: string; name?: string }) => {
          console.log('Exercise selected:', exercise);
          
          if (!planId || !weekNumber || !day || !dayName || !date) {
            console.error('Missing workout context:', { planId, weekNumber, day, dayName, date });
            return;
          }
          
          // Extract rep range from exercise name (format: "Exercise Name (X–Y reps)" or "Exercise Name (X-Y reps)")
          let reps = "10-12"; // Default fallback
          if (exercise.name) {
            // Match patterns like "(6–10 reps)", "(8-12 reps)", "(10–15 reps)", etc.
            const repMatch = exercise.name.match(/\((\d+)[–-](\d+)\s*reps?\)/i);
            if (repMatch) {
              reps = `${repMatch[1]}-${repMatch[2]}`;
            }
          }
          
          try {
            // Calculate next position (max position + 1) for this workout day
            const existingEntries = workoutEntries.map((edge: any) => edge.node);
            const maxPosition = existingEntries.length > 0
              ? Math.max(...existingEntries.map((entry: any) => entry.position || 0))
              : 0;
            const nextPosition = maxPosition + 1;

            const result = await addWorkoutEntry({
              workoutPlanId: planId,
              weekNumber: parseInt(weekNumber),
              dayName: dayName,
              day: day as Weekday,
              date: date,
              exerciseId: exercise.id,
              sets: 3, // Default: 3 sets
              reps: reps, // Extracted from exercise name
              streakExerciseId: exercise.id, // Same as exercise_id for manually added exercises
              weight: null,
              time: null,
              notes: null,
              position: nextPosition,
            }).unwrap();
            
            console.log('✅ Exercise added successfully');
            
            // Get the newly added exercise ID from the result
            const newEntryId = result?.insertIntoworkout_entriesCollection?.records?.[0]?.id;
            if (newEntryId) {
              setNewlyAddedExerciseId(newEntryId);
            }
            
            setShowAddExerciseModal(false);
          } catch (error) {
            console.error('❌ Failed to add exercise:', error);
            // TODO: Show error toast/alert to user
          }
        }}
      />
      
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    overflow: 'hidden',
  },
  headerImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerBackButton: {
    position: 'absolute',
    left: 16,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBackIcon: {
    width: 32,
    height: 32,
    tintColor: nucleus.light.semantic.fg.base,
  },
  headerShareButton: {
    position: 'absolute',
    right: 16,
  },
  headerShareIcon: {
    width: 24,
    height: 24,
    tintColor: nucleus.light.semantic.fg.base,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: nucleus.light.semantic.bg.subtle,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: HEADER_HEIGHT - 32,
    paddingTop: 32,
    overflow: 'hidden',
    gap: 32,
  },

  content: {
    padding: 16,
    paddingTop: 0,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 32,
    alignSelf: 'stretch',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 120, // Extra space for floating buttons
    gap: 32,
  },

  summaryContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    alignSelf: 'stretch',
  },

  weekNumber: {
    color: nucleus.light.semantic.fg.muted,
    fontFamily: nucleus.light.typography.fontFamily.primary,
    
    fontSize: nucleus.light.typography.fontSize.sm,
    fontWeight: '700',
    lineHeight: 16.8,
    letterSpacing: 0,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  workoutTitle: {
    color: nucleus.light.semantic.fg.base,
    fontFamily: nucleus.light.typography.fontFamily.primary,
    fontSize: nucleus.light.typography.fontSize.xl,
    fontWeight: '700',
    lineHeight: 28.8,
    letterSpacing: -1,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  workoutDescription: {
    color: nucleus.light.semantic.fg.base,
    fontFamily: nucleus.light.typography.fontFamily.primary,
    fontSize: nucleus.light.typography.fontSize.sm,
    fontWeight: '400',
    lineHeight: 21,
    letterSpacing: 0,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  elementwith_icon: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    gap: 8,
   
  },
  icon: {
    width: 32,
    height: 32,
  },
  elementText: {
    color: nucleus.light.global.grey[70],
    fontFamily: nucleus.light.typography.fontFamily.primary,
    fontSize: nucleus.light.typography.fontSize.md,
    fontWeight: '700',
    lineHeight: 19.2,
    letterSpacing: 0,
  },
  userMood: {
   
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
  },
  moodContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
  },
  moodTitle: {
    color: nucleus.light.semantic.fg.base,
    fontFamily: nucleus.light.typography.fontFamily.primary,
    fontSize: nucleus.light.typography.fontSize.lg,
    fontWeight: '700',
    lineHeight: 21.6,
    letterSpacing: 0,
  },
  moodSubtitle: {
    color: nucleus.light.semantic.fg.base,
    fontFamily: nucleus.light.typography.fontFamily.primary,
    fontSize: nucleus.light.typography.fontSize.sm,
    fontWeight: '400',
    lineHeight: 21,
    letterSpacing: 0,
    textOverflow: 'ellipsis',
  },
  moodIconsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  moodIconItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    maxWidth: 80,
  },
  moodIconWrapper: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },

  moodIconCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: nucleus.light.global.grey[30],
    justifyContent: 'center',
    alignItems: 'center',
  },

  moodIconDeactive: {
    width: 38.919,
    height: 38.919,
    flexShrink: 0,
    aspectRatio: 38.92/38.92,
  },
  moodIconText: {
    color: nucleus.light.semantic.fg.base,
    textAlign: 'center',
    alignSelf: 'stretch',
    fontFamily: nucleus.light.typography.fontFamily.primary,
    fontSize: nucleus.light.typography.fontSize.xs,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 18,
    letterSpacing: 0,
  },
  equipmentSection: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 24,
    alignSelf: 'stretch',
  },
  equipmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  equipmentTitle: {
    color: nucleus.light.semantic.fg.base,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: nucleus.light.typography.fontSize.lg,
    fontWeight: '700',
    lineHeight: 21.6,
    letterSpacing: 0,
  },
  equipmentChevron: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronIcon: {
    width: 32,
    height: 32,
    transform: [{ rotate: '180deg' }],
  },
  equipmentList: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
    alignSelf: 'stretch',
  },
  equipmentItem: {
    backgroundColor: nucleus.light.global.white,
    borderRadius: nucleus.light.cornerRadius.lg,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    alignSelf: 'stretch',
  },
  equipmentImageContainer: {
    width: 80,
    height: 80,
    borderRadius: nucleus.light.cornerRadius.md,
    backgroundColor: nucleus.light.global.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  equipmentImage: {
    width: 64,
    height: 64,
  },
  equipmentName: {
    color: nucleus.light.global.grey[80],
    fontFamily: nucleus.light.typography.fontFamily.primary,
    fontSize: nucleus.light.typography.fontSize.md,
    fontWeight: '700',
    lineHeight: 19.2,
    letterSpacing: 0,
    flex: 1,
    flexShrink: 1,
  },
  summaryExerciseSection: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 24,
    alignSelf: 'stretch',
  },
  adjustModeHint: {
    
    backgroundColor: nucleus.light.global.brand[40],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: 'stretch',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustModeHintText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: nucleus.light.global.brand[90],
    textAlign: 'center',
    includeFontPadding: false,
  },
  undoHintContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  adjustHintWrapper: {

    position: 'absolute',
    left: 24,
    right: 24,
    zIndex: 999,
  },
  adjustHintContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: nucleus.light.global.brand[40],
    borderWidth: 1,
    borderColor: 'rgba(208, 221, 23, 0.16)',
    overflow: 'hidden',
    shadowColor: 'rgba(185, 230, 255, 0.30)',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 15,
    elevation: 15,
    shadowOpacity: 1,
  },
  summaryExerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  summaryExerciseTitle: {
    color: nucleus.light.semantic.fg.base,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: nucleus.light.typography.fontSize.lg,
    fontWeight: '700',
    lineHeight: 21.6,
    letterSpacing: 0,
  },
  summaryChevron: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseList: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
    alignSelf: 'stretch',
  },
  exerciseCardWrapper: {
    alignSelf: 'stretch',
    width: '100%',
  },
  exerciseCard: {
    backgroundColor: nucleus.light.global.white,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    alignSelf: 'stretch',
  },
  exerciseRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  exerciseImageContainer: {
    width: 96,
    height: 96,
    borderRadius: 12,
    flexShrink: 0,
  },
  exerciseImage: {
    position: 'absolute',
    height: '100%',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  exerciseInfo: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-start',
    flexDirection: 'row',
    position: 'relative',
  },
  exerciseTextContainer: {
    gap: 6,
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    paddingTop: 4,
    paddingRight: 36,
  },
  exerciseNumber: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    color: nucleus.light.global.grey[80],
    includeFontPadding: false,
    textAlign: 'left',
  },
  exerciseDetails: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: nucleus.light.global.grey[70],
    includeFontPadding: false,
    textAlign: 'left',
    flexShrink: 1,
    minWidth: 0,
  },
  exerciseDetails2: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    color: nucleus.light.semantic.fg.muted,
    includeFontPadding: false,
    width: 175,
    textAlign: 'left',
  },
  exerciseDescription: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    color: nucleus.light.semantic.fg.muted,
    includeFontPadding: false,
    overflow: 'hidden',
    textAlign: 'left',
    display: 'none',
  },
  playButton: {
    position: 'absolute',
    right: 0,
    top: 4,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    zIndex: 1,
  },
  playIcon: {
    width: 24,
    height: 24,
    overflow: 'hidden',
  },
  // Equipment display in exercise cards
  exerciseEquipmentContainer: {
    paddingTop: 8,
    paddingHorizontal: 0,
    gap: 8,
  },
  equipmentInlineContainer: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'flex-start',
    flexWrap: 'wrap',
  },
  equipmentGroupWrapper: {
    gap: 8,
  },
  equipmentAlternativesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  equipmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: nucleus.light.semantic.bg.subtle,
    borderRadius: 20,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 12,
    gap: 8,
    flexShrink: 1,
    minWidth: 0,
  },
  equipmentChipInline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: nucleus.light.semantic.bg.subtle,
    borderRadius: 20,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 12,
    gap: 8,
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  equipmentChipIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: nucleus.light.global.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  equipmentChipImage: {
    width: 24,
    height: 24,
  },
  equipmentChipText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
    color: nucleus.light.global.grey[80],
    letterSpacing: 0,
    flexShrink: 0,
  },
  equipmentOrText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    fontWeight: '400',
    color: nucleus.light.global.grey[60],
    paddingHorizontal: 4,
  },
  equipmentAndSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  equipmentAndLine: {
    flex: 1,
    height: 1,
    backgroundColor: nucleus.light.global.grey[30],
  },
  equipmentAndText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    fontWeight: '400',
    color: nucleus.light.global.grey[60],
    paddingHorizontal: 4,
  },
  floatingButtonWrapper: {
    position: 'absolute',
    left: 24,
    right: 24,
    height: 72,
    shadowColor: 'rgba(185, 230, 255, 0.40)',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 25,
    elevation: 25,
    shadowOpacity: 1,
  },
  floatingButtonContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.50)',
    borderWidth: 1,
    borderColor: 'rgba(208, 221, 23, 0.16)',
    overflow: 'hidden',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
  },
  buttonBase: {
    height: 48,
    borderRadius: 48,
    position: 'relative',
  },
  buttonBg: {
    overflow: 'hidden',
    borderRadius: 48,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  buttonContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  startButtonContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonLabel: {
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '700',
    lineHeight: 16,
    fontSize: 16,
    includeFontPadding: false,
  },
  adjustButton: {
    width: 84,
  },
  adjustButtonBg: {
    borderStyle: 'solid',
    borderColor: nucleus.light.global.blue[70],
    borderWidth: 1,
  },
  adjustButtonLabel: {
    color: nucleus.light.global.blue[70],
  },
  startButton: {
    flex: 1,
  },
  startButtonBg: {
    backgroundColor: nucleus.light.global.blue[70],
  },
  startButtonLabel: {
    color: nucleus.light.global.blue[10],
  },
  iconButton: {
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonImage: {
    width: 24,
    height: 24,
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  musicIconBackground: {
    borderRadius: 48,
    backgroundColor: nucleus.light.semantic.accent.moderate,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 12.5,
    paddingRight: 11.5,
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    height: 48,
  },
  musicIcon: {
    width: 24,
    height: 24,
    tintColor: nucleus.light.semantic.accent.intense,
  },

 
  
});

