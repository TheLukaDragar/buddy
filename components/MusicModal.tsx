import { Image } from "expo-image";
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { nucleus } from '../Buddy_variables';
import { useSpotifyAuth } from '../hooks/useSpotifyAuth';
import { useGetUserPlaylistsQuery, useGetAvailableDevicesQuery, useTransferPlaybackMutation } from '../store/api/spotifyApi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { syncPlaylistToSpotify } from '../store/actions/musicActions';
import { SelectedPlaylist, setMusicOption, setSelectedAppMusic, setSelectedPlaylist } from '../store/slices/musicSlice';
import SpotifyConnectModal from './SpotifyConnectModal';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface MusicModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function MusicModal({ visible, onClose }: MusicModalProps) {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const [showSpotifyConnect, setShowSpotifyConnect] = useState(false);
  const [previousPlaylistId, setPreviousPlaylistId] = useState<string | null>(null);
  
  // Redux state
  const { selectedMusicOption, selectedPlaylist, selectedAppMusic } = useAppSelector(state => state.music);
  
  // Spotify auth
  const { isAuthenticated, loading: spotifyLoading } = useSpotifyAuth();

  // Fetch user's Spotify playlists when authenticated (20 playlists)
  const { data: playlistsData, isLoading: playlistsLoading } = useGetUserPlaylistsQuery({ limit: 20 }, {
    skip: !isAuthenticated || selectedMusicOption !== 'spotify' || spotifyLoading,
  });

  // Fetch available Spotify devices - only poll when modal is visible
  const { data: devicesData } = useGetAvailableDevicesQuery(undefined, {
    skip: !isAuthenticated || selectedMusicOption !== 'spotify',
    pollingInterval: visible ? 8000 : 0, // Only poll when modal is visible
  });

  // Transfer playback mutation
  const [transferPlayback, { isLoading: isTransferring }] = useTransferPlaybackMutation();

  // Debug device data changes
  useEffect(() => {
    if (devicesData?.devices) {
      console.log('🎵 [DEBUG] Devices updated:', devicesData.devices.map(d => ({
        name: d.name,
        id: d.id,
        is_active: d.is_active
      })));
    }
  }, [devicesData]);

  // Log playlist data when it loads
  useEffect(() => {
    if (playlistsData) {
      console.log(`📀 Loaded ${playlistsData.items?.length || 0} playlists (${playlistsData.total} total)`);
    }
  }, [playlistsData]);

  // Log music state changes
  useEffect(() => {
    console.log('🎵 Music State Changed:', {
      option: selectedMusicOption,
      playlist: selectedPlaylist ? `${selectedPlaylist.name} (${selectedPlaylist.tracks?.total} tracks)` : null,
      appMusic: selectedAppMusic
    });
  }, [selectedMusicOption, selectedPlaylist, selectedAppMusic]);

  // Auto-select Spotify when user connects successfully
  useEffect(() => {
    if (isAuthenticated && showSpotifyConnect) {
      setShowSpotifyConnect(false);
      dispatch(setMusicOption('spotify'));
    }
  }, [isAuthenticated, showSpotifyConnect, dispatch]);

  // Auto-select first playlist when playlists load and none is selected
  useEffect(() => {
    if (playlistsData?.items && 
        playlistsData.items.length > 0 && 
        selectedMusicOption === 'spotify' && 
        !selectedPlaylist) {
      const firstPlaylist = playlistsData.items[0];
      console.log('🎵 Auto-selecting first playlist:', firstPlaylist.name);
      dispatch(setSelectedPlaylist({
        id: firstPlaylist.id,
        name: firstPlaylist.name,
        description: firstPlaylist.description,
        images: firstPlaylist.images,
        tracks: firstPlaylist.tracks,
        uri: firstPlaylist.uri
      } as SelectedPlaylist));
    }
  }, [playlistsData, selectedMusicOption, selectedPlaylist, dispatch, spotifyLoading]);

  // Sync NEWLY selected Spotify playlist (only when it actually changes)
  useEffect(() => {
    if (isAuthenticated && 
        selectedPlaylist && 
        selectedMusicOption === 'spotify' && 
        selectedPlaylist.id !== previousPlaylistId &&
        previousPlaylistId !== null) { // Only sync if there was a previous playlist (indicating a switch)
      
      console.log('🎵 [MusicModal] Syncing NEWLY selected playlist to Spotify:', selectedPlaylist.name);
      dispatch(syncPlaylistToSpotify()).then((result: any) => {
        if (result.payload?.synced) {
          console.log(`🎵 [MusicModal] Playlist "${result.payload.playlist}" synced to Spotify`);
        }
      }).catch((error: any) => {
        console.log('🎵 [MusicModal] Failed to sync playlist:', error);
      });
    }
    
    // Update the previous playlist ID for next comparison
    if (selectedPlaylist) {
      setPreviousPlaylistId(selectedPlaylist.id);
    }
  }, [selectedPlaylist, isAuthenticated, selectedMusicOption, dispatch, previousPlaylistId]);

  // Render music cards based on selected option
  const renderMusicCards = () => {
    if (selectedMusicOption === 'spotify' && isAuthenticated) {
      // Show Spotify playlists
      if (playlistsLoading || spotifyLoading) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={nucleus.light.global.blue["70"]} />
            <Text style={styles.loadingText}>Loading your playlists...</Text>
          </View>
        );
      }

      if (playlistsData?.items && playlistsData.items.length > 0) {
        return playlistsData.items.map((playlist: any, index: number) => (
          <Pressable 
            key={playlist.id || index}
            style={styles.musicCard}
            onPress={() => dispatch(setSelectedPlaylist({
              id: playlist.id,
              name: playlist.name,
              description: playlist.description,
              images: playlist.images,
              tracks: playlist.tracks,
              uri: playlist.uri
            } as SelectedPlaylist))}
          >
            <Image
              source={{ uri: playlist.images?.[0]?.url || 'https://via.placeholder.com/300x300/1DB954/FFFFFF?text=♪' }}
              style={styles.musicCardBackground}
              contentFit="cover"
            />
            <View style={styles.musicCardTopRight}>
              <View style={[
                styles.musicBadgeGreen,
                { opacity: selectedPlaylist?.id === playlist.id ? 1 : 0 }
              ]}>
                <Image
                  source={require('../assets/icons/check.svg')}
                  style={styles.checkIcon}
                  contentFit="contain"
                />
              </View>
            </View>
            <View style={styles.musicCardBottom}>
              <Text style={styles.musicCardTitle} numberOfLines={1}>
                {playlist.name}
              </Text>
              <Text style={styles.musicCardSubtitle}>
                {playlist.tracks?.total || 0} tracks
              </Text>
            </View>
          </Pressable>
        ));
      }

      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No playlists found</Text>
        </View>
      );
    }

    // Show default app music cards
    return (
      <>
        <Pressable 
          style={styles.musicCard}
          onPress={() => dispatch(setSelectedAppMusic('beast-mode'))}
        >
          <Image
            source={require('../assets/images/9_16.png')}
            style={styles.musicCardBackground}
            contentFit="cover"
          />
          <View style={styles.musicCardTopRight}>
            <View style={[
              styles.musicBadgeGreen,
              { opacity: selectedAppMusic === 'beast-mode' ? 1 : 0 }
            ]}>
              <Image
                source={require('../assets/icons/check.svg')}
                style={styles.checkIcon}
                contentFit="contain"
              />
            </View>
          </View>
          <View style={styles.musicCardBottom}>
            <Text style={styles.musicCardTitle}>Beast Mode</Text>
          </View>
        </Pressable>

        <Pressable 
          style={styles.musicCard}
          onPress={() => dispatch(setSelectedAppMusic('sweet-session'))}
        >
          <Image
            source={require('../assets/images/9_16_2.png')}
            style={styles.musicCardBackground}
            contentFit="cover"
          />
          <View style={styles.musicCardTopRight}>
            <View style={[
              styles.musicBadgeGreen,
              { opacity: selectedAppMusic === 'sweet-session' ? 1 : 0 }
            ]}>
              <Image
                source={require('../assets/icons/check.svg')}
                style={styles.checkIcon}
                contentFit="contain"
              />
            </View>
          </View>
          <View style={styles.musicCardBottom}>
            <Text style={styles.musicCardTitle}>Sweet Session</Text>
          </View>
        </Pressable>

        <Pressable 
          style={styles.musicCard}
          onPress={() => dispatch(setSelectedAppMusic('feel'))}
        >
          <Image
            source={require('../assets/images/9_16_3.png')}
            style={styles.musicCardBackground}
            contentFit="cover"
          />
          <View style={styles.musicCardTopRight}>
            <View style={[
              styles.musicBadgeGreen,
              { opacity: selectedAppMusic === 'feel' ? 1 : 0 }
            ]}>
              <Image
                source={require('../assets/icons/check.svg')}
                style={styles.checkIcon}
                contentFit="contain"
              />
            </View>
          </View>
          <View style={styles.musicCardBottom}>
            <Text style={styles.musicCardTitle}>Feel</Text>
          </View>
        </Pressable>
      </>
    );
  };

  // Handle Spotify selection
  const handleSpotifySelect = () => {
    if (isAuthenticated) {
      // User is already connected, just select Spotify option
      dispatch(setMusicOption('spotify'));
    } else {
      // User needs to connect to Spotify first
      setShowSpotifyConnect(true);
    }
  };

  // Music modal animation values
  const SHEET_HEIGHT = SCREEN_HEIGHT;
  const musicModalTranslateY = useSharedValue(SHEET_HEIGHT);

  useEffect(() => {
    if (visible) {
      musicModalTranslateY.value = withSpring(0, { damping: 25, stiffness: 150, mass: 0.8 });
    } else {
      musicModalTranslateY.value = withSpring(SHEET_HEIGHT, { damping: 20, stiffness: 200 });
    }
  }, [visible, SHEET_HEIGHT]);

  const musicGestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: { startY: number }) => {
      context.startY = musicModalTranslateY.value;
    },
    onActive: (event, context: { startY: number }) => {
      const newTranslateY = context.startY + event.translationY;
      musicModalTranslateY.value = Math.max(0, newTranslateY);
    },
    onEnd: (event) => {
      const shouldDismiss = event.translationY > SHEET_HEIGHT * 0.3 || event.velocityY > 800;
      if (shouldDismiss) {
        musicModalTranslateY.value = withTiming(SHEET_HEIGHT, {
          duration: 250,
          easing: Easing.in(Easing.quad),
        }, (finished) => {
          if (finished) {
            runOnJS(onClose)();
          }
        });
      } else {
        musicModalTranslateY.value = withTiming(0, {
          duration: 200,
          easing: Easing.out(Easing.quad),
        });
      }
    },
  });

  const animatedMusicSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: musicModalTranslateY.value }],
  }));

  const animatedMusicBackdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(musicModalTranslateY.value, [0, SHEET_HEIGHT], [0.7, 0], Extrapolate.CLAMP),
  }));

  if (!visible) return null;

  return (
    <View style={styles.musicOverlay}>
      <Animated.View style={[styles.musicBackdrop, animatedMusicBackdropStyle]} />

      <PanGestureHandler
        onGestureEvent={musicGestureHandler}
        activeOffsetY={20}
        failOffsetX={[-10, 10]}
      >
        
        <Animated.View style={[styles.musicSheet, animatedMusicSheetStyle, { height: SHEET_HEIGHT }]}>
          <SafeAreaView style={styles.musicSafeContainer} edges={['bottom']}>
            <View style={styles.musicHeader}>
              <View style={styles.musicHandle} />
            </View>

            {/* Top Bar with Close Button */}
            <View style={styles.musicTopBar}>
              <TouchableOpacity 
                style={styles.musicCloseIcon}
                onPress={onClose}
              >
                <Image
                  source={require('../assets/icons/cross.svg')}
                  style={styles.closeIconImage}
                  contentFit="contain"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.musicContentContainer}>
              {/* Title */}
              <Text style={styles.musicMainTitle}>Choose your tempo</Text>
              
              {/* Radio Options */}
              <View style={styles.radioSection}>
                <Pressable 
                  style={styles.radioOption}
                  onPress={() => dispatch(setMusicOption('app'))}
                >
                  <Text style={styles.radioOptionText}>App music</Text>
                  <View style={[
                    styles.radioButton,
                    selectedMusicOption === 'app' && styles.radioButtonSelected
                  ]}>
                    <View style={[
                      styles.radioButtonInner,
                      { opacity: selectedMusicOption === 'app' ? 1 : 0 }
                    ]} />
                  </View>
                </Pressable>

                <Pressable 
                  style={styles.radioOption}
                  onPress={handleSpotifySelect}
                >
                  <Text style={styles.radioOptionText}>
                    Spotify {!isAuthenticated && '(Tap to connect)'}
                  </Text>
                  <View style={[
                    styles.radioButton,
                    selectedMusicOption === 'spotify' && styles.radioButtonSelected
                  ]}>
                    <View style={[
                      styles.radioButtonInner,
                      { opacity: selectedMusicOption === 'spotify' ? 1 : 0 }
                    ]} />
                  </View>
                </Pressable>
              </View>
            </View>

            {/* Music Cards - Outside padded container to take full width */}
            <View style={styles.musicCardsContainer}>
              {/* Subtle Device Selector - Same container as playlist cards */}
              {selectedMusicOption === 'spotify' && isAuthenticated && devicesData?.devices && devicesData.devices.length > 0 && (
                <View style={styles.deviceSectionFullWidth}>
                  <Text style={styles.deviceSectionTitle}>Playing on</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.devicesContainer}
                  >
                    {devicesData.devices.map((device: any) => (
                      <TouchableOpacity
                        key={device.id}
                        style={[
                          styles.deviceCard,
                          { 
                            backgroundColor: device.is_active ? nucleus.light.global.brand["20"] : nucleus.light.global.grey["10"],
                            opacity: isTransferring ? 0.6 : 1
                          }
                        ]}
                        disabled={isTransferring}
                        onPress={async () => {
                          console.log('🎵 [DEBUG] Starting transfer to device:', device.name, device.id);
                          try {
                            const result = await transferPlayback({ deviceId: device.id, play: true });
                            console.log('🎵 [DEBUG] Transfer result:', result);
                          } catch (error) {
                            console.error('🎵 [DEBUG] Transfer failed:', error);
                          }
                        }}
                      >
                        <Text style={[
                          styles.deviceName,
                          { color: device.is_active ? nucleus.light.global.brand["80"] : nucleus.light.global.grey["70"] }
                        ]} numberOfLines={1}>
                          {device.name}
                        </Text>
                        {device.is_active && (
                          <View style={styles.activeIndicator} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.musicCardsContent}
              >
                {renderMusicCards()}
              </ScrollView>
            </View>

            {/* Bottom Button Container */}
            <View style={styles.musicButtonContainer}>
              <Pressable 
                style={({ pressed }) => [
                  styles.musicSelectButton,
                  {
                    backgroundColor: pressed 
                      ? nucleus.light.global.blue[80] 
                      : nucleus.light.global.blue[70],
                    transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
                  }
                ]}
                onPress={onClose}
              >
                <Text style={styles.musicSelectButtonText}>Select</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </Animated.View>
      </PanGestureHandler>
      
      {/* Spotify Connect Modal */}
      <SpotifyConnectModal
        visible={showSpotifyConnect}
        onDismiss={() => setShowSpotifyConnect(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Music Modal Styles
  musicOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3000,
  },
  musicBackdrop: {
    flex: 1,
    backgroundColor: '#000000',
  },
  musicSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: nucleus.light.semantic.bg.canvas,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  musicHeader: {
    height: 24,
    paddingTop: 8,
    paddingBottom: 11,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  musicHandle: {
    width: 48,
    height: 5,
    flexShrink: 0,
    backgroundColor: nucleus.light.semantic.bg.surface,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 8,
  },
  musicTopBar: {
    backgroundColor: nucleus.light.semantic.bg.canvas,
    height: 64,
    paddingHorizontal: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  musicCloseIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIconImage: {
    width: 24,
    height: 24,
  },
  musicContentContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  musicMainTitle: {
    color: nucleus.light.semantic.fg.base,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38.4,
    letterSpacing: 0,
  },
  radioSection: {
    gap: 0,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    paddingVertical: 12,
    gap: 15,
  },
  radioOptionText: {
    flex: 1,
    color: nucleus.light.semantic.fg.base,
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    includeFontPadding: true,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: nucleus.light.semantic.border.muted,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: nucleus.light.semantic.accent.moderate,
    backgroundColor: nucleus.light.semantic.accent.moderate,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: nucleus.light.semantic.fg.staticLight,
  },
  // Device selector styles
  deviceSection: {
    marginTop: 16,
    gap: 8,
  },
  deviceSectionFullWidth: {
    marginBottom: 16,
    gap: 8,
  },
  deviceSectionTitle: {
    color: nucleus.light.global.grey["60"],
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16, // Only title has padding
  },
  devicesContainer: {
    gap: 8,
    paddingHorizontal: 16, // ScrollView content has padding
  },
  deviceCard: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 60,
  },
  deviceName: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    fontWeight: '500',
  },
  activeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: nucleus.light.global.brand["60"],
  },
  musicCardsContainer: {
    width: '100%', // Ensure full width of parent
    marginTop: 16,
  },
  musicCardsContent: {
    paddingHorizontal: 16,
    gap: 12,
    flexGrow: 1, // Allow the content to grow
  },
  musicCard: {
    width: SCREEN_WIDTH * 0.4,
    height: 200,
    borderRadius: 16,
    position: 'relative',
    shadowColor: 'rgba(20, 20, 20, 0.12)',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 1,
    elevation: 8,
  },
  musicCardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    width: '100%',
    height: '100%',
  },
  musicCardTopRight: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  musicBadgeGreen: {
    backgroundColor: nucleus.light.global.brand["30"],
    borderRadius: 32,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  musicBadgeWhite: {
    backgroundColor: nucleus.light.semantic.bg.canvas,
    borderRadius: 32,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    width: 16,
    height: 16,
  },
  newBadgeText: {
    color: nucleus.light.semantic.fg.base,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 12,
  },
  musicCardBottom: {
    position: 'absolute',
    bottom: 16,
    left: 8,
    right: 8,
  },
  musicCardTitle: {
    color: nucleus.light.semantic.fg.staticLight,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 19.2,
  },
  musicButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
    marginTop: 'auto', // Pushes the button to the bottom
  },
  musicSelectButton: {
    height: 48,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  musicSelectButtonText: {
    color: nucleus.light.global.blue[10],
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: 0,
    marginVertical: 0,
    includeFontPadding: false,
  },
  musicSafeContainer: {
    flex: 1,
  },
  // Spotify playlist styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  loadingText: {
    color: nucleus.light.global.blue["70"],
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: nucleus.light.global.blue["60"],
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  musicCardSubtitle: {
    color: nucleus.light.semantic.fg.staticLight,
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    lineHeight: 14.4,
    opacity: 0.8,
    marginTop: 2,
  },
});