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
          <Card style={styles.profileCard}>
            <Card.Content style={styles.cardContent}>
              <Text style={styles.cardTitle}>Your Fitness Profile</Text>
              <Text style={styles.profilePreview}>
                {userProfile.profileSummary || "Profile generated successfully!"}
              </Text>
              
              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  style={[styles.button, { backgroundColor: nucleus.light.global.blue["70"] }]}
                  labelStyle={[styles.buttonLabel, { color: nucleus.light.global.blue["10"] }]}
                  onPress={() => router.push('/profile-view')}
                  compact={false}
                >
                  View Full Profile
                </Button>
                
                <Button
                  mode="outlined"
                  style={[styles.button, styles.outlinedButton]}
                  labelStyle={[styles.buttonLabel, { color: nucleus.light.global.blue["70"] }]}
                  onPress={() => router.push('/onboarding')}
                  compact={false}
                >
                  Update Profile
                </Button>
              </View>
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.profileCard}>
            <Card.Content style={styles.cardContent}>
              <Text style={styles.cardTitle}>
                {onboardingCompleted ? "Generating Profile..." : "Get Started"}
              </Text>
              <Text style={styles.profilePreview}>
                {onboardingCompleted 
                  ? "We're creating your personalized fitness profile..."
                  : "Complete the onboarding to create your personalized fitness profile."
                }
              </Text>
              
              <Button
                mode="contained"
                style={[styles.button, { backgroundColor: nucleus.light.global.blue["70"] }]}
                labelStyle={[styles.buttonLabel, { color: nucleus.light.global.blue["10"] }]}
                onPress={() => router.push('/onboarding')}
                compact={false}
              >
                {onboardingCompleted ? "View Onboarding" : "Start Onboarding"}
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Button
            mode="text"
            style={styles.textButton}
            labelStyle={[styles.textButtonLabel, { color: nucleus.light.global.blue["70"] }]}
            onPress={() => router.push('/(tabs)/chat')}
          >
            💬 Chat with Buddy
          </Button>
          
          <Button
            mode="text"
            style={styles.textButton}
            labelStyle={[styles.textButtonLabel, { color: nucleus.light.global.blue["70"] }]}
            onPress={() => {
              // TODO: Add settings screen
              console.log('Settings coming soon!');
            }}
          >
            ⚙️ Settings
          </Button>
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
  profileCard: {
    backgroundColor: nucleus.light.semantic.bg.canvas,
    borderRadius: 16,
    width: '100%',
    marginBottom: 24,
    elevation: 2,
  },
  cardContent: {
    padding: 24,
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    color: nucleus.light.semantic.fg.base,
    textAlign: 'center',
    marginBottom: 12,
  },
  profilePreview: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: nucleus.light.semantic.fg.muted,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    borderRadius: 48,
    minHeight: 48,
  },
  outlinedButton: {
    borderColor: nucleus.light.global.blue["70"],
    borderWidth: 2,
  },
  buttonLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    lineHeight: 20,
    marginVertical: 0,
    includeFontPadding: false,
  },
  quickActions: {
    width: '100%',
    gap: 8,
  },
  textButton: {
    borderRadius: 24,
  },
  textButtonLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
  },
}); 