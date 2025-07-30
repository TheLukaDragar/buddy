import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getSupabase } from '../lib/supabase';
import { nucleus } from '../Buddy_variables.js';

export default function LoginCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const supabase = getSupabase();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.replace('/login');
          return;
        }

        if (data.session) {
          // Successfully authenticated, redirect to main app
          router.replace('/(tabs)');
        } else {
          // No session found, redirect to login
          router.replace('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.replace('/login');
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: nucleus.light.global.blue["20"]
    }}>
      <ActivityIndicator size="large" color={nucleus.light.global.blue["70"]} />
    </View>
  );
} 