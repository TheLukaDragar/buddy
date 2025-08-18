import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    clearMusicSelection,
    restoreLastUsedMusic,
    SelectedPlaylist,
    setMusicOption,
    setRepeat,
    setSelectedAppMusic,
    setSelectedPlaylist,
    setShuffle,
    setVolume
} from '../store/slices/musicSlice';

/**
 * Custom hook for managing music state throughout the app
 * Provides easy access to music preferences and controls
 */
export const useMusic = () => {
  const dispatch = useAppDispatch();
  const musicState = useAppSelector(state => state.music);

  const actions = {
    // Set music source
    setMusicOption: (option: 'app' | 'spotify') => dispatch(setMusicOption(option)),
    
    // Set selected content
    setSelectedPlaylist: (playlist: SelectedPlaylist) => dispatch(setSelectedPlaylist(playlist)),
    setSelectedAppMusic: (music: string) => dispatch(setSelectedAppMusic(music)),
    
    // Playback controls
    setVolume: (volume: number) => dispatch(setVolume(volume)),
    setShuffle: (shuffle: boolean) => dispatch(setShuffle(shuffle)),
    setRepeat: (repeat: 'off' | 'track' | 'context') => dispatch(setRepeat(repeat)),
    
    // Utility actions
    restoreLastUsedMusic: () => dispatch(restoreLastUsedMusic()),
    clearMusicSelection: () => dispatch(clearMusicSelection()),
  };

  return {
    // State
    ...musicState,
    
    // Actions
    ...actions,
    
    // Computed values
    hasSelection: !!(musicState.selectedPlaylist || musicState.selectedAppMusic),
    isSpotifySelected: musicState.selectedMusicOption === 'spotify',
    isAppMusicSelected: musicState.selectedMusicOption === 'app',
    currentSelectionName: musicState.selectedPlaylist?.name || musicState.selectedAppMusic || null,
  };
};

export default useMusic;
