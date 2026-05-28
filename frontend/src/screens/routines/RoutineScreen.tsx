import { StyleSheet } from 'react-native';

import { AppHeader, EmptyState, ScreenContainer } from '@/components/common';

export default function RoutineScreen() {
  return (
    <ScreenContainer>
      <AppHeader
        title="Rutinas"
        subtitle="Zona preparada para rutinas predefinidas y personalizadas."
      />

      <EmptyState
        title="Rutinas listas para crecer"
        description="Aqui conectaremos el CRUD de rutinas, ejercicios por rutina y guardado local."
        iconName="layers-outline"
      />
    </ScreenContainer>
  );
}

