import { useBuddyTheme } from '@/constants/BuddyTheme';
import { StatusBar, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { nucleus } from '../../Buddy_variables.js';
import { useIntro } from '../_layout';
import { useEffect } from 'react';


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


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: nucleus.light.semantic.bg.subtle }]}>
      <StatusBar barStyle="dark-content" backgroundColor={nucleus.light.semantic.bg.subtle} />
      <View style={styles.content}>
        {/* Top Greeting Section */}
        <View style={styles.greetingContainer}>
          <View style={styles.greetingContent}>
            {/* Morning greeting */}
            <View style={styles.morningRow}>
              <Text style={styles.morningText}>Morning Otto,</Text>
            </View>
            
            {/* Main message */}
            <View style={styles.messageRow}>
              <Text style={styles.messageText}>
                Your session is ready <Text style={styles.emoji}>💪</Text>
              </Text>
            </View>
          </View>
        </View>
        
        {/* Rest of content */}
        <View style={styles.mainContent}>
          {/* Blank flex container ready for more content */}
        </View>
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
    paddingBottom: 100, // Space for custom tab bar
  },
  greetingContainer: {
    display: 'flex',
    width: 393,
    padding: 18,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: -48,
  },
  greetingContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  morningRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    alignSelf: 'stretch',

  },
  morningText: {
  fontFamily: 'PlusJakartaSans-Regular',
  fontSize: 16,
  fontWeight: '400',
  lineHeight: 19.2, // 120% of 16px
  letterSpacing: 0,
   
  },
  messageRow: {
  display: 'flex',
  alignItems: 'flex-end',
  gap: 4,
  alignSelf: 'stretch',
  },
  messageText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28.8, // 1.2 line height
    letterSpacing: -1,
    color: '#131214', // global/grey/100
    textAlign: 'left',
    width: 249,
  },
  emoji: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '700',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
