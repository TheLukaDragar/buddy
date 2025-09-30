import { router } from 'expo-router';
import * as React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar, Button, Card, Icon, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { nucleus } from '../../Buddy_variables.js';
import { useAuth } from '../../contexts/AuthContext';
import { useSpotifyAuth } from '../../hooks/useSpotifyAuth';
import { regenerateWorkoutPlan } from '../../services/workoutPlanService';
import type { RootState } from '../../store';
import { setOnboardingCompleted } from '../../store/slices/userSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useIntro } from '../_layout';

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const { setShowIntro } = useIntro();
  const { user, signOut, loading } = useAuth();
  const userProfile = useAppSelector((state: RootState) => (state as any).user?.extractedProfile);
  const onboardingCompleted = useAppSelector((state: RootState) => (state as any).user?.onboardingCompleted);
  const isLoading = useAppSelector((state: RootState) => (state as any).user?.isLoadingProfile);
  const [isRegenerating, setIsRegenerating] = React.useState(false);

  const { isAuthenticated: spotifyAuthenticated, user: spotifyUser, logout: disconnectSpotify } = useSpotifyAuth();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleSpotifyDisconnect = () => {
    disconnectSpotify();
  };

  const handleRegeneratePlan = async () => {
    if (!userProfile) {
      Alert.alert(
        'No Profile',
        'You need a profile to generate a workout plan. Please complete the onboarding first.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    Alert.alert(
      'Regenerate Workout Plan',
      'This will deactivate your current workout plan and create a new one based on your profile. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          style: 'default',
          onPress: async () => {
            try {
              setIsRegenerating(true);
              await regenerateWorkoutPlan(userProfile, dispatch);
              
              // Navigate to progress screen
              router.push('/workout-plan-progress');
            } catch (error: any) {
              console.error('❌ Failed to regenerate workout plan:', error);
              Alert.alert(
                'Error',
                error.message || 'Failed to regenerate workout plan. Please try again.',
                [{ text: 'OK', style: 'default' }]
              );
            } finally {
              setIsRegenerating(false);
            }
          },
        },
      ]
    );
  };

  const handleRedoProfile = () => {
    // Just navigate to onboarding - don't clear anything
    router.push('/onboarding');
  };

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

        {/* User Info Card */}
        {user && (
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Avatar.Text 
                size={60} 
                label={user.email?.charAt(0).toUpperCase() || 'U'} 
                style={{ backgroundColor: nucleus.light.global.blue["70"], marginBottom: 16 }}
                labelStyle={{ color: nucleus.light.global.blue["10"], fontFamily: 'PlusJakartaSans-Bold' }}
              />
              <Text style={[styles.userEmail, { color: nucleus.light.global.blue["90"] }]}>
                {user.email}
              </Text>
              <Text style={[styles.userName, { color: nucleus.light.global.blue["80"] }]}>
                {user.user_metadata?.full_name || 'User'}
              </Text>
            </Card.Content>
          </Card>
        )}

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

        {/* Action Buttons - Subtle */}
        {!isLoading && userProfile && onboardingCompleted && (
          <View style={styles.regenerateContainer}>
            <Button
              mode="text"
              onPress={handleRedoProfile}
              labelStyle={[styles.regenerateLabel, { color: nucleus.light.global.blue["60"] }]}
              contentStyle={styles.regenerateContent}
              compact={true}
            >
              Redo profile
            </Button>
            <Button
              mode="text"
              onPress={handleRegeneratePlan}
              disabled={isRegenerating}
              loading={isRegenerating}
              labelStyle={[styles.regenerateLabel, { color: nucleus.light.global.blue["60"] }]}
              contentStyle={styles.regenerateContent}
              compact={true}
            >
              {isRegenerating ? 'Regenerating plan...' : 'Regenerate workout plan'}
            </Button>
          </View>
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

        {/* Spotify Status */}
        <Card style={styles.card}>
          <Card.Content style={styles.spotifyCardContent}>
            <View style={styles.spotifyRow}>
              <Icon source="spotify" size={20} color={spotifyAuthenticated ? "#1DB954" : nucleus.light.global.blue["60"]} />
              <Text style={[styles.spotifyText, { color: nucleus.light.global.blue["80"] }]}>
                Spotify {spotifyAuthenticated ? `- ${spotifyUser?.display_name} (${spotifyUser?.product})` : '- Not connected'}
              </Text>
            </View>
            {spotifyAuthenticated && (
              <Button
                mode="text"
                compact
                labelStyle={[styles.spotifyDisconnectLabel, { color: nucleus.light.global.blue["60"] }]}
                onPress={handleSpotifyDisconnect}
              >
                Disconnect
              </Button>
            )}
          </Card.Content>
        </Card>

        {/* Sign Out Button */}
        <Button
          mode="outlined"
          style={[styles.signOutButton, { 
            borderColor: nucleus.light.global.blue["70"],
            marginTop: 32
          }]}
          labelStyle={[styles.signOutButtonLabel, { color: nucleus.light.global.blue["70"] }]}
          contentStyle={styles.signOutButtonContent}
          compact={false}
          disabled={loading}
          onPress={handleSignOut}
        >
          Sign Out
        </Button>
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
  userEmail: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  userName: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    textAlign: 'center',
  },
  signOutButton: {
    minHeight: 48,
    borderRadius: 48,
    borderWidth: 1,
  },
  signOutButtonLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    lineHeight: 20,
  },
  signOutButtonContent: {
    minHeight: 48,
    paddingHorizontal: 24,
    paddingVertical: 0,
  },
  spotifyCardContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spotifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  spotifyText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    marginLeft: 8,
  },
  spotifyDisconnectLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
  },
  regenerateContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  regenerateLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  regenerateContent: {
    paddingHorizontal: 0,
    paddingVertical: 4,
  },
}); 