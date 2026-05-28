import { StyleSheet } from 'react-native';

import { AppHeader, EmptyState, ScreenContainer } from '@/components/common';

export default function ExercisesScreen() {
  return (
    <ScreenContainer>
      <AppHeader
        title="Ejercicios"
        subtitle="Base visual preparada para el listado, busqueda y detalle de ejercicios."
      />

      <EmptyState
        title="Sin datos todavia"
        description="Cuando el backend este conectado, aqui se mostrara el listado con filtros por musculo."
        iconName="barbell-outline"
      />
    </ScreenContainer>
  );
}

