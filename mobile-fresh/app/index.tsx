import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/theme';

export default function Index() {
  const { isAuthenticated, isMusicConnected, isHydrated, user } = useAuthStore();

  // Wait for AsyncStorage session restore to finish before routing
  if (!isHydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!isAuthenticated) return <Redirect href="/(auth)/welcome" />;
  if (!user?.username) return <Redirect href="/(onboarding)/setup-profile" />;
  if (!user?.gender) return <Redirect href="/(onboarding)/setup-profile-details" />;
  return <Redirect href="/(app)/discover" />;
}
