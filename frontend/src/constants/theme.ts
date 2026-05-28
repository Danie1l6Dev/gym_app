import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';
import { DIMENSIONS } from './index';

export type ThemeColor = keyof typeof COLORS.dark;

export const Colors = COLORS;
export const Fonts = TYPOGRAPHY.fonts;
export const Spacing = SPACING;
export const BottomTabInset = DIMENSIONS.bottomInset;
export const MaxContentWidth = DIMENSIONS.contentMaxWidth;
