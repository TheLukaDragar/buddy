import { Image } from "expo-image";
import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
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

interface MusicModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function MusicModal({ visible, onClose }: MusicModalProps) {
  const insets = useSafeAreaInsets();
  const [selectedMusicOption, setSelectedMusicOption] = useState<string>('spotify');
  const [selectedMusicCard, setSelectedMusicCard] = useState<string | null>('beast-mode');

  // Music modal animation values
  const SHEET_HEIGHT = SCREEN_HEIGHT;
  const musicModalTranslateY = useSharedValue(SHEET_HEIGHT);

  useEffect(() => {
    if (visible) {
      musicModalTranslateY.value = withSpring(0, { damping: 25, stiffness: 150, mass: 0.8 });
    } else {
      musicModalTranslateY.value = withSpring(SHEET_HEIGHT, { damping: 20, stiffness: 200 });
    }
  }, [visible, SHEET_HEIGHT]);

  const musicGestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: { startY: number }) => {
      context.startY = musicModalTranslateY.value;
    },
    onActive: (event, context: { startY: number }) => {
      const newTranslateY = context.startY + event.translationY;
      musicModalTranslateY.value = Math.max(0, newTranslateY);
    },
    onEnd: (event) => {
      const shouldDismiss = event.translationY > SHEET_HEIGHT * 0.3 || event.velocityY > 800;
      if (shouldDismiss) {
        musicModalTranslateY.value = withTiming(SHEET_HEIGHT, {
          duration: 250,
          easing: Easing.in(Easing.quad),
        }, (finished) => {
          if (finished) {
            runOnJS(onClose)();
          }
        });
      } else {
        musicModalTranslateY.value = withTiming(0, {
          duration: 200,
          easing: Easing.out(Easing.quad),
        });
      }
    },
  });

  const animatedMusicSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: musicModalTranslateY.value }],
  }));

  const animatedMusicBackdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(musicModalTranslateY.value, [0, SHEET_HEIGHT], [0.7, 0], Extrapolate.CLAMP),
  }));

  if (!visible) return null;

  return (
    <View style={styles.musicOverlay}>
      <Animated.View style={[styles.musicBackdrop, animatedMusicBackdropStyle]} />

      <PanGestureHandler
        onGestureEvent={musicGestureHandler}
        activeOffsetY={20}
        failOffsetX={[-10, 10]}
      >
        <Animated.View style={[styles.musicSheet, animatedMusicSheetStyle, { height: SHEET_HEIGHT }]}>
          <SafeAreaView style={styles.musicSafeContainer} edges={['bottom']}>
            <View style={styles.musicHeader}>
              <View style={styles.musicHandle} />
            </View>

            {/* Top Bar with Close Button */}
            <View style={styles.musicTopBar}>
              <TouchableOpacity 
                style={styles.musicCloseIcon}
                onPress={onClose}
              >
                <Image
                  source={require('../assets/icons/cross.svg')}
                  style={styles.closeIconImage}
                  contentFit="contain"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.musicContentContainer}>
              {/* Title */}
              <Text style={styles.musicMainTitle}>Choose your tempo</Text>
              
              {/* Radio Options */}
              <View style={styles.radioSection}>
                <Pressable 
                  style={styles.radioOption}
                  onPress={() => setSelectedMusicOption('app')}
                >
                  <Text style={styles.radioOptionText}>App music</Text>
                  <View style={[
                    styles.radioButton,
                    selectedMusicOption === 'app' && styles.radioButtonSelected
                  ]}>
                    <View style={[
                      styles.radioButtonInner,
                      { opacity: selectedMusicOption === 'app' ? 1 : 0 }
                    ]} />
                  </View>
                </Pressable>

                <Pressable 
                  style={styles.radioOption}
                  onPress={() => setSelectedMusicOption('spotify')}
                >
                  <Text style={styles.radioOptionText}>Spotify</Text>
                  <View style={[
                    styles.radioButton,
                    selectedMusicOption === 'spotify' && styles.radioButtonSelected
                  ]}>
                    <View style={[
                      styles.radioButtonInner,
                      { opacity: selectedMusicOption === 'spotify' ? 1 : 0 }
                    ]} />
                  </View>
                </Pressable>
              </View>
            </View>

            {/* Music Cards - Outside padded container to take full width */}
            <View style={styles.musicCardsContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.musicCardsContent}
              >
                <Pressable 
                  style={styles.musicCard}
                  onPress={() => setSelectedMusicCard('beast-mode')}
                >
                  <Image
                    source={require('../assets/images/9_16.png')}
                    style={styles.musicCardBackground}
                    contentFit="cover"
                  />
                  <View style={styles.musicCardTopRight}>
                    <View style={[
                      styles.musicBadgeGreen,
                      { opacity: selectedMusicCard === 'beast-mode' ? 1 : 0 }
                    ]}>
                      <Image
                        source={require('../assets/icons/check.svg')}
                        style={styles.checkIcon}
                        contentFit="contain"
                      />
                    </View>
                  </View>
                  <View style={styles.musicCardBottom}>
                    <Text style={styles.musicCardTitle}>Beast Mode</Text>
                  </View>
                </Pressable>

                <Pressable 
                  style={styles.musicCard}
                  onPress={() => setSelectedMusicCard('sweet-session')}
                >
                  <Image
                    source={require('../assets/images/9_16_2.png')}
                    style={styles.musicCardBackground}
                    contentFit="cover"
                  />
                  <View style={styles.musicCardTopRight}>
                    <View style={[
                      styles.musicBadgeGreen,
                      { opacity: selectedMusicCard === 'sweet-session' ? 1 : 0 }
                    ]}>
                      <Image
                        source={require('../assets/icons/check.svg')}
                        style={styles.checkIcon}
                        contentFit="contain"
                      />
                    </View>
                  </View>
                  <View style={styles.musicCardBottom}>
                    <Text style={styles.musicCardTitle}>Sweet Session</Text>
                  </View>
                </Pressable>

                <Pressable 
                  style={styles.musicCard}
                  onPress={() => setSelectedMusicCard('feel')}
                >
                  <Image
                    source={require('../assets/images/9_16_3.png')}
                    style={styles.musicCardBackground}
                    contentFit="cover"
                  />
                  <View style={styles.musicCardTopRight}>
                    <View style={[
                      styles.musicBadgeGreen,
                      { opacity: selectedMusicCard === 'feel' ? 1 : 0 }
                    ]}>
                      <Image
                        source={require('../assets/icons/check.svg')}
                        style={styles.checkIcon}
                        contentFit="contain"
                      />
                    </View>
                  </View>
                  <View style={styles.musicCardBottom}>
                    <Text style={styles.musicCardTitle}>Feel</Text>
                  </View>
                </Pressable>
              </ScrollView>
            </View>

            {/* Bottom Button Container */}
            <View style={styles.musicButtonContainer}>
              <Pressable 
                style={({ pressed }) => [
                  styles.musicSelectButton,
                  {
                    backgroundColor: pressed 
                      ? nucleus.light.global.blue[80] 
                      : nucleus.light.global.blue[70],
                    transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
                  }
                ]}
                onPress={onClose}
              >
                <Text style={styles.musicSelectButtonText}>Select</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  // Music Modal Styles
  musicOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  musicBackdrop: {
    flex: 1,
    backgroundColor: '#000000',
  },
  musicSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: nucleus.light.semantic.bg.canvas,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  musicHeader: {
    height: 24,
    paddingTop: 8,
    paddingBottom: 11,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  musicHandle: {
    width: 48,
    height: 5,
    flexShrink: 0,
    backgroundColor: nucleus.light.semantic.bg.surface,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 8,
  },
  musicTopBar: {
    backgroundColor: nucleus.light.semantic.bg.canvas,
    height: 64,
    paddingHorizontal: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  musicCloseIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIconImage: {
    width: 16,
    height: 16,
  },
  musicContentContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  musicMainTitle: {
    color: nucleus.light.semantic.fg.base,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38.4,
    letterSpacing: 0,
  },
  radioSection: {
    gap: 0,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    paddingVertical: 12,
    gap: 15,
  },
  radioOptionText: {
    flex: 1,
    color: nucleus.light.semantic.fg.base,
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 16,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: nucleus.light.semantic.border.muted,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: nucleus.light.semantic.accent.moderate,
    backgroundColor: nucleus.light.semantic.accent.moderate,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: nucleus.light.semantic.fg.staticLight,
  },
  musicCardsContainer: {
    width: '100%', // Ensure full width of parent
    marginTop: 16,
  },
  musicCardsContent: {
    paddingHorizontal: 16,
    gap: 12,
    flexGrow: 1, // Allow the content to grow
  },
  musicCard: {
    width: SCREEN_WIDTH * 0.4,
    height: 200,
    borderRadius: 16,
    position: 'relative',
    shadowColor: 'rgba(20, 20, 20, 0.12)',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 1,
    elevation: 8,
  },
  musicCardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    width: '100%',
    height: '100%',
  },
  musicCardTopRight: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  musicBadgeGreen: {
    backgroundColor: nucleus.light.global.brand["30"],
    borderRadius: 32,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  musicBadgeWhite: {
    backgroundColor: nucleus.light.semantic.bg.canvas,
    borderRadius: 32,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    width: 16,
    height: 16,
  },
  newBadgeText: {
    color: nucleus.light.semantic.fg.base,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 12,
  },
  musicCardBottom: {
    position: 'absolute',
    bottom: 16,
    left: 8,
    right: 8,
  },
  musicCardTitle: {
    color: nucleus.light.semantic.fg.staticLight,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 19.2,
  },
  musicButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
    marginTop: 'auto', // Pushes the button to the bottom
  },
  musicSelectButton: {
    height: 48,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  musicSelectButtonText: {
    color: nucleus.light.global.blue[10],
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: 0,
    marginVertical: 0,
    includeFontPadding: false,
  },
  musicSafeContainer: {
    flex: 1,
  },
});

 