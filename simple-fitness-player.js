import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

export default function App() {
  const [token, setToken] = useState(null);
  const [currentSource, setCurrentSource] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [logs, setLogs] = useState([]);

  const player = useAudioPlayer(currentSource);
  const status = useAudioPlayerStatus(player);

  // Test player for Katy Perry - Roar
  const testAudioSource = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
  const testPlayer = useAudioPlayer(testAudioSource);
  const testStatus = useAudioPlayerStatus(testPlayer);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    setLogs(prev => [...prev, logEntry].slice(-10)); // Keep last 10 logs
  };

  // Simple auth
  const authenticate = async () => {
    addLog('=== AUTH REQUEST ===');
    const authUrl = 'https://mod.partynet.serv.si/oauth2/token';
    const authHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    const authBody = 'client_id=fitness&client_secret=v9%24Tg7%21kLp2%40Qz6%23Xw8%5ERb1*&grant_type=client_credentials';

    addLog(`POST ${authUrl}`);
    addLog(`Headers: ${JSON.stringify(authHeaders)}`);
    addLog(`Body: ${authBody}`);

    try {
      const response = await fetch(authUrl, {
        method: 'POST',
        headers: authHeaders,
        body: authBody,
      });

      addLog(`Response: ${response.status} ${response.statusText}`);
      const data = await response.json();
      addLog(`Response Body: ${JSON.stringify(data, null, 2)}`);

      setToken(data.access_token);
      addLog(`Token stored: ${data.access_token?.substring(0, 30)}...`);
    } catch (error) {
      addLog(`ERROR: ${error.message}`);
      Alert.alert('Auth Failed', error.message);
    }
  };

  // Generate simple mix
  const generateMix = async () => {
    addLog('=== MIX REQUEST ===');
    addLog(`Token available: ${!!token}`);

    if (!token) {
      addLog('ERROR: No token available');
      Alert.alert('Error', 'Please login first');
      return;
    }

    const mixUrl = 'https://mod.partynet.serv.si/fitness/mix';
    const mixHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Expo-App/1.0',
    };
    const mixBody = {
      topHits: true,
      explicitSongs: true,
      mixParameters: [{
        genre: 'POP',
        style: 'POP',
        percentage: 100,
        energyLevel: 'MID',
        timePeriod: '2010-2020',
        bpm: '120-140'
      }]
    };

    addLog(`POST ${mixUrl}`);
    addLog(`Headers: ${JSON.stringify(mixHeaders, null, 2)}`);
    addLog(`Body: ${JSON.stringify(mixBody, null, 2)}`);

    try {
      const response = await fetch(mixUrl, {
        method: 'POST',
        headers: mixHeaders,
        body: JSON.stringify(mixBody),
      });

      addLog(`Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        addLog(`Error Response Body: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const tracksData = await response.json();
      addLog(`Success! Got ${tracksData.length} tracks`);
      addLog(`First track: ${tracksData[0]?.title} by ${tracksData[0]?.artist}`);

      if (tracksData.length > 0) {
        setTracks(tracksData.slice(0, 10));
      } else {
        addLog('WARNING: No tracks returned');
        Alert.alert('No tracks', 'Try different parameters');
      }
    } catch (error) {
      addLog(`ERROR: ${error.message}`);
      Alert.alert('Mix Failed', error.message);
    }
  };

  // Play track
  const playTrack = (track) => {
    addLog('=== PLAY REQUEST ===');
    const audioUrl = `https://mod.partynet.serv.si/fitness/file/${track.url}`;
    const audioHeaders = {
      'Authorization': `Bearer ${token}`,
    };

    addLog(`Track: ${track.title} by ${track.artist}`);
    addLog(`GET ${audioUrl}`);
    addLog(`Headers: ${JSON.stringify(audioHeaders)}`);

    const audioSource = {
      uri: audioUrl,
      headers: audioHeaders,
    };

    setCurrentSource(audioSource);
    setCurrentTrack(track);
    addLog('Audio source set, waiting for player...');
  };

  const togglePlay = () => {
    addLog(`Toggle play - current status: ${status.playing ? 'playing' : 'paused'}`);
    if (status.playing) {
      addLog('Pausing player');
      player.pause();
    } else {
      addLog('Starting playback');
      player.play();
    }
  };

  // Auto-play next song when current song finishes
  useEffect(() => {
    if (status.isLoaded && !status.playing && status.currentTime > 0 && currentTrack) {
      // Check if song has finished (currentTime is near duration)
      if (status.duration && status.currentTime >= status.duration - 0.5) {
        addLog('Song finished, auto-playing next track...');

        // Find current track index
        const currentIndex = tracks.findIndex(t => t.url === currentTrack.url);

        // If there's a next track, play it
        if (currentIndex >= 0 && currentIndex < tracks.length - 1) {
          const nextTrack = tracks[currentIndex + 1];
          addLog(`Playing next: ${nextTrack.title}`);
          playTrack(nextTrack);
        } else {
          addLog('Reached end of playlist');
        }
      }
    }
  }, [status.playing, status.currentTime, status.duration]);

  return (
    <View style={styles.container}>
        <Text style={styles.title}>Simple Fitness Player</Text>

      <Text>Status: {token ? '✅ Connected' : '❌ Not Connected'}</Text>

      <Button title="Login" onPress={authenticate} />
      <Button title="Generate Mix" onPress={generateMix} />
      <Button
        title={testStatus.playing ? "Pause Test Song" : "Play Test Song"}
        onPress={() => {
          if (testStatus.playing) {
            testPlayer.pause();
            addLog('Test song paused');
          } else {
            testPlayer.play();
            addLog('Test song playing');
          }
        }}
      />

      {/* Debug Logs - right below buttons */}
      <View style={styles.debugSection}>
        <Text style={styles.debugTitle}>Debug Logs:</Text>
        <ScrollView style={styles.logScrollView} nestedScrollEnabled={true}>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logText}>{log}</Text>
          ))}
        </ScrollView>
      </View>

      {currentTrack && (
        <View style={styles.player}>
          <Text style={styles.nowPlaying}>Now Playing:</Text>
          <Text style={styles.trackTitle}>{currentTrack.title}</Text>
          <Text style={styles.trackArtist}>{currentTrack.artist}</Text>
          <Text>Status: {status.playing ? 'Playing' : 'Paused'}</Text>
          <Text>Time: {status.currentTime.toFixed(1)}s</Text>
          <Button
            title={status.playing ? "Pause" : "Play"}
            onPress={togglePlay}
          />
        </View>
      )}

      {tracks.length > 0 && (
        <View style={styles.playlist}>
          <Text style={styles.playlistTitle}>Tracks ({tracks.length}):</Text>
          <ScrollView style={styles.trackScrollView} nestedScrollEnabled={true}>
            {tracks.map((track, index) => (
              <TouchableOpacity
                key={index}
                style={styles.trackItem}
                onPress={() => playTrack(track)}
              >
                <Text style={styles.trackItemTitle}>{track.title}</Text>
                <Text style={styles.trackItemArtist}>{track.artist}</Text>
                <Text style={styles.trackDetails}>
                  {track.genre} • {track.bpm} BPM • {track.length}s
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  debugSection: {
    backgroundColor: '#2c3e50',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    height: 150,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ecf0f1',
    marginBottom: 5,
  },
  logScrollView: {
    flex: 1,
  },
  logText: {
    fontSize: 9,
    color: '#bdc3c7',
    fontFamily: 'monospace',
    marginBottom: 1,
  },
  player: {
    padding: 20,
    backgroundColor: '#e8f4f8',
    borderRadius: 10,
    marginVertical: 10,
  },
  nowPlaying: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  trackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  trackArtist: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  playlist: {
    flex: 1,
    marginTop: 10,
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  trackScrollView: {
    flex: 1,
    maxHeight: 200,
  },
  trackItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  trackItemTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  trackItemArtist: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 3,
  },
  trackDetails: {
    fontSize: 11,
    color: '#95a5a6',
  },
});