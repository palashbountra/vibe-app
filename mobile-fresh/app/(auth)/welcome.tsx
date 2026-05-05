import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const BAR_HEIGHTS = [40, 70, 55, 85, 45, 65, 50];

function MusicBar({ height, delay }: { height: number; delay: number }) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 500 + delay, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 500 + delay, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.bar,
        { height, opacity: anim, transform: [{ scaleY: anim }] },
      ]}
    />
  );
}

export default function WelcomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Music bars */}
        <View style={styles.barsContainer}>
          {BAR_HEIGHTS.map((h, i) => (
            <MusicBar key={i} height={h} delay={i * 80} />
          ))}
        </View>

        {/* Logo */}
        <Text style={styles.logo}>vibe</Text>
        <Text style={styles.tagline}>connect through music</Text>

        {/* CTA */}
        <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        <Text style={styles.terms}>
          By continuing you agree to our Terms & Privacy Policy
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  barsContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginBottom: 32 },
  bar: { width: 8, backgroundColor: '#8B5CF6', borderRadius: 4 },
  logo: { fontSize: 64, fontWeight: '800', color: '#FFFFFF', letterSpacing: -2, marginBottom: 8 },
  tagline: { fontSize: 18, color: '#8B5CF6', letterSpacing: 2, marginBottom: 64 },
  button: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 100,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  terms: { color: '#666', fontSize: 12, textAlign: 'center' },
});
