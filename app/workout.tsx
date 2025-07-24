import { BlurView } from 'expo-blur';
import { Image } from "expo-image";
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import { SafeAreaView } from 'react-native-safe-area-context';
import { nucleus } from '../Buddy_variables';
import MusicModal from '../components/MusicModal';


export default function WorkoutScreen() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showMusicModal, setShowMusicModal] = useState(false);

  const weekNumber = 1;

  const moods = [
    { 
      id: 'energetic', 
      icon: require('../assets/icons/flash.svg'),
      iconSelected: require('../assets/icons/flash-energetic.svg'),
      label: 'Energetic',
      backgroundColor: nucleus.light.global.brand[40],
      borderColor: nucleus.light.global.brand[70],
      iconColor: nucleus.light.global.brand[90]
    },
    { 
      id: 'happy', 
      icon: require('../assets/icons/heart.svg'),
      iconSelected: require('../assets/icons/heart-happy.svg'),
      label: 'Happy',
      backgroundColor: nucleus.light.global.blue[20],
      borderColor: nucleus.light.global.blue[40],
      iconColor: nucleus.light.global.blue[90]
    },
    { 
      id: 'calm', 
      icon: require('../assets/icons/face.svg'),
      iconSelected: require('../assets/icons/face-calm.svg'),
      label: 'Calm',
      backgroundColor: nucleus.light.global.green[20],
      borderColor: nucleus.light.global.green[40],
      iconColor: nucleus.light.global.green[90]
    },
    { 
      id: 'tired', 
      icon: require('../assets/icons/tired.svg'),
      iconSelected: require('../assets/icons/tired-blue.svg'),
      label: 'Tired',
      backgroundColor: nucleus.light.global.orange[20],
      borderColor: nucleus.light.global.orange[40],
      iconColor: nucleus.light.global.orange[90]
    },
  ];

  const equipment = [
    {
      id: 1,
      name: 'Loop Band',
      image: require('../assets/icons/loop-band.png'),
    },
    {
      id: 2,
      name: 'Mat',
      image: require('../assets/icons/mat.png'),
    },
    {
      id: 3,
      name: 'Kettlebell',
      image: require('../assets/icons/kettlebell.png'),
    },
  ];

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
  ];



  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor: nucleus.light.semantic.bg.subtle }]}>
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
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
         <View style={styles.summaryContainer}>
          <Text style={styles.weekNumber}>Week {weekNumber}</Text>
          <Text style={styles.workoutTitle}>Tuesday's Workout</Text>
          <Text style={styles.workoutDescription}>
          Based on your last workout Buddy recommends this over that so it will go easy on your knees and  right ankle. 
          </Text>

          <View style={styles.elementwith_icon}>
            <Image source={require('../assets/icons/clock.svg')} style={styles.icon} />

            <Text style={styles.elementText}>10 exercises</Text>
          </View>

          <View style={styles.elementwith_icon}>
            <Image source={require('../assets/icons/equipment.svg')} style={styles.icon} />

            <Text style={styles.elementText}>8 exercises</Text>
          </View>

          <View style={styles.elementwith_icon}>
            <Image source={require('../assets/icons/music.svg')} style={styles.icon} />

            <Text style={styles.elementText}>10 min</Text>
          </View>
          
         </View>        

         <View style={styles.userMood}>
            <View style={styles.moodContainer}>
                <Text style={styles.moodTitle}>
                    How are you feeling today?
                </Text>
                <Text style={styles.moodSubtitle}>
                Your mood helps me adjust the workout intensity and coaching style. 
          </Text>
          </View>
          <View style={styles.moodIconsContainer}>
            {moods.map((mood) => {
              const isSelected = selectedMood === mood.id;
              return (
                <View key={mood.id} style={styles.moodIconItem}>
                  <View style={[
                    styles.moodIconWrapper,
                    isSelected && {
                      borderRadius: 40,
                      borderWidth: 2,
                      borderColor: mood.borderColor,
                    }
                  ]}>
                    <TouchableOpacity 
                      style={[
                        styles.moodIconCircle,
                        isSelected && {
                          backgroundColor: mood.backgroundColor,
                        }
                      ]}
                      onPress={() => setSelectedMood(mood.id)}
                    >
                      <Image 
                        source={isSelected ? mood.iconSelected : mood.icon} 
                        contentFit="contain" 
                        style={styles.moodIconDeactive} 
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.moodIconText}>
                    {mood.label}
                  </Text>
                </View>
              );
            })}
             </View>
             </View>

        {/* Equipment Section */}
        <View style={styles.equipmentSection}>
          <View style={styles.equipmentHeader}>
            <Text style={styles.equipmentTitle}>Equipment</Text>
            <TouchableOpacity style={styles.equipmentChevron}>
              <Image
                source={require('../assets/icons/back.svg')}
                style={styles.chevronIcon}
                contentFit="contain"
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.equipmentList}>
            {equipment.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.equipmentItem}
                onPress={() => {
                  console.log(`Selected equipment: ${item.name}`);
                }}
              >
                <View style={styles.equipmentImageContainer}>
                  <Image
                    source={item.image}
                    style={styles.equipmentImage}
                    contentFit="contain"
                  />
                </View>
                <Text style={styles.equipmentName}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
            </View> 

          {/* Summary Section */}
          <View style={styles.summaryExerciseSection}>
            <View style={styles.summaryExerciseHeader}>
              <Text style={styles.summaryExerciseTitle}>Summary</Text>
              <TouchableOpacity style={styles.summaryChevron}>
                <Image
                  source={require('../assets/icons/back.svg')}
                  style={styles.chevronIcon}
                  contentFit="contain"
                />
              </TouchableOpacity>
            </View>
            
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
                          source={require('../assets/icons/info.svg')}
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
                onPress={() => setShowMusicModal(true)}
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
      
      <MusicModal 
        visible={showMusicModal} 
        onClose={() => setShowMusicModal(false)} 
      />
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
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },

  weekNumber: {
    color: nucleus.light.semantic.fg.muted,
    fontFamily: nucleus.light.typography.fontFamily.primary,
    fontSize: nucleus.light.typography.fontSize.sm,
    fontWeight: '700',
    lineHeight: 16.8,
    letterSpacing: 0,
  },
  workoutTitle: {
    color: nucleus.light.semantic.fg.base,
    fontFamily: nucleus.light.typography.fontFamily.primary,
    fontSize: nucleus.light.typography.fontSize.xl,
    fontWeight: '700',
    lineHeight: 28.8,
    letterSpacing: -1,
  },
  workoutDescription: {
    color: nucleus.light.semantic.fg.base,
    fontFamily: nucleus.light.typography.fontFamily.primary,
    fontSize: nucleus.light.typography.fontSize.sm,
    fontWeight: '400',
    lineHeight: 21,
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
  userMood: {
   
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
  },
  moodContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
  },
  moodTitle: {
    color: nucleus.light.semantic.fg.base,
    fontFamily: nucleus.light.typography.fontFamily.primary,
    fontSize: nucleus.light.typography.fontSize.lg,
    fontWeight: '700',
    lineHeight: 21.6,
    letterSpacing: 0,
  },
  moodSubtitle: {
    color: nucleus.light.semantic.fg.base,
    fontFamily: nucleus.light.typography.fontFamily.primary,
    fontSize: nucleus.light.typography.fontSize.sm,
    fontWeight: '400',
    lineHeight: 21,
    letterSpacing: 0,
    textOverflow: 'ellipsis',
  },
  moodIconsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  moodIconItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    maxWidth: 80,
  },
  moodIconWrapper: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },

  moodIconCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: nucleus.light.global.grey[30],
    justifyContent: 'center',
    alignItems: 'center',
  },

  moodIconDeactive: {
    width: 38.919,
    height: 38.919,
    flexShrink: 0,
    aspectRatio: 38.92/38.92,
  },
  moodIconText: {
    color: nucleus.light.semantic.fg.base,
    textAlign: 'center',
    alignSelf: 'stretch',
    fontFamily: nucleus.light.typography.fontFamily.primary,
    fontSize: nucleus.light.typography.fontSize.xs,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 18,
    letterSpacing: 0,
  },
  equipmentSection: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 24,
    alignSelf: 'stretch',
  },
  equipmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  equipmentTitle: {
    color: nucleus.light.semantic.fg.base,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: nucleus.light.typography.fontSize.lg,
    fontWeight: '700',
    lineHeight: 21.6,
    letterSpacing: 0,
  },
  equipmentChevron: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronIcon: {
    width: 32,
    height: 32,
    transform: [{ rotate: '180deg' }],
  },
  equipmentList: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
    alignSelf: 'stretch',
  },
  equipmentItem: {
    backgroundColor: nucleus.light.global.brand[40],
    borderRadius: nucleus.light.cornerRadius.lg,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    alignSelf: 'stretch',
  },
  equipmentImageContainer: {
    width: 80,
    height: 80,
    borderRadius: nucleus.light.cornerRadius.md,
    backgroundColor: nucleus.light.global.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  equipmentImage: {
    width: 64,
    height: 64,
  },
  equipmentName: {
    color: nucleus.light.global.grey[80],
    fontFamily: nucleus.light.typography.fontFamily.primary,
    fontSize: nucleus.light.typography.fontSize.md,
    fontWeight: '700',
    lineHeight: 19.2,
    letterSpacing: 0,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  summaryExerciseSection: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 24,
    alignSelf: 'stretch',
  },
  summaryExerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  summaryExerciseTitle: {
    color: nucleus.light.semantic.fg.base,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: nucleus.light.typography.fontSize.lg,
    fontWeight: '700',
    lineHeight: 21.6,
    letterSpacing: 0,
  },
  summaryChevron: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
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

