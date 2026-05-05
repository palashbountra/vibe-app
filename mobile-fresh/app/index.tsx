import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const { isAuthenticated, isMusicConnected, user } = useAuthStore();

  if (!isAuthenticated) return <Redirect href="/(auth)/welcome" />;
  if (!user?.username) return <Redirect href="/(onboarding)/setup-profile" />;
  if (!user?.gender) return <Redirect href="/(onboarding)/setup-profile-details" />;
  if (!isMusicConnected) return <Redirect href="/(onboarding)/connect-music" />;
  return <Redirect href="/(app)/discover" />;
}
