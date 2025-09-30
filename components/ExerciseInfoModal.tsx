import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect, useMemo } from 'react';
import { BackHandler, Dimensions, Pressable, ScrollView, StyleSheet, View } from 'react-native';
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

// Exercise Video Component
interface ExerciseVideoProps {
  videoUrl?: string;
  exerciseName: string;
  slug?: string;
}

const ExerciseVideo: React.FC<ExerciseVideoProps> = React.memo(({ videoUrl, exerciseName, slug }) => {
  console.log('ExerciseVideo - Props:', { videoUrl, exerciseName, slug });
  const [showPlaceholder, setShowPlaceholder] = React.useState(true);

  // Always show placeholder if no slug
  if (!slug) {
    console.log('ExerciseVideo - No slug, showing placeholder');
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

  const videoUri = `https://kmtddcpdqkeqipyetwjs.supabase.co/storage/v1/object/public/workouts/processed/${slug}/${slug}_cropped_video.mp4`;
  console.log('ExerciseVideo - Video URL:', videoUri);

  const player = useVideoPlayer(videoUri, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  // Handle video loading and errors
  useEffect(() => {
    if (!player) return;

    const unsubscribe = player.addListener('statusChange', (status) => {
      console.log('ExerciseVideo - Player status:', status);

      if (status.status === 'readyToPlay') {
        console.log('ExerciseVideo - Video loaded successfully, hiding placeholder');
        setShowPlaceholder(false);
      } else if (status.status === 'error') {
        console.log('ExerciseVideo - Video failed to load, showing placeholder');
        setShowPlaceholder(true);
      }
    });

    return () => {
      unsubscribe.remove();
    };
  }, [player]);

  if (showPlaceholder) {
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
      <VideoView
        player={player}
        style={styles.heroVideo}
        nativeControls={false}
        contentFit="cover"
      />
    </View>
  );
});

interface ExerciseInfoModalProps {
  visible: boolean;
  onClose: () => void;
  exercise?: {
    name: string;
    category: string;
    instructions: string[];
    tips: string[];
    equipment: string[];
    videoUrl?: string;
    imageUrl?: string;
    slug?: string;
    id?: string;
  };
}

const ExerciseInfoModal = React.memo<ExerciseInfoModalProps>(function ExerciseInfoModal({ visible, onClose, exercise }) {
  const insets = useSafeAreaInsets();
  const SHEET_HEIGHT = SCREEN_HEIGHT;
  
  const translateY = useSharedValue(SHEET_HEIGHT);

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
      imageUrl: require('../assets/images/9_16_2.png'),
      videoUrl: undefined,
      slug: undefined,
      id: undefined
    };

    const result = exercise || defaultExercise;
    
    // Only log when the exercise data actually changes
    if (visible && exercise) {
      console.log('ExerciseInfoModal - exerciseData updated:', result);
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

                {/* Equipment Section */}
                <View style={styles.equipmentSection}>
                  <Text style={styles.equipmentTitle}>Equipment</Text>
                  <View style={styles.equipmentCard}>
                    <View style={styles.equipmentItem}>
                      <View style={styles.equipmentImageContainer}>
                        <Image
                          source={require('../assets/exercises/squats.png')}
                          style={styles.equipmentImage}
                          contentFit="cover"
                        />
                      </View>
                      <View style={styles.equipmentInfo}>
                        <Text style={styles.equipmentName}>
                          {exerciseData.equipment[0] || "Mat"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
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
  heroVideo: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    padding: 32,
    gap: 24,
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
  equipmentCard: {
    backgroundColor: nucleus.light.global.blue["20"],
    borderRadius: 12,
    padding: 8,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 8,
  },
  equipmentImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: nucleus.light.semantic.bg.canvas,
    justifyContent: 'center',
    alignItems: 'center',
  },
  equipmentImage: {
    width: 60,
    height: 60,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    lineHeight: 19.2, // 1.2 * 16
    color: nucleus.light.global.grey["80"],
    includeFontPadding: false,
  },
});

export default ExerciseInfoModal;
