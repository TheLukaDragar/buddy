import Constants from 'expo-constants';

export const generateAPIUrl = (relativePath: string) => {
  const origin = Constants.experienceUrl?.replace('exp://', 'http://') || 'http://localhost:8081';
  
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  
  return `${origin}${path}`;
}; 