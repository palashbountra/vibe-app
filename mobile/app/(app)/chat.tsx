import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/theme';

export default function ChatScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>
      <View style={styles.placeholder}>
        <Ionicons name="chatbubbles-outline" size={72} color={Colors.surface2} />
        <Text style={styles.placeholderTitle}>No messages yet</Text>
        <Text style={styles.placeholderSub}>Match with someone to start chatting</Text>
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
