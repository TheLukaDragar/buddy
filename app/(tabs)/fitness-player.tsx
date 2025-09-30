import * as React from 'react';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, IconButton, ProgressBar, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { nucleus } from '../../Buddy_variables.js';
import { useBuddyTheme } from '../../constants/BuddyTheme';
import {
  useGetGenresQuery,
  useGetMixMutation,
  useGetStylesQuery,
  useGetTokenMutation
} from '../../store/api/fitnessApi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  nextTrack,
  previousTrack,
  setCurrentTrack,
  setDuration,
  setError,
  setIsLoading,
  setIsPlaying,
  setLastMixRequest,
  setPlaylist,
  setPosition,
  setRepeat,
  setShuffle,
  setToken,
  setVolume
} from '../../store/slices/fitnessPlayerSlice';

// Import expo-audio
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Track } from '../../store/api/fitnessApi';

const FITNESS_BASE_URL = 'https://mod.partynet.serv.si';

export default function FitnessPlayerScreen() {
  const theme = useBuddyTheme();
  const dispatch = useAppDispatch();
  
  // Redux state
  const {
    token,
    tokenExpiresAt,
    playlist,
    currentTrack,
    currentTrackIndex,
    isPlaying,
    isLoading,
    position,
    duration,
    volume,
    shuffle,
    repeat,
    error,
    lastMixRequest,
  } = useAppSelector((state) => state.fitnessPlayer);

  // RTK Query hooks
  const [getToken, { isLoading: isTokenLoading }] = useGetTokenMutation();
  const [getMix, { isLoading: isMixLoading }] = useGetMixMutation();
  const { data: genres = [], isLoading: isGenresLoading } = useGetGenresQuery();
  
  // Local state for mix parameters
  const [selectedGenre, setSelectedGenre] = useState<string>('POP');
  const [selectedStyle, setSelectedStyle] = useState<string>('POP');
  const [selectedEnergyLevel, setSelectedEnergyLevel] = useState<string>('MID');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>('2010-2020');
  const [selectedBPM, setSelectedBPM] = useState<string>('100-150');
  
  // Get styles for selected genre
  const { data: genreStyles = [] } = useGetStylesQuery(selectedGenre, {
    skip: !selectedGenre,
  });

  // Audio player - using modern expo-audio hooks with direct streaming
  const [currentAudioSource, setCurrentAudioSource] = useState<any>(null);
  const player = useAudioPlayer(currentAudioSource);
  console.log('[Fitness Player] Player:', player);
  const playerStatus = useAudioPlayerStatus(player);

  // State to track when we want to play test audio
  const [shouldPlayPublicTest, setShouldPlayPublicTest] = useState(false);
  const [shouldPlayRemoteTest, setShouldPlayRemoteTest] = useState(false);

  // Test player for debugging - using local test server that mimics Partynet
  const testAudioSource = {
    uri: 'http://10.0.2.2:8889/fitness/file/test123',
    headers: {
      'Authorization': 'Bearer dummy-token-123',
    },
  };
  const testPlayer = useAudioPlayer(testAudioSource);
  const testPlayerStatus = useAudioPlayerStatus(testPlayer);

  // Public test player for comparison
  const publicTestSource = 'https://audio-edge-5bkfj.fra.h.radiomast.io/ref-128k-mp3-stereo';
  const publicTestPlayer = useAudioPlayer(publicTestSource);
  const publicTestPlayerStatus = useAudioPlayerStatus(publicTestPlayer);


  // Test function for public audio (no auth needed)
  const testPublicAudio = () => {
    console.log('[Fitness Player] Testing public audio...');
    console.log('[Fitness Player] Public URL:', publicTestSource);
    console.log('[Fitness Player] Public player status:', publicTestPlayerStatus);
    
    setShouldPlayPublicTest(true);
    
    try {
      if (publicTestPlayerStatus.isLoaded) {
        publicTestPlayer.seekTo(0);
        publicTestPlayer.play();
        console.log('[Fitness Player] Public player.seekTo(0) + play() called (was loaded)');
      } else {
        console.log('[Fitness Player] Public player not loaded yet, will auto-play when ready');
      }
    } catch (error) {
      console.error('[Fitness Player] Public player.play() failed:', error);
    }
  };

  // Test function to play local test server audio
  const testRemoteAudio = () => {
    console.log('[Fitness Player] Testing LOCAL TEST SERVER audio...');
    console.log('[Fitness Player] Test URL:', testAudioSource.uri);
    console.log('[Fitness Player] Test headers:', testAudioSource.headers);
    console.log('[Fitness Player] Test player status:', testPlayerStatus);
    
    setShouldPlayRemoteTest(true);
    
    try {
      if (testPlayerStatus.isLoaded) {
        testPlayer.seekTo(0);
        testPlayer.play();
        console.log('[Fitness Player] Test player.seekTo(0) + play() called (was loaded)');
      } else {
        console.log('[Fitness Player] Test player not loaded yet, will auto-play when ready');
      }
    } catch (error) {
      console.error('[Fitness Player] Test player.play() failed:', error);
    }
  };

  // Check if token needs refresh
  const needsTokenRefresh = !token || (tokenExpiresAt && Date.now() > tokenExpiresAt - 300000); // 5 minutes before expiry

  // Fetch token on mount or when needed
  useEffect(() => {
    const fetchToken = async () => {
      if (needsTokenRefresh) {
        try {
          dispatch(setIsLoading(true));
          const response = await getToken().unwrap();
          dispatch(setToken({ 
            token: response.access_token, 
            expiresIn: response.expires_in 
          }));
          dispatch(setError(null));
        } catch (error) {
          console.error('Token fetch failed:', error);
          dispatch(setError('Failed to authenticate with music service'));
        } finally {
          dispatch(setIsLoading(false));
        }
      }
    };
    
    fetchToken();
  }, [needsTokenRefresh, getToken, dispatch]);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (token && tokenExpiresAt) {
      const timeUntilRefresh = tokenExpiresAt - Date.now() - 300000; // 5 minutes before expiry
      if (timeUntilRefresh > 0) {
        const timeout = setTimeout(async () => {
          try {
            const response = await getToken().unwrap();
            dispatch(setToken({ 
              token: response.access_token, 
              expiresIn: response.expires_in 
            }));
          } catch (error) {
            console.error('Token refresh failed:', error);
            dispatch(setError('Failed to refresh authentication'));
          }
        }, timeUntilRefresh);
        
        return () => clearTimeout(timeout);
      }
    }
  }, [token, tokenExpiresAt, getToken, dispatch]);

  // Fetch playlist
  const fetchPlaylist = async () => {
    if (!token) {
      dispatch(setError('Please wait for authentication to complete'));
      return;
    }

    try {
      dispatch(setIsLoading(true));
      const mixRequest = {
        topHits: true,
        explicitSongs: true, // Changed to true based on working curl example
        mixParameters: [
          {
            genre: selectedGenre,
            style: selectedStyle,
            percentage: 100,
            energyLevel: selectedEnergyLevel,
            timePeriod: selectedTimePeriod,
            bpm: selectedBPM,
          },
        ],
      };

      const response = await getMix(mixRequest).unwrap();
      dispatch(setPlaylist(response));
      dispatch(setLastMixRequest(mixRequest));
      dispatch(setError(null));
      
      if (response.length === 0) {
        Alert.alert('No tracks found', 'Try adjusting your mix parameters');
      }
    } catch (error: any) {
      console.error('Playlist fetch failed:', error);
      if (error.status === 500) {
        dispatch(setError('Server error - the music service may be experiencing issues'));
        Alert.alert('Server Error', 'The music service is currently experiencing issues. Please try again later.');
      } else {
        dispatch(setError('Failed to fetch playlist'));
        Alert.alert('Error', 'Failed to fetch playlist. Please try again.');
      }
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  // Play track using direct streaming from Partynet
  const playTrack = async (track: Track, index: number) => {
    if (!track || !token) return;

    try {
      dispatch(setIsLoading(true));
      
      console.log('[Fitness Player] Playing track:', track.title, 'by', track.artist);
      console.log('[Fitness Player] Track URL:', `${FITNESS_BASE_URL}/fitness/file/${track.url}`);
      
      // Create audio source with authentication headers for direct streaming
      const audioSource = {
        uri: `${FITNESS_BASE_URL}/fitness/file/${track.url}`,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      };
      
      console.log('[Fitness Player] Setting audio source for direct streaming');
      setCurrentAudioSource(audioSource);
      dispatch(setCurrentTrack({ track, index }));
      dispatch(setIsPlaying(true)); // Set playing state to trigger auto-play
      dispatch(setError(null));

    } catch (error) {
      console.error('Playback failed:', error);
      dispatch(setError('Failed to play track'));
      Alert.alert('Playback Error', 'Unable to play this track. Please try another.');
    } finally {
      dispatch(setIsLoading(false));
    }
  };


  // Handle track end
  const handleTrackEnd = () => {
    if (repeat === 'one') {
      // Replay current track
      if (currentTrack) {
        playTrack(currentTrack, currentTrackIndex);
      }
    } else if (repeat === 'all' || currentTrackIndex < playlist.length - 1) {
      // Play next track
      dispatch(nextTrack());
    } else {
      // End of playlist
      dispatch(setIsPlaying(false));
    }
  };

  // Play next track when Redux state changes
  useEffect(() => {
    if (currentTrack && currentTrackIndex >= 0 && isPlaying) {
      const track = playlist[currentTrackIndex];
      if (track && track.url !== currentTrack.url) {
        playTrack(track, currentTrackIndex);
      }
    }
  }, [currentTrackIndex]);

  // Sync player status with Redux state
  useEffect(() => {
    if (playerStatus) {
      console.log('[Fitness Player] Player status:', {
        isLoaded: playerStatus.isLoaded,
        isPlaying: playerStatus.playing,
        isBuffering: playerStatus.isBuffering,
        currentTime: playerStatus.currentTime,
        duration: playerStatus.duration
      });
      
      dispatch(setPosition(playerStatus.currentTime * 1000)); // Convert to milliseconds
      dispatch(setDuration(playerStatus.duration * 1000)); // Convert to milliseconds
      
      // Handle track end
      if (playerStatus.didJustFinish) {
        handleTrackEnd();
      }
      
      // Update loading state
      dispatch(setIsLoading(!playerStatus.isLoaded && playerStatus.isBuffering));
      
      // Auto-play when loaded
      if (playerStatus.isLoaded && !playerStatus.playing && isPlaying) {
        console.log('[Fitness Player] Auto-play triggered: isLoaded=true, playing=false, isPlaying=true');
        try {
          player.play();
          console.log('[Fitness Player] player.play() called successfully');
        } catch (error) {
          console.error('[Fitness Player] player.play() failed:', error);
          dispatch(setError('Failed to start playback'));
        }
      } else if (playerStatus.isLoaded && !isPlaying) {
        console.log('[Fitness Player] Audio loaded but not set to play:', {
          isLoaded: playerStatus.isLoaded,
          playing: playerStatus.playing,
          isPlaying: isPlaying
        });
      }
    }
  }, [playerStatus]);

  // Log test player status for debugging
  useEffect(() => {
    if (testPlayerStatus) {
      console.log('[Fitness Player] TEST PLAYER status:', {
        isLoaded: testPlayerStatus.isLoaded,
        isPlaying: testPlayerStatus.playing,
        isBuffering: testPlayerStatus.isBuffering,
        currentTime: testPlayerStatus.currentTime,
        duration: testPlayerStatus.duration,
        didJustFinish: testPlayerStatus.didJustFinish,
        // Additional debugging info
        playbackState: testPlayerStatus.playbackState,
        timeControlStatus: testPlayerStatus.timeControlStatus,
        reasonForWaitingToPlay: testPlayerStatus.reasonForWaitingToPlay
      });
      
      // Log when audio actually loads
      if (testPlayerStatus.isLoaded && testPlayerStatus.duration > 0) {
        console.log('🎵 [TEST PLAYER] AUDIO LOADED SUCCESSFULLY! Duration:', testPlayerStatus.duration);
      }
      
      // Log buffering state changes
      if (testPlayerStatus.isBuffering) {
        console.log('⏳ [TEST PLAYER] Buffering audio...');
      }
      
      // Log when playback starts
      if (testPlayerStatus.playing) {
        console.log('▶️ [TEST PLAYER] AUDIO IS PLAYING!');
        setShouldPlayRemoteTest(false); // Reset flag when playing
      }
      
      // Auto-play when loaded and we want to play
      if (testPlayerStatus.isLoaded && shouldPlayRemoteTest && !testPlayerStatus.playing) {
        console.log('🚀 [TEST PLAYER] Auto-playing now that audio is loaded');
        try {
          testPlayer.seekTo(0);
          testPlayer.play();
        } catch (error) {
          console.error('[TEST PLAYER] Auto-play failed:', error);
        }
      }
    }
  }, [testPlayerStatus, shouldPlayRemoteTest]);

  // Log public test player status for comparison
  useEffect(() => {
    if (publicTestPlayerStatus) {
      console.log('[Fitness Player] PUBLIC TEST PLAYER status:', {
        isLoaded: publicTestPlayerStatus.isLoaded,
        isPlaying: publicTestPlayerStatus.playing,
        isBuffering: publicTestPlayerStatus.isBuffering,
        currentTime: publicTestPlayerStatus.currentTime,
        duration: publicTestPlayerStatus.duration,
      });
      
      if (publicTestPlayerStatus.isLoaded && publicTestPlayerStatus.duration > 0) {
        console.log('🔊 [PUBLIC TEST] AUDIO LOADED SUCCESSFULLY! Duration:', publicTestPlayerStatus.duration);
      }
      
      if (publicTestPlayerStatus.playing) {
        console.log('▶️ [PUBLIC TEST] AUDIO IS PLAYING!');
        setShouldPlayPublicTest(false); // Reset flag when playing
      }
      
      // Auto-play when loaded and we want to play
      if (publicTestPlayerStatus.isLoaded && shouldPlayPublicTest && !publicTestPlayerStatus.playing) {
        console.log('🚀 [PUBLIC TEST] Auto-playing now that audio is loaded');
        try {
          publicTestPlayer.seekTo(0);
          publicTestPlayer.play();
        } catch (error) {
          console.error('[PUBLIC TEST] Auto-play failed:', error);
        }
      }
    }
  }, [publicTestPlayerStatus, shouldPlayPublicTest]);

  // Toggle play/pause
  const togglePlayback = () => {
    try {
      if (playerStatus.playing) {
        player.pause();
        dispatch(setIsPlaying(false));
      } else {
        player.play();
        dispatch(setIsPlaying(true));
      }
    } catch (error) {
      console.error('Toggle playback failed:', error);
      dispatch(setError('Playback control failed'));
    }
  };

  // Format time
  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Volume control
  useEffect(() => {
    if (player && volume !== player.volume) {
      player.volume = volume;
    }
  }, [volume, player]);

  // Seek functionality
  const seekTo = (seconds: number) => {
    if (player) {
      player.seekTo(seconds);
      dispatch(setPosition(seconds * 1000));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: nucleus.light.global.blue["20"] }]}>
      <StatusBar barStyle="dark-content" backgroundColor={nucleus.light.global.blue["20"]} />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text 
            variant="displaySmall" 
            style={[styles.titleText, { color: nucleus.light.global.blue["80"] }]}
          >
            Fitness Music Player
          </Text>
          <Text 
            variant="bodyLarge" 
            style={[styles.descriptionText, { color: nucleus.light.global.blue["70"] }]}
          >
            Powered by Partynet Fitness API
          </Text>
        </View>

        {/* Error Display */}
        {error && (
          <Card style={[styles.errorCard, { backgroundColor: nucleus.light.semantic.bg.dangerTertiary }]}>
            <Card.Content>
              <Text style={{ color: nucleus.light.semantic.fg.danger }}>{error}</Text>
            </Card.Content>
          </Card>
        )}

        {/* Mix Parameters */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>Mix Parameters</Text>
            
            {/* Genre Selection */}
            <View style={styles.parameterSection}>
              <Text variant="bodyMedium" style={styles.parameterLabel}>Genre:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                {genres.map((genre) => (
                  <Chip
                    key={genre}
                    selected={selectedGenre === genre}
                    onPress={() => {
                      setSelectedGenre(genre);
                      setSelectedStyle(''); // Reset style when genre changes
                    }}
                    style={[styles.chip, selectedGenre === genre && styles.selectedChip]}
                    textStyle={selectedGenre === genre ? styles.selectedChipText : styles.chipText}
                  >
                    {genre}
                  </Chip>
                ))}
              </ScrollView>
            </View>

            {/* Style Selection */}
            {genreStyles.length > 0 && (
              <View style={styles.parameterSection}>
                <Text variant="bodyMedium" style={styles.parameterLabel}>Style:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                  {genreStyles.map((style) => (
                    <Chip
                      key={style}
                      selected={selectedStyle === style}
                      onPress={() => setSelectedStyle(style)}
                      style={[styles.chip, selectedStyle === style && styles.selectedChip]}
                      textStyle={selectedStyle === style ? styles.selectedChipText : styles.chipText}
                    >
                      {style}
                    </Chip>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Energy Level */}
            <View style={styles.parameterSection}>
              <Text variant="bodyMedium" style={styles.parameterLabel}>Energy Level:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                {['LOW', 'MID', 'HIGH'].map((energy) => (
                  <Chip
                    key={energy}
                    selected={selectedEnergyLevel === energy}
                    onPress={() => setSelectedEnergyLevel(energy)}
                    style={[styles.chip, selectedEnergyLevel === energy && styles.selectedChip]}
                    textStyle={selectedEnergyLevel === energy ? styles.selectedChipText : styles.chipText}
                  >
                    {energy}
                  </Chip>
                ))}
              </ScrollView>
            </View>

            {/* Time Period */}
            <View style={styles.parameterSection}>
              <Text variant="bodyMedium" style={styles.parameterLabel}>Time Period:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                {['1990-2000', '2000-2010', '2010-2020', '2020-2024'].map((period) => (
                  <Chip
                    key={period}
                    selected={selectedTimePeriod === period}
                    onPress={() => setSelectedTimePeriod(period)}
                    style={[styles.chip, selectedTimePeriod === period && styles.selectedChip]}
                    textStyle={selectedTimePeriod === period ? styles.selectedChipText : styles.chipText}
                  >
                    {period}
                  </Chip>
                ))}
              </ScrollView>
            </View>

            {/* BPM */}
            <View style={styles.parameterSection}>
              <Text variant="bodyMedium" style={styles.parameterLabel}>BPM:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                {['80-100', '100-120', '120-140', '140-160', '160-180'].map((bpm) => (
                  <Chip
                    key={bpm}
                    selected={selectedBPM === bpm}
                    onPress={() => setSelectedBPM(bpm)}
                    style={[styles.chip, selectedBPM === bpm && styles.selectedChip]}
                    textStyle={selectedBPM === bpm ? styles.selectedChipText : styles.chipText}
                  >
                    {bpm}
                  </Chip>
                ))}
              </ScrollView>
            </View>

            <Button
              mode="contained"
              onPress={fetchPlaylist}
              loading={isMixLoading || isTokenLoading}
              disabled={!token || isLoading}
              style={[styles.button, { backgroundColor: nucleus.light.global.blue["70"] }]}
              labelStyle={[styles.buttonLabel, { color: nucleus.light.global.blue["10"] }]}
              contentStyle={styles.buttonContent}
              compact={false}
            >
              Generate Mix
            </Button>
            
            {/* Test button for debugging local test server */}
            <Button
              mode="outlined"
              onPress={testRemoteAudio}
              style={[styles.button, { marginTop: 8, borderColor: nucleus.light.global.blue["70"] }]}
              labelStyle={[styles.buttonLabel, { color: nucleus.light.global.blue["70"] }]}
              contentStyle={styles.buttonContent}
              compact={false}
            >
              🏠 Test Local Server (aaa.mp3)
            </Button>
            
            {/* Test button for public audio */}
            <Button
              mode="outlined"
              onPress={testPublicAudio}
              style={[styles.button, { marginTop: 8, borderColor: nucleus.light.global.green["70"] || nucleus.light.global.blue["50"] }]}
              labelStyle={[styles.buttonLabel, { color: nucleus.light.global.green["70"] || nucleus.light.global.blue["50"] }]}
              contentStyle={styles.buttonContent}
              compact={false}
            >
              🔊 Test Public Audio (No Auth)
            </Button>
          </Card.Content>
        </Card>

        {/* Current Track Display */}
        {currentTrack && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>Now Playing</Text>
              <Text variant="titleLarge" style={styles.trackTitle}>
                {currentTrack.title}
              </Text>
              <Text variant="bodyLarge" style={styles.trackArtist}>
                {currentTrack.artist}
              </Text>
              <Text variant="bodyMedium" style={styles.trackDetails}>
                {currentTrack.genre} • {currentTrack.bpm} BPM • {currentTrack.energyLevel} Energy
              </Text>
              
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>
                <ProgressBar 
                  progress={duration > 0 ? position / duration : 0}
                  style={styles.progressBar}
                  color={nucleus.light.global.blue["70"]}
                />
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>

              {/* Volume Control */}
              <View style={styles.volumeContainer}>
                <IconButton
                  icon="volume-minus"
                  size={20}
                  iconColor={nucleus.light.global.blue["60"]}
                  onPress={() => dispatch(setVolume(Math.max(0, volume - 0.1)))}
                />
                <View style={styles.volumeBarContainer}>
                  <Text style={styles.volumeLabel}>Volume: {Math.round(volume * 100)}%</Text>
                  <ProgressBar 
                    progress={volume}
                    style={styles.volumeBar}
                    color={nucleus.light.global.blue["70"]}
                  />
                </View>
                <IconButton
                  icon="volume-plus"
                  size={20}
                  iconColor={nucleus.light.global.blue["60"]}
                  onPress={() => dispatch(setVolume(Math.min(1, volume + 0.1)))}
                />
              </View>

              {/* Playback Controls */}
              <View style={styles.controls}>
                <IconButton
                  icon="shuffle"
                  size={24}
                  iconColor={shuffle ? nucleus.light.global.blue["70"] : nucleus.light.global.blue["50"]}
                  onPress={() => dispatch(setShuffle(!shuffle))}
                />
                <IconButton
                  icon="skip-previous"
                  size={32}
                  iconColor={nucleus.light.global.blue["70"]}
                  onPress={() => dispatch(previousTrack())}
                  disabled={playlist.length === 0}
                />
                <IconButton
                  icon={isPlaying ? "pause" : "play"}
                  size={48}
                  iconColor={nucleus.light.global.blue["70"]}
                  onPress={togglePlayback}
                  disabled={!playerStatus.isLoaded}
                  style={styles.playButton}
                />
                <IconButton
                  icon="skip-next"
                  size={32}
                  iconColor={nucleus.light.global.blue["70"]}
                  onPress={() => dispatch(nextTrack())}
                  disabled={playlist.length === 0}
                />
                <IconButton
                  icon={repeat === 'off' ? 'repeat-off' : repeat === 'one' ? 'repeat-once' : 'repeat'}
                  size={24}
                  iconColor={repeat !== 'off' ? nucleus.light.global.blue["70"] : nucleus.light.global.blue["50"]}
                  onPress={() => {
                    const nextRepeat = repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off';
                    dispatch(setRepeat(nextRepeat));
                  }}
                />
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Playlist */}
        {playlist.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Playlist ({playlist.length} tracks)
              </Text>
              {playlist.map((track, index) => (
                <Card 
                  key={`${track.url}-${index}`} 
                  style={[
                    styles.trackCard, 
                    currentTrackIndex === index && styles.currentTrackCard
                  ]}
                >
                  <Card.Content style={styles.trackCardContent}>
                    <View style={styles.trackInfo}>
                      <Text variant="bodyLarge" style={styles.trackItemTitle}>
                        {track.title}
                      </Text>
                      <Text variant="bodyMedium" style={styles.trackItemArtist}>
                        {track.artist}
                      </Text>
                      <Text variant="bodySmall" style={styles.trackItemDetails}>
                        {track.genre} • {track.bpm} BPM • {track.length}s
                      </Text>
                    </View>
                    <IconButton
                      icon={currentTrackIndex === index && isPlaying ? "pause" : "play"}
                      size={24}
                      iconColor={nucleus.light.global.blue["70"]}
                      onPress={() => {
                        if (currentTrackIndex === index) {
                          togglePlayback();
                        } else {
                          playTrack(track, index);
                        }
                      }}
                    />
                  </Card.Content>
                </Card>
              ))}
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 100, // Extra space for tab bar
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  titleText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 28,
    lineHeight: 33.6,
    textAlign: 'center',
    marginBottom: 8,
  },
  descriptionText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  errorCard: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
    backgroundColor: nucleus.light.semantic.bg.canvas,
  },
  cardTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 16,
    color: nucleus.light.global.blue["80"],
  },
  parameterSection: {
    marginBottom: 16,
  },
  parameterLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    marginBottom: 8,
    color: nucleus.light.global.blue["70"],
  },
  chipContainer: {
    flexDirection: 'row',
  },
  chip: {
    marginRight: 8,
    backgroundColor: nucleus.light.global.blue["30"],
  },
  selectedChip: {
    backgroundColor: nucleus.light.global.blue["70"],
  },
  chipText: {
    fontFamily: 'PlusJakartaSans-Regular',
    color: nucleus.light.global.blue["80"],
  },
  selectedChipText: {
    fontFamily: 'PlusJakartaSans-Medium',
    color: nucleus.light.global.blue["10"],
  },
  button: {
    borderRadius: 48,
    minHeight: 48,
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonContent: {
    minHeight: 48,
    paddingHorizontal: 24,
    paddingVertical: 0,
  },
  buttonLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    lineHeight: 20,
    marginVertical: 0,
    includeFontPadding: false,
  },
  trackTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    color: nucleus.light.global.blue["80"],
    marginBottom: 4,
  },
  trackArtist: {
    fontFamily: 'PlusJakartaSans-Medium',
    color: nucleus.light.global.blue["70"],
    marginBottom: 4,
  },
  trackDetails: {
    fontFamily: 'PlusJakartaSans-Regular',
    color: nucleus.light.global.blue["60"],
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    marginHorizontal: 12,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  volumeBarContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  volumeLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: nucleus.light.global.blue["60"],
    textAlign: 'center',
    marginBottom: 4,
  },
  volumeBar: {
    height: 4,
  },
  timeText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: nucleus.light.global.blue["60"],
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  playButton: {
    backgroundColor: nucleus.light.global.blue["20"],
  },
  trackCard: {
    marginBottom: 8,
    backgroundColor: nucleus.light.global.blue["10"],
  },
  currentTrackCard: {
    backgroundColor: nucleus.light.global.blue["30"],
  },
  trackCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  trackInfo: {
    flex: 1,
  },
  trackItemTitle: {
    fontFamily: 'PlusJakartaSans-Medium',
    color: nucleus.light.global.blue["80"],
    marginBottom: 2,
  },
  trackItemArtist: {
    fontFamily: 'PlusJakartaSans-Regular',
    color: nucleus.light.global.blue["70"],
    marginBottom: 2,
  },
  trackItemDetails: {
    fontFamily: 'PlusJakartaSans-Regular',
    color: nucleus.light.global.blue["60"],
  },
});
