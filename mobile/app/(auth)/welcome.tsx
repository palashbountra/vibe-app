import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Colors, Spacing, Typography } from '@/theme';
import { Button } from '@/components/common/Button';

const BARS = [0.3, 0.6, 0.9, 0.5, 0.8, 0.4, 0.7, 0.5, 0.9, 0.3, 0.6, 0.8, 0.4, 0.7, 0.5];

export default function WelcomeScreen() {
  const barsOpacity = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoY = useSharedValue(24);
  const taglineOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    barsOpacity.value = withDelay(100, withTiming(1, { duration: 700 }));
    logoOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    logoY.value = withDelay(300, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));
    taglineOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));
    buttonOpacity.value = withDelay(1000, withTiming(1, { duration: 500 }));
  }, []);

  const barsStyle = useAnimatedStyle(() => ({ opacity: barsOpacity.value }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoY.value }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }));
  const buttonStyle = useAnimatedStyle(() => ({ opacity: buttonOpacity.value }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.barsContainer, barsStyle]}>
          {BARS.map((height, i) => (
            <View
              key={i}
              style={[
                styles.bar,
                {
                  height: height * 80,
                  backgroundColor: i % 3 === 0 ? Colors.accent : Colors.primary,
                  opacity: 0.5 + height * 0.5,
                },
              ]}
            />
          ))}
        </Animated.View>

        <Animated.View style={logoStyle}>
          <Text style={styles.logo}>vibe</Text>
        </Animated.View>

        <Animated.View style={taglineStyle}>
          <Text style={styles.tagline}>find your frequency</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, buttonStyle]}>
        <Button label="Get Started" onPress={() => router.push('/(auth)/login')} />
        <Text style={styles.signinHint}>
          Already have an account?{' '}
          <Text style={styles.signinLink} onPress={() => router.push('/(auth)/login')}>
            Sign in
          </Text>
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: 80,
    marginBottom: Spacing.md,
  },
  bar: {
    width: 10,
    borderRadius: 5,
  },
  logo: {
    ...Typography.hero,
    color: Colors.textPrimary,
  },
  tagline: {
    ...Typography.caption,
    color: Colors.textSecondary,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  footer: {
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  signinHint: {
    textAlign: 'center',
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  signinLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
