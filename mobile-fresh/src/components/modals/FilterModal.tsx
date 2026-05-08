import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius } from '@/theme';

export interface DiscoverFilters {
  genres: string[];
  minAge: number;
  maxAge: number;
}

export const DEFAULT_FILTERS: DiscoverFilters = { genres: [], minAge: 18, maxAge: 60 };

const ALL_GENRES = [
  'neo-soul', 'r&b', 'hip-hop', 'jazz', 'indie folk', 'lo-fi',
  'electronic', 'ambient', 'techno', 'indie rock', 'alternative',
  'funk', 'soul', 'post-punk', 'pop', 'alternative rap',
];

interface FilterModalProps {
  visible: boolean;
  filters: DiscoverFilters;
  onApply: (filters: DiscoverFilters) => void;
  onClose: () => void;
}

export function FilterModal({ visible, filters, onApply, onClose }: FilterModalProps) {
  const insets = useSafeAreaInsets();
  const [local, setLocal] = useState<DiscoverFilters>(filters);

  useEffect(() => {
    if (visible) setLocal(filters);
  }, [visible]);

  const toggleGenre = (genre: string) => {
    setLocal((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const handleApply = () => {
    onApply(local);
    onClose();
  };

  const handleReset = () => {
    setLocal(DEFAULT_FILTERS);
    onApply(DEFAULT_FILTERS);
    onClose();
  };

  const activeCount =
    local.genres.length +
    (local.minAge !== DEFAULT_FILTERS.minAge || local.maxAge !== DEFAULT_FILTERS.maxAge ? 1 : 0);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.handle} />

        <View style={styles.titleRow}>
          <Text style={styles.title}>Filters</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>Reset all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Age range */}
          <Text style={styles.sectionLabel}>Age Range</Text>
          <View style={styles.ageRow}>
            <View style={styles.ageField}>
              <Text style={styles.ageFieldLabel}>Min</Text>
              <TextInput
                style={styles.ageInput}
                value={String(local.minAge)}
                onChangeText={(v) => {
                  const n = parseInt(v, 10);
                  if (!isNaN(n) && n >= 18 && n <= 99) {
                    setLocal((prev) => ({ ...prev, minAge: n }));
                  }
                }}
                keyboardType="number-pad"
                maxLength={2}
                selectTextOnFocus
              />
            </View>
            <Text style={styles.ageDash}>—</Text>
            <View style={styles.ageField}>
              <Text style={styles.ageFieldLabel}>Max</Text>
              <TextInput
                style={styles.ageInput}
                value={String(local.maxAge)}
                onChangeText={(v) => {
                  const n = parseInt(v, 10);
                  if (!isNaN(n) && n >= 18 && n <= 99) {
                    setLocal((prev) => ({ ...prev, maxAge: n }));
                  }
                }}
                keyboardType="number-pad"
                maxLength={2}
                selectTextOnFocus
              />
            </View>
          </View>

          {/* Genre vibe */}
          <Text style={styles.sectionLabel}>Genre Vibe</Text>
          <Text style={styles.sectionSub}>Show people who listen to these genres</Text>
          <View style={styles.genreGrid}>
            {ALL_GENRES.map((genre) => {
              const active = local.genres.includes(genre);
              return (
                <TouchableOpacity
                  key={genre}
                  style={[styles.genreChip, active && styles.genreChipActive]}
                  onPress={() => toggleGenre(genre)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.genreChipText, active && styles.genreChipTextActive]}>
                    {genre}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.85}>
          <Text style={styles.applyBtnText}>
            {activeCount > 0 ? `Apply (${activeCount} active)` : 'Apply'}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: { ...Typography.h3, color: Colors.textPrimary },
  resetText: { ...Typography.body, color: Colors.primary },
  scroll: { gap: 4 },
  sectionLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginTop: Spacing.md,
    marginBottom: 6,
  },
  sectionSub: {
    ...Typography.small,
    color: Colors.textTertiary,
    marginBottom: Spacing.sm,
  },
  ageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  ageField: { flex: 1, gap: 4 },
  ageFieldLabel: { ...Typography.small, color: Colors.textTertiary },
  ageInput: {
    backgroundColor: Colors.surface2,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ageDash: { ...Typography.h3, color: Colors.textTertiary, paddingBottom: 10 },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  genreChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  genreChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genreChipText: { ...Typography.small, color: Colors.textSecondary, fontWeight: '500' as const },
  genreChipTextActive: { color: '#fff', fontWeight: '700' as const },
  applyBtn: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  applyBtnText: { ...Typography.bodyMedium, color: '#fff', fontWeight: '700' as const },
});
