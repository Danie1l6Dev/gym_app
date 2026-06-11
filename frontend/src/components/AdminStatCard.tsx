import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { DIMENSIONS } from '@/constants';
import { useTheme } from '@/hooks/use-theme';
import { TextBlock } from './TextBlock';

type AdminStatCardProps = {
  label: string;
  value: string;
  detail?: string;
  tone?: 'primary' | 'secondary' | 'warning';
  style?: StyleProp<ViewStyle>;
};

export function AdminStatCard({ label, value, detail, tone = 'primary', style }: AdminStatCardProps) {
  const theme = useTheme();
  const toneColor =
    tone === 'primary' ? theme.colors.primary : tone === 'secondary' ? theme.colors.secondary : theme.colors.accent;

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, style]}>
      <View style={[styles.dot, { backgroundColor: toneColor }]} />
      <TextBlock variant="caption" color="muted">
        {label}
      </TextBlock>
      <TextBlock variant="header">{value}</TextBlock>
      {detail ? (
        <TextBlock variant="caption" color="subtle">
          {detail}
        </TextBlock>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 8,
    minHeight: 132,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
});
