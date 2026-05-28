import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { DIMENSIONS } from '@/constants';
import { useTheme } from '@/hooks/use-theme';
import { TextBlock } from './TextBlock';

type MuscleCardProps = {
  name: string;
  description?: string;
  accentColor?: string;
  badge?: string;
  onPress?: () => void;
};

function MuscleCardBase({ name, description, accentColor, badge, onPress }: MuscleCardProps) {
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
      <View style={styles.topRow}>
        <View style={[styles.accentBar, { backgroundColor: accentColor ?? theme.colors.primary }]} />
        {badge ? (
          <View style={[styles.badge, { backgroundColor: theme.colors.surfaceElevated }]}>
            <TextBlock variant="caption" color="muted">
              {badge}
            </TextBlock>
          </View>
        ) : null}
      </View>
      <View style={styles.content}>
        <TextBlock variant="title">{name}</TextBlock>
        {description ? (
          <TextBlock variant="body" color="muted">
            {description}
          </TextBlock>
        ) : null}
      </View>
      <View style={styles.footer}>
        <TextBlock variant="caption" color="subtle">
          Ver ejercicios
        </TextBlock>
        <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.textSubtle} />
      </View>
    </Pressable>
  );
}

export const MuscleCard = memo(MuscleCardBase);

const styles = StyleSheet.create({
  card: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    minHeight: 146,
    justifyContent: 'space-between',
  },
  pressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.92,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  accentBar: {
    width: 6,
    height: 36,
    borderRadius: 999,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  content: {
    gap: 6,
    marginTop: 10,
    flex: 1,
  },
  footer: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
});
