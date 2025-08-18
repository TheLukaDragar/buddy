import { useBuddyTheme } from '@/constants/BuddyTheme';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, IconButton, Text } from 'react-native-paper';
import { nucleus } from '../Buddy_variables.js';
import { useSpotifyAuth } from '../hooks/useSpotifyAuth';
import {
    useCheckPremiumStatusQuery,
    useGetAvailableDevicesQuery,
    useGetCurrentPlaybackStateQuery,
    useGetWorkoutPlaylistsQuery,
    useNextTrackMutation,
    usePauseMusicMutation,
    usePlayMusicMutation,
    usePlayPlaylistMutation,
    usePreviousTrackMutation,
    useSetVolumeMutation,
    type SpotifyTrack,
} from '../store/api/spotifyApi';
import SpotifyConnectModal from './SpotifyConnectModal';

export default function SpotifyPlayer() {
  const theme = useBuddyTheme();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  
  // Use Spotify auth context and sync with Redux
  const { isAuthenticated: spotifyConnected, login, logout, loading: authLoading, error: authError } = useSpotifyAuth();
  
  // No auth sync needed - using direct Redux integration

  // RTK Query hooks
  const { 
    data: playbackState, 
    isLoading: playbackLoading, 
    refetch: refetchPlayback 
  } = useGetCurrentPlaybackStateQuery(undefined, {
    skip: !spotifyConnected,
    pollingInterval: 5000, // Poll every 5 seconds for live updates
  });

  const { 
    data: devicesData, 
    isLoading: devicesLoading 
  } = useGetAvailableDevicesQuery(undefined, {
    skip: !spotifyConnected,
  });

  const { 
    data: isPremium, 
    isLoading: premiumLoading 
  } = useCheckPremiumStatusQuery(undefined, {
    skip: !spotifyConnected,
  });

  const { 
    data: workoutPlaylists, 
    isLoading: playlistsLoading 
  } = useGetWorkoutPlaylistsQuery(undefined, {
    skip: !spotifyConnected,
  });

  // RTK Query mutations
  const [playMusic] = usePlayMusicMutation();
  const [pauseMusic] = usePauseMusicMutation();
  const [nextTrack] = useNextTrackMutation();
  const [previousTrack] = usePreviousTrackMutation();
  const [setVolume] = useSetVolumeMutation();
  const [playPlaylist] = usePlayPlaylistMutation();

  // Helper function to handle errors
  const handleError = (error: any) => {
    // Don't show error for successful operations (204 No Content)
    if (error?.status === 204 || error?.status === 'FETCH_ERROR') {
      return; // These are actually successful operations
    }
    
    console.log('Spotify Error Details:', error);
    const message = error?.data?.enhancedMessage || error?.message || 'An error occurred';
    
    // Only show alert for actual errors
    if (message !== 'An error occurred' || error?.status >= 400) {
      Alert.alert('Spotify Error', message);
    }
  };

  // Playback control handlers
  const handlePlay = async () => {
    try {
      await playMusic({}).unwrap();
      refetchPlayback();
    } catch (error) {
      handleError(error);
    }
  };

  const handlePause = async () => {
    try {
      await pauseMusic({}).unwrap();
      refetchPlayback();
    } catch (error) {
      handleError(error);
    }
  };

  const handleNext = async () => {
    try {
      await nextTrack({}).unwrap();
      // Wait a bit before refetching to allow Spotify's state to update
      setTimeout(() => refetchPlayback(), 500);
    } catch (error) {
      handleError(error);
    }
  };

  const handlePrevious = async () => {
    try {
      await previousTrack({}).unwrap();
      // Wait a bit before refetching to allow Spotify's state to update
      setTimeout(() => refetchPlayback(), 500);
    } catch (error) {
      handleError(error);
    }
  };

  const handlePlayPlaylist = async (playlistId: string) => {
    try {
      await playPlaylist({ playlistId }).unwrap();
      setSelectedPlaylistId(playlistId);
      refetchPlayback();
    } catch (error) {
      handleError(error);
    }
  };

  const handleVolumeChange = async (volume: number) => {
    try {
      await setVolume({ volumePercent: volume }).unwrap();
    } catch (error) {
      handleError(error);
    }
  };

  if (!spotifyConnected) {
    return (
      <Card style={[styles.card, { backgroundColor: nucleus.light.global.blue["10"] }]}>
        <Card.Content style={styles.cardContent}>
          <Text 
            variant="titleMedium" 
            style={[styles.title, { color: nucleus.light.global.blue["90"] }]}
          >
            Connect Spotify
          </Text>
          <Text 
            variant="bodyMedium" 
            style={[styles.subtitle, { color: nucleus.light.global.blue["70"] }]}
          >
            Connect your Spotify account to control music during workouts
          </Text>
          <Button
            mode="contained"
            style={[styles.connectButton, { backgroundColor: '#1DB954' }]} // Spotify green
            labelStyle={styles.buttonLabel}
            contentStyle={styles.buttonContent}
            compact={false}
            onPress={() => setShowConnectModal(true)}
          >
            Connect Spotify
          </Button>
        </Card.Content>
      </Card>
    );
  }

  if (authLoading || playbackLoading || devicesLoading || premiumLoading) {
    return (
      <Card style={[styles.card, { backgroundColor: nucleus.light.global.blue["10"] }]}>
        <Card.Content style={styles.cardContent}>
          <ActivityIndicator size="large" color={nucleus.light.global.blue["70"]} />
          <Text 
            variant="bodyMedium" 
            style={[styles.loadingText, { color: nucleus.light.global.blue["70"] }]}
          >
            Loading Spotify...
          </Text>
        </Card.Content>
      </Card>
    );
  }

  const currentTrack = playbackState?.item as SpotifyTrack;
  const isPlaying = playbackState?.is_playing || false;
  
  // Improved device detection: if we have playback state, we have an active device
  const hasActiveDevice = devicesData?.hasActiveDevice || 
                         (playbackState && playbackState.device) || 
                         (playbackState && isPlaying);

  // Show auth error if present
  if (authError) {
    return (
      <Card style={[styles.card, { backgroundColor: nucleus.light.global.blue["10"] }]}>
        <Card.Content style={styles.cardContent}>
          <Text 
            variant="titleMedium" 
            style={[styles.title, { color: '#FF6B35' }]}
          >
            Spotify Connection Error
          </Text>
          <Text 
            variant="bodyMedium" 
            style={[styles.subtitle, { color: nucleus.light.global.blue["70"] }]}
          >
            {authError}
          </Text>
          <Button
            mode="contained"
            style={[styles.connectButton, { backgroundColor: '#1DB954' }]}
            labelStyle={styles.buttonLabel}
            contentStyle={styles.buttonContent}
            compact={false}
            onPress={() => setShowConnectModal(true)}
          >
            Try Again
          </Button>
        </Card.Content>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      {/* Spotify Connection Status */}
      <Card style={[styles.headerCard, { backgroundColor: nucleus.light.global.blue["10"] }]}>
        <Card.Content style={styles.headerContent}>
          <View style={styles.headerInfo}>
            <Text 
              variant="titleMedium" 
              style={[styles.headerTitle, { color: nucleus.light.global.blue["90"] }]}
            >
              Spotify Connected
            </Text>
            <Text 
              variant="bodySmall" 
              style={[styles.headerSubtitle, { color: nucleus.light.global.blue["70"] }]}
            >
              Music controls are available
            </Text>
          </View>
          <Button
            mode="outlined"
            style={[styles.disconnectButton, { borderColor: '#FF6B35' }]}
            labelStyle={[styles.disconnectButtonLabel, { color: '#FF6B35' }]}
            contentStyle={styles.disconnectButtonContent}
            compact={false}
            onPress={logout}
          >
            Disconnect
          </Button>
        </Card.Content>
      </Card>

      {/* Current Track Display */}
      {currentTrack && (
        <Card style={[styles.trackCard, { backgroundColor: nucleus.light.global.blue["10"] }]}>
          <Card.Content style={styles.trackContent}>
            <View style={styles.trackInfo}>
              {currentTrack.album.images[0] && (
                <Image
                  source={{ uri: currentTrack.album.images[0].url }}
                  style={styles.albumArt}
                  contentFit="cover"
                />
              )}
              <View style={styles.trackDetails}>
                <Text 
                  variant="titleMedium" 
                  style={[styles.trackTitle, { color: nucleus.light.global.blue["90"] }]}
                  numberOfLines={1}
                >
                  {currentTrack.name}
                </Text>
                <Text 
                  variant="bodyMedium" 
                  style={[styles.artistName, { color: nucleus.light.global.blue["70"] }]}
                  numberOfLines={1}
                >
                  {currentTrack.artists.map(artist => artist.name).join(', ')}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Playback Controls */}
      <Card style={[styles.controlsCard, { backgroundColor: nucleus.light.global.blue["10"] }]}>
        <Card.Content style={styles.controlsContent}>
          {!hasActiveDevice && (
            <Text 
              variant="bodySmall" 
              style={[styles.warningText, { color: '#FF6B35' }]} // Warning orange
            >
              No active Spotify device. Open Spotify on any device to control playback.
            </Text>
          )}
          
          {!isPremium && (
            <Text 
              variant="bodySmall" 
              style={[styles.warningText, { color: '#FF6B35' }]} // Warning orange
            >
              Spotify Premium required for playback controls.
            </Text>
          )}

          <View style={styles.controlButtons}>
            <IconButton
              icon="skip-previous"
              size={32}
              iconColor={nucleus.light.global.blue["70"]}
              onPress={handlePrevious}
              disabled={!hasActiveDevice || !isPremium}
            />
            
            <IconButton
              icon={isPlaying ? "pause" : "play"}
              size={40}
              iconColor={nucleus.light.global.blue["80"]}
              onPress={isPlaying ? handlePause : handlePlay}
              disabled={!hasActiveDevice || !isPremium}
              style={[styles.playButton, { backgroundColor: nucleus.light.global.blue["20"] }]}
            />
            
            <IconButton
              icon="skip-next"
              size={32}
              iconColor={nucleus.light.global.blue["70"]}
              onPress={handleNext}
              disabled={!hasActiveDevice || !isPremium}
            />
          </View>

          {/* Volume Control */}
          {hasActiveDevice && isPremium && (
            <View style={styles.volumeContainer}>
              <IconButton
                icon="volume-low"
                size={24}
                iconColor={nucleus.light.global.blue["60"]}
                onPress={() => handleVolumeChange(25)}
              />
              <IconButton
                icon="volume-medium"
                size={24}
                iconColor={nucleus.light.global.blue["60"]}
                onPress={() => handleVolumeChange(50)}
              />
              <IconButton
                icon="volume-high"
                size={24}
                iconColor={nucleus.light.global.blue["60"]}
                onPress={() => handleVolumeChange(75)}
              />
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Workout Playlists */}
      {workoutPlaylists?.playlists?.items && (
        <Card style={[styles.playlistCard, { backgroundColor: nucleus.light.global.blue["10"] }]}>
          <Card.Content style={styles.playlistContent}>
            <Text 
              variant="titleMedium" 
              style={[styles.playlistTitle, { color: nucleus.light.global.blue["90"] }]}
            >
              Workout Playlists
            </Text>
            
            {playlistsLoading ? (
              <ActivityIndicator size="small" color={nucleus.light.global.blue["70"]} />
            ) : (
              <View style={styles.playlistButtons}>
                {workoutPlaylists?.playlists?.items?.slice(0, 3).map((playlist: any) => (
                  playlist && playlist.id && playlist.name ? (
                    <Button
                      key={playlist.id}
                      mode={selectedPlaylistId === playlist.id ? "contained" : "outlined"}
                      style={[
                        styles.playlistButton,
                        selectedPlaylistId === playlist.id 
                          ? { backgroundColor: nucleus.light.global.blue["70"] }
                          : { borderColor: nucleus.light.global.blue["50"] }
                      ]}
                      labelStyle={[
                        styles.playlistButtonLabel,
                        { color: selectedPlaylistId === playlist.id 
                            ? nucleus.light.global.blue["10"] 
                            : nucleus.light.global.blue["70"] 
                        }
                      ]}
                      contentStyle={styles.playlistButtonContent}
                      compact={false}
                      onPress={() => handlePlayPlaylist(playlist.id)}
                      disabled={!hasActiveDevice || !isPremium}
                    >
                      {playlist.name}
                    </Button>
                  ) : null
                )) || []}
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Spotify Connect Modal */}
      <SpotifyConnectModal
        visible={showConnectModal}
        onDismiss={() => setShowConnectModal(false)}
        onNotNow={() => setShowConnectModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  card: {
    borderRadius: 16,
    elevation: 2,
  },
  headerCard: {
    borderRadius: 16,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    includeFontPadding: false,
  },
  disconnectButton: {
    borderRadius: 24,
    minHeight: 36,
  },
  disconnectButtonLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    lineHeight: 18,
    marginVertical: 0,
    includeFontPadding: false,
  },
  disconnectButtonContent: {
    minHeight: 36,
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  cardContent: {
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontFamily: 'PlusJakartaSans-Bold',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  connectButton: {
    borderRadius: 48,
    minHeight: 48,
  },
  buttonLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    lineHeight: 20,
    marginVertical: 0,
    includeFontPadding: false,
  },
  buttonContent: {
    minHeight: 48,
    paddingHorizontal: 24,
    paddingVertical: 0,
  },
  loadingText: {
    fontFamily: 'PlusJakartaSans-Regular',
    marginTop: 8,
  },
  trackCard: {
    borderRadius: 16,
    elevation: 2,
  },
  trackContent: {
    padding: 16,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  albumArt: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  trackDetails: {
    flex: 1,
  },
  trackTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 4,
  },
  artistName: {
    fontFamily: 'PlusJakartaSans-Regular',
  },
  controlsCard: {
    borderRadius: 16,
    elevation: 2,
  },
  controlsContent: {
    padding: 16,
  },
  warningText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
    includeFontPadding: false,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  playButton: {
    margin: 0,
  },
  volumeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  playlistCard: {
    borderRadius: 16,
    elevation: 2,
  },
  playlistContent: {
    padding: 16,
  },
  playlistTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  playlistButtons: {
    gap: 8,
  },
  playlistButton: {
    borderRadius: 24,
    minHeight: 40,
  },
  playlistButtonLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    lineHeight: 18,
    marginVertical: 0,
    includeFontPadding: false,
  },
  playlistButtonContent: {
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
});
