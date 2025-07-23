import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { nucleus } from '../Buddy_variables.js';

// Custom light theme based on your Figma design system
export const BuddyLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Primary brand colors
    primary: nucleus.light.global.brand["50"], // #e4ee57
    onPrimary: nucleus.light.global.grey["100"], // #131214
    primaryContainer: nucleus.light.global.brand["20"], // #f6fac6
    onPrimaryContainer: nucleus.light.global.brand["90"], // #8a930f
    
    // Secondary colors (using blue palette)
    secondary: nucleus.light.global.blue["60"], // #4d96bf
    onSecondary: nucleus.light.global.white, // #ffffff
    secondaryContainer: nucleus.light.global.blue["20"], // #c5ddeb
    onSecondaryContainer: nucleus.light.global.blue["90"], // #26536b
    
    // Tertiary colors (using green palette)
    tertiary: nucleus.light.global.green["60"], // #3e6a4d
    onTertiary: nucleus.light.global.white, // #ffffff
    tertiaryContainer: nucleus.light.global.green["20"], // #8ebd9f
    onTertiaryContainer: nucleus.light.global.green["90"], // #203627
    
    // Error colors
    error: nucleus.light.global.red["60"], // #c84747
    onError: nucleus.light.global.white, // #ffffff
    errorContainer: nucleus.light.global.red["20"], // #edc3c3
    onErrorContainer: nucleus.light.global.red["90"], // #732323
    
    // Background and surface
    background: nucleus.light.semantic.bg.canvas, // #ffffff
    onBackground: nucleus.light.semantic.fg.base, // #131214
    surface: nucleus.light.semantic.bg.surface, // #ffffff
    onSurface: nucleus.light.semantic.fg.base, // #131214
    surfaceVariant: nucleus.light.global.grey["20"], // #e6e9eb
    onSurfaceVariant: nucleus.light.global.grey["70"], // #53575a
    
    // Outline and other colors
    outline: nucleus.light.semantic.border.muted, // #daddde
    outlineVariant: nucleus.light.semantic.border.subtle, // #e6e9eb
    shadow: nucleus.light.global.grey["100"], // #131214
    scrim: nucleus.light.global.grey["100"], // #131214
    inverseSurface: nucleus.light.global.grey["90"], // #1f2224
    inverseOnSurface: nucleus.light.global.grey["20"], // #e6e9eb
    inversePrimary: nucleus.light.global.brand["30"], // #f0f6a1
    
    // Elevation surfaces
    elevation: {
      level0: 'transparent',
      level1: nucleus.light.semantic.bg.subtle, // #f1f3e8
      level2: nucleus.light.global.grey["10"], // #f4f6f7
      level3: nucleus.light.global.grey["20"], // #e6e9eb
      level4: nucleus.light.global.grey["30"], // #daddde
      level5: nucleus.light.global.grey["40"], // #c1c4c6
    },
    
    // Surface disabled
    surfaceDisabled: nucleus.light.semantic.bg.disabled, // #daddde
    onSurfaceDisabled: nucleus.light.semantic.fg.disabled, // #898d8f
    backdrop: nucleus.light.semantic.bg.overlay, // rgba(0, 0, 0, 0.70)
  },
  fonts: {
    ...MD3LightTheme.fonts,
    displayLarge: {
      fontFamily: nucleus.light.typography.fontFamily.primary,
      fontSize: nucleus.light.typography.fontSize["4xl"], // 64
      fontWeight: '700' as const, // 700
      letterSpacing: 0,
      lineHeight: 72,
    },
    displayMedium: {
      fontFamily: nucleus.light.typography.fontFamily.primary,
      fontSize: nucleus.light.typography.fontSize["3xl"], // 40
      fontWeight: '700' as const, // 700
      letterSpacing: 0,
      lineHeight: 48,
    },
    displaySmall: {
      fontFamily: nucleus.light.typography.fontFamily.primary,
      fontSize: nucleus.light.typography.fontSize["2xl"], // 32
      fontWeight: '600' as const, // 600
      letterSpacing: 0,
      lineHeight: 40,
    },
    headlineLarge: {
      fontFamily: nucleus.light.typography.fontFamily.primary,
      fontSize: nucleus.light.typography.fontSize.xl, // 24
      fontWeight: '600' as const, // 600
      letterSpacing: 0,
      lineHeight: 32,
    },
    headlineMedium: {
      fontFamily: nucleus.light.typography.fontFamily.primary,
      fontSize: nucleus.light.typography.fontSize.lg, // 18
      fontWeight: '600' as const, // 600
      letterSpacing: 0,
      lineHeight: 24,
    },
    headlineSmall: {
      fontFamily: nucleus.light.typography.fontFamily.primary,
      fontSize: nucleus.light.typography.fontSize.md, // 16
      fontWeight: '600' as const, // 600
      letterSpacing: 0,
      lineHeight: 20,
    },
    titleLarge: {
      fontFamily: nucleus.light.typography.fontFamily.primary,
      fontSize: nucleus.light.typography.fontSize.lg, // 18
      fontWeight: '500' as const, // 500
      letterSpacing: 0,
      lineHeight: 24,
    },
    titleMedium: {
      fontFamily: nucleus.light.typography.fontFamily.primary,
      fontSize: nucleus.light.typography.fontSize.md, // 16
      fontWeight: '500' as const, // 500
      letterSpacing: 0.15,
      lineHeight: 20,
    },
    titleSmall: {
      fontFamily: nucleus.light.typography.fontFamily.primary,
      fontSize: nucleus.light.typography.fontSize.sm, // 14
      fontWeight: '500' as const, // 500
      letterSpacing: 0.1,
      lineHeight: 18,
    },
    labelLarge: {
      fontFamily: nucleus.light.typography.fontFamily.primary,
      fontSize: nucleus.light.typography.fontSize.sm, // 14
      fontWeight: '500' as const, // 500
      letterSpacing: 0.1,
      lineHeight: 18,
    },
    labelMedium: {
      fontFamily: nucleus.light.typography.fontFamily.primary,
      fontSize: nucleus.light.typography.fontSize.xs, // 12
      fontWeight: '500' as const, // 500
      letterSpacing: 0.5,
      lineHeight: 16,
    },
    labelSmall: {
      fontFamily: nucleus.light.typography.fontFamily.primary,
      fontSize: 11,
      fontWeight: '500' as const, // 500
      letterSpacing: 0.5,
      lineHeight: 14,
    },
    bodyLarge: {
      fontFamily: nucleus.light.typography.fontFamily.primary,
      fontSize: nucleus.light.typography.fontSize.md, // 16
      fontWeight: '400' as const, // 400
      letterSpacing: 0.15,
      lineHeight: 24,
    },
    bodyMedium: {
      fontFamily: nucleus.light.typography.fontFamily.primary,
      fontSize: nucleus.light.typography.fontSize.sm, // 14
      fontWeight: '400' as const, // 400
      letterSpacing: 0.25,
      lineHeight: 20,
    },
    bodySmall: {
      fontFamily: nucleus.light.typography.fontFamily.primary,
      fontSize: nucleus.light.typography.fontSize.xs, // 12
      fontWeight: '400' as const, // 400
      letterSpacing: 0.4,
      lineHeight: 16,
    },
  },
  roundness: nucleus.light.cornerRadius.md, // 8
};

