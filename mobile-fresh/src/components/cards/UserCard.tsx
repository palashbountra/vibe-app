import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import type { FeedCandidate } from '@/services/matchingService';

interface UserCardProps {
  user: FeedCandidate;
  onConnect: (userId: string) => void;
  onPress?: () => void;
}

const GENRE_COLORS: Record<string, string> = {
  'neo-soul': '#EC4899',
  'r&b': '#F59E0B',
  'hip-hop': '#8B5CF6',
  'alternative': '#3B82F6',
  'jazz': '#10B981',
  'indie folk': '#6EE7B7',
  'ambient': '#93C5FD',
  'electronic': '#A78BFA',
  'techno': '#F472B6',
  'indie rock': '#FCA5A5',
  'lo-fi': '#86EFAC',
  'funk': '#FCD34D',
  'soul': '#FB923C',
  'post-punk': '#94A3B8',
  'alternative rap': '#C4B5FD',
};

function genreColor(genre: string): string {
  return GENRE_COLORS[genre.toLowerCase()] ?? Colors.primary;
}

function compatColor(score: number): string {
  if (score >= 80) return '#10B981';
  if (score >= 60) return '#F59E0B';
  return Colors.textSecondary;
}

export function UserCard({ user, onConnect, onPress }: UserCardProps) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const initial = user.displayName.charAt(0).toUpperCase();
  const avatarBg = user.avatarColor ?? Colors.primary;
  const hasPhoto = user.photos && user.photos.length > 0;

  const handleConnect = async () => {
    if (connected || loading) return;
    setLoading(true);
    await onConnect(user.id);
    setLoading(false);
    setConnected(true);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.92 : 1}
    >
      {/* Header row: avatar/photo + name/age + compat badge */}
      <View style={styles.header}>
        {hasPhoto ? (
          <Image
            source={{ uri: user.photos![0] }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
        )}

        <View style={styles.nameBlock}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{user.displayName}</Text>
            <Text style={styles.age}>, {user.age}</Text>
          </View>
          {user.username ? (
            <Text style={styles.username}>@{user.username}</Text>
          ) : null}
          <Text style={styles.location}>
            <Ionicons name="location-outline" size={11} color={Colors.textTertiary} />{' '}
            {user.location}
          </Text>
        </View>

        {/* Compatibility badge */}
        <View style={[styles.compatBadge, { borderColor: compatColor(user.compatibilityScore) }]}>
          <Text style={[styles.compatScore, { color: compatColor(user.compatibilityScore) }]}>
            {user.compatibilityScore}%
          </Text>
          <Text style={styles.compatLabel}>match</Text>
        </View>
      </View>

      {/* Now Playing */}
      {user.currentTrack && (
        <View style={styles.nowPlaying}>
          <View style={styles.nowPlayingDot} />
          <FontAwesome5 name="spotify" size={12} color={Colors.spotify} style={{ marginRight: 6 }} />
          <Text style={styles.nowPlayingText} numberOfLines={1}>
            {user.currentTrack.title} · {user.currentTrack.artist}
          </Text>
        </View>
      )}

      {/* Top genres */}
      <View style={styles.genres}>
        {user.topGenres.slice(0, 3).map((g) => (
          <View key={g} style={[styles.genreChip, { backgroundColor: `${genreColor(g)}22`, borderColor: `${genreColor(g)}55` }]}>
            <Text style={[styles.genreText, { color: genreColor(g) }]}>{g}</Text>
          </View>
        ))}
      </View>

      {/* Top artists */}
      <View style={styles.artists}>
        <Text style={styles.artistsLabel}>Top artists</Text>
        <Text style={styles.artistNames} numberOfLines={1}>
          {user.topArtists.slice(0, 3).join('  ·  ')}
        </Text>
      </View>

      {/* Connect button */}
      <TouchableOpacity
        style={[styles.connectBtn, connected && styles.connectBtnDone]}
        onPress={handleConnect}
        activeOpacity={0.85}
        disabled={connected || loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : connected ? (
          <>
            <Ionicons name="checkmark" size={16} color="#fff" />
            <Text style={styles.connectBtnText}>Request Sent</Text>
          </>
        ) : (
          <>
            <Ionicons name="person-add-outline" size={16} color="#fff" />
            <Text style={styles.connectBtnText}>Connect</Text>
          </>
        )}
      </TouchableOpacity>

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarInitial: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
  },
  nameBlock: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  age: {
    fontSize: 18,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  username: {
    ...Typography.caption,
    color: Colors.primary,
  },
  location: {
    ...Typography.small,
    color: Colors.textTertiary,
  },
  compatBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 56,
  },
  compatScore: {
    fontSize: 18,
    fontWeight: '800',
  },
  compatLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  nowPlaying: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.spotify}15`,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    marginBottom: Spacing.sm,
  },
  nowPlayingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.spotify,
    marginRight: 6,
  },
  nowPlayingText: {
    ...Typography.small,
    color: Colors.textSecondary,
    flex: 1,
  },
  genres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  genreChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  genreText: {
    fontSize: 12,
    fontWeight: '600',
  },
  artists: {
    marginBottom: Spacing.md,
    gap: 3,
  },
  artistsLabel: {
    ...Typography.small,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  artistNames: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  connectBtn: {
    height: 44,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  connectBtnDone: {
    backgroundColor: Colors.surface2,
  },
  connectBtnText: {
    ...Typography.caption,
    color: '#fff',
    fontWeight: '700',
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
  },
  tapHintText: {
    ...Typography.small,
    color: Colors.textTertiary,
  },
});
