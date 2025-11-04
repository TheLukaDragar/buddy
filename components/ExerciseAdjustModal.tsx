import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, BackHandler, Dimensions, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Text } from 'react-native-paper';
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { nucleus } from '../Buddy_variables';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

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

// Exercise Video Component
interface ExerciseVideoProps {
  videoUrl?: string;
  exerciseName: string;
  slug?: string;
}

const ExerciseVideo: React.FC<ExerciseVideoProps> = React.memo(({ videoUrl, exerciseName, slug }) => {
  console.log('ExerciseVideo - Props:', { videoUrl, exerciseName, slug });
  const [isLoading, setIsLoading] = useState(true);
  const [showPlaceholder, setShowPlaceholder] = useState(!slug);
  const videoOpacity = useSharedValue(0);
  const loadingOpacity = useSharedValue(1);

  // Create video URI
  const videoUri = slug 
    ? `https://kmtddcpdqkeqipyetwjs.supabase.co/storage/v1/object/public/workouts/processed/${slug}/${slug}_cropped_video.mp4`
    : '';

  const player = slug ? useVideoPlayer(videoUri, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  }) : null;

  // Handle video loading and errors
  useEffect(() => {
    if (!player || !slug) return;

    const unsubscribe = player.addListener('statusChange', (status) => {
      console.log('ExerciseVideo - Player status:', status);

      if (status.status === 'readyToPlay') {
        console.log('ExerciseVideo - Video loaded successfully');
        setIsLoading(false);
        setShowPlaceholder(false);
        
        // Smooth fade in video, fade out loading
        videoOpacity.value = withTiming(1, { 
          duration: 400, 
          easing: Easing.out(Easing.ease) 
        });
        loadingOpacity.value = withTiming(0, { 
          duration: 300, 
          easing: Easing.out(Easing.ease) 
        });
      } else if (status.status === 'error') {
        console.log('ExerciseVideo - Video failed to load, showing placeholder');
        setIsLoading(false);
        setShowPlaceholder(true);
        loadingOpacity.value = withTiming(0, { 
          duration: 200, 
          easing: Easing.out(Easing.ease) 
        });
      } else if (status.status === 'loading') {
        console.log('ExerciseVideo - Video is loading');
        setIsLoading(true);
        videoOpacity.value = 0;
        loadingOpacity.value = 1;
      }
    });

    return () => {
      unsubscribe.remove();
    };
  }, [player, slug]);

  const videoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: videoOpacity.value,
  }));

  const loadingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: loadingOpacity.value,
  }));

  // Show placeholder if no slug or if error
  if (showPlaceholder || !slug) {
    console.log('ExerciseVideo - Showing placeholder');
    return (
      <View style={styles.heroContainer}>
        <Image
          source={require('../assets/images/9_16_2.png')}
          style={styles.heroImage}
          contentFit="cover"
        />
      </View>
    );
  }

  return (
    <View style={styles.heroContainer}>
      <Animated.View style={[styles.videoWrapper, videoAnimatedStyle]}>
        <VideoView
          player={player!}
          style={styles.heroVideo}
          nativeControls={false}
          contentFit="cover"
        />
      </Animated.View>
      <Animated.View 
        style={[styles.loadingOverlay, loadingAnimatedStyle]}
        pointerEvents={isLoading ? 'auto' : 'none'}
      >
        <ActivityIndicator 
          size="large" 
          color={nucleus.light.global.blue[70]} 
        />
      </Animated.View>
    </View>
  );
});

interface ExerciseInfoModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectAlternative?: (alternativeExercise: any) => void;
  exercise?: {
    name: string;
    category: string;
    instructions: string[];
    tips: string[];
    equipment: string[];
    equipmentGroups?: string[][];
    videoUrl?: string;
    imageUrl?: string;
    slug?: string;
    id?: string;
  };
  workoutEntry?: {
    sets: number;
    reps?: string;
    time?: string;
    weight?: string;
    notes?: string;
  };
  alternatives?: Array<{
    node: {
      id: string;
      alternative_exercise_id: string;
      note: string;
      position: number;
      exercises: {
        id: string;
        name: string;
        slug?: string;
        equipment_groups?: any;
      };
    };
  }>;
}

