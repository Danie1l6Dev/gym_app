import { StyleSheet, Text, View } from 'react-native';

import { AppHeader, EmptyState, MuscleCard, ScreenContainer } from '@/components/common';
import { colors, spacing, typography } from '@/theme';

const highlights = [
  {
    title: 'Rendimiento',
    subtitle: 'Resumen visual listo para IMC, progreso y objetivos.',
    accentColor: colors.primary,
  },
  {
    title: 'Rutinas',
    subtitle: 'Plantillas y rutinas personalizadas en un solo lugar.',
    accentColor: colors.secondary,
  },
  {
    title: 'Estado',
    subtitle: 'Membresias y alertas de vencimiento futuras.',
    accentColor: colors.accent,
  },
];

export default function HomeScreen() {
  return (
    <ScreenContainer>
      <AppHeader
        title="Inicio"
        subtitle="Panel visual base para el gimnasio, listo para conectar datos reales."
      />

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>GymApp</Text>
        <Text style={styles.heroSubtitle}>
          Un centro de entrenamiento moderno pensado para web y mobile, con una experiencia
          visual limpia, oscura y profesional.
        </Text>
      </View>

      <View style={styles.grid}>
        {highlights.map((item) => (
          <View key={item.title} style={styles.gridItem}>
            <MuscleCard
              title={item.title}
              subtitle={item.subtitle}
              accentColor={item.accentColor}
              exerciseCount="Preview"
            />
          </View>
        ))}
      </View>

      <EmptyState
        title="Backend listo para conectar"
        description="Cuando integres la API, este dashboard mostrará métricas, accesos rápidos y actividad reciente."
        iconName="pulse-outline"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.sm,
    padding: spacing['2xl'],
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  heroTitle: {
    color: colors.text,
    fontSize: typography.fontSizes['3xl'],
    lineHeight: typography.lineHeights['3xl'],
    fontFamily: typography.fontFamily.bold,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: -0.8,
  },
  heroSubtitle: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.md,
    lineHeight: typography.lineHeights.lg,
    fontFamily: typography.fontFamily.regular,
    maxWidth: 640,
  },
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

