import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/theme';

export default function DiscoverScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <Ionicons name="options-outline" size={24} color={Colors.textSecondary} />
      </View>
      <View style={styles.placeholder}>
        <Ionicons name="compass-outline" size={72} color={Colors.surface2} />
        <Text style={styles.placeholderTitle}>Swipe cards coming soon</Text>
        <Text style={styles.placeholderSub}>People nearby with your music taste</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  placeholderTitle: {
    ...Typography.h3,
    color: Colors.textTertiary,
    marginTop: Spacing.md,
  },
  placeholderSub: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
});
