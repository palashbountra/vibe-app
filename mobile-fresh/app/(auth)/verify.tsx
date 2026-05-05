import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';

const OTP_LENGTH = 6;

export default function VerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);
  const { setAuthenticated, setAccessToken } = useAuthStore();

  const verifyOtp = async (code: string) => {
    if (loading) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phone ?? '',
        token: code,
        type: 'sms',
      });

      if (error) {
        Alert.alert('Invalid code', error.message);
        setOtp(Array(OTP_LENGTH).fill(''));
        inputs.current[0]?.focus();
        setActiveIndex(0);
        return;
      }

      if (data.session) {
        setAuthenticated(true);
        setAccessToken(data.session.access_token);
      }
      // index.tsx redirect chain will take over from here
      router.replace('/');
    } catch (e) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }

    if (newOtp.every((d) => d !== '') && digit) {
      verifyOtp(newOtp.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      setActiveIndex(index - 1);
    }
  };

  const resend = async () => {
    const { error } = await supabase.auth.signInWithOtp({ phone: phone ?? '' });
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Sent!', 'A new code has been sent.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify your number</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={styles.phone}>{phone}</Text>
          </Text>
        </View>

        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              style={[styles.otpBox, activeIndex === i && styles.otpBoxActive]}
              value={digit}
              onChangeText={(t) => handleInput(t, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              onFocus={() => setActiveIndex(i)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectionColor={Colors.primary}
            />
          ))}
        </View>

        {loading && (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.lg }} />
        )}

        <TouchableOpacity style={styles.resend} onPress={resend}>
          <Text style={styles.resendText}>Didn't get it? </Text>
          <Text style={[styles.resendText, { color: Colors.primary, fontWeight: '600' }]}>Resend</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  back: { padding: Spacing.md },
  content: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  header: { marginBottom: Spacing.xxl },
  title: { ...Typography.h1, color: Colors.textPrimary, marginBottom: Spacing.sm },
  subtitle: { ...Typography.body, color: Colors.textSecondary, lineHeight: 24 },
  phone: { color: Colors.textPrimary, fontWeight: '600' },
  otpRow: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'center' },
  otpBox: {
    width: 48,
    height: 58,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  otpBoxActive: { borderColor: Colors.primary },
  resend: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  resendText: { ...Typography.body, color: Colors.textSecondary },
});
