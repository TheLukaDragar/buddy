import * as Haptics from 'expo-haptics';
import { Image } from "expo-image";
import React, { useEffect, useMemo } from 'react';
import { BackHandler, Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AutoSkeletonView } from 'react-native-auto-skeleton';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Button, Text } from 'react-native-paper';
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  Layout,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { nucleus } from '../Buddy_variables';
import { useGetExerciseByIdQuery } from '../store/api/enhancedApi';
import { jumpToExerciseAndQueueCurrent } from '../store/actions/workoutActions';
import { useAppDispatch } from '../store/hooks';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Exercise Thumbnail Component
interface ExerciseThumbnailProps {
  exerciseName: string;
  slug?: string;
}

const ExerciseThumbnail: React.FC<ExerciseThumbnailProps> = React.memo(({ exerciseName, slug }) => {
  const thumbnailUri = slug 
    ? `https://kmtddcpdqkeqipyetwjs.supabase.co/storage/v1/object/public/workouts/processed/${slug}/${slug}_cropped_thumbnail_low.jpg`
    : null;

  return (
    <View style={styles.heroContainer}>
      {thumbnailUri ? (
        <Image
          source={{ uri: thumbnailUri }}
          style={styles.heroImage}
          contentFit="cover"
          cachePolicy="memory-disk"
          placeholder={require('../assets/images/9_16_2.png')}
          placeholderContentFit="cover"
        />
      ) : (
        <Image
          source={require('../assets/images/9_16_2.png')}
          style={styles.heroImage}
          contentFit="cover"
        />
      )}
    </View>
  );
});

// Exercise Card Component for the list
interface ExerciseCardProps {
  exercise: {
    id: string;
    name: string;
    slug?: string;
    muscle_categories?: string[] | null;
  };
  onSelect: () => void;
  isCurrent: boolean;
  isSelected: boolean;
  totalSets: number;
  completedSets: number;
  position: number; // Position in the workout (1-based)
  isCompleted?: boolean;
}

const ExerciseCard: React.FC<ExerciseCardProps> = React.memo(({ exercise, onSelect, isCurrent, isSelected, totalSets, completedSets, position, isCompleted }) => {
  const { data: exerciseData, isLoading } = useGetExerciseByIdQuery(
    { id: exercise.id },
    { skip: !exercise.id }
  );

  const exerciseNode = exerciseData?.exercisesCollection?.edges?.[0]?.node;
  const cleanName = exerciseNode?.name?.replace(/\s*\([^)]*\)/g, '').trim() || exercise.name;
  const thumbnailUrl = exerciseNode?.slug 
    ? `https://kmtddcpdqkeqipyetwjs.supabase.co/storage/v1/object/public/workouts/processed/${exerciseNode.slug}/${exerciseNode.slug}_cropped_thumbnail_low.jpg`
    : null;
  const muscles = exerciseNode?.muscle_categories?.filter(Boolean).join(', ') || '';

  return (
    <Animated.View
      layout={Layout.springify().damping(15).stiffness(150)}
    >
      <TouchableOpacity
        style={[
          styles.exerciseCard,
          isSelected && styles.exerciseCardSelected,
          isCurrent && styles.exerciseCardCurrent
        ]}
        onPress={onSelect}
        activeOpacity={0.7}
        disabled={isCurrent}
      >
        <AutoSkeletonView 
          isLoading={isLoading}
          shimmerSpeed={1.5}
          animationType="gradient"
          defaultRadius={12}
        >
          <View style={styles.cardContent}>
            {/* Position Number Badge */}
            <View style={styles.positionBadge}>
              <Text style={styles.positionBadgeText}>{position}</Text>
            </View>
            
            <View style={styles.exerciseImageContainer}>
            {thumbnailUrl ? (
              <Image
                source={{ uri: thumbnailUrl }}
                style={styles.exerciseImage}
                contentFit="cover"
                cachePolicy="memory-disk"
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
            <Text style={styles.exerciseName} numberOfLines={2}>
              {cleanName}
            </Text>
            {muscles && (
              <Text style={styles.exerciseMuscles} numberOfLines={1}>
                {muscles}
              </Text>
            )}
            {isCurrent && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>Now</Text>
              </View>
            )}
            {/* Completed badge */}
            {isCompleted && totalSets > 0 && (
              <View style={styles.completedBadge}>
                <Image
                  source={require('../assets/icons/check.svg')}
                  style={styles.checkIcon}
                  contentFit="contain"
                />
              </View>
            )}
            {/* Progress bar showing completed sets */}
            {totalSets > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(completedSets / totalSets) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {completedSets}/{totalSets} sets
                </Text>
              </View>
            )}
          </View>
        </View>
      </AutoSkeletonView>
    </TouchableOpacity>
    </Animated.View>
  );
});

