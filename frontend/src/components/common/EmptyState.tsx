import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

type EmptyStateProps = {
  title: string;
  description: string;
  iconName?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export default function EmptyState({
  title,
  description,
  iconName,
  actionLabel,
  onActionPress,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <View style={styles.iconDot} />
        <View style={styles.iconBar} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {iconName ? <Text style={styles.meta}>{iconName}</Text> : null}
      {actionLabel && onActionPress ? (
        <Pressable style={styles.actionButton} onPress={onActionPress}>
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    marginBottom: spacing.xs,
  },
  iconDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    top: 14,
    backgroundColor: colors.primary,
  },
  iconBar: {
    width: 22,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.secondary,
  },
  title: {
    color: colors.text,
    fontSize: typography.fontSizes.xl,
    lineHeight: typography.lineHeights.xl,
    fontFamily: typography.fontFamily.bold,
    fontWeight: typography.fontWeights.bold,
    textAlign: 'center',
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.md,
    lineHeight: typography.lineHeights.md,
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
    maxWidth: 420,
  },
  meta: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    fontWeight: typography.fontWeights.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  actionButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  actionLabel: {
    color: '#08110A',
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
    fontWeight: typography.fontWeights.bold,
  },
});
