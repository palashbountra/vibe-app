import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Colors, Spacing, Typography, BorderRadius } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { exchangeCodeForTokens, ingestSpotifyData } from '@/lib/spotify';

// Required for expo-auth-session to close the browser on redirect
WebBrowser.maybeCompleteAuthSession();

const SPOTIFY_CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID ?? '';
const SPOTIFY_SCOPES = [
  'user-top-read',
  'user-read-recently-played',
  'user-read-currently-playing',
  'user-library-read',
  'user-follow-read',
];
const SPOTIFY_DISCOVERY: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

export default function ConnectMusicScreen() {
  const { setMusicConnected } = useAuthStore();
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [loadingPlatform, setLoadingPlatform] = useState<string | null>(null);

  // In Expo Go, makeRedirectUri returns an exp:// URI based on the current Metro host.
  // Run `npx expo start --tunnel` so the URI is stable (tunnel URL, not a local IP).
  // The exact URI is logged below — register it once in your Spotify Developer Dashboard.
  const redirectUri = AuthSession.makeRedirectUri(
    __DEV__ ? {} : { scheme: 'vibeapp', path: 'auth/spotify' }
  );
  if (__DEV__) console.log('[Spotify OAuth] Register this URI in Spotify Dashboard:', redirectUri);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: SPOTIFY_CLIENT_ID,
      scopes: SPOTIFY_SCOPES,
      usePKCE: true,
      redirectUri,
    },
    SPOTIFY_DISCOVERY,
  );

  // Handle Spotify OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      const codeVerifier = request?.codeVerifier;
      if (!code || !codeVerifier) return;

      setLoadingPlatform('spotify');
      exchangeCodeForTokens(code, codeVerifier, redirectUri)
        .then((tokens) => ingestSpotifyData(tokens))
        .then(() => {
          setConnected((prev) => new Set([...prev, 'spotify']));
        })
        .catch((err: Error) => {
          Alert.alert('Spotify Error', err.message ?? 'Could not connect Spotify.');
        })
        .finally(() => setLoadingPlatform(null));
    } else if (response?.type === 'error') {
      Alert.alert('Spotify Error', response.error?.message ?? 'Authorization failed.');
      setLoadingPlatform(null);
    } else if (response?.type === 'cancel' || response?.type === 'dismiss') {
      setLoadingPlatform(null);
    }
  }, [response]);

  const handleConnectSpotify = () => {
    if (connected.has('spotify') || loadingPlatform) return;
    setLoadingPlatform('spotify');
    promptAsync().catch(() => setLoadingPlatform(null));
  };

  // Apple Music + YouTube Music — placeholders for now
  const handleConnectAppleMusic = () => {
    Alert.alert('Coming soon', 'Apple Music integration is coming in a future update.');
  };
  const handleConnectYouTubeMusic = () => {
    Alert.alert('Coming soon', 'YouTube Music integration is coming in a future update.');
  };

  const handleContinue = () => {
    setMusicConnected(connected.size > 0);
    router.replace('/(app)/discover');
  };

  const platforms = [
    {
      id: 'spotify',
      name: 'Spotify',
      description: 'Top artists, tracks & audio features',
      accentColor: Colors.spotify,
      icon: <FontAwesome5 name="spotify" size={28} color={Colors.spotify} />,
      onConnect: handleConnectSpotify,
    },
    {
      id: 'apple-music',
      name: 'Apple Music',
      description: 'Library, history & listening habits',
      accentColor: Colors.appleMusic,
      icon: <MaterialCommunityIcons name="music-circle" size={30} color={Colors.appleMusic} />,
      onConnect: handleConnectAppleMusic,
    },
    {
      id: 'youtube-music',
      name: 'YouTube Music',
      description: 'Watch history & music preferences',
      accentColor: Colors.youtube,
      icon: <FontAwesome5 name="youtube" size={26} color={Colors.youtube} />,
      onConnect: handleConnectYouTubeMusic,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🎵</Text>
          <Text style={styles.title}>Connect your music</Text>
          <Text style={styles.subtitle}>
            We use your listening data to connect you with people who share your sound.
            Connect at least one platform for the best matches.
          </Text>
        </View>

        <View style={styles.platforms}>
          {platforms.map((platform) => {
            const isConnected = connected.has(platform.id);
            const isLoading = loadingPlatform === platform.id;
            return (
              <View
                key={platform.id}
                style={[styles.card, isConnected && { borderColor: platform.accentColor }]}
              >
                <View style={styles.cardLeft}>
                  {platform.icon}
                  <View style={styles.cardInfo}>
                    <Text style={styles.platformName}>{platform.name}</Text>
                    <Text style={styles.platformDesc}>{platform.description}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.connectBtn,
                    isConnected && { backgroundColor: platform.accentColor, borderColor: platform.accentColor },
                    (isLoading || (loadingPlatform !== null && !isLoading)) && styles.connectBtnDisabled,
                  ]}
                  onPress={platform.onConnect}
                  activeOpacity={0.8}
                  disabled={isConnected || isLoading || loadingPlatform !== null}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={Colors.textPrimary} />
                  ) : (
                    <Text style={[styles.connectBtnText, isConnected && { color: '#000000' }]}>
                      {isConnected ? 'Connected ✓' : 'Connect'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueBtn, connected.size === 0 && styles.continueBtnMuted]}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.continueBtnText}>
              {connected.size > 0
                ? `Continue with ${connected.size} platform${connected.size > 1 ? 's' : ''}`
                : 'Continue'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={handleContinue}>
            <Text style={styles.skipText}>I'll connect music later</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 52,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  platforms: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  cardInfo: {
    flex: 1,
  },
  platformName: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  platformDesc: {
    ...Typography.small,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  connectBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 88,
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
  },
  connectBtnDisabled: {
    opacity: 0.5,
  },
  connectBtnText: {
    ...Typography.small,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  footer: {
    gap: Spacing.md,
  },
  continueBtn: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueBtnMuted: {
    backgroundColor: Colors.surface2,
  },
  continueBtnText: {
    ...Typography.bodyMedium,
    color: '#FFFFFF',
  },
  skipBtn: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
