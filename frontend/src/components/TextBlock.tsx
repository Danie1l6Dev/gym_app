import { StyleSheet, Text, type TextProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { TYPOGRAPHY } from '@/theme';

type TextBlockProps = TextProps & {
  variant?: 'eyebrow' | 'header' | 'title' | 'body' | 'caption' | 'button';
  color?: 'default' | 'muted' | 'subtle' | 'primary';
};

export function TextBlock({ variant = 'body', color = 'default', style, ...props }: TextBlockProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        styles.base,
        variant === 'eyebrow' && styles.eyebrow,
        variant === 'header' && styles.header,
        variant === 'title' && styles.title,
        variant === 'body' && styles.body,
        variant === 'caption' && styles.caption,
        variant === 'button' && styles.button,
        color === 'default' && { color: theme.colors.text },
        color === 'muted' && { color: theme.colors.textMuted },
        color === 'subtle' && { color: theme.colors.textSubtle },
        color === 'primary' && { color: theme.colors.primary },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  header: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fonts.display,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fonts.display,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  button: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
});
