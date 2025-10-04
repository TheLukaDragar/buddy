import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Track {
  title: string;
  artist: string;
  genre: string;
  length: number;
  url: string;
  bitrate: string;
  energyLevel: string;
  bpm: number;
}

interface PlayerState {
  token: string | null;
  tokenExpiresAt: number | null;
  playlist: Track[];
  currentTrack: Track | null;
  currentTrackIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  position: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: 'off' | 'one' | 'all';
  error: string | null;
  // Mix parameters for easy re-fetching
  lastMixRequest: {
    topHits: boolean;
    explicitSongs: boolean;
    mixParameters: Array<{
      genre: string;
      style: string;
      percentage: number;
      energyLevel?: string;
      timePeriod?: string;
      bpm?: string;
    }>;
  } | null;
}

const initialState: PlayerState = {
  token: null,
  tokenExpiresAt: null,
  playlist: [],
  currentTrack: null,
  currentTrackIndex: -1,
  isPlaying: false,
  isLoading: false,
  position: 0,
  duration: 0,
  volume: 1.0,
  shuffle: false,
  repeat: 'off',
  error: null,
  lastMixRequest: null,
};

const fitnessPlayerSlice = createSlice({
  name: 'fitnessPlayer',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<{ token: string; expiresIn: number }>) {
      state.token = action.payload.token;
      state.tokenExpiresAt = Date.now() + (action.payload.expiresIn * 1000);
      state.error = null;
    },
    clearToken(state) {
      state.token = null;
      state.tokenExpiresAt = null;
    },
    setPlaylist(state, action: PayloadAction<Track[]>) {
      state.playlist = action.payload;
      state.currentTrackIndex = action.payload.length > 0 ? 0 : -1;
      state.currentTrack = action.payload.length > 0 ? action.payload[0] : null;
    },
    setCurrentTrack(state, action: PayloadAction<{ track: Track | null; index: number }>) {
      state.currentTrack = action.payload.track;
      state.currentTrackIndex = action.payload.index;
    },
    setIsPlaying(state, action: PayloadAction<boolean>) {
      state.isPlaying = action.payload;
    },
    setIsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setPosition(state, action: PayloadAction<number>) {
      state.position = action.payload;
    },
    setDuration(state, action: PayloadAction<number>) {
      state.duration = action.payload;
    },
    setVolume(state, action: PayloadAction<number>) {
      state.volume = Math.max(0, Math.min(1, action.payload));
    },
    setShuffle(state, action: PayloadAction<boolean>) {
      state.shuffle = action.payload;
    },
    setRepeat(state, action: PayloadAction<'off' | 'one' | 'all'>) {
      state.repeat = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    nextTrack(state) {
      if (state.playlist.length === 0) return;
      
      let nextIndex: number;
      if (state.shuffle) {
        // Random next track (excluding current)
        const availableIndices = state.playlist
          .map((_, index) => index)
          .filter(index => index !== state.currentTrackIndex);
        nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)] || 0;
      } else {
        nextIndex = (state.currentTrackIndex + 1) % state.playlist.length;
      }
      
      state.currentTrackIndex = nextIndex;
      state.currentTrack = state.playlist[nextIndex];
      state.position = 0;
    },
    previousTrack(state) {
      if (state.playlist.length === 0) return;
      
      let prevIndex: number;
      if (state.shuffle) {
        // Random previous track (excluding current)
        const availableIndices = state.playlist
          .map((_, index) => index)
          .filter(index => index !== state.currentTrackIndex);
        prevIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)] || 0;
      } else {
        prevIndex = state.currentTrackIndex - 1;
        if (prevIndex < 0) prevIndex = state.playlist.length - 1;
      }
      
      state.currentTrackIndex = prevIndex;
      state.currentTrack = state.playlist[prevIndex];
      state.position = 0;
    },
    playTrackAtIndex(state, action: PayloadAction<number>) {
      const index = action.payload;
      if (index >= 0 && index < state.playlist.length) {
        state.currentTrackIndex = index;
        state.currentTrack = state.playlist[index];
        state.position = 0;
      }
    },
    setLastMixRequest(state, action: PayloadAction<PlayerState['lastMixRequest']>) {
      state.lastMixRequest = action.payload;
    },
    reset(state) {
      return { ...initialState, token: state.token, tokenExpiresAt: state.tokenExpiresAt };
    },
  },
});

export const {
  setToken,
  clearToken,
  setPlaylist,
  setCurrentTrack,
  setIsPlaying,
  setIsLoading,
  setPosition,
  setDuration,
  setVolume,
  setShuffle,
  setRepeat,
  setError,
  nextTrack,
  previousTrack,
  playTrackAtIndex,
  setLastMixRequest,
  reset,
} = fitnessPlayerSlice.actions;

// Selectors for use in music actions
export const selectPartynetToken = (state: { fitnessPlayer: PlayerState }) => state.fitnessPlayer.token;
export const selectPartynetPlaylist = (state: { fitnessPlayer: PlayerState }) => state.fitnessPlayer.playlist;
export const selectPartynetCurrentTrack = (state: { fitnessPlayer: PlayerState }) => state.fitnessPlayer.currentTrack;
export const selectPartynetIsPlaying = (state: { fitnessPlayer: PlayerState }) => state.fitnessPlayer.isPlaying;
export const selectPartynetVolume = (state: { fitnessPlayer: PlayerState }) => state.fitnessPlayer.volume;
export const selectPartynetPosition = (state: { fitnessPlayer: PlayerState }) => state.fitnessPlayer.position;
export const selectPartynetDuration = (state: { fitnessPlayer: PlayerState }) => state.fitnessPlayer.duration;

export default fitnessPlayerSlice.reducer;

