import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { MuscleCard } from '@/components/MuscleCard';
import { ScreenContainer } from '@/components/ScreenContainer';

const MUSCLES = [
  { name: 'Pecho', description: 'Empujes, pressing y estabilidad', accentColor: '#67E8A5' },
  { name: 'Espalda', description: 'Tracción, postura y densidad', accentColor: '#6AA9FF' },
  { name: 'Piernas', description: 'Potencia, volumen y control', accentColor: '#F97316' },
] as const;

export default function MusclesScreen() {
  return (
    <ScreenContainer>
      <AppHeader
        title="Músculos"
        subtitle="Base visual para agrupar músculos y sus ejercicios."
        showBack
      />

      <EmptyState
        title="Catálogo por grupos musculares"
        description="Este espacio queda listo para consumir el backend cuando definamos datos reales."
        icon="arm-flex"
      />

      <View style={styles.list}>
        {MUSCLES.map((muscle) => (
          <MuscleCard
            key={muscle.name}
            name={muscle.name}
            description={muscle.description}
            accentColor={muscle.accentColor}
          />
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    marginTop: 16,
    gap: 12,
  },
});
