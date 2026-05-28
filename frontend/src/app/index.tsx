import { Redirect } from 'expo-router';

import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/use-auth';

export default function Index() {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return <LoadingSpinner label="Preparando sesión" />;
  }

  if (!isAuthenticated) {
    return <Redirect href={ROUTES.auth.login} />;
  }

  return (
    <Redirect
      href={
        (user?.role?.slug === 'admin'
          ? ROUTES.app.adminDashboard
          : ROUTES.app.home) as never
      }
    />
  );
}
