import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import SpotifyPlayerMini from './SpotifyPlayerMini';
import PartynetPlayerMini from './PartynetPlayerMini';

interface MusicPlayerMiniProps {
  onPress?: () => void;
}

/**
 * Unified Music Player Mini - automatically shows Spotify or Partynet player
 * based on the selected music provider in Redux state
 */
export default function MusicPlayerMini({ onPress }: MusicPlayerMiniProps) {
  const provider = useSelector((state: RootState) => state.music.selectedMusicOption);
  const isSpotifyAuth = useSelector((state: RootState) => state.spotifyAuth.accessToken && state.spotifyAuth.user);

  // Show Spotify player if authenticated and selected
  if (provider === 'spotify' && isSpotifyAuth) {
    return <SpotifyPlayerMini onPress={onPress} />;
  }

  // Show Partynet player if selected
  if (provider === 'partynet') {
    return <PartynetPlayerMini onPress={onPress} />;
  }

  // No player for app music
  return null;
}
