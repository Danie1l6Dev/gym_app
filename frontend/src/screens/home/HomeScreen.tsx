import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS } from '@/constants';
import { useTheme } from '@/hooks/use-theme';

const METRICS = [
  { label: 'Rutinas', value: '12', detail: 'listas para usar' },
  { label: 'Músculos', value: '8', detail: 'grupos base' },
  { label: 'Ejercicios', value: '48', detail: 'catálogo inicial' },
] as const;

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <ScreenContainer>
      <AppHeader
        title="Inicio"
        subtitle="Dashboard visual del gimnasio, listo para recibir datos reales."
      />

      <View style={[styles.heroCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <TextBlock variant="eyebrow" color="primary">
          Daily focus
        </TextBlock>
        <TextBlock variant="header">Entrena con una interfaz clara y rápida</TextBlock>
        <TextBlock variant="body" color="muted">
          Este frontend queda preparado para crecer con backend, auth y datos en tiempo real sin
          reestructurar la base visual.
        </TextBlock>
      </View>

      <View style={styles.metricsGrid}>
        {METRICS.map((metric) => (
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
