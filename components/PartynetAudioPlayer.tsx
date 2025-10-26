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
  updateTrackUrl,
  setError,
} from '../store/slices/fitnessPlayerSlice';
import { useGetMixMutation } from '../store/api/fitnessApi';

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
  const currentTrackIndex = useSelector((state: RootState) => state.fitnessPlayer.currentTrackIndex);
  const isPlaying = useSelector((state: RootState) => state.fitnessPlayer.isPlaying);
  const volume = useSelector((state: RootState) => state.fitnessPlayer.volume);
  const playCount = useSelector((state: RootState) => state.fitnessPlayer.playCount);
  const lastMixRequest = useSelector((state: RootState) => state.fitnessPlayer.lastMixRequest);

  // API hooks
  const [getMix] = useGetMixMutation();

  // Create audio player instance
  const player = useAudioPlayer();
  const playerStatus = useAudioPlayerStatus(player);

  // Track current loaded track to detect when to reload
  const currentLoadedTrackUrl = useRef<string | null>(null);
  const lastPlayCount = useRef<number>(-1);
  const shouldPlayAfterLoadRef = useRef<boolean>(false);
  // Track which URLs have been used (Partynet URLs are single-use)
  const usedUrls = useRef<Set<string>>(new Set());

  // Update volume when Redux volume changes
  useEffect(() => {
    if (player && playerStatus.isLoaded) {
      // Volume is stored as 0-1 in Redux
      player.volume = volume;
      console.log('[PartynetAudioPlayer] Volume updated to:', volume);
    }
  }, [volume, playerStatus.isLoaded]);

  // Load track when currentTrack changes OR when same track is replayed (playCount changes)
  useEffect(() => {
    if (provider !== 'partynet' || !currentTrack || !token) {
      return;
    }

    const loadTrack = async () => {
      const trackUrl = `${FITNESS_BASE_URL}/${currentTrack.url}`;
      const urlWasUsed = usedUrls.current.has(currentTrack.url);

      console.log(`[PartynetAudioPlayer] loadTrack: ${currentTrack.title}, URL previously used: ${urlWasUsed}, hasLastMixRequest: ${!!lastMixRequest}`);

      // Check if URL was already used (Partynet URLs are single-use)
      if (urlWasUsed && lastMixRequest) {
        console.log('[PartynetAudioPlayer] ⚠️ URL already used (single-use), fetching new mix for fresh URL...');

        try {
          const response = await getMix(lastMixRequest).unwrap();

          // Find the same song in the new mix
          const refreshedTrack = response.find(
            (track: any) => track.title === currentTrack.title && track.artist === currentTrack.artist
          );

          if (refreshedTrack) {
            console.log('[PartynetAudioPlayer] ✅ Got fresh URL for:', currentTrack.title);
            // Update the URL in Redux
            dispatch(updateTrackUrl({ index: currentTrackIndex, newUrl: refreshedTrack.url }));
            // Remove old URL from used set, the effect will re-run with new URL
            usedUrls.current.delete(currentTrack.url);
            // The effect will re-run with the new URL
            return;
          } else {
            console.error('[PartynetAudioPlayer] Could not find track in refreshed mix');
            dispatch(setError('Failed to refresh track URL'));
            return;
          }
        } catch (error) {
          console.error('[PartynetAudioPlayer] Failed to refresh mix:', error);
          dispatch(setError('Failed to refresh track URL'));
          return;
        }
      }

      // Load track if URL changed OR if playCount changed (same track replayed)
      if (trackUrl !== currentLoadedTrackUrl.current || playCount !== lastPlayCount.current) {
        console.log('[PartynetAudioPlayer] 🎵 Loading track:', currentTrack.title);

        // Mark this URL as used (Partynet URLs are single-use)
        usedUrls.current.add(currentTrack.url);

        // Remember if we should auto-play after loading
        shouldPlayAfterLoadRef.current = isPlaying;

        // Reset position in Redux before loading new track
        dispatch(setPosition(0));
        dispatch(setDuration(0));

        player.replace({
          uri: trackUrl,
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        currentLoadedTrackUrl.current = trackUrl;
        lastPlayCount.current = playCount;
      }
    };

    loadTrack();
  }, [provider, currentTrack, token, playCount, lastMixRequest]);

  // Handle play/pause based on Redux state AND auto-play new tracks
  useEffect(() => {
    if (provider !== 'partynet' || !playerStatus.isLoaded) {
      return;
    }

    // Auto-play newly loaded track if we should be playing
    if (shouldPlayAfterLoadRef.current) {
      console.log('[PartynetAudioPlayer] Auto-playing newly loaded track');
      shouldPlayAfterLoadRef.current = false;
      // Only play if we're actually supposed to be playing
      if (isPlaying) {
        player.play();
      }
      return;
    }

    // Normal play/pause sync - only act if there's a mismatch
    if (isPlaying && !playerStatus.playing) {
      console.log('[PartynetAudioPlayer] Starting playback');
      player.play();
    } else if (!isPlaying && playerStatus.playing) {
      console.log('[PartynetAudioPlayer] Pausing playback');
      player.pause();
    }
  }, [provider, isPlaying, playerStatus.isLoaded, playerStatus.playing]);

  // Sync position and duration to Redux
  useEffect(() => {
    if (playerStatus.isLoaded) {
      dispatch(setPosition(playerStatus.currentTime || 0));
      dispatch(setDuration(playerStatus.duration || 0));
    }
  }, [playerStatus.currentTime, playerStatus.duration, playerStatus.isLoaded]);

  // Handle track completion - auto-advance to next track
  useEffect(() => {
    // Only consider track finished if:
    // 1. Track is loaded
    // 2. Not currently playing
    // 3. Has a valid duration
    // 4. Current time is near the end (within 0.5s)
    // 5. Current time is greater than 1 second (to avoid false positives on track changes)
    if (playerStatus.isLoaded &&
        !playerStatus.playing &&
        playerStatus.duration > 0 &&
        playerStatus.currentTime > 1 &&
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
