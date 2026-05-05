import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius } from '@/theme';
import { useAuthStore } from '@/store/authStore';

const AVATAR_COLORS = ['#8B5CF6', '#EC4899', '#1DB954', '#3B82F6', '#F59E0B', '#EF4444'];

export default function SetupProfileScreen() {
  const { setUser, user } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const usernameRef = useRef<TextInput>(null);
  const ageRef = useRef<TextInput>(null);

  const ageNum = parseInt(age, 10);
  const ageValid = ageNum >= 18 && ageNum <= 100;
  const isValid = displayName.trim().length >= 2 && username.trim().length >= 3 && ageValid;
  const cleanUsername = username.replace(/[^a-z0-9_.]/gi, '').toLowerCase();

  const handleContinue = () => {
    if (!isValid) return;
    setUser({
      id: user?.id ?? `local_${Date.now()}`,
      displayName: displayName.trim(),
      email: user?.email,
      username: cleanUsername,
      avatarColor,
      age: ageNum,
    });
    router.replace('/(onboarding)/setup-profile-details');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Set up your profile</Text>
            <Text style={styles.subtitle}>
              This is how other people will find you on Vibe
            </Text>
          </View>

          {/* Avatar picker */}
          <View style={styles.avatarSection}>
            <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarInitial}>
                {displayName.trim().charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            <Text style={styles.avatarLabel}>Pick a color</Text>
            <View style={styles.colorRow}>
              {AVATAR_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: c },
                    avatarColor === c && styles.colorSwatchSelected,
                  ]}
                  onPress={() => setAvatarColor(c)}
                  activeOpacity={0.8}
                />
              ))}
            </View>
          </View>

          {/* Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="e.g. Alex"
              placeholderTextColor={Colors.textTertiary}
              returnKeyType="next"
              onSubmitEditing={() => usernameRef.current?.focus()}
              autoFocus
              maxLength={30}
            />
          </View>

          {/* Username */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.usernameRow}>
              <Text style={styles.usernameAt}>@</Text>
              <TextInput
                ref={usernameRef}
                style={[styles.input, styles.usernameInput]}
                value={cleanUsername}
                onChangeText={(t) => setUsername(t.replace(/[^a-z0-9_.]/gi, '').toLowerCase())}
                placeholder="yourhandle"
                placeholderTextColor={Colors.textTertiary}
                returnKeyType="next"
                onSubmitEditing={() => ageRef.current?.focus()}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={20}
              />
            </View>
            <Text style={styles.hint}>
              Letters, numbers, dots, underscores only
            </Text>
          </View>

          {/* Age */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              ref={ageRef}
              style={styles.input}
              value={age}
              onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ''))}
              placeholder="e.g. 22"
              placeholderTextColor={Colors.textTertiary}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
              keyboardType="number-pad"
              maxLength={3}
            />
            {age.length > 0 && !ageValid && (
              <Text style={[styles.hint, { color: '#EF4444' }]}>
                Must be 18 or older
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.continueBtn, !isValid && styles.continueBtnDisabled]}
            onPress={handleContinue}
            activeOpacity={0.85}
            disabled={!isValid}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  avatarLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  colorRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  fieldGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    height: 56,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingLeft: Spacing.md,
    height: 56,
  },
  usernameAt: {
    ...Typography.bodyMedium,
    color: Colors.primary,
    marginRight: 4,
  },
  usernameInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingLeft: 0,
    height: '100%',
  },
  hint: {
    ...Typography.small,
    color: Colors.textTertiary,
    marginTop: 6,
    marginLeft: 2,
  },
  continueBtn: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  continueBtnDisabled: {
    opacity: 0.4,
  },
  continueBtnText: {
    ...Typography.bodyMedium,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
