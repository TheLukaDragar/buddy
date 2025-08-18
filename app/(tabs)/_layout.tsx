import { Image } from 'expo-image';
import { Tabs, router, usePathname } from 'expo-router';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { nucleus } from '../../Buddy_variables.js';
import { useBuddyTheme } from '../../constants/BuddyTheme';
import { RootState } from '../../store';
import { useAppSelector } from '../../store/hooks';

// Import the Buddy logo
const BuddyLogo = require("../../assets/login/logo.png");

export default function TabLayout() {
  const theme = useBuddyTheme();
  const pathname = usePathname();
  
  // Get input collapse state from Redux
  const isInputCollapsed = useAppSelector((state: RootState) => (state as any).chat?.isInputCollapsed || false);
  
  // Animation values
  const tabBarWidth = useSharedValue(187); // Original width
  const tabBarScaleY = useSharedValue(1); // Vertical scale
  const tabBarTranslateY = useSharedValue(0); // Move tab bar up to hide
  const centerIconScaleY = useSharedValue(1); // Counter-scale for center icon
  const centerIconTranslateY = useSharedValue(0); // Move icon up
  const sideTabsOpacity = useSharedValue(1);
  const sideTabsScale = useSharedValue(1);
  
  // Animate based on current route and input collapse state
  useEffect(() => {
    const isOnChat = pathname === '/chat';
    
    if (isOnChat) {
      // Shrink tab bar and hide side tabs
      tabBarWidth.value = withTiming(64, { // Exact size of center icon
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      tabBarScaleY.value = withTiming(0.5, { // Shrink vertically
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      
      // Adjust entire tab bar position based on input collapse state
      if (isInputCollapsed) {
        tabBarTranslateY.value = withTiming(-80, { // Move tab bar down when input collapsed
          duration: 400,
          easing: Easing.out(Easing.cubic),
        });
      } else {
        tabBarTranslateY.value = withTiming(-180, { // Move tab bar up to hide when input expanded
          duration: 400,
          easing: Easing.out(Easing.cubic),
        });
      }
      
      centerIconScaleY.value = withTiming(2, { // Counter-scale to keep icon normal
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      centerIconTranslateY.value = withTiming(0, { // Keep icon at normal position relative to tab bar
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      
      sideTabsOpacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      sideTabsScale.value = withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      // Restore normal state
      tabBarWidth.value = withTiming(187, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      tabBarScaleY.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      tabBarTranslateY.value = withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      centerIconScaleY.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      centerIconTranslateY.value = withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      sideTabsOpacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      sideTabsScale.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [pathname, isInputCollapsed]); // Added isInputCollapsed to dependency array

  // Animated styles
  const animatedTabBarStyle = useAnimatedStyle(() => ({
    width: tabBarWidth.value,
    transform: [
      { scaleY: tabBarScaleY.value },
      { translateY: tabBarTranslateY.value },
    ],
  }));

  const animatedSideTabsStyle = useAnimatedStyle(() => ({
    opacity: sideTabsOpacity.value,
    transform: [{ scaleX: sideTabsScale.value }],
  }));

  const animatedCenterIconStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleY: centerIconScaleY.value },
      { translateY: centerIconTranslateY.value },
    ],
  }));

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            display: 'none',
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Chat',
          }}
        />
        <Tabs.Screen
          name="graphql-demo"
          options={{
            title: 'GraphQL Demo',
          }}
        />
        <Tabs.Screen
          name="music-test"
          options={{
            title: 'Music Test',
          }}
        />
      </Tabs>
      
      {/* Custom centered tab bar with SafeAreaView */}
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.tabBarWrapper}>
          <Animated.View style={[styles.tabBar, animatedTabBarStyle]}>
            {/* Solid white background for consistency */}
            <View style={styles.solidBackground} />
            
            {/* Inner shadow overlay */}
            <View style={styles.innerShadow} />
            
            {/* Tabs - following Figma structure */}
            <View style={styles.tabs}>
              {/* Tab 1 - Left */}
              <Animated.View style={[styles.tab1, animatedSideTabsStyle]}>
                <Pressable 
                  style={styles.tab1Button}
                  onPress={() => router.push('/')}
                >
                  <Image
                    source={require("../../assets/icons/home.svg")}
                    style={styles.tabIcon}
                    contentFit="contain"
                  />
                </Pressable>
              </Animated.View>
              
              {/* Tab 2 - Center (Buddy/AI) */}
              <View style={styles.tab2}>
                <Pressable 
                  style={styles.tab2Button}
                  onPress={() => router.push('/chat')}
                >
                  <Animated.View style={animatedCenterIconStyle}>
                    <Image
                      source={pathname === '/chat' 
                        ? require("../../assets/icons/AI.svg")
                        : require("../../assets/icons/buddy.svg")
                      }
                      style={styles.buddyIcon}
                      contentFit="contain"
                    />
                  </Animated.View>
                </Pressable>
              </View>
              
              {/* Tab 3 - Right */}
              <Animated.View style={[styles.tab3, animatedSideTabsStyle]}>
                <Pressable 
                  style={styles.tab3Button}
                  onPress={() => router.push('/profile')}
                >
                  <Image
                    source={require("../../assets/icons/user.svg")}
                    style={styles.tabIcon}
                    contentFit="contain"
                  />
                </Pressable>
              </Animated.View>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    pointerEvents: 'box-none',
    zIndex: 999, // Lower than SwipeableIntro's zIndex: 1000
  },
  tabBarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingBottom: 3,
  },
  tabBar: {
    height: 57,
    width: 187,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    // Outer shadow - matches Figma: 0px 0px 20px 0px rgba(185, 230, 255, 0.4)
    shadowColor: 'rgba(185, 230, 255, 1)',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  solidBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 24,
    pointerEvents: 'none',
  },
  innerShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(208, 221, 23, 0.16)',
    pointerEvents: 'none',
    // Inner shadow - matches Figma: 0px -1px 4px 0px rgba(208, 221, 23, 0.16) inset
    shadowColor: 'rgba(208, 221, 23, 1)',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
  },
  // Following Figma structure: basis-0 box-border content-stretch flex flex-row grow items-start justify-start min-h-px min-w-px p-0 relative shrink-0 w-full
  tabs: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    minHeight: 1,
    minWidth: 1,
    padding: 0,
    width: '100%',
  },
  // Tab 1: basis-0 grow h-full min-h-px min-w-px relative shrink-0
  tab1: {
    flex: 1,
    height: '100%',
    minHeight: 1,
    minWidth: 1,
    position: 'relative',
  },
  // Tab 1 Button: absolute bg-[#0d4f2b] box-border content-stretch flex flex-row gap-2 items-center justify-start p-[8px] rounded-2xl top-1/2 translate-x-[-50%] translate-y-[-50%]
  tab1Button: {
    position: 'absolute',
    backgroundColor: nucleus.light.global.green["80"],
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 8,
    borderRadius: 16,
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }], // Approximate center
  },
  // Tab 2: h-14 relative shrink-0 w-16
  tab2: {
    height: 56, // h-14 = 56px
    position: 'relative',
    width: 64, // w-16 = 64px
    flexShrink: 0,
  },
  // Tab 2 Button: absolute size-16 translate-x-[-50%] translate-y-[-50%]
  tab2Button: {
    position: 'absolute',
    width: 64,
    height: 64,
    top: '50%',
    left: '50%',
    transform: [{ translateX: -32 }, { translateY: -42 }],
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 4.5, // Makes it poke out
  },
  // Tab 3: basis-0 grow h-full min-h-px min-w-px relative shrink-0
  tab3: {
    flex: 1,
    height: '100%',
    minHeight: 1,
    minWidth: 1,
    position: 'relative',
  },
  // Tab 3 Button: similar to tab1 but without background
  tab3Button: {
    position: 'absolute',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 8,
    borderRadius: 16,
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }], // Approximate center
  },
  buddyIcon: {
    width: 64, // Even bigger icon size
    height: 64,

  },
  tabIcon: {
    width: 24,
    height: 24,
  },
 
});
