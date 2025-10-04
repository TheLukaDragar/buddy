import { router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import { Text } from 'react-native-paper';
import Animated, {
    Easing,
    FadeIn,
    FadeOut,
    Layout,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { nucleus } from '../Buddy_variables';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// Screen data
const screens = [1, 2, 3, 4];

// Pagination component
const Pagination = ({ activeIndex, count }: { activeIndex: number, count: number }) => (
  <Animated.View layout={Layout.duration(250).easing(Easing.out(Easing.cubic))} style={styles.pagination}>
    {Array.from({ length: count }).map((_, index) => (
      <Animated.View
        key={index}
        layout={Layout.duration(200).delay(index * 30).easing(Easing.out(Easing.cubic))}
        style={[
          styles.dot,
          activeIndex === index ? styles.activeDot : styles.inactiveDot
        ]}
      />
    ))}
  </Animated.View>
);

export default function WelcomeScreen() {
  const [activeScreen, setActiveScreen] = useState(0);

  const handleScroll = (event: any) => {
    const pageIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (pageIndex !== activeScreen) {
      setActiveScreen(pageIndex);
    }
  };

  return (
    <View style={styles.fullScreen}>
      <SystemBars style="dark" />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

        {/* Top bar with skip button */}
        <View style={styles.topBar}>
          {activeScreen < screens.length - 1 && (
            <Animated.Text
              entering={FadeIn.duration(250).easing(Easing.out(Easing.quad))}
              exiting={FadeOut.duration(150).easing(Easing.in(Easing.quad))}
              style={styles.skipText}
              onPress={() => router.replace('/onboarding')}
            >
              Skip
            </Animated.Text>
          )}
        </View>

        {/* Scrollable screens */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          {screens.map((_, index) => (
            <View key={index} style={styles.screenContainer}>

              {index === 0 && (
                <>
                <View style={styles.contentView}>
                  <View style={styles.imageContainer}>
                    <Image source={require('../assets/login/logo.png')} style={styles.logoImage} />
                  </View>
                  <Text style={styles.screenTitle}>👋 Meet Buddy — your personal training guide</Text>
                  <Text style={styles.screenDescription}>Always available. Always adapting. Buddy is here to coach, guide, and motivate you — wherever and whenever you train.</Text>
                </View>
                </>
              )}

              {index === 1 && (
                <>
                <View style={styles.contentView2}>
                  <Image source={require('../assets/AI.png')} style={styles.logoImage2} />
                  <Text style={styles.screenTitle2}>Why Buddy {'>'} a personal trainer?</Text>
                  <View style={styles.screenTexts}>
                    <View style={styles.screenTextItem}>
                      <Image source={require('../assets/check.png')} style={styles.checkImage} />
                      <Text style={styles.screenTextItemText}>Available 24/7</Text>
                    </View>
                    <View style={styles.screenTextItem}>
                      <Image source={require('../assets/check.png')} style={styles.checkImage} />
                      <Text style={styles.screenTextItemText}>Tracks your mood and progress</Text>
                    </View>
                    <View style={styles.screenTextItem}>
                      <Image source={require('../assets/check.png')} style={styles.checkImage} />
                      <Text style={[styles.screenTextItemText,{width: 274}]}>Supports you at home, in the gym, or outdoors</Text>
                    </View>
                    <View style={styles.screenTextItem}>
                      <Image source={require('../assets/check.png')} style={styles.checkImage} />
                      <Text style={[styles.screenTextItemText,{width: 262}]}>Much more affordable — no strings attached</Text>
                    </View>
                  </View>
                </View>
                </>
              )}

              {index === 2 && (
                <>
                <View style={styles.contentView}>
                  <View style={styles.imageContainer}>
                    <Image source={require('../assets/AI2.png')} style={styles.logoImage3} />
                  </View>
                  <Text style={styles.screenTitle}>Small steps, real change.</Text>
                  <View style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 8,
                  }}>
                    <Text style={styles.screenDescription3}>Stick with Buddy for just a few weeks and you'll:{'\n'}• Build stronger habits{'\n'}• Feel more confident in your body{'\n'}• Stay consistent without pressure</Text>
                  </View>
                </View>
                </>
              )}

              {index === 3 && (
                <>
                <View style={styles.contentView}>
                  <View style={styles.imageContainer}>
                    <Image source={require('../assets/login/logo.png')} style={styles.logoImage} />
                  </View>
                  <Text style={styles.screenTitle}>Time to get to know you.</Text>
                  <View style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 8,
                  }}>
                    <Text style={styles.screenDescription4}>Buddy will ask you a few quick questions to tailor everything to you. {'\n'} (You can always adjust later.)</Text>
                  </View>
                </View>
                </>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Bottom section with pagination and button */}
        <Animated.View layout={Layout.duration(300).easing(Easing.out(Easing.cubic))} style={styles.bottomSection}>
          <Pagination count={screens.length} activeIndex={activeScreen} />

          {activeScreen < screens.length - 1 && (
            <Animated.Text
              entering={FadeIn.duration(250).easing(Easing.out(Easing.quad))}
              exiting={FadeOut.duration(80).easing(Easing.in(Easing.quad))}
              layout={Layout.duration(200).easing(Easing.out(Easing.cubic))}
              style={styles.swipeText}
            >
              Swipe to Explore
            </Animated.Text>
          )}

          {activeScreen === screens.length - 1 && (
            <Animated.View
              entering={FadeIn.duration(300).delay(50).easing(Easing.out(Easing.quad))}
              exiting={FadeOut.duration(150).easing(Easing.in(Easing.quad))}
              layout={Layout.duration(250).easing(Easing.out(Easing.cubic))}
              style={styles.buttonContainer}
            >
              <Pressable
                style={({ pressed, hovered }) => [
                  styles.getStartedButton,
                  {
                    backgroundColor: pressed
                      ? nucleus.light.global.blue[80]
                      : hovered
                      ? nucleus.light.global.blue[50]
                      : nucleus.light.global.blue[70]
                  }
                ]}
                onPress={() => {
                  router.replace('/onboarding');
                }}
              >
                <Text style={styles.buttonLabel}>Get Started</Text>
              </Pressable>
            </Animated.View>
          )}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: nucleus.light.semantic.bg.subtle,
  },
  container: {
    flex: 1,
  },
  topBar: {
    display: 'flex',
    height: 64,
    padding: 16,
    justifyContent: 'flex-end',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  skipText: {
    position: 'absolute',
    right: 16,
    top: 23,
    color: nucleus.light.global.grey[100],
    textAlign: 'right',
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: 18,
    letterSpacing: 0,
  },
  scrollView: {
    flex: 1,
  },
  screenContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSection: {
    display: 'flex',
    paddingVertical: 24,
    paddingHorizontal: 16,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    alignSelf: 'stretch',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 8,
  },
  activeDot: {
    backgroundColor: nucleus.light.semantic.accent.bold,
  },
  inactiveDot: {
    backgroundColor: nucleus.light.global.blue[20]
  },
  contentView: {
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'stretch',
    minHeight: 373,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitle: {
    color: nucleus.light.semantic.fg.base,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24,
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: 28.8,
    letterSpacing: -1,
  },
  screenDescription: {
    alignSelf: 'stretch',
    color: nucleus.light.semantic.fg.base,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0,
  },
  imageContainer: {
    display: 'flex',
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  logoImage: {
    width: 129.554,
    height: 196,
    aspectRatio: 129.55/196.00,
  },
  swipeText: {
    alignSelf: 'stretch',
    color: nucleus.light.semantic.fg.subtle,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0,
  },
  contentView2: {
    display: 'flex',
    minHeight: 373,
    paddingHorizontal: 16,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'stretch',
  },
  logoImage2: {
    width: 168,
    height: 168,
    aspectRatio: 1/1,
  },
  screenTitle2: {
    color: nucleus.light.semantic.fg.base,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24,
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: 28.8,
    letterSpacing: -1,
  },
  screenTexts: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  screenTextItem: {
    minHeight: 24,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  checkImage: {
    alignSelf: 'flex-start',
    width: 24,
    height: 24,
    flexShrink: 0,
  },
  screenTextItemText: {
    color: nucleus.light.semantic.fg.base,
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0,
    textAlign: 'center',
  },
  logoImage3: {
    width: 151.82,
    height: 154,
    aspectRatio: 151.82/154.00,
  },
  screenDescription3: {
    width: 356,
    color: nucleus.light.semantic.fg.base,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0,
  },
  screenDescription4: {
    width: 356,
    color: nucleus.light.semantic.fg.base,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0,
  },
  buttonContainer: {
    display: 'flex',
    padding: 16,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'stretch',
  },
  getStartedButton: {
    display: 'flex',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: 48,
    minHeight: 48,
    shadowColor: 'rgba(77, 150, 191, 0.30)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 25,
    elevation: 10,
  },
  buttonLabel: {
    color: nucleus.light.global.blue[10],
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: 20,
    letterSpacing: 0,
    marginVertical: 0,
    includeFontPadding: false,
  },
});
