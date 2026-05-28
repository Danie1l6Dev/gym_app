import { Platform } from 'react-native';

export const TYPOGRAPHY = {
  fonts: {
    display: Platform.select({
      web: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      default: 'System',
    }),
    body: Platform.select({
      web: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      default: 'System',
    }),
    mono: Platform.select({
      web: "SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
      default: 'monospace',
    }),
  },
  sizes: {
    xs: 12,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeights: {
    xs: 16,
    sm: 18,
    md: 22,
    lg: 26,
    xl: 30,
    '2xl': 34,
    '3xl': 40,
    '4xl': 44,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
} as const;