const ExerciseInfoModal = React.memo<ExerciseInfoModalProps>(function ExerciseInfoModal({ visible, onClose, onSelectAlternative, exercise, workoutEntry, alternatives }) {
  const insets = useSafeAreaInsets();
  const SHEET_HEIGHT = SCREEN_HEIGHT;
  
  const translateY = useSharedValue(SHEET_HEIGHT);
  
  // State for adjustable workout parameters
  const [adjustedSets, setAdjustedSets] = useState(workoutEntry?.sets || 4);
  const [adjustedReps, setAdjustedReps] = useState(workoutEntry?.reps || '8-12');
  const [adjustedTime, setAdjustedTime] = useState(workoutEntry?.time || '');
  
  // Update state when workoutEntry changes
  useEffect(() => {
    if (workoutEntry) {
      setAdjustedSets(workoutEntry.sets);
      if (workoutEntry.reps) {
        setAdjustedReps(workoutEntry.reps);
      }
      if (workoutEntry.time) {
        setAdjustedTime(workoutEntry.time);
      }
    }
  }, [workoutEntry]);
  
  // Parse reps to get min value for adjustment
  const parseReps = (reps: string): { min: number; max?: number; original: string } => {
    if (reps.includes('-')) {
      const [min, max] = reps.split('-').map(n => parseInt(n.trim()));
      return { min, max, original: reps };
    }
    const single = parseInt(reps);
    return { min: single, original: reps };
  };

  // Parse time to get numeric value for display
  const parseTime = (time: string): string => {
    if (!time) return '-';
    // Extract first number from time string (handles "30s", "60 seconds", "45", etc.)
    const match = time.match(/\d+/);
    return match ? match[0] : time;
  };
  
  // Adjust reps (increment/decrement)
  const adjustRepsValue = (delta: number) => {
    const parsed = parseReps(adjustedReps);
    const newMin = Math.max(1, parsed.min + delta);
    if (parsed.max) {
      const newMax = Math.max(newMin + 1, parsed.max + delta);
      setAdjustedReps(`${newMin}-${newMax}`);
    } else {
      setAdjustedReps(`${newMin}`);
    }
  };

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 25, stiffness: 150, mass: 0.8 });
    } else {
      translateY.value = withSpring(SHEET_HEIGHT, { damping: 20, stiffness: 200 });
    }
  }, [visible, SHEET_HEIGHT]);

  // Handle hardware back button
  useEffect(() => {
    if (!visible) return;

    const handleBackPress = () => {
      translateY.value = withTiming(SHEET_HEIGHT, {
        duration: 250,
        easing: Easing.in(Easing.quad),
      }, (finished) => {
        if (finished) {
          runOnJS(onClose)();
        }
      });
      return true; // Prevent default back action
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => backHandler.remove();
  }, [visible, translateY, onClose, SHEET_HEIGHT]);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: { startY: number }) => {
      context.startY = translateY.value;
    },
    onActive: (event, context: { startY: number }) => {
      const newTranslateY = context.startY + event.translationY;
      translateY.value = Math.max(0, newTranslateY);
    },
    onEnd: (event) => {
      const shouldDismiss = event.translationY > SHEET_HEIGHT * 0.3 || event.velocityY > 800;
      if (shouldDismiss) {
        translateY.value = withTiming(SHEET_HEIGHT, {
          duration: 250,
          easing: Easing.in(Easing.quad),
        }, (finished) => {
          if (finished) {
            runOnJS(onClose)();
          }
        });
      } else {
        translateY.value = withTiming(0, {
          duration: 200,
          easing: Easing.out(Easing.quad),
        });
      }
    },
  });

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, SHEET_HEIGHT], [0.7, 0], Extrapolate.CLAMP),
  }));

  // Memoize exercise data to prevent unnecessary re-renders
  const exerciseData = useMemo(() => {
    // Default exercise data for demo
    const defaultExercise = {
      name: "Squat",
      category: "How To",
      instructions: [
        "Stand with your feet shoulder-width apart.",
        "Keep your chest up and your back straight.",
        "Lower your hips like you're sitting into a chair.",
        "Go as low as you can while keeping your heels on the ground.",
        "Push through your heels to return to standing."
      ],
      tips: [
        "Keep your knees in line with your toes",
        "Engage your core throughout the movement"
      ],
      equipment: ["Mat"],
      equipmentGroups: [["body-weight"]],
      imageUrl: require('../assets/images/9_16_2.png'),
      videoUrl: undefined,
      slug: undefined,
      id: undefined
    };

    const result = exercise || defaultExercise;
    
    // Only log when the exercise data actually changes
    if (visible && exercise) {
      console.log('ExerciseInfoModal - exerciseData updated:', result);
      console.log('ExerciseInfoModal - equipmentGroups:', result.equipmentGroups);
      console.log('ExerciseInfoModal - equipment array:', result.equipment);
    }
    
    return result;
  }, [exercise, visible]); // Only recalculate when exercise or visible changes

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.backdrop, animatedBackdropStyle]} />

      <PanGestureHandler
        onGestureEvent={gestureHandler}
        activeOffsetY={20}
        failOffsetX={[-10, 10]}
      >
        <Animated.View style={[styles.sheet, animatedSheetStyle, { height: SHEET_HEIGHT }]}>
          <SafeAreaView style={styles.safeContainer} edges={['bottom']}>
            {/* Drag Handle */}
            <View style={styles.header}>
              <View style={styles.handle} />
            </View>


            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
              {/* Hero Video Section with Overlay Back Button */}
              <View style={styles.videoContainer}>
                <ExerciseVideo
                  videoUrl={exerciseData.videoUrl}
                  exerciseName={exerciseData.name}
                  slug={exerciseData.slug}
                />

                {/* Overlay Back Button */}
                <Pressable
                  style={styles.overlayCloseButton}
                  onPress={() => {
                    translateY.value = withTiming(SHEET_HEIGHT, {
                      duration: 250,
                      easing: Easing.in(Easing.quad),
                    }, (finished) => {
                      if (finished) {
                        runOnJS(onClose)();
                      }
                    });
                  }}
                >
                  <Image
                    source={require('../assets/icons/cross.svg')}
                    style={styles.overlayCloseIcon}
                    contentFit="contain"
                  />
                </Pressable>
              </View>

              {/* Content Container */}
              <View style={styles.contentContainer}>
                {/* Title Section */}
                <View style={styles.titleSection}>
                  <Text style={styles.categoryText}>{exerciseData.category}</Text>
                  <Text style={styles.titleText}>{exerciseData.name}</Text>
                </View>

                {/* Workout Info Display - Exactly like timer container in active_workout.tsx */}
                {workoutEntry && (
                  <View style={styles.infoContainer}>
                    {/* Weight - Centered in Left Section */}
                    <View style={styles.infoItemLeft}>
                      <Text style={[styles.infoValue, { color: nucleus.light.global.blue["60"] }]}>
                        {workoutEntry.weight || 'Body'}
                      </Text>
                      <Text style={[styles.infoLabel, { color: nucleus.light.global.grey["90"] }]}>
                        WEIGHT
                      </Text>
                    </View>

                    {/* Separator */}
                    <View style={styles.separator} />

                    {/* Sets - Centered in Middle Section */}
                    <View style={styles.infoItemCenter}>
                      <Text style={[styles.infoValue, { color: nucleus.light.global.blue["60"] }]}>
                        {adjustedSets}
                      </Text>
                      <Text style={[styles.infoLabel, { color: nucleus.light.global.grey["90"] }]}>
                        SETS
                      </Text>
                    </View>

                    {/* Separator */}
                    <View style={styles.separator} />

                    {/* Reps or Time - Centered in Right Section */}
                    <View style={styles.infoItemRight}>
                      <Text style={[styles.infoValue, { color: nucleus.light.global.blue["60"] }]}>
                        {workoutEntry.time && !workoutEntry.reps 
                          ? parseTime(adjustedTime)
                          : (adjustedReps ? parseReps(adjustedReps).min : '-')
                        }
                      </Text>
                      <Text style={[styles.infoLabel, { color: nucleus.light.global.grey["90"] }]}>
                        {workoutEntry.time && !workoutEntry.reps ? 'TIME' : 'REPS'}
                      </Text>
                    </View>
                  </View>
                )}
              
                {/* Instructions Section */}
                <View style={styles.instructionsSection}>
                  {exerciseData.instructions.map((instruction, index) => (
                    <Text key={index} style={styles.instructionText}>
                      {instruction}
                    </Text>
                  ))}
                  
                  {/* Tips */}
                  <View style={styles.tipsContainer}>
                    {exerciseData.tips.map((tip, index) => (
                      <Text key={index} style={styles.tipText}>
                        ✅ {tip}
                      </Text>
                    ))}
                  </View>
                </View>

                {/* Equipment Section - Unified UI with smart layout */}
                <View style={styles.equipmentSection}>
                  <Text style={styles.equipmentTitle}>Equipment</Text>
                  
                  {exerciseData.equipmentGroups && exerciseData.equipmentGroups.length > 0 ? (
                    <View style={styles.equipmentContainer}>
                      {exerciseData.equipmentGroups.map((group, groupIndex) => (
                        <View key={groupIndex} style={styles.equipmentGroupWrapper}>
                          {/* Each group is a row of alternatives (OR) */}
                          <View style={styles.equipmentAlternativesRow}>
                            {group.map((equipmentSlug, itemIndex) => {
                              const equipmentName = equipmentSlug
                                .split('-')
                                .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ');
                              
                              return (
                                <React.Fragment key={`${groupIndex}-${itemIndex}`}>
                                  <View style={styles.equipmentChip}>
                                    <View style={styles.equipmentChipIconContainer}>
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
                          {groupIndex < exerciseData.equipmentGroups!.length - 1 && (
                            <View style={styles.equipmentAndSeparator}>
                              <View style={styles.equipmentAndLine} />
                              <Text style={styles.equipmentAndText}>and</Text>
                              <View style={styles.equipmentAndLine} />
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.equipmentContainer}>
                      <View style={styles.equipmentChip}>
                        <View style={styles.equipmentChipIconContainer}>
                          <Image
                            source={require('../assets/equipment_icons/body-weight.png')}
                            style={styles.equipmentChipImage}
                            contentFit="contain"
                          />
                        </View>
                        <Text style={styles.equipmentChipText}>
                          {exerciseData.equipment[0] || "Body Weight"}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                  {/* Alternatives Section - Using card style from workout.tsx */}
                  {alternatives && alternatives.length > 0 && (
                    <View>
                        <Text style={styles.equipmentTitle}>Similar Alternatives</Text>
                     
                      
                      <View style={styles.alternativesList}>
                        {alternatives.map((alternative) => {
                          const altExercise = alternative.node.exercises;
                          const cleanName = altExercise.name.replace(/\s*\([^)]*\)/g, '').trim();
                          const thumbnailUrl = altExercise.slug 
                            ? `https://kmtddcpdqkeqipyetwjs.supabase.co/storage/v1/object/public/workouts/processed/${altExercise.slug}/${altExercise.slug}_cropped_thumbnail_low.jpg`
                            : null;

                          return (
                            <TouchableOpacity
                              key={alternative.node.id}
                              style={styles.alternativeCard}
                              onPress={() => {
                                if (onSelectAlternative) {
                                  onSelectAlternative(altExercise);
                                }
                              }}
                              activeOpacity={0.7}
                            >
                              <View style={styles.alternativeRow}>
                                <View style={styles.alternativeImageContainer}>
                                  {thumbnailUrl ? (
                                    <Image
                                      source={{ uri: thumbnailUrl }}
                                      style={styles.alternativeImage}
                                      contentFit="cover"
                                      cachePolicy="memory-disk"
                                      onError={() => {
                                        console.log('Failed to load alternative thumbnail:', thumbnailUrl);
                                      }}
                                      placeholder={require('../assets/exercises/squats.png')}
                                      placeholderContentFit="cover"
                                    />
                                  ) : (
                                    <Image
                                      source={require('../assets/exercises/squats.png')}
                                      style={styles.alternativeImage}
                                      contentFit="cover"
                                    />
                                  )}
                                </View>
                                <View style={styles.alternativeInfo}>
                                  <View style={styles.alternativeTextContainer}>
                                    <Text style={styles.alternativeName} numberOfLines={3} ellipsizeMode="tail">
                                      {cleanName}
                                    </Text>
                                    {alternative.node.note && (
                                      <Text style={styles.alternativeNote}>
                                        {alternative.node.note}
                                      </Text>
                                    )}
                                  </View>
                                </View>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}
              </View>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
});

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
    backgroundColor: '#000000',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: nucleus.light.semantic.bg.canvas,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  safeContainer: {
    flex: 1,
  },
  header: {
    height: 24,
    paddingTop: 8,
    paddingBottom: 11,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  handle: {
    width: 48,
    height: 5,
    flexShrink: 0,
    backgroundColor: nucleus.light.semantic.bg.muted,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 8,
  },
  videoContainer: {
    position: 'relative',
    height: 393,
    width: '100%',
    backgroundColor: nucleus.light.semantic.bg.muted,
  },
  overlayCloseButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  overlayCloseIcon: {
    width: 32,
    height: 32,
    tintColor: nucleus.light.semantic.fg.base,
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    height: 393,
    width: '100%',
    backgroundColor: nucleus.light.semantic.bg.muted,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  videoWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  heroVideo: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: nucleus.light.semantic.bg.muted,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    zIndex: 10,
  },
  
  contentContainer: {
    padding: 32,
    gap: 16,
  },
  titleSection: {
    alignItems: 'center',
    gap: 0,
  },
  categoryText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    lineHeight: 18,
    color: nucleus.light.semantic.fg.base,
    textAlign: 'center',
    includeFontPadding: false,
  },
  titleText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 32,
    lineHeight: 38.4, // 1.2 * 32
    letterSpacing: -1,
    color: nucleus.light.semantic.fg.base,
    textAlign: 'center',
    includeFontPadding: false,
  },
  instructionsSection: {
    gap: 8,
  },
  instructionText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24, // 1.5 * 16
    color: nucleus.light.semantic.fg.muted,
    includeFontPadding: false,
  },
  tipsContainer: {
    marginTop: 16,
    gap: 4,
  },
  tipText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: nucleus.light.semantic.fg.muted,
    includeFontPadding: false,
  },
  equipmentSection: {
    gap: 16,
  },
  equipmentTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24,
    lineHeight: 28.8, // 1.2 * 24
    letterSpacing: -1,
    color: nucleus.light.semantic.fg.base,
    includeFontPadding: false,
  },
  equipmentSubtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    lineHeight: 18,
    color: nucleus.light.semantic.fg.base,
    fontWeight: '600',
    includeFontPadding: false,
  },
  // New unified equipment UI styles (bigger than workout screen)
  equipmentContainer: {
    gap: 12,
  },
  equipmentGroupWrapper: {
    gap: 12,
  },
  equipmentAlternativesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  equipmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: nucleus.light.semantic.bg.subtle,
    borderRadius: 24,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 16,
    gap: 12,
  },
  equipmentChipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: nucleus.light.global.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  equipmentChipImage: {
    width: 30,
    height: 30,
  },
  equipmentChipText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    color: nucleus.light.global.grey[80],
    letterSpacing: 0,
  },
  equipmentOrText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    fontWeight: '400',
    color: nucleus.light.global.grey[60],
    paddingHorizontal: 4,
  },
  equipmentAndSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  equipmentAndLine: {
    flex: 1,
    height: 1,
    backgroundColor: nucleus.light.global.grey[30],
  },
  equipmentAndText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    fontWeight: '400',
    color: nucleus.light.global.grey[60],
    paddingHorizontal: 6,
  },
  // Workout Info Display Styles - Exactly from active_workout.tsx
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 0,
  },
  infoItemLeft: {
    display: 'flex',
    width: 72,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  infoItemCenter: {
    display: 'flex',
    width: 72,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  infoItemRight: {
    display: 'flex',
    width: 72,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
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
  separator: {
    width: 1,
    height: 32,
    backgroundColor: '#D9D9D9',
  },
  // Alternatives card styles - copied from workout.tsx
  alternativesList: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    alignSelf: 'stretch',
  },
  alternativeCard: {
    backgroundColor: nucleus.light.global.white,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    alignSelf: 'stretch',
  },
  alternativeRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  alternativeImageContainer: {
    width: 96,
    height: 96,
    borderRadius: 12,
    flexShrink: 0,
  },
  alternativeImage: {
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
  alternativeInfo: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-start',
    flexDirection: 'row',
    position: 'relative',
  },
  alternativeTextContainer: {
    gap: 6,
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    paddingTop: 4,
  },
  alternativeName: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    color: nucleus.light.global.grey[80],
    includeFontPadding: false,
    textAlign: 'left',
  },
  alternativeNote: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: nucleus.light.global.grey[70],
    includeFontPadding: false,
    textAlign: 'left',
    flexWrap: 'wrap',
    flexShrink: 0,
  },
});

export default ExerciseInfoModal;
