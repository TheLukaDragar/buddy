import { useBuddyTheme } from '@/constants/BuddyTheme';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { nucleus } from '../Buddy_variables.js';

export default function SpotifyAuthCallback() {
  const theme = useBuddyTheme();

  useEffect(() => {
    // This component handles the Spotify OAuth callback
    // The actual auth processing is handled by the useSpotifyAuth hook via expo-auth-session
    console.log('[Spotify Callback] Auth callback route loaded');
    
    // After a brief delay, redirect back to the previous page
    const timer = setTimeout(() => {
      // Check if we can go back, otherwise go to home
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: nucleus.light.global.blue["20"] }]}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={nucleus.light.global.blue["70"]} />
        <Text 
          variant="titleLarge" 
          style={[styles.title, { color: nucleus.light.global.blue["90"] }]}
        >
          Spotify Connected!
        </Text>
        <Text 
          variant="bodyMedium" 
          style={[styles.subtitle, { color: nucleus.light.global.blue["70"] }]}
        >
          Redirecting you back...
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  title: {
    fontFamily: 'PlusJakartaSans-Bold',
    textAlign: 'center',
    marginTop: 16,
    includeFontPadding: false,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
