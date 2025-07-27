import { BlurView } from 'expo-blur';
import { Image } from "expo-image";
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import { SafeAreaView } from 'react-native-safe-area-context';
import { nucleus } from '../Buddy_variables';


export default function ExercisesScreen() {

  const exercises = [
    {
      id: 1,
      name: 'Squat',
      sets: '4 sets',
      muscles: 'quads, glutes, hamstrings, core',
      description: 'Classic barbell squat movement for lower body strength',
      image: require('../assets/exercises/squats.png'),
    },
    {
      id: 2,
      name: 'Lunges',
      sets: '4 sets',
      muscles: 'quads, glutes, hamstrings, core',
      description: 'Classic barbell squat movement for lower body strength',
      image: require('../assets/exercises/squats.png'),
    },
    {
      id: 3,
      name: 'Glute Bridges',
      sets: '4 sets',
      muscles: 'quads, glutes, hamstrings, core',
      description: 'Classic barbell squat movement for lower body strength',
      image: require('../assets/exercises/squats.png'),
    },
    {
      id: 3,
      name: 'Glute Bridges',
      sets: '4 sets',
      muscles: 'quads, glutes, hamstrings, core',
      description: 'Classic barbell squat movement for lower body strength',
      image: require('../assets/exercises/squats.png'),
    },
    {
      id: 3,
      name: 'Glute Bridges',
      sets: '4 sets',
      muscles: 'quads, glutes, hamstrings, core',
      description: 'Classic barbell squat movement for lower body strength',
      image: require('../assets/exercises/squats.png'),
    },
    {
      id: 3,
      name: 'Glute Bridges',
      sets: '4 sets',
      muscles: 'quads, glutes, hamstrings, core',
      description: 'Classic barbell squat movement for lower body strength',
      image: require('../assets/exercises/squats.png'),
    },
    {
      id: 3,
      name: 'Glute Bridges',
      sets: '4 sets',
      muscles: 'quads, glutes, hamstrings, core',
      description: 'Classic barbell squat movement for lower body strength',
      image: require('../assets/exercises/squats.png'),
    },

    {
      id: 3,
      name: 'Glute Bridges',
      sets: '4 sets',
      muscles: 'quads, glutes, hamstrings, core',
      description: 'Classic barbell squat movement for lower body strength',
      image: require('../assets/exercises/squats.png'),
    },
    {
      id: 3,
      name: 'Glute Bridges',
      sets: '4 sets',
      muscles: 'quads, glutes, hamstrings, core',
      description: 'Classic barbell squat movement for lower body strength',
      image: require('../assets/exercises/squats.png'),
    },
    {
      id: 3,
      name: 'Glute Bridges',
      sets: '4 sets',
      muscles: 'quads, glutes, hamstrings, core',
      description: 'Classic barbell squat movement for lower body strength',
      image: require('../assets/exercises/squats.png'),
    },

  ];





  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor: nucleus.light.semantic.bg.subtle }]} edges={['top', 'bottom']}>
        <SystemBars style="dark" />
        <View style={styles.topNav}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Image
                source={require('../assets/icons/back.svg')}
                style={styles.crossIcon}
                contentFit="contain"
              />
            </TouchableOpacity>
            
          </View>

          <View style={styles.summaryContainer}>
          <Text style={styles.workoutTitle}> 
            Tuesday's Leg Workout
          </Text>

          <Text style={styles.workoutExercises}>Exercises</Text>
         
          
         </View>    
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* Summary Section */}
          <View style={styles.summaryExerciseSection}>
            
            
            <View style={styles.exerciseList}>
              {exercises.map((exercise, index) => (
                <View key={exercise.id} style={styles.exerciseCard}>
                  <View style={styles.exerciseRow}>
                    <View style={styles.exerciseImageContainer}>
                      <Image
                        source={exercise.image}
                        style={styles.exerciseImage}
                        contentFit="cover"
                      />
                    </View>
                    <View style={styles.exerciseInfo}>
                      <View style={styles.exerciseTextContainer}>
                        <Text style={styles.exerciseNumber} numberOfLines={2}>{exercise.name}</Text>
                        <Text style={[
                          styles.exerciseDetails,
                          index === 2 && styles.exerciseDetails2
                        ]}>
                          {exercise.sets}  •  {exercise.muscles}
                        </Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.playButton}
                        onPress={() => {
                          console.log(`Pressed info for ${exercise.name}`);
                        }}
                      >
                        <Image
                          source={require('../assets/icons/back.svg')}
                          style={styles.playIcon}
                          contentFit="contain"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.exerciseDescription} numberOfLines={3}>
                    {exercise.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Floating Button Container */}
        <View style={styles.floatingButtonWrapper}>
          <BlurView intensity={100} tint="light" style={styles.floatingButtonContainer}>
            <View style={styles.buttonRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.adjustButton,
                  styles.buttonBase,
                  {
                    opacity: pressed ? 0.7 : 1,
                    transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
                  }
                ]}
                onPress={() => console.log('Adjust pressed')}
              >
                <View style={[
                  styles.adjustButtonBg, 
                  styles.buttonBg,
                ]} />
                <View style={styles.buttonContent}>
                  <Text style={[styles.adjustButtonLabel, styles.buttonLabel]}>Adjust</Text>
                </View>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.startButton,
                  styles.buttonBase,
                  {
                    backgroundColor: pressed 
                      ? nucleus.light.global.blue[80]
                      : nucleus.light.global.blue[70],
                    transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
                  }
                ]}
                onPress={() => console.log('Start workout pressed')}
              >
                <View style={styles.startButtonContent}>
                  <Text style={[styles.startButtonLabel, styles.buttonLabel]}>Start workout</Text>
                </View>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.iconButton,
                  styles.buttonBase,
                  {
                    opacity: pressed ? 0.7 : 1,
                    transform: pressed ? [{ scale: 0.95 }] : [{ scale: 1 }],
                  }
                ]}
              >
                <View style={styles.musicIconBackground}>
                  <Image
                    source={require('../assets/icons/music.svg')}
                    style={styles.musicIcon}
                    contentFit="contain"
                  />
                </View>
              </Pressable>
            </View>
          </BlurView>
        </View>
      </SafeAreaView>
     
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topNav: {
    height: 64,
    paddingVertical: 16,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  
  },
  backButton: {
    position: 'absolute',
    left: 8,
    top: 4,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
  },
  crossIcon: {
    width: 32,
    height: 32,
  },
  content: {
    padding: 16,
    paddingTop: 0,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 32,
    alignSelf: 'stretch',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 0,
    paddingBottom: 120, // Extra space for floating buttons
    gap: 32,
  },

  summaryContainer: {
    padding: 16,
    paddingTop: 0,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },

  workoutExercises: {
    color: nucleus.light.semantic.fg.base,
    fontFamily: nucleus.light.typography.fontFamily.primary,
    fontSize: nucleus.light.typography.fontSize.xl,
    fontWeight: '700',
    lineHeight: 28.8,
    letterSpacing: -1,
  },
  workoutTitle: {
    color: nucleus.light.semantic.fg.muted,
    fontFamily: nucleus.light.typography.fontFamily.primary,
    fontSize: nucleus.light.typography.fontSize.sm,
    fontWeight: '700',
    lineHeight: 16.8,
    letterSpacing: 0,
  },
  elementwith_icon: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    gap: 8,
   
  },
  icon: {
    width: 32,
    height: 32,
  },
  elementText: {
    color: nucleus.light.global.grey[70],
    fontFamily: nucleus.light.typography.fontFamily.primary,
    fontSize: nucleus.light.typography.fontSize.md,
    fontWeight: '700',
    lineHeight: 19.2,
    letterSpacing: 0,
  },



  chevronIcon: {
    width: 32,
    height: 32,
    transform: [{ rotate: '180deg' }],
  },
 
  summaryExerciseSection: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 24,
    alignSelf: 'stretch',
  },


  exerciseList: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
    alignSelf: 'stretch',
  },
  exerciseCard: {
    backgroundColor: nucleus.light.global.white,
    borderRadius: 12,
    padding: 8,
    gap: 12,
    alignSelf: 'stretch',
  },
  exerciseRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  exerciseImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  exerciseImage: {
    position: 'absolute',
    height: '100%',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    width: '100%',
  },
  exerciseInfo: {
    gap: 4,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
  },
  exerciseTextContainer: {
    gap: 4,
    flex: 1,
  },
  exerciseNumber: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 19,
    color: nucleus.light.global.grey[80],
    includeFontPadding: false,
    overflow: 'hidden',
    textAlign: 'left',
  },
  exerciseDetails: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    color: nucleus.light.global.grey[70],
    includeFontPadding: false,
    width: 175,
    textAlign: 'left',
  },
  exerciseDetails2: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    color: nucleus.light.semantic.fg.muted,
    includeFontPadding: false,
    width: 175,
    textAlign: 'left',
  },
  exerciseDescription: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    color: nucleus.light.semantic.fg.muted,
    includeFontPadding: false,
    overflow: 'hidden',
    textAlign: 'left',
    display: 'none',
  },
  playButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  playIcon: {
    width: 32,
    height: 32,
    overflow: 'hidden',
    transform: [{ rotate: '180deg' }],

  },
  floatingButtonWrapper: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 34,
    height: 72,
    shadowColor: 'rgba(185, 230, 255, 0.40)',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 25,
    elevation: 25,
    shadowOpacity: 1,
  },
  floatingButtonContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.50)',
    borderWidth: 1,
    borderColor: 'rgba(208, 221, 23, 0.16)',
    overflow: 'hidden',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
  },
  buttonBase: {
    height: 48,
    borderRadius: 48,
    position: 'relative',
  },
  buttonBg: {
    overflow: 'hidden',
    borderRadius: 48,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  buttonContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  startButtonContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonLabel: {
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '700',
    lineHeight: 16,
    fontSize: 16,
    includeFontPadding: false,
  },
  adjustButton: {
    width: 84,
  },
  adjustButtonBg: {
    borderStyle: 'solid',
    borderColor: nucleus.light.global.blue[70],
    borderWidth: 1,
  },
  adjustButtonLabel: {
    color: nucleus.light.global.blue[70],
  },
  startButton: {
    flex: 1,
  },
  startButtonBg: {
    backgroundColor: nucleus.light.global.blue[70],
  },
  startButtonLabel: {
    color: nucleus.light.global.blue[10],
  },
  iconButton: {
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonImage: {
    width: 24,
    height: 24,
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  musicIconBackground: {
    borderRadius: 48,
    backgroundColor: nucleus.light.semantic.accent.moderate,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 12.5,
    paddingRight: 11.5,
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    height: 48,
  },
  musicIcon: {
    width: 24,
    height: 24,
    tintColor: nucleus.light.semantic.accent.intense,
  },

 
  
});

