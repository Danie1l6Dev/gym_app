import { Redirect, Stack } from 'expo-router';

import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/use-auth';

export default function AuthLayout() {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return <LoadingSpinner label="Verificando acceso" />;
  }

  if (isAuthenticated) {
    return (
      <Redirect
        href={
          (user?.role?.slug === 'admin' ? ROUTES.app.adminDashboard : ROUTES.app.home) as never
        }
      />
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
