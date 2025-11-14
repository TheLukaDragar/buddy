import { SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function SplashScreenController() {
  console.log('🎨 [SPLASH] SplashScreenController rendering');
  const { loading } = useAuth();
  console.log('🎨 [SPLASH] Auth loading state:', loading);

  useEffect(() => {
    console.log('🎨 [SPLASH] useEffect - loading changed:', loading);
    if (!loading) {
      console.log('🎨 [SPLASH] Hiding splash screen');
      SplashScreen.hideAsync().then(() => {
        console.log('🎨 [SPLASH] Splash screen hidden');
      }).catch((error) => {
        console.error('🎨 [SPLASH] Error hiding splash screen:', error);
      });
    } else {
      console.log('🎨 [SPLASH] Still loading, keeping splash screen visible');
    }
  }, [loading]);

  return null;
} 