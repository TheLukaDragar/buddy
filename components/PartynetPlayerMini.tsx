import { useBuddyTheme } from '@/constants/BuddyTheme';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { nucleus } from '../Buddy_variables.js';
import { useAppDispatch } from '../store/hooks';
import type { RootState } from '../store';
import { pauseMusic, resumeMusic, skipNext, skipPrevious } from '../store/actions/musicActions';
import { selectMiniPlayerVisible } from '../store/slices/musicSlice';
import {
  selectPartynetCurrentTrack,
  selectPartynetIsPlaying,
  selectPartynetPosition,
  selectPartynetDuration
} from '../store/slices/fitnessPlayerSlice';

interface PartynetPlayerMiniProps {
  onPress?: () => void; // For navigating to full player
}

export default function PartynetPlayerMini({
  onPress,
}: PartynetPlayerMiniProps) {
  const theme = useBuddyTheme();
  const dispatch = useAppDispatch();

  // Animation refs
  const slideDownAnim = useRef(new Animated.Value(-120)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const playButtonScale = useRef(new Animated.Value(1)).current;
  const albumArtOpacity = useRef(new Animated.Value(0)).current;

  // Redux selectors
  const miniPlayerVisible = useSelector(selectMiniPlayerVisible);
  const currentTrack = useSelector(selectPartynetCurrentTrack);
  const isPlaying = useSelector(selectPartynetIsPlaying);
  const position = useSelector(selectPartynetPosition);
  const duration = useSelector(selectPartynetDuration);

  const progress = duration > 0 ? position / duration : 0;

  // Default values when no track is playing
  const trackName = currentTrack?.title || "No track playing";
  const artistName = currentTrack?.artist || "Partynet Fitness";
  const insets = useSafeAreaInsets();

  // Cycle through placeholder images based on track index
  const partynetImages = [
    require('../assets/images/9_16.png'),
    require('../assets/images/9_16_2.png'),
    require('../assets/images/9_16_3.png'),
  ];
  const currentTrackIndex = useSelector((state: RootState) => state.fitnessPlayer.currentTrackIndex);
  const albumArtSource = partynetImages[Math.abs(currentTrackIndex % partynetImages.length)];

  // Main visibility animation - fly down from top when visible
  useEffect(() => {
    if (miniPlayerVisible) {
      // Show: slide down from top with subtle Apple-like bounce and fade in
      Animated.parallel([
        Animated.spring(slideDownAnim, {
          toValue: insets.top + 8,
          tension: 180,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide: slide up and fade out
      Animated.parallel([
        Animated.timing(slideDownAnim, {
          toValue: -120,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [miniPlayerVisible]);

  // Album art fade in when track changes
  useEffect(() => {
    if (currentTrack) {
      albumArtOpacity.setValue(0);
      Animated.timing(albumArtOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [currentTrack?.url]);

  // Play button scale animation
  const animatePlayButton = (isPressed: boolean) => {
    Animated.timing(playButtonScale, {
      toValue: isPressed ? 0.95 : 1,
      duration: isPressed ? 50 : 100,
      useNativeDriver: true,
    }).start();
  };

  // Control handlers
  const handlePlayPause = async () => {
    animatePlayButton(true);
    setTimeout(() => animatePlayButton(false), 100);

    try {
      if (isPlaying) {
        dispatch(pauseMusic());
      } else {
        dispatch(resumeMusic());
      }
    } catch (error) {
      console.error('Play/pause error:', error);
    }
  };

  const handlePrevious = async () => {
    try {
      dispatch(skipPrevious());
    } catch (error) {
      console.error('Previous track error:', error);
    }
  };

  const handleNext = async () => {
    try {
      dispatch(skipNext());
    } catch (error) {
      console.error('Next track error:', error);
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideDownAnim }],
        },
      ]}
      pointerEvents={miniPlayerVisible ? 'auto' : 'none'}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={{ flex: 1 }}
      >
        <BlurView
          intensity={100}
          tint="light"
          style={styles.playerContainer}
        >
        {/* Main Content Row */}
        <View style={styles.contentRow}>
          {/* Album Art and Track Info */}
          <View style={styles.trackInfoContainer}>
            {/* Album Art - placeholder for Partynet */}
            <View style={styles.albumArtContainer}>
              <Animated.View style={{ opacity: albumArtOpacity }}>
                <Image
                  source={albumArtSource}
                  style={styles.albumArt}
                  contentFit="cover"
                />
              </Animated.View>
            </View>

            {/* Track Info */}
            <View style={styles.textContainer}>
              <Text style={styles.trackName} numberOfLines={1}>
                {trackName}
              </Text>
              <Text style={styles.artistName} numberOfLines={1}>
                {artistName}
              </Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controlsContainer}>
            {/* Previous */}
            <TouchableOpacity
              style={styles.controlButtonSmall}
              onPress={handlePrevious}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Image
                source={require('../assets/icons/skip_back.svg')}
                style={styles.controlIconSmall}
                contentFit="contain"
              />
            </TouchableOpacity>

            {/* Play/Pause */}
            <Animated.View style={{ transform: [{ scale: playButtonScale }] }}>
              <TouchableOpacity
                style={styles.controlButtonMedium}
                onPress={handlePlayPause}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {isPlaying ? (
                  <Image
                    source={require('../assets/icons/pause.svg')}
                    style={styles.controlIconMedium}
                    contentFit="contain"
                  />
                ) : (
                  <Image
                    source={require('../assets/icons/play.svg')}
                    style={styles.controlIconMedium}
                    contentFit="contain"
                  />
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Next */}
            <TouchableOpacity
              style={styles.controlButtonSmall}
              onPress={handleNext}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Image
                source={require('../assets/icons/skip_forward.svg')}
                style={styles.controlIconSmall}
                contentFit="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressBar,
                { width: `${progress * 100}%` }
              ]}
            />
          </View>
        </View>

        {/* Inner Shadow */}
        <View style={styles.innerShadow} />
      </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  playerContainer: {
    borderRadius: 24,
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: 'rgba(185, 230, 255, 0.4)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 50,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 4,
  },
  trackInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  albumArtContainer: {
    paddingLeft: 6,
  },
  albumArt: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  trackName: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    lineHeight: 16,
    color: '#2f3133',
    includeFontPadding: false,
  },
  artistName: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    lineHeight: 16,
    color: '#2f3133',
    includeFontPadding: false,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  controlButtonSmall: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  controlButtonMedium: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  controlIconSmall: {
    width: 16,
    height: 16,
    tintColor: '#53575a',
  },
  controlIconMedium: {
    width: 24,
    height: 24,
    tintColor: '#53575a',
  },
  progressContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
  },
  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(228, 238, 87, 0.2)',
    borderRadius: 24,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#e4ee57',
    borderRadius: 24,
  },
  innerShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    shadowColor: 'rgba(208, 221, 23, 0.16)',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
    pointerEvents: 'none',
  },
});
