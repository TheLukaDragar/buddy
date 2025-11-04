import { unwrapResult } from '@reduxjs/toolkit';
import { BlurView } from 'expo-blur';
import { Image } from "expo-image";
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import Animated, { Extrapolation, interpolate, runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { nucleus } from '../Buddy_variables';
import ExerciseAdjustModal from '../components/ExerciseAdjustModal';
import ExerciseInfoModal from '../components/ExerciseInfoModal';
import MusicModal from '../components/MusicModal';
import { Weekday } from '../graphql/generated';
import { selectWorkoutFromEntries } from '../store/actions/workoutActions';
import { useGetWorkoutDayQuery } from '../store/api/enhancedApi';
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
  const [selectedExerciseForAdjustment, setSelectedExerciseForAdjustment] = useState<any>(null);
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

  // Fetch workout data for the specific day
  const { data: workoutData, isLoading, error } = useGetWorkoutDayQuery({
    planId: planId || '',
    weekNumber: parseInt(weekNumber || '1'),
    day: (day as Weekday) || Weekday.Monday,
  }, {
    skip: !planId || !weekNumber || !day
  });

  // Extract workout entries from the query response
  const workoutEntries = workoutData?.workout_plansCollection?.edges?.[0]?.node?.workout_entriesCollection?.edges || [];

  // // Debug logging
  // console.log('Workout Data Debug:');
  console.log('Raw workout data:', JSON.stringify(workoutData, null, 2));
  // console.log('Workout entries count:', workoutEntries.length);
  // console.log('All workout entries:', workoutEntries.map(entry => entry.node));
  // console.log('First workout entry:', workoutEntries[0]?.node);
  console.log('Workout entries:', JSON.stringify(workoutEntries, null, 2));

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

  // Extract unique equipment from all exercises using equipment_groups
  // Keep track of all unique equipment items across all exercises
  const allEquipmentItems = workoutEntries.flatMap(entry => {
    const equipmentGroups = entry.node.exercises?.equipment_groups;
    
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

  console.log('Equipment groups from entries:', workoutEntries.map(e => e.node.exercises?.equipment_groups));
  console.log('Unique equipment slugs:', uniqueEquipment);
  console.log('Unique equipment readable:', uniqueEquipmentReadable);

  // Extract exercise slugs and create thumbnail URLs (memoized to prevent re-renders)
  const { exerciseSlugs, thumbnailUrls } = useMemo(() => {
    const slugs = workoutEntries
      .map(entry => entry.node.exercises?.slug)
      .filter(Boolean) as string[];

    const urls = slugs.map(slug =>
      `https://kmtddcpdqkeqipyetwjs.supabase.co/storage/v1/object/public/workouts/processed/${slug}/${slug}_cropped_thumbnail_low.jpg`
    );

    return { exerciseSlugs: slugs, thumbnailUrls: urls };
  }, [workoutEntries]);

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

  // Animate adjust mode hint appearance with exit transition
  useEffect(() => {
    if (isAdjustMode) {
      // Show immediately and animate in
      setShowAdjustHint(true);
      adjustHintOpacity.value = withTiming(1, { duration: 200 });
      adjustHintHeight.value = withTiming(1, { duration: 200 });
    } else {
      // Animate out first, then remove from DOM
      adjustHintOpacity.value = withTiming(0, { duration: 200 });
      adjustHintHeight.value = withTiming(0, { duration: 200 }, () => {
        // Remove from DOM after animation completes
        runOnJS(setShowAdjustHint)(false);
      });
    }
  }, [isAdjustMode]);

  const adjustHintAnimatedStyle = useAnimatedStyle(() => {
    // Height: lineHeight (20) + padding top (12) + padding bottom (12) = 44px, using 50px for safety
    const heightValue = interpolate(adjustHintHeight.value, [0, 1], [0, 50], Extrapolation.CLAMP);
    const opacity = adjustHintOpacity.value;
    
    return {
      opacity,
      height: heightValue,
      marginTop: interpolate(adjustHintHeight.value, [0, 1], [0, 0], Extrapolation.CLAMP),
      marginBottom: interpolate(adjustHintHeight.value, [0, 1], [0, 16], Extrapolation.CLAMP),
      paddingTop: interpolate(adjustHintHeight.value, [0, 1], [0, 12], Extrapolation.CLAMP),
      paddingBottom: interpolate(adjustHintHeight.value, [0, 1], [0, 12], Extrapolation.CLAMP),
      pointerEvents: opacity > 0 ? 'auto' : 'none',
      overflow: 'hidden',
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
  const exercises = workoutEntries.map((entry, index) => {
    // Clean up exercise name by removing ALL parentheses and their contents
    const cleanName = entry.node.exercises.name.replace(/\s*\([^)]*\)/g, '').trim();
    
    // Get thumbnail URL for this exercise
    const slug = entry.node.exercises?.slug;
    const thumbnailUrl = slug 
      ? `https://kmtddcpdqkeqipyetwjs.supabase.co/storage/v1/object/public/workouts/processed/${slug}/${slug}_cropped_thumbnail_low.jpg`
      : null;

    // Parse equipment groups for this exercise
    const equipmentGroups = entry.node.exercises?.equipment_groups;
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
      muscles: entry.node.exercises?.muscle_categories?.join(', ') || '', 
      description: entry.node.exercises.instructions || 'Exercise instructions',
      thumbnailUrl: thumbnailUrl,
      slug: slug,
      equipmentGroups: parsedGroups, // [[item1, item2], [item3]] means (item1 OR item2) AND item3
    };
  });



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
              <Image
                source={{ uri: 'https://kmtddcpdqkeqipyetwjs.supabase.co/storage/v1/object/public/workouts/processed/barbell-squat/barbell-squat_cropped_thumbnail.jpg' }}
                style={styles.headerImage}
                contentFit="cover"
              />
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
          contentContainerStyle={[styles.scrollContent, { paddingTop: 0 }]}
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
         <View style={styles.contentContainer}>
         <View style={styles.summaryContainer}>
          <Text style={styles.weekNumber}>Week {weekNumber}</Text>
          <Text style={styles.workoutTitle}>{dynamicWorkoutTitle}</Text>
          <Text style={styles.workoutDescription}>
          Based on your last workout Buddy recommends this over that so it will go easy on your knees and  right ankle. 
          </Text>

          <View style={styles.elementwith_icon}>
            <Image source={require('../assets/icons/clock.svg')} style={styles.icon} />

            <Text style={styles.elementText}>{totalWorkoutMinutes} min</Text>
          </View>

          <View style={styles.elementwith_icon}>
            <Image source={require('../assets/icons/equipment.svg')} style={styles.icon} />

            <Text style={styles.elementText}>{workoutEntries.length} exercises</Text>
          </View>

          <View style={styles.elementwith_icon}>
            <Image source={require('../assets/icons/music.svg')} style={styles.icon} />

            <Text style={styles.elementText}>Rhythmic</Text>
          </View>
          
         </View>        

         <View style={styles.userMood}>
            <View style={styles.moodContainer}>
                <Text style={styles.moodTitle}>
                    How are you feeling today?
                </Text>
                <Text style={styles.moodSubtitle}>
                Your mood helps me adjust the workout intensity and coaching style. 
          </Text>
          </View>
          <View style={styles.moodIconsContainer}>
            {moods.map((mood) => {
              const isSelected = selectedMood === mood.id;
              return (
                <View key={mood.id} style={styles.moodIconItem}>
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
              );
            })}
             </View>
             </View>

        

          {/* Summary Section */}
          <View style={styles.summaryExerciseSection}>

          
            
            <View style={styles.summaryExerciseHeader}>
              <Text style={styles.summaryExerciseTitle}>Exercises</Text>

             
              
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
            {showAdjustHint && (
              <Animated.View style={[styles.adjustModeHint, adjustHintAnimatedStyle]}>
                <Text style={styles.adjustModeHintText}>
                  Click the exercise you want to adjust
                </Text>
              </Animated.View>
            )}
              {exercises.map((exercise, index) => {
                const handleExercisePress = () => {
                  // If in adjust mode, show alternatives modal
                  if (isAdjustMode) {
                    const workoutEntry = workoutEntries.find(entry => {
                      const cleanDbName = entry.node.exercises?.name?.replace(/\s*\([^)]*\)/g, '').trim() || '';
                      return cleanDbName === exercise.name || entry.node.exercises?.name === exercise.name;
                    });

                    if (workoutEntry) {
                      setSelectedExerciseForAdjustment({
                        ...exercise,
                        workoutEntryData: {
                          sets: workoutEntry.node.sets,
                          reps: workoutEntry.node.reps,
                          weight: workoutEntry.node.weight,
                          notes: workoutEntry.node.notes
                        },
                        alternatives: workoutEntry.node.workout_entry_alternativesCollection?.edges || []
                      });
                      setShowAlternativesModal(true);
                    }
                    return;
                  }

                  // Normal info mode
                  console.log(`Pressed info for ${exercise.name}`);
                  const workoutEntry = workoutEntries.find(entry => {
                    const cleanDbName = entry.node.exercises?.name?.replace(/\s*\([^)]*\)/g, '').trim() || '';
                    return cleanDbName === exercise.name || entry.node.exercises?.name === exercise.name;
                  });

                  const alternativeEntry = !workoutEntry ? workoutEntries.find(entry => {
                    const cleanDbName = entry.node.exercises?.name?.replace(/\s*\([^)]*\)/g, '').trim() || '';
                    return cleanDbName.toLowerCase().includes(exercise.name.toLowerCase()) ||
                           exercise.name.toLowerCase().includes(cleanDbName.toLowerCase());
                  }) : null;

                  const realExerciseData = workoutEntry?.node.exercises || alternativeEntry?.node.exercises;

                  if (realExerciseData) {
                    const cleanName = realExerciseData.name.replace(/\s*\([^)]*\)/g, '').trim();
                    const instructionsParts = realExerciseData.instructions ? realExerciseData.instructions.split(/(?=\(\d+(?:st|nd|rd|th)\))/).filter(Boolean).map(s => s.trim()) : [];
                    const keyFormTipsSection = instructionsParts.find(s => s.includes('Key Form Tips'));
                    const keyFormTips = keyFormTipsSection ?
                      keyFormTipsSection.replace(/.*Key Form Tips:\s*/, '').split(/[;,]/).map(tip => tip.trim()).filter(Boolean) :
                      ["Follow the form shown in the video", "Start with lighter weights if needed", "Focus on controlled movements"];

                    // Parse equipment groups the same way as in exercises array
                    const equipmentGroups = realExerciseData.equipment_groups;
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

                    console.log('Modal Exercise Data - Equipment Groups:', parsedGroups);

                    const exerciseData = {
                      name: cleanName,
                      slug: realExerciseData.slug,
                      id: realExerciseData.id,
                      instructions: instructionsParts.filter(s => !s.includes('Key Form Tips')),
                      tips: keyFormTips,
                      videoUrl: realExerciseData.slug ? `https://kmtddcpdqkeqipyetwjs.supabase.co/storage/v1/object/public/workouts/processed/${realExerciseData.slug}/${realExerciseData.slug}_cropped_video.mp4` : undefined,
                      equipment: parsedGroups.flat().map((slug: string) => 
                        slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                      ),
                      equipmentGroups: parsedGroups,
                      category: "How to"
                    };
                    setSelectedExercise(exerciseData);
                    setShowExerciseInfo(true);
                  } else {
                    setSelectedExercise({
                      name: exercise.name,
                      slug: undefined,
                      id: undefined,
                      instructions: ['Exercise instructions not available'],
                      videoUrl: undefined,
                      equipment: ['No equipment specified'],
                      equipmentGroups: [],
                      category: "How to"
                    });
                    setShowExerciseInfo(true);
                  }
                };

                // Check if there's only one equipment chip total
                const totalEquipmentItems = exercise.equipmentGroups?.reduce((sum, group) => sum + group.length, 0) || 0;
                const hasOnlyOneEquipment = totalEquipmentItems === 1 && exercise.equipmentGroups?.length === 1;

                return (
                <TouchableOpacity
                  key={exercise.id}
                  style={styles.exerciseCard}
                  onPress={handleExercisePress}
                  activeOpacity={0.7}
                >
                  <View style={styles.exerciseRow}>
                    <View style={styles.exerciseImageContainer}>
                      {exercise.thumbnailUrl ? (
                        <Image
                          source={{ uri: exercise.thumbnailUrl }}
                          style={styles.exerciseImage}
                          contentFit="cover"
                          cachePolicy="memory-disk"
                          onError={() => {
                            console.log('Failed to load exercise thumbnail:', exercise.thumbnailUrl);
                          }}
                          placeholder={require('../assets/exercises/squats.png')}
                          placeholderContentFit="cover"
                        />
                      ) : (
                        <Image
                          source={require('../assets/exercises/squats.png')}
                          style={styles.exerciseImage}
                          contentFit="cover"
                        />
                      )}
                    </View>
                    <View style={styles.exerciseInfo}>
                      <View style={styles.exerciseTextContainer}>
                        <Text style={styles.exerciseNumber} numberOfLines={3} ellipsizeMode="tail">
                          {exercise.name}
                        </Text>
                        <Text style={styles.exerciseDetails} numberOfLines={1} ellipsizeMode="tail">
                          {exercise.sets}  •  {exercise.muscles}
                        </Text>
                        
                        {/* If only one equipment, show it here inline */}
                        {hasOnlyOneEquipment && exercise.equipmentGroups && exercise.equipmentGroups[0] && (
                          <View style={styles.equipmentInlineContainer}>
                            {exercise.equipmentGroups[0].map((equipmentSlug) => {
                              const equipmentName = equipmentSlug
                                .split('-')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ');
                              
                              return (
                                <View key={equipmentSlug} style={styles.equipmentChipInline}>
                                  <View style={styles.equipmentChipIcon}>
                                    <Image
                                      source={getEquipmentIcon(equipmentSlug)}
                                      style={styles.equipmentChipImage}
                                      contentFit="contain"
                                    />
                                  </View>
                                  <Text style={styles.equipmentChipText}>
                                    {equipmentName}
                                  </Text>
                                </View>
                              );
                            })}
                          </View>
                        )}
                      </View>
                      <View style={styles.playButton}>
                        <Image
                          source={require('../assets/icons/info.svg')}
                          style={styles.playIcon}
                          contentFit="contain"
                        />
                      </View>
                    </View>
                  </View>
                  
                  {/* Equipment Groups Display - Show at bottom only if multiple items */}
                  {!hasOnlyOneEquipment && exercise.equipmentGroups && exercise.equipmentGroups.length > 0 && (
                    <View style={styles.exerciseEquipmentContainer}>
                      {exercise.equipmentGroups.map((group, groupIndex) => (
                        <View key={groupIndex} style={styles.equipmentGroupWrapper}>
                          {/* Each group is a row of alternatives (OR) */}
                          <View style={styles.equipmentAlternativesRow}>
                            {group.map((equipmentSlug, itemIndex) => {
                              const equipmentName = equipmentSlug
                                .split('-')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ');
                              
                              return (
                                <React.Fragment key={`${groupIndex}-${itemIndex}`}>
                                  <View style={styles.equipmentChip}>
                                    <View style={styles.equipmentChipIcon}>
                                      <Image
                                        source={getEquipmentIcon(equipmentSlug)}
                                        style={styles.equipmentChipImage}
                                        contentFit="contain"
                                      />
                                    </View>
                                    <Text style={styles.equipmentChipText} numberOfLines={1}>
                                      {equipmentName}
                                    </Text>
                                  </View>
                                  {/* "or" text between alternatives in the same group */}
                                  {itemIndex < group.length - 1 && (
                                    <Text style={styles.equipmentOrText}>or</Text>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </View>
                          {/* "and" indicator between required groups (AND) */}
                          {groupIndex < exercise.equipmentGroups.length - 1 && (
                            <View style={styles.equipmentAndSeparator}>
                              <View style={styles.equipmentAndLine} />
                              <Text style={styles.equipmentAndText}>and</Text>
                              <View style={styles.equipmentAndLine} />
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
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
                    {isAdjustMode ? 'Cancel' : 'Adjust'}
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
                  <Text style={[styles.startButtonLabel, styles.buttonLabel]}>Start workout</Text>
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
      {showAlternativesModal && selectedExerciseForAdjustment && (
        <ExerciseAdjustModal
          visible={showAlternativesModal}
          onClose={() => {
            setShowAlternativesModal(false);
            setIsAdjustMode(false);
          }}
          onSelectAlternative={(altExercise) => {
            console.log('Selected alternative:', altExercise);
            // TODO: Update workout entry with selected alternative
            // setShowAlternativesModal(false);
            // setIsAdjustMode(false);
          }}
          exercise={{
            name: selectedExerciseForAdjustment.name,
            slug: selectedExerciseForAdjustment.slug,
            instructions: [],
            tips: [],
            equipment: [],
            category: "Adjust Exercise",
          }}
          workoutEntry={selectedExerciseForAdjustment.workoutEntryData}
          alternatives={selectedExerciseForAdjustment.alternatives}
        />
      )}
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
    paddingHorizontal: 12,
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

