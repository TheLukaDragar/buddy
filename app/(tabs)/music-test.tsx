import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { Button, Card, Text, TextInput, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../store/hooks';
import {
  getPlaylists,
  selectPlaylist,
  getTracks,
  playTrack,
  skipNext,
  skipPrevious,
  pauseMusic,
  resumeMusic,
  setVolume,
  getMusicStatus
} from '../../store/actions/musicActions';
import { useBuddyTheme } from '@/constants/BuddyTheme';
import { useSpotifyAuth } from '../../hooks/useSpotifyAuth';

export default function MusicTestScreen() {
  const dispatch = useAppDispatch();
  const theme = useBuddyTheme();
  const spotifyAuth = useSpotifyAuth();
  const [trackName, setTrackName] = useState('');
  const [playlistId, setPlaylistId] = useState('');
  const [volume, setVolumeValue] = useState('50');
  const [results, setResults] = useState<string>('');

  const logResult = (result: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const formatted = `[${timestamp}] ${JSON.stringify(result, null, 2)}\n\n`;
    setResults(prev => formatted + prev);
  };

  const testFunction = async (func: any, params?: any) => {
    try {
      console.log(`[Music Test] Calling function:`, func.type || func.name);
      console.log(`[Music Test] With params:`, params);
      
      const actionResult = dispatch(func(params));
      console.log(`[Music Test] Action dispatched:`, actionResult);
      
      const result = await actionResult.unwrap();
      console.log(`[Music Test] Result:`, result);
      
      logResult({ success: true, ...result });
    } catch (error) {
      console.log(`[Music Test] Error:`, error);
      logResult({ success: false, error });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        
        <Text variant="headlineMedium" style={styles.title}>
          🎵 Music API Test Tool
        </Text>

        {/* Device & Status Tests */}
        <Card style={styles.card}>
          <Card.Title title="📱 Device & Status" />
          <Card.Content>
            <View style={styles.buttonRow}>
              <Button 
                mode="contained" 
                onPress={() => testFunction(getMusicStatus)}
                style={styles.button}
              >
                Get Status
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Auth Tests */}
        <Card style={styles.card}>
          <Card.Title title="🔐 Auth Tests" />
          <Card.Content>
            <View style={styles.buttonRow}>
              <Button 
                mode="contained" 
                onPress={async () => {
                  try {
                    console.log('[Music Test] Testing manual token refresh...');
                    const result = await spotifyAuth.refreshAccessToken();
                    logResult({ 
                      success: !!result, 
                      message: result ? 'Token refreshed successfully' : 'Token refresh failed',
                      newToken: result ? `${result.substring(0, 20)}...` : null,
                      hasRefreshToken: !!spotifyAuth.accessToken,
                      isAuthenticated: spotifyAuth.isAuthenticated
                    });
                  } catch (error) {
                    console.log('[Music Test] Token refresh error:', error);
                    logResult({ success: false, error: error?.message || error });
                  }
                }}
                style={styles.button}
              >
                Test Token Refresh
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Playlist Tests */}
        <Card style={styles.card}>
          <Card.Title title="📋 Playlists" />
          <Card.Content>
            <View style={styles.buttonRow}>
              <Button 
                mode="contained" 
                onPress={() => testFunction(getPlaylists)}
                style={styles.button}
              >
                Get Playlists
              </Button>
              <Button 
                mode="contained" 
                onPress={() => testFunction(selectPlaylist, { playlistId: 'liked' })}
                style={styles.button}
              >
                Select Liked Songs
              </Button>
            </View>
            
            <TextInput
              label="Playlist ID"
              value={playlistId}
              onChangeText={setPlaylistId}
              style={styles.input}
              placeholder="Enter playlist ID or name"
            />
            <Button 
              mode="outlined" 
              onPress={() => testFunction(selectPlaylist, { playlistId })}
              style={styles.button}
            >
              Select Custom Playlist
            </Button>
            
            <Button 
              mode="outlined" 
              onPress={() => testFunction(getTracks)}
              style={styles.button}
            >
              Get Current Playlist Tracks
            </Button>
          </Card.Content>
        </Card>

        {/* Playback Control Tests */}
        <Card style={styles.card}>
          <Card.Title title="▶️ Playback Controls" />
          <Card.Content>
            <View style={styles.buttonRow}>
              <Button 
                mode="contained" 
                onPress={() => testFunction(playTrack)}
                style={styles.button}
              >
                Play Playlist
              </Button>
              <Button 
                mode="contained" 
                onPress={() => testFunction(resumeMusic)}
                style={styles.button}
              >
                Resume
              </Button>
            </View>
            
            <View style={styles.buttonRow}>
              <Button 
                mode="outlined" 
                onPress={() => testFunction(pauseMusic)}
                style={styles.button}
              >
                Pause
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => testFunction(skipNext)}
                style={styles.button}
              >
                Next Track
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => testFunction(skipPrevious)}
                style={styles.button}
              >
                Previous Track
              </Button>
            </View>

            <TextInput
              label="Track Name"
              value={trackName}
              onChangeText={setTrackName}
              style={styles.input}
              placeholder="Enter song or artist name"
            />
            <Button 
              mode="outlined" 
              onPress={() => testFunction(playTrack, { trackName })}
              style={styles.button}
            >
              Play Specific Track
            </Button>
          </Card.Content>
        </Card>

        {/* Volume Control Tests */}
        <Card style={styles.card}>
          <Card.Title title="🔊 Volume" />
          <Card.Content>
            <TextInput
              label="Volume (0-100)"
              value={volume}
              onChangeText={setVolumeValue}
              style={styles.input}
              keyboardType="numeric"
            />
            <View style={styles.buttonRow}>
              <Button 
                mode="contained" 
                onPress={() => testFunction(setVolume, { volume: parseInt(volume) })}
                style={styles.button}
              >
                Set Volume
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => testFunction(setVolume, { volume: 20 })}
                style={styles.button}
              >
                Low (20%)
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => testFunction(setVolume, { volume: 80 })}
                style={styles.button}
              >
                High (80%)
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Test Buttons */}
        <Card style={styles.card}>
          <Card.Title title="⚡ Quick Tests" />
          <Card.Content>
            <Button 
              mode="contained" 
              onPress={async () => {
                // Test full flow
                await testFunction(getPlaylists);
                await testFunction(selectPlaylist, { playlistId: 'liked' });
                await testFunction(playTrack);
                await testFunction(getMusicStatus);
              }}
              style={styles.button}
            >
              🧪 Run Full Test Flow
            </Button>
            
            <Button 
              mode="outlined" 
              onPress={() => setResults('')}
              style={styles.button}
            >
              Clear Results
            </Button>
          </Card.Content>
        </Card>

        <Divider style={styles.divider} />

        {/* Results Display */}
        <Card style={styles.card}>
          <Card.Title title="📊 Test Results" />
          <Card.Content>
            <ScrollView 
              style={styles.resultsContainer}
              nestedScrollEnabled={true}
            >
              <Text style={styles.resultsText}>
                {results || 'No tests run yet. Try the buttons above!'}
              </Text>
            </ScrollView>
          </Card.Content>
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  button: {
    flex: 1,
    minWidth: 100,
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
  },
  divider: {
    marginVertical: 16,
  },
  resultsContainer: {
    maxHeight: 300,
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 4,
  },
  resultsText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 16,
  },
});