// Custom dark theme based on your Figma design system
export const BuddyDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // Primary brand colors (adjusted for dark mode)
    primary: nucleus.dark.global.brand["50"], // #e4ee57
    onPrimary: nucleus.dark.global.grey["100"], // #131214
    primaryContainer: nucleus.dark.global.brand["80"], // #adb813
    onPrimaryContainer: nucleus.dark.global.brand["20"], // #f6fac6
    
    // Secondary colors (using blue palette)
    secondary: nucleus.dark.global.blue["40"], // #89bad5
    onSecondary: nucleus.dark.global.grey["100"], // #131214
    secondaryContainer: nucleus.dark.global.blue["80"], // #316a89
    onSecondaryContainer: nucleus.dark.global.blue["20"], // #c5ddeb
    
    // Tertiary colors (using green palette)
    tertiary: nucleus.dark.global.green["40"], // #5c9e73
    onTertiary: nucleus.dark.global.grey["100"], // #131214
    tertiaryContainer: nucleus.dark.global.green["80"], // #0d4f2b
    onTertiaryContainer: nucleus.dark.global.green["20"], // #8ebd9f
    
    // Error colors
    error: nucleus.dark.global.red["40"], // #da8585
    onError: nucleus.dark.global.grey["100"], // #131214
    errorContainer: nucleus.dark.global.red["80"], // #922c2c
    onErrorContainer: nucleus.dark.global.red["20"], // #edc3c3
    
    // Background and surface
    background: nucleus.dark.semantic.bg.canvas, // #131214
    onBackground: nucleus.dark.semantic.fg.base, // #ffffff
    surface: nucleus.dark.semantic.bg.surface, // #2f3133
    onSurface: nucleus.dark.semantic.fg.base, // #ffffff
    surfaceVariant: nucleus.dark.global.grey["80"], // #2f3133
    onSurfaceVariant: nucleus.dark.global.grey["40"], // #c1c4c6
    
    // Outline and other colors
    outline: nucleus.dark.semantic.border.muted, // #53575a
    outlineVariant: nucleus.dark.semantic.border.subtle, // #2f3133
    shadow: nucleus.dark.global.grey["100"], // #131214
    scrim: nucleus.dark.global.grey["100"], // #131214
    inverseSurface: nucleus.dark.global.grey["20"], // #e6e9eb
    inverseOnSurface: nucleus.dark.global.grey["90"], // #1f2224
    inversePrimary: nucleus.dark.global.brand["70"], // #d0dd17
    
    // Elevation surfaces
    elevation: {
      level0: 'transparent',
      level1: nucleus.dark.semantic.bg.subtle, // #1f2224
      level2: nucleus.dark.global.grey["90"], // #1f2224
      level3: nucleus.dark.global.grey["80"], // #2f3133
      level4: nucleus.dark.global.grey["70"], // #53575a
      level5: nucleus.dark.global.grey["60"], // #6e7375
    },
    
    // Surface disabled
    surfaceDisabled: nucleus.dark.semantic.bg.disabled, // #2f3133
    onSurfaceDisabled: nucleus.dark.semantic.fg.disabled, // #6e7375
    backdrop: nucleus.dark.semantic.bg.overlay, // rgba(0, 0, 0, 0.70)
  },
  fonts: {
    ...BuddyLightTheme.fonts, // Use the same font configuration
  },
  roundness: nucleus.dark.cornerRadius.md, // 8
};

// Type for the custom theme
export type BuddyTheme = typeof BuddyLightTheme;

// Hook for accessing the custom theme with proper typing
import { useTheme } from 'react-native-paper';
export const useBuddyTheme = () => useTheme<BuddyTheme>(); 