import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/userService';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function EditProfileModal({ visible, onClose, onSaved }: EditProfileModalProps) {
  const insets = useSafeAreaInsets();
  const { user, setUser } = useAuthStore();
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [location, setLocation] = useState('');
  const [job, setJob] = useState('');
  const [school, setSchool] = useState('');
  const [height, setHeight] = useState('');

  useEffect(() => {
    if (visible && user) {
      setDisplayName(user.displayName ?? '');
      setBio(user.bio ?? '');
      setPronouns(user.pronouns ?? '');
      setLocation(user.location ?? '');
      setJob(user.job ?? '');
      setSchool(user.school ?? '');
      setHeight(user.height ?? '');
    }
  }, [visible, user?.id]);

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Name required', 'Please enter your display name.');
      return;
    }
    setSaving(true);
    await userService.updateProfile({
      displayName: displayName.trim(),
      bio: bio.trim(),
      pronouns: pronouns.trim(),
      location: location.trim(),
      job: job.trim(),
      school: school.trim(),
      height: height.trim(),
    });
    if (user) {
      setUser({
        ...user,
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
        pronouns: pronouns.trim() || undefined,
        location: location.trim() || undefined,
        job: job.trim() || undefined,
        school: school.trim() || undefined,
        height: height.trim() || undefined,
      });
    }
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.root, { paddingBottom: insets.bottom }]}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
          <Field label="Display Name">
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name"
              placeholderTextColor={Colors.textTertiary}
              maxLength={50}
            />
          </Field>

          <Field label="Bio">
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell people about yourself..."
              placeholderTextColor={Colors.textTertiary}
              multiline
              maxLength={200}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{bio.length}/200</Text>
          </Field>

          <Field label="Pronouns">
            <TextInput
              style={styles.input}
              value={pronouns}
              onChangeText={setPronouns}
              placeholder="e.g. they/them, she/her"
              placeholderTextColor={Colors.textTertiary}
              maxLength={30}
            />
          </Field>

          <Field label="Location">
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="City, Country"
              placeholderTextColor={Colors.textTertiary}
              maxLength={60}
            />
          </Field>

          <Field label="Job">
            <TextInput
              style={styles.input}
              value={job}
              onChangeText={setJob}
              placeholder="What do you do?"
              placeholderTextColor={Colors.textTertiary}
              maxLength={60}
            />
          </Field>

          <Field label="School">
            <TextInput
              style={styles.input}
              value={school}
              onChangeText={setSchool}
              placeholder="Where did you study?"
              placeholderTextColor={Colors.textTertiary}
              maxLength={60}
            />
          </Field>

          <Field label="Height">
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              placeholder={`e.g. 5'10" or 178cm`}
              placeholderTextColor={Colors.textTertiary}
              maxLength={20}
            />
          </Field>
        </ScrollView>
      </View>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={fieldStyles.container}>
      <Text style={fieldStyles.label}>{label}</Text>
      {children}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  container: { gap: 6 },
  label: {
    ...Typography.small,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cancelBtn: { minWidth: 60 },
  cancelText: { ...Typography.body, color: Colors.textSecondary },
  headerTitle: { ...Typography.bodyMedium, color: Colors.textPrimary, fontWeight: '700' as const },
  saveBtn: { minWidth: 60, alignItems: 'flex-end' },
  saveText: { ...Typography.body, color: Colors.primary, fontWeight: '600' as const },
  form: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    ...Typography.body,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputMultiline: {
    minHeight: 90,
    paddingTop: 12,
  },
  charCount: {
    ...Typography.small,
    color: Colors.textTertiary,
    textAlign: 'right',
  },
});
