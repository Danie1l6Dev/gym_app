import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS } from '@/constants';
import { useTheme } from '@/hooks/use-theme';

const ROUTINE_PREVIEW = [
  { title: 'Push Day', detail: '4 ejercicios · 45 min' },
  { title: 'Leg Day', detail: '5 ejercicios · 50 min' },
  { title: 'Upper Body', detail: '6 ejercicios · 60 min' },
] as const;

export default function RoutineScreen() {
  const theme = useTheme();

  return (
    <ScreenContainer>
      <AppHeader
        title="Rutinas"
        subtitle="Plantilla visual para administrar rutinas en el futuro."
      />

      <EmptyState
        title="Sin lógica de rutinas todavía"
        description="La arquitectura ya reserva este tab para rutinas, ciclos y progresiones cuando conectemos el backend."
        icon="clipboard-text-outline"
      />

      <View style={styles.previewList}>
        {ROUTINE_PREVIEW.map((routine) => (
          <View
            key={routine.title}
            style={[
              styles.previewCard,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}>
            <TextBlock variant="title">{routine.title}</TextBlock>
            <TextBlock variant="caption" color="muted">
              {routine.detail}
            </TextBlock>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  previewList: {
    marginTop: 16,
    gap: 12,
  },
  previewCard: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 6,
  },
});
