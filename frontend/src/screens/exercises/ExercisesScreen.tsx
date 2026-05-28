import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS } from '@/constants';
import { useTheme } from '@/hooks/use-theme';

const EXERCISE_GROUPS = [
  { name: 'Presses', count: '12', detail: 'Empuje superior e inferior' },
  { name: 'Tracciones', count: '16', detail: 'Espalda, bíceps y agarre' },
  { name: 'Aislados', count: '20', detail: 'Detalle y corrección' },
] as const;

export default function ExercisesScreen() {
  const theme = useTheme();

  return (
    <ScreenContainer>
      <AppHeader
        title="Ejercicios"
        subtitle="Plantilla preparada para el catálogo de ejercicios."
        showBack
      />

      <EmptyState
        title="Explorador de ejercicios listo"
        description="La UI ya separa ejercicios por patrones, útil para futuras búsquedas y filtros."
        icon="dumbbell"
      />

      <View style={styles.groups}>
        {EXERCISE_GROUPS.map((group) => (
          <View
            key={group.name}
            style={[
              styles.groupCard,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}>
            <View style={styles.groupHeader}>
              <TextBlock variant="title">{group.name}</TextBlock>
              <TextBlock variant="header" color="primary">
                {group.count}
              </TextBlock>
            </View>
            <TextBlock variant="caption" color="muted">
              {group.detail}
            </TextBlock>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  groups: {
    marginTop: 16,
    gap: 12,
  },
  groupCard: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 8,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
});
