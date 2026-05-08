import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Platform, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { makeRedirectUri } from 'expo-auth-session';
import { Colors, Spacing, Typography, BorderRadius } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { setAuthenticated, setUser } = useAuthStore();
  const [loading, setLoading] = useState<'apple' | 'google' | null>(null);

  // ── Shared: route after any successful auth ─────────────────────────────────
  const routeAfterAuth = async (
    userId: string,
    email?: string,
    displayName?: string,
  ) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, gender, profile_complete')
      .eq('id', userId)
      .single();

    setUser({
      id: userId,
      displayName: displayName ?? email?.split('@')[0] ?? 'User',
      email: email ?? '',
      username: profile?.username ?? undefined,
      gender: profile?.gender ?? undefined,
      profileComplete: profile?.profile_complete ?? undefined,
    });
    setAuthenticated(true);

    if (!profile?.username) {
      router.replace('/(onboarding)/setup-profile');
    } else if (!profile?.gender) {
      router.replace('/(onboarding)/setup-profile-details');
    } else {
      router.replace('/(app)/discover');
    }
  };

  // ── Google OAuth via Supabase ───────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    if (loading) return;
    setLoading('google');
    try {
      const redirectTo = 'exp://localhost';
      console.log('🔗 redirectTo:', redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });

      if (error) throw error;
      if (!data.url) throw new Error('No OAuth URL from Supabase');

      // Open Google login in system browser
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type !== 'success') {
        // User cancelled — no error needed
        setLoading(null);
        return;
      }

      // Supabase redirects back with tokens in the URL hash
      const url = result.url;
      const hash = url.split('#')[1] ?? '';
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (!accessToken || !refreshToken) {
        throw new Error('No tokens in callback URL — is Google enabled in Supabase?');
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) throw sessionError;
      if (!sessionData.user) throw new Error('No user returned');

      await routeAfterAuth(
        sessionData.user.id,
        sessionData.user.email,
        sessionData.user.user_metadata?.full_name as string | undefined,
      );
    } catch (e: unknown) {
      const err = e as { message?: string };
      Alert.alert('Sign in failed', err.message ?? 'Something went wrong.');
    } finally {
      setLoading(null);
    }
  };

  // ── Coming soon placeholder ─────────────────────────────────────────────────
  const comingSoon = (label: string) => {
    Alert.alert(label, 'This sign-in method is coming soon!');
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
        {/* Google — live */}
        <TouchableOpacity
          style={[styles.socialBtn, styles.googleBtn, loading === 'google' && styles.btnLoading]}
          onPress={handleGoogleSignIn}
          activeOpacity={0.85}
          disabled={!!loading}
        >
          {loading === 'google' ? (
            <ActivityIndicator color="#1a1a1a" />
          ) : (
            <>
              <FontAwesome5 name="google" size={18} color="#1a1a1a" />
              <Text style={[styles.socialLabel, { color: '#1a1a1a' }]}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Apple — coming soon (iOS only) */}
        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={[styles.socialBtn, styles.appleBtn, styles.comingSoonBtn]}
            onPress={() => comingSoon('Apple Sign In')}
            activeOpacity={0.7}
            disabled={!!loading}
          >
            <FontAwesome5 name="apple" size={20} color="#888" />
            <Text style={[styles.socialLabel, { color: '#888' }]}>Continue with Apple</Text>
            <View style={styles.soonBadge}>
              <Text style={styles.soonText}>Soon</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Phone — coming soon */}
        <TouchableOpacity
          style={[styles.socialBtn, styles.phoneBtn, styles.comingSoonBtn]}
          onPress={() => comingSoon('Phone Sign In')}
          activeOpacity={0.7}
          disabled={!!loading}
        >
          <Ionicons name="call-outline" size={20} color="#888" />
          <Text style={[styles.socialLabel, { color: '#888' }]}>Continue with Phone</Text>
          <View style={styles.soonBadge}>
            <Text style={styles.soonText}>Soon</Text>
          </View>
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
  googleBtn: {
    backgroundColor: '#FFFFFF',
  },
  appleBtn: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  phoneBtn: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  comingSoonBtn: {
    opacity: 0.55,
  },
  btnLoading: {
    opacity: 0.7,
  },
  socialLabel: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    flex: 1,
  },
  soonBadge: {
    backgroundColor: Colors.surface2,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  soonText: {
    ...Typography.small,
    color: Colors.textTertiary,
    fontWeight: '600',
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
