import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Colors, Spacing, Typography, BorderRadius } from '@/theme';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const { setAuthenticated, setUser } = useAuthStore();

  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      setUser({
        id: credential.user,
        displayName: credential.fullName?.givenName ?? 'User',
        email: credential.email ?? '',
      });
      setAuthenticated(true);
      router.replace('/(onboarding)/setup-profile');
    } catch {
      // user cancelled
    }
  };

  const handleGoogleSignIn = () => {
    // TODO: implement expo-auth-session Google OAuth
    setAuthenticated(true);
    router.replace('/(onboarding)/setup-profile');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Sign in</Text>
        <Text style={styles.subtitle}>Find people who share your sound</Text>
      </View>

      <View style={styles.options}>
        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={[styles.socialBtn, styles.appleBtn]}
            onPress={handleAppleSignIn}
            activeOpacity={0.85}
          >
            <FontAwesome5 name="apple" size={20} color="#FFFFFF" />
            <Text style={[styles.socialLabel, { color: '#FFFFFF' }]}>Continue with Apple</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.socialBtn, styles.googleBtn]}
          onPress={handleGoogleSignIn}
          activeOpacity={0.85}
        >
          <FontAwesome5 name="google" size={18} color="#1a1a1a" />
          <Text style={[styles.socialLabel, { color: '#1a1a1a' }]}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={[styles.socialBtn, styles.phoneBtn]}
          onPress={() => router.push('/(auth)/phone')}
          activeOpacity={0.85}
        >
          <Ionicons name="call-outline" size={20} color={Colors.textPrimary} />
          <Text style={styles.socialLabel}>Continue with Phone</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.terms}>
        By continuing, you agree to our{' '}
        <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
        <Text style={styles.termsLink}>Privacy Policy</Text>
      </Text>
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
  header: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  options: {
    gap: Spacing.sm,
  },
  socialBtn: {
    height: 56,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: Spacing.lg,
  },
  appleBtn: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  googleBtn: {
    backgroundColor: '#FFFFFF',
  },
  phoneBtn: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  socialLabel: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  terms: {
    position: 'absolute',
    bottom: Spacing.xxl,
    left: Spacing.lg,
    right: Spacing.lg,
    textAlign: 'center',
    ...Typography.small,
    color: Colors.textTertiary,
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.primary,
  },
});
