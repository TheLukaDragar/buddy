import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import SwipeableIntro from '../components/SwipeableIntro';
import { BuddyLightTheme } from '../constants/BuddyTheme';
import '../polyfills';

import { ElevenLabsProvider } from '@elevenlabs/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { nucleus } from '../Buddy_variables.js';
import { SplashScreenController } from '../components/SplashScreenController';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { useColorScheme } from '../hooks/useColorScheme';
import { persistor, store } from '../store';


// Create context for intro state
interface IntroContextType {
  showIntro: boolean;
  setShowIntro: (show: boolean) => void;
}

const IntroContext = createContext<IntroContextType | undefined>(undefined);

export const useIntro = () => {
  const context = useContext(IntroContext);
  if (!context) {
    throw new Error('useIntro must be used within IntroProvider');
  }
  return context;
};

// Custom navigation theme to prevent white flash
const BuddyNavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: nucleus.light.semantic.bg.subtle, // Use your app's background color
    card: nucleus.light.semantic.bg.canvas,
    text: nucleus.light.semantic.fg.base,
    border: nucleus.light.semantic.border.muted,
    notification: nucleus.light.global.blue["70"],
  },
};

// Component to log when PersistGate finishes rehydration
// Moved outside RootLayout to prevent remounting on every render
// Using a stable component reference so it doesn't get recreated
function PersistGateContent() {
  console.log('🚀 [ENTRY] PersistGate - rehydration complete, rendering app');
  const [showIntro, setShowIntro] = useState(false);
  
  const handleDismissIntro = React.useCallback(() => {
    setShowIntro(false);
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const introContextValue = React.useMemo(() => ({
    showIntro,
    setShowIntro
  }), [showIntro]);

  return (
    <AuthProvider>
      <SplashScreenController />
      <SafeAreaProvider> 
        <GestureHandlerRootView style={{ flex: 1 }}>
          <PaperProvider theme={BuddyLightTheme}>
            <ThemeProvider value={BuddyNavigationTheme}>
              <IntroContext.Provider value={introContextValue}>
                <RootNavigator />
                <SystemBars style="dark" />
                
                {/* Global SwipeableIntro - renders above everything */}
                <SwipeableIntro 
                  visible={showIntro}
                  onDismiss={handleDismissIntro}
                />
              </IntroContext.Provider>
            </ThemeProvider>
          </PaperProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

export default function RootLayout() {
  console.log('🚀 [ENTRY] RootLayout component rendering');
  const colorScheme = useColorScheme();
  
  // Configure Android navigation bar for edge-to-edge
  useEffect(() => {
    console.log('🚀 [ENTRY] RootLayout useEffect - configuring navigation bar');
    if (Platform.OS === 'android') {
      // Set navigation bar style for edge-to-edge
      NavigationBar.setStyle('dark');
    }
  }, []);
  
  console.log('🚀 [ENTRY] RootLayout - loading fonts');
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    // Official Plus Jakarta Sans fonts from Tokotype
    'PlusJakartaSans-ExtraLight': require('../assets/fonts/PlusJakartaSans-ExtraLight.ttf'),
    'PlusJakartaSans-Light': require('../assets/fonts/PlusJakartaSans-Light.ttf'),
    'PlusJakartaSans-Regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'PlusJakartaSans-SemiBold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'PlusJakartaSans-Bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'PlusJakartaSans-ExtraBold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
    // Italic variants
    'PlusJakartaSans-ExtraLightItalic': require('../assets/fonts/PlusJakartaSans-ExtraLightItalic.ttf'),
    'PlusJakartaSans-LightItalic': require('../assets/fonts/PlusJakartaSans-LightItalic.ttf'),
    'PlusJakartaSans-Italic': require('../assets/fonts/PlusJakartaSans-Italic.ttf'),
    'PlusJakartaSans-MediumItalic': require('../assets/fonts/PlusJakartaSans-MediumItalic.ttf'),
    'PlusJakartaSans-SemiBoldItalic': require('../assets/fonts/PlusJakartaSans-SemiBoldItalic.ttf'),
    'PlusJakartaSans-BoldItalic': require('../assets/fonts/PlusJakartaSans-BoldItalic.ttf'),
    'PlusJakartaSans-ExtraBoldItalic': require('../assets/fonts/PlusJakartaSans-ExtraBoldItalic.ttf'),
    // Backward compatibility
    'Plus Jakarta Sans': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
  });

  if (!loaded) {
    console.log('🚀 [ENTRY] RootLayout - fonts not loaded yet, returning null');
    // Async font loading only occurs in development.
    return null;
  }

  console.log('🚀 [ENTRY] RootLayout - fonts loaded, rendering provider tree');

  return (
    <ElevenLabsProvider>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PersistGateContent />
      </PersistGate>
      </Provider>
    </ElevenLabsProvider>
  );
}

// Separate this into a new component so it can access the AuthProvider context
function RootNavigator() {
  console.log('🚀 [NAVIGATOR] RootNavigator component rendering');
  const { user, loading } = useAuth();
  console.log('🚀 [NAVIGATOR] Auth state - loading:', loading, 'user:', user?.id || 'null');

  // Show loading screen while checking authentication
  if (loading) {
    console.log('🚀 [NAVIGATOR] Showing loading screen (auth loading)');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: nucleus.light.semantic.bg.subtle }}>
        <ActivityIndicator size="large" color={nucleus.light.global.blue["50"]} />
      </View>
    );
  }

  console.log('🚀 [NAVIGATOR] Auth loaded, rendering Stack navigator');
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: nucleus.light.semantic.bg.subtle
        },
      }}
    >
      {/* Protected routes - require authentication */}
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="welcome"
          options={{
            headerShown: false,
            presentation: 'card',
            animation: 'slide_from_right',
            animationDuration: 300,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="onboarding" 
          options={{ 
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_right',
            animationDuration: 300,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
          }} 
        />
        <Stack.Screen
          name="profile-view"
          options={{
            headerShown: false,
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="workout"
          options={{
            headerShown: false,
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="active_workout"
          options={{
            headerShown: false,
            presentation: 'card',
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="exercises"
          options={{
            headerShown: false,
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="conversation"
          options={{
            headerShown: false,
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="spotify-auth-callback"
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="workout-plan-progress"
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_bottom',
            gestureEnabled: false, // Prevent dismissing during progress
          }}
        />
      </Stack.Protected>

      {/* Public routes - accessible without authentication */}
      <Stack.Protected guard={!user}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="login-callback" options={{ headerShown: false }} />
        <Stack.Screen name="login-email" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
