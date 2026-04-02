import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import * as React from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import ViewShot from "react-native-view-shot";

import { nucleus } from "../BiXo_variables.js";

/** Base layout width; capture is upscaled to Instagram-friendly 1080×1920. */
const BASE_STORY_W = 360;
const OUTPUT_W = 1080;
const OUTPUT_H = 1920;

export type WorkoutShareStoryModalProps = {
  visible: boolean;
  onClose: () => void;
  workoutName: string;
  totalTimeLabel: string;
  totalWeightLabel: string;
  completedExercises: number;
  totalExercises: number;
  completedSets: number;
  totalSets: number;
  isTrainNow?: boolean;
  subtitleLine?: string;
};

export function WorkoutShareStoryModal({
  visible,
  onClose,
  workoutName,
  totalTimeLabel,
  totalWeightLabel,
  completedExercises,
  totalExercises,
  completedSets,
  totalSets,
  isTrainNow,
  subtitleLine,
}: WorkoutShareStoryModalProps) {
  const shotRef = React.useRef<ViewShot>(null);
  const [sharing, setSharing] = React.useState(false);
  const insets = useSafeAreaInsets();

  const screenW = Dimensions.get("window").width;
  const cardW = Math.min(BASE_STORY_W, screenW - 48);
  const cardH = Math.round((cardW * 16) / 9);

  const handleShare = async () => {
    if (!shotRef.current) return;
    try {
      setSharing(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const uri = await captureRef(shotRef, {
        format: "png",
        quality: 1,
        width: OUTPUT_W,
        height: OUTPUT_H,
        result: "tmpfile",
      });
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        setSharing(false);
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Share story",
        ...(Platform.OS === "ios" && { UTI: "public.png" }),
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.warn("Workout share failed", e);
    } finally {
      setSharing(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <View style={styles.backdropFill} />
        </Pressable>
        <View style={styles.sheetWrap} pointerEvents="box-none">
          <Pressable
            style={[styles.sheet, { paddingTop: insets.top + 24 }]}
            onPress={(e) => e.stopPropagation()}
          >
          <Text style={styles.sheetTitle}>Share story</Text>

          <View style={[styles.previewWrap, { width: cardW, height: cardH }]}>
            <StoryCardContent
              ref={shotRef}
              cardWidth={cardW}
              cardHeight={cardH}
              workoutName={workoutName}
              totalTimeLabel={totalTimeLabel}
              totalWeightLabel={totalWeightLabel}
              completedExercises={completedExercises}
              totalExercises={totalExercises}
              completedSets={completedSets}
              totalSets={totalSets}
              isTrainNow={isTrainNow}
              subtitleLine={subtitleLine}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, sharing && styles.primaryBtnDisabled]}
            onPress={handleShare}
            disabled={sharing}
            activeOpacity={0.85}
          >
            {sharing ? (
              <ActivityIndicator color={nucleus.light.global.blue["10"]} />
            ) : (
              <Text style={styles.primaryBtnLabel}>Share story</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={onClose} disabled={sharing}>
            <Text style={styles.secondaryBtnLabel}>Not now</Text>
          </TouchableOpacity>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

type StoryCardProps = Omit<WorkoutShareStoryModalProps, "visible" | "onClose"> & {
  cardWidth: number;
  cardHeight: number;
};

const StoryCardContent = React.forwardRef<ViewShot, StoryCardProps>(
  (
    {
      cardWidth,
      cardHeight,
      workoutName,
      totalTimeLabel,
      totalWeightLabel,
      completedExercises,
      totalExercises,
      completedSets,
      totalSets,
      isTrainNow,
      subtitleLine,
    },
    ref
  ) => {
    return (
      <ViewShot
        ref={ref}
        style={[styles.storyShot, { width: cardWidth, height: cardHeight }]}
        options={{ format: "png", quality: 1 }}
      >
        <View style={styles.storyCaptureRoot} collapsable={false}>
        <LinearGradient
          colors={[nucleus.light.global.blue["20"], nucleus.light.global.blue["40"], nucleus.light.global.blue["30"]]}
          locations={[0, 0.55, 1]}
          style={styles.storyGradient}
        >
          <View style={styles.decorCircleTop} />
          <View style={styles.decorCircleBottom} />

          <View style={styles.storyHeader}>
            <Image
              source={require("../assets/icons/bixo.svg")}
              style={styles.brandLogo}
              contentFit="contain"
            />
            <Text style={styles.brandWordmark}>BiXo</Text>
          </View>

          <View style={styles.storyBody}>
            <Text style={styles.storyKicker}>WORKOUT COMPLETE</Text>
            <Text style={styles.storyTitle} numberOfLines={2}>
              {workoutName}
            </Text>
            {isTrainNow && (
              <View style={styles.trainNowPill}>
                <Text style={styles.trainNowPillText}>Train Now</Text>
              </View>
            )}

            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{totalTimeLabel}</Text>
                <Text style={styles.heroStatLabel}>Time</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{totalWeightLabel}</Text>
                <Text style={styles.heroStatLabel}>Volume</Text>
              </View>
            </View>

            <View style={styles.pillRow}>
              <View style={styles.statPill}>
                <Text style={styles.statPillText}>
                  Exercises {completedExercises}/{totalExercises}
                </Text>
              </View>
              <View style={styles.statPill}>
                <Text style={styles.statPillText}>
                  Sets {completedSets}/{totalSets}
                </Text>
              </View>
            </View>
          </View>

          {subtitleLine ? (
            <Text style={styles.storyFooter}>{subtitleLine}</Text>
          ) : (
            <Text style={styles.storyFooter}>Train better with BiXo</Text>
          )}
        </LinearGradient>
        </View>
      </ViewShot>
    );
  }
);

StoryCardContent.displayName = "StoryCardContent";

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  backdropFill: {
    flex: 1,
    backgroundColor: "rgba(32, 54, 39, 0.45)",
  },
  sheetWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  sheet: {
    width: "100%",
    alignSelf: "stretch",
    backgroundColor: nucleus.light.semantic.bg.canvas,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 0,
    gap: 16,
    overflow: "hidden",
  },
  sheetTitle: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 22,
    lineHeight: 28,
    color: nucleus.light.global.grey["90"],
    textAlign: "center",
    includeFontPadding: false,
    marginBottom: 4,
  },
  previewWrap: {
    alignSelf: "center",
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: nucleus.light.global.blue["20"],
  },
  storyShot: {
    borderRadius: 16,
    overflow: "hidden",
  },
  storyCaptureRoot: {
    flex: 1,
  },
  storyGradient: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 20,
    justifyContent: "space-between",
  },
  decorCircleTop: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: nucleus.light.global.brand["50"],
    opacity: 0.25,
    top: -40,
    right: -50,
  },
  decorCircleBottom: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: nucleus.light.global.white,
    opacity: 0.12,
    bottom: 60,
    left: -30,
  },
  storyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    zIndex: 1,
  },
  brandLogo: {
    width: 52,
    height: 52,
  },
  brandWordmark: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 28,
    lineHeight: 34,
    color: nucleus.light.global.grey["90"],
    includeFontPadding: false,
  },
  storyBody: {
    flex: 1,
    justifyContent: "center",
    gap: 12,
    zIndex: 1,
  },
  storyKicker: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 11,
    letterSpacing: 1.2,
    color: nucleus.light.global.blue["70"],
    includeFontPadding: false,
  },
  storyTitle: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 26,
    lineHeight: 32,
    color: nucleus.light.global.grey["90"],
    includeFontPadding: false,
  },
  trainNowPill: {
    alignSelf: "flex-start",
    backgroundColor: nucleus.light.global.brand["40"],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 32,
  },
  trainNowPillText: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 11,
    lineHeight: 14,
    color: nucleus.light.global.brand["90"],
    includeFontPadding: false,
  },
  heroStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginTop: 8,
    gap: 8,
  },
  heroStat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  heroDivider: {
    width: 1,
    height: 44,
    backgroundColor: nucleus.light.global.blue["40"],
    opacity: 0.8,
  },
  heroStatValue: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 22,
    lineHeight: 28,
    color: nucleus.light.global.blue["70"],
    includeFontPadding: false,
  },
  heroStatLabel: {
    fontFamily: "PlusJakartaSans-Medium",
    fontSize: 12,
    lineHeight: 16,
    color: nucleus.light.global.grey["70"],
    includeFontPadding: false,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginTop: 4,
  },
  statPill: {
    backgroundColor: nucleus.light.global.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: nucleus.light.global.blue["40"],
  },
  statPillText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 13,
    lineHeight: 17,
    color: nucleus.light.global.grey["90"],
    includeFontPadding: false,
  },
  storyFooter: {
    fontFamily: "PlusJakartaSans-Medium",
    fontSize: 12,
    lineHeight: 16,
    color: nucleus.light.global.grey["70"],
    textAlign: "center",
    zIndex: 1,
    includeFontPadding: false,
  },
  primaryBtn: {
    minHeight: 52,
    borderRadius: 48,
    backgroundColor: nucleus.light.global.blue["70"],
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  primaryBtnDisabled: {
    opacity: 0.7,
  },
  primaryBtnLabel: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 16,
    lineHeight: 20,
    color: nucleus.light.global.blue["10"],
    includeFontPadding: false,
  },
  secondaryBtn: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
    lineHeight: 20,
    color: nucleus.light.global.grey["70"],
    includeFontPadding: false,
  },
});
