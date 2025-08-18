import { createAsyncThunk } from '@reduxjs/toolkit';
import { spotifyApi } from '../api/spotifyApi';
import type { RootState } from '../index';
import { store } from '../index';
import { setSelectedAppMusic, setSelectedPlaylist } from '../slices/musicSlice';

// =============================================================================
// MUSIC NAVIGATION TOOLS - Agent Tools for Playlist Control
// =============================================================================

/**
 * Get available playlists (including user's liked songs)
 * Returns user's playlists + liked songs as options
 */
export const getPlaylists = createAsyncThunk(
  'music/getPlaylists',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const isSpotifyAuth = state.spotifyAuth.accessToken && state.spotifyAuth.user;
    
    if (!isSpotifyAuth) {
      // Return app music options (simplified for LLM)
      return {
        success: true,
        platform: 'app',
        playlists: [
          { id: 'beast-mode', name: 'Beast Mode', tracks: 25 },
          { id: 'sweet-session', name: 'Sweet Session', tracks: 18 },
          { id: 'feel', name: 'Feel', tracks: 22 }
        ]
      };
    }
    
    try {
      // Get user's playlists
      const userPlaylists = store.dispatch(
        spotifyApi.endpoints.getUserPlaylists.initiate({ limit: 50 })
      );
      
      const playlistsResult = await userPlaylists.unwrap();
      
      // Create playlists array with liked songs first
      const username = state.spotifyAuth.user?.id;
      const likedSongsUri = username ? `spotify:user:${username}:collection` : 'spotify:collection:tracks';
      
      const playlists = [
        {
          id: 'liked',
          name: 'Liked Songs',
          description: 'Your liked songs collection',
          images: [{ url: '', height: 300, width: 300 }],
          tracks: { total: 0 }, // We'll get count when selected
          uri: likedSongsUri
        },
        ...playlistsResult.items.map(playlist => ({
          id: playlist.id,
          name: playlist.name,
          description: playlist.description || '',
          images: playlist.images,
          tracks: playlist.tracks,
          uri: playlist.uri
        }))
      ];
      
      // Return simplified playlist data for LLM efficiency
      const simplifiedPlaylists = playlists.map(playlist => ({
        id: playlist.id,
        name: playlist.name,
        tracks: playlist.tracks?.total || 0
      }));
      
      return {
        success: true,
        platform: 'spotify',
        playlists: simplifiedPlaylists,
        total: simplifiedPlaylists.length
      };
      
    } catch (error: any) {
      return rejectWithValue({
        message: "Failed to get playlists",
        error: error.data?.enhancedMessage || error.message
      });
    }
  }
);

/**
 * Select a playlist to be the active one
 * Sets the playlist that will be used for navigation
 */
// Simple fuzzy matching helper
const fuzzyMatch = (searchTerm: string, targetName: string): number => {
  const search = searchTerm.toLowerCase().trim();
  const target = targetName.toLowerCase();
  
  // Exact match
  if (target === search) return 100;
  
  // Starts with
  if (target.startsWith(search)) return 90;
  
  // Contains
  if (target.includes(search)) return 80;
  
  // Word match
  const searchWords = search.split(' ');
  const targetWords = target.split(' ');
  let matchScore = 0;
  
  for (const searchWord of searchWords) {
    for (const targetWord of targetWords) {
      if (targetWord.startsWith(searchWord)) {
        matchScore += 70;
      } else if (targetWord.includes(searchWord)) {
        matchScore += 50;
      }
    }
  }
  
  return Math.min(matchScore, 75); // Cap word matches
};

