import { DarkTheme, type Theme } from '@react-navigation/native';

import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';

export const appTheme = {
  colors,
  spacing,
  typography,
  layout: {
    contentMaxWidth: 1120,
    pagePadding: spacing.lg,
    cardRadius: 24,
    tabBarHeight: 76,
  },
} as const;

export const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
    notification: colors.accent,
  },
};

export * from './colors';
export * from './spacing';
export * from './typography';

