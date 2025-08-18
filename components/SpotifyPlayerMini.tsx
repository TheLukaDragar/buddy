import { useBuddyTheme } from '@/constants/BuddyTheme';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { nucleus } from '../Buddy_variables.js';
import {
    useGetCurrentPlaybackStateQuery,
    useNextTrackMutation,
    usePauseMusicMutation,
    usePlayMusicMutation,
    usePreviousTrackMutation
} from '../store/api/spotifyApi';
import { selectMiniPlayerVisible } from '../store/slices/musicSlice';
import { selectIsAuthenticated, selectSpotifyAuth } from '../store/slices/spotifyAuthSlice';


interface SpotifyPlayerMiniProps {
  onPress?: () => void; // Only keep onPress for navigating to full player
}

export default function SpotifyPlayerMini({
  onPress,
}: SpotifyPlayerMiniProps) {
  const theme = useBuddyTheme();
  
  // Animation refs
  const slideDownAnim = useRef(new Animated.Value(-120)).current; // Start further above screen
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const playButtonScale = useRef(new Animated.Value(1)).current;
  const albumArtOpacity = useRef(new Animated.Value(0)).current;
  
  // Redux selectors
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const spotifyAuth = useSelector(selectSpotifyAuth);
  const miniPlayerVisible = useSelector(selectMiniPlayerVisible);
  
  // RTK Query hooks
  const { data: playbackState, isLoading: isLoadingPlayback, refetch: refetchPlayback } = useGetCurrentPlaybackStateQuery(undefined, {
    pollingInterval: 1000, // Poll every 1 second for faster updates after controls
    skip: !isAuthenticated, // Skip if not authenticated
  });
  
  // Mutation hooks for playback control
  const [playMusic, { isLoading: isPlayLoading }] = usePlayMusicMutation();
  const [pauseMusic, { isLoading: isPauseLoading }] = usePauseMusicMutation();
  const [nextTrack, { isLoading: isNextLoading }] = useNextTrackMutation();
  const [previousTrack, { isLoading: isPrevLoading }] = usePreviousTrackMutation();
  
  // Extract current track data
  const currentTrack = playbackState?.item;
  const isPlaying = playbackState?.is_playing || false;
  const progress = playbackState?.progress_ms && currentTrack?.duration_ms 
    ? playbackState.progress_ms / currentTrack.duration_ms 
    : 0;
  
  // Default values when no track is playing
  const trackName = currentTrack?.name || "No track playing";
  const artistName = currentTrack?.artists?.[0]?.name || "Connect Spotify";
  const albumArt = currentTrack?.album?.images?.[0]?.url;
  const insets = useSafeAreaInsets();

  
  // Main visibility animation - fly down from top when visible
  useEffect(() => {
    if (isAuthenticated && miniPlayerVisible) {
      // Show: slide down from top with subtle Apple-like bounce and fade in
      Animated.parallel([
        Animated.spring(slideDownAnim, {
          toValue: insets.top+ 8, // Add some padding from the top (16px)
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
          toValue: -120, // Slide further up to ensure it's completely hidden
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
  }, [isAuthenticated, miniPlayerVisible]);

  // Album art fade in when track changes
  useEffect(() => {
    if (currentTrack && albumArt) {
      albumArtOpacity.setValue(0);
      Animated.timing(albumArtOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [currentTrack?.id, albumArt]);

  // Play button scale animation - lighter for better performance
  const animatePlayButton = (isPressed: boolean) => {
    Animated.timing(playButtonScale, {
      toValue: isPressed ? 0.95 : 1,
      duration: isPressed ? 50 : 100,
      useNativeDriver: true,
    }).start();
  };

  // Control handlers
  const handlePlayPause = async () => {
    // Quick visual feedback without waiting for API
    animatePlayButton(true);
    setTimeout(() => animatePlayButton(false), 100);
    
    try {
      // Fire and forget - don't wait for the response
      if (isPlaying) {
        pauseMusic({});
      } else {
        playMusic({});
      }
      // Let the polling handle the state update
    } catch (error) {
      console.error('Play/pause error:', error);
    }
  };
  
  const handlePrevious = async () => {
    try {
      // Fire and forget for better responsiveness
      previousTrack({});
    } catch (error) {
      console.error('Previous track error:', error);
    }
  };
  
  const handleNext = async () => {
    try {
      // Fire and forget for better responsiveness
      nextTrack({});
    } catch (error) {
      console.error('Next track error:', error);
    }
  };
  
  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Always render when authenticated, but let animation handle visibility

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideDownAnim }],
        },
      ]}
      pointerEvents={miniPlayerVisible ? 'auto' : 'none'} // Disable touch when hidden
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
            {/* Album Art - size-8 = 32px */}
            <View style={styles.albumArtContainer}>
              {albumArt ? (
                <Animated.View style={{ opacity: albumArtOpacity }}>
                  <Image
                    source={{ uri: albumArt }}
                    style={styles.albumArt}
                    contentFit="cover"
                  />
                </Animated.View>
              ) : (
                <View style={[styles.albumArt, styles.placeholderArt]}>
                  <Image
                    source={require('../assets/icons/spotify.svg')}
                    style={styles.spotifyIcon}
                    contentFit="contain"
                  />
                </View>
              )}
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

          {/* Controls - gap-[7px] */}
          <View style={styles.controlsContainer}>
            {/* Previous - size-4 = 16px */}
            <TouchableOpacity 
              style={styles.controlButtonSmall}
              onPress={handlePrevious}
              disabled={isPrevLoading || isLoadingPlayback}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Image
                source={require('../assets/icons/skip_back.svg')}
                style={[
                  styles.controlIconSmall,
                  (isPrevLoading || isLoadingPlayback) && styles.disabledIcon
                ]}
                contentFit="contain"
              />
            </TouchableOpacity>

            {/* Play/Pause - size-6 = 24px */}
            <Animated.View style={{ transform: [{ scale: playButtonScale }] }}>
              <TouchableOpacity 
                style={styles.controlButtonMedium}
                onPress={handlePlayPause}
                disabled={isPlayLoading || isPauseLoading || isLoadingPlayback}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {isPlaying ? (
                  <Image
                    source={require('../assets/icons/pause.svg')}
                    style={[
                      styles.controlIconMedium,
                      (isPlayLoading || isPauseLoading || isLoadingPlayback) && styles.disabledIcon
                    ]}
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

            {/* Next - size-4 = 16px */}
            <TouchableOpacity 
              style={styles.controlButtonSmall}
              onPress={handleNext}
              disabled={isNextLoading || isLoadingPlayback}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Image
                source={require('../assets/icons/skip_forward.svg')}
                style={[
                  styles.controlIconSmall,
                  (isNextLoading || isLoadingPlayback) && styles.disabledIcon
                ]}
                contentFit="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Bar - Absolute positioned like Figma */}
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
  // Main container - rounded-2xl = 24px, backdrop-blur, bg-[rgba(255,255,255,0.5)]
  playerContainer: {
    borderRadius: 24, // rounded-2xl
    padding: 6, // p-[6px]
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // bg-[rgba(255,255,255,0.5)]
    shadowColor: 'rgba(185, 230, 255, 0.4)', // shadow-[0px_0px_20px_0px_rgba(185,230,255,0.4)]
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 50, // Set a minimum height
  },
  // flex flex-col gap-2 - 8px gap between rows
  contentRow: {
    flexDirection: 'row', // flex flex-row
    alignItems: 'center', // items-center
    justifyContent: 'space-between', // justify-between
    width: '100%', // w-full
    paddingVertical: 4, // Small padding for proper spacing
  },
  // gap-2 items-center
  trackInfoContainer: {
    flexDirection: 'row', // flex flex-row
    alignItems: 'center', // items-center
    flex: 1,
    gap: 8, // gap-2
  },
  albumArtContainer: {
    // No additional styles needed
    paddingLeft: 6,
  },
  // size-8 = 32px, rounded-lg = 8px
  albumArt: {
    width: 32, // size-8
    height: 32, // size-8
    borderRadius: 8, // rounded-lg
  },
  placeholderArt: {
    backgroundColor: nucleus.light.global.grey[20],
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotifyIcon: {
    width: 16,
    height: 16,
    tintColor: nucleus.light.global.grey[60],
  },
  // text-[#2f3133] text-[12px] leading-[0]
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  // font-['Plus_Jakarta_Sans:Bold'] font-bold text-[12px]
  trackName: {
    fontFamily: 'PlusJakartaSans-Bold', // font-['Plus_Jakarta_Sans:Bold'] font-bold
    fontSize: 12, // text-[12px]
    lineHeight: 16, // Increased for descenders
    color: '#2f3133', // text-[#2f3133] - global/grey/80
    includeFontPadding: false,
  },
  // font-['Plus_Jakarta_Sans:Regular'] font-normal text-[12px]
  artistName: {
    fontFamily: 'PlusJakartaSans-Regular', // font-['Plus_Jakarta_Sans:Regular'] font-normal
    fontSize: 12, // text-[12px]
    lineHeight: 16, // Increased for descenders
    color: '#2f3133', // text-[#2f3133] - global/grey/80
    includeFontPadding: false,
  },
  // gap-[7px] items-center
  controlsContainer: {
    flexDirection: 'row', // flex flex-row
    alignItems: 'center', // items-center
    gap: 7, // gap-[7px]
  },
  // size-4 = 16px
  controlButtonSmall: {
    width: 16, // size-4
    height: 16, // size-4
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  // size-6 = 24px
  controlButtonMedium: {
    width: 24, // size-6
    height: 24, // size-6
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  controlIconSmall: {
    width: 16,
    height: 16,
    tintColor: '#53575a', // global/grey/70
  },
  controlIconMedium: {
    width: 24,
    height: 24,
    tintColor: '#53575a', // global/grey/70
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 0,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderLeftColor: '#53575a', // global/grey/70
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 2,
  },
  disabledIcon: {
    opacity: 0.5,
  },
  disabledTriangle: {
    borderLeftColor: 'rgba(83, 87, 90, 0.5)', // Faded grey
  },
  // Progress bar positioned at bottom of container
  progressContainer: {
    position: 'absolute',
    left: 0, // No margin - right at the edge
    right: 0, // No margin - right at the edge
    bottom: 0, // No space - right at the very bottom edge
    height: 2,
  },
  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(228, 238, 87, 0.2)', // Semi-transparent brand color
    borderRadius: 24, // rounded-2xl
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#e4ee57', // bg-[#e4ee57] - global/brand/50
    borderRadius: 24, // rounded-2xl
  },
  // Inner shadow - shadow-[0px_-1px_4px_0px_inset_rgba(208,221,23,0.16)]
  innerShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    // Note: React Native doesn't support inset shadows, this is a placeholder
    // You might need to use a library like react-native-drop-shadow for this
    shadowColor: 'rgba(208, 221, 23, 0.16)',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
    pointerEvents: 'none',
  },
});