export const selectPlaylist = createAsyncThunk(
  'music/selectPlaylist',
  async ({ playlistId }: { playlistId: string }, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState;
    const isSpotifyAuth = state.spotifyAuth.accessToken && state.spotifyAuth.user;
    
    if (!isSpotifyAuth) {
      // Handle app music selection
      const appMusicMap = {
        'beast-mode': 'Beast Mode',
        'sweet-session': 'Sweet Session',
        'feel': 'Feel'
      };
      
      const selectedName = appMusicMap[playlistId as keyof typeof appMusicMap];
      if (selectedName) {
        dispatch(setSelectedAppMusic(playlistId));
        return {
          success: true,
          platform: 'app',
          playlist: selectedName,
          message: `Selected ${selectedName} app music`
        };
      } else {
        return rejectWithValue({ message: "Invalid app music selection" });
      }
    }
    
    try {
      let targetPlaylistId = playlistId;
      
      // Special case: liked songs
      if (playlistId === 'liked' || playlistId.toLowerCase().includes('liked')) {
        const username = state.spotifyAuth.user?.id;
        const likedSongsUri = username ? `spotify:user:${username}:collection` : 'spotify:collection:tracks';
        
        dispatch(setSelectedPlaylist({
          id: 'liked',
          name: 'Liked Songs',
          description: 'Your liked songs collection',
          images: [{ url: '', height: 300, width: 300 }],
          tracks: { total: 0 },
          uri: likedSongsUri
        }));
        
        return {
          success: true,
          platform: 'spotify',
          playlist: 'Liked Songs',
          message: 'Selected your liked songs'
        };
      }
      
      // If playlistId is not a valid Spotify ID, try fuzzy matching
      if (!playlistId.match(/^[0-9A-Za-z]{22}$/)) {
        // Get user playlists for fuzzy matching
        const playlistsResult = store.dispatch(spotifyApi.endpoints.getUserPlaylists.initiate({ limit: 50 }));
        const playlists = await playlistsResult.unwrap();
        
        const allPlaylists = [
          { id: 'liked', name: 'Liked Songs' },
          ...playlists.items.map(p => ({ id: p.id, name: p.name }))
        ];
        
        // Find best match
        let bestMatch = null;
        let bestScore = 0;
        
        for (const playlist of allPlaylists) {
          const score = fuzzyMatch(playlistId, playlist.name);
          if (score > bestScore && score >= 50) { // Minimum match threshold
            bestScore = score;
            bestMatch = playlist;
          }
        }
        
        if (bestMatch) {
          targetPlaylistId = bestMatch.id;
          
          // Handle liked songs if matched
          if (targetPlaylistId === 'liked') {
            const username = state.spotifyAuth.user?.id;
            const likedSongsUri = username ? `spotify:user:${username}:collection` : 'spotify:collection:tracks';
            
            dispatch(setSelectedPlaylist({
              id: 'liked',
              name: 'Liked Songs',
              description: 'Your liked songs collection',
              images: [{ url: '', height: 300, width: 300 }],
              tracks: { total: 0 },
              uri: likedSongsUri
            }));
            
            return {
              success: true,
              platform: 'spotify',
              playlist: 'Liked Songs',
              message: `Found and selected your liked songs (matched "${playlistId}")`
            };
          }
        } else {
          return rejectWithValue({
            message: `No playlist found matching "${playlistId}". Try being more specific or use exact playlist name.`
          });
        }
      }
      
      // Get specific playlist details
      const playlistResult = store.dispatch(
        spotifyApi.endpoints.getPlaylist.initiate(targetPlaylistId)
      );
      
      const playlist = await playlistResult.unwrap();
      
      dispatch(setSelectedPlaylist({
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        images: playlist.images,
        tracks: playlist.tracks,
        uri: playlist.uri
      }));
      
      const matchMessage = targetPlaylistId !== playlistId ? ` (matched "${playlistId}")` : '';
      
      return {
        success: true,
        platform: 'spotify',
        playlist: playlist.name,
        tracks: playlist.tracks.total,
        message: `Selected "${playlist.name}" with ${playlist.tracks.total} tracks${matchMessage}`
      };
      
    } catch (error: any) {
      return rejectWithValue({
        message: "Failed to select playlist",
        error: error.data?.enhancedMessage || error.message
      });
    }
  }
);

/**
 * Get tracks from the currently selected playlist
 * Returns track list for agent to choose from
 */
