import { Redirect, Stack } from 'expo-router';

import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/use-auth';

export default function AdminLayout() {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return <LoadingSpinner label="Cargando panel admin" />;
  }

  if (!isAuthenticated) {
    return <Redirect href={ROUTES.auth.login} />;
  }

  if (user?.role?.slug !== 'admin') {
    return <Redirect href={ROUTES.app.home} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="users/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="users/new" options={{ headerShown: false }} />
      <Stack.Screen name="muscles" options={{ headerShown: false }} />
      <Stack.Screen name="catalog/exercises" options={{ headerShown: false }} />
      <Stack.Screen name="catalog/exercises/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
