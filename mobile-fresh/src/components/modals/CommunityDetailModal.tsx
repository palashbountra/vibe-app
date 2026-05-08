import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '@/theme';

export interface Community {
  id: string;
  name: string;
  description: string;
  color: string;
  emoji: string;
  members: number;
  genre: string;
  joined: boolean;
}

const MOCK_POSTS = [
  { id: '1', author: 'Aanya S.', avatarColor: '#8B5CF6', text: 'Anyone going to the show this Friday? 🎸', time: '2h ago' },
  { id: '2', author: 'Rohan K.', avatarColor: '#EC4899', text: 'Just discovered this playlist — totally on vibe for this community.', time: '5h ago' },
  { id: '3', author: 'Priya M.', avatarColor: '#10B981', text: 'Can we do a listening session sometime? Drop your timezone!', time: '1d ago' },
  { id: '4', author: 'Kabir V.', avatarColor: '#F59E0B', text: 'New track recommendations in the pinned post 🎵', time: '2d ago' },
];

interface CommunityDetailModalProps {
  community: Community | null;
  visible: boolean;
  onClose: () => void;
  onToggleJoin: (id: string) => void;
}

export function CommunityDetailModal({
  community,
  visible,
  onClose,
  onToggleJoin,
}: CommunityDetailModalProps) {
  const insets = useSafeAreaInsets();
  if (!community) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" />
      <View style={[styles.root, { paddingBottom: insets.bottom }]}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: community.color + '28' }]}>
          <TouchableOpacity style={[styles.backBtn, { top: insets.top + 8 }]} onPress={onClose}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.heroEmoji}>{community.emoji}</Text>
          <Text style={styles.heroName}>{community.name}</Text>
          <View style={[styles.genreTag, { backgroundColor: community.color + '33' }]}>
            <Text style={[styles.genreTagText, { color: community.color }]}>{community.genre}</Text>
          </View>
          <View style={styles.memberRow}>
            <Ionicons name="people-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.memberCount}>{community.members.toLocaleString()} members</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>{community.description}</Text>
          </View>

          {/* Posts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent</Text>
            {MOCK_POSTS.map((post) => (
              <View key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={[styles.postAvatar, { backgroundColor: post.avatarColor }]}>
                    <Text style={styles.postAvatarInitial}>{post.author.charAt(0)}</Text>
                  </View>
                  <View>
                    <Text style={styles.postAuthor}>{post.author}</Text>
                    <Text style={styles.postTime}>{post.time}</Text>
                  </View>
                </View>
                <Text style={styles.postText}>{post.text}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Action bar */}
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.joinBtn, community.joined && styles.leaveBtn]}
            onPress={() => {
              onToggleJoin(community.id);
              onClose();
            }}
            activeOpacity={0.85}
          >
            <Ionicons
              name={community.joined ? 'exit-outline' : 'enter-outline'}
              size={20}
              color={community.joined ? Colors.textSecondary : '#fff'}
            />
            <Text style={[styles.joinBtnText, community.joined && styles.leaveBtnText]}>
              {community.joined ? 'Leave Community' : 'Join Community'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  hero: {
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    left: Spacing.lg,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroEmoji: { fontSize: 64, marginBottom: Spacing.sm },
  heroName: { ...Typography.h2, color: Colors.textPrimary, textAlign: 'center', marginBottom: 8 },
  genreTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  genreTagText: { ...Typography.small, fontWeight: '600' as const },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  memberCount: { ...Typography.caption, color: Colors.textSecondary },
  scroll: { paddingHorizontal: Spacing.lg },
  section: { marginBottom: Spacing.lg, marginTop: Spacing.lg },
  sectionTitle: { ...Typography.h3, color: Colors.textPrimary, marginBottom: Spacing.md },
  aboutText: { ...Typography.body, color: Colors.textSecondary, lineHeight: 24 },
  postCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  postAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postAvatarInitial: { fontSize: 14, fontWeight: '700' as const, color: '#fff' },
  postAuthor: { ...Typography.caption, color: Colors.textPrimary, fontWeight: '600' as const },
  postTime: { ...Typography.small, color: Colors.textTertiary },
  postText: { ...Typography.body, color: Colors.textSecondary, lineHeight: 22 },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 34,
    paddingTop: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  joinBtn: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  leaveBtn: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  joinBtnText: { ...Typography.bodyMedium, color: '#fff', fontWeight: '700' as const },
  leaveBtnText: { color: Colors.textSecondary },
});
