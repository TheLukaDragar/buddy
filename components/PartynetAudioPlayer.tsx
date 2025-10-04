import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useAppDispatch } from '../store/hooks';
import {
  setIsPlaying,
  setPosition,
  setDuration,
  nextTrack,
} from '../store/slices/fitnessPlayerSlice';

const FITNESS_BASE_URL = 'https://mod.partynet.serv.si';

/**
 * Global Partynet Audio Player
 * Handles actual audio playback for Partynet music
 * Lives in the background and responds to Redux state changes
 */
export default function PartynetAudioPlayer() {
  const dispatch = useAppDispatch();

  // Redux state
  const provider = useSelector((state: RootState) => state.music.selectedMusicOption);
  const token = useSelector((state: RootState) => state.fitnessPlayer.token);
  const currentTrack = useSelector((state: RootState) => state.fitnessPlayer.currentTrack);
  const isPlaying = useSelector((state: RootState) => state.fitnessPlayer.isPlaying);
  const volume = useSelector((state: RootState) => state.fitnessPlayer.volume);

  // Create audio player instance
  const player = useAudioPlayer();
  const playerStatus = useAudioPlayerStatus(player);

  // Track current loaded track to avoid reloading same track
  const currentLoadedTrackUrl = useRef<string | null>(null);

  // Update volume when Redux volume changes
  useEffect(() => {
    if (player && playerStatus.isLoaded) {
      // Volume is stored as 0-1 in Redux
      player.volume = volume;
      console.log('[PartynetAudioPlayer] Volume updated to:', volume);
    }
  }, [volume, playerStatus.isLoaded]);

  // Load track when currentTrack changes
  useEffect(() => {
    if (provider !== 'partynet' || !currentTrack || !token) {
      return;
    }

    const trackUrl = `${FITNESS_BASE_URL}/${currentTrack.url}`;

    // Load new track if different from current
    if (trackUrl !== currentLoadedTrackUrl.current) {
      console.log('[PartynetAudioPlayer] Loading new track:', currentTrack.title);

      player.replace({
        uri: trackUrl,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      currentLoadedTrackUrl.current = trackUrl;
    }
  }, [provider, currentTrack, token]);

  // Handle play/pause based on Redux state (separate effect to avoid loops)
  useEffect(() => {
    if (provider !== 'partynet' || !playerStatus.isLoaded) {
      return;
    }

    if (isPlaying && !playerStatus.playing) {
      console.log('[PartynetAudioPlayer] Starting playback');
      player.play();
    } else if (!isPlaying && playerStatus.playing) {
      console.log('[PartynetAudioPlayer] Pausing playback');
      player.pause();
    }
  }, [provider, isPlaying, playerStatus.isLoaded]);

  // Sync position and duration to Redux
  useEffect(() => {
    if (playerStatus.isLoaded) {
      dispatch(setPosition(playerStatus.currentTime || 0));
      dispatch(setDuration(playerStatus.duration || 0));
    }
  }, [playerStatus.currentTime, playerStatus.duration, playerStatus.isLoaded]);

  // Handle track completion - auto-advance to next track
  useEffect(() => {
    if (playerStatus.isLoaded && !playerStatus.playing && playerStatus.duration > 0 &&
        playerStatus.currentTime >= playerStatus.duration - 0.5) {
      console.log('[PartynetAudioPlayer] Track finished, advancing to next');
      dispatch(nextTrack());
    }
  }, [playerStatus.isLoaded, playerStatus.playing, playerStatus.currentTime, playerStatus.duration]);

  // Don't sync playing state back to Redux - this creates loops
  // Redux controls the player, not the other way around

  // This component doesn't render anything - it just manages audio playback
  return null;
}
