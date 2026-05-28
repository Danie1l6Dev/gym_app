import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

type MuscleCardProps = {
  title: string;
  subtitle?: string;
  exerciseCount?: string;
  accentColor?: string;
  onPress?: () => void;
};

export default function MuscleCard({
  title,
  subtitle,
  exerciseCount,
  accentColor = colors.primary,
  onPress,
}: MuscleCardProps) {
  return onPress ? (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed ? styles.cardPressed : null,
      ]}
      onPress={onPress}
    >
      <View style={[styles.accent, { backgroundColor: accentColor }]} />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {exerciseCount ? (
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>{exerciseCount}</Text>
        </View>
      ) : null}
    </Pressable>
  ) : (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: accentColor }]} />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {exerciseCount ? (
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>{exerciseCount}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 120,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
    backgroundColor: colors.surfaceElevated,
  },
  accent: {
    width: 52,
    height: 6,
    borderRadius: 999,
  },
  content: {
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: typography.fontSizes.lg,
    lineHeight: typography.lineHeights.lg,
    fontFamily: typography.fontFamily.bold,
    fontWeight: typography.fontWeights.bold,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.sm,
    lineHeight: typography.lineHeights.sm,
    fontFamily: typography.fontFamily.regular,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
  },
  badgeLabel: {
    color: colors.primary,
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.bold,
    fontWeight: typography.fontWeights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
