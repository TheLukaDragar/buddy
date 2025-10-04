import { BlurView } from 'expo-blur';
import { Image } from "expo-image";
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { nucleus } from '../Buddy_variables';
import ExerciseInfoModal from '../components/ExerciseInfoModal';
import MusicModal from '../components/MusicModal';
import { mihasWorkout } from '../data/sampleWorkouts';
import { Weekday } from '../graphql/generated';
import { selectWorkout } from '../store/actions/workoutActions';
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
  const scrollY = useSharedValue(0);
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

  // Debug logging
  console.log('Workout Data Debug:');
  console.log('Raw workout data:', workoutData);
  console.log('Workout entries count:', workoutEntries.length);
  console.log('All workout entries:', workoutEntries.map(entry => entry.node));
  console.log('First workout entry:', workoutEntries[0]?.node);

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

  // Extract unique equipment from all exercises
  const allEquipmentStrings = workoutEntries.map(entry => entry.node.equipment);
  const allEquipmentItems = allEquipmentStrings.flatMap(equipStr =>
    equipStr.split(',').map(item => item.trim()).filter(Boolean)
  );
  const uniqueEquipment = [...new Set(allEquipmentItems)];

  console.log('All equipment strings:', allEquipmentStrings);
  console.log('Unique equipment:', uniqueEquipment);

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

  // Create equipment array from dynamic data
  const equipment = uniqueEquipment.map((equipmentName, index) => ({
    id: index + 1,
    name: equipmentName,
    image: require('../assets/icons/mat.png'), // Default image for now
  }));

  // Create exercises summary from dynamic data with thumbnail URLs
  const exercises = workoutEntries.map((entry, index) => {
    // Clean up exercise name by removing rep ranges in parentheses
    const cleanName = entry.node.exercises.name.replace(/\s*\([^)]*reps?\)|\s*\(\d+–\d+\)/i, '');
    
    // Get thumbnail URL for this exercise
    const slug = entry.node.exercises?.slug;
    const thumbnailUrl = slug 
      ? `https://kmtddcpdqkeqipyetwjs.supabase.co/storage/v1/object/public/workouts/processed/${slug}/${slug}_cropped_thumbnail_low.jpg`
      : null;

    return {
      id: index + 1,
      name: cleanName,
      sets: `${entry.node.sets} sets`,
      muscles: entry.node.equipment, // Using equipment as muscle info for now
      description: entry.node.exercises.instructions || 'Exercise instructions',
      thumbnailUrl: thumbnailUrl,
      slug: slug,
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
              <TouchableOpacity 
                style={styles.summaryChevron}
                onPress={() => {
                  console.log('Summary chevron pressed');
                  router.push('/exercises');
                }}
              >
                {/* <Image
                  source={require('../assets/icons/back.svg')}
                  style={styles.chevronIcon}
                  contentFit="contain"
                /> */}
              </TouchableOpacity>
            </View>
            
            <View style={styles.exerciseList}>
              {exercises.map((exercise, index) => {
                const handleExercisePress = () => {
                  console.log(`Pressed info for ${exercise.name}`);
                  const workoutEntry = workoutEntries.find(entry => {
                    const cleanDbName = entry.node.exercises?.name?.replace(/\s*\([^)]*reps?\)|\s*\(\d+–\d+\)/i, '') || '';
                    return cleanDbName === exercise.name || entry.node.exercises?.name === exercise.name;
                  });

                  const alternativeEntry = !workoutEntry ? workoutEntries.find(entry => {
                    const cleanDbName = entry.node.exercises?.name?.replace(/\s*\([^)]*reps?\)|\s*\(\d+–\d+\)/i, '') || '';
                    return cleanDbName.toLowerCase().includes(exercise.name.toLowerCase()) ||
                           exercise.name.toLowerCase().includes(cleanDbName.toLowerCase());
                  }) : null;

                  const realExerciseData = workoutEntry?.node.exercises || alternativeEntry?.node.exercises;

                  if (realExerciseData) {
                    const cleanName = realExerciseData.name.replace(/\s*\([^)]*reps?\)|\s*\(\d+–\d+\)/i, '');
                    const instructionsParts = realExerciseData.instructions ? realExerciseData.instructions.split(/(?=\(\d+(?:st|nd|rd|th)\))/).filter(Boolean).map(s => s.trim()) : [];
                    const keyFormTipsSection = instructionsParts.find(s => s.includes('Key Form Tips'));
                    const keyFormTips = keyFormTipsSection ?
                      keyFormTipsSection.replace(/.*Key Form Tips:\s*/, '').split(/[;,]/).map(tip => tip.trim()).filter(Boolean) :
                      ["Follow the form shown in the video", "Start with lighter weights if needed", "Focus on controlled movements"];

                    const exerciseData = {
                      name: cleanName,
                      slug: realExerciseData.slug,
                      id: realExerciseData.id,
                      instructions: instructionsParts.filter(s => !s.includes('Key Form Tips')),
                      tips: keyFormTips,
                      videoUrl: realExerciseData.slug ? `https://kmtddcpdqkeqipyetwjs.supabase.co/storage/v1/object/public/workouts/processed/${realExerciseData.slug}/${realExerciseData.slug}_cropped_video.mp4` : undefined,
                      equipment: realExerciseData.required_equipment?.split(',').map(e => e.trim()) || [],
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
                      category: "How to"
                    });
                    setShowExerciseInfo(true);
                  }
                };

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
                        <Text style={styles.exerciseNumber} numberOfLines={2}>{exercise.name}</Text>
                        <Text style={[
                          styles.exerciseDetails,
                          index === 2 && styles.exerciseDetails2
                        ]}>
                          {exercise.sets}  •  {exercise.muscles}
                        </Text>
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
                  <Text style={styles.exerciseDescription} numberOfLines={3}>
                    {exercise.description}
                  </Text>
                </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Equipment Section */}
        <View style={styles.equipmentSection}>
          <View style={styles.equipmentHeader}>
            <Text style={styles.equipmentTitle}>Equipment</Text>
            {/* <TouchableOpacity style={styles.equipmentChevron}>
              <Image
                source={require('../assets/icons/back.svg')}
                style={styles.chevronIcon}
                contentFit="contain"
              />
            </TouchableOpacity> */}
          </View>
          
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
            </View> 
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
                onPress={() => console.log('Adjust pressed')}
              >
                <View style={[
                  styles.adjustButtonBg, 
                  styles.buttonBg,
                ]} />
                <View style={styles.buttonContent}>
                  <Text style={[styles.adjustButtonLabel, styles.buttonLabel]}>Adjust</Text>
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
                    // Select the workout first
                    await dispatch(selectWorkout(mihasWorkout));
                    console.log('🏋️ Workout selected from workout screen - navigating to active workout');
                    // Then navigate to active workout
                    router.replace('/active_workout');
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
    padding: 8,
    gap: 12,
    alignSelf: 'stretch',
  },
  exerciseRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  exerciseImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
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
    borderRadius: 8,
    overflow: 'hidden',
    width: '100%',
  },
  exerciseInfo: {
    gap: 4,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
  },
  exerciseTextContainer: {
    gap: 4,
    flex: 1,
  },
  exerciseNumber: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 19,
    color: nucleus.light.global.grey[80],
    includeFontPadding: false,
    overflow: 'hidden',
    textAlign: 'left',
  },
  exerciseDetails: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    color: nucleus.light.global.grey[70],
    includeFontPadding: false,
    width: 175,
    textAlign: 'left',
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
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  playIcon: {
    width: 32,
    height: 32,
    overflow: 'hidden',
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

