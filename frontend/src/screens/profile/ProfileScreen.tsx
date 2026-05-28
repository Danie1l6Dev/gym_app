import { StyleSheet, Text, View } from 'react-native';

import { AppHeader, ScreenContainer } from '@/components/common';
import { colors, spacing, typography } from '@/theme';

const stats = [
  { label: 'Estado', value: 'Activo' },
  { label: 'Rutinas', value: '4' },
  { label: 'Membresia', value: 'Mensual' },
];

export default function ProfileScreen() {
  return (
    <ScreenContainer>
      <AppHeader
        title="Perfil"
        subtitle="Vista de usuario y base para informacion personal, progreso y ajustes."
      />

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLabel}>G</Text>
        </View>
        <View style={styles.meta}>
          <Text style={styles.name}>Gym Member</Text>
          <Text style={styles.email}>usuario@gymapp.com</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing['2xl'],
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  avatarLabel: {
    color: colors.primary,
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    fontWeight: typography.fontWeights.bold,
  },
  meta: {
    gap: spacing.xs,
  },
  name: {
    color: colors.text,
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    fontWeight: typography.fontWeights.bold,
  },
  email: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.regular,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: 140,
    padding: spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    fontWeight: typography.fontWeights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statValue: {
    color: colors.text,
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    fontWeight: typography.fontWeights.bold,
  },
});

