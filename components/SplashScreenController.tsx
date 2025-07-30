import { SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function SplashScreenController() {
  const { loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  return null;
} 