import { Redirect, useLocalSearchParams } from 'expo-router';

import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/use-auth';
import ExercisesScreen from '@/screens/exercises/ExercisesScreen';

type ExercisesRouteParams = {
  muscleId?: string;
  muscleName?: string;
};

export default function ExercisesRoute() {
  const { user } = useAuth();
  const params = useLocalSearchParams<ExercisesRouteParams>();

  if (user?.role?.slug === 'admin') {
    return (
      <Redirect
        href={{
          pathname: ROUTES.app.adminCatalogExercises,
          params,
        } as never}
      />
    );
  }

  return <ExercisesScreen />;
}
