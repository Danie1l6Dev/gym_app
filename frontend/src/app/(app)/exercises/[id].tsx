import { Redirect, useLocalSearchParams } from 'expo-router';

import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/use-auth';
import ExerciseDetailScreen from '@/screens/exercises/ExerciseDetailScreen';

type ExerciseDetailRouteParams = {
  id?: string;
};

export default function ExerciseDetailRoute() {
  const { user } = useAuth();
  const { id } = useLocalSearchParams<ExerciseDetailRouteParams>();

  if (user?.role?.slug === 'admin' && id) {
    return (
      <Redirect
        href={{
          pathname: ROUTES.app.adminCatalogExerciseDetail,
          params: { id },
        } as never}
      />
    );
  }

  return <ExerciseDetailScreen />;
}
