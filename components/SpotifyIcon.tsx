import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface SpotifyIconProps {
  size?: number;
  color?: string;
}

export default function SpotifyIcon({ size = 48, color = '#FFFFFF' }: SpotifyIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Spotify logo paths */}
        <Path
          d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"
          fill={color}
          fillOpacity={0}
        />
        <Path
          d="M16.572 14.327c-.16.267-.5.347-.75.205-2.053-1.263-4.622-1.548-7.65-.85-.29.067-.58-.117-.647-.407-.067-.29.117-.58.407-.647 3.35-.77 6.267-.439 8.55.98.24.147.32.487.09.72zM17.906 11.53c-.203.327-.637.427-.965.225-2.35-1.44-5.932-1.86-8.71-.998-.357.11-.737-.09-.848-.447-.11-.357.09-.737.447-.848 3.18-.99 7.22-.51 9.85 1.137.328.202.427.636.226.93zM18.063 8.588c-2.82-1.674-7.47-1.83-10.16-1.01-.43.13-.885-.11-1.015-.54-.13-.43.11-.885.54-1.015 3.07-.935 8.22-.755 11.44 1.174.39.232.516.735.284 1.125-.232.39-.735.516-1.125.284z"
          fill={color}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
