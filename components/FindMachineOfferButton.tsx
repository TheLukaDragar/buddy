import * as Haptics from 'expo-haptics';
import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { nucleus } from '../BiXo_variables';

const OFFER_DURATION_MS = 10_000;
const SLIDE_MS = 380;
const SLIDE_DISTANCE = 56;

type FindMachineOfferButtonProps = {
  visible: boolean;
  onPress: () => void;
  onExpire: () => void;
  durationMs?: number;
};

/**
 * Timed offer: slides up, depleting fill shows timeout, then slides down.
 */
export default function FindMachineOfferButton({
  visible,
  onPress,
  onExpire,
  durationMs = OFFER_DURATION_MS,
}: FindMachineOfferButtonProps) {
  const [mounted, setMounted] = React.useState(false);
  const translateY = useSharedValue(SLIDE_DISTANCE);
  const opacity = useSharedValue(0);
  const progress = useSharedValue(1);
  const expiredRef = React.useRef(false);

  const finishExpire = React.useCallback(() => {
    if (expiredRef.current) return;
    expiredRef.current = true;
    setMounted(false);
    onExpire();
  }, [onExpire]);

  const slideOut = React.useCallback(
    (notifyExpire: boolean) => {
      cancelAnimation(translateY);
      cancelAnimation(opacity);
      cancelAnimation(progress);
      opacity.value = withTiming(0, { duration: SLIDE_MS * 0.85, easing: Easing.in(Easing.cubic) });
      translateY.value = withTiming(
        SLIDE_DISTANCE,
        { duration: SLIDE_MS, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished && notifyExpire) {
            runOnJS(finishExpire)();
          } else if (finished) {
            runOnJS(setMounted)(false);
          }
        }
      );
    },
    [finishExpire, opacity, progress, translateY]
  );

  React.useEffect(() => {
    if (visible) {
      expiredRef.current = false;
      setMounted(true);
      cancelAnimation(translateY);
      cancelAnimation(opacity);
      cancelAnimation(progress);
      translateY.value = SLIDE_DISTANCE;
      opacity.value = 0;
      progress.value = 1;

      opacity.value = withTiming(1, { duration: SLIDE_MS * 0.9, easing: Easing.out(Easing.cubic) });
      translateY.value = withTiming(0, {
        duration: SLIDE_MS,
        easing: Easing.out(Easing.cubic),
      });

      // Depleting fill over the offer window
      progress.value = withTiming(0, {
        duration: durationMs,
        easing: Easing.linear,
      });

      const stayTimer = setTimeout(() => {
        slideOut(true);
      }, durationMs);

      return () => {
        clearTimeout(stayTimer);
        cancelAnimation(translateY);
        cancelAnimation(opacity);
        cancelAnimation(progress);
      };
    }

    if (mounted) {
      slideOut(false);
    }
  }, [visible, durationMs]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.max(progress.value * 100, 0)}%`,
  }));

  if (!mounted) return null;

  return (
    <Animated.View style={[styles.wrap, animatedStyle]} pointerEvents="box-none">
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Find machine"
      >
        <Animated.View style={[styles.fill, fillStyle]} />
        <View style={styles.labelRow} pointerEvents="none">
          <Text style={styles.label}>Find machine</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
    marginBottom: 4,
  },
  button: {
    minHeight: 40,
    minWidth: 180,
    borderRadius: nucleus.light.cornerRadius.lg,
    backgroundColor: nucleus.light.global.blue['40'],
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: nucleus.light.global.blue['60'],
    right: undefined,
  },
  labelRow: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: nucleus.light.global.white,
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    lineHeight: 18,
    includeFontPadding: false,
    textAlign: 'center',
  },
});
