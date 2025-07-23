import { useBuddyTheme } from '@/constants/BuddyTheme';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { nucleus } from '../../Buddy_variables.js';

export default function ProfileScreen() {
  const theme = useBuddyTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: nucleus.light.global.blue["20"] }]}>
      <View style={styles.content}>
        <Text variant="headlineLarge" style={[styles.title, { color: nucleus.light.global.blue["80"] }]}>
          Profile
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: nucleus.light.global.blue["100"] }]}>
          Profile screen content coming soon...
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 110, // Space for custom tab bar
  },
  title: {
    fontFamily: 'PlusJakartaSans-Bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    textAlign: 'center',
  },
}); 