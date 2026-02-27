const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add path alias resolver
config.resolver.alias = {
  '@': path.resolve(__dirname, './'),
};

// Exclude WebRTC packages for web platform
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Platform-specific resolver (for expo export --platform web / Expo hosting)
const originalResolverResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // For web, resolve 'react-native' to 'react-native-web' so native-only internals aren't pulled in
  if (platform === 'web' && moduleName === 'react-native') {
    return context.resolveRequest(context, 'react-native-web', platform);
  }
  // React Native has Platform.ios.js and Platform.android.js but no Platform.web.js;
  // resolve to react-native-web's Platform for web builds (fallback for direct path requires)
  if (platform === 'web' && (moduleName === '../Utilities/Platform' || moduleName.endsWith('Utilities/Platform'))) {
    return {
      filePath: require.resolve('react-native-web/dist/exports/Platform'),
      type: 'sourceFile',
    };
  }
  // React Native internals that have no web implementation; stub or shim for expo export --platform web.
  // See https://github.com/expo/expo/discussions/21736 (return { type: 'empty' } for native-only modules).
  const fromRN = context.originModulePath && context.originModulePath.includes(path.join('react-native', 'Libraries'));
  if (platform === 'web' && fromRN) {
    // Relative requires from react-native that have no .web.js: return empty so web bundle succeeds.
    const emptyForWeb = ['./RCTAlertManager', 'RCTAlertManager', './RCTNetworking', 'RCTNetworking', '../Utilities/GlobalPerformanceLogger', 'GlobalPerformanceLogger'];
    if (emptyForWeb.some((m) => moduleName === m || moduleName.endsWith(m))) {
      return { type: 'empty' };
    }
    // Map react-native Utilities/* to react-native-web exports (RN has .ios.js/.android.js, no .web.js).
    const utilitiesToRNW = {
      '../Utilities/Platform': 'Platform',
      'Utilities/Platform': 'Platform',
      '../Utilities/BackHandler': 'BackHandler',
      'Utilities/BackHandler': 'BackHandler',
    };
    const rnwExport = utilitiesToRNW[moduleName] || utilitiesToRNW[moduleName?.replace(/^\.\.\//, '')];
    if (rnwExport) {
      try {
        return {
          filePath: require.resolve(`react-native-web/dist/exports/${rnwExport}`),
          type: 'sourceFile',
        };
      } catch (_) {}
    }
    // Fallback: any ../Utilities/<Name> from RN -> try react-native-web export of that name
    const utilitiesMatch = moduleName && moduleName.match(/^\.\.\/Utilities\/(.+)$/);
    if (utilitiesMatch) {
      const name = utilitiesMatch[1];
      try {
        return {
          filePath: require.resolve(`react-native-web/dist/exports/${name}`),
          type: 'sourceFile',
        };
      } catch (_) {}
    }
    if (moduleName === '../Components/AccessibilityInfo/legacySendAccessibilityEvent' || moduleName.endsWith('legacySendAccessibilityEvent')) {
      return {
        filePath: path.resolve(__dirname, 'web-shims', 'legacySendAccessibilityEvent.js'),
        type: 'sourceFile',
      };
    }
    if (moduleName === './PlatformColorValueTypes' || moduleName.endsWith('PlatformColorValueTypes')) {
      return {
        filePath: path.resolve(__dirname, 'web-shims', 'PlatformColorValueTypes.js'),
        type: 'sourceFile',
      };
    }
    if (moduleName === './BaseViewConfig' || moduleName.endsWith('BaseViewConfig')) {
      const rnPath = path.dirname(context.originModulePath);
      return {
        filePath: path.join(rnPath, 'BaseViewConfig.ios.js'),
        type: 'sourceFile',
      };
    }
    // Catch-all: any other relative require from react-native on web -> empty (avoids endless whack-a-mole)
    if (moduleName.startsWith('./') || moduleName.startsWith('../')) {
      return { type: 'empty' };
    }
  }

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