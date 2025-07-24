import type { RootState } from '@/store';
import { useAppSelector } from '@/store/hooks';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { nucleus } from '../../Buddy_variables.js';
import { useBuddyTheme } from '../../constants/BuddyTheme';

export default function ProfileScreen() {
  const theme = useBuddyTheme();
  const userProfile = useAppSelector((state: RootState) => (state as any).user?.extractedProfile);
  const onboardingCompleted = useAppSelector((state: RootState) => (state as any).user?.onboardingCompleted);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: nucleus.light.global.blue["20"] }]}>
      <View style={styles.content}>
        <Text variant="headlineLarge" style={[styles.title, { color: nucleus.light.global.blue["80"] }]}>
          Profile
        </Text>

        {/* Profile Summary Card */}
        {userProfile ? (
            <Text>
            {userProfile.profileSummary || "Profile generated successfully!"}
          </Text>
        ) : (
          <Text >
            Profile generated successfully!
          </Text>
        )}
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
    paddingHorizontal: 24,
    paddingBottom: 110, // Space for custom tab bar
  },
  title: {
    fontFamily: 'PlusJakartaSans-Bold',
    textAlign: 'center',
    marginBottom: 32,
  },
  
}); 