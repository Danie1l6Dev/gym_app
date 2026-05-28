import { StyleSheet, View } from 'react-native';

import { AppHeader, EmptyState, MuscleCard, ScreenContainer } from '@/components/common';
import { colors, spacing } from '@/theme';

const muscles = [
  { title: 'Pecho', subtitle: 'Trabajo de empuje y volumen', count: '12 ejercicios', color: colors.primary },
  { title: 'Espalda', subtitle: 'Tirones y cadena posterior', count: '14 ejercicios', color: colors.secondary },
  { title: 'Piernas', subtitle: 'Fuerza, estabilidad y potencia', count: '18 ejercicios', color: colors.accent },
  { title: 'Hombros', subtitle: 'Movilidad y control vertical', count: '10 ejercicios', color: '#D4A7FF' },
];

export default function MusclesScreen() {
  return (
    <ScreenContainer>
      <AppHeader
        title="Explorar"
        subtitle="Seccion de musculatura preparada para catalogo, filtros y navegación futura."
      />

      <View style={styles.grid}>
        {muscles.map((muscle) => (
          <View key={muscle.title} style={styles.gridItem}>
            <MuscleCard
              title={muscle.title}
              subtitle={muscle.subtitle}
              exerciseCount={muscle.count}
              accentColor={muscle.color}
            />
          </View>
        ))}
      </View>

      <EmptyState
        title="Catalogo en construccion"
        description="Aqui luego conectaremos los musculos y ejercicios del backend con Axios."
        iconName="fitness-outline"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
    rowGap: spacing.md,
  },
  gridItem: {
    width: '100%',
    paddingHorizontal: spacing.sm,
  },
});

