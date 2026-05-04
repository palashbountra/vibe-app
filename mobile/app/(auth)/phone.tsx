import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '@/theme';
import { Button } from '@/components/common/Button';

export default function PhoneScreen() {
  const [phone, setPhone] = useState('');

  const handleContinue = () => {
    if (phone.length >= 10) {
      router.push({ pathname: '/(auth)/verify', params: { phone: `+1${phone}` } });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Your number</Text>
          <Text style={styles.subtitle}>
            We'll send a verification code to confirm it's you
          </Text>
        </View>

        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.countryCode}>
            <Text style={styles.countryCodeText}>🇺🇸 +1</Text>
            <Ionicons name="chevron-down" size={14} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TextInput
            style={styles.phoneInput}
            value={phone}
            onChangeText={setPhone}
            placeholder="(555) 000-0000"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="phone-pad"
            maxLength={10}
            autoFocus
          />
        </View>

        <Button
          label="Send Code"
          onPress={handleContinue}
          disabled={phone.length < 10}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
  },
  back: {
    marginTop: Spacing.md,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingTop: Spacing.xl,
  },
  header: {
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
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  countryCodeText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  phoneInput: {
    flex: 1,
    height: 56,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
