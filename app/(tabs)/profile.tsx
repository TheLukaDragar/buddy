import { ScrollView, StyleSheet } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { nucleus } from '../../Buddy_variables.js';
import { useBuddyTheme } from '../../constants/BuddyTheme';
import type { RootState } from '../../store';
import { useAppSelector } from '../../store/hooks';

export default function ProfileScreen() {
  const theme = useBuddyTheme();
  const userProfile = useAppSelector((state: RootState) => (state as any).user?.extractedProfile);
  const onboardingCompleted = useAppSelector((state: RootState) => (state as any).user?.onboardingCompleted);
  const isLoading = useAppSelector((state: RootState) => (state as any).user?.isLoadingProfile);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: nucleus.light.global.blue["20"] }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="headlineLarge" style={[styles.title, { color: nucleus.light.global.blue["80"] }]}>
          Your Profile
        </Text>

        {/* Loading State */}
        {isLoading && (
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <ActivityIndicator size="large" color={nucleus.light.global.blue["70"]} />
              <Text style={[styles.loadingText, { color: nucleus.light.global.blue["70"] }]}>
                Generating your personalized profile...
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Profile Content */}
        {!isLoading && userProfile && (
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text style={[styles.profileText, { color: nucleus.light.global.blue["90"] }]}>
                {userProfile}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* No Profile State */}
        {!isLoading && !userProfile && onboardingCompleted && (
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text style={[styles.noProfileText, { color: nucleus.light.global.blue["70"] }]}>
                Your profile will appear here once generated from your onboarding responses.
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Not Completed State */}
        {!onboardingCompleted && (
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text style={[styles.noProfileText, { color: nucleus.light.global.blue["70"] }]}>
                Complete the onboarding process to generate your personalized profile.
              </Text>
            </Card.Content>
          </Card>
        )}
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
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 110, // Space for custom tab bar
  },
  title: {
    fontFamily: 'PlusJakartaSans-Bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: nucleus.light.global.blue["10"],
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: nucleus.light.global.blue["90"],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 20,
    alignItems: 'center',
  },
  profileText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
    width: '100%',
  },
  loadingText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  noProfileText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
}); 