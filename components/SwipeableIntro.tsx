import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Button, Text } from 'react-native-paper';
import Animated, {
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Data ---
const introScreens = [
  {
    image: require('../assets/login/logo.png'),
    title: '👋 Meet Buddy — your personal training guide',
    description: 'Always available. Always adapting.\nBuddy is here to coach, guide, and motivate you — wherever and whenever you train.',
    features: [],
  },
  {
    image: require('../assets/AI.png'),
    title: 'Why Buddy > a personal trainer?',
    description: '',
    features: [
      'Available 24/7',
      'Tracks your mood and progress',
      'Supports you at home, in the gym, or outdoors',
      'Much more affordable — no strings attached',
    ],
  },
  {
    image: require('../assets/AI2.png'),
    title: 'Small steps, real change.',
    description: 'Stick with Buddy for just a few weeks and you’ll:\n• Build stronger habits\n• Feel more confident in your body\n• Stay consistent without pressure',
    features: [],
  },
  {
    image: require('../assets/login/logo.png'),
    title: 'Time to get to know you.',
    description: 'Buddy will ask you a few quick questions to tailor everything to you.\n(You can always adjust later.)',
    features: [],
    button: {
      text: 'Get started',
      action: 'explore',
    },
  },
];

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.8;


// --- Sub-components ---

// Renders a single screen within the carousel
const IntroScreen = ({ screen, onAction }: { screen: typeof introScreens[0], onAction: (action: string) => void }) => (
  <View style={styles.screenContainer}>
    <View style={styles.screenContent}>
      <Image source={screen.image} style={styles.characterImage} contentFit="contain" />
      <Text style={styles.titleText}>{screen.title}</Text>
      
      {screen.description ? (
        <Text style={styles.descriptionText}>{screen.description}</Text>
      ) : null}

      {screen.features.length > 0 && (
        <View style={styles.featuresList}>
          {screen.features.map((feature: string, i: number) => (
            <View key={i} style={styles.featureItem}>
              <Image source={require('../assets/check.png')} style={styles.checkIcon} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      )}

      {screen.button && (
        <Button
          mode="contained"
          onPress={() => onAction(screen.button.action)}
          style={styles.getStartedButton}
          labelStyle={styles.getStartedButtonLabel}
          compact={false}
        >
          {screen.button.text}
        </Button>
      )}
    </View>
  </View>
);

// Renders the pagination dots
const Pagination = ({ activeIndex, count }: { activeIndex: number, count: number }) => (
  <View style={styles.pagination}>
    {Array.from({ length: count }).map((_, index) => (
      <View key={index} style={[styles.dot, activeIndex === index ? styles.activeDot : styles.inactiveDot]} />
    ))}
  </View>
);


// --- Main Swipeable Component ---

interface SwipeableIntroProps {
  visible: boolean;
  onDismiss: () => void;
  onExplore: () => void;
}

export default function SwipeableIntro({ visible, onDismiss, onExplore }: SwipeableIntroProps) {
  const translateY = useSharedValue(SHEET_HEIGHT);
  const [activeScreen, setActiveScreen] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 25, stiffness: 150, mass: 0.8 });
    } else {
      translateY.value = withSpring(SHEET_HEIGHT, { damping: 20, stiffness: 200 });
    }
  }, [visible]);

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
        translateY.value = withSpring(SHEET_HEIGHT);
        runOnJS(onDismiss)();
      } else {
        translateY.value = withSpring(0);
      }
    },
  });

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, SHEET_HEIGHT], [0.7, 0], Extrapolate.CLAMP),
  }));
  
  const handleScroll = (event: any) => {
    const pageIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (pageIndex !== activeScreen) {
      setActiveScreen(pageIndex);
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.7)" />
      
      <Animated.View style={[styles.backdrop, animatedBackdropStyle]} onTouchEnd={onDismiss} />

      <PanGestureHandler
        onGestureEvent={gestureHandler}
        activeOffsetY={20}
        failOffsetX={[-10, 10]}
      >
        <Animated.View style={[styles.sheet, animatedSheetStyle]}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.handle} />
            
            <View style={styles.topBar}>
              <Button mode="text" onPress={onDismiss} labelStyle={styles.skipText} compact={false}>
                Skip
              </Button>
            </View>

            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScroll}
              scrollEventThrottle={16}
            >
              {introScreens.map((screen, index) => (
                <IntroScreen
                  key={index}
                  screen={screen}
                  onAction={(action: string) => {
                    if (action === 'explore') {
                      onDismiss(); // Dismiss the sheet first
                      router.push('/onboarding'); // Then navigate
                    }
                  }}
                />
              ))}
            </ScrollView>

            <View style={styles.bottomSection}>
              <Pagination count={introScreens.length} activeIndex={activeScreen} />
              <Text style={styles.swipeText}>Swipe to Explore</Text>
            </View>
          </SafeAreaView>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  // --- Main Structure ---
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 1000 },
  backdrop: { flex: 1, backgroundColor: '#000000' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: '#f1f3e8',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  safeArea: { flex: 1 },
  handle: {
    width: 48,
    height: 5,
    backgroundColor: '#898d8f',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 8,
  },
  topBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
  },
  skipText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    color: '#131214',
    fontWeight: '700',
  },
  
  // --- Screen Content ---
  screenContainer: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60, // Space for the bottom pagination
  },
  screenContent: {
    width: '100%',
    paddingHorizontal: 32, // Increased padding for better text wrapping
    alignItems: 'center',
    gap: 16,
  },
  characterImage: {
    width: 168,
    height: 168,
    marginBottom: 8,
  },
  titleText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 28.8, // Correct 120% line height
    letterSpacing: -1,
    color: '#131214',
    textAlign: 'center',
  },
  descriptionText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#131214',
    textAlign: 'center',
  },
  
  // --- Features List ---
  featuresList: {
    gap: 12,
    alignItems: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  checkIcon: {
    width: 24,
    height: 24,
  },
  featureText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#131214',
    textAlign: 'center',
  },

  // --- Bottom Section ---
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 24,
    paddingBottom: 40, // More space at the bottom
    gap: 16,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: '#d0dd17',
  },
  inactiveDot: {
    backgroundColor: '#c5ddeb',
  },
  swipeText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    color: '#898d8f',
  },
  getStartedButton: {
    marginTop: 24,
    borderRadius: 48,
    minHeight: 48,
    justifyContent: 'center',
    backgroundColor: '#3c81a7',
    width: '100%',
  },
  getStartedButtonLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    color: '#e3eff5',
  },
}); 