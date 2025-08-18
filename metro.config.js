const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add path alias resolver
config.resolver.alias = {
  '@': path.resolve(__dirname, './'),
};

// Exclude WebRTC packages for web platform
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Platform-specific resolver
const originalResolverResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && (
    moduleName.includes('@livekit/react-native-webrtc') ||
    moduleName.includes('@livekit/react-native') ||
    moduleName.includes('react-native-webrtc')
  )) {
    // Return a mock module for web
    return {
      filePath: path.resolve(__dirname, 'web-mock.js'),
      type: 'sourceFile',
    };
  }
  
  if (originalResolverResolveRequest) {
    return originalResolverResolveRequest(context, moduleName, platform);
  }
  
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config; 