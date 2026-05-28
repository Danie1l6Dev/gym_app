import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { TextBlock } from './TextBlock';

type LoadingSpinnerProps = {
  label?: string;
};

export function LoadingSpinner({ label = 'Cargando' }: LoadingSpinnerProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <TextBlock variant="caption" color="muted" style={styles.label}>
        {label}
      </TextBlock>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    minHeight: 160,
  },
  label: {
    textAlign: 'center',
  },
});
