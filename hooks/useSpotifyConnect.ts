import { useState } from 'react';
import { useSpotifyAuth } from './useSpotifyAuth';

/**
 * Hook for managing Spotify connection modal state and actions
 * This can be used anywhere in the app to trigger the Spotify connection flow
 */
export const useSpotifyConnect = () => {
  const [showModal, setShowModal] = useState(false);
  const { isAuthenticated, login, logout, loading, error, user } = useSpotifyAuth();

  const openConnectModal = () => {
    if (!isAuthenticated) {
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleConnect = () => {
    login();
    closeModal();
  };

  const handleDisconnect = async () => {
    await logout();
  };

  return {
    // Modal state
    showModal,
    openConnectModal,
    closeModal,
    
    // Auth actions
    handleConnect,
    handleDisconnect,
    
    // Auth state
    isConnected: isAuthenticated,
    isLoading: loading,
    error,
    user,
    
    // Convenience methods
    connectOrPlay: (playAction: () => void) => {
      if (isAuthenticated) {
        playAction();
      } else {
        openConnectModal();
      }
    },
  };
};
