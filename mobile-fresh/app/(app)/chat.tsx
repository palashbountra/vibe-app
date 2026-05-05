import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '@/theme';
import { matchingService, type Connection } from '@/services/matchingService';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function ConnectionRow({ conn }: { conn: Connection }) {
  const initial = conn.user.displayName.charAt(0).toUpperCase();
  const avatarBg = conn.user.avatarColor ?? Colors.primary;
  const hasUnread = conn.unreadCount > 0;

  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.7}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
        <Text style={styles.avatarInitial}>{initial}</Text>
        {/* Online indicator */}
        {conn.user.currentTrack && <View style={styles.onlineDot} />}
      </View>

      {/* Content */}
      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <Text style={[styles.rowName, hasUnread && styles.rowNameBold]}>
            {conn.user.displayName}
          </Text>
          {conn.lastMessage && (
            <Text style={styles.rowTime}>{timeAgo(conn.lastMessage.sentAt)}</Text>
          )}
        </View>

        <View style={styles.rowBottom}>
          <Text
            style={[styles.rowPreview, hasUnread && styles.rowPreviewBold]}
            numberOfLines={1}
          >
            {conn.lastMessage?.text ?? 'Say hi 👋'}
          </Text>
          {hasUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{conn.unreadCount}</Text>
            </View>
          )}
        </View>

        {/* Now playing strip */}
        {conn.user.currentTrack && (
          <Text style={styles.nowPlaying} numberOfLines={1}>
            🎵 {conn.user.currentTrack.title} · {conn.user.currentTrack.artist}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ChatScreen() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    matchingService.getConnections().then((data) => {
      setConnections(data);
      setLoading(false);
    });
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="create-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {!loading && connections.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubbles-outline" size={64} color={Colors.surface2} />
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySub}>Connect with someone on Discover to start chatting</Text>
        </View>
      ) : (
        <FlatList
          data={connections}
          keyExtractor={(c) => c.connectionId}
          renderItem={({ item }) => <ConnectionRow conn={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
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
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: { paddingBottom: Spacing.xxl },
  row: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    position: 'relative',
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: Colors.spotify,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  rowContent: { flex: 1 },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  rowName: { ...Typography.bodyMedium, color: Colors.textSecondary },
  rowNameBold: { color: Colors.textPrimary, fontWeight: '700' },
  rowTime: { ...Typography.small, color: Colors.textTertiary },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowPreview: {
    ...Typography.caption,
    color: Colors.textTertiary,
    flex: 1,
  },
  rowPreviewBold: { color: Colors.textSecondary, fontWeight: '600' },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: Spacing.sm,
  },
  unreadText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  nowPlaying: {
    ...Typography.small,
    color: Colors.textTertiary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: Spacing.lg + 54 + Spacing.md,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: { ...Typography.h3, color: Colors.textTertiary, marginTop: Spacing.md },
  emptySub: { ...Typography.caption, color: Colors.textTertiary, textAlign: 'center', lineHeight: 20 },
});
