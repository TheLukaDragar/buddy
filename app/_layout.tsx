import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import SwipeableIntro from '../components/SwipeableIntro';
import { BuddyLightTheme } from '../constants/BuddyTheme';
import '../polyfills';

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

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showIntro, setShowIntro] = useState(false);
  
  // Configure Android navigation bar for edge-to-edge
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Set navigation bar style for edge-to-edge
      NavigationBar.setStyle('dark');
    }
  }, []);
  
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
    // Async font loading only occurs in development.
    return null;
  }

  // Force light theme throughout the app
  const paperTheme = BuddyLightTheme;

  const handleDismissIntro = () => {
    setShowIntro(false);
  };

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthProvider>
          <SplashScreenController />
          <SafeAreaProvider> 
            <GestureHandlerRootView style={{ flex: 1 }}>
              <PaperProvider theme={paperTheme}>
                <ThemeProvider value={BuddyNavigationTheme}>
                  <IntroContext.Provider value={{ showIntro, setShowIntro }}>
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
      </PersistGate>
    </Provider>
  );
}

// Separate this into a new component so it can access the AuthProvider context
function RootNavigator() {
  const { user } = useAuth();

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
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
      </Stack.Protected>

      {/* Public routes - accessible without authentication */}
      <Stack.Protected guard={!user}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="login-callback" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
