import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const { isAuthenticated, isMusicConnected } = useAuthStore();

  if (!isAuthenticated) return <Redirect href="/(auth)/welcome" />;
  if (!isMusicConnected) return <Redirect href="/(onboarding)/connect-music" />;
  return <Redirect href="/(app)/discover" />;
}