export const getTracks = createAsyncThunk(
  'music/getTracks',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const isSpotifyAuth = state.spotifyAuth.accessToken && state.spotifyAuth.user;
    const selectedPlaylist = state.music.selectedPlaylist;
    const selectedMusicOption = state.music.selectedMusicOption;
    
    if (!selectedPlaylist && selectedMusicOption !== 'app') {
      return rejectWithValue({ message: "No playlist selected" });
    }
    
    if (!isSpotifyAuth || selectedMusicOption === 'app') {
      // Return app music "tracks"
      const selectedApp = state.music.selectedAppMusic || 'sweet-session';
      return {
        success: true,
        platform: 'app',
        tracks: [
          { 
            id: selectedApp, 
            name: selectedApp.charAt(0).toUpperCase() + selectedApp.slice(1).replace('-', ' '),
            artist: 'Buddy App Music',
            duration: '3:30'
          }
        ],
        currentPlaylist: selectedApp
      };
    }
    
    try {
      if (selectedPlaylist?.id === 'liked') {
        // Get ALL liked songs (cached for 1 hour)
        const likedSongs = store.dispatch(
          spotifyApi.endpoints.getLikedSongs.initiate()
        );
        
        const result = await likedSongs.unwrap();
        
        const tracks = result.items.map((item, index) => ({
          id: item.track.id,
          name: item.track.name,
          artist: item.track.artists[0]?.name || 'Unknown',
          duration: formatDuration(item.track.duration_ms),
          uri: item.track.uri,
          index: index
        }));
        
        return {
          success: true,
          platform: 'spotify',
          tracks: tracks,
          currentPlaylist: 'Liked Songs',
          total: tracks.length
        };
      } else if (selectedPlaylist) {
        // Get playlist tracks
        const playlistTracks = store.dispatch(
          spotifyApi.endpoints.getPlaylist.initiate(selectedPlaylist.id)
        );
        
        const result = await playlistTracks.unwrap();
        
        const tracks = result.tracks.items?.map((item, index) => ({
          id: item.track.id,
          name: item.track.name,
          artist: item.track.artists[0]?.name || 'Unknown',
          duration: formatDuration(item.track.duration_ms),
          uri: item.track.uri,
          index: index
        })) || [];
        
        return {
          success: true,
          platform: 'spotify',
          tracks: tracks,
          currentPlaylist: selectedPlaylist.name,
          total: tracks.length
        };
      } else {
        return rejectWithValue({ message: "No valid playlist selected" });
      }
      
    } catch (error: any) {
      return rejectWithValue({
        message: "Failed to get tracks",
        error: error.data?.enhancedMessage || error.message
      });
    }
  }
);

/**
 * Play a specific track from the current playlist
 */
export const playTrack = createAsyncThunk(
  'music/playTrack',
  async ({ trackUri, trackIndex, trackName }: { trackUri?: string; trackIndex?: number; trackName?: string }, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const isSpotifyAuth = state.spotifyAuth.accessToken && state.spotifyAuth.user;
    const selectedPlaylist = state.music.selectedPlaylist;
    const selectedMusicOption = state.music.selectedMusicOption;
    
    if (!isSpotifyAuth || selectedMusicOption === 'app') {
      return {
        success: true,
        platform: 'app',
        message: 'Playing app music (track control not available)'
      };
    }
    
    try {
      // Handle track name search with fuzzy matching
      if (trackName) {
        if (!selectedPlaylist) {
          return rejectWithValue({ message: "No playlist selected for track search" });
        }

        // Get current playlist tracks to search
        let tracks: any[] = [];
        
        if (selectedPlaylist.id === 'liked') {
          // Get ALL liked songs (cached for 1 hour)
          const likedSongs = store.dispatch(
            spotifyApi.endpoints.getLikedSongs.initiate()
          );
          const result = await likedSongs.unwrap();
          
          tracks = result.items.map((item, index) => ({
            id: item.track.id,
            name: item.track.name,
            artist: item.track.artists[0]?.name || 'Unknown',
            uri: item.track.uri,
            index: index
          }));
        } else {
          // Get playlist tracks
          const playlistTracks = store.dispatch(
            spotifyApi.endpoints.getPlaylist.initiate(selectedPlaylist.id)
          );
          const result = await playlistTracks.unwrap();
          tracks = result.tracks.items?.map((item, index) => ({
            id: item.track.id,
            name: item.track.name,
            artist: item.track.artists[0]?.name || 'Unknown',
            uri: item.track.uri,
            index: index
          })) || [];
        }

        // Fuzzy search for track
        const searchTerm = trackName.toLowerCase();
        const matchedTrack = tracks.find(track => 
          track.name.toLowerCase().includes(searchTerm) ||
          track.artist.toLowerCase().includes(searchTerm) ||
          `${track.name} ${track.artist}`.toLowerCase().includes(searchTerm)
        );

        if (!matchedTrack) {
          return rejectWithValue({ 
            message: `Track "${trackName}" not found in ${selectedPlaylist.name}` 
          });
        }

        // Play the matched track at its position in the playlist
        if (selectedPlaylist.id === 'liked') {
          const playLikedSongs = store.dispatch(
            spotifyApi.endpoints.startPlayback.initiate({
              context_uri: selectedPlaylist.uri,
              offset: { position: matchedTrack.index }
            })
          );
          await playLikedSongs.unwrap();
        } else {
          const playPlaylist = store.dispatch(
            spotifyApi.endpoints.startPlayback.initiate({
              context_uri: `spotify:playlist:${selectedPlaylist.id}`,
              offset: { position: matchedTrack.index }
            })
          );
          await playPlaylist.unwrap();
        }

        return {
          success: true,
          platform: 'spotify',
          track: matchedTrack.name,
          artist: matchedTrack.artist,
          playlist: selectedPlaylist.name,
          message: `Playing "${matchedTrack.name}" by ${matchedTrack.artist}`
        };
      } else if (trackUri) {
        // Play specific track by URI
        const playTrack = store.dispatch(
          spotifyApi.endpoints.playTrack.initiate({ trackUri })
        );
        
        await playTrack.unwrap();
        
        return {
          success: true,
          platform: 'spotify',
          message: 'Playing selected track'
        };
      } else if (selectedPlaylist) {
        // Play playlist from beginning or specific index
        if (selectedPlaylist.id === 'liked') {
          // For Liked Songs, use the direct context URI
          const playLikedSongs = store.dispatch(
            spotifyApi.endpoints.startPlayback.initiate({
              context_uri: selectedPlaylist.uri // This is now spotify:user:<username>:collection
            })
          );
          await playLikedSongs.unwrap();
        } else {
          // For regular playlists
          const playPlaylist = store.dispatch(
            spotifyApi.endpoints.playPlaylist.initiate({
              playlistId: selectedPlaylist.id
            })
          );
          await playPlaylist.unwrap();
        }
        
        return {
          success: true,
          platform: 'spotify',
          playlist: selectedPlaylist.name,
          message: `Playing "${selectedPlaylist.name}"`
        };
      } else {
        return rejectWithValue({ message: "No track or playlist to play" });
      }
      
    } catch (error: any) {
      return rejectWithValue({
        message: "Failed to play track",
        error: error.data?.enhancedMessage || error.message
      });
    }
  }
);

