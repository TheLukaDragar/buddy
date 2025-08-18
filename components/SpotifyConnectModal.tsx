import { useBuddyTheme } from '@/constants/BuddyTheme';
import { Image } from "expo-image";
import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { Button, Modal, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { nucleus } from '../Buddy_variables.js';
import { useSpotifyAuth } from '../hooks/useSpotifyAuth';

interface SpotifyConnectModalProps {
  visible: boolean;
  onDismiss: () => void;
  onNotNow?: () => void;
}

export default function SpotifyConnectModal({ 
  visible, 
  onDismiss, 
  onNotNow 
}: SpotifyConnectModalProps) {
  const theme = useBuddyTheme();
  const { login, loading, error } = useSpotifyAuth();

  const handleConnectSpotify = () => {
    login();
    // Close modal after initiating auth
    onDismiss();
  };

  const handleNotNow = () => {
    if (onNotNow) {
      onNotNow();
    }
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={[
        styles.modalContainer,
        { backgroundColor: nucleus.light.semantic.bg.canvas }
      ]}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={nucleus.light.semantic.bg.canvas} />
        
        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Spotify Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/icons/spotify.svg")}
              style={styles.spotifyLogo}
              contentFit="contain"
            />
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text 
              variant="headlineMedium" 
              style={[
                styles.title, 
                { color: nucleus.light.semantic.fg.base }
              ]}
            >
              Let's set your workout vibe
            </Text>
            
            <Text 
              variant="bodyLarge" 
              style={[
                styles.description, 
                { color: nucleus.light.semantic.fg.base }
              ]}
            >
              Training hits differently with the right music.{'\n'}
              Connect Spotify so Buddy can play mood-matching tunes while you work out.
            </Text>
          </View>
        </View>

        {/* Button Container */}
        <View style={styles.buttonContainer}>
          {/* Connect Spotify Button */}
          <Button
            mode="contained"
            style={[
              styles.connectButton,
              { backgroundColor: nucleus.light.global.blue["70"] }
            ]}
            labelStyle={[
              styles.connectButtonLabel,
              { color: nucleus.light.global.blue["10"] }
            ]}
            contentStyle={styles.buttonContent}
            compact={false}
            onPress={handleConnectSpotify}
            loading={loading}
            disabled={loading}
          >
            Connect Spotify
          </Button>

          {/* Not Now Button */}
          <Button
            mode="outlined"
            style={[
              styles.notNowButton,
              { borderColor: nucleus.light.global.blue["70"] }
            ]}
            labelStyle={[
              styles.notNowButtonLabel,
              { color: nucleus.light.global.blue["70"] }
            ]}
            contentStyle={styles.buttonContent}
            compact={false}
            onPress={handleNotNow}
            disabled={loading}
          >
            Not now
          </Button>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text 
              variant="bodySmall" 
              style={[styles.errorText, { color: '#FF6B35' }]}
            >
              {error}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    margin: 0,
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 104,
    paddingBottom: 24,
    gap: 24,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotifyLogo: {
    width: 120,
    height: 120,
  },

  textContainer: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24,
    lineHeight: 29, // 24 * 1.2
    textAlign: 'center',
    letterSpacing: -1,
    includeFontPadding: false,
  },
  description: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24, // 16 * 1.5
    textAlign: 'center',
    includeFontPadding: false,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  connectButton: {
    borderRadius: 48,
    minHeight: 48,
    justifyContent: 'center',
  },
  connectButtonLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    lineHeight: 16,
    marginVertical: 0,
    includeFontPadding: false,
  },
  notNowButton: {
    borderRadius: 48,
    minHeight: 48,
    justifyContent: 'center',
    borderWidth: 1,
  },
  notNowButtonLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    lineHeight: 16,
    marginVertical: 0,
    includeFontPadding: false,
  },
  buttonContent: {
    minHeight: 48,
    paddingHorizontal: 24,
    paddingVertical: 0,
  },
  errorContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
