import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS } from '@/constants';
import { useExercises, useMuscles, useRoutines } from '@/hooks';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const routines = useRoutines();
  const muscles = useMuscles();
  const exercises = useExercises({ perPage: 100 });

  const metrics = [
    {
      label: 'Rutinas',
      value: String(routines.items.length),
      detail: routines.error ?? 'disponibles para tu sesión',
    },
    {
      label: 'Músculos',
      value: String(muscles.items.length),
      detail: muscles.error ?? 'grupos musculares registrados',
    },
    {
      label: 'Ejercicios',
      value: String(exercises.items.length),
      detail: exercises.error ?? 'ejercicios del catálogo local',
    },
  ] as const;

  return (
    <ScreenContainer>
      <AppHeader
        title="Inicio"
        subtitle={`Hola${user?.name ? `, ${user.name}` : ''}. Resumen conectado al backend.`}
      />

      <View style={[styles.heroCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <TextBlock variant="eyebrow" color="primary">
          Resumen diario
        </TextBlock>
        <TextBlock variant="header">Entrena con datos reales del sistema</TextBlock>
        <TextBlock variant="body" color="muted">
          Este panel usa los servicios actuales de rutinas, músculos y ejercicios para mostrar el
          estado disponible en la API.
        </TextBlock>
      </View>

      <View style={styles.metricsGrid}>
        {metrics.map((metric) => (
          <View
            key={metric.label}
            style={[
              styles.metricCard,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}>
            <TextBlock variant="header">{metric.value}</TextBlock>
            <TextBlock variant="caption" color="muted">
              {metric.label}
            </TextBlock>
            <TextBlock variant="caption" color="subtle">
              {metric.detail}
            </TextBlock>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 24,
    gap: 12,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flexGrow: 1,
    flexBasis: 160,
    minWidth: 160,
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 6,
  },
});
