import { useBuddyTheme } from '@/constants/BuddyTheme';
import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, Divider, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { nucleus } from '../../Buddy_variables.js';
import SpotifyConnectModal from '../../components/SpotifyConnectModal';
import SpotifyPlayer from '../../components/SpotifyPlayer';
import { useSpotifyAuth } from '../../hooks/useSpotifyAuth';
import { useSpotifyConnect } from '../../hooks/useSpotifyConnect';
import {
    useCheckPremiumStatusQuery,
    useGetAvailableDevicesQuery,
    useGetCurrentPlaybackStateQuery,
    useGetRecentlyPlayedQuery,
    useGetTopArtistsQuery,
    useGetTopTracksQuery,
    useGetUserProfileQuery,
    useGetWorkoutPlaylistsQuery,
    useSearchQuery,
} from '../../store/api/spotifyApi';

export default function SpotifyDemoScreen() {
  const theme = useBuddyTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Auth hooks
  const { isAuthenticated, user: spotifyUser, loading: authLoading } = useSpotifyAuth();
  const spotifyConnect = useSpotifyConnect();
  
  // Initialize auth sync   

  // RTK Query hooks - only run when authenticated
  const { data: userProfile, isLoading: profileLoading } = useGetUserProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  const { data: isPremium, isLoading: premiumLoading } = useCheckPremiumStatusQuery(undefined, {
    skip: !isAuthenticated,
  });

  const { data: devicesData, isLoading: devicesLoading } = useGetAvailableDevicesQuery(undefined, {
    skip: !isAuthenticated,
  });

  const { data: playbackState, isLoading: playbackLoading } = useGetCurrentPlaybackStateQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 5000,
  });

  const { data: topTracks, isLoading: topTracksLoading } = useGetTopTracksQuery(
    { timeRange: 'short_term', limit: 5 },
    { skip: !isAuthenticated }
  );

  const { data: topArtists, isLoading: topArtistsLoading } = useGetTopArtistsQuery(
    { timeRange: 'short_term', limit: 5 },
    { skip: !isAuthenticated }
  );

  const { data: recentlyPlayed, isLoading: recentLoading } = useGetRecentlyPlayedQuery(
    { limit: 5 },
    { skip: !isAuthenticated }
  );

  const { data: workoutPlaylists, isLoading: playlistsLoading } = useGetWorkoutPlaylistsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const { data: searchResults, isLoading: searchLoading } = useSearchQuery(
    { query: searchQuery || 'workout', type: 'track,playlist', limit: 5 },
    { skip: !isAuthenticated || !searchQuery }
  );

  const handleSearch = () => {
    setSearchQuery('motivation workout');
    setShowSearch(true);
  };

  if (authLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: nucleus.light.global.blue["20"] }]}>
        <StatusBar barStyle="dark-content" backgroundColor={nucleus.light.global.blue["20"]} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={nucleus.light.global.blue["70"]} />
          <Text 
            variant="bodyLarge" 
            style={[styles.loadingText, { color: nucleus.light.global.blue["70"] }]}
          >
            Loading Spotify Integration...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
            variant="headlineLarge" 
            style={[styles.title, { color: nucleus.light.global.blue["90"] }]}
          >
            Spotify Integration Demo
          </Text>
          <Text 
            variant="bodyMedium" 
            style={[styles.subtitle, { color: nucleus.light.global.blue["70"] }]}
          >
            Showcasing RTK Query + Spotify API
          </Text>
        </View>

        {!isAuthenticated ? (
          // Not Connected State
          <Card style={[styles.card, { backgroundColor: nucleus.light.global.blue["10"] }]}>
            <Card.Content style={styles.cardContent}>
              <Text 
                variant="titleLarge" 
                style={[styles.cardTitle, { color: nucleus.light.global.blue["90"] }]}
              >
                🎵 Connect Your Spotify
              </Text>
              <Text 
                variant="bodyMedium" 
                style={[styles.cardDescription, { color: nucleus.light.global.blue["70"] }]}
              >
                Connect your Spotify account to see all the amazing features in action!
              </Text>
              <Button
                mode="contained"
                style={[styles.connectButton, { backgroundColor: '#1DB954' }]}
                labelStyle={styles.buttonLabel}
                contentStyle={styles.buttonContent}
                compact={false}
                onPress={spotifyConnect.openConnectModal}
              >
                Connect Spotify
              </Button>
            </Card.Content>
          </Card>
        ) : (
          // Connected State - Show All Features
          <>
            {/* User Profile Info */}
            <Card style={[styles.card, { backgroundColor: nucleus.light.global.blue["10"] }]}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.profileHeader}>
                  <View style={styles.profileInfo}>
                    <Text 
                      variant="titleLarge" 
                      style={[styles.cardTitle, { color: nucleus.light.global.blue["90"] }]}
                    >
                      👋 Hey {userProfile?.display_name || spotifyUser?.display_name}!
                    </Text>
                    <View style={styles.chipContainer}>
                      <Chip 
                        icon="spotify" 
                        style={[styles.chip, { backgroundColor: nucleus.light.global.blue["30"] }]}
                        textStyle={{ color: nucleus.light.global.blue["90"] }}
                      >
                        {isPremium ? 'Premium' : 'Free'} Account
                      </Chip>
                      {userProfile?.country && (
                        <Chip 
                          icon="earth" 
                          style={[styles.chip, { backgroundColor: nucleus.light.global.blue["30"] }]}
                          textStyle={{ color: nucleus.light.global.blue["90"] }}
                        >
                          {userProfile.country}
                        </Chip>
                      )}
                    </View>
                  </View>
                  <Button
                    mode="outlined"
                    style={[styles.disconnectButton, { borderColor: '#FF6B35' }]}
                    labelStyle={[styles.disconnectButtonLabel, { color: '#FF6B35' }]}
                    compact={true}
                    onPress={spotifyConnect.handleDisconnect}
                  >
                    Disconnect
                  </Button>
                </View>
              </Card.Content>
            </Card>

            {/* Spotify Player Component */}
            <Card style={[styles.card, { backgroundColor: nucleus.light.global.blue["10"] }]}>
              <Card.Content style={styles.cardContent}>
                <Text 
                  variant="titleLarge" 
                  style={[styles.cardTitle, { color: nucleus.light.global.blue["90"] }]}
                >
                  🎮 Spotify Player
                </Text>
                <SpotifyPlayer />
              </Card.Content>
            </Card>

            {/* Device Status */}
            <Card style={[styles.card, { backgroundColor: nucleus.light.global.blue["10"] }]}>
              <Card.Content style={styles.cardContent}>
                <Text 
                  variant="titleLarge" 
                  style={[styles.cardTitle, { color: nucleus.light.global.blue["90"] }]}
                >
                  📱 Available Devices
                </Text>
                {devicesLoading ? (
                  <ActivityIndicator size="small" color={nucleus.light.global.blue["70"]} />
                ) : (
                  <View style={styles.devicesList}>
                    {/* Show current playback device if available */}
                    {playbackState?.device && (
                      <View style={styles.deviceItem}>
                        <Text style={[styles.deviceName, { color: nucleus.light.global.blue["90"] }]}>
                          {playbackState.device.name} (Currently Playing)
                        </Text>
                        <View style={styles.deviceChips}>
                          <Chip 
                            style={[styles.smallChip, { backgroundColor: '#4CAF50' }]}
                            textStyle={{ color: '#FFFFFF', fontSize: 12 }}
                          >
                            Playing
                          </Chip>
                          <Chip 
                            style={[styles.smallChip, { backgroundColor: nucleus.light.global.blue["30"] }]}
                            textStyle={{ color: nucleus.light.global.blue["90"], fontSize: 12 }}
                          >
                            {playbackState.device.type}
                          </Chip>
                          <Chip 
                            style={[styles.smallChip, { backgroundColor: nucleus.light.global.blue["30"] }]}
                            textStyle={{ color: nucleus.light.global.blue["90"], fontSize: 12 }}
                          >
                            Vol: {playbackState.device.volume_percent}%
                          </Chip>
                        </View>
                      </View>
                    )}
                    
                    {/* Show other available devices */}
                    {devicesData?.devices?.filter(device => 
                      !playbackState?.device || device.id !== playbackState.device.id
                    ).map((device, index) => (
                      <View key={device.id || index} style={styles.deviceItem}>
                        <Text style={[styles.deviceName, { color: nucleus.light.global.blue["90"] }]}>
                          {device.name}
                        </Text>
                        <View style={styles.deviceChips}>
                          <Chip 
                            style={[
                              styles.smallChip, 
                              { backgroundColor: device.is_active ? '#4CAF50' : nucleus.light.global.blue["30"] }
                            ]}
                            textStyle={{ 
                              color: device.is_active ? '#FFFFFF' : nucleus.light.global.blue["90"],
                              fontSize: 12 
                            }}
                          >
                            {device.is_active ? 'Active' : 'Available'}
                          </Chip>
                          <Chip 
                            style={[styles.smallChip, { backgroundColor: nucleus.light.global.blue["30"] }]}
                            textStyle={{ color: nucleus.light.global.blue["90"], fontSize: 12 }}
                          >
                            {device.type}
                          </Chip>
                          {device.volume_percent !== undefined && (
                            <Chip 
                              style={[styles.smallChip, { backgroundColor: nucleus.light.global.blue["30"] }]}
                              textStyle={{ color: nucleus.light.global.blue["90"], fontSize: 12 }}
                            >
                              Vol: {device.volume_percent}%
                            </Chip>
                          )}
                        </View>
                      </View>
                    ))}
                    
                    {/* Show empty state only if no devices at all */}
                    {!playbackState?.device && (!devicesData?.devices || devicesData.devices.length === 0) && (
                      <Text style={[styles.emptyText, { color: nucleus.light.global.blue["60"] }]}>
                        No devices found. Open Spotify on any device to see it here.
                      </Text>
                    )}
                  </View>
                )}
              </Card.Content>
            </Card>

            {/* API Demo Section */}
            <Card style={[styles.card, { backgroundColor: nucleus.light.global.blue["10"] }]}>
              <Card.Content style={styles.cardContent}>
                <Text 
                  variant="titleLarge" 
                  style={[styles.cardTitle, { color: nucleus.light.global.blue["90"] }]}
                >
                  🔥 RTK Query Demo
                </Text>
                
                <Button
                  mode="outlined"
                  style={[styles.demoButton, { borderColor: nucleus.light.global.blue["70"] }]}
                  labelStyle={[styles.demoButtonLabel, { color: nucleus.light.global.blue["70"] }]}
                  compact={false}
                  onPress={handleSearch}
                >
                  🔍 Search "motivation workout"
                </Button>

                {/* Search Results */}
                {showSearch && (
                  <View style={styles.searchResults}>
                    <Text style={[styles.sectionTitle, { color: nucleus.light.global.blue["80"] }]}>
                      Search Results:
                    </Text>
                    {searchLoading ? (
                      <ActivityIndicator size="small" color={nucleus.light.global.blue["70"]} />
                    ) : (
                      <View style={styles.resultsList}>
                                              {searchResults?.tracks?.items?.slice(0, 3).map((track) => (
                        track && track.id && track.name ? (
                          <Text 
                            key={track.id} 
                            style={[styles.resultItem, { color: nucleus.light.global.blue["70"] }]}
                          >
                            🎵 {track.name} - {track.artists?.[0]?.name || 'Unknown Artist'}
                          </Text>
                        ) : null
                      )) || []}
                      </View>
                    )}
                  </View>
                )}

                <Divider style={styles.divider} />

                {/* Top Tracks */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: nucleus.light.global.blue["80"] }]}>
                    🎯 Your Top Tracks (This Month):
                  </Text>
                  {topTracksLoading ? (
                    <ActivityIndicator size="small" color={nucleus.light.global.blue["70"]} />
                  ) : (
                    <View style={styles.resultsList}>
                      {topTracks?.items?.slice(0, 3).map((track) => (
                        track && track.id && track.name ? (
                          <Text 
                            key={track.id} 
                            style={[styles.resultItem, { color: nucleus.light.global.blue["70"] }]}
                          >
                            🎵 {track.name} - {track.artists?.[0]?.name || 'Unknown Artist'}
                          </Text>
                        ) : null
                      )) || []}
                    </View>
                  )}
                </View>

                {/* Top Artists */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: nucleus.light.global.blue["80"] }]}>
                    🎤 Your Top Artists (This Month):
                  </Text>
                  {topArtistsLoading ? (
                    <ActivityIndicator size="small" color={nucleus.light.global.blue["70"]} />
                  ) : (
                    <View style={styles.resultsList}>
                      {topArtists?.items?.slice(0, 3).map((artist) => (
                        artist && artist.id && artist.name ? (
                          <Text 
                            key={artist.id} 
                            style={[styles.resultItem, { color: nucleus.light.global.blue["70"] }]}
                          >
                            🎤 {artist.name}
                          </Text>
                        ) : null
                      )) || []}
                    </View>
                  )}
                </View>

                {/* Recently Played */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: nucleus.light.global.blue["80"] }]}>
                    🕒 Recently Played:
                  </Text>
                  {recentLoading ? (
                    <ActivityIndicator size="small" color={nucleus.light.global.blue["70"]} />
                  ) : (
                    <View style={styles.resultsList}>
                      {recentlyPlayed?.items?.slice(0, 3).map((item, index) => (
                        item && item.track && item.track.id && item.track.name ? (
                          <Text 
                            key={`${item.track.id}-${index}`} 
                            style={[styles.resultItem, { color: nucleus.light.global.blue["70"] }]}
                          >
                            🎵 {item.track.name} - {item.track.artists?.[0]?.name || 'Unknown Artist'}
                          </Text>
                        ) : null
                      )) || []}
                    </View>
                  )}
                </View>

                {/* Workout Playlists */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: nucleus.light.global.blue["80"] }]}>
                    💪 Workout Playlists:
                  </Text>
                  {playlistsLoading ? (
                    <ActivityIndicator size="small" color={nucleus.light.global.blue["70"]} />
                  ) : (
                    <View style={styles.resultsList}>
                      {workoutPlaylists?.playlists?.items?.slice(0, 3).map((playlist) => (
                        playlist && playlist.id && playlist.name ? (
                          <Text 
                            key={playlist.id} 
                            style={[styles.resultItem, { color: nucleus.light.global.blue["70"] }]}
                          >
                            📝 {playlist.name} ({playlist.tracks?.total || 0} tracks)
                          </Text>
                        ) : null
                      )) || []}
                    </View>
                  )}
                </View>
              </Card.Content>
            </Card>
          </>
        )}
      </ScrollView>

      {/* Spotify Connect Modal */}
      <SpotifyConnectModal
        visible={spotifyConnect.showModal}
        onDismiss={spotifyConnect.closeModal}
        onNotNow={spotifyConnect.closeModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 8,
    includeFontPadding: false,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    textAlign: 'center',
    includeFontPadding: false,
  },
  card: {
    borderRadius: 16,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 20,
    marginBottom: 8,
    includeFontPadding: false,
  },
  cardDescription: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    includeFontPadding: false,
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
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  profileInfo: {
    flex: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  chip: {
    height: 32,
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
  devicesList: {
    gap: 12,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  deviceName: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    flex: 1,
    includeFontPadding: false,
  },
  deviceChips: {
    flexDirection: 'row',
    gap: 6,
  },
  smallChip: {
    height: 28,
  },
  emptyText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    includeFontPadding: false,
  },
  demoButton: {
    borderRadius: 24,
    minHeight: 40,
    marginBottom: 16,
  },
  demoButtonLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    lineHeight: 18,
    marginVertical: 0,
    includeFontPadding: false,
  },
  searchResults: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    marginBottom: 8,
    includeFontPadding: false,
  },
  resultsList: {
    gap: 6,
  },
  resultItem: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    lineHeight: 20,
    includeFontPadding: false,
  },
  divider: {
    marginVertical: 16,
  },
});
