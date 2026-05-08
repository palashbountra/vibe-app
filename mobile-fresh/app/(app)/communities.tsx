import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '@/theme';
import { CreateCommunityModal } from '@/components/modals/CreateCommunityModal';
import { CommunityDetailModal, type Community } from '@/components/modals/CommunityDetailModal';

const INITIAL_COMMUNITIES: Community[] = [
  { id: '1', name: 'Delhi Indie Scene', description: 'Local artists, shows, sessions in Delhi', color: '#8B5CF6', emoji: '🎸', members: 1240, genre: 'indie', joined: false },
  { id: '2', name: 'Neo-Soul Heads', description: "Frank Ocean, SZA, D'Angelo and everything in between", color: '#EC4899', emoji: '🎶', members: 3800, genre: 'neo-soul', joined: true },
  { id: '3', name: 'Lo-Fi Study Vibes', description: 'Background music for focused people', color: '#3B82F6', emoji: '📚', members: 8200, genre: 'lo-fi', joined: false },
  { id: '4', name: 'Hip-Hop Purists', description: 'Golden era to new school, bars only', color: '#F59E0B', emoji: '🎤', members: 5600, genre: 'hip-hop', joined: false },
  { id: '5', name: 'Electronic Explorers', description: 'Four Tet, Jon Hopkins, Burial stans unite', color: '#10B981', emoji: '🏛', members: 2100, genre: 'electronic', joined: true },
  { id: '6', name: 'Jazz Kitchen', description: 'From Coltrane to Kamasi. All eras welcome.', color: '#6EE7B7', emoji: '🎷', members: 940, genre: 'jazz', joined: false },
  { id: '7', name: 'Bangalore Beats', description: 'Electronic and experimental from BLR', color: '#A78BFA', emoji: '🌆', members: 670, genre: 'electronic', joined: false },
  { id: '8', name: 'Indie Folk Circle', description: 'Bon Iver, Phoebe Bridgers, Fleet Foxes', color: '#FCD34D', emoji: '🌿', members: 1800, genre: 'indie folk', joined: false },
];

function CommunityCard({
  community,
  onToggle,
  onPress,
}: {
  community: Community;
  onToggle: (id: string) => void;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.communityCard} activeOpacity={0.85} onPress={onPress}>
      <View style={[styles.communityIcon, { backgroundColor: `${community.color}22` }]}>
        <Text style={styles.communityEmoji}>{community.emoji}</Text>
      </View>
      <View style={styles.communityInfo}>
        <Text style={styles.communityName}>{community.name}</Text>
        <Text style={styles.communityDesc} numberOfLines={1}>{community.description}</Text>
        <Text style={styles.communityMembers}>
          {community.members.toLocaleString()} members · {community.genre}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.joinBtn, community.joined && styles.joinBtnJoined]}
        onPress={(e) => { e.stopPropagation(); onToggle(community.id); }}
        activeOpacity={0.8}
      >
        <Text style={[styles.joinBtnText, community.joined && styles.joinBtnTextJoined]}>
          {community.joined ? 'Joined' : 'Join'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function CommunitiesScreen() {
  const [communities, setCommunities] = useState<Community[]>(INITIAL_COMMUNITIES);
  const [search, setSearch] = useState('');
  const [createVisible, setCreateVisible] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);

  const toggleJoin = (id: string) => {
    setCommunities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, joined: !c.joined } : c))
    );
    // Keep selectedCommunity in sync
    setSelectedCommunity((prev) =>
      prev?.id === id ? { ...prev, joined: !prev.joined } : prev
    );
  };

  const handleCreate = (data: { name: string; description: string; genre: string; emoji: string }) => {
    const newCommunity: Community = {
      id: String(Date.now()),
      name: data.name,
      description: data.description,
      color: Colors.primary,
      emoji: data.emoji,
      members: 1,
      genre: data.genre,
      joined: true,
    };
    setCommunities((prev) => [newCommunity, ...prev]);
  };

  const myComms = communities.filter((c) => c.joined);
  const popular = communities.filter((c) => !c.joined);
  const filtered = search
    ? communities.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.genre.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Communities</Text>
        <TouchableOpacity style={styles.createBtn} onPress={() => setCreateVisible(true)}>
          <Ionicons name="add" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color={Colors.textTertiary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search communities..."
          placeholderTextColor={Colors.textTertiary}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {filtered ? (
          <>
            <Text style={styles.sectionTitle}>Results</Text>
            {filtered.map((c) => (
              <CommunityCard
                key={c.id}
                community={c}
                onToggle={toggleJoin}
                onPress={() => setSelectedCommunity(c)}
              />
            ))}
            {filtered.length === 0 && (
              <Text style={styles.emptyText}>No communities found</Text>
            )}
          </>
        ) : (
          <>
            {myComms.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Your Communities</Text>
                {myComms.map((c) => (
                  <CommunityCard
                    key={c.id}
                    community={c}
                    onToggle={toggleJoin}
                    onPress={() => setSelectedCommunity(c)}
                  />
                ))}
              </>
            )}
            <Text style={styles.sectionTitle}>Popular</Text>
            {popular.map((c) => (
              <CommunityCard
                key={c.id}
                community={c}
                onToggle={toggleJoin}
                onPress={() => setSelectedCommunity(c)}
              />
            ))}
          </>
        )}
      </ScrollView>

      <CreateCommunityModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onCreate={handleCreate}
      />

      <CommunityDetailModal
        community={selectedCommunity}
        visible={selectedCommunity !== null}
        onClose={() => setSelectedCommunity(null)}
        onToggleJoin={toggleJoin}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.md,
  },
  title: { ...Typography.h2, color: Colors.textPrimary },
  createBtn: {
    width: 40, height: 40, backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md, marginHorizontal: Spacing.lg, paddingHorizontal: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md, height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, ...Typography.body, color: Colors.textPrimary, height: '100%' },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  sectionTitle: {
    ...Typography.small,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  communityCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border, gap: Spacing.md,
  },
  communityIcon: {
    width: 52, height: 52, borderRadius: BorderRadius.md,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  communityEmoji: { fontSize: 24 },
  communityInfo: { flex: 1, gap: 3 },
  communityName: { ...Typography.bodyMedium, color: Colors.textPrimary },
  communityDesc: { ...Typography.small, color: Colors.textSecondary, lineHeight: 16 },
  communityMembers: { ...Typography.small, color: Colors.textTertiary },
  joinBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: BorderRadius.full, backgroundColor: Colors.primary,
  },
  joinBtnJoined: { backgroundColor: Colors.surface2, borderWidth: 1, borderColor: Colors.border },
  joinBtnText: { ...Typography.small, color: '#fff', fontWeight: '700' as const },
  joinBtnTextJoined: { color: Colors.textSecondary },
  emptyText: { ...Typography.body, color: Colors.textTertiary, textAlign: 'center', marginTop: 32 },
});
