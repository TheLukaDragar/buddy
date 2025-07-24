import { Image } from "expo-image";
import { router } from "expo-router";
import * as React from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { getProfileSummary } from '@/prompts/generateUserProfile';
import type { RootState } from '@/store';
import { useAppSelector } from '@/store/hooks';
import { nucleus } from "../Buddy_variables.js";

export default function ProfileViewScreen() {
  const userProfile = useAppSelector((state: RootState) => (state as any).user?.extractedProfile);

  if (!userProfile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: nucleus.light.global.blue["20"] }]}>
        <StatusBar barStyle="dark-content" backgroundColor={nucleus.light.global.blue["20"]} />
        <View style={styles.centerContainer}>
          <Text style={styles.noProfileText}>No profile generated yet.</Text>
          <Button 
            mode="contained" 
            onPress={() => router.push('/onboarding')}
            style={styles.button}
            labelStyle={styles.buttonLabel}
            compact={false}
          >
            Complete Onboarding
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: nucleus.light.global.blue["20"] }]}>
      <StatusBar barStyle="dark-content" backgroundColor={nucleus.light.global.blue["20"]} />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Image
            source={require("../assets/back.png")}
            style={styles.backIcon}
            contentFit="contain"
          />
        </Pressable>
        <Text style={styles.headerTitle}>Your Fitness Profile</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Summary Card */}
        <Card style={styles.summaryCard}>
          <Card.Content style={styles.summaryContent}>
            <Text style={styles.summaryTitle}>Your Profile Summary</Text>
            <Text style={styles.summaryText}>"{getProfileSummary(userProfile)}"</Text>
          </Card.Content>
        </Card>

        {/* Profile Details */}
        <View style={styles.detailsContainer}>
          <ProfileDetail 
            icon="🎯" 
            label="Your Goal" 
            value={userProfile.fitnessGoal} 
          />
          <ProfileDetail 
            icon="💪" 
            label="Experience Level" 
            value={userProfile.experienceLevel} 
          />
          <ProfileDetail 
            icon="🏃" 
            label="Current Activity" 
            value={userProfile.currentActivity} 
          />
          <ProfileDetail 
            icon="⏰" 
            label="Training Plan" 
            value={`${userProfile.trainingFrequency}, ${userProfile.workoutDuration}`} 
          />
          <ProfileDetail 
            icon="🎭" 
            label="Communication Style" 
            value={userProfile.personalityTone} 
          />
          <ProfileDetail 
            icon="🔥" 
            label="Motivation Level" 
            value={userProfile.motivationLevel} 
          />
          
          {userProfile.additionalInfo && (
            <ProfileDetail 
              icon="📝" 
              label="Additional Notes" 
              value={userProfile.additionalInfo} 
            />
          )}
          
          {userProfile.specificNeeds.length > 0 && (
            <ProfileDetail 
              icon="🎯" 
              label="Specific Needs" 
              value={userProfile.specificNeeds.join(', ')} 
            />
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <Button
            mode="contained"
            style={[styles.button, { backgroundColor: nucleus.light.global.blue["70"] }]}
            labelStyle={[styles.buttonLabel, { color: nucleus.light.global.blue["10"] }]}
            onPress={() => router.push('/(tabs)/chat')}
            compact={false}
          >
            Chat with Buddy
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
      </ScrollView>
    </SafeAreaView>
  );
}

interface ProfileDetailProps {
  icon: string;
  label: string;
  value: string;
}

function ProfileDetail({ icon, label, value }: ProfileDetailProps) {
  return (
    <Card style={styles.detailCard}>
      <Card.Content style={styles.detailContent}>
        <View style={styles.detailHeader}>
          <Text style={styles.detailIcon}>{icon}</Text>
          <Text style={styles.detailLabel}>{label}</Text>
        </View>
        <Text style={styles.detailValue}>{value}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: nucleus.light.global.blue["20"],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    color: nucleus.light.semantic.fg.base,
  },
  spacer: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  summaryCard: {
    backgroundColor: nucleus.light.semantic.bg.canvas,
    borderRadius: 16,
    marginBottom: 24,
    elevation: 2,
  },
  summaryContent: {
    padding: 20,
  },
  summaryTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 20,
    color: nucleus.light.semantic.fg.base,
    marginBottom: 12,
    textAlign: 'center',
  },
  summaryText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: nucleus.light.semantic.fg.base,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  detailsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  detailCard: {
    backgroundColor: nucleus.light.semantic.bg.canvas,
    borderRadius: 12,
    elevation: 1,
  },
  detailContent: {
    padding: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  detailLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    color: nucleus.light.semantic.fg.muted,
  },
  detailValue: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 22,
    color: nucleus.light.semantic.fg.base,
  },
  actionContainer: {
    gap: 16,
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
  noProfileText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    color: nucleus.light.semantic.fg.base,
    textAlign: 'center',
    marginBottom: 24,
  },
}); 