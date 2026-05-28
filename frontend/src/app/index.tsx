import { Redirect } from 'expo-router';

import { ROUTES } from '@/constants';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/use-auth';

export default function Index() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner label="Preparando sesión" />;
  }

  return <Redirect href={isAuthenticated ? ROUTES.app.home : ROUTES.auth.login} />;
}
