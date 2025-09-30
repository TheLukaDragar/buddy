import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Chip,
  Divider,
  FAB,
  IconButton,
  Surface,
  Text,
  TextInput
} from 'react-native-paper';
import { useBuddyTheme } from '../../constants/BuddyTheme';
import { useIntro } from '../_layout';

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');
  const { setShowIntro } = useIntro();
  const theme = useBuddyTheme();

  // Show the intro popup when the screen loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(true);
    }, 1000); // Show after 1 second delay

    return () => clearTimeout(timer);
  }, [setShowIntro]);



  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header Section */}
        <Surface style={[styles.header, { backgroundColor: theme.colors.primaryContainer }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <Avatar.Text 
                size={48} 
                label="B" 
                style={{ backgroundColor: theme.colors.primary }}
                labelStyle={{ color: theme.colors.onPrimary, fontFamily: 'Plus Jakarta Sans', fontWeight: '700' }}
              />
              <View style={styles.headerActions}>
                <IconButton 
                  icon="bell-outline" 
                  size={24}
                  iconColor={theme.colors.onPrimaryContainer}
                  onPress={() => alert('Notifications')}
                />
                <IconButton 
                  icon="account-circle-outline" 
                  size={24}
                  iconColor={theme.colors.onPrimaryContainer}
                  onPress={() => router.push('/login')}
                />
              </View>
            </View>
            
            <Text 
              variant="headlineLarge" 
              style={[styles.welcomeText, { color: theme.colors.onPrimaryContainer }]}
            >
              Welcome to Buddy
            </Text>
            <Text 
              variant="bodyLarge" 
              style={[styles.subtitleText, { color: theme.colors.onPrimaryContainer }]}
            >
              Your personal companion app with beautiful design
            </Text>
          </View>
        </Surface>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <TextInput
            mode="outlined"
            label="Search or ask Buddy..."
            value={searchText}
            onChangeText={setSearchText}
            left={<TextInput.Icon icon="magnify" />}
            right={<TextInput.Icon icon="microphone" onPress={() => alert('Voice search')} />}
            style={styles.searchInput}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Quick Actions
          </Text>
          
          <View style={styles.quickActions}>
            <Card style={[styles.actionCard, { backgroundColor: theme.colors.secondaryContainer }]}>
              <Card.Content style={styles.actionCardContent}>
                <IconButton 
                  icon="chat-outline" 
                  size={32}
                  iconColor={theme.colors.onSecondaryContainer}
                />
                <Text variant="labelLarge" style={{ color: theme.colors.onSecondaryContainer }}>
                  Chat
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.actionCard, { backgroundColor: theme.colors.tertiaryContainer }]}>
              <Card.Content style={styles.actionCardContent}>
                <IconButton 
                  icon="calendar-outline" 
                  size={32}
                  iconColor={theme.colors.onTertiaryContainer}
                />
                <Text variant="labelLarge" style={{ color: theme.colors.onTertiaryContainer }}>
                  Schedule
                </Text>
              </Card.Content>
            </Card>

            <Card 
              style={[styles.actionCard, { backgroundColor: theme.colors.primaryContainer }]}
              onPress={() => router.push('/login')}
            >
              <Card.Content style={styles.actionCardContent}>
                <IconButton 
                  icon="login" 
                  size={32}
                  iconColor={theme.colors.onPrimaryContainer}
                />
                <Text variant="labelLarge" style={{ color: theme.colors.onPrimaryContainer }}>
                  Login
                </Text>
              </Card.Content>
            </Card>

            <Card 
              style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => setShowIntro(true)}
            >
              <Card.Content style={styles.actionCardContent}>
                <IconButton 
                  icon="information-outline" 
                  size={32}
                  iconColor={theme.colors.onSurface}
                />
                <Text variant="labelLarge" style={{ color: theme.colors.onSurface }}>
                  About
                </Text>
              </Card.Content>
            </Card>

            <Card 
              style={[styles.actionCard, { backgroundColor: theme.colors.errorContainer }]}
              onPress={() => router.push('/fitness-player')}
            >
              <Card.Content style={styles.actionCardContent}>
                <IconButton 
                  icon="music" 
                  size={32}
                  iconColor={theme.colors.onErrorContainer}
                />
                <Text variant="labelLarge" style={{ color: theme.colors.onErrorContainer }}>
                  Music
                </Text>
              </Card.Content>
            </Card>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Recent Activity
          </Text>
          
          <Card style={styles.activityCard}>
            <Card.Content>
              <View style={styles.activityItem}>
                <Avatar.Icon 
                  size={40} 
                  icon="message-text" 
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <View style={styles.activityContent}>
                  <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                    New conversation started
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    2 minutes ago
                  </Text>
                </View>
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.activityItem}>
                <Avatar.Icon 
                  size={40} 
                  icon="check-circle" 
                  style={{ backgroundColor: theme.colors.tertiary }}
                />
                <View style={styles.activityContent}>
                  <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                    Task completed
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    1 hour ago
                  </Text>
                </View>
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.activityItem}>
                <Avatar.Icon 
                  size={40} 
                  icon="calendar-plus" 
                  style={{ backgroundColor: theme.colors.secondary }}
                />
                <View style={styles.activityContent}>
                  <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                    Event scheduled
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    3 hours ago
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Theme Showcase */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Design System
          </Text>
          
          <Card style={styles.themeCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.themeTitle}>
                Custom Brand Theme
              </Text>
              <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
                Built with your Figma design tokens and Plus Jakarta Sans typography
              </Text>
              
              <View style={styles.colorGrid}>
                <View style={styles.colorItem}>
                  <View style={[styles.colorSwatch, { backgroundColor: theme.colors.primary }]} />
                  <Text variant="labelSmall">Primary</Text>
                </View>
                <View style={styles.colorItem}>
                  <View style={[styles.colorSwatch, { backgroundColor: theme.colors.secondary }]} />
                  <Text variant="labelSmall">Secondary</Text>
                </View>
                <View style={styles.colorItem}>
                  <View style={[styles.colorSwatch, { backgroundColor: theme.colors.tertiary }]} />
                  <Text variant="labelSmall">Tertiary</Text>
                </View>
                <View style={styles.colorItem}>
                  <View style={[styles.colorSwatch, { backgroundColor: theme.colors.error }]} />
                  <Text variant="labelSmall">Error</Text>
                </View>
              </View>
              
              <View style={styles.chipRow}>
                <Chip icon="palette" mode="flat">Brand Colors</Chip>
                <Chip icon="format-font" mode="outlined">Typography</Chip>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <Button 
            mode="contained" 
            icon="rocket-launch"
            contentStyle={styles.ctaButton}
            onPress={() => router.push('/login')}
          >
            Try Login Screen
          </Button>
        </View>

        {/* Floating Action Button */}
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowIntro(true)}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
  },
  headerContent: {
    gap: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  welcomeText: {
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
  },
  subtitleText: {
    fontFamily: 'Plus Jakarta Sans',
    opacity: 0.8,
  },
  searchSection: {
    padding: 20,
    paddingTop: 24,
  },
  searchInput: {
    backgroundColor: 'transparent',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '600',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: 80,
    maxWidth: 100,
    elevation: 2,
  },
  actionCardContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityCard: {
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  activityContent: {
    flex: 1,
  },
  divider: {
    marginVertical: 12,
  },
  themeCard: {
    elevation: 2,
  },
  themeTitle: {
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '600',
    marginBottom: 4,
  },
  colorGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  colorItem: {
    alignItems: 'center',
    gap: 4,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    elevation: 2,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  ctaSection: {
    paddingHorizontal: 20,
    paddingBottom: 110, // Extra space for custom tab bar
  },
  ctaButton: {
    paddingVertical: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 104, // Above the custom tab bar
  },
});
