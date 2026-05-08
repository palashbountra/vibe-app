import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '@/theme';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [discoverVisible, setDiscoverVisible] = useState(true);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.root, { paddingBottom: insets.bottom }]}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Text style={styles.title}>Settings</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionLabel}>Notifications</Text>
          <View style={styles.card}>
            <SettingRow
              icon="notifications-outline"
              label="Push notifications"
              right={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ true: Colors.primary, false: Colors.border }}
                  thumbColor="#fff"
                />
              }
            />
            <View style={styles.separator} />
            <SettingRow
              icon="mail-outline"
              label="Email updates"
              right={
                <Switch
                  value={emailUpdates}
                  onValueChange={setEmailUpdates}
                  trackColor={{ true: Colors.primary, false: Colors.border }}
                  thumbColor="#fff"
                />
              }
            />
          </View>

          <Text style={styles.sectionLabel}>Privacy</Text>
          <View style={styles.card}>
            <SettingRow
              icon="eye-outline"
              label="Show me on Discover"
              right={
                <Switch
                  value={discoverVisible}
                  onValueChange={setDiscoverVisible}
                  trackColor={{ true: Colors.primary, false: Colors.border }}
                  thumbColor="#fff"
                />
              }
            />
            <View style={styles.separator} />
            <TouchableOpacity onPress={() => Alert.alert('Blocked users', 'Manage blocked users — coming soon!')}>
              <SettingRow
                icon="ban-outline"
                label="Blocked users"
                right={<Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />}
              />
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity onPress={() => Alert.alert('Privacy Policy', 'Coming soon.')}>
              <SettingRow
                icon="document-text-outline"
                label="Privacy Policy"
                right={<Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>Support</Text>
          <View style={styles.card}>
            <TouchableOpacity onPress={() => Alert.alert('Help & Feedback', 'Reach us at support@vibeapp.com')}>
              <SettingRow
                icon="help-circle-outline"
                label="Help & Feedback"
                right={<Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />}
              />
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity onPress={() => Alert.alert('Terms of Service', 'Coming soon.')}>
              <SettingRow
                icon="shield-checkmark-outline"
                label="Terms of Service"
                right={<Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.version}>Vibe v1.0.0 · beta</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

function SettingRow({
  icon,
  label,
  right,
}: {
  icon: string;
  label: string;
  right: React.ReactNode;
}) {
  return (
    <View style={rowStyles.row}>
      <View style={rowStyles.left}>
        <Ionicons name={icon as any} size={20} color={Colors.textSecondary} />
        <Text style={rowStyles.label}>{label}</Text>
      </View>
      {right}
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  label: { ...Typography.body, color: Colors.textPrimary },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { ...Typography.h3, color: Colors.textPrimary },
  closeBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: Spacing.lg, gap: 2 },
  sectionLabel: {
    ...Typography.small,
    color: Colors.textTertiary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginTop: Spacing.md,
    marginBottom: 6,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  separator: { height: 1, backgroundColor: Colors.border, marginLeft: Spacing.md + 20 + Spacing.sm },
  version: {
    ...Typography.small,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
