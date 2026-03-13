import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { nucleus } from '../BiXo_variables.js';

const FEEDBACK_OPTIONS = [
  'Easy',
  'Middle',
  'Sweet Spot',
  'Hard',
  'Impossible',
  'Prefer to skip',
] as const;

export interface SetFeedbackLayerProps {
  visible: boolean;
  onSelectFeedback: (feedback: string) => void;
  onDismiss: () => void;
}

export default function SetFeedbackLayer({
  visible,
  onSelectFeedback,
  onDismiss,
}: SetFeedbackLayerProps) {
  const insets = useSafeAreaInsets();

  const handleSelect = (feedback: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectFeedback(feedback);
  };

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        style={[styles.overlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      >
        {/* Blurred background per Figma: backdropFilter blur(8px) */}
        <BlurView intensity={80} tint="light" style={styles.blurView} />
        {/* Background per Figma: rgba(60, 129, 167, 0.70) */}
        <View style={styles.blueOverlay} />
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleDismiss}
        />
        {/* Close button - top right */}
        <TouchableOpacity
          style={[styles.closeButton, { top: insets.top + 8 }]}
          onPress={handleDismiss}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          accessibilityLabel="Close feedback"
          accessibilityRole="button"
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <View style={styles.content}>
          {/* Title - white, bold per Figma */}
          <Text style={styles.title}>How did this exercise feel? 😎</Text>

          {/* Feedback options - transparent, white border, white text per Figma */}
          <View style={styles.optionsContainer}>
            {FEEDBACK_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.optionButton}
                onPress={() => handleSelect(option)}
                activeOpacity={0.8}
                accessibilityLabel={`Rate as ${option}`}
                accessibilityRole="button"
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    // boxShadow per Figma: 0px 0px 20px rgba(185, 230, 255, 0.40)
    shadowColor: '#B9E6FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  blueOverlay: {
    ...StyleSheet.absoluteFillObject,
    // rgba(60, 129, 167, 0.70) per Figma
    backgroundColor: 'rgba(60, 129, 167, 0.70)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    width: '100%',
    maxWidth: 320,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 24,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: nucleus.light.global.white,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  title: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 32,
    lineHeight: 38,
    textAlign: 'center',
    color: nucleus.light.global.white,
    marginBottom: 32,
    includeFontPadding: false,
  },
  optionsContainer: {
    width: '100%',
    maxWidth: 320,
    gap: 16,
  },
  optionButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: nucleus.light.global.white,
    borderRadius: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  optionText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    lineHeight: 20,
    color: nucleus.light.global.white,
    includeFontPadding: false,
  },
});