/**
 * Skip to next track in playlist
 */
export const skipNext = createAsyncThunk(
  'music/skipNext',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const isSpotifyAuth = state.spotifyAuth.accessToken && state.spotifyAuth.user;
    const selectedMusicOption = state.music.selectedMusicOption;
    
    if (!isSpotifyAuth || selectedMusicOption === 'app') {
      return {
        success: true,
        platform: 'app',
        message: 'App music - skip not available'
      };
    }
    
    try {
      const nextTrack = store.dispatch(
        spotifyApi.endpoints.nextTrack.initiate({})
      );
      
      await nextTrack.unwrap();
      
      return {
        success: true,
        platform: 'spotify',
        message: 'Skipped to next track'
      };
      
    } catch (error: any) {
      return rejectWithValue({
        message: "Failed to skip track",
        error: error.data?.enhancedMessage || error.message
      });
    }
  }
);

/**
 * Skip to previous track in playlist
 */
export const skipPrevious = createAsyncThunk(
  'music/skipPrevious',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const isSpotifyAuth = state.spotifyAuth.accessToken && state.spotifyAuth.user;
    const selectedMusicOption = state.music.selectedMusicOption;
    
    if (!isSpotifyAuth || selectedMusicOption === 'app') {
      return {
        success: true,
        platform: 'app',
        message: 'App music - previous track not available'
      };
    }
    
    try {
      const previousTrack = store.dispatch(
        spotifyApi.endpoints.previousTrack.initiate({})
      );
      
      await previousTrack.unwrap();
      
      return {
        success: true,
        platform: 'spotify',
        message: 'Skipped to previous track'
      };
      
    } catch (error: any) {
      return rejectWithValue({
        message: "Failed to skip to previous track",
        error: error.data?.enhancedMessage || error.message
      });
    }
  }
);

/**
 * Pause current playback
 */
