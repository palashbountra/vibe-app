import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '@/theme';

const EMOJI_OPTIONS = [
  '🎸', '🎵', '🎤', '🎷', '🎹', '🎺', '🥁', '🎻',
  '🎼', '🎧', '🌆', '🌿', '🔥', '💫', '✨', '🎉', '🌊', '🎭',
];

interface NewCommunity {
  name: string;
  description: string;
  genre: string;
  emoji: string;
}

interface CreateCommunityModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (community: NewCommunity) => void;
}

export function CreateCommunityModal({ visible, onClose, onCreate }: CreateCommunityModalProps) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [emoji, setEmoji] = useState('🎵');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setName('');
    setDescription('');
    setGenre('');
    setEmoji('🎵');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please give your community a name.');
      return;
    }
    setSaving(true);
    await new Promise<void>((r) => setTimeout(r, 500));
    onCreate({ name: name.trim(), description: description.trim(), genre: genre.trim() || 'music', emoji });
    setSaving(false);
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.handle} />
        <View style={styles.titleRow}>
          <Text style={styles.title}>Create Community</Text>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Emoji picker */}
          <Text style={styles.label}>Pick an emoji</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.emojiRow}
            style={{ marginBottom: Spacing.md }}
          >
            {EMOJI_OPTIONS.map((e) => (
              <TouchableOpacity
                key={e}
                style={[styles.emojiBtn, emoji === e && styles.emojiBtnActive]}
                onPress={() => setEmoji(e)}
              >
                <Text style={styles.emojiText}>{e}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Name */}
          <Text style={styles.label}>Community Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Bangalore Beats"
            placeholderTextColor={Colors.textTertiary}
            maxLength={40}
          />

          {/* Description */}
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={description}
            onChangeText={setDescription}
            placeholder="What's this community about?"
            placeholderTextColor={Colors.textTertiary}
            multiline
            maxLength={150}
            textAlignVertical="top"
          />

          {/* Genre */}
          <Text style={styles.label}>Genre</Text>
          <TextInput
            style={styles.input}
            value={genre}
            onChangeText={setGenre}
            placeholder="e.g. indie, hip-hop, jazz"
            placeholderTextColor={Colors.textTertiary}
            maxLength={30}
          />
        </ScrollView>

        <TouchableOpacity
          style={[styles.createBtn, saving && { opacity: 0.6 }]}
          onPress={handleCreate}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createBtnText}>Create Community</Text>
          )}
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    maxHeight: '90%',
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
    marginBottom: Spacing.lg,
  },
  title: { ...Typography.h3, color: Colors.textPrimary },
  label: {
    ...Typography.small,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: Spacing.sm,
  },
  emojiRow: { gap: 8, paddingVertical: 4 },
  emojiBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emojiBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '22',
  },
  emojiText: { fontSize: 22 },
  input: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    ...Typography.body,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 4,
  },
  inputMultiline: {
    minHeight: 80,
    paddingTop: 12,
  },
  createBtn: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  createBtnText: { ...Typography.bodyMedium, color: '#fff', fontWeight: '700' as const },
});
