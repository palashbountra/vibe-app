import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '@/theme';
import { useAuthStore } from '@/store/authStore';

interface Platform {
  id: string;
  name: string;
  description: string;
  accentColor: string;
  icon: React.ReactNode;
}

const PLATFORMS: Platform[] = [
  {
    id: 'spotify',
    name: 'Spotify',
    description: 'Top artists, tracks & audio features',
    accentColor: Colors.spotify,
    icon: <FontAwesome5 name="spotify" size={28} color={Colors.spotify} />,
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    description: 'Library, history & listening habits',
    accentColor: Colors.appleMusic,
    icon: <MaterialCommunityIcons name="music-circle" size={30} color={Colors.appleMusic} />,
  },
  {
    id: 'youtube-music',
    name: 'YouTube Music',
    description: 'Watch history & music preferences',
    accentColor: Colors.youtube,
    icon: <FontAwesome5 name="youtube" size={26} color={Colors.youtube} />,
  },
];

export default function ConnectMusicScreen() {
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const { setMusicConnected } = useAuthStore();

  const togglePlatform = (id: string) => {
    // TODO: implement real OAuth per platform
    setConnected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleContinue = () => {
    setMusicConnected(connected.size > 0);
    router.replace('/(app)/discover');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>🎵</Text>
          <Text style={styles.title}>Connect your music</Text>
          <Text style={styles.subtitle}>
            We use your listening data to match you with people who share your taste.
            Connect at least one platform for the best matches.
          </Text>
        </View>

        <View style={styles.platforms}>
          {PLATFORMS.map((platform) => {
            const isConnected = connected.has(platform.id);
            return (
              <View
                key={platform.id}
                style={[styles.card, isConnected && { borderColor: platform.accentColor }]}
              >
                <View style={styles.cardLeft}>
                  {platform.icon}
                  <View style={styles.cardInfo}>
                    <Text style={styles.platformName}>{platform.name}</Text>
                    <Text style={styles.platformDesc}>{platform.description}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.connectBtn,
                    isConnected && { backgroundColor: platform.accentColor, borderColor: platform.accentColor },
                  ]}
                  onPress={() => togglePlatform(platform.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.connectBtnText, isConnected && { color: '#000000' }]}
                  >
                    {isConnected ? 'Connected ✓' : 'Connect'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueBtn, connected.size === 0 && styles.continueBtnMuted]}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.continueBtnText}>
              {connected.size > 0
                ? `Continue with ${connected.size} platform${connected.size > 1 ? 's' : ''}`
                : 'Continue'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={handleContinue}>
            <Text style={styles.skipText}>I'll connect music later</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 52,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  platforms: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  cardInfo: {
    flex: 1,
  },
  platformName: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  platformDesc: {
    ...Typography.small,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  connectBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  connectBtnText: {
    ...Typography.small,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  footer: {
    gap: Spacing.md,
  },
  continueBtn: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueBtnMuted: {
    backgroundColor: Colors.surface2,
  },
  continueBtnText: {
    ...Typography.bodyMedium,
    color: '#FFFFFF',
  },
  skipBtn: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
