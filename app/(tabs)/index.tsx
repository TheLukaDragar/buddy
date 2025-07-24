import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { nucleus } from '../../Buddy_variables.js';
import { useBuddyTheme } from '../../constants/BuddyTheme';
import { useIntro } from '../_layout';

export default function ExploreScreen() {
  const theme = useBuddyTheme();
  const { setShowIntro } = useIntro();
  
  // Show the intro popup when the screen loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(true);
    }, 1000); // Show after 1 second delay

    return () => clearTimeout(timer);
  }, [setShowIntro]);

  // Calendar data
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const dates = [4, 5, 6, 7, 8, 9, 10];
  const activeDate = 6; // Tuesday
  const completedDate = 4; // Sunday

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: nucleus.light.semantic.bg.subtle }]}>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting Section */}
        <View style={styles.greetingContainer}>
          <View style={styles.greetingContent}>
            <View style={styles.morningRow}>
              <Text style={styles.morningText}>Morning Otto,</Text>
            </View>
            <View style={styles.messageRow}>
              <Text style={styles.messageText}>
                Your session is ready <Text style={styles.emoji}>💪</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Calendar Section */}
        <View style={styles.calendarContainer}>
          <View style={styles.calendarContent}>
            {/* Week days row */}
            <View style={styles.weekDaysRow}>
              {weekDays.map((day, index) => (
                <View key={index} style={styles.dayContainer}>
                  <Text style={[
                    styles.dayText,
                    index === 2 && styles.activeDayText // Tuesday highlighted
                  ]}>
                    {day}
                  </Text>
                </View>
              ))}
            </View>
            
            {/* Dates row */}
            <View style={styles.datesRow}>
              {dates.map((date, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.dateContainer,
                    date === activeDate && styles.activeDateContainer,
                    date === completedDate && styles.completedDateContainer
                  ]}
                >
                  <Text style={[
                    styles.dateText,
                    date === activeDate && styles.activeDateText,
                    date === completedDate && styles.completedDateText,
                    (date !== activeDate && date !== completedDate) && styles.disabledDateText
                  ]}>
                    {date}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Activities Section */}
        {/* <View style={styles.sectionContainer}>
          <View style={styles.activitiesCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>Activities</Text>
            </View>
            <View style={styles.activitiesContent}>
              <View style={styles.chartContainer}>
                <View style={styles.circularChart}>
                  <View style={styles.outerRing}>
                    <View style={[styles.progressRing, styles.blueProgress]} />
                  </View>
                  <View style={styles.innerRing}>
                    <View style={[styles.progressRing, styles.yellowProgress]} />
                  </View>
                </View>
              </View>
              
              <View style={styles.statsContainer}>
                <View style={styles.statGroup}>
                  <Text style={styles.statLabel}>Current week fitness goal</Text>
                  <Text style={[styles.statValue, styles.yellowStat]}>1/3</Text>
                </View>
                <View style={styles.statGroup}>
                  <Text style={styles.statLabel}>Week fitness goal</Text>
                  <Text style={[styles.statValue, styles.blueStat]}>4/5</Text>
                </View>
              </View>
            </View>
          </View>
        </View>  */}

        {/* Today's Workout Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>Today's workout</Text>
          <Pressable style={styles.workoutCard} onPress={() => router.push('/workout')}>
            {/* Workout Header */}
            <View style={styles.workoutHeader}>
              <View style={styles.progressCircleContainer}>
                <View style={styles.progressCircle}>
                  <View style={styles.progressCircleInner} />
                </View>
                <Text style={styles.progressText}>0%</Text>
              </View>
              <View style={styles.workoutInfo}>
                <Text style={styles.weekLabel}>Week 2</Text>
                <Text style={styles.workoutTitle}>Tuesday's leg workout</Text>
                <View style={styles.workoutMeta}>
                  <Text style={styles.metaText}>45 min</Text>
                  <View style={styles.dot} />
                  <Text style={styles.metaText}>8 ex.</Text>
                  <View style={styles.dot} />
                  <Text style={styles.metaText}>8 rep</Text>
                </View>
              </View>
            </View>
            
            {/* Recommended Workout */}
            <View style={styles.recommendedSection}>
              <View style={styles.recommendedCard}>
                <View style={styles.workoutThumbnail}>
                  <Image
                    source={require('../../assets/images/focused_flow.png')}
                    style={styles.thumbnailImage}
                    contentFit="cover"
                  />
                </View>
                <View style={styles.recommendedContent}>
                  <Text style={styles.recommendedTitle}>45 min focus flow</Text>
                  <Text style={styles.recommendedDescription}>
                    Based on your last workout Buddy recommends this over that so it will go easy on your knees and shoulders. ....
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        </View>

        {/* Badges Section */}
        {/* <View style={[styles.sectionContainer, { paddingTop: 200 }]}>
          <Text style={styles.sectionHeading}>Badges</Text>
          <View style={styles.badgesCard}>
            <View style={styles.badgeItem}>
              <View style={styles.badgeIcon}>
                <Image
                  source={require('../../assets/icons/home.svg')}
                  style={styles.badgeIconImage}
                  contentFit="contain"
                />
              </View>
              <Text style={styles.badgeLabel}>Consistency</Text>
            </View>
            <View style={styles.badgeItem}>
              <View style={[styles.badgeIcon, styles.activeBadgeIcon]}>
                <Text style={styles.badgeNumber}>💪</Text>
              </View>
              <Text style={styles.badgeLabel}>Strength</Text>
            </View>
            <View style={styles.badgeItem}>
              <View style={styles.badgeIcon}>
                <Image
                  source={require('../../assets/icons/user.svg')}
                  style={styles.badgeIconImage}
                  contentFit="contain"
                />
              </View>
              <Text style={styles.badgeLabel}>Personal</Text>
            </View>
          </View>
        </View> */}

        {/* Bottom padding for tab bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Extra space for custom tab bar
  },
  
  // Greeting Section
  greetingContainer: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 32,
  },
  greetingContent: {
    gap: 8,
  },
  morningRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  morningText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 19.2,
    letterSpacing: 0,
    color: nucleus.light.semantic.fg.muted,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28.8,
    letterSpacing: -1,
    color: nucleus.light.semantic.fg.base,
    width: 249,
  },
  emoji: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '700',
  },

  // Calendar Section
  calendarContainer: {
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  calendarContent: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingVertical: 8,
    gap: 8,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  dayContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    fontWeight: '700',
    color: nucleus.light.semantic.fg.base,
    textAlign: 'center',
  },
  activeDayText: {
    color: nucleus.light.global.blue["70"],
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  dateContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDateContainer: {
    backgroundColor: nucleus.light.global.blue["40"],
  },
  completedDateContainer: {
    backgroundColor: nucleus.light.semantic.accent.moderate,
  },
  dateText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  activeDateText: {
    color: nucleus.light.semantic.fg.onContrast,
  },
  completedDateText: {
    color: nucleus.light.global.green["80"],
  },
  disabledDateText: {
    color: nucleus.light.semantic.fg.disabled,
  },

  // Section Containers
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sectionHeading: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 21.6,
    color: nucleus.light.semantic.fg.base,
    marginBottom: 16,
  },

  // Activities Section
  activitiesCard: {
    backgroundColor: nucleus.light.semantic.bg.canvas,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 19.2,
    color: nucleus.light.semantic.fg.base,
  },
  activitiesContent: {
    flexDirection: 'row',
    paddingHorizontal: 28,
    paddingBottom: 16,
    alignItems: 'center',
    gap: 20,
  },
  chartContainer: {
    position: 'relative',
    width: 111,
    height: 111,
  },
  circularChart: {
    width: 111,
    height: 111,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: 111,
    height: 111,
    borderRadius: 55.5,
    borderWidth: 8,
    borderColor: '#E6E9EB',
  },
  innerRing: {
    position: 'absolute',
    width: 75,
    height: 75,
    borderRadius: 37.5,
    borderWidth: 6,
    borderColor: '#E6E9EB',
  },
  progressRing: {
    position: 'absolute',
    borderRadius: 50,
  },
  blueProgress: {
    width: 111,
    height: 111,
    borderWidth: 8,
    borderColor: 'transparent',
    borderTopColor: nucleus.light.global.blue["40"],
    borderRightColor: nucleus.light.global.blue["40"],
    borderBottomColor: nucleus.light.global.blue["40"],
    borderLeftColor: 'transparent',
    transform: [{ rotate: '-45deg' }],
  },
  yellowProgress: {
    width: 75,
    height: 75,
    borderWidth: 6,
    borderColor: 'transparent',
    borderTopColor: nucleus.light.semantic.accent.moderate,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    transform: [{ rotate: '0deg' }],
  },
  statsContainer: {
    flex: 1,
    paddingLeft: 20,
    gap: 16,
  },
  statGroup: {
    gap: 8,
  },
  statLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    color: nucleus.light.semantic.fg.base,
  },
  statValue: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28.8,
    letterSpacing: -1,
    textAlign: 'right',
  },
  yellowStat: {
    color: nucleus.light.global.brand["70"],
  },
  blueStat: {
    color: nucleus.light.global.blue["40"],
  },

  // Workout Section
  workoutCard: {
    backgroundColor: nucleus.light.semantic.bg.canvas,
    borderRadius: 16,
    overflow: 'hidden',
  },
  workoutHeader: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'flex-start',
    gap: 16,
  },
  progressCircleContainer: {
    position: 'relative',
    width: 40,
    height: 40,
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: nucleus.light.semantic.accent.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircleInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: nucleus.light.semantic.bg.canvas,
  },
  progressText: {
    position: 'absolute',
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    fontWeight: '700',
    color: nucleus.light.semantic.fg.base,
    textAlign: 'center',
    top: 14,
    left: 0,
    right: 0,
  },
  workoutInfo: {
    flex: 1,
    gap: 8,
  },
  weekLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14.4,
    color: nucleus.light.semantic.fg.disabled,
  },
  workoutTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 21.6,
    color: nucleus.light.semantic.fg.base,
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16.8,
    color: nucleus.light.global.green["80"],
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: nucleus.light.global.green["80"],
  },
  recommendedSection: {
    backgroundColor: nucleus.light.global.brand["50"],
    padding: 12,
  },
  recommendedCard: {
    backgroundColor: nucleus.light.semantic.bg.canvas,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
  },
  workoutThumbnail: {
    width: 85,
    height: 85,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  recommendedContent: {
    flex: 1,
    gap: 4,
  },
  recommendedTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16.8,
    color: nucleus.light.semantic.fg.base,
  },
  recommendedDescription: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    color: nucleus.light.semantic.fg.disabled,
  },

  // Badges Section
  badgesCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: nucleus.light.semantic.bg.canvas,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  badgeItem: {
    alignItems: 'center',
    gap: 8,
  },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: nucleus.light.global.grey["40"],
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBadgeIcon: {
    backgroundColor: nucleus.light.global.blue["40"],
  },
  badgeIconImage: {
    width: 24,
    height: 24,
  },
  badgeNumber: {
    fontSize: 24,
  },
  badgeLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    fontWeight: '400',
    color: nucleus.light.semantic.fg.base,
    textAlign: 'center',
  },

  // Bottom padding
  bottomPadding: {
    height: 40,
  },
});
