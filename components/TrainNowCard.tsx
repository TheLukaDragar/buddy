import { Image } from "expo-image";
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { nucleus } from '../Buddy_variables.js';

export interface PresetData {
  id: string;
  name: string;
  description: string;
  day_name: string;
  image_key: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_duration: number;
  exercise_count?: number;
  total_sets?: number;
}

interface TrainNowCardProps {
  presets?: PresetData[];
  onPresetPress?: (preset: PresetData) => void;
  onViewAllPress?: () => void;
  onGeneratePress?: () => void;
  isLoading?: boolean;
}

// Map image keys to require statements
const getPresetImage = (imageKey: string) => {
  const imageMap: { [key: string]: any } = {
    'push': require('../assets/dayname/push.png'),
    'pull': require('../assets/dayname/pull.png'),
    'legs': require('../assets/dayname/legs.png'),
    'fullbody': require('../assets/dayname/full-body.png'),
    'full-body': require('../assets/dayname/full-body.png'),
    'arms': require('../assets/dayname/arms.png'),
    'chest': require('../assets/dayname/chest.png'),
    'back': require('../assets/dayname/back.png'),
    'shoulders': require('../assets/dayname/shoulders.png'),
    'core': require('../assets/dayname/core.png'),
  };

  return imageMap[imageKey?.toLowerCase()] || require('../assets/dayname/full-body.png');
};

// Get difficulty color
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return {
        bg: nucleus.light.global.green["20"],
        text: nucleus.light.global.green["80"]
      };
    case 'medium':
      return {
        bg: nucleus.light.global.brand["40"],
        text: nucleus.light.global.brand["90"]
      };
    case 'hard':
      return {
        bg: nucleus.light.global.orange["30"],
        text: nucleus.light.global.orange["90"]
      };
    default:
      return {
        bg: nucleus.light.global.blue["20"],
        text: nucleus.light.global.blue["80"]
      };
  }
};

export default function TrainNowCard({
  presets = [],
  onPresetPress,
  onViewAllPress,
  onGeneratePress,
  isLoading = false
}: TrainNowCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const rotation = useSharedValue(0);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    rotation.value = withTiming(isExpanded ? 0 : 180, { duration: 200 });
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  if (isLoading) {
    return (
      <Animated.View entering={FadeInUp.duration(600).springify()}>
        <TouchableOpacity style={styles.container} onPress={toggleExpand} activeOpacity={0.8}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Train Now</Text>
              <Text style={styles.chevron}>▼</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (presets.length === 0) {
    return null;
  }

  return (
    <Animated.View entering={FadeInUp.duration(600).springify()}>
      <View style={styles.container}>
        {/* Collapsed Header - Always visible */}
        <TouchableOpacity style={styles.header} onPress={toggleExpand} activeOpacity={0.8}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Train Now</Text>
            <Text style={styles.subtitle}>Pre-made Workouts</Text>
            <Animated.Text style={[styles.chevron, chevronStyle]}>▼</Animated.Text>
          </View>
        </TouchableOpacity>

        {/* Expanded Content */}
        {isExpanded && (
          <Animated.View entering={FadeInUp.duration(300)}>
            {/* Generate Custom Workout Button */}
            <TouchableOpacity
              style={styles.generateButton}
              onPress={onGeneratePress}
              activeOpacity={0.8}
            >
              <Text style={styles.generateButtonText}>✨ Generate Custom Workout</Text>
              <Text style={styles.generateButtonSubtext}>Chat with Buddy to create your perfect session</Text>
            </TouchableOpacity>

            {/* Preset Options */}
            <View style={styles.presetsContainer}>
              {presets.slice(0, 4).map((preset) => {
                const difficultyColors = getDifficultyColor(preset.difficulty);

                return (
                  <TouchableOpacity
                    key={preset.id}
                    style={styles.presetCard}
                    onPress={() => onPresetPress?.(preset)}
                    activeOpacity={0.8}
                  >
                    {/* Preset Image */}
                    <View style={styles.presetImageContainer}>
                      <Image
                        source={getPresetImage(preset.image_key)}
                        style={styles.presetImage}
                        contentFit="contain"
                      />
                    </View>

                    {/* Preset Info */}
                    <View style={styles.presetInfo}>
                      <Text style={styles.presetName}>{preset.name}</Text>
                      <View style={styles.presetMeta}>
                        <Text style={styles.presetDuration}>{preset.estimated_duration} min</Text>
                        {preset.exercise_count && (
                          <>
                            <View style={styles.dot} />
                            <Text style={styles.presetDuration}>{preset.exercise_count} ex.</Text>
                          </>
                        )}
                      </View>
                    </View>

                    {/* Difficulty Badge */}
                    <View style={[styles.difficultyBadge, { backgroundColor: difficultyColors.bg }]}>
                      <Text style={[styles.difficultyText, { color: difficultyColors.text }]}>
                        {preset.difficulty.charAt(0).toUpperCase() + preset.difficulty.slice(1)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* View All Button */}
            {presets.length > 4 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={onViewAllPress}
                activeOpacity={0.8}
              >
                <Text style={styles.viewAllText}>View all workouts</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: nucleus.light.semantic.bg.canvas,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16.8,
    color: nucleus.light.semantic.fg.muted,
  },
  subtitle: {
    flex: 1,
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 14,
    color: nucleus.light.semantic.fg.disabled,
  },
  chevron: {
    fontSize: 10,
    color: nucleus.light.semantic.fg.muted,
  },
  generateButton: {
    marginHorizontal: 12,
    marginTop: 4,
    marginBottom: 16,
    backgroundColor: nucleus.light.global.brand["50"],
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  generateButtonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 18,
    color: nucleus.light.global.white,
    marginBottom: 4,
  },
  generateButtonSubtext: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 14,
    color: nucleus.light.global.brand["10"],
  },
  presetsContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: nucleus.light.semantic.bg.subtle,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  presetImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: nucleus.light.global.white,
  },
  presetImage: {
    width: 48,
    height: 48,
  },
  presetInfo: {
    flex: 1,
    gap: 4,
  },
  presetName: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16.8,
    color: nucleus.light.semantic.fg.base,
  },
  presetMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  presetDuration: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 14,
    color: nucleus.light.semantic.fg.muted,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: nucleus.light.global.grey["60"],
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 32,
  },
  difficultyText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 10,
    fontWeight: '700',
  },
  viewAllButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: nucleus.light.global.grey["20"],
  },
  viewAllText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    fontWeight: '700',
    color: nucleus.light.global.blue["50"],
  },
});
