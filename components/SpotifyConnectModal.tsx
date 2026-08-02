import { useBiXoTheme } from '@/constants/BiXoTheme';
import { Image } from "expo-image";
import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import { Button, Text } from 'react-native-paper';
import {
  initialWindowMetrics,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { nucleus } from '../BiXo_variables.js';
import { useSpotifyAuth } from '../hooks/useSpotifyAuth';

/** Fallback when Modal/edge-to-edge reports 0 bottom inset */
const WINDOW_BOTTOM_INSET = initialWindowMetrics?.insets.bottom ?? 0;

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
  useBiXoTheme();
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, initialWindowMetrics?.insets.top ?? 0);
  const bottomPad = Math.max(insets.bottom, WINDOW_BOTTOM_INSET, 24) + 16;
  const { login, loading, error } = useSpotifyAuth();

  const handleConnectSpotify = () => {
    login();
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
      transparent={false}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View
        style={[
          styles.root,
          {
            paddingTop: topPad,
            paddingBottom: bottomPad,
            backgroundColor: nucleus.light.semantic.bg.canvas,
          },
        ]}
      >
        <SystemBars style="dark" />

        <View style={styles.contentContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/icons/spotify.svg")}
              style={styles.spotifyLogo}
              contentFit="contain"
            />
          </View>

          <View style={styles.textContainer}>
            <Text
              variant="headlineMedium"
              style={[styles.title, { color: nucleus.light.semantic.fg.base }]}
            >
              Let's set your workout vibe
            </Text>

            <Text
              variant="bodyLarge"
              style={[styles.description, { color: nucleus.light.semantic.fg.base }]}
            >
              Training hits differently with the right music.{'\n'}
              Connect Spotify so BiXo can play mood-matching tunes while you work out.
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            style={[
              styles.connectButton,
              { backgroundColor: nucleus.light.global.blue["70"] },
            ]}
            labelStyle={[
              styles.connectButtonLabel,
              { color: nucleus.light.global.blue["10"] },
            ]}
            contentStyle={styles.buttonContent}
            compact={false}
            onPress={handleConnectSpotify}
            loading={loading}
            disabled={loading}
          >
            Connect Spotify
          </Button>

          <Button
            mode="outlined"
            style={[
              styles.notNowButton,
              { borderColor: nucleus.light.global.blue["70"] },
            ]}
            labelStyle={[
              styles.notNowButtonLabel,
              { color: nucleus.light.global.blue["70"] },
            ]}
            contentStyle={styles.buttonContent}
            compact={false}
            onPress={handleNotNow}
            disabled={loading}
          >
            Not now
          </Button>
        </View>

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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
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
    lineHeight: 29,
    textAlign: 'center',
    letterSpacing: -1,
    includeFontPadding: false,
  },
  description: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    includeFontPadding: false,
  },
  buttonContainer: {
    paddingHorizontal: 16,
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
    paddingTop: 8,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
