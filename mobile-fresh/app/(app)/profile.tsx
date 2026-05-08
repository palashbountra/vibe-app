import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { userService, type UserProfile } from '@/services/userService';
import { EditProfileModal } from '@/components/modals/EditProfileModal';
import { SettingsModal } from '@/components/modals/SettingsModal';

export default function ProfileScreen() {
  const { user, isMusicConnected, signOut } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const loadProfile = () => {
    userService.getMyProfile().then(setProfile);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSignOut = () => {
    signOut();
    router.replace('/(auth)/welcome');
  };

  const avatarColor = user?.avatarColor ?? Colors.primary;
  const initial = user?.displayName?.charAt(0)?.toUpperCase() ?? '?';
  const topArtists = profile?.topArtists ?? [];
  const topGenres = profile?.topGenres ?? [];
  const currentTrack = profile?.currentTrack;
  const firstPhoto = user?.photos?.[0] ?? null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setSettingsVisible(true)}>
          <Ionicons name="settings-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Avatar + name */}
        <View style={styles.profileTop}>
          {firstPhoto ? (
            <Image source={{ uri: firstPhoto }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          )}
          <Text style={styles.name}>{user?.displayName ?? 'Your Name'}</Text>
          {user?.username && <Text style={styles.username}>@{user.username}</Text>}
          {(user?.bio ?? profile?.bio) && (
            <Text style={styles.bio}>{user?.bio ?? profile?.bio}</Text>
          )}
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditVisible(true)}>
            <Ionicons name="pencil-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.editBtnText}>Edit profile</Text>
          </TouchableOpacity>
        </View>

        {/* Info chips (location, job, etc.) */}
        {(user?.location || user?.job || user?.pronouns) && (
          <View style={styles.infoRow}>
            {user?.pronouns && (
              <View style={styles.infoChip}>
                <Text style={styles.infoChipText}>{user.pronouns}</Text>
              </View>
            )}
            {user?.location && (
              <View style={styles.infoChip}>
                <Ionicons name="location-outline" size={12} color={Colors.textTertiary} />
                <Text style={styles.infoChipText}>{user.location}</Text>
              </View>
            )}
            {user?.job && (
              <View style={styles.infoChip}>
                <Ionicons name="briefcase-outline" size={12} color={Colors.textTertiary} />
                <Text style={styles.infoChipText}>{user.job}</Text>
              </View>
            )}
          </View>
        )}

        {/* Now Playing */}
        {currentTrack && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Now Playing</Text>
            <View style={styles.nowPlayingCard}>
              <View style={styles.nowPlayingDot} />
              <FontAwesome5 name="spotify" size={16} color={Colors.spotify} />
              <View style={styles.nowPlayingInfo}>
                <Text style={styles.trackTitle}>{currentTrack.title}</Text>
                <Text style={styles.trackArtist}>{currentTrack.artist}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Top genres */}
        {topGenres.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Genres</Text>
            <View style={styles.genres}>
              {topGenres.map((g) => (
                <View key={g} style={styles.genreChip}>
                  <Text style={styles.genreText}>{g}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Top artists */}
        {topArtists.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Artists</Text>
            {topArtists.map((artist, i) => (
              <View key={artist} style={styles.artistRow}>
                <Text style={styles.artistRank}>{i + 1}</Text>
                <View style={styles.artistDot} />
                <Text style={styles.artistName}>{artist}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Connected platforms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected Platforms</Text>
          {isMusicConnected ? (
            <View style={styles.platformCard}>
              <FontAwesome5 name="spotify" size={20} color={Colors.spotify} />
              <Text style={styles.platformName}>Spotify</Text>
              <View style={styles.connectedBadge}>
                <Text style={styles.connectedText}>Connected</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.connectPrompt}
              onPress={() => router.push('/(onboarding)/connect-music')}
              activeOpacity={0.8}
            >
              <Ionicons name="musical-notes-outline" size={20} color={Colors.primary} />
              <Text style={styles.connectPromptText}>Connect a music platform</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <EditProfileModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        onSaved={loadProfile}
      />

      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  title: { ...Typography.h2, color: Colors.textPrimary },
  iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  profileTop: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.xs,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatarInitial: { fontSize: 40, fontWeight: '700' as const, color: '#fff' },
  name: { ...Typography.h3, color: Colors.textPrimary },
  username: { ...Typography.body, color: Colors.primary },
  bio: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 4,
    paddingHorizontal: Spacing.md,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editBtnText: { ...Typography.small, color: Colors.textSecondary, fontWeight: '500' as const },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoChipText: { ...Typography.small, color: Colors.textSecondary },
  section: { marginBottom: Spacing.xl },
  sectionTitle: {
    ...Typography.small,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  nowPlayingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: `${Colors.spotify}15`,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  nowPlayingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.spotify,
  },
  nowPlayingInfo: { flex: 1 },
  trackTitle: { ...Typography.bodyMedium, color: Colors.textPrimary },
  trackArtist: { ...Typography.caption, color: Colors.textSecondary },
  genres: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  genreChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: `${Colors.primary}22`,
    borderWidth: 1,
    borderColor: `${Colors.primary}44`,
  },
  genreText: { ...Typography.small, color: Colors.primary, fontWeight: '600' as const },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  artistRank: { ...Typography.caption, color: Colors.textTertiary, width: 20, textAlign: 'center' },
  artistDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  artistName: { ...Typography.bodyMedium, color: Colors.textPrimary },
  platformCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  platformName: { ...Typography.bodyMedium, color: Colors.textPrimary, flex: 1 },
  connectedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: `${Colors.spotify}22`,
    borderRadius: BorderRadius.full,
  },
  connectedText: { ...Typography.small, color: Colors.spotify, fontWeight: '600' as const },
  connectPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  connectPromptText: { ...Typography.bodyMedium, color: Colors.textPrimary, flex: 1 },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 52,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: `${Colors.error}44`,
    marginTop: Spacing.md,
  },
  signOutText: { ...Typography.bodyMedium, color: Colors.error },
});