interface SwitchExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  currentExercise: {
    id: string;
    name: string;
    slug?: string;
  } | null;
  workoutEntries: Array<{
    id: string;
    exercise_id: string;
    sets: number;
    exercises?: {
      id: string;
      name: string;
      slug?: string;
      muscle_categories?: string[] | null;
    } | null;
  }>;
  currentExerciseIndex: number;
  // Completed sets data to filter out completed exercises
  setsCompleted?: Array<{
    exerciseId: string;
    setId: string;
  }>;
}

const SwitchExerciseModal: React.FC<SwitchExerciseModalProps> = React.memo(({ 
  visible, 
  onClose, 
  currentExercise,
  workoutEntries,
  currentExerciseIndex,
  setsCompleted = []
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const SHEET_HEIGHT = SCREEN_HEIGHT;
  
  const translateY = useSharedValue(SHEET_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const [selectedExerciseSlug, setSelectedExerciseSlug] = React.useState<string | null>(null);
  const [previewEntries, setPreviewEntries] = React.useState(workoutEntries);

  // Show all exercises with smart reordering: completed exercises go to bottom
  // Use preview entries if swap is selected, otherwise use workout entries
  const availableExercises = useMemo(() => {
    const entriesToShow = selectedExerciseSlug ? previewEntries : workoutEntries;
    
    // Map entries with completion status
    const exercisesWithStatus = entriesToShow
      .map((entry, index) => {
        // Count completed sets for this entry
        const completedSetsForEntry = setsCompleted.filter(
          (sc) => sc.setId.startsWith(`${entry.id}-set-`)
        );
        const completedSetsCount = completedSetsForEntry.length;
        
        const exercise = entry.exercises;
        const isCurrent = exercise?.id === currentExercise?.id;
        const isSelected = exercise?.slug === selectedExerciseSlug;
        const isCompleted = completedSetsCount >= entry.sets && entry.sets > 0;
        
        return {
          entry,
          entryId: entry.id,
          originalIndex: index,
          exercise: exercise,
          totalSets: entry.sets,
          completedSets: completedSetsCount,
          isCurrent,
          isSelected,
          isCompleted,
        };
      })
      .filter(({ exercise }) => exercise);
    
    // Sort: current exercise stays accessible, then upcoming (not completed), then completed at very bottom
    const sorted = [...exercisesWithStatus].sort((a, b) => {
      // Current exercise always stays accessible (even if completed)
      if (a.isCurrent && !b.isCurrent) return -1;
      if (!a.isCurrent && b.isCurrent) return 1;
      
      // Both completed (and not current): maintain order
      if (a.isCompleted && b.isCompleted) {
        return a.originalIndex - b.originalIndex;
      }
      
      // One completed (and not current): completed goes to bottom
      if (a.isCompleted && !b.isCompleted && !b.isCurrent) return 1;
      if (!a.isCompleted && b.isCompleted && !a.isCurrent) return -1;
      
      // Neither completed: maintain original order
      return a.originalIndex - b.originalIndex;
    });
    
    // Add position numbers based on sorted order
    return sorted.map((item, index) => ({
      ...item,
      position: index + 1,
      index,
    }));
  }, [workoutEntries, previewEntries, selectedExerciseSlug, currentExercise, setsCompleted]);

  // Handle sheet animation
  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 25, stiffness: 150, mass: 0.8 });
      backdropOpacity.value = withTiming(0.5, { duration: 300 });
    } else {
      translateY.value = withSpring(SHEET_HEIGHT, { damping: 20, stiffness: 200 });
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  // Handle hardware back button
  useEffect(() => {
    if (!visible) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });

    return () => backHandler.remove();
  }, [visible, onClose]);

  // Gesture handler for drag to dismiss
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: { startY: number }) => {
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      const newY = ctx.startY + event.translationY;
      translateY.value = Math.max(0, newY);
    },
    onEnd: (event) => {
      const shouldDismiss = event.translationY > SHEET_HEIGHT * 0.3 || event.velocityY > 500;
      
      if (shouldDismiss) {
        translateY.value = withSpring(SHEET_HEIGHT, { damping: 20, stiffness: 200 });
        backdropOpacity.value = withTiming(0, { duration: 200 });
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, { damping: 25, stiffness: 150, mass: 0.8 });
      }
    },
  });

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  // Preview the swap without saving
  const handleSelectExercise = (targetSlug: string) => {
    if (!targetSlug) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedExerciseSlug(targetSlug);
    
    // Create preview of reordered entries
    const currentIndex = currentExerciseIndex;
    const targetIndex = workoutEntries.findIndex(
      entry => entry.exercises?.slug === targetSlug
    );
    
    if (targetIndex !== -1 && targetIndex !== currentIndex) {
      const preview = [...workoutEntries];
      const [movedEntry] = preview.splice(currentIndex, 1);
      preview.push(movedEntry);
      setPreviewEntries(preview);
    }
  };

  // Confirm and save the swap
  const handleConfirmSwap = async () => {
    if (!selectedExerciseSlug) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      await dispatch(
        jumpToExerciseAndQueueCurrent({
          targetExerciseSlug: selectedExerciseSlug,
          reason: 'User switched exercise order',
        })
      ).unwrap();

      // Close after a brief delay to show completion
      setTimeout(() => {
        onClose();
        setSelectedExerciseSlug(null);
        setPreviewEntries(workoutEntries);
      }, 500);
    } catch (error: any) {
      console.error('Failed to switch exercise:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Reset preview when modal closes
  useEffect(() => {
    if (!visible) {
      setSelectedExerciseSlug(null);
      setPreviewEntries(workoutEntries);
    }
  }, [visible, workoutEntries]);

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
              {/* Hero Thumbnail Section - Current Exercise */}
              {currentExercise && (
                <View style={styles.videoContainer}>
                  <ExerciseThumbnail
                    exerciseName={currentExercise.name}
                    slug={currentExercise.slug}
                  />
                  {/* Close button - inside thumbnail */}
                  <TouchableOpacity
                    style={styles.overlayCloseButton}
                    onPress={onClose}
                  >
                    <Image
                      source={require('../assets/icons/cross.svg')}
                      style={styles.overlayCloseIcon}
                      contentFit="contain"
                    />
                  </TouchableOpacity>
                </View>
              )}

              {/* Content Container */}
              <View style={styles.contentContainer}>
                {/* Title Section */}
                <View style={styles.titleSection}>
                  <Text style={styles.titleText}>Switch Exercise</Text>
                  <Text style={styles.descriptionText}>
                    Tap any exercise to jump to it. The current exercise will move to the end.
                  </Text>
                </View>

                {/* Exercises List */}
                <View style={styles.exercisesSection}>
                  <Text style={styles.sectionTitle}>Workout Exercises</Text>
                  {availableExercises.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyStateText}>
                        No other exercises available to switch to
                      </Text>
                    </View>
                  ) : (
                    <Animated.View style={styles.exercisesList}>
                      {availableExercises.map(({ exercise, index, position, totalSets, completedSets, isCurrent, isSelected, isCompleted, entryId }) => {
                        if (!exercise) return null;
                        return (
                          <ExerciseCard
                            key={entryId}
                            exercise={exercise}
                            onSelect={() => !isCurrent && handleSelectExercise(exercise.slug || '')}
                            isCurrent={isCurrent}
                            isSelected={isSelected}
                            totalSets={totalSets}
                            completedSets={completedSets}
                            position={position}
                            isCompleted={isCompleted}
                          />
                        );
                      })}
                    </Animated.View>
                  )}
                </View>
              </View>
            </ScrollView>
            
            {/* Action Button Container - Always visible */}
            <View style={[styles.actionButtonContainer, { paddingBottom: insets.bottom + 16 }]}>
              <Button
                mode="contained"
                onPress={handleConfirmSwap}
                disabled={!selectedExerciseSlug}
                style={[
                  styles.confirmButton,
                  !selectedExerciseSlug && styles.confirmButtonDisabled
                ]}
                labelStyle={styles.confirmButtonLabel}
                contentStyle={styles.confirmButtonContent}
                compact={false}
              >
                {selectedExerciseSlug ? 'Confirm Swap' : 'Select an Exercise'}
              </Button>
            </View>
          </SafeAreaView>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
});

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 4000,
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
  overlayCloseButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  overlayCloseIcon: {
    width: 24,
    height: 24,
    tintColor: nucleus.light.semantic.fg.base,
  },
  scrollView: {
    flex: 1,
  },
  videoContainer: {
    position: 'relative',
    height: 200,
    width: '100%',
    backgroundColor: nucleus.light.semantic.bg.muted,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
    alignSelf: 'stretch',
  },
  heroContainer: {
    height: 200,
    width: '100%',
    backgroundColor: nucleus.light.semantic.bg.muted,
    overflow: 'hidden',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignSelf: 'stretch',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    alignSelf: 'stretch',
  },
  contentContainer: {
    padding: 24,
    paddingTop: 16,
    gap: 24,
  },
  titleSection: {
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 32,
    lineHeight: 38.4,
    letterSpacing: -1,
    color: nucleus.light.semantic.fg.base,
    textAlign: 'center',
    includeFontPadding: false,
  },
  descriptionText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: nucleus.light.semantic.fg.muted,
    textAlign: 'center',
    includeFontPadding: false,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 20,
    lineHeight: 24,
    color: nucleus.light.semantic.fg.base,
    includeFontPadding: false,
  },
  exercisesSection: {
    gap: 12,
  },
  exercisesList: {
    gap: 12,
  },
  exerciseCard: {
    backgroundColor: nucleus.light.semantic.bg.subtle,
    borderRadius: 12,
    overflow: 'hidden',
  },
  exerciseCardSelected: {
    borderWidth: 2,
    borderColor: nucleus.light.global.blue["70"],
    backgroundColor: nucleus.light.global.blue["10"],
  },
  exerciseCardCurrent: {
    opacity: 0.6,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    position: 'relative',
  },
  positionBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: nucleus.light.global.blue["70"],
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 2,
    borderColor: nucleus.light.semantic.bg.canvas,
  },
  positionBadgeText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    lineHeight: 18,
    color: nucleus.light.global.white,
    includeFontPadding: false,
  },
  exerciseImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: nucleus.light.semantic.bg.muted,
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  exerciseInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  exerciseName: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    lineHeight: 20,
    color: nucleus.light.semantic.fg.base,
    includeFontPadding: false,
  },
  exerciseMuscles: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    lineHeight: 18,
    color: nucleus.light.semantic.fg.muted,
    includeFontPadding: false,
  },
  currentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: nucleus.light.global.blue["70"],
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
  },
  currentBadgeText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    lineHeight: 16,
    color: nucleus.light.global.white,
    includeFontPadding: false,
  },
  completedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: nucleus.light.global.white,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  checkIcon: {
    width: 16,
    height: 16,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: nucleus.light.semantic.fg.muted,
    textAlign: 'center',
    includeFontPadding: false,
  },
  progressContainer: {
    marginTop: 8,
    gap: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: nucleus.light.semantic.bg.muted,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: nucleus.light.global.blue["70"],
    borderRadius: 2,
  },
  progressText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    lineHeight: 16,
    color: nucleus.light.semantic.fg.muted,
    includeFontPadding: false,
  },
  actionButtonContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: nucleus.light.semantic.bg.canvas,
    borderTopWidth: 1,
    borderTopColor: nucleus.light.semantic.border.muted,
  },
  confirmButton: {
    borderRadius: 48,
    minHeight: 48,
    backgroundColor: nucleus.light.global.blue["70"],
  },
  confirmButtonDisabled: {
    backgroundColor: nucleus.light.semantic.bg.muted,
    opacity: 0.5,
  },
  confirmButtonContent: {
    minHeight: 48,
    paddingHorizontal: 24,
    paddingVertical: 0,
  },
  confirmButtonLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    lineHeight: 20,
    color: nucleus.light.global.blue["10"],
    marginVertical: 0,
    includeFontPadding: false,
  },
});

export default SwitchExerciseModal;

