import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '@/theme';
import { UserCard } from '@/components/cards/UserCard';
import { matchingService, type FeedCandidate } from '@/services/matchingService';

const FILTERS = ['All', 'Nearby', 'High Match', 'Online'];

export default function DiscoverScreen() {
  const [feed, setFeed] = useState<FeedCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const loadFeed = useCallback(async () => {
    const data = await matchingService.getFeed();
    setFeed(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadFeed(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  const handleConnect = async (userId: string) => {
    await matchingService.sendConnectionRequest(userId);
  };

  const filteredFeed = feed.filter((u) => {
    if (activeFilter === 'High Match') return u.compatibilityScore >= 80;
    if (activeFilter === 'Online') return !!u.currentTrack;
    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>People near you</Text>
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, activeFilter === f && styles.chipActive]}
            onPress={() => setActiveFilter(f)}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Feed */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={filteredFeed}
          keyExtractor={(u) => u.id}
          renderItem={({ item }) => (
            <UserCard user={item} onConnect={handleConnect} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="compass-outline" size={64} color={Colors.surface2} />
              <Text style={styles.emptyTitle}>No one here yet</Text>
              <Text style={styles.emptySub}>Try a different filter or check back later</Text>
            </View>
          }
          ListFooterComponent={
            filteredFeed.length > 0 ? (
              <View style={styles.footer}>
                <Text style={styles.footerText}>You've seen everyone nearby 👋</Text>
                <TouchableOpacity onPress={onRefresh}>
                  <Text style={styles.footerRefresh}>Refresh feed</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
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
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  title: { ...Typography.h2, color: Colors.textPrimary },
  subtitle: { ...Typography.small, color: Colors.textTertiary, marginTop: 2 },
  filterBtn: {
    width: 40,
    height: 40,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: { ...Typography.small, color: Colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', paddingTop: Spacing.xxl, gap: Spacing.sm },
  emptyTitle: { ...Typography.h3, color: Colors.textTertiary, marginTop: Spacing.md },
  emptySub: { ...Typography.caption, color: Colors.textTertiary },
  footer: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  footerText: { ...Typography.caption, color: Colors.textTertiary },
  footerRefresh: { ...Typography.caption, color: Colors.primary, fontWeight: '600' },
});
