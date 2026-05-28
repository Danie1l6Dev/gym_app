import { DarkTheme, DefaultTheme } from 'expo-router';
import type { ColorSchemeName } from 'react-native';

import { COLORS, type ThemePalette } from './colors';
import { SPACING } from './spacing';
import { TYPOGRAPHY } from './typography';

export type AppTheme = {
  colors: ThemePalette;
  spacing: typeof SPACING;
  typography: typeof TYPOGRAPHY;
  isDark: boolean;
} & ThemePalette;

export type NavigationTheme = typeof DarkTheme;

const darkNavigationTheme: NavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: COLORS.dark.background,
    card: COLORS.dark.surfaceElevated,
    text: COLORS.dark.text,
    border: COLORS.dark.border,
    primary: COLORS.dark.primary,
    notification: COLORS.dark.secondary,
  },
};

const lightNavigationTheme: NavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.light.background,
    card: COLORS.light.surfaceElevated,
    text: COLORS.light.text,
    border: COLORS.light.border,
    primary: COLORS.light.primary,
    notification: COLORS.light.secondary,
  },
};

export const NAVIGATION_THEMES = {
  dark: darkNavigationTheme,
  light: lightNavigationTheme,
} as const;

export function createAppTheme(colorScheme?: ColorSchemeName): AppTheme {
  const isDark = colorScheme !== 'light';
  const palette = isDark ? COLORS.dark : COLORS.light;

  return {
    ...palette,
    colors: palette as ThemePalette,
    spacing: SPACING,
    typography: TYPOGRAPHY,
    isDark,
  };
}

export function createNavigationTheme(colorScheme?: ColorSchemeName): NavigationTheme {
  return colorScheme === 'light' ? NAVIGATION_THEMES.light : NAVIGATION_THEMES.dark;
}

export { COLORS, SPACING, TYPOGRAPHY };
