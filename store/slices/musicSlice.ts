import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SelectedPlaylist {
  id: string;
  name: string;
  description?: string;
  images?: Array<{ url: string; height: number; width: number }>;
  tracks?: {
    total: number;
  };
  uri?: string;
}

export type MusicProvider = 'app' | 'spotify' | 'partynet';

export interface PartynetMix {
  genre: string;
  style: string;
  energyLevel: string;
  timePeriod: string;
  bpm: string;
}

export interface MusicState {
  // Music source selection
  selectedMusicOption: MusicProvider;

  // Selected playlist/music
  selectedPlaylist: SelectedPlaylist | null;
  selectedAppMusic: string | null; // For app music cards like 'beast-mode', 'sweet-session', etc.
  selectedPartynetMix: PartynetMix | null; // For Partynet mix parameters

  // Playback preferences
  volume: number;
  shuffle: boolean;
  repeat: 'off' | 'track' | 'context';

  // Last used settings
  lastUsedMusicOption: MusicProvider;
  lastUsedPlaylist: SelectedPlaylist | null;
  lastUsedAppMusic: string | null;
  lastUsedPartynetMix: PartynetMix | null;

  // Mini player state
  miniPlayerVisible: boolean;
}

const initialState: MusicState = {
  selectedMusicOption: 'spotify',
  selectedPlaylist: null,
  selectedAppMusic: null,
  selectedPartynetMix: null,
  volume: 80,
  shuffle: false,
  repeat: 'off',
  lastUsedMusicOption: 'spotify',
  lastUsedPlaylist: null,
  lastUsedAppMusic: null,
  lastUsedPartynetMix: null,
  miniPlayerVisible: false,
};

const musicSlice = createSlice({
  name: 'music',
  initialState,
  reducers: {
    // Set music source (app, spotify, or partynet)
    setMusicOption: (state, action: PayloadAction<MusicProvider>) => {
      state.selectedMusicOption = action.payload;
      state.lastUsedMusicOption = action.payload;

      // Clear other selections when switching
      if (action.payload === 'app') {
        state.selectedPlaylist = null;
        state.selectedPartynetMix = null;
      } else if (action.payload === 'spotify') {
        state.selectedAppMusic = null;
        state.selectedPartynetMix = null;
      } else if (action.payload === 'partynet') {
        state.selectedAppMusic = null;
        state.selectedPlaylist = null;
      }
    },

    // Set selected Spotify playlist
    setSelectedPlaylist: (state, action: PayloadAction<SelectedPlaylist>) => {
      state.selectedPlaylist = action.payload;
      state.lastUsedPlaylist = action.payload;
      state.selectedMusicOption = 'spotify';
      state.lastUsedMusicOption = 'spotify';
      // Clear app music selection
      state.selectedAppMusic = null;
    },

    // Set selected app music
    setSelectedAppMusic: (state, action: PayloadAction<string>) => {
      state.selectedAppMusic = action.payload;
      state.lastUsedAppMusic = action.payload;
      state.selectedMusicOption = 'app';
      state.lastUsedMusicOption = 'app';
      // Clear other selections
      state.selectedPlaylist = null;
      state.selectedPartynetMix = null;
    },

    // Set selected Partynet mix
    setSelectedPartynetMix: (state, action: PayloadAction<PartynetMix>) => {
      state.selectedPartynetMix = action.payload;
      state.lastUsedPartynetMix = action.payload;
      state.selectedMusicOption = 'partynet';
      state.lastUsedMusicOption = 'partynet';
      // Clear other selections
      state.selectedPlaylist = null;
      state.selectedAppMusic = null;
    },

    // Set playback preferences
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = Math.max(0, Math.min(100, action.payload));
    },

    setShuffle: (state, action: PayloadAction<boolean>) => {
      state.shuffle = action.payload;
    },

    setRepeat: (state, action: PayloadAction<'off' | 'track' | 'context'>) => {
      state.repeat = action.payload;
    },

    // Restore last used music selection
    restoreLastUsedMusic: (state) => {
      state.selectedMusicOption = state.lastUsedMusicOption;
      if (state.lastUsedMusicOption === 'spotify' && state.lastUsedPlaylist) {
        state.selectedPlaylist = state.lastUsedPlaylist;
        state.selectedAppMusic = null;
        state.selectedPartynetMix = null;
      } else if (state.lastUsedMusicOption === 'app' && state.lastUsedAppMusic) {
        state.selectedAppMusic = state.lastUsedAppMusic;
        state.selectedPlaylist = null;
        state.selectedPartynetMix = null;
      } else if (state.lastUsedMusicOption === 'partynet' && state.lastUsedPartynetMix) {
        state.selectedPartynetMix = state.lastUsedPartynetMix;
        state.selectedPlaylist = null;
        state.selectedAppMusic = null;
      }
    },

    // Clear all selections
    clearMusicSelection: (state) => {
      state.selectedPlaylist = null;
      state.selectedAppMusic = null;
      state.selectedPartynetMix = null;
      state.selectedMusicOption = 'spotify';
    },

    // Reset music state
    resetMusicState: () => initialState,

    // Mini player visibility controls
    showMiniPlayer: (state) => {
      state.miniPlayerVisible = true;
    },

    hideMiniPlayer: (state) => {
      state.miniPlayerVisible = false;
    },

    toggleMiniPlayer: (state) => {
      state.miniPlayerVisible = !state.miniPlayerVisible;
    },
  },
});

export const {
  setMusicOption,
  setSelectedPlaylist,
  setSelectedAppMusic,
  setSelectedPartynetMix,
  setVolume,
  setShuffle,
  setRepeat,
  restoreLastUsedMusic,
  clearMusicSelection,
  resetMusicState,
  showMiniPlayer,
  hideMiniPlayer,
  toggleMiniPlayer,
} = musicSlice.actions;

// Selectors
export const selectMiniPlayerVisible = (state: { music: MusicState }) => state.music.miniPlayerVisible;

export default musicSlice.reducer;
