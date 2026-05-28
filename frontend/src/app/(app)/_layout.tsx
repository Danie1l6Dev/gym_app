import { Redirect, Stack } from 'expo-router';

import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/use-auth';

export default function AppLayout() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner label="Cargando app" />;
  }

  if (!isAuthenticated) {
    return <Redirect href={ROUTES.auth.login} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="muscles" options={{ headerShown: false }} />
      <Stack.Screen name="exercises" options={{ headerShown: false }} />
      <Stack.Screen name="exercises/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