export const pauseMusic = createAsyncThunk(
  'music/pauseMusic',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const isSpotifyAuth = state.spotifyAuth.accessToken && state.spotifyAuth.user;
    const selectedMusicOption = state.music.selectedMusicOption;
    
    if (!isSpotifyAuth || selectedMusicOption === 'app') {
      return {
        success: true,
        platform: 'app',
        message: 'App music paused'
      };
    }
    
    try {
      const pauseMusic = store.dispatch(
        spotifyApi.endpoints.pauseMusic.initiate({})
      );
      
      await pauseMusic.unwrap();
      
      return {
        success: true,
        platform: 'spotify',
        message: 'Music paused'
      };
      
    } catch (error: any) {
      return rejectWithValue({
        message: "Failed to pause music",
        error: error.data?.enhancedMessage || error.message
      });
    }
  }
);

/**
 * Resume current playback
 */
export const resumeMusic = createAsyncThunk(
  'music/resumeMusic',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const isSpotifyAuth = state.spotifyAuth.accessToken && state.spotifyAuth.user;
    const selectedMusicOption = state.music.selectedMusicOption;
    
    if (!isSpotifyAuth || selectedMusicOption === 'app') {
      return {
        success: true,
        platform: 'app',
        message: 'App music resumed'
      };
    }
    
    try {
      const playMusic = store.dispatch(
        spotifyApi.endpoints.playMusic.initiate({})
      );
      
      await playMusic.unwrap();
      
      return {
        success: true,
        platform: 'spotify',
        message: 'Music resumed'
      };
      
    } catch (error: any) {
      return rejectWithValue({
        message: "Failed to resume music",
        error: error.data?.enhancedMessage || error.message
      });
    }
  }
);

/**
 * Set volume (0-100)
 */
export const setVolume = createAsyncThunk(
  'music/setVolume',
  async ({ volume }: { volume: number }, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const isSpotifyAuth = state.spotifyAuth.accessToken && state.spotifyAuth.user;
    const selectedMusicOption = state.music.selectedMusicOption;
    
    const clampedVolume = Math.max(0, Math.min(100, volume));
    
    if (!isSpotifyAuth || selectedMusicOption === 'app') {
      return {
        success: true,
        platform: 'app',
        volume: clampedVolume,
        message: `App music volume set to ${clampedVolume}%`
      };
    }
    
    try {
      const setVolume = store.dispatch(
        spotifyApi.endpoints.setVolume.initiate({
          volumePercent: clampedVolume
        })
      );
      
      await setVolume.unwrap();
      
      return {
        success: true,
        platform: 'spotify',
        volume: clampedVolume,
        message: `Volume set to ${clampedVolume}%`
      };
      
    } catch (error: any) {
      return rejectWithValue({
        message: "Failed to set volume",
        error: error.data?.enhancedMessage || error.message
      });
    }
  }
);

/**
 * Get current music status
 */
export const getMusicStatus = createAsyncThunk(
  'music/getMusicStatus',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const isSpotifyAuth = state.spotifyAuth.accessToken && state.spotifyAuth.user;
    const selectedMusicOption = state.music.selectedMusicOption;
    const selectedPlaylist = state.music.selectedPlaylist;
    
    if (!isSpotifyAuth || selectedMusicOption === 'app') {
      const selectedApp = state.music.selectedAppMusic || 'sweet-session';
      return {
        success: true,
        platform: 'app',
        isPlaying: true,
        currentTrack: selectedApp.charAt(0).toUpperCase() + selectedApp.slice(1).replace('-', ' '),
        artist: 'Buddy App Music',
        playlist: selectedApp
      };
    }
    
    try {
      const playbackState = store.dispatch(
        spotifyApi.endpoints.getCurrentPlaybackState.initiate()
      );
      
      const result = await playbackState.unwrap();
      
      if (result) {
        return {
          success: true,
          platform: 'spotify',
          isPlaying: result.is_playing,
          currentTrack: result.item?.name || 'Unknown',
          artist: result.item?.artists?.[0]?.name || 'Unknown',
          progress: result.progress_ms || 0,
          duration: result.item?.duration_ms || 0,
          volume: result.device?.volume_percent || 50,
          playlist: selectedPlaylist?.name || 'Unknown Playlist'
        };
      } else {
        return {
          success: true,
          platform: 'spotify',
          isPlaying: false,
          message: 'No active playback',
          playlist: selectedPlaylist?.name || 'No playlist selected'
        };
      }
      
    } catch (error: any) {
      return rejectWithValue({
        message: "Failed to get music status",
        error: error.data?.enhancedMessage || error.message
      });
    }
  }
);

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}