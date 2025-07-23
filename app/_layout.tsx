import SwipeableIntro from '@/components/SwipeableIntro';
import { BuddyLightTheme } from '@/constants/BuddyTheme';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { createContext, useContext, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { nucleus } from '../Buddy_variables.js';

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
    <SafeAreaProvider> 
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={paperTheme}>
        <ThemeProvider value={BuddyNavigationTheme}>
          <IntroContext.Provider value={{ showIntro, setShowIntro }}>
            <Stack
              screenOptions={{
                contentStyle: { 
                  backgroundColor: nucleus.light.semantic.bg.subtle 
                },
              }}
            >
              <Stack.Screen name="login" options={{ headerShown: false }} />
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

              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="dark" />
            
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
  );
}
