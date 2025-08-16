import { PermissionsAndroid, Platform } from 'react-native';

export const useMicrophonePermission = () => {
  const requestMicrophonePermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs microphone access to enable voice conversations with AI agents.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Error requesting microphone permission:', err);
        return false;
      }
    }
    
    // iOS permissions are handled automatically by the system
    // when the user tries to use the microphone
    return true;
  };

  const checkMicrophonePermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        return granted;
      } catch (err) {
        console.warn('Error checking microphone permission:', err);
        return false;
      }
    }
    
    // For iOS, we assume permission is available
    // The system will prompt the user when needed
    return true;
  };

  return {
    requestMicrophonePermission,
    checkMicrophonePermission,
  };
}; 