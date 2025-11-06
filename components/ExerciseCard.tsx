import { Image } from "expo-image";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AutoSkeletonView } from "react-native-auto-skeleton";
import { nucleus } from "../Buddy_variables";
import { useGetExerciseByIdQuery } from "../store/api/enhancedApi";

interface ExerciseCardProps {
  workoutEntry: {
    id: string;
    exercise_id: string;
    sets: number;
    reps?: string | null;
    weight?: string | null;
    time?: string | null;
    notes?: string | null;
  };
  onPress: (exercise: any) => void; // Pass exercise data to parent
  getEquipmentIcon: (slug: string) => any;
}

export default function ExerciseCard({ workoutEntry, onPress, getEquipmentIcon }: ExerciseCardProps) {
  // Fetch exercise data separately - avoids nested relationship caching issues!
  const { data: exerciseData, isLoading } = useGetExerciseByIdQuery(
    { id: workoutEntry.exercise_id },
    { skip: !workoutEntry.exercise_id }
  );

  const exercise = exerciseData?.exercisesCollection?.edges?.[0]?.node;

  // Parse equipment groups
  const equipmentGroups = useMemo(() => {
    if (!exercise?.equipment_groups) return [];
    
    if (typeof exercise.equipment_groups === 'string') {
      try {
        const parsed = JSON.parse(exercise.equipment_groups);
        return parsed.groups || [];
      } catch (e) {
        console.error('Failed to parse equipment_groups:', e);
        return [];
      }
    } else if (exercise.equipment_groups && typeof exercise.equipment_groups === 'object') {
      return exercise.equipment_groups.groups || [];
    }
    return [];
  }, [exercise?.equipment_groups]);

  // Clean exercise name
  const cleanName = exercise?.name?.replace(/\s*\([^)]*\)/g, '').trim() || 'Loading...';
  
  // Get thumbnail URL
  const thumbnailUrl = exercise?.slug 
    ? `https://kmtddcpdqkeqipyetwjs.supabase.co/storage/v1/object/public/workouts/processed/${exercise.slug}/${exercise.slug}_cropped_thumbnail_low.jpg`
    : null;

  // Get muscles
  const muscles = exercise?.muscle_categories?.join(', ') || '';

  // Check if only one equipment item
  const totalEquipmentItems = equipmentGroups.reduce((sum, group) => sum + group.length, 0);
  const hasOnlyOneEquipment = totalEquipmentItems === 1 && equipmentGroups.length === 1;

  const handlePress = () => {
    // Pass the fresh exercise data to the parent
    if (exercise) {
      onPress(exercise);
    }
  };

  return (
    <TouchableOpacity
      key={`${workoutEntry.id}-${workoutEntry.exercise_id}`} // Key includes exercise_id to force re-render when it changes
      style={styles.exerciseCard}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={!exercise} // Disable if exercise data not loaded
    >
      <AutoSkeletonView 
        isLoading={isLoading || !exercise}
        shimmerSpeed={1.5}
        animationType="gradient"
        defaultRadius={12}
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
                  onError={() => {
                    console.log('Failed to load exercise thumbnail:', thumbnailUrl);
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
                  {cleanName}
                </Text>
                <Text style={styles.exerciseDetails} numberOfLines={1} ellipsizeMode="tail">
                  {workoutEntry.sets} sets  •  {muscles}
                </Text>
                
                {/* If only one equipment, show it here inline */}
                {hasOnlyOneEquipment && equipmentGroups[0] && (
                  <View style={styles.equipmentInlineContainer}>
                    {equipmentGroups[0].map((equipmentSlug: string) => {
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
          {!hasOnlyOneEquipment && equipmentGroups.length > 0 && (
            <View style={styles.exerciseEquipmentContainer}>
              {equipmentGroups.map((group, groupIndex) => (
                <View key={groupIndex} style={styles.equipmentGroupWrapper}>
                  {/* Each group is a row of alternatives (OR) */}
                  <View style={styles.equipmentAlternativesRow}>
                    {group.map((equipmentSlug: string, itemIndex: number) => {
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
                  {groupIndex < equipmentGroups.length - 1 && (
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
        </View>
      </AutoSkeletonView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  exerciseCard: {
    backgroundColor: nucleus.light.global.white,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    alignSelf: 'stretch',
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
});

