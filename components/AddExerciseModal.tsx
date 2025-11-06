import { BlurView } from 'expo-blur';
import { Image } from "expo-image";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, BackHandler, Dimensions, FlatList, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { AutoSkeletonView } from "react-native-auto-skeleton";
import { Button, Text } from 'react-native-paper';
import Animated, {
  Easing,
  Extrapolate,
  FadeIn,
  FadeOut,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { nucleus } from '../Buddy_variables';
import { useGetExerciseByIdQuery, useLazyGetAllExercisesQuery } from '../store/api/enhancedApi';
import ExerciseInfoModal from './ExerciseInfoModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BATCH_SIZE = 20; // Number of exercises to load per batch

interface AddExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectExercise?: (exercise: any) => void;
}

const AddExerciseModal = React.memo<AddExerciseModalProps>(function AddExerciseModal({ visible, onClose, onSelectExercise }) {
  const insets = useSafeAreaInsets();
  const SHEET_HEIGHT = SCREEN_HEIGHT;
  
  const translateY = useSharedValue(SHEET_HEIGHT);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  
  // Pagination state
  const [allExercises, setAllExercises] = useState<any[]>([]);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Exercise info modal state
  const [showExerciseInfo, setShowExerciseInfo] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  
  // Selected exercises state
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set());
  
  // Lazy query hook for pagination
  const [fetchExercises, { isLoading, isFetching, data: exercisesData }] = useLazyGetAllExercisesQuery();
  
  // Load initial batch when modal opens
  useEffect(() => {
    if (visible && allExercises.length === 0) {
      fetchExercises({ first: BATCH_SIZE, after: null });
    }
  }, [visible]);
  
  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setAllExercises([]);
      setEndCursor(null);
      setHasNextPage(true);
      setSearchQuery('');
      setSelectedMuscleGroup(null);
      setSelectedExercises(new Set());
      setShowSelectedOnly(false);
    }
  }, [visible]);
  
  // Update accumulated exercises when new data arrives
  useEffect(() => {
    if (exercisesData?.exercisesCollection) {
      const newEdges = exercisesData.exercisesCollection.edges || [];
      const pageInfo = exercisesData.exercisesCollection.pageInfo;
      
      if (endCursor === null) {
        // First load - replace all exercises
        setAllExercises(newEdges);
      } else {
        // Subsequent loads - append new exercises, avoiding duplicates
        setAllExercises(prev => {
          const existingIds = new Set(prev.map(edge => edge.node.id));
          const uniqueNewEdges = newEdges.filter(edge => !existingIds.has(edge.node.id));
          return [...prev, ...uniqueNewEdges];
        });
      }
      
      setEndCursor(pageInfo?.endCursor || null);
      setHasNextPage(pageInfo?.hasNextPage || false);
      setIsLoadingMore(false);
    }
  }, [exercisesData, endCursor]);
  
  // Extract all unique muscle categories from all loaded exercises
  const muscleGroups = useMemo(() => {
    if (allExercises.length === 0) return [];
    
    const groups = new Set<string>();
    allExercises.forEach((edge: any) => {
      if (edge.node.muscle_categories) {
        edge.node.muscle_categories.forEach((cat: string | null) => {
          if (cat) groups.add(cat);
        });
      }
    });
    
    return Array.from(groups).sort();
  }, [allExercises]);
  
  // Filter exercises based on search and muscle group
  const filteredExercises = useMemo(() => {
    if (allExercises.length === 0) return [];
    
    let filtered = allExercises.filter((edge: any) => {
      const exercise = edge.node;
      
      // Filter by selected only
      if (showSelectedOnly) {
        if (!selectedExercises.has(exercise.id)) return false;
      }
      
      // Filter by muscle group
      if (selectedMuscleGroup) {
        const hasMuscleGroup = exercise.muscle_categories?.some(
          (cat: string | null) => cat === selectedMuscleGroup
        );
        if (!hasMuscleGroup) return false;
      }
      
      // Filter by search query
      if (searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase();
        const nameMatch = exercise.name?.toLowerCase().includes(searchLower);
        return nameMatch;
      }
      
      return true;
    });
    
    // Sort: selected exercises first, then unselected
    return filtered.sort((a: any, b: any) => {
      const aSelected = selectedExercises.has(a.node.id);
      const bSelected = selectedExercises.has(b.node.id);
      
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0;
    });
  }, [allExercises, searchQuery, selectedMuscleGroup, selectedExercises, showSelectedOnly]);
  
  // Load more exercises when scrolling near the end
  const loadMoreExercises = useCallback(() => {
    if (!hasNextPage || isLoadingMore || isLoading) return;
    
    setIsLoadingMore(true);
    fetchExercises({ first: BATCH_SIZE, after: endCursor });
  }, [hasNextPage, isLoadingMore, isLoading, endCursor, fetchExercises]);
  
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
      return true;
    };
    
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [visible, translateY, onClose, SHEET_HEIGHT]);
  
  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  
  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, SHEET_HEIGHT], [0.7, 0], Extrapolate.CLAMP),
  }));
  
  const handleSelectExercise = useCallback((exercise: any) => {
    setSelectedExercises(prev => {
      const newSet = new Set(prev);
      if (newSet.has(exercise.id)) {
        newSet.delete(exercise.id);
      } else {
        newSet.add(exercise.id);
      }
      return newSet;
    });
  }, []);
  
  const handleAddExercises = useCallback(() => {
    if (selectedExercises.size === 0) return;
    
    // Get selected exercise objects
    const exercisesToAdd = allExercises
      .filter(edge => selectedExercises.has(edge.node.id))
      .map(edge => edge.node);
    
    exercisesToAdd.forEach(exercise => {
      onSelectExercise?.(exercise);
    });
    
    // Reset selection and close modal
    setSelectedExercises(new Set());
    onClose();
  }, [selectedExercises, allExercises, onSelectExercise, onClose]);
  
  // Handle info icon press
  const handleInfoPress = useCallback((exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
    setShowExerciseInfo(true);
  }, []);
  
  // Fetch full exercise data when info modal opens
  const { data: exerciseData } = useGetExerciseByIdQuery(
    { id: selectedExerciseId || '' },
    { skip: !showExerciseInfo || !selectedExerciseId }
  );
  
  // Format exercise data for ExerciseInfoModal
  const formattedExercise = useMemo(() => {
    if (!exerciseData?.exercisesCollection?.edges?.[0]?.node) return undefined;
    
    const exercise = exerciseData.exercisesCollection.edges[0].node;
    const cleanName = exercise.name?.replace(/\s*\([^)]*\)/g, '').trim() || '';
    
    // Parse instructions
    let instructionsParts: string[] = [];
    if (exercise.instructions) {
      // Split by numbered markers like (1st), (2nd), (3rd), etc.
      const parts = exercise.instructions.split(/(?=\(\d+(?:st|nd|rd|th)\))/).filter(Boolean);
      instructionsParts = parts.map((s: string) => {
        // Remove the numbered marker (1st), (2nd), etc. and trim
        return s.replace(/^\(\d+(?:st|nd|rd|th)\)\s*/i, '').trim();
      }).filter(Boolean);
    }
    
    // Extract key form tips
    const instructionsText = exercise.instructions || '';
    const keyFormTipsMatch = instructionsText.match(/Key Form Tips:\s*([^]*?)(?=\n\n|\n\(|$)/i);
    const keyFormTips = keyFormTipsMatch 
      ? keyFormTipsMatch[1].replace(/.*Key Form Tips:\s*/, '').split(/[;,]/).map((tip: string) => tip.trim()).filter(Boolean)
      : ["Follow the form shown in the video", "Start with lighter weights if needed", "Focus on controlled movements"];
    
    // Parse equipment groups
    const equipmentGroups = exercise.equipment_groups;
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
    
    return {
      name: cleanName,
      slug: exercise.slug,
      id: exercise.id,
      instructions: instructionsParts.filter((s: string) => !s.includes('Key Form Tips')) || [],
      tips: keyFormTips || [],
      videoUrl: exercise.slug ? `https://kmtddcpdqkeqipyetwjs.supabase.co/storage/v1/object/public/workouts/processed/${exercise.slug}/${exercise.slug}_cropped_video.mp4` : undefined,
      equipment: parsedGroups.flat().map((slug: string) => 
        slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      ) || [],
      equipmentGroups: parsedGroups || [],
      category: "How to"
    };
  }, [exerciseData]);
  
  // Render exercise item
  const renderExerciseItem = useCallback(({ item: edge, index }: { item: any; index: number }) => {
    const exercise = edge.node;
    const cleanName = exercise.name?.replace(/\s*\([^)]*\)/g, '').trim() || '';
    const thumbnailUrl = exercise.slug 
      ? `https://kmtddcpdqkeqipyetwjs.supabase.co/storage/v1/object/public/workouts/processed/${exercise.slug}/${exercise.slug}_cropped_thumbnail_low.jpg`
      : null;
    
    // Get muscles
    const muscles = exercise.muscle_categories?.join(', ') || '';
    const isSelected = selectedExercises.has(exercise.id);
    
    return (
      <View style={[
        styles.exerciseItemWrapper,
        index === filteredExercises.length - 1 && styles.exerciseItemWrapperLast
      ]}>
        <AutoSkeletonView
          isLoading={isLoading && allExercises.length === 0}
          shimmerSpeed={1.5}
          animationType="gradient"
          defaultRadius={12}
        >
          <TouchableOpacity
            style={[
              styles.exerciseCard,
              isSelected && styles.exerciseCardSelected
            ]}
            onPress={() => handleSelectExercise(exercise)}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              <View style={styles.exerciseRow}>
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
                  <View style={styles.exerciseTextContainer}>
                    <Text style={styles.exerciseNumber} numberOfLines={3} ellipsizeMode="tail">
                      {cleanName}
                    </Text>
                    {muscles && (
                      <Text style={styles.exerciseDetails} numberOfLines={1} ellipsizeMode="tail">
                        {muscles}
                      </Text>
                    )}
                  </View>
                  <View style={styles.playButton}>
                    <Pressable
                      onPress={(e) => {
                        // Prevent card selection when info icon is pressed
                        e.stopPropagation?.();
                        handleInfoPress(exercise.id);
                      }}
                      onPressIn={(e) => {
                        // Prevent parent TouchableOpacity from being triggered
                        e.stopPropagation?.();
                      }}
                      style={({ pressed }) => [
                        { opacity: pressed ? 0.6 : 1 }
                      ]}
                    >
                      <Image
                        source={require('../assets/icons/info.svg')}
                        style={styles.playIcon}
                        contentFit="contain"
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </AutoSkeletonView>
      </View>
    );
  }, [handleSelectExercise, handleInfoPress, filteredExercises.length, selectedExercises, isLoading, allExercises.length]);
  
  // List footer with loading indicator
  const ListFooterComponent = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingMoreContainer}>
        <ActivityIndicator size="small" color={nucleus.light.global.blue[70]} />
      </View>
    );
  }, [isLoadingMore]);
  
  // Empty state
  const ListEmptyComponent = useCallback(() => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {searchQuery || selectedMuscleGroup || showSelectedOnly
            ? 'No exercises found' 
            : 'No exercises available'}
        </Text>
      </View>
    );
  }, [searchQuery, selectedMuscleGroup, showSelectedOnly]);
  
  if (!visible) return null;
  
  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.backdrop, animatedBackdropStyle]} />
      
      <Animated.View style={[styles.sheet, animatedSheetStyle, { height: SHEET_HEIGHT }]}>
        <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
          {/* Drag Handle */}
          <View style={styles.header}>
            <View style={styles.handle} />
          </View>
          
          {/* Close button */}
          <Pressable
            style={[styles.overlayCloseButton, { top: 16 + insets.top }]}
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
          
          {/* Fixed Header - Title, Search, and Filters */}
          <View style={[styles.fixedHeader, { paddingTop: insets.top }]}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.titleText}>Add Exercise</Text>
            </View>
            
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search exercises..."
                placeholderTextColor={nucleus.light.global.grey[60]}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            
            {/* Muscle Group Filters */}
            {muscleGroups.length > 0 && (
              <View style={styles.filtersSection}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filtersScrollContent}
                >
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      !selectedMuscleGroup && !showSelectedOnly && styles.filterChipActive
                    ]}
                    onPress={() => {
                      setSelectedMuscleGroup(null);
                      setShowSelectedOnly(false);
                    }}
                  >
                    <Text style={[
                      styles.filterChipText,
                      !selectedMuscleGroup && !showSelectedOnly && styles.filterChipTextActive
                    ]}>
                      All
                    </Text>
                  </TouchableOpacity>
                  
                  {selectedExercises.size > 0 && (
                    <TouchableOpacity
                      style={[
                        styles.filterChip,
                        showSelectedOnly && styles.filterChipActive
                      ]}
                      onPress={() => {
                        setShowSelectedOnly(!showSelectedOnly);
                        setSelectedMuscleGroup(null);
                      }}
                    >
                      <Text style={[
                        styles.filterChipText,
                        showSelectedOnly && styles.filterChipTextActive
                      ]}>
                        Selected ({selectedExercises.size})
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  {muscleGroups.map((group) => (
                    <TouchableOpacity
                      key={group}
                      style={[
                        styles.filterChip,
                        selectedMuscleGroup === group && styles.filterChipActive
                      ]}
                      onPress={() => {
                        setSelectedMuscleGroup(group);
                        setShowSelectedOnly(false);
                      }}
                    >
                      <Text style={[
                        styles.filterChipText,
                        selectedMuscleGroup === group && styles.filterChipTextActive
                      ]}>
                        {group}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          
          <FlatList
            data={filteredExercises}
            renderItem={renderExerciseItem}
            keyExtractor={(item, index) => `${item.node.id}-${index}`}
            ListFooterComponent={isFetching ? ListFooterComponent : null}
            ListEmptyComponent={isFetching ? null : ListEmptyComponent}
            contentContainerStyle={[
              { paddingTop: 0 },
              filteredExercises.length === 0 && styles.exercisesListEmpty
            ]}
            onEndReached={loadMoreExercises}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            removeClippedSubviews={true}
          />
        </SafeAreaView>
        
        {/* Floating Add Exercises Button */}
        {selectedExercises.size > 0 && (
          <Animated.View
            entering={FadeIn.duration(200).easing(Easing.out(Easing.ease))}
            exiting={FadeOut.duration(150).easing(Easing.in(Easing.ease))}
            style={[styles.addButtonContainer, { bottom: 16 + insets.bottom }]}
          >
            <BlurView intensity={100} tint="light" style={styles.addButtonBlur}>
              <Button
                mode="contained"
                onPress={handleAddExercises}
                style={styles.addButton}
                contentStyle={styles.addButtonContent}
                compact={false}
              >
                <Animated.Text
                  key={`text-${selectedExercises.size}`}
                  entering={FadeIn.duration(150).easing(Easing.out(Easing.ease))}
                  style={styles.addButtonLabel}
                >
                  Add {selectedExercises.size} {selectedExercises.size === 1 ? 'exercise' : 'exercises'}
                </Animated.Text>
              </Button>
            </BlurView>
          </Animated.View>
        )}
      </Animated.View>
      
      {/* Exercise Info Modal */}
      <ExerciseInfoModal
        visible={showExerciseInfo && !!formattedExercise}
        onClose={() => {
          setShowExerciseInfo(false);
          setSelectedExerciseId(null);
        }}
        exercise={formattedExercise}
      />
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
  overlayCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
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
  fixedHeader: {
    backgroundColor: nucleus.light.semantic.bg.canvas,
    zIndex: 10,
  },
  listHeaderContainer: {
    width: '100%',
  },
  titleSection: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 24,
    width: '100%',
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
  searchContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    width: '100%',
  },
  searchInput: {
    backgroundColor: nucleus.light.semantic.bg.subtle,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: nucleus.light.semantic.fg.base,
    includeFontPadding: false,
  },
  filtersSection: {
    paddingBottom: 16,
    width: '100%',
  },
  filtersScrollContent: {
    paddingHorizontal: 24,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: nucleus.light.semantic.bg.subtle,
    borderWidth: 1,
    borderColor: nucleus.light.semantic.border.muted,
  },
  filterChipActive: {
    backgroundColor: nucleus.light.global.blue[70],
    borderColor: nucleus.light.global.blue[70],
  },
  filterChipText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: nucleus.light.global.grey[80],
    includeFontPadding: false,
  },
  filterChipTextActive: {
    color: nucleus.light.global.blue[10],
  },
  exercisesList: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  exercisesListEmpty: {
    flexGrow: 1,
  },
  exerciseItemWrapper: {
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  exerciseItemWrapperLast: {
    marginBottom: 0,
  },
  exerciseCard: {
    backgroundColor: nucleus.light.semantic.bg.subtle,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    alignSelf: 'stretch',
    position: 'relative',
    overflow: 'hidden',
  },
  exerciseCardSelected: {
    backgroundColor: nucleus.light.global.blue[10],
  },
  cardContent: {
    gap: 12,
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
  loadingMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    color: nucleus.light.global.grey[60],
    includeFontPadding: false,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    color: nucleus.light.global.grey[60],
    includeFontPadding: false,
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    zIndex: 100,
    alignItems: 'center',
  },
  addButtonBlur: {
    borderRadius: 48,
    overflow: 'hidden',
    alignSelf: 'center',
    width: 280,
  },
  addButton: {
    borderRadius: 48,
    minHeight: 48,
    justifyContent: 'center',
    backgroundColor: nucleus.light.global.blue[70],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonContent: {
    minHeight: 48,
    paddingHorizontal: 24,
    paddingVertical: 0,
  },
  addButtonLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    lineHeight: 20,
    marginVertical: 0,
    includeFontPadding: false,
    color: nucleus.light.global.blue[10],
  },
});

export default AddExerciseModal;

