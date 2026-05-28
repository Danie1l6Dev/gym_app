import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  rightContent?: ReactNode;
};

export default function AppHeader({ title, subtitle, rightContent }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {rightContent ? <View>{rightContent}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  textBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: typography.fontSizes['3xl'],
    lineHeight: typography.lineHeights['3xl'],
    fontFamily: typography.fontFamily.bold,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: -0.6,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.md,
    lineHeight: typography.lineHeights.md,
    fontFamily: typography.fontFamily.regular,
  },
});
