import { Pressable, StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { DIMENSIONS } from '@/constants';
import { useTheme } from '@/hooks/use-theme';
import { TextBlock } from './TextBlock';

type MuscleCardProps = {
  name: string;
  description?: string;
  accentColor?: string;
  onPress?: () => void;
};

export function MuscleCard({ name, description, accentColor, onPress }: MuscleCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        pressed && styles.pressed,
      ]}>
      <View style={styles.row}>
        <View style={[styles.accentBar, { backgroundColor: accentColor ?? theme.colors.primary }]} />
        <View style={styles.content}>
          <TextBlock variant="title">{name}</TextBlock>
          {description ? (
            <TextBlock variant="body" color="muted">
              {description}
            </TextBlock>
          ) : null}
        </View>
        <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.textSubtle} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.92,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  accentBar: {
    width: 6,
    height: 52,
    borderRadius: 999,
  },
  content: {
    flex: 1,
    gap: 4,
  },
});
