import { Redirect } from 'expo-router';

import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/use-auth';
import MusclesScreen from '@/screens/muscles/MusclesScreen';

export default function MusclesRoute() {
  const { user } = useAuth();

  if (user?.role?.slug === 'admin') {
    return <Redirect href={ROUTES.app.adminMuscles as never} />;
  }

  return <MusclesScreen />;
}
