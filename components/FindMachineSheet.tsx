import { Image } from 'expo-image';
import * as React from 'react';
import {
  BackHandler,
  Dimensions,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import { Button, Text } from 'react-native-paper';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  initialWindowMetrics,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { nucleus } from '../BiXo_variables';
import {
  getMachineFinderIcon,
  getMuscleCategoryIcon,
  type MachineFinderTarget,
} from '../constants/machineFinder';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
/** Fallback when Modal/edge-to-edge reports 0 bottom inset */
const WINDOW_BOTTOM_INSET = initialWindowMetrics?.insets.bottom ?? 0;

type FindMachineSheetProps = {
  visible: boolean;
  target: MachineFinderTarget | null;
  onClose: () => void;
};

export default function FindMachineSheet({
  visible,
  target,
  onClose,
}: FindMachineSheetProps) {
  const insets = useSafeAreaInsets();
  // Modal + edge-to-edge can report 0 — fall back to window metrics / nav bar size
  const bottomInset = Math.max(insets.bottom, WINDOW_BOTTOM_INSET, 24);
  const bottomPad = bottomInset + 16;
  const maxSheetHeight = SCREEN_HEIGHT * 0.92;
  // Dismiss animation distance until onLayout reports the real sheet height
  const [measuredSheetHeight, setMeasuredSheetHeight] = React.useState(
    Math.min(SCREEN_HEIGHT * 0.72, 560) + bottomPad
  );

  const translateY = useSharedValue(measuredSheetHeight);
  const sheetHeightSV = useSharedValue(measuredSheetHeight);
  const backdropOpacity = useSharedValue(0);

  React.useEffect(() => {
    sheetHeightSV.value = measuredSheetHeight;
  }, [measuredSheetHeight, sheetHeightSV]);

  React.useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 25, stiffness: 150, mass: 0.8 });
      backdropOpacity.value = withTiming(0.5, { duration: 300 });
    } else {
      translateY.value = withSpring(measuredSheetHeight, { damping: 20, stiffness: 200 });
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, measuredSheetHeight, translateY, backdropOpacity]);

  React.useEffect(() => {
    if (!visible) return;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => backHandler.remove();
  }, [visible, onClose]);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: { startY: number }) => {
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      // Only allow dragging down
      translateY.value = Math.max(0, ctx.startY + event.translationY);
      backdropOpacity.value = Math.max(
        0,
        0.5 * (1 - translateY.value / Math.max(sheetHeightSV.value, 1))
      );
    },
    onEnd: (event) => {
      const height = sheetHeightSV.value;
      const shouldDismiss =
        event.translationY > height * 0.18 || event.velocityY > 400;
      if (shouldDismiss) {
        translateY.value = withSpring(height, { damping: 20, stiffness: 200 });
        backdropOpacity.value = withTiming(0, { duration: 200 });
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, { damping: 25, stiffness: 150, mass: 0.8 });
        backdropOpacity.value = withTiming(0.5, { duration: 200 });
      }
    },
  });

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!target) return null;

  const muscleIcon = getMuscleCategoryIcon(target.muscleIconKey);
  const equipmentIcon = getMachineFinderIcon(target.slug);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      {/* Modal needs its own gesture root or swipe-down won't work */}
      <GestureHandlerRootView style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose}>
          <Animated.View style={[styles.backdrop, animatedBackdropStyle]} />
        </TouchableOpacity>

        <PanGestureHandler
          onGestureEvent={gestureHandler}
          activeOffsetY={10}
          failOffsetX={[-20, 20]}
        >
          <Animated.View
            style={[
              styles.sheet,
              animatedSheetStyle,
              { maxHeight: maxSheetHeight, paddingBottom: bottomPad },
            ]}
            onLayout={(e) => {
              const h = Math.round(e.nativeEvent.layout.height);
              if (h > 0 && Math.abs(h - measuredSheetHeight) > 1) {
                setMeasuredSheetHeight(h);
                sheetHeightSV.value = h;
              }
            }}
          >
            <View style={styles.handleWrap}>
              <View style={styles.handle} />
            </View>

            <View style={styles.content}>
              <Text style={styles.title}>Find your machine</Text>
              <Text style={styles.rule}>
                Look for a machine whose label includes{' '}
                <Text style={styles.keywordsInline}>“{target.keywords}”</Text>
                {' '}— or match these icons on the floor:
              </Text>

              <View style={styles.keywordCard}>
                <Text style={styles.keywordLabel}>Search for</Text>
                <Text style={styles.keywords}>{target.keywords}</Text>
              </View>

              <View style={styles.iconsRow}>
                <View style={styles.iconBlock}>
                  <Text style={styles.iconCaption} numberOfLines={1}>
                    {target.muscleLabel}
                  </Text>
                  <View style={styles.iconShadow}>
                    <View style={styles.iconFrame}>
                      <Image
                        source={muscleIcon}
                        style={styles.muscleIcon}
                        contentFit="contain"
                      />
                    </View>
                  </View>
                </View>
                <View style={styles.iconBlock}>
                  <Text style={styles.iconCaption} numberOfLines={1}>
                    Equipment
                  </Text>
                  <View style={styles.iconShadow}>
                    <View style={styles.iconFrame}>
                      <Image
                        source={equipmentIcon}
                        style={styles.equipmentIcon}
                        contentFit="contain"
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.footer}>
              <Button
                mode="contained"
                onPress={onClose}
                compact={false}
                style={styles.closeButton}
                contentStyle={styles.closeButtonContent}
                labelStyle={styles.closeButtonLabel}
              >
                Got it
              </Button>
            </View>
          </Animated.View>
        </PanGestureHandler>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2500,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  sheet: {
    backgroundColor: nucleus.light.semantic.bg.canvas,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    width: '100%',
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: nucleus.light.global.grey['40'],
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 12,
  },
  title: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24,
    lineHeight: 30,
    color: nucleus.light.global.blue['80'],
    includeFontPadding: false,
  },
  rule: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: nucleus.light.global.grey['70'],
    includeFontPadding: false,
  },
  keywordsInline: {
    fontFamily: 'PlusJakartaSans-Bold',
    color: nucleus.light.global.blue['70'],
  },
  keywordCard: {
    backgroundColor: nucleus.light.global.blue['20'],
    borderRadius: nucleus.light.cornerRadius.md,
    padding: 16,
    gap: 4,
  },
  keywordLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    lineHeight: 16,
    color: nucleus.light.global.blue['60'],
    includeFontPadding: false,
  },
  keywords: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    lineHeight: 22,
    color: nucleus.light.global.blue['80'],
    includeFontPadding: false,
  },
  iconsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 4,
    width: '100%',
  },
  iconBlock: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
    maxWidth: 180,
  },
  iconShadow: {
    width: 168,
    height: 168,
    borderRadius: 12,
    backgroundColor: nucleus.light.semantic.bg.canvas,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 5,
  },
  iconFrame: {
    width: 168,
    height: 168,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: nucleus.light.semantic.bg.canvas,
    overflow: 'hidden',
    padding: 4,
  },
  muscleIcon: {
    width: '100%',
    height: '100%',
  },
  equipmentIcon: {
    width: '100%',
    height: '100%',
  },
  iconCaption: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    lineHeight: 16,
    color: nucleus.light.global.blue['80'],
    includeFontPadding: false,
    textAlign: 'center',
    width: '100%',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  closeButton: {
    borderRadius: 48,
    backgroundColor: nucleus.light.global.blue['70'],
    minHeight: 48,
    justifyContent: 'center',
  },
  closeButtonContent: {
    minHeight: 48,
    paddingHorizontal: 24,
    paddingVertical: 0,
  },
  closeButtonLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    lineHeight: 20,
    marginVertical: 0,
    includeFontPadding: false,
    color: nucleus.light.global.blue['10'],
  },
});